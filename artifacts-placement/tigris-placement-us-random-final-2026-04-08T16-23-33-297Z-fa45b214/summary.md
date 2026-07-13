# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214`
Created: 2026-04-08T16:23:33.298Z
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

Per-operation runs:
- head: run=`tigris-placement-us-random-final-head-2026-04-08T16-23-33-298Z-2ed87998`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-head-2026-04-08T16-23-33-298Z-2ed87998`
- get: run=`tigris-placement-us-random-final-get-2026-04-08T16-25-43-409Z-fa1ecd88`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-get-2026-04-08T16-25-43-409Z-fa1ecd88`
- list-prefix: run=`tigris-placement-us-random-final-list-prefix-2026-04-08T16-27-58-219Z-0d912823`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-list-prefix-2026-04-08T16-27-58-219Z-0d912823`
- put-new: run=`tigris-placement-us-random-final-put-new-2026-04-08T16-38-58-017Z-5fb11bca`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-put-new-2026-04-08T16-38-58-017Z-5fb11bca`
- remove: run=`tigris-placement-us-random-final-remove-2026-04-08T16-39-48-098Z-1e627a7f`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-remove-2026-04-08T16-39-48-098Z-1e627a7f`
- put-same-object: run=`tigris-placement-us-random-final-put-same-object-2026-04-08T16-42-28-643Z-ae474c03`, artifacts=`/root/tigris-storage-bench/artifacts-placement/tigris-placement-us-random-final-2026-04-08T16-23-33-297Z-fa45b214/tigris-placement-us-random-final-put-same-object-2026-04-08T16-42-28-643Z-ae474c03`

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

## put-same-object

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 88.56 | 178.60 | 2.02x | 8.79 | 5.60 | 0.64x |
| 4 | 114.09 | 217.24 | 1.90x | 12.66 | 11.76 | 0.93x |
| 8 | 277.37 | 489.96 | 1.77x | 11.98 | 11.35 | 0.95x |
| 16 | 438.23 | 776.12 | 1.77x | 15.41 | 11.13 | 0.72x |
| 32 | 674.34 | 754.38 | 1.12x | 12.07 | 11.53 | 0.96x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 278.70 | 291.57 | 178.57 | 3571.44 |
| single-iad | 1 | 283.08 | 295.26 | 113.75 | 2275.11 |
| multi-usa | 4 | 721.64 | 756.36 | 295.72 | 1701.22 |
| single-iad | 4 | 910.36 | 953.39 | 259.19 | 1579.26 |
| multi-usa | 8 | 886.06 | 1761.80 | 555.47 | 1761.90 |
| single-iad | 8 | 1389.30 | 1576.65 | 541.41 | 1669.47 |
| multi-usa | 16 | 1712.78 | 1796.38 | 819.54 | 1796.46 |
| single-iad | 16 | 1083.21 | 1298.12 | 560.81 | 1298.20 |
| multi-usa | 32 | 1576.20 | 1734.82 | 851.53 | 1734.91 |
| single-iad | 32 | 1293.67 | 1657.41 | 702.31 | 1657.49 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 143.15 | 229.74 | 1.60x | 6.29 | 4.33 | 0.69x |
| 4 | 238.57 | 310.58 | 1.30x | 11.00 | 10.25 | 0.93x |
| 8 | 392.57 | 479.75 | 1.22x | 11.82 | 11.54 | 0.98x |
| 16 | 771.35 | 647.80 | 0.84x | 10.61 | 13.78 | 1.30x |
| 32 | 717.75 | 753.49 | 1.05x | 10.59 | 11.74 | 1.11x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 315.28 | 329.53 | 231.17 | 4623.43 |
| single-iad | 1 | 353.94 | 364.99 | 158.87 | 3177.43 |
| multi-usa | 4 | 864.91 | 956.35 | 364.27 | 1951.50 |
| single-iad | 4 | 813.36 | 843.65 | 306.97 | 1818.82 |
| multi-usa | 8 | 1018.82 | 1179.32 | 563.35 | 1732.67 |
| single-iad | 8 | 1461.22 | 1692.39 | 516.40 | 1692.48 |
| multi-usa | 16 | 1388.80 | 1451.57 | 692.21 | 1451.64 |
| single-iad | 16 | 1639.47 | 1884.57 | 827.00 | 1884.64 |
| multi-usa | 32 | 1574.92 | 1703.33 | 836.85 | 1703.41 |
| single-iad | 32 | 1780.67 | 1888.54 | 879.11 | 1888.62 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 118.63 | 201.04 | 1.69x | 7.12 | 4.72 | 0.66x |
| 4 | 247.62 | 312.00 | 1.26x | 12.14 | 9.43 | 0.78x |
| 8 | 473.60 | 403.97 | 0.85x | 10.44 | 13.26 | 1.27x |
| 16 | 748.64 | 598.02 | 0.80x | 11.20 | 11.93 | 1.06x |
| 32 | 730.63 | 785.56 | 1.08x | 11.96 | 14.30 | 1.20x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 292.39 | 313.33 | 211.72 | 4234.36 |
| single-iad | 1 | 190.60 | 418.85 | 140.50 | 2810.04 |
| multi-usa | 4 | 611.50 | 805.12 | 368.07 | 2121.80 |
| single-iad | 4 | 651.00 | 693.79 | 295.66 | 1647.23 |
| multi-usa | 8 | 908.30 | 1028.90 | 516.36 | 1508.77 |
| single-iad | 8 | 1600.33 | 1915.91 | 657.68 | 1915.96 |
| multi-usa | 16 | 1465.69 | 1676.58 | 759.01 | 1676.65 |
| single-iad | 16 | 1377.08 | 1784.88 | 748.56 | 1784.97 |
| multi-usa | 32 | 1300.08 | 1398.83 | 815.77 | 1398.94 |
| single-iad | 32 | 1594.06 | 1672.25 | 807.19 | 1672.34 |

