package gobench

import (
	"context"
	"fmt"
)

func rangeKeys(prefix string, count int) []string {
	keys := make([]string, 0, count)
	for index := 0; index < count; index++ {
		keys = append(keys, fmt.Sprintf("%s/obj-%04d.bin", prefix, index))
	}
	return keys
}

func seedKeys(ctx context.Context, clients *Clients, bucket string, keys []string, objectSizeBytes int, seedPrefix string) error {
	for _, key := range keys {
		body := CreatePayload(objectSizeBytes, fmt.Sprintf("%s:%s:%s", seedPrefix, bucket, key))
		if err := clients.PutObject(ctx, bucket, key, body); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionRun(ctx context.Context, clients *Clients, options BenchmarkOptions) (BenchmarkManifest, error) {
	runID := MakeRunID(options.Prefix)
	artifactDir := ResolveArtifactDir(options.ArtifactsRoot, runID)
	if err := EnsureDir(artifactDir); err != nil {
		return BenchmarkManifest{}, err
	}

	mutableFixtureCount := options.Iterations + options.Warmup
	sharedReadKeys := rangeKeys("fixtures/shared/read", max(options.Iterations, options.SharedReadCount))
	localReadKeys := rangeKeys("fixtures/local/read", max(options.Iterations, options.LocalReadCount))
	overwriteKeys := rangeKeys("fixtures/shared/overwrite", max(mutableFixtureCount, options.OverwriteCount))
	deleteKeys := rangeKeys("fixtures/shared/delete", max(mutableFixtureCount, options.DeleteCount))
	listPrefix := "fixtures/shared/list/"
	listKeys := rangeKeys("fixtures/shared/list", options.ListObjectCount)

	fixtures := FixtureManifest{
		SharedReadKeys:  sharedReadKeys,
		LocalReadKeys:   localReadKeys,
		OverwriteKeys:   overwriteKeys,
		DeleteKeys:      deleteKeys,
		ListPrefix:      listPrefix,
		ListObjectCount: options.ListObjectCount,
	}

	scenarios := []BucketScenario{
		{
			ID:              "normal",
			Label:           "normal",
			Kind:            "normal",
			Bucket:          MakeBucketName(options.Prefix, "normal"),
			SnapshotEnabled: false,
			ForkDepth:       0,
		},
		{
			ID:              "snapshot-root",
			Label:           "snapshot-root",
			Kind:            "snapshot-root",
			Bucket:          MakeBucketName(options.Prefix, "snapshot-root"),
			SnapshotEnabled: true,
			ForkDepth:       0,
		},
	}

	cleanupManifest := func() BenchmarkManifest {
		return BenchmarkManifest{
			RunID:       runID,
			CreatedAt:   NowRFC3339(),
			Options:     options,
			Fixtures:    fixtures,
			Scenarios:   scenarios,
			ArtifactDir: artifactDir,
		}
	}

	if err := clients.CreateBucket(ctx, scenarios[0].Bucket, false); err != nil {
		return BenchmarkManifest{}, err
	}
	if err := clients.CreateBucket(ctx, scenarios[1].Bucket, true); err != nil {
		_ = CleanupRun(ctx, clients, cleanupManifest())
		return BenchmarkManifest{}, err
	}

	for _, keySet := range [][]string{sharedReadKeys, overwriteKeys, deleteKeys, listKeys} {
		if err := seedKeys(ctx, clients, scenarios[0].Bucket, keySet, options.ObjectSizeBytes, "normal-seed"); err != nil {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, err
		}
		if err := seedKeys(ctx, clients, scenarios[1].Bucket, keySet, options.ObjectSizeBytes, "snapshot-root-seed"); err != nil {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, err
		}
	}

	parentScenario := scenarios[1]
	for depth := 1; depth <= options.MaxForkDepth; depth++ {
		snapshotVersion, err := clients.CreateSnapshot(ctx, parentScenario.Bucket, fmt.Sprintf("fork-depth-%d", depth))
		if err != nil {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, err
		}

		child := BucketScenario{
			ID:                    fmt.Sprintf("fork-depth-%d", depth),
			Label:                 fmt.Sprintf("fork-depth-%d", depth),
			Kind:                  "fork",
			Bucket:                MakeBucketName(options.Prefix, fmt.Sprintf("fork-%d", depth)),
			SnapshotEnabled:       true,
			ForkDepth:             depth,
			ParentScenarioID:      parentScenario.ID,
			ParentBucket:          parentScenario.Bucket,
			ParentSnapshotVersion: snapshotVersion,
		}

		snapshotEnabled, err := clients.CreateForkBucket(ctx, child.Bucket, parentScenario.Bucket, snapshotVersion)
		if err != nil {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, err
		}
		child.SnapshotEnabled = snapshotEnabled
		if !snapshotEnabled && depth < options.MaxForkDepth {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, fmt.Errorf("fork bucket %s could only be created without snapshot support; depth %d+ requires snapshot-enabled forks", child.Bucket, depth+1)
		}

		scenarios = append(scenarios, child)
		parentScenario = child
	}

	for _, scenario := range scenarios {
		localScenarioKeys := make([]string, 0, len(localReadKeys))
		for _, key := range localReadKeys {
			localScenarioKeys = append(localScenarioKeys, scenarioLocalKey(key, scenario.ID))
		}
		if err := seedKeys(ctx, clients, scenario.Bucket, localScenarioKeys, options.ObjectSizeBytes, "local-seed:"+scenario.ID); err != nil {
			_ = CleanupRun(ctx, clients, cleanupManifest())
			return BenchmarkManifest{}, err
		}
	}

	manifest := BenchmarkManifest{
		RunID:       runID,
		CreatedAt:   NowRFC3339(),
		Options:     options,
		Fixtures:    fixtures,
		Scenarios:   scenarios,
		ArtifactDir: artifactDir,
	}
	if err := WriteJSON(fmt.Sprintf("%s/manifest.json", artifactDir), manifest); err != nil {
		_ = CleanupRun(ctx, clients, manifest)
		return BenchmarkManifest{}, err
	}
	return manifest, nil
}

func CleanupRun(ctx context.Context, clients *Clients, manifest BenchmarkManifest) error {
	scenarios := append([]BucketScenario(nil), manifest.Scenarios...)
	for i := 0; i < len(scenarios); i++ {
		for j := i + 1; j < len(scenarios); j++ {
			if scenarios[j].ForkDepth > scenarios[i].ForkDepth {
				scenarios[i], scenarios[j] = scenarios[j], scenarios[i]
			}
		}
	}
	for _, scenario := range scenarios {
		if err := clients.RemoveBucket(ctx, scenario.Bucket); err != nil {
			return err
		}
	}
	return nil
}
