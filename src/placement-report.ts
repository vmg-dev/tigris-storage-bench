import type {
  PlacementBenchmarkManifest,
  PlacementBenchmarkResults,
  PlacementOperationName,
  PlacementOperationResult,
  PlacementOperationRun,
} from './placement-types.js';

function formatMs(value: number): string {
  return value.toFixed(2);
}

function formatRatio(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return '-';
  }
  return `${value.toFixed(2)}x`;
}

function groupByOperation(results: PlacementBenchmarkResults['results']): Map<PlacementOperationName, PlacementOperationResult[]> {
  const grouped = new Map<PlacementOperationName, PlacementOperationResult[]>();

  for (const result of results) {
    const current = grouped.get(result.operation) ?? [];
    current.push(result);
    grouped.set(result.operation, current);
  }

  return grouped;
}

export function renderPlacementSummary(
  manifest: PlacementBenchmarkManifest,
  benchmarkResults: PlacementBenchmarkResults,
  operationRuns: PlacementOperationRun[] = [],
): string {
  const lines: string[] = [];

  lines.push('# Tigris placement benchmark summary');
  lines.push('');
  lines.push(`Run ID: \`${manifest.runId}\``);
  lines.push(`Created: ${benchmarkResults.createdAt}`);
  lines.push(`Placements: \`single/${manifest.options.singleRegion}\`, \`multi/${manifest.options.multiRegion}\``);
  lines.push(`Object sizes: ${manifest.options.objectSizesBytes.map((value) => `\`${value}\``).join(', ')} bytes`);
  lines.push(`Concurrencies: ${manifest.options.concurrencies.map((value) => `\`${value}\``).join(', ')}`);
  lines.push(`Iterations: ${manifest.options.iterations}`);
  lines.push(`Warmup: ${manifest.options.warmup}`);
  lines.push(`List objects per case: ${manifest.options.listObjectCount}`);
  lines.push('');
  lines.push('Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.');
  lines.push('');
  lines.push('Scenario map:');
  for (const scenario of manifest.scenarios) {
    lines.push(`- ${scenario.id}: ${scenario.label}, bucket=\`${scenario.bucket}\``);
  }
  lines.push('');

  if (operationRuns.length > 0) {
    lines.push('Per-operation runs:');
    for (const operationRun of operationRuns) {
      lines.push(`- ${operationRun.operation}: run=\`${operationRun.runId}\`, artifacts=\`${operationRun.artifactDir}\``);
    }
    lines.push('');
  }

  const grouped = groupByOperation(benchmarkResults.results);

  for (const [operation, operationResults] of grouped.entries()) {
    const sizeValues = [...new Set(operationResults.map((result) => result.objectSizeBytes))].sort((left, right) => left - right);
    lines.push(`## ${operation}`);
    lines.push('');

    for (const objectSizeBytes of sizeValues) {
      const sizeResults = operationResults.filter((result) => result.objectSizeBytes === objectSizeBytes);
      const concurrencyValues = [...new Set(sizeResults.map((result) => result.concurrency))].sort((left, right) => left - right);

      lines.push(`### ${objectSizeBytes} bytes`);
      lines.push('');
      lines.push('| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |');
      lines.push('| ---: | ---: | ---: | ---: | ---: | ---: | ---: |');

      for (const concurrency of concurrencyValues) {
        const single = sizeResults.find((result) => result.concurrency === concurrency && result.scenarioId.startsWith('single-'));
        const multi = sizeResults.find((result) => result.concurrency === concurrency && result.scenarioId.startsWith('multi-'));
        const p50Ratio = single && multi ? multi.stats.p50Ms / single.stats.p50Ms : 0;
        const throughputRatio = single && multi ? multi.stats.opsPerSecond / single.stats.opsPerSecond : 0;

        lines.push(
          `| ${concurrency} | ${single ? formatMs(single.stats.p50Ms) : '-'} | ${multi ? formatMs(multi.stats.p50Ms) : '-'} | ${formatRatio(
            p50Ratio,
          )} | ${single ? single.stats.opsPerSecond.toFixed(2) : '-'} | ${multi ? multi.stats.opsPerSecond.toFixed(2) : '-'} | ${formatRatio(
            throughputRatio,
          )} |`,
        );
      }

      lines.push('');
      lines.push('| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |');
      lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');

      const detailed = [...sizeResults].sort((left, right) => {
        return left.concurrency - right.concurrency || left.scenarioId.localeCompare(right.scenarioId);
      });

      for (const result of detailed) {
        lines.push(
          `| ${result.scenarioId} | ${result.concurrency} | ${formatMs(result.stats.p95Ms)} | ${formatMs(result.stats.p99Ms)} | ${formatMs(
            result.stats.meanMs,
          )} | ${formatMs(result.stats.totalWallMs)} |`,
        );
      }

      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}
