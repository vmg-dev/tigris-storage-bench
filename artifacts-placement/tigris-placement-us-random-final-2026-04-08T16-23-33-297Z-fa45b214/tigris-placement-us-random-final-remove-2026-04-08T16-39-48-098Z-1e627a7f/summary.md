# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-remove-2026-04-08T16-39-48-098Z-1e627a7f`
Created: 2026-04-08T16:42:28.400Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-remove-single-iad-825dfe59`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-remove-multi-usa-9b839e01`

## remove

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 72.53 | 158.00 | 2.18x | 12.74 | 6.14 | 0.48x |
| 4 | 90.33 | 149.60 | 1.66x | 43.07 | 27.00 | 0.63x |
| 8 | 72.17 | 162.78 | 2.26x | 47.56 | 41.40 | 0.87x |
| 16 | 99.87 | 184.67 | 1.85x | 99.39 | 60.78 | 0.61x |
| 32 | 46.98 | 186.50 | 3.97x | 144.65 | 94.94 | 0.66x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 201.61 | 205.08 | 162.85 | 3257.16 |
| single-iad | 1 | 115.80 | 136.12 | 78.50 | 1570.01 |
| multi-usa | 4 | 167.72 | 172.24 | 146.61 | 740.82 |
| single-iad | 4 | 111.48 | 115.96 | 83.34 | 464.38 |
| multi-usa | 8 | 228.41 | 259.26 | 172.09 | 483.06 |
| single-iad | 8 | 145.75 | 343.54 | 90.59 | 420.56 |
| multi-usa | 16 | 228.65 | 275.34 | 190.15 | 329.07 |
| single-iad | 16 | 121.19 | 137.91 | 97.71 | 201.22 |
| multi-usa | 32 | 200.31 | 210.14 | 189.31 | 210.66 |
| single-iad | 32 | 122.64 | 137.46 | 65.53 | 138.27 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 67.44 | 170.57 | 2.53x | 13.72 | 5.90 | 0.43x |
| 4 | 77.76 | 171.17 | 2.20x | 46.80 | 22.22 | 0.47x |
| 8 | 91.48 | 192.85 | 2.11x | 62.49 | 35.05 | 0.56x |
| 16 | 87.02 | 148.38 | 1.71x | 97.19 | 72.74 | 0.75x |
| 32 | 116.00 | 166.49 | 1.44x | 164.17 | 91.68 | 0.56x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 191.72 | 225.10 | 169.59 | 3391.80 |
| single-iad | 1 | 101.27 | 107.66 | 72.86 | 1457.20 |
| multi-usa | 4 | 191.64 | 192.99 | 169.81 | 900.17 |
| single-iad | 4 | 104.72 | 106.16 | 79.68 | 427.38 |
| multi-usa | 8 | 213.60 | 227.12 | 194.78 | 570.62 |
| single-iad | 8 | 130.27 | 135.64 | 97.22 | 320.05 |
| multi-usa | 16 | 183.78 | 194.51 | 148.84 | 274.94 |
| single-iad | 16 | 121.03 | 121.05 | 90.81 | 205.78 |
| multi-usa | 32 | 196.62 | 217.56 | 174.40 | 218.15 |
| single-iad | 32 | 121.23 | 121.42 | 110.90 | 121.83 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 71.57 | 157.48 | 2.20x | 13.12 | 6.19 | 0.47x |
| 4 | 59.90 | 142.13 | 2.37x | 55.66 | 26.94 | 0.48x |
| 8 | 90.47 | 162.14 | 1.79x | 72.08 | 40.81 | 0.57x |
| 16 | 101.42 | 156.82 | 1.55x | 101.16 | 69.87 | 0.69x |
| 32 | 77.27 | 150.15 | 1.94x | 221.17 | 99.07 | 0.45x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 199.77 | 232.41 | 161.60 | 3232.12 |
| single-iad | 1 | 120.07 | 142.43 | 76.23 | 1524.62 |
| multi-usa | 4 | 186.84 | 188.41 | 146.43 | 742.27 |
| single-iad | 4 | 90.48 | 99.31 | 63.02 | 359.30 |
| multi-usa | 8 | 185.72 | 213.11 | 161.15 | 490.13 |
| single-iad | 8 | 126.95 | 128.73 | 91.93 | 277.46 |
| multi-usa | 16 | 160.46 | 163.35 | 152.23 | 286.24 |
| single-iad | 16 | 110.91 | 119.32 | 99.72 | 197.70 |
| multi-usa | 32 | 200.83 | 201.43 | 161.61 | 201.88 |
| single-iad | 32 | 87.11 | 90.42 | 78.83 | 90.43 |

