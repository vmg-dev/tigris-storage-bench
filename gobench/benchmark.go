package gobench

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"
)

type workloadEntry struct {
	Key  string
	Body []byte
}

func scenarioLocalKey(manifestKey, scenarioID string) string {
	return strings.Replace(manifestKey, "/read/", "/read/"+scenarioID+"/", 1)
}

func splitWarmupAndBenchmarkItems(items []workloadEntry, warmupCount, benchmarkCount int) ([]workloadEntry, []workloadEntry) {
	boundedWarmupCount := min(warmupCount, len(items))
	return items[:boundedWarmupCount], items[boundedWarmupCount:min(len(items), boundedWarmupCount+benchmarkCount)]
}

func runWorkers(items []workloadEntry, concurrency int, execute func(workloadEntry) error) ([]float64, float64, error) {
	durations := make([]float64, len(items))
	var next int
	var nextMu sync.Mutex
	var errMu sync.Mutex
	var firstErr error

	startedAt := time.Now()
	workers := min(concurrency, max(1, len(items)))
	var wg sync.WaitGroup
	for workerIndex := 0; workerIndex < workers; workerIndex++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				nextMu.Lock()
				index := next
				next++
				nextMu.Unlock()

				if index >= len(items) {
					return
				}

				itemStartedAt := time.Now()
				if err := execute(items[index]); err != nil {
					errMu.Lock()
					if firstErr == nil {
						firstErr = err
					}
					errMu.Unlock()
					return
				}
				durations[index] = float64(time.Since(itemStartedAt).Microseconds()) / 1000
			}
		}()
	}
	wg.Wait()

	if firstErr != nil {
		return nil, 0, firstErr
	}
	return durations, float64(time.Since(startedAt).Microseconds()) / 1000, nil
}

func summarize(durations []float64, totalWallMS float64) LatencyStats {
	sorted := SortedCopy(durations)
	sum := 0.0
	for _, value := range sorted {
		sum += value
	}
	count := len(sorted)
	mean := 0.0
	if count > 0 {
		mean = sum / float64(count)
	}
	opsPerSecond := 0.0
	if totalWallMS > 0 {
		opsPerSecond = float64(count) / (totalWallMS / 1000)
	}
	minMS := 0.0
	maxMS := 0.0
	if count > 0 {
		minMS = sorted[0]
		maxMS = sorted[count-1]
	}
	return LatencyStats{
		Count:        count,
		MinMS:        minMS,
		MaxMS:        maxMS,
		MeanMS:       mean,
		P50MS:        Percentile(sorted, 0.5),
		P95MS:        Percentile(sorted, 0.95),
		P99MS:        Percentile(sorted, 0.99),
		OpsPerSecond: opsPerSecond,
		TotalWallMS:  totalWallMS,
	}
}

func warmup(items []workloadEntry, count, concurrency int, execute func(workloadEntry) error) error {
	if count <= 0 || len(items) == 0 {
		return nil
	}
	_, _, err := runWorkers(items[:min(count, len(items))], concurrency, execute)
	return err
}

