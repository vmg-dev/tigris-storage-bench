# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-head-2026-04-08T16-23-33-298Z-2ed87998`
Created: 2026-04-08T16:25:43.095Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-head-single-iad-38944701`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-head-multi-usa-7f53f875`

## head

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 11.70 | 13.23 | 1.13x | 70.44 | 66.71 | 0.95x |
| 4 | 9.50 | 9.74 | 1.03x | 307.08 | 309.37 | 1.01x |
| 8 | 15.21 | 13.55 | 0.89x | 222.30 | 301.36 | 1.36x |
| 16 | 32.28 | 34.56 | 1.07x | 157.39 | 221.15 | 1.41x |
| 32 | 28.37 | 27.48 | 0.97x | 178.72 | 258.02 | 1.44x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 29.30 | 31.36 | 14.99 | 299.81 |
| single-iad | 1 | 25.80 | 29.24 | 14.19 | 283.94 |
| multi-usa | 4 | 16.98 | 28.80 | 11.26 | 64.65 |
| single-iad | 4 | 20.46 | 27.15 | 12.37 | 65.13 |
| multi-usa | 8 | 63.62 | 66.03 | 24.20 | 66.37 |
| single-iad | 8 | 82.68 | 89.67 | 23.53 | 89.97 |
| multi-usa | 16 | 76.42 | 89.87 | 40.28 | 90.44 |
| single-iad | 16 | 106.39 | 126.66 | 49.17 | 127.07 |
| multi-usa | 32 | 60.19 | 76.91 | 32.19 | 77.51 |
| single-iad | 32 | 108.27 | 110.49 | 42.14 | 111.90 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 8.36 | 9.06 | 1.08x | 102.80 | 100.65 | 0.98x |
| 4 | 10.05 | 13.07 | 1.30x | 187.57 | 264.97 | 1.41x |
| 8 | 21.98 | 14.38 | 0.65x | 290.90 | 446.77 | 1.54x |
| 16 | 22.81 | 24.59 | 1.08x | 394.80 | 561.32 | 1.42x |
| 32 | 24.18 | 21.37 | 0.88x | 433.74 | 661.28 | 1.52x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 15.66 | 18.00 | 9.93 | 198.70 |
| single-iad | 1 | 18.37 | 25.32 | 9.73 | 194.56 |
| multi-usa | 4 | 27.81 | 28.54 | 14.27 | 75.48 |
| single-iad | 4 | 20.95 | 65.53 | 14.24 | 106.63 |
| multi-usa | 8 | 26.57 | 30.45 | 16.19 | 44.77 |
| single-iad | 8 | 37.93 | 40.02 | 25.02 | 68.75 |
| multi-usa | 16 | 31.43 | 32.07 | 23.52 | 35.63 |
| single-iad | 16 | 49.25 | 50.44 | 26.51 | 50.66 |
| multi-usa | 32 | 28.85 | 29.94 | 21.78 | 30.24 |
| single-iad | 32 | 33.35 | 45.88 | 25.05 | 46.11 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 9.53 | 12.54 | 1.32x | 91.80 | 68.63 | 0.75x |
| 4 | 10.01 | 8.54 | 0.85x | 329.12 | 416.42 | 1.27x |
| 8 | 14.08 | 17.13 | 1.22x | 437.39 | 344.00 | 0.79x |
| 16 | 22.62 | 19.75 | 0.87x | 547.02 | 609.76 | 1.11x |
| 32 | 25.15 | 49.49 | 1.97x | 587.79 | 340.30 | 0.58x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 22.07 | 29.48 | 14.57 | 291.40 |
| single-iad | 1 | 18.95 | 29.89 | 10.89 | 217.87 |
| multi-usa | 4 | 11.43 | 12.91 | 8.86 | 48.03 |
| single-iad | 4 | 15.80 | 23.20 | 11.56 | 60.77 |
| multi-usa | 8 | 25.95 | 27.61 | 18.50 | 58.14 |
| single-iad | 8 | 27.09 | 28.70 | 16.29 | 45.73 |
| multi-usa | 16 | 30.02 | 30.60 | 20.74 | 32.80 |
| single-iad | 16 | 33.78 | 35.44 | 23.06 | 36.56 |
| multi-usa | 32 | 57.67 | 58.43 | 49.27 | 58.77 |
| single-iad | 32 | 32.52 | 33.61 | 25.46 | 34.03 |

