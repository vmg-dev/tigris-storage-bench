import { createPayload, ensureDir, makeBucketName, makeRunId, resolveArtifactDir, writeJson } from './util.js';
import { createBucketOrThrow, createForkBucketOrThrow, createSnapshotOrThrow, putObjectOrThrow, removeBucketOrThrow } from './tigris.js';
import type { AuthConfig, BenchmarkManifest, BenchmarkOptions, BucketScenario, FixtureManifest } from './types.js';

function rangeKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}/obj-${String(index).padStart(4, '0')}.bin`);
}

async function seedKeys(bucket: string, keys: string[], options: { auth: AuthConfig; objectSizeBytes: number; seedPrefix: string }): Promise<void> {
  for (const key of keys) {
    const body = createPayload(options.objectSizeBytes, `${options.seedPrefix}:${bucket}:${key}`);
    await putObjectOrThrow(bucket, key, body, options.auth, true);
  }
}

export async function provisionRun(auth: AuthConfig, options: BenchmarkOptions): Promise<BenchmarkManifest> {
  const runId = makeRunId(options.prefix);
  const artifactDir = resolveArtifactDir(options.artifactsRoot, runId);
  await ensureDir(artifactDir);
  const mutableFixtureCount = options.iterations + options.warmup;

  const sharedReadKeys = rangeKeys('fixtures/shared/read', Math.max(options.iterations, options.sharedReadCount));
  const localReadKeys = rangeKeys('fixtures/local/read', Math.max(options.iterations, options.localReadCount));
  const overwriteKeys = rangeKeys('fixtures/shared/overwrite', Math.max(mutableFixtureCount, options.overwriteCount));
  const deleteKeys = rangeKeys('fixtures/shared/delete', Math.max(mutableFixtureCount, options.deleteCount));
  const listPrefix = 'fixtures/shared/list/';
  const listKeys = rangeKeys(listPrefix.replace(/\/$/, ''), options.listObjectCount);

  const fixtures: FixtureManifest = {
    sharedReadKeys,
    localReadKeys,
    overwriteKeys,
    deleteKeys,
    listPrefix,
    listObjectCount: options.listObjectCount,
  };

  const scenarios: BucketScenario[] = [];
  const normalScenario: BucketScenario = {
    id: 'normal',
    label: 'normal',
    kind: 'normal',
    bucket: makeBucketName(options.prefix, 'normal'),
    snapshotEnabled: false,
    forkDepth: 0,
  };
  scenarios.push(normalScenario);

  const snapshotRootScenario: BucketScenario = {
    id: 'snapshot-root',
    label: 'snapshot-root',
    kind: 'snapshot-root',
    bucket: makeBucketName(options.prefix, 'snapshot-root'),
    snapshotEnabled: true,
    forkDepth: 0,
  };
  scenarios.push(snapshotRootScenario);

  try {
    await createBucketOrThrow(normalScenario.bucket, auth, { enableSnapshot: false });
    await createBucketOrThrow(snapshotRootScenario.bucket, auth, { enableSnapshot: true });

    for (const keySet of [sharedReadKeys, overwriteKeys, deleteKeys, listKeys]) {
      await seedKeys(normalScenario.bucket, keySet, {
        auth,
        objectSizeBytes: options.objectSizeBytes,
        seedPrefix: 'normal-seed',
      });
      await seedKeys(snapshotRootScenario.bucket, keySet, {
        auth,
        objectSizeBytes: options.objectSizeBytes,
        seedPrefix: 'snapshot-root-seed',
      });
    }

    let parentScenario = snapshotRootScenario;
    for (let depth = 1; depth <= options.maxForkDepth; depth += 1) {
      const snapshotVersion = await createSnapshotOrThrow(parentScenario.bucket, auth, `fork-depth-${depth}`);
      const childScenario: BucketScenario = {
        id: `fork-depth-${depth}`,
        label: `fork-depth-${depth}`,
        kind: 'fork',
        bucket: makeBucketName(options.prefix, `fork-${depth}`),
        snapshotEnabled: true,
        forkDepth: depth,
        parentScenarioId: parentScenario.id,
        parentBucket: parentScenario.bucket,
        parentSnapshotVersion: snapshotVersion,
      };

      const forkSnapshotEnabled = await createForkBucketOrThrow(childScenario.bucket, parentScenario.bucket, snapshotVersion, auth);
      childScenario.snapshotEnabled = forkSnapshotEnabled;
      if (!forkSnapshotEnabled && depth < options.maxForkDepth) {
        throw new Error(
          `Fork bucket ${childScenario.bucket} could only be created without snapshot support. Depth ${depth + 1}+ requires snapshot-enabled fork buckets, so this run cannot continue.`,
        );
      }
      scenarios.push(childScenario);
      parentScenario = childScenario;
    }

    for (const scenario of scenarios) {
      const scenarioLocalKeys = localReadKeys.map((key) => key.replace('/read/', `/read/${scenario.id}/`));
      await seedKeys(scenario.bucket, scenarioLocalKeys, {
        auth,
        objectSizeBytes: options.objectSizeBytes,
        seedPrefix: `local-seed:${scenario.id}`,
      });
    }

    const manifest: BenchmarkManifest = {
      runId,
      createdAt: new Date().toISOString(),
      options,
      fixtures,
      scenarios,
      artifactDir,
    };

    await writeJson(`${artifactDir}/manifest.json`, manifest);
    return manifest;
  } catch (error) {
    await cleanupRun(auth, {
      runId,
      createdAt: new Date().toISOString(),
      options,
      fixtures,
      scenarios,
      artifactDir,
    });
    throw error;
  }
}

export async function cleanupRun(auth: AuthConfig, manifest: BenchmarkManifest): Promise<void> {
  const scenarios = [...manifest.scenarios].sort((left, right) => right.forkDepth - left.forkDepth);

  for (const scenario of scenarios) {
    try {
      await removeBucketOrThrow(scenario.bucket, auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Cleanup warning for ${scenario.bucket}: ${message}`);
    }
  }
}
