import { readFile } from 'node:fs/promises';

import {
  loadPlacementAuthConfig,
  loadPlacementBenchmarkOptions,
  loadPlacementCleanupManifestPath,
  parsePlacementArgs,
  printPlacementHelp,
} from './placement-config.js';
import { runPlacementBenchmarks } from './placement-benchmark.js';
import { cleanupPlacementRun, provisionPlacementRun } from './placement-provision.js';
import { renderPlacementSummary } from './placement-report.js';
import { ensureDir, makeRunId, resolveArtifactDir, writeJson, writeText } from './util.js';
import type { PlacementBenchmarkManifest, PlacementBenchmarkResults, PlacementOperationRun } from './placement-types.js';

async function runBenchmarkCommand(options: Record<string, string | boolean>): Promise<void> {
  const auth = loadPlacementAuthConfig(options);
  const benchmarkOptions = loadPlacementBenchmarkOptions(options);
  const suiteRunId = makeRunId(benchmarkOptions.prefix);
  const suiteArtifactDir = resolveArtifactDir(benchmarkOptions.artifactsRoot, suiteRunId);
  await ensureDir(suiteArtifactDir);

  const aggregateResults: PlacementBenchmarkResults = {
    runId: suiteRunId,
    createdAt: new Date().toISOString(),
    results: [],
  };
  const operationRuns: PlacementOperationRun[] = [];
  let scenarioTemplate: PlacementBenchmarkManifest | undefined;

  for (const operation of benchmarkOptions.operations) {
    const isolatedOptions = {
      ...benchmarkOptions,
      prefix: `${benchmarkOptions.prefix}-${operation}`,
      operations: [operation],
      artifactsRoot: suiteArtifactDir,
    };
    const manifest = await provisionPlacementRun(auth, isolatedOptions);

    if (!scenarioTemplate) {
      scenarioTemplate = manifest;
    }

    console.log(`Provisioned isolated run ${manifest.runId} for ${operation}`);

    try {
      const benchmarkResults = await runPlacementBenchmarks(auth, manifest);
      await ensureDir(manifest.artifactDir);
      await writeJson(`${manifest.artifactDir}/results.json`, benchmarkResults);
      await writeText(`${manifest.artifactDir}/summary.md`, renderPlacementSummary(manifest, benchmarkResults));

      aggregateResults.results.push(...benchmarkResults.results);
      operationRuns.push({
        operation,
        runId: manifest.runId,
        artifactDir: manifest.artifactDir,
        manifestPath: `${manifest.artifactDir}/manifest.json`,
        resultsPath: `${manifest.artifactDir}/results.json`,
        summaryPath: `${manifest.artifactDir}/summary.md`,
      });

      if (!benchmarkOptions.keepBuckets) {
        await cleanupPlacementRun(auth, manifest);
        console.log(`Buckets cleaned up for ${operation}.`);
      } else {
        console.log(`Buckets retained for ${operation} because --keep-buckets was set.`);
      }
    } catch (error) {
      if (!benchmarkOptions.keepBuckets) {
        await cleanupPlacementRun(auth, manifest);
      }
      throw error;
    }
  }

  if (!scenarioTemplate) {
    throw new Error('No operations were selected.');
  }

  const suiteManifest: PlacementBenchmarkManifest = {
    ...scenarioTemplate,
    runId: suiteRunId,
    createdAt: new Date().toISOString(),
    options: benchmarkOptions,
    artifactDir: suiteArtifactDir,
  };

  await writeJson(`${suiteArtifactDir}/suite.json`, {
    runId: suiteRunId,
    createdAt: suiteManifest.createdAt,
    options: benchmarkOptions,
    operationRuns,
  });
  await writeJson(`${suiteArtifactDir}/results.json`, aggregateResults);
  await writeText(`${suiteArtifactDir}/summary.md`, renderPlacementSummary(suiteManifest, aggregateResults, operationRuns));

  console.log(`Summary: ${suiteArtifactDir}/summary.md`);
  console.log(`Results: ${suiteArtifactDir}/results.json`);
}

async function runCleanupCommand(options: Record<string, string | boolean>): Promise<void> {
  const auth = loadPlacementAuthConfig(options);
  const manifestPath = loadPlacementCleanupManifestPath(options);
  const content = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(content) as PlacementBenchmarkManifest;
  await cleanupPlacementRun(auth, manifest);
  console.log(`Cleaned up buckets from ${manifestPath}`);
}

async function main(): Promise<void> {
  const parsed = parsePlacementArgs(process.argv);

  if (parsed.command === 'help' || parsed.options.help) {
    printPlacementHelp();
    return;
  }

  if (parsed.command === 'benchmark') {
    await runBenchmarkCommand(parsed.options);
    return;
  }

  if (parsed.command === 'cleanup') {
    await runCleanupCommand(parsed.options);
    return;
  }

  printPlacementHelp();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
