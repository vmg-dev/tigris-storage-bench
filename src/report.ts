import type { BenchmarkManifest, BenchmarkResults, OperationName, OperationRun } from './types.js';

function formatMs(value: number): string {
  return value.toFixed(2);
}

function formatRatio(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return '-';
  }
  return `${value.toFixed(2)}x`;
}

function groupByOperation(results: BenchmarkResults['results']): Map<OperationName, BenchmarkResults['results']> {
  const grouped = new Map<OperationName, BenchmarkResults['results']>();

  for (const result of results) {
    const current = grouped.get(result.operation) ?? [];
    current.push(result);
    grouped.set(result.operation, current);
  }

  return grouped;
}

export function renderSummary(
  manifest: BenchmarkManifest,
  benchmarkResults: BenchmarkResults,
  operationRuns: OperationRun[] = [],
): string {
  const lines: string[] = [];

  lines.push(`# Tigris benchmark summary`);
  lines.push('');
  lines.push(`Run ID: \`${manifest.runId}\``);
  lines.push(`Created: ${benchmarkResults.createdAt}`);
  lines.push(`Region placement: \`single\` / \`iad\``);
  lines.push(`Object size: ${manifest.options.objectSizeBytes} bytes`);
  lines.push(`Iterations: ${manifest.options.iterations}`);
  lines.push(`Warmup: ${manifest.options.warmup}`);
  lines.push(`Concurrency: ${manifest.options.concurrency}`);
  lines.push('');
  lines.push('Isolation: each operation is provisioned and benchmarked against a fresh bucket set. Bucket creation, snapshot creation, and fork creation are not included in measured latency.');
  lines.push('');
  lines.push('Scenario map:');
  for (const scenario of manifest.scenarios) {
    const parent = scenario.parentScenarioId ? `, parent=${scenario.parentScenarioId}` : '';
    lines.push(`- ${scenario.id}: snapshotEnabled=${scenario.snapshotEnabled}, forkDepth=${scenario.forkDepth}${parent}`);
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

  for (const [operation, results] of grouped.entries()) {
    const sorted = [...results].sort((left, right) => {
      const scenarioLeft = manifest.scenarios.find((scenario) => scenario.id === left.scenarioId);
      const scenarioRight = manifest.scenarios.find((scenario) => scenario.id === right.scenarioId);
      return (scenarioLeft?.forkDepth ?? 0) - (scenarioRight?.forkDepth ?? 0) || left.scenarioId.localeCompare(right.scenarioId);
    });
    const normal = sorted.find((result) => result.scenarioId === 'normal');

    lines.push(`## ${operation}`);
    lines.push('');
    lines.push('| Scenario | p50 ms | p95 ms | p99 ms | mean ms | ops/s | p50 vs normal |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');

    for (const result of sorted) {
      const ratio = normal ? result.stats.p50Ms / normal.stats.p50Ms : 0;
      lines.push(
        `| ${result.scenarioId} | ${formatMs(result.stats.p50Ms)} | ${formatMs(result.stats.p95Ms)} | ${formatMs(
          result.stats.p99Ms,
        )} | ${formatMs(result.stats.meanMs)} | ${result.stats.opsPerSecond.toFixed(2)} | ${formatRatio(ratio)} |`,
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
