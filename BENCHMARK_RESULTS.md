# Benchmark Results

Latest live run: `tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf`

## Configuration

- Region placement: `single` / `iad`
- Object size: `1024` bytes
- Max fork depth: `3`
- Iterations per measured op: `20`
- Warmup per op: `5`
- Concurrency: `1`
- Endpoint: `https://t3.storage.dev`
- Isolation mode: fresh bucket set per operation

## Isolation semantics

- Every operation is provisioned against a fresh `normal`, `snapshot-root`, and fork chain.
- Bucket creation, snapshot creation, and fork creation happen before measurement starts.
- Fork-depth timings therefore measure object operations against already-created fork layers, not the cost of creating those layers.
- Mutable operations use separate warmup fixtures, so warmup does not consume measured keys.

## Scenario map

- `normal`: snapshot disabled
- `snapshot-root`: snapshot enabled, no parent
- `fork-depth-1`: fork of `snapshot-root`
- `fork-depth-2`: fork of `fork-depth-1`
- `fork-depth-3`: fork of `fork-depth-2`

## Key findings

- Snapshot support alone stayed close to flat on the read-heavy paths in this isolated run. `get-shared` moved from `7.65 ms` p50 on `normal` to `7.87 ms` on `snapshot-root`, and `get-local` moved from `6.87 ms` to `6.81 ms`.
- Fork depth still shows a clear inherited-read penalty when isolated correctly. `get-shared` rose from `7.65 ms` p50 on `normal` to `12.54 ms` at depth 1, `16.98 ms` at depth 2, and `19.98 ms` at depth 3.
- Local reads also degrade with deeper fork chains even though the object lives directly in the target bucket. `get-local` rose from `6.87 ms` to `11.57 ms`, `12.23 ms`, and `20.58 ms` across depths 1 through 3.
- `list-prefix` shows a smaller but consistent fork-depth slope: `16.14 ms` p50 on `normal` to `26.46 ms` at depth 3.
- Fresh writes remain noisy and do not show a monotonic fork penalty in this sample. With `20` measured iterations, this path needs a larger run before drawing conclusions.
- Overwrite and delete paths are now properly isolated from the rest of the suite, and their spread is much smaller than the inherited-read gradient.

## p50 latency summary

| Operation | normal | snapshot-root | fork-depth-1 | fork-depth-2 | fork-depth-3 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `head-shared` | 8.04 ms | 7.81 ms | 11.57 ms | 15.00 ms | 27.35 ms |
| `get-shared` | 7.65 ms | 7.87 ms | 12.54 ms | 16.98 ms | 19.98 ms |
| `get-local` | 6.87 ms | 6.81 ms | 11.57 ms | 12.23 ms | 20.58 ms |
| `list-prefix` | 16.14 ms | 14.80 ms | 19.10 ms | 23.71 ms | 26.46 ms |
| `put-new` | 23.09 ms | 18.25 ms | 19.07 ms | 20.33 ms | 20.50 ms |
| `put-overwrite-seeded` | 25.76 ms | 30.93 ms | 30.48 ms | 25.82 ms | 25.60 ms |
| `remove-seeded` | 20.76 ms | 26.45 ms | 24.14 ms | 18.89 ms | 22.66 ms |

## Top-level artifact files

- Suite summary: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/summary.md`
- Suite results: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/results.json`
- Suite metadata: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/suite.json`

## Per-operation artifact directories

- `head-shared`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-head-shared-2026-03-16T17-04-09-422Z-080cf1d3`
- `get-shared`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-get-shared-2026-03-16T17-04-39-264Z-c0bec176`
- `get-local`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-get-local-2026-03-16T17-05-05-426Z-b7ece92e`
- `list-prefix`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-list-prefix-2026-03-16T17-05-31-620Z-51f3f74f`
- `put-new`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-put-new-2026-03-16T17-06-00-594Z-958991dc`
- `put-overwrite-seeded`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-put-overwrite-seeded-2026-03-16T17-06-28-465Z-8eb6d24c`
- `remove-seeded`: `artifacts/tigris-bench-2026-03-16T17-04-09-420Z-f33d1edf/tigris-bench-remove-seeded-2026-03-16T17-06-56-000Z-f28e02da`
