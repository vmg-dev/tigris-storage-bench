import type { BucketLocations } from '@tigrisdata/storage';

import { createBucketOrThrow, removeBucketOrThrow } from './tigris.js';
import { ensureDir, makeBucketName, makeRunId, resolveArtifactDir, writeJson } from './util.js';
import type { PlacementAuthConfig, PlacementBenchmarkManifest, PlacementBenchmarkOptions, PlacementScenario } from './placement-types.js';

function placementId(locations: BucketLocations): string {
  return `${locations.type}-${locations.values}`;
}

export async function provisionPlacementRun(
  auth: PlacementAuthConfig,
  options: PlacementBenchmarkOptions,
): Promise<PlacementBenchmarkManifest> {
  const runId = makeRunId(options.prefix);
  const artifactDir = resolveArtifactDir(options.artifactsRoot, runId);
  await ensureDir(artifactDir);

  const scenarios: PlacementScenario[] = [
    {
      id: placementId({ type: 'single', values: options.singleRegion }),
      label: `single/${options.singleRegion}`,
      bucket: makeBucketName(options.prefix, `single-${options.singleRegion}`),
      locations: { type: 'single', values: options.singleRegion },
    },
    {
      id: placementId({ type: 'multi', values: options.multiRegion }),
      label: `multi/${options.multiRegion}`,
      bucket: makeBucketName(options.prefix, `multi-${options.multiRegion}`),
      locations: { type: 'multi', values: options.multiRegion },
    },
  ];

  try {
    for (const scenario of scenarios) {
      await createBucketOrThrow(scenario.bucket, auth, { locations: scenario.locations });
    }

    const manifest: PlacementBenchmarkManifest = {
      runId,
      createdAt: new Date().toISOString(),
      options,
      scenarios,
      artifactDir,
    };

    await writeJson(`${artifactDir}/manifest.json`, manifest);
    return manifest;
  } catch (error) {
    await cleanupPlacementRun(auth, {
      runId,
      createdAt: new Date().toISOString(),
      options,
      scenarios,
      artifactDir,
    });
    throw error;
  }
}

export async function cleanupPlacementRun(auth: PlacementAuthConfig, manifest: PlacementBenchmarkManifest): Promise<void> {
  for (const scenario of manifest.scenarios) {
    try {
      await removeBucketOrThrow(scenario.bucket, auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Cleanup warning for ${scenario.bucket}: ${message}`);
    }
  }
}
