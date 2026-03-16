# Tigris Storage Benchmark

This repo benchmarks Tigris object storage across:

- A normal bucket with snapshots disabled
- A snapshot-enabled root bucket with no fork parents
- A configurable chain of fork buckets, where each child is forked from the previous bucket

All buckets are created as single-region buckets in `iad`, using the Tigris JavaScript SDK.

The default benchmark focuses on 1 KB objects and reports how latency changes as you add fork depth:

- `head-shared`: HEAD against an object created in the root snapshot bucket and inherited by forks
- `get-shared`: GET against an inherited 1 KB object
- `get-local`: GET against a 1 KB object created directly in the target bucket
- `list-prefix`: LIST a shared prefix populated in the root bucket
- `put-new`: PUT a brand new 1 KB object into the target bucket
- `put-overwrite-seeded`: overwrite a pre-seeded 1 KB object
- `remove-seeded`: delete a pre-seeded 1 KB object

That split is intentional:

- `normal` vs `snapshot-root` isolates the cost of snapshot support alone
- `snapshot-root` vs `fork-depth-N` shows how inherited-object lookups and mutations behave as the fork chain gets deeper

## Source docs used

- Tigris SDK overview: <https://www.tigrisdata.com/docs/sdks/tigris/>
- SDK bucket APIs (`createBucket`, `createBucketSnapshot`, object ops): <https://www.tigrisdata.com/docs/sdks/tigris/using-sdk>
- Snapshots and forks: <https://www.tigrisdata.com/docs/snapshots-and-forks/>

## Requirements

- Node.js 22+
- A Tigris access key and secret

## Setup

```bash
npm install
cp .env.example .env
```

Populate `.env` with your Tigris credentials.

## Run

This provisions fresh buckets, runs the suite, writes JSON and Markdown reports under `artifacts/`, and then deletes the buckets unless you opt out.

Each operation is isolated into its own fresh bucket set. Bucket creation, snapshot creation, and fork creation happen before timing starts, so fork-depth results measure object operations against already-provisioned forks rather than the cost of creating those forks.

```bash
npm run benchmark -- --prefix tigris-bench --max-fork-depth 3
```

Useful options:

```bash
npm run benchmark -- --help
```

Examples:

```bash
# Keep the buckets around for manual inspection
npm run benchmark -- --prefix tigris-bench --max-fork-depth 4 --keep-buckets

# Higher request parallelism
npm run benchmark -- --prefix tigris-bench --concurrency 8

# Fewer iterations while validating credentials
npm run benchmark -- --iterations 20 --warmup 3
```

## Cleanup

If you used `--keep-buckets`, remove the run later with:

```bash
npm run cleanup -- --manifest artifacts/<run-id>/manifest.json
```

## Output

Each run creates:

- `artifacts/<run-id>/manifest.json`: bucket names, fork chain, fixture layout, and run settings
- `artifacts/<run-id>/results.json`: raw benchmark results
- `artifacts/<run-id>/summary.md`: compact summary with per-op latency and throughput tables

The Markdown summary includes a ratio against the `normal` bucket, which makes it easier to spot whether snapshot support or additional fork depth is the larger cost.

## Notes

- Buckets are created with `locations: { type: 'single', values: 'iad' }`.
- The harness attempts to create fork buckets with snapshots enabled so they can act as parents for deeper forks. If Tigris rejects that in your account or region, the benchmark exits with a clear error instead of silently flattening the fork chain.
- Mutable ops are benchmarked only after provisioning a fresh run, so overwrite and delete measurements always start from a clean inherited state.
