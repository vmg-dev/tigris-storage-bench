export const LOCATION = {
  type: 'single',
  values: 'iad',
} as const;

export const OPERATION_NAMES = [
  'head-shared',
  'get-shared',
  'get-local',
  'list-prefix',
  'put-new',
  'put-overwrite-seeded',
  'remove-seeded',
] as const;

export type OperationName = (typeof OPERATION_NAMES)[number];

export type BenchmarkOptions = {
  prefix: string;
  maxForkDepth: number;
  objectSizeBytes: number;
  iterations: number;
  warmup: number;
  concurrency: number;
  sharedReadCount: number;
  localReadCount: number;
  overwriteCount: number;
  deleteCount: number;
  listObjectCount: number;
  keepBuckets: boolean;
  artifactsRoot: string;
  endpoint?: string;
  operations: OperationName[];
};

export type AuthConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
};

export type BucketScenario = {
  id: string;
  label: string;
  kind: 'normal' | 'snapshot-root' | 'fork';
  bucket: string;
  snapshotEnabled: boolean;
  forkDepth: number;
  parentScenarioId?: string;
  parentBucket?: string;
  parentSnapshotVersion?: string;
};

export type FixtureManifest = {
  sharedReadKeys: string[];
  localReadKeys: string[];
  overwriteKeys: string[];
  deleteKeys: string[];
  listPrefix: string;
  listObjectCount: number;
};

export type BenchmarkManifest = {
  runId: string;
  createdAt: string;
  options: BenchmarkOptions;
  fixtures: FixtureManifest;
  scenarios: BucketScenario[];
  artifactDir: string;
};

export type OperationRun = {
  operation: OperationName;
  runId: string;
  artifactDir: string;
  manifestPath: string;
  resultsPath: string;
  summaryPath: string;
};

export type LatencyStats = {
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

export type OperationResult = {
  operation: OperationName;
  scenarioId: string;
  bucket: string;
  stats: LatencyStats;
};

export type BenchmarkResults = {
  runId: string;
  createdAt: string;
  results: OperationResult[];
};
