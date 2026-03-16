import { getObjectOrThrow, headObjectOrThrow, listPrefixOrThrow, putObjectOrThrow, removeObjectOrThrow } from './tigris.js';
import { createPayload, percentile } from './util.js';
import type {
  AuthConfig,
  BenchmarkManifest,
  BenchmarkResults,
  LatencyStats,
  OperationName,
  OperationResult,
} from './types.js';

type WorkloadEntry = {
  key?: string;
  body?: Buffer;
};

async function runWorkers<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<{ durationsMs: number[]; totalWallMs: number }> {
  const durationsMs = new Array<number>(items.length);
  let cursor = 0;
  const startedAt = performance.now();

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }

      const item = items[index];
      const itemStartedAt = performance.now();
      await fn(item, index);
      durationsMs[index] = performance.now() - itemStartedAt;
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, () => worker()));

  return {
    durationsMs,
    totalWallMs: performance.now() - startedAt,
  };
}

function summarize(durationsMs: number[], totalWallMs: number): LatencyStats {
  const sorted = [...durationsMs].sort((left, right) => left - right);
  const count = sorted.length;
  const sum = sorted.reduce((accumulator, value) => accumulator + value, 0);

  return {
    count,
    minMs: sorted[0] ?? 0,
    maxMs: sorted.at(-1) ?? 0,
    meanMs: count === 0 ? 0 : sum / count,
    p50Ms: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    p99Ms: percentile(sorted, 0.99),
    opsPerSecond: totalWallMs === 0 ? 0 : count / (totalWallMs / 1000),
    totalWallMs,
  };
}

function scenarioLocalKey(manifestKey: string, scenarioId: string): string {
  return manifestKey.replace('/read/', `/read/${scenarioId}/`);
}

async function warmup(
  items: WorkloadEntry[],
  count: number,
  concurrency: number,
  fn: (item: WorkloadEntry) => Promise<void>,
): Promise<void> {
  if (count <= 0 || items.length === 0) {
    return;
  }

  const warmupItems = items.slice(0, Math.min(count, items.length));
  await runWorkers(warmupItems, concurrency, async (item) => {
    await fn(item);
  });
}

function splitWarmupAndBenchmarkItems(items: WorkloadEntry[], warmupCount: number, benchmarkCount: number): {
  warmupItems: WorkloadEntry[];
  benchmarkItems: WorkloadEntry[];
} {
  const boundedWarmupCount = Math.min(warmupCount, items.length);
  return {
    warmupItems: items.slice(0, boundedWarmupCount),
    benchmarkItems: items.slice(boundedWarmupCount, boundedWarmupCount + benchmarkCount),
  };
}

export async function runBenchmarks(auth: AuthConfig, manifest: BenchmarkManifest): Promise<BenchmarkResults> {
  const results: OperationResult[] = [];

  for (const operation of manifest.options.operations) {
    for (const scenario of manifest.scenarios) {
      const bucket = scenario.bucket;
      let items: WorkloadEntry[] = [];
      let warmupItems: WorkloadEntry[] | undefined;
      let benchmarkItems: WorkloadEntry[] | undefined;
      let execute: (item: WorkloadEntry) => Promise<void>;

      switch (operation) {
        case 'head-shared':
          items = manifest.fixtures.sharedReadKeys.slice(0, manifest.options.iterations).map((key) => ({ key }));
          execute = async (item) => headObjectOrThrow(bucket, item.key!, auth);
          break;
        case 'get-shared':
          items = manifest.fixtures.sharedReadKeys.slice(0, manifest.options.iterations).map((key) => ({ key }));
          execute = async (item) => getObjectOrThrow(bucket, item.key!, auth);
          break;
        case 'get-local':
          items = manifest.fixtures.localReadKeys
            .slice(0, manifest.options.iterations)
            .map((key) => ({ key: scenarioLocalKey(key, scenario.id) }));
          execute = async (item) => getObjectOrThrow(bucket, item.key!, auth);
          break;
        case 'list-prefix':
          items = Array.from({ length: manifest.options.iterations }, () => ({ key: manifest.fixtures.listPrefix }));
          execute = async (item) => listPrefixOrThrow(bucket, item.key!, auth);
          break;
        case 'put-new':
          items = Array.from({ length: manifest.options.iterations }, (_, index) => ({
            key: `bench/put-new/${scenario.id}/iter-${String(index).padStart(4, '0')}.bin`,
            body: createPayload(manifest.options.objectSizeBytes, `put-new:${scenario.id}:${index}`),
          }));
          execute = async (item) => putObjectOrThrow(bucket, item.key!, item.body!, auth, true);
          break;
        case 'put-overwrite-seeded':
          items = manifest.fixtures.overwriteKeys.slice(0, manifest.options.iterations + manifest.options.warmup).map((key, index) => ({
            key,
            body: createPayload(manifest.options.objectSizeBytes, `overwrite:${scenario.id}:${index}`),
          }));
          ({ warmupItems, benchmarkItems } = splitWarmupAndBenchmarkItems(items, manifest.options.warmup, manifest.options.iterations));
          execute = async (item) => putObjectOrThrow(bucket, item.key!, item.body!, auth, true);
          break;
        case 'remove-seeded':
          items = manifest.fixtures.deleteKeys.slice(0, manifest.options.iterations + manifest.options.warmup).map((key) => ({ key }));
          ({ warmupItems, benchmarkItems } = splitWarmupAndBenchmarkItems(items, manifest.options.warmup, manifest.options.iterations));
          execute = async (item) => removeObjectOrThrow(bucket, item.key!, auth);
          break;
      }

      await warmup(warmupItems ?? items, manifest.options.warmup, manifest.options.concurrency, execute);
      const { durationsMs, totalWallMs } = await runWorkers(benchmarkItems ?? items, manifest.options.concurrency, async (item) => {
        await execute(item);
      });

      results.push({
        operation,
        scenarioId: scenario.id,
        bucket,
        stats: summarize(durationsMs, totalWallMs),
      });

      console.log(
        `${operation.padEnd(22)} ${scenario.id.padEnd(16)} p50=${results.at(-1)?.stats.p50Ms.toFixed(2)}ms p95=${results
          .at(-1)
          ?.stats.p95Ms.toFixed(2)}ms ops/s=${results.at(-1)?.stats.opsPerSecond.toFixed(2)}`,
      );
    }
  }

  return {
    runId: manifest.runId,
    createdAt: new Date().toISOString(),
    results,
  };
}
