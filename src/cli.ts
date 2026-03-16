import { readFile } from 'node:fs/promises';

import { loadAuthConfig, loadBenchmarkOptions, loadCleanupManifestPath, parseArgs, printHelp } from './config.js';
import { runBenchmarks } from './benchmark.js';
import { cleanupRun, provisionRun } from './provision.js';
import { renderSummary } from './report.js';
import { ensureDir, makeRunId, resolveArtifactDir, writeJson, writeText } from './util.js';
import type { BenchmarkManifest, BenchmarkResults, OperationRun } from './types.js';

async function runBenchmarkCommand(options: Record<string, string | boolean>): Promise<void> {
  const auth = loadAuthConfig(options);
  const benchmarkOptions = loadBenchmarkOptions(options);
  const suiteRunId = makeRunId(benchmarkOptions.prefix);
  const suiteArtifactDir = resolveArtifactDir(benchmarkOptions.artifactsRoot, suiteRunId);
  await ensureDir(suiteArtifactDir);

  const aggregateResults: BenchmarkResults = {
    runId: suiteRunId,
    createdAt: new Date().toISOString(),
    results: [],
  };
  const operationRuns: OperationRun[] = [];
  let scenarioTemplate: BenchmarkManifest | undefined;

  for (const operation of benchmarkOptions.operations) {
    const isolatedOptions = {
      ...benchmarkOptions,
      prefix: `${benchmarkOptions.prefix}-${operation}`,
      operations: [operation],
      artifactsRoot: suiteArtifactDir,
    };
    const manifest = await provisionRun(auth, isolatedOptions);

    if (!scenarioTemplate) {
      scenarioTemplate = manifest;
    }

    console.log(`Provisioned isolated run ${manifest.runId} for ${operation}`);

    try {
      const benchmarkResults = await runBenchmarks(auth, manifest);
      await ensureDir(manifest.artifactDir);
      await writeJson(`${manifest.artifactDir}/results.json`, benchmarkResults);
      await writeText(`${manifest.artifactDir}/summary.md`, renderSummary(manifest, benchmarkResults));

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
        await cleanupRun(auth, manifest);
        console.log(`Buckets cleaned up for ${operation}.`);
      } else {
        console.log(`Buckets retained for ${operation} because --keep-buckets was set.`);
      }
    } catch (error) {
      if (!benchmarkOptions.keepBuckets) {
        await cleanupRun(auth, manifest);
      }
      throw error;
    }
  }

  if (!scenarioTemplate) {
    throw new Error('No operations were selected.');
  }

  const suiteManifest: BenchmarkManifest = {
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
  await writeText(`${suiteArtifactDir}/summary.md`, renderSummary(suiteManifest, aggregateResults, operationRuns));

  console.log(`Summary: ${suiteArtifactDir}/summary.md`);
  console.log(`Results: ${suiteArtifactDir}/results.json`);
}

async function runCleanupCommand(options: Record<string, string | boolean>): Promise<void> {
  const auth = loadAuthConfig(options);
  const manifestPath = loadCleanupManifestPath(options);
  const content = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(content) as BenchmarkManifest;
  await cleanupRun(auth, manifest);
  console.log(`Cleaned up buckets from ${manifestPath}`);
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  if (parsed.command === 'help' || parsed.options.help) {
    printHelp();
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

  printHelp();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
