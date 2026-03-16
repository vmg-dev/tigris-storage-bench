package gobench

import (
	"fmt"
	"sort"
	"strings"
)

func RenderSummary(manifest BenchmarkManifest, benchmarkResults BenchmarkResults, operationRuns []OperationRun, implementation string) string {
	lines := []string{
		"# Tigris benchmark summary",
		"",
		fmt.Sprintf("Run ID: `%s`", manifest.RunID),
		fmt.Sprintf("Created: %s", benchmarkResults.CreatedAt),
		"Region placement: `single` / `iad`",
		fmt.Sprintf("Object size: %d bytes", manifest.Options.ObjectSizeBytes),
		fmt.Sprintf("Iterations: %d", manifest.Options.Iterations),
		fmt.Sprintf("Warmup: %d", manifest.Options.Warmup),
		fmt.Sprintf("Concurrency: %d", manifest.Options.Concurrency),
		fmt.Sprintf("Implementation: `%s`", implementation),
		"",
		"Isolation: each operation is provisioned and benchmarked against a fresh bucket set. Bucket creation, snapshot creation, and fork creation are not included in measured latency.",
		"",
		"Scenario map:",
	}

	for _, scenario := range manifest.Scenarios {
		parent := ""
		if scenario.ParentScenarioID != "" {
			parent = fmt.Sprintf(", parent=%s", scenario.ParentScenarioID)
		}
		lines = append(lines, fmt.Sprintf("- %s: snapshotEnabled=%t, forkDepth=%d%s", scenario.ID, scenario.SnapshotEnabled, scenario.ForkDepth, parent))
	}
	lines = append(lines, "")

	if len(operationRuns) > 0 {
		lines = append(lines, "Per-operation runs:")
		for _, run := range operationRuns {
			lines = append(lines, fmt.Sprintf("- %s: run=`%s`, artifacts=`%s`", run.Operation, run.RunID, run.ArtifactDir))
		}
		lines = append(lines, "")
	}

	grouped := map[OperationName][]OperationResult{}
	for _, result := range benchmarkResults.Results {
		grouped[result.Operation] = append(grouped[result.Operation], result)
	}

	scenarioDepth := map[string]int{}
	for _, scenario := range manifest.Scenarios {
		scenarioDepth[scenario.ID] = scenario.ForkDepth
	}

	for _, operation := range OperationNames {
		results := grouped[operation]
		if len(results) == 0 {
			continue
		}
		sort.Slice(results, func(i, j int) bool {
			leftDepth := scenarioDepth[results[i].ScenarioID]
			rightDepth := scenarioDepth[results[j].ScenarioID]
			if leftDepth != rightDepth {
				return leftDepth < rightDepth
			}
			return results[i].ScenarioID < results[j].ScenarioID
		})

		var normal *OperationResult
		for idx := range results {
			if results[idx].ScenarioID == "normal" {
				normal = &results[idx]
				break
			}
		}

		lines = append(lines,
			fmt.Sprintf("## %s", operation),
			"",
			"| Scenario | p50 ms | p95 ms | p99 ms | mean ms | ops/s | p50 vs normal |",
			"| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
		)

		for _, result := range results {
			ratio := "-"
			if normal != nil && normal.Stats.P50MS > 0 {
				ratio = fmt.Sprintf("%.2fx", result.Stats.P50MS/normal.Stats.P50MS)
			}
			lines = append(lines, fmt.Sprintf(
				"| %s | %.2f | %.2f | %.2f | %.2f | %.2f | %s |",
				result.ScenarioID,
				result.Stats.P50MS,
				result.Stats.P95MS,
				result.Stats.P99MS,
				result.Stats.MeanMS,
				result.Stats.OpsPerSecond,
				ratio,
			))
		}
		lines = append(lines, "")
	}

	return strings.Join(lines, "\n") + "\n"
}
