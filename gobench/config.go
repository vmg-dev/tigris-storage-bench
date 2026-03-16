package gobench

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func PrintHelp() {
	fmt.Printf(`Usage:
  go run ./cmd/tigris-storage-bench-go benchmark [options]
  go run ./cmd/tigris-storage-bench-go cleanup --suite artifacts-go/<run-id>/suite.json

Benchmark options:
  --prefix <value>              Bucket/report prefix (default: tigris-bench-go)
  --max-fork-depth <n>          Number of fork layers to provision (default: 3)
  --object-size-bytes <n>       Payload size for test objects (default: 1024)
  --iterations <n>              Iterations per operation per scenario (default: 50)
  --warmup <n>                  Warmup requests per operation per scenario (default: 5)
  --concurrency <n>             Parallel requests per operation (default: 1)
  --shared-read-count <n>       Seed count for inherited read fixtures (default: 50)
  --local-read-count <n>        Seed count for per-bucket local reads (default: 50)
  --overwrite-count <n>         Seed count for overwrite fixtures (default: 50)
  --delete-count <n>            Seed count for delete fixtures (default: 50)
  --list-object-count <n>       Number of objects under the list prefix (default: 128)
  --operations <csv>            Comma-separated subset of: %s
  --artifacts-root <path>       Directory for manifests and reports (default: ./artifacts-go)
  --endpoint <url>              Override TIGRIS_STORAGE_ENDPOINT
  --keep-buckets                Skip automatic cleanup after the run
  --help                        Print this help
`, strings.Join(operationNameStrings(), ", "))
}

func operationNameStrings() []string {
	values := make([]string, 0, len(OperationNames))
	for _, name := range OperationNames {
		values = append(values, string(name))
	}
	return values
}

func defaultBenchmarkOptions() BenchmarkOptions {
	return BenchmarkOptions{
		Prefix:          "tigris-bench-go",
		MaxForkDepth:    3,
		ObjectSizeBytes: 1024,
		Iterations:      50,
		Warmup:          5,
		Concurrency:     1,
		SharedReadCount: 50,
		LocalReadCount:  50,
		OverwriteCount:  50,
		DeleteCount:     50,
		ListObjectCount: 128,
		KeepBuckets:     false,
		ArtifactsRoot:   filepath.Join(".", "artifacts-go"),
		Endpoint:        os.Getenv("TIGRIS_STORAGE_ENDPOINT"),
		Operations:      append([]OperationName(nil), OperationNames...),
	}
}

func ParseBenchmarkArgs(args []string) (BenchmarkOptions, error) {
	defaults := defaultBenchmarkOptions()
	fs := flag.NewFlagSet("benchmark", flag.ContinueOnError)
	fs.SetOutput(os.Stdout)

	prefix := fs.String("prefix", defaults.Prefix, "")
	maxForkDepth := fs.Int("max-fork-depth", defaults.MaxForkDepth, "")
	objectSizeBytes := fs.Int("object-size-bytes", defaults.ObjectSizeBytes, "")
	iterations := fs.Int("iterations", defaults.Iterations, "")
	warmup := fs.Int("warmup", defaults.Warmup, "")
	concurrency := fs.Int("concurrency", defaults.Concurrency, "")
	sharedReadCount := fs.Int("shared-read-count", defaults.SharedReadCount, "")
	localReadCount := fs.Int("local-read-count", defaults.LocalReadCount, "")
	overwriteCount := fs.Int("overwrite-count", defaults.OverwriteCount, "")
	deleteCount := fs.Int("delete-count", defaults.DeleteCount, "")
	listObjectCount := fs.Int("list-object-count", defaults.ListObjectCount, "")
	operations := fs.String("operations", strings.Join(operationNameStrings(), ","), "")
	artifactsRoot := fs.String("artifacts-root", defaults.ArtifactsRoot, "")
	endpoint := fs.String("endpoint", defaults.Endpoint, "")
	keepBuckets := fs.Bool("keep-buckets", defaults.KeepBuckets, "")
	help := fs.Bool("help", false, "")

	if err := fs.Parse(args); err != nil {
		return BenchmarkOptions{}, err
	}
	if *help {
		PrintHelp()
		return BenchmarkOptions{}, flag.ErrHelp
	}

	parsedOps, err := parseOperations(*operations)
	if err != nil {
		return BenchmarkOptions{}, err
	}

	return BenchmarkOptions{
		Prefix:          *prefix,
		MaxForkDepth:    *maxForkDepth,
		ObjectSizeBytes: *objectSizeBytes,
		Iterations:      *iterations,
		Warmup:          *warmup,
		Concurrency:     max(1, *concurrency),
		SharedReadCount: *sharedReadCount,
		LocalReadCount:  *localReadCount,
		OverwriteCount:  *overwriteCount,
		DeleteCount:     *deleteCount,
		ListObjectCount: *listObjectCount,
		KeepBuckets:     *keepBuckets,
		ArtifactsRoot:   *artifactsRoot,
		Endpoint:        *endpoint,
		Operations:      parsedOps,
	}, nil
}

func ParseCleanupArgs(args []string) (string, error) {
	fs := flag.NewFlagSet("cleanup", flag.ContinueOnError)
	fs.SetOutput(os.Stdout)
	suite := fs.String("suite", "", "")
	help := fs.Bool("help", false, "")
	if err := fs.Parse(args); err != nil {
		return "", err
	}
	if *help {
		PrintHelp()
		return "", flag.ErrHelp
	}
	if *suite == "" {
		return "", errors.New("cleanup requires --suite <path>")
	}
	return filepath.Clean(*suite), nil
}

func parseOperations(value string) ([]OperationName, error) {
	if strings.TrimSpace(value) == "" {
		return append([]OperationName(nil), OperationNames...), nil
	}
	parts := strings.Split(value, ",")
	result := make([]OperationName, 0, len(parts))
	valid := map[string]OperationName{}
	for _, op := range OperationNames {
		valid[string(op)] = op
	}
	for _, part := range parts {
		part = strings.TrimSpace(part)
		op, ok := valid[part]
		if !ok {
			return nil, fmt.Errorf("unknown operation: %s", part)
		}
		result = append(result, op)
	}
	return result, nil
}

func LoadAuthConfig(endpointOverride string) (AuthConfig, error) {
	accessKeyID := strings.TrimSpace(os.Getenv("TIGRIS_STORAGE_ACCESS_KEY_ID"))
	secretAccessKey := strings.TrimSpace(os.Getenv("TIGRIS_STORAGE_SECRET_ACCESS_KEY"))
	endpoint := strings.TrimSpace(os.Getenv("TIGRIS_STORAGE_ENDPOINT"))
	if endpointOverride != "" {
		endpoint = endpointOverride
	}
	if accessKeyID == "" || secretAccessKey == "" {
		return AuthConfig{}, errors.New("missing TIGRIS_STORAGE_ACCESS_KEY_ID or TIGRIS_STORAGE_SECRET_ACCESS_KEY in environment")
	}
	return AuthConfig{
		AccessKeyID:     accessKeyID,
		SecretAccessKey: secretAccessKey,
		Endpoint:        endpoint,
	}, nil
}

func LoadDotEnv(path string) {
	content, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, rawLine := range strings.Split(string(content), "\n") {
		line := strings.TrimSpace(rawLine)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		value = strings.Trim(value, `"'`)
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); !exists {
			_ = os.Setenv(key, value)
		}
	}
}
