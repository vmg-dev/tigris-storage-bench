# Tigris placement benchmark summary

Run ID: `tigris-placement-us-random-final-put-same-object-2026-04-08T16-42-28-643Z-ae474c03`
Created: 2026-04-08T16:43:56.054Z
Placements: `single/iad`, `multi/usa`
Object sizes: `1024`, `10240`, `102400` bytes
Concurrencies: `1`, `4`, `8`, `16`, `32`
Iterations: 20
Warmup: 5
List objects per case: 128

Isolation: each operation gets a fresh pair of buckets, one per placement. Each size/concurrency case uses its own key prefix inside those buckets.

Scenario map:
- single-iad: single/iad, bucket=`tigris-placement-us-random-final-put-same-object-single-iad-2f1`
- multi-usa: multi/usa, bucket=`tigris-placement-us-random-final-put-same-object-multi-usa-1af4`

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

