# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-get-2026-04-08T16-25-43-409Z-fa1ecd88`
Created: 2026-04-08T16:27:57.871Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-get-single-iad-2f68cb37`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-get-multi-usa-c985c8dd`

## get

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 19.96 | 14.40 | 0.72x | 46.01 | 55.39 | 1.20x |
| 4 | 13.63 | 14.10 | 1.03x | 180.44 | 199.61 | 1.11x |
| 8 | 12.64 | 11.03 | 0.87x | 367.94 | 159.91 | 0.43x |
| 16 | 36.38 | 28.37 | 0.78x | 180.42 | 167.54 | 0.93x |
| 32 | 25.02 | 22.40 | 0.90x | 287.73 | 284.16 | 0.99x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 29.47 | 33.95 | 18.05 | 361.07 |
| single-iad | 1 | 37.28 | 45.09 | 21.73 | 434.66 |
| multi-usa | 4 | 38.62 | 55.79 | 17.63 | 100.20 |
| single-iad | 4 | 49.60 | 52.80 | 20.65 | 110.84 |
| multi-usa | 8 | 55.32 | 124.69 | 21.08 | 125.07 |
| single-iad | 8 | 45.97 | 47.63 | 18.15 | 54.36 |
| multi-usa | 16 | 114.26 | 118.94 | 48.10 | 119.38 |
| single-iad | 16 | 69.61 | 110.29 | 40.05 | 110.85 |
| multi-usa | 32 | 69.37 | 69.75 | 31.71 | 70.38 |
| single-iad | 32 | 45.70 | 68.87 | 30.27 | 69.51 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 31.01 | 26.32 | 0.85x | 28.36 | 30.29 | 1.07x |
| 4 | 17.88 | 22.25 | 1.24x | 147.57 | 126.08 | 0.85x |
| 8 | 23.42 | 39.61 | 1.69x | 197.98 | 135.01 | 0.68x |
| 16 | 21.22 | 24.77 | 1.17x | 144.55 | 257.92 | 1.78x |
| 32 | 62.82 | 28.00 | 0.45x | 163.11 | 220.03 | 1.35x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 91.75 | 94.58 | 33.01 | 660.25 |
| single-iad | 1 | 55.75 | 89.13 | 35.25 | 705.12 |
| multi-usa | 4 | 57.93 | 63.79 | 26.65 | 158.63 |
| single-iad | 4 | 38.60 | 115.70 | 24.54 | 135.53 |
| multi-usa | 8 | 126.84 | 134.19 | 50.06 | 148.13 |
| single-iad | 8 | 72.39 | 100.83 | 31.29 | 101.02 |
| multi-usa | 16 | 56.66 | 77.34 | 30.05 | 77.54 |
| single-iad | 16 | 86.59 | 138.17 | 34.90 | 138.36 |
| multi-usa | 32 | 70.63 | 90.23 | 36.21 | 90.90 |
| single-iad | 32 | 94.53 | 122.04 | 66.48 | 122.61 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 21.65 | 31.37 | 1.45x | 26.61 | 20.71 | 0.78x |
| 4 | 27.80 | 33.52 | 1.21x | 125.82 | 74.97 | 0.60x |
| 8 | 30.04 | 32.73 | 1.09x | 91.59 | 102.26 | 1.12x |
| 16 | 45.85 | 45.72 | 1.00x | 206.99 | 146.75 | 0.71x |
| 32 | 46.78 | 49.55 | 1.06x | 296.77 | 128.52 | 0.43x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 142.84 | 146.37 | 48.29 | 965.79 |
| single-iad | 1 | 102.76 | 105.69 | 37.58 | 751.59 |
| multi-usa | 4 | 116.76 | 157.22 | 51.07 | 266.78 |
| single-iad | 4 | 70.49 | 72.22 | 31.04 | 158.95 |
| multi-usa | 8 | 82.41 | 159.29 | 40.96 | 195.58 |
| single-iad | 8 | 54.84 | 217.99 | 39.18 | 218.35 |
| multi-usa | 16 | 91.43 | 135.83 | 53.65 | 136.29 |
| single-iad | 16 | 78.29 | 96.31 | 49.36 | 96.62 |
| multi-usa | 32 | 85.87 | 155.29 | 57.28 | 155.62 |
| single-iad | 32 | 65.54 | 66.84 | 47.82 | 67.39 |

