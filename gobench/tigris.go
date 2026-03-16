package gobench

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	smithyMiddleware "github.com/aws/smithy-go/middleware"
	smithyhttp "github.com/aws/smithy-go/transport/http"
	storage "github.com/tigrisdata/storage-go"
	"github.com/tigrisdata/storage-go/simplestorage"
	"github.com/tigrisdata/storage-go/tigrisheaders"
)

type Clients struct {
	Raw    *storage.Client
	Object *simplestorage.Client
	Auth   AuthConfig
}

func NewClients(ctx context.Context, auth AuthConfig) (*Clients, error) {
	rawOptions := []storage.Option{
		storage.WithRegion("auto"),
		storage.WithAccessKeypair(auth.AccessKeyID, auth.SecretAccessKey),
	}
	simpleOptions := []simplestorage.Option{
		simplestorage.WithBucket("bootstrap-unused"),
		simplestorage.WithRegion("auto"),
		simplestorage.WithAccessKeypair(auth.AccessKeyID, auth.SecretAccessKey),
	}
	if auth.Endpoint != "" {
		rawOptions = append(rawOptions, storage.WithEndpoint(auth.Endpoint))
		simpleOptions = append(simpleOptions, simplestorage.WithEndpoint(auth.Endpoint))
	}

	rawClient, err := storage.New(ctx, rawOptions...)
	if err != nil {
		return nil, err
	}
	objectClient, err := simplestorage.New(ctx, simpleOptions...)
	if err != nil {
		return nil, err
	}

	return &Clients{
		Raw:    rawClient,
		Object: objectClient,
		Auth:   auth,
	}, nil
}

func iadRegion() func(*s3.Options) {
	return tigrisheaders.WithStaticReplicationRegions([]tigrisheaders.Region{tigrisheaders.IAD})
}

func (c *Clients) CreateBucket(ctx context.Context, bucket string, enableSnapshot bool) error {
	input := &s3.CreateBucketInput{Bucket: aws.String(bucket)}
	options := []func(*s3.Options){iadRegion()}
	var err error
	if enableSnapshot {
		_, err = c.Raw.CreateSnapshotEnabledBucket(ctx, input, options...)
	} else {
		_, err = c.Raw.CreateBucket(ctx, input, options...)
	}
	if err != nil {
		return fmt.Errorf("failed to create bucket %s: %w", bucket, err)
	}
	return nil
}

func (c *Clients) CreateSnapshot(ctx context.Context, bucket, name string) (string, error) {
	var rawResponse *smithyhttp.Response
	captureResponse := func(stack *smithyMiddleware.Stack) error {
		return stack.Deserialize.Add(
			smithyMiddleware.DeserializeMiddlewareFunc(
				"captureSnapshotResponse",
				func(ctx context.Context, in smithyMiddleware.DeserializeInput, next smithyMiddleware.DeserializeHandler) (smithyMiddleware.DeserializeOutput, smithyMiddleware.Metadata, error) {
					out, metadata, err := next.HandleDeserialize(ctx, in)
					if response, ok := out.RawResponse.(*smithyhttp.Response); ok {
						rawResponse = response
					}
					return out, metadata, err
				},
			),
			smithyMiddleware.After,
		)
	}

	output, err := c.Raw.CreateBucketSnapshot(ctx, name, &s3.CreateBucketInput{
		Bucket: aws.String(bucket),
	}, func(options *s3.Options) {
		options.APIOptions = append(options.APIOptions, captureResponse)
	})
	if err != nil {
		return "", fmt.Errorf("failed to create snapshot for %s: %w", bucket, err)
	}

	if output == nil || rawResponse == nil {
		return "", fmt.Errorf("snapshot created for %s but raw response metadata was unavailable", bucket)
	}

	snapshotVersion := rawResponse.Header.Get("X-Tigris-Snapshot-Version")
	if snapshotVersion == "" {
		xHeaders := []string{}
		for key, values := range rawResponse.Header {
			if strings.HasPrefix(strings.ToLower(key), "x-tigris") {
				xHeaders = append(xHeaders, fmt.Sprintf("%s=%s", key, strings.Join(values, ",")))
			}
		}
		return "", fmt.Errorf("snapshot created for %s but X-Tigris-Snapshot-Version header was missing (%s)", bucket, strings.Join(xHeaders, "; "))
	}

	return snapshotVersion, nil
}

func (c *Clients) CreateForkBucket(ctx context.Context, bucket, parentBucket, parentSnapshotVersion string) (bool, error) {
	input := &s3.CreateBucketInput{Bucket: aws.String(bucket)}
	preferredOptions := []func(*s3.Options){
		iadRegion(),
		tigrisheaders.WithEnableSnapshot(),
		tigrisheaders.WithForkSourceBucket(parentBucket),
		tigrisheaders.WithHeader("X-Tigris-Fork-Source-Bucket-Snapshot", parentSnapshotVersion),
	}
	if _, err := c.Raw.CreateBucket(ctx, input, preferredOptions...); err == nil {
		return true, nil
	}

	fallbackOptions := []func(*s3.Options){
		iadRegion(),
		tigrisheaders.WithForkSourceBucket(parentBucket),
		tigrisheaders.WithHeader("X-Tigris-Fork-Source-Bucket-Snapshot", parentSnapshotVersion),
	}
	if _, err := c.Raw.CreateBucket(ctx, input, fallbackOptions...); err != nil {
		return false, fmt.Errorf("failed to create fork bucket %s from %s@%s: %w", bucket, parentBucket, parentSnapshotVersion, err)
	}
	return false, nil
}

func (c *Clients) PutObject(ctx context.Context, bucket, key string, body []byte) error {
	_, err := c.Object.For(bucket).Put(ctx, &simplestorage.Object{
		Key:         key,
		ContentType: "application/octet-stream",
		Size:        int64(len(body)),
		Body:        io.NopCloser(bytes.NewReader(body)),
	})
	if err != nil {
		return err
	}
	return nil
}

func (c *Clients) GetObject(ctx context.Context, bucket, key string) error {
	object, err := c.Object.For(bucket).Get(ctx, key)
	if err != nil {
		return err
	}
	defer object.Body.Close()
	_, err = io.Copy(io.Discard, object.Body)
	return err
}

func (c *Clients) HeadObject(ctx context.Context, bucket, key string) error {
	_, err := c.Object.For(bucket).Head(ctx, key)
	return err
}

func (c *Clients) ListPrefix(ctx context.Context, bucket, prefix string) error {
	_, err := c.Object.For(bucket).List(ctx, simplestorage.WithPrefix(prefix))
	return err
}

func (c *Clients) DeleteObject(ctx context.Context, bucket, key string) error {
	return c.Object.For(bucket).Delete(ctx, key)
}

func (c *Clients) RemoveBucket(ctx context.Context, bucket string) error {
	_, err := c.Raw.DeleteBucket(ctx, &s3.DeleteBucketInput{
		Bucket: aws.String(bucket),
	}, tigrisheaders.WithHeader("Tigris-Force-Delete", "true"))
	if err != nil {
		return fmt.Errorf("failed to remove bucket %s: %w", bucket, err)
	}
	return nil
}
