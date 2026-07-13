# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-put-new-2026-04-08T16-38-58-017Z-5fb11bca`
Created: 2026-04-08T16:39:47.754Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-put-new-single-iad-6769c0f7`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-put-new-multi-usa-473c297c`

## put-new

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93.47 | 179.64 | 1.92x | 9.74 | 5.30 | 0.54x |
| 4 | 82.57 | 170.94 | 2.07x | 42.87 | 21.20 | 0.49x |
| 8 | 85.91 | 215.93 | 2.51x | 68.06 | 31.54 | 0.46x |
| 16 | 84.27 | 167.07 | 1.98x | 130.03 | 65.06 | 0.50x |
| 32 | 66.78 | 195.89 | 2.93x | 183.71 | 79.39 | 0.43x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 242.39 | 302.26 | 188.83 | 3776.63 |
| single-iad | 1 | 154.01 | 187.52 | 102.66 | 2053.31 |
| multi-usa | 4 | 210.39 | 261.54 | 171.23 | 943.27 |
| single-iad | 4 | 155.83 | 161.35 | 89.79 | 466.53 |
| multi-usa | 8 | 276.89 | 288.46 | 212.87 | 634.18 |
| single-iad | 8 | 137.73 | 140.59 | 91.88 | 293.86 |
| multi-usa | 16 | 237.56 | 238.27 | 183.09 | 307.39 |
| single-iad | 16 | 142.72 | 143.48 | 98.61 | 153.81 |
| multi-usa | 32 | 221.32 | 251.83 | 201.95 | 251.93 |
| single-iad | 32 | 106.40 | 108.73 | 71.42 | 108.87 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 119.97 | 204.12 | 1.70x | 8.61 | 4.22 | 0.49x |
| 4 | 148.58 | 198.92 | 1.34x | 17.30 | 17.39 | 1.00x |
| 8 | 152.85 | 231.45 | 1.51x | 41.53 | 18.35 | 0.44x |
| 16 | 143.07 | 229.54 | 1.60x | 57.97 | 40.59 | 0.70x |
| 32 | 182.68 | 190.94 | 1.05x | 37.00 | 47.24 | 1.28x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 415.99 | 514.08 | 237.13 | 4742.64 |
| single-iad | 1 | 184.60 | 194.99 | 116.15 | 2323.08 |
| multi-usa | 4 | 366.31 | 423.02 | 214.08 | 1150.15 |
| single-iad | 4 | 307.60 | 565.93 | 172.07 | 1155.78 |
| multi-usa | 8 | 482.68 | 1089.57 | 292.50 | 1089.64 |
| single-iad | 8 | 266.52 | 321.02 | 166.28 | 481.57 |
| multi-usa | 16 | 329.38 | 341.99 | 222.02 | 492.67 |
| single-iad | 16 | 281.53 | 344.94 | 162.19 | 344.98 |
| multi-usa | 32 | 271.75 | 423.35 | 216.01 | 423.41 |
| single-iad | 32 | 310.23 | 540.43 | 186.61 | 540.54 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 148.77 | 207.93 | 1.40x | 5.60 | 4.59 | 0.82x |
| 4 | 111.95 | 203.58 | 1.82x | 24.09 | 15.94 | 0.66x |
| 8 | 140.22 | 181.23 | 1.29x | 28.89 | 28.77 | 1.00x |
| 16 | 112.19 | 200.82 | 1.79x | 65.92 | 33.10 | 0.50x |
| 32 | 134.45 | 192.49 | 1.43x | 47.76 | 44.52 | 0.93x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 332.77 | 362.97 | 217.66 | 4353.23 |
| single-iad | 1 | 407.10 | 547.53 | 178.57 | 3571.41 |
| multi-usa | 4 | 463.63 | 466.22 | 242.87 | 1254.78 |
| single-iad | 4 | 224.88 | 347.63 | 137.15 | 830.34 |
| multi-usa | 8 | 346.24 | 395.37 | 214.75 | 695.14 |
| single-iad | 8 | 324.19 | 343.78 | 171.45 | 692.24 |
| multi-usa | 16 | 507.15 | 604.21 | 262.81 | 604.31 |
| single-iad | 16 | 233.25 | 234.20 | 119.60 | 303.38 |
| multi-usa | 32 | 440.69 | 449.10 | 244.28 | 449.24 |
| single-iad | 32 | 315.57 | 418.63 | 149.41 | 418.77 |

