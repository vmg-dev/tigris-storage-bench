import type { BucketLocations } from '@tigrisdata/storage';

export const DEFAULT_SINGLE_REGION = 'iad';
export const DEFAULT_MULTI_REGION = 'usa';

export type SingleRegionCode = Extract<BucketLocations, { type: 'single' }>['values'];
export type MultiRegionCode = Extract<BucketLocations, { type: 'multi' }>['values'];

export const PLACEMENT_OPERATION_NAMES = ['head', 'get', 'list-prefix', 'put-new', 'remove', 'put-same-object'] as const;

export type PlacementOperationName = (typeof PLACEMENT_OPERATION_NAMES)[number];

export type PlacementBenchmarkOptions = {
  prefix: string;
  objectSizesBytes: number[];
  concurrencies: number[];
  iterations: number;
  warmup: number;
  listObjectCount: number;
  keepBuckets: boolean;
  artifactsRoot: string;
  endpoint?: string;
  operations: PlacementOperationName[];
  singleRegion: SingleRegionCode;
  multiRegion: MultiRegionCode;
};

export type PlacementAuthConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
};

export type PlacementScenario = {
  id: string;
  label: string;
  bucket: string;
  locations: BucketLocations;
};

export type PlacementBenchmarkManifest = {
  runId: string;
  createdAt: string;
  options: PlacementBenchmarkOptions;
  scenarios: PlacementScenario[];
  artifactDir: string;
};

export type PlacementOperationRun = {
  operation: PlacementOperationName;
  runId: string;
  artifactDir: string;
  manifestPath: string;
  resultsPath: string;
  summaryPath: string;
};

export type PlacementLatencyStats = {
  count: number;
  minMs: number;
  maxMs: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  opsPerSecond: number;
  totalWallMs: number;
};

export type PlacementOperationResult = {
  operation: PlacementOperationName;
  scenarioId: string;
  bucket: string;
  objectSizeBytes: number;
  concurrency: number;
  stats: PlacementLatencyStats;
};

export type PlacementBenchmarkResults = {
  runId: string;
  createdAt: string;
  results: PlacementOperationResult[];
};