func RunBenchmarks(ctx context.Context, clients *Clients, manifest BenchmarkManifest) (BenchmarkResults, error) {
	results := []OperationResult{}

	for _, operation := range manifest.Options.Operations {
		for _, scenario := range manifest.Scenarios {
			bucket := scenario.Bucket
			var items []workloadEntry
			var warmupItems []workloadEntry
			var benchmarkItems []workloadEntry
			var execute func(workloadEntry) error

			switch operation {
			case HeadShared:
				for _, key := range manifest.Fixtures.SharedReadKeys[:manifest.Options.Iterations] {
					items = append(items, workloadEntry{Key: key})
				}
				execute = func(item workloadEntry) error { return clients.HeadObject(ctx, bucket, item.Key) }
			case GetShared:
				for _, key := range manifest.Fixtures.SharedReadKeys[:manifest.Options.Iterations] {
					items = append(items, workloadEntry{Key: key})
				}
				execute = func(item workloadEntry) error { return clients.GetObject(ctx, bucket, item.Key) }
			case GetLocal:
				for _, key := range manifest.Fixtures.LocalReadKeys[:manifest.Options.Iterations] {
					items = append(items, workloadEntry{Key: scenarioLocalKey(key, scenario.ID)})
				}
				execute = func(item workloadEntry) error { return clients.GetObject(ctx, bucket, item.Key) }
			case ListPrefix:
				for index := 0; index < manifest.Options.Iterations; index++ {
					items = append(items, workloadEntry{Key: manifest.Fixtures.ListPrefix})
				}
				execute = func(item workloadEntry) error { return clients.ListPrefix(ctx, bucket, item.Key) }
			case PutNew:
				for index := 0; index < manifest.Options.Iterations+manifest.Options.Warmup; index++ {
					items = append(items, workloadEntry{
						Key:  fmt.Sprintf("bench/put-new/%s/iter-%04d.bin", scenario.ID, index),
						Body: CreatePayload(manifest.Options.ObjectSizeBytes, fmt.Sprintf("put-new:%s:%d", scenario.ID, index)),
					})
				}
				warmupItems, benchmarkItems = splitWarmupAndBenchmarkItems(items, manifest.Options.Warmup, manifest.Options.Iterations)
				execute = func(item workloadEntry) error { return clients.PutObject(ctx, bucket, item.Key, item.Body) }
			case PutOverwriteSeeded:
				for index, key := range manifest.Fixtures.OverwriteKeys[:manifest.Options.Iterations+manifest.Options.Warmup] {
					items = append(items, workloadEntry{
						Key:  key,
						Body: CreatePayload(manifest.Options.ObjectSizeBytes, fmt.Sprintf("overwrite:%s:%d", scenario.ID, index)),
					})
				}
				warmupItems, benchmarkItems = splitWarmupAndBenchmarkItems(items, manifest.Options.Warmup, manifest.Options.Iterations)
				execute = func(item workloadEntry) error { return clients.PutObject(ctx, bucket, item.Key, item.Body) }
			case RemoveSeeded:
				for _, key := range manifest.Fixtures.DeleteKeys[:manifest.Options.Iterations+manifest.Options.Warmup] {
					items = append(items, workloadEntry{Key: key})
				}
				warmupItems, benchmarkItems = splitWarmupAndBenchmarkItems(items, manifest.Options.Warmup, manifest.Options.Iterations)
				execute = func(item workloadEntry) error { return clients.DeleteObject(ctx, bucket, item.Key) }
			default:
				return BenchmarkResults{}, fmt.Errorf("unknown operation: %s", operation)
			}

			if err := warmup(selectItems(warmupItems, items), manifest.Options.Warmup, manifest.Options.Concurrency, execute); err != nil {
				return BenchmarkResults{}, err
			}

			durations, totalWallMS, err := runWorkers(selectItems(benchmarkItems, items), manifest.Options.Concurrency, execute)
			if err != nil {
				return BenchmarkResults{}, err
			}

			stats := summarize(durations, totalWallMS)
			results = append(results, OperationResult{
				Operation:  operation,
				ScenarioID: scenario.ID,
				Bucket:     bucket,
				Stats:      stats,
			})

			fmt.Printf("%-22s %-16s p50=%.2fms p95=%.2fms ops/s=%.2f\n", operation, scenario.ID, stats.P50MS, stats.P95MS, stats.OpsPerSecond)
		}
	}

	return BenchmarkResults{
		RunID:     manifest.RunID,
		CreatedAt: NowRFC3339(),
		Results:   results,
	}, nil
}

func selectItems(preferred, fallback []workloadEntry) []workloadEntry {
	if len(preferred) > 0 {
		return preferred
	}
	return fallback
}
