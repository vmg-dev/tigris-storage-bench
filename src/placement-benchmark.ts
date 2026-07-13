import { getObjectOrThrow, headObjectOrThrow, listPrefixOrThrow, putObjectOrThrow, removeObjectOrThrow } from './tigris.js';
import { createPayload, percentile } from './util.js';
import type {
  PlacementAuthConfig,
  PlacementBenchmarkManifest,
  PlacementBenchmarkResults,
  PlacementLatencyStats,
  PlacementOperationName,
  PlacementOperationResult,
} from './placement-types.js';

type WorkloadEntry = {
  key: string;
  body?: Buffer;
};

function rangeKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}/obj-${String(index).padStart(4, '0')}.bin`);
}

async function seedKeys(bucket: string, keys: string[], auth: PlacementAuthConfig, objectSizeBytes: number, seedPrefix: string): Promise<void> {
  for (const key of keys) {
    const body = createPayload(objectSizeBytes, `${seedPrefix}:${bucket}:${key}`);
    await putObjectOrThrow(bucket, key, body, auth, true);
  }
}

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

function summarize(durationsMs: number[], totalWallMs: number): PlacementLatencyStats {
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

async function warmup(items: WorkloadEntry[], count: number, concurrency: number, fn: (item: WorkloadEntry) => Promise<void>): Promise<void> {
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

async function prepareCase(
  operation: PlacementOperationName,
  bucket: string,
  auth: PlacementAuthConfig,
  objectSizeBytes: number,
  iterations: number,
  warmupCount: number,
  listObjectCount: number,
  casePrefix: string,
): Promise<{ warmupItems: WorkloadEntry[]; benchmarkItems: WorkloadEntry[]; execute: (item: WorkloadEntry) => Promise<void> }> {
  switch (operation) {
    case 'head': {
      const keys = rangeKeys(`${casePrefix}/head`, iterations + warmupCount);
      await seedKeys(bucket, keys, auth, objectSizeBytes, 'head-seed');
      const items = keys.map((key) => ({ key }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => headObjectOrThrow(bucket, item.key, auth),
      };
    }
    case 'get': {
      const keys = rangeKeys(`${casePrefix}/get`, iterations + warmupCount);
      await seedKeys(bucket, keys, auth, objectSizeBytes, 'get-seed');
      const items = keys.map((key) => ({ key }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => getObjectOrThrow(bucket, item.key, auth),
      };
    }
    case 'list-prefix': {
      const listPrefix = `${casePrefix}/list`;
      const keys = rangeKeys(listPrefix, listObjectCount);
      await seedKeys(bucket, keys, auth, objectSizeBytes, 'list-seed');
      const items = Array.from({ length: iterations + warmupCount }, () => ({ key: `${listPrefix}/` }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => listPrefixOrThrow(bucket, item.key, auth),
      };
    }
    case 'put-new': {
      const items = Array.from({ length: iterations + warmupCount }, (_, index) => ({
        key: `${casePrefix}/put-new/iter-${String(index).padStart(4, '0')}.bin`,
        body: createPayload(objectSizeBytes, `put-new:${casePrefix}:${index}`),
      }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => putObjectOrThrow(bucket, item.key, item.body!, auth, true),
      };
    }
    case 'remove': {
      const keys = rangeKeys(`${casePrefix}/remove`, iterations + warmupCount);
      await seedKeys(bucket, keys, auth, objectSizeBytes, 'remove-seed');
      const items = keys.map((key) => ({ key }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => removeObjectOrThrow(bucket, item.key, auth),
      };
    }
    case 'put-same-object': {
      const key = `${casePrefix}/put-same-object/hot.bin`;
      await putObjectOrThrow(bucket, key, createPayload(objectSizeBytes, `put-same-object:init:${casePrefix}`), auth, true);
      const items = Array.from({ length: iterations + warmupCount }, (_, index) => ({
        key,
        body: createPayload(objectSizeBytes, `put-same-object:${casePrefix}:${index}`),
      }));
      return {
        ...splitWarmupAndBenchmarkItems(items, warmupCount, iterations),
        execute: async (item) => putObjectOrThrow(bucket, item.key, item.body!, auth, true),
      };
    }
  }
}

export async function runPlacementBenchmarks(
  auth: PlacementAuthConfig,
  manifest: PlacementBenchmarkManifest,
): Promise<PlacementBenchmarkResults> {
  const results: PlacementOperationResult[] = [];

  for (const operation of manifest.options.operations) {
    for (const objectSizeBytes of manifest.options.objectSizesBytes) {
      for (const concurrency of manifest.options.concurrencies) {
        for (const scenario of manifest.scenarios) {
          const casePrefix = `bench/${operation}/size-${objectSizeBytes}/conc-${concurrency}/${scenario.id}`;
          const { warmupItems, benchmarkItems, execute } = await prepareCase(
            operation,
            scenario.bucket,
            auth,
            objectSizeBytes,
            manifest.options.iterations,
            manifest.options.warmup,
            manifest.options.listObjectCount,
            casePrefix,
          );

          await warmup(warmupItems, manifest.options.warmup, concurrency, execute);
          const { durationsMs, totalWallMs } = await runWorkers(benchmarkItems, concurrency, async (item) => {
            await execute(item);
          });

          const stats = summarize(durationsMs, totalWallMs);
          results.push({
            operation,
            scenarioId: scenario.id,
            bucket: scenario.bucket,
            objectSizeBytes,
            concurrency,
            stats,
          });

          console.log(
            `${operation.padEnd(18)} ${scenario.id.padEnd(12)} size=${String(objectSizeBytes).padEnd(6)} conc=${String(concurrency).padEnd(
              3,
            )} p50=${stats.p50Ms.toFixed(2)}ms p95=${stats.p95Ms.toFixed(2)}ms ops/s=${stats.opsPerSecond.toFixed(2)}`,
          );
        }
      }
    }
  }

  return {
    runId: manifest.runId,
    createdAt: new Date().toISOString(),
    results,
  };
}
