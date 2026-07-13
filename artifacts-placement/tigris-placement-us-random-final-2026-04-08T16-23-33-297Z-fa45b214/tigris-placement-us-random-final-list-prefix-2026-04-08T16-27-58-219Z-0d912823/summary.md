# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-list-prefix-2026-04-08T16-27-58-219Z-0d912823`
Created: 2026-04-08T16:38:57.601Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-list-prefix-single-iad-21eb68e`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-list-prefix-multi-usa-e185a5bf`

## list-prefix

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 23.24 | 21.69 | 0.93x | 34.98 | 37.96 | 1.09x |
| 4 | 19.44 | 24.61 | 1.27x | 177.98 | 138.80 | 0.78x |
| 8 | 30.50 | 30.21 | 0.99x | 145.88 | 188.52 | 1.29x |
| 16 | 53.32 | 54.17 | 1.02x | 129.59 | 187.46 | 1.45x |
| 32 | 63.77 | 58.93 | 0.92x | 179.49 | 189.62 | 1.06x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 44.19 | 54.80 | 26.34 | 526.90 |
| single-iad | 1 | 48.76 | 57.02 | 28.59 | 571.74 |
| multi-usa | 4 | 39.90 | 45.46 | 27.32 | 144.09 |
| single-iad | 4 | 28.46 | 33.16 | 21.07 | 112.37 |
| multi-usa | 8 | 89.20 | 96.56 | 36.63 | 106.09 |
| single-iad | 8 | 117.08 | 136.84 | 42.12 | 137.10 |
| multi-usa | 16 | 100.53 | 106.24 | 62.20 | 106.69 |
| single-iad | 16 | 134.85 | 153.91 | 75.17 | 154.33 |
| multi-usa | 32 | 96.71 | 104.90 | 60.97 | 105.47 |
| single-iad | 32 | 96.94 | 110.99 | 65.90 | 111.43 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 19.53 | 19.60 | 1.00x | 42.40 | 48.45 | 1.14x |
| 4 | 27.00 | 24.45 | 0.91x | 116.85 | 133.52 | 1.14x |
| 8 | 33.04 | 31.76 | 0.96x | 197.81 | 201.83 | 1.02x |
| 16 | 52.82 | 57.23 | 1.08x | 201.22 | 207.57 | 1.03x |
| 32 | 62.35 | 58.49 | 0.94x | 203.38 | 214.64 | 1.06x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 25.48 | 30.63 | 20.64 | 412.82 |
| single-iad | 1 | 46.50 | 50.38 | 23.59 | 471.75 |
| multi-usa | 4 | 43.48 | 47.47 | 27.68 | 149.79 |
| single-iad | 4 | 48.58 | 69.55 | 31.39 | 171.16 |
| multi-usa | 8 | 48.49 | 69.36 | 34.38 | 99.10 |
| single-iad | 8 | 53.37 | 58.37 | 35.26 | 101.11 |
| multi-usa | 16 | 85.88 | 89.45 | 55.72 | 96.35 |
| single-iad | 16 | 95.76 | 99.01 | 57.00 | 99.39 |
| multi-usa | 32 | 88.95 | 92.76 | 59.46 | 93.18 |
| single-iad | 32 | 94.69 | 97.97 | 63.96 | 98.34 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 20.51 | 18.36 | 0.89x | 44.60 | 46.74 | 1.05x |
| 4 | 25.00 | 22.77 | 0.91x | 139.31 | 154.14 | 1.11x |
| 8 | 29.78 | 30.90 | 1.04x | 218.18 | 210.26 | 0.96x |
| 16 | 48.77 | 65.44 | 1.34x | 214.98 | 174.53 | 0.81x |
| 32 | 57.57 | 60.54 | 1.05x | 210.28 | 207.51 | 0.99x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 32.56 | 47.88 | 21.39 | 427.92 |
| single-iad | 1 | 38.07 | 40.67 | 22.42 | 448.45 |
| multi-usa | 4 | 34.08 | 41.47 | 24.54 | 129.75 |
| single-iad | 4 | 37.70 | 47.69 | 26.00 | 143.56 |
| multi-usa | 8 | 49.32 | 53.44 | 32.72 | 95.12 |
| single-iad | 8 | 44.22 | 46.56 | 31.49 | 91.67 |
| multi-usa | 16 | 96.78 | 100.20 | 69.98 | 114.59 |
| single-iad | 16 | 81.51 | 84.90 | 52.34 | 93.03 |
| multi-usa | 32 | 92.81 | 95.89 | 61.66 | 96.38 |
| single-iad | 32 | 91.50 | 94.64 | 59.62 | 95.11 |

