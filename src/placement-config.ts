import 'dotenv/config';

import { resolve } from 'node:path';

import {
  DEFAULT_MULTI_REGION,
  DEFAULT_SINGLE_REGION,
  PLACEMENT_OPERATION_NAMES,
  type MultiRegionCode,
  type PlacementAuthConfig,
  type PlacementBenchmarkOptions,
  type PlacementOperationName,
  type SingleRegionCode,
} from './placement-types.js';

const SINGLE_REGION_CODES: SingleRegionCode[] = ['ams', 'fra', 'gru', 'iad', 'jnb', 'lhr', 'nrt', 'ord', 'sin', 'sjc', 'syd'];
const MULTI_REGION_CODES: MultiRegionCode[] = ['usa', 'eur'];

const DEFAULTS: PlacementBenchmarkOptions = {
  prefix: 'tigris-placement-bench',
  objectSizesBytes: [1024, 10 * 1024, 100 * 1024],
  concurrencies: [1, 4, 8, 16, 32],
  iterations: 20,
  warmup: 5,
  listObjectCount: 128,
  keepBuckets: false,
  artifactsRoot: resolve(process.cwd(), 'artifacts-placement'),
  endpoint: process.env.TIGRIS_STORAGE_ENDPOINT,
  operations: [...PLACEMENT_OPERATION_NAMES],
  singleRegion: DEFAULT_SINGLE_REGION,
  multiRegion: DEFAULT_MULTI_REGION,
};

type ParsedArgs = {
  command: 'benchmark' | 'cleanup' | 'help';
  options: Record<string, string | boolean>;
};

function parseInteger(value: string, name: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function parseCsvIntegers(value: string | boolean | undefined, name: string, fallback: number[]): number[] {
  if (value === undefined || value === false) {
    return [...fallback];
  }

  const parsed = String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => parseInteger(entry, name));

  if (parsed.length === 0) {
    throw new Error(`${name} cannot be empty`);
  }

  return [...new Set(parsed)].sort((left, right) => left - right);
}

function parseOperations(value: string | boolean | undefined): PlacementOperationName[] {
  if (!value || value === true) {
    return [...PLACEMENT_OPERATION_NAMES];
  }

  const requested = String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    return [...PLACEMENT_OPERATION_NAMES];
  }

  const invalid = requested.filter((entry) => !PLACEMENT_OPERATION_NAMES.includes(entry as PlacementOperationName));
  if (invalid.length > 0) {
    throw new Error(`Unknown operations: ${invalid.join(', ')}`);
  }

  return requested as PlacementOperationName[];
}

export function printPlacementHelp(): void {
  console.log(`Usage:
  npm run benchmark:placement -- [options]
  npm run cleanup:placement -- --manifest artifacts-placement/<run-id>/manifest.json

Placement benchmark options:
  --prefix <value>              Bucket/report prefix (default: ${DEFAULTS.prefix})
  --object-sizes <csv>          Object sizes in bytes (default: ${DEFAULTS.objectSizesBytes.join(',')})
  --concurrencies <csv>         Request parallelism sweep (default: ${DEFAULTS.concurrencies.join(',')})
  --iterations <n>              Measured operations per case (default: ${DEFAULTS.iterations})
  --warmup <n>                  Warmup operations per case (default: ${DEFAULTS.warmup})
  --list-object-count <n>       Number of objects under each list prefix (default: ${DEFAULTS.listObjectCount})
  --operations <csv>            Comma-separated subset of: ${PLACEMENT_OPERATION_NAMES.join(', ')}
  --single-region <value>       Single-region location code (default: ${DEFAULTS.singleRegion})
  --multi-region <value>        Multi-region geo code (default: ${DEFAULTS.multiRegion})
  --artifacts-root <path>       Directory for manifests and reports (default: ${DEFAULTS.artifactsRoot})
  --endpoint <url>              Override TIGRIS_STORAGE_ENDPOINT
  --keep-buckets                Skip automatic cleanup after the run
  --help                        Print this help
`);
}

export function parsePlacementArgs(argv: string[]): ParsedArgs {
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

export function loadPlacementAuthConfig(options: Record<string, string | boolean>): PlacementAuthConfig {
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

export function loadPlacementBenchmarkOptions(options: Record<string, string | boolean>): PlacementBenchmarkOptions {
  const singleRegion =
    typeof options['single-region'] === 'string' ? (String(options['single-region']).trim() as SingleRegionCode) : DEFAULTS.singleRegion;
  const multiRegion =
    typeof options['multi-region'] === 'string' ? (String(options['multi-region']).trim() as MultiRegionCode) : DEFAULTS.multiRegion;

  if (!SINGLE_REGION_CODES.includes(singleRegion)) {
    throw new Error(`Invalid single-region: ${singleRegion}`);
  }

  if (!MULTI_REGION_CODES.includes(multiRegion)) {
    throw new Error(`Invalid multi-region: ${multiRegion}`);
  }

  return {
    prefix: typeof options.prefix === 'string' ? options.prefix : DEFAULTS.prefix,
    objectSizesBytes: parseCsvIntegers(options['object-sizes'], 'object-sizes', DEFAULTS.objectSizesBytes),
    concurrencies: parseCsvIntegers(options.concurrencies, 'concurrencies', DEFAULTS.concurrencies),
    iterations: typeof options.iterations === 'string' ? parseInteger(options.iterations, 'iterations') : DEFAULTS.iterations,
    warmup: typeof options.warmup === 'string' ? parseInteger(options.warmup, 'warmup') : DEFAULTS.warmup,
    listObjectCount:
      typeof options['list-object-count'] === 'string'
        ? parseInteger(options['list-object-count'], 'list-object-count')
        : DEFAULTS.listObjectCount,
    keepBuckets: Boolean(options['keep-buckets']),
    artifactsRoot: typeof options['artifacts-root'] === 'string' ? resolve(String(options['artifacts-root'])) : DEFAULTS.artifactsRoot,
    endpoint: typeof options.endpoint === 'string' ? options.endpoint : DEFAULTS.endpoint,
    operations: parseOperations(options.operations),
    singleRegion,
    multiRegion,
  };
}

export function loadPlacementCleanupManifestPath(options: Record<string, string | boolean>): string {
  const manifest = options.manifest;
  if (typeof manifest !== 'string' || manifest.length === 0) {
    throw new Error('cleanup requires --manifest <path>');
  }
  return resolve(manifest);
}
