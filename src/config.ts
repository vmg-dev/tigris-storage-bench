import 'dotenv/config';

import { resolve } from 'node:path';

import { OPERATION_NAMES, type AuthConfig, type BenchmarkOptions, type BucketLocations, type OperationName } from './types.js';

const DEFAULTS: BenchmarkOptions = {
  prefix: 'tigris-bench',
  maxForkDepth: 3,
  objectSizeBytes: 1024,
  iterations: 50,
  warmup: 5,
  concurrency: 1,
  sharedReadCount: 50,
  localReadCount: 50,
  overwriteCount: 50,
  deleteCount: 50,
  listObjectCount: 128,
  keepBuckets: false,
  artifactsRoot: resolve(process.cwd(), 'artifacts'),
  endpoint: process.env.TIGRIS_STORAGE_ENDPOINT,
  location: { type: 'single', values: 'iad' },
  operations: [...OPERATION_NAMES],
};

type ParsedArgs = {
  command: 'benchmark' | 'cleanup' | 'help';
  options: Record<string, string | boolean>;
};

export function printHelp(): void {
  console.log(`Usage:
  npm run benchmark -- [options]
  npm run cleanup -- --manifest artifacts/<run-id>/manifest.json

Benchmark options:
  --prefix <value>              Bucket/report prefix (default: ${DEFAULTS.prefix})
  --max-fork-depth <n>          Number of fork layers to provision (default: ${DEFAULTS.maxForkDepth})
  --object-size-bytes <n>       Payload size for test objects (default: ${DEFAULTS.objectSizeBytes})
  --iterations <n>              Iterations per operation per scenario (default: ${DEFAULTS.iterations})
  --warmup <n>                  Warmup requests per operation per scenario (default: ${DEFAULTS.warmup})
  --concurrency <n>             Parallel requests per operation (default: ${DEFAULTS.concurrency})
  --shared-read-count <n>       Seed count for inherited read fixtures (default: ${DEFAULTS.sharedReadCount})
  --local-read-count <n>        Seed count for per-bucket local reads (default: ${DEFAULTS.localReadCount})
  --overwrite-count <n>         Seed count for overwrite fixtures (default: ${DEFAULTS.overwriteCount})
  --delete-count <n>            Seed count for delete fixtures (default: ${DEFAULTS.deleteCount})
  --list-object-count <n>       Number of objects under the list prefix (default: ${DEFAULTS.listObjectCount})
  --operations <csv>            Comma-separated subset of: ${OPERATION_NAMES.join(', ')}
  --location <region>           Bucket location region or "global" (default: iad)
  --artifacts-root <path>       Directory for manifests and reports (default: ${DEFAULTS.artifactsRoot})
  --endpoint <url>              Override TIGRIS_STORAGE_ENDPOINT
  --keep-buckets                Skip automatic cleanup after the run
  --help                        Print this help
`);
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const first = args[0];

  if (!first || first === '--help' || first === 'help') {
    return { command: 'help', options: {} };
  }

  const command = first === 'cleanup' || first === 'benchmark' ? first : 'help';
  const options: Record<string, string | boolean> = {};

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg?.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return { command, options };
}

function parseInteger(value: string | boolean | undefined, name: string, fallback: number): number {
  if (value === undefined || value === false) {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function parseLocation(value: string | boolean | undefined): BucketLocations {
  if (!value || value === true) {
    return DEFAULTS.location;
  }
  const region = String(value).trim();
  if (region === 'global') {
    return { type: 'global' };
  }
  return { type: 'single', values: region } as BucketLocations;
}

function parseOperations(value: string | boolean | undefined): OperationName[] {
  if (!value || value === true) {
    return [...OPERATION_NAMES];
  }

  const requested = String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    return [...OPERATION_NAMES];
  }

  const invalid = requested.filter((entry) => !OPERATION_NAMES.includes(entry as OperationName));
  if (invalid.length > 0) {
    throw new Error(`Unknown operations: ${invalid.join(', ')}`);
  }

  return requested as OperationName[];
}

export function loadAuthConfig(options: Record<string, string | boolean>): AuthConfig {
  const accessKeyId = process.env.TIGRIS_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing TIGRIS_STORAGE_ACCESS_KEY_ID or TIGRIS_STORAGE_SECRET_ACCESS_KEY in the environment.');
  }

  const endpointOption = options.endpoint;
  return {
    accessKeyId,
    secretAccessKey,
    endpoint: typeof endpointOption === 'string' ? endpointOption : process.env.TIGRIS_STORAGE_ENDPOINT,
  };
}

export function loadBenchmarkOptions(options: Record<string, string | boolean>): BenchmarkOptions {
  return {
    prefix: typeof options.prefix === 'string' ? options.prefix : DEFAULTS.prefix,
    maxForkDepth: parseInteger(options['max-fork-depth'], 'max-fork-depth', DEFAULTS.maxForkDepth),
    objectSizeBytes: parseInteger(options['object-size-bytes'], 'object-size-bytes', DEFAULTS.objectSizeBytes),
    iterations: parseInteger(options.iterations, 'iterations', DEFAULTS.iterations),
    warmup: parseInteger(options.warmup, 'warmup', DEFAULTS.warmup),
    concurrency: Math.max(1, parseInteger(options.concurrency, 'concurrency', DEFAULTS.concurrency)),
    sharedReadCount: parseInteger(options['shared-read-count'], 'shared-read-count', DEFAULTS.sharedReadCount),
    localReadCount: parseInteger(options['local-read-count'], 'local-read-count', DEFAULTS.localReadCount),
    overwriteCount: parseInteger(options['overwrite-count'], 'overwrite-count', DEFAULTS.overwriteCount),
    deleteCount: parseInteger(options['delete-count'], 'delete-count', DEFAULTS.deleteCount),
    listObjectCount: parseInteger(options['list-object-count'], 'list-object-count', DEFAULTS.listObjectCount),
    keepBuckets: Boolean(options['keep-buckets']),
    artifactsRoot: typeof options['artifacts-root'] === 'string' ? resolve(String(options['artifacts-root'])) : DEFAULTS.artifactsRoot,
    endpoint: typeof options.endpoint === 'string' ? options.endpoint : DEFAULTS.endpoint,
    location: parseLocation(options.location),
    operations: parseOperations(options.operations),
  };
}

export function loadCleanupManifestPath(options: Record<string, string | boolean>): string {
  const manifest = options.manifest;
  if (typeof manifest !== 'string' || manifest.length === 0) {
    throw new Error('cleanup requires --manifest <path>');
  }
  return resolve(manifest);
}
