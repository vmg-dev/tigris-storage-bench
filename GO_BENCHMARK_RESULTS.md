# Go Benchmark Results

Latest live run: `tigris-bench-go-2026-03-16T17-33-15.261Z-b32ecbaa`

## Configuration

- Region placement: `single` / `iad`
- Object size: `1024` bytes
- Max fork depth: `3`
- Iterations per measured op: `20`
- Warmup per op: `5`
- Concurrency: `1`
- Endpoint: `https://t3.storage.dev`
- Implementation: official Go SDK plus direct Tigris headers where needed for exact fork snapshot selection
- Isolation mode: fresh bucket set per operation

## Isolation semantics

- Every operation is provisioned against a fresh `normal`, `snapshot-root`, and fork chain.
- Bucket creation, snapshot creation, and fork creation happen before measurement starts.
- Fork-depth timings therefore measure object operations against already-created fork layers, not the cost of creating those layers.
- Mutable operations use separate warmup fixtures, so warmup does not consume measured keys.
- `put-new` warmup also uses separate keys, so measured `put-new` latencies are actual new writes, not overwrites.

## Scenario map

- `normal`: snapshot disabled
- `snapshot-root`: snapshot enabled, no parent
- `fork-depth-1`: fork of `snapshot-root`
- `fork-depth-2`: fork of `fork-depth-1`
- `fork-depth-3`: fork of `fork-depth-2`

## Key findings

- Snapshot enablement alone remains close to flat on the read-heavy paths. `get-shared` moved from `6.65 ms` p50 on `normal` to `7.28 ms` on `snapshot-root`, and `get-local` moved from `6.95 ms` to `7.31 ms`.
- The inherited-read penalty with deeper fork depth is clear in Go as well. `get-shared` rose from `6.65 ms` p50 on `normal` to `10.44 ms` at depth 1, `13.57 ms` at depth 2, and `25.55 ms` at depth 3.
- Local reads also slowed materially with depth: `get-local` went from `6.95 ms` on `normal` to `10.67 ms`, `16.40 ms`, and `21.48 ms`.
- `list-prefix` showed a consistent fork-depth gradient: `13.18 ms` p50 on `normal` to `33.40 ms` at depth 3.
- The write and delete paths were noisier than the read paths, but they now run with the same isolation guarantees as the Node harness.

## p50 latency summary

| Operation | normal | snapshot-root | fork-depth-1 | fork-depth-2 | fork-depth-3 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `head-shared` | 6.41 ms | 6.70 ms | 11.57 ms | 15.54 ms | 19.97 ms |
| `get-shared` | 6.65 ms | 7.28 ms | 10.44 ms | 13.57 ms | 25.55 ms |
| `get-local` | 6.95 ms | 7.31 ms | 10.67 ms | 16.40 ms | 21.48 ms |
| `list-prefix` | 13.18 ms | 13.08 ms | 16.88 ms | 24.81 ms | 33.40 ms |
| `put-new` | 23.66 ms | 26.69 ms | 29.91 ms | 25.98 ms | 27.23 ms |
| `put-overwrite-seeded` | 26.96 ms | 26.82 ms | 30.80 ms | 26.19 ms | 38.39 ms |
| `remove-seeded` | 20.59 ms | 28.46 ms | 22.42 ms | 32.05 ms | 26.16 ms |

## Artifact files

- Suite summary: `artifacts-go/tigris-bench-go-2026-03-16T17-33-15.261Z-b32ecbaa/summary.md`
- Suite results: `artifacts-go/tigris-bench-go-2026-03-16T17-33-15.261Z-b32ecbaa/results.json`
- Suite metadata: `artifacts-go/tigris-bench-go-2026-03-16T17-33-15.261Z-b32ecbaa/suite.json`
