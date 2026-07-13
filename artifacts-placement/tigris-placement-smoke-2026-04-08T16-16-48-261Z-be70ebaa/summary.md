# Tigris placement benchmark summary

Run ID: `tigris-placement-smoke-2026-04-08T16-16-48-261Z-be70ebaa`
Created: 2026-04-08T16:16:48.263Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024` bytes
Concurrencies: `1`
Iterations: 3
Warmup: 1
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-smoke-put-new-single-iad-d9fcb3b3`
- multi-usa: multi/usa, bucket=`tigris-placement-smoke-put-new-multi-usa-a3dcf596`

Per-operation runs:
- put-new: run=`tigris-placement-smoke-put-new-2026-04-08T16-16-48-264Z-187a8a26`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-smoke-2026-04-08T16-16-48-261Z-be70ebaa/tigris-placement-smoke-put-new-2026-04-08T16-16-48-264Z-187a8a26`

## put-new

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 74.38 | 184.22 | 2.48x | 12.60 | 5.25 | 0.42x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 212.06 | 212.06 | 190.42 | 571.29 |
| single-iad | 1 | 99.91 | 99.91 | 79.31 | 238.03 |

