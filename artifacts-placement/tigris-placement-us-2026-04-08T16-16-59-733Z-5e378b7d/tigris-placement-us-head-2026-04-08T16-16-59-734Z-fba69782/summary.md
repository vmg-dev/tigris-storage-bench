# Tigris placement benchmark summary

Run ID: `tigris-placement-us-head-2026-04-08T16-16-59-734Z-fba69782`
Created: 2026-04-08T16:19:09.242Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-head-single-iad-723cd1e9`
- multi-usa: multi/usa, bucket=`tigris-placement-us-head-multi-usa-044a4288`

## head

### 1024 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 18.56 | 14.38 | 0.78x | 49.08 | 50.80 | 1.04x |
| 4 | 13.80 | 9.76 | 0.71x | 238.98 | 363.18 | 1.52x |
| 8 | 11.96 | 15.55 | 1.30x | 313.44 | 130.91 | 0.42x |
| 16 | 37.62 | 30.85 | 0.82x | 198.03 | 222.90 | 1.13x |
| 32 | 33.86 | 28.95 | 0.86x | 137.00 | 220.37 | 1.61x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 36.53 | 43.97 | 19.68 | 393.67 |
| single-iad | 1 | 35.87 | 40.12 | 20.37 | 407.48 |
| multi-usa | 4 | 13.21 | 15.18 | 10.30 | 55.07 |
| single-iad | 4 | 26.78 | 27.49 | 15.74 | 83.69 |
| multi-usa | 8 | 150.39 | 152.46 | 34.94 | 152.78 |
| single-iad | 8 | 61.19 | 63.42 | 20.07 | 63.81 |
| multi-usa | 16 | 79.77 | 88.92 | 38.07 | 89.73 |
| single-iad | 16 | 98.68 | 100.09 | 49.40 | 101.00 |
| multi-usa | 32 | 48.79 | 89.88 | 33.23 | 90.75 |
| single-iad | 32 | 96.47 | 145.19 | 43.26 | 145.99 |

### 10240 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 8.94 | 13.09 | 1.46x | 98.88 | 67.28 | 0.68x |
| 4 | 10.14 | 10.15 | 1.00x | 278.76 | 334.75 | 1.20x |
| 8 | 12.41 | 16.35 | 1.32x | 388.26 | 379.51 | 0.98x |
| 16 | 19.65 | 19.34 | 0.98x | 608.53 | 514.21 | 0.85x |
| 32 | 20.19 | 23.20 | 1.15x | 669.82 | 629.63 | 0.94x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 21.10 | 27.97 | 14.86 | 297.27 |
| single-iad | 1 | 17.53 | 21.69 | 10.11 | 202.27 |
| multi-usa | 4 | 17.22 | 23.40 | 11.42 | 59.75 |
| single-iad | 4 | 24.68 | 26.34 | 12.29 | 71.75 |
| multi-usa | 8 | 25.43 | 26.04 | 17.29 | 52.70 |
| single-iad | 8 | 27.18 | 34.04 | 15.24 | 51.51 |
| multi-usa | 16 | 37.99 | 38.68 | 20.80 | 38.89 |
| single-iad | 16 | 28.46 | 29.17 | 21.01 | 32.87 |
| multi-usa | 32 | 30.34 | 31.29 | 23.45 | 31.76 |
| single-iad | 32 | 28.34 | 29.40 | 20.97 | 29.86 |

### 102400 bytes

| Concurrency | single p50 ms | multi p50 ms | multi vs single p50 | single ops/s | multi ops/s | multi vs single ops/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 11.44 | 9.80 | 0.86x | 74.14 | 85.25 | 1.15x |
| 4 | 9.74 | 10.52 | 1.08x | 355.61 | 322.70 | 0.91x |
| 8 | 13.33 | 12.32 | 0.92x | 335.94 | 405.50 | 1.21x |
| 16 | 20.05 | 18.68 | 0.93x | 591.23 | 633.02 | 1.07x |
| 32 | 25.07 | 26.35 | 1.05x | 492.45 | 486.02 | 0.99x |

| Scenario | Concurrency | p95 ms | p99 ms | mean ms | total wall ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| multi-usa | 1 | 20.35 | 22.76 | 11.73 | 234.60 |
| single-iad | 1 | 17.75 | 38.45 | 13.48 | 269.75 |
| multi-usa | 4 | 22.06 | 22.80 | 11.83 | 61.98 |
| single-iad | 4 | 15.57 | 17.11 | 10.55 | 56.24 |
| multi-usa | 8 | 20.94 | 21.96 | 14.10 | 49.32 |
| single-iad | 8 | 24.99 | 29.66 | 14.98 | 59.53 |
| multi-usa | 16 | 29.15 | 31.41 | 19.98 | 31.59 |
| single-iad | 16 | 31.56 | 33.40 | 20.75 | 33.83 |
| multi-usa | 32 | 39.88 | 40.91 | 28.17 | 41.15 |
| single-iad | 32 | 33.16 | 40.10 | 25.82 | 40.61 |

