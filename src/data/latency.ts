/**
 * Numbers from the cache engine's own harness, measured on this machine.
 *
 * Source: E:/Smart-caching-engine/benchmark/benchmark.js (throughput + value sizes) and a
 * percentile pass over the same LRUCache API using the same hrtime clock.
 * Environment: Node v22.23.2, win32 x64, 60,000 operations per row.
 */
export const environment = {
  node: 'v22.23.2',
  platform: 'win32 x64',
  opsPerRow: 60000
};

export interface Row {
  key: string;
  label: string;
  detail: string;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

/** Microseconds per operation. */
export const latency: Row[] = [
  { key: 'get-hit', label: 'get', detail: 'hit', p50: 0.3, p90: 0.7, p95: 0.8, p99: 1.5 },
  { key: 'get-miss', label: 'get', detail: 'miss', p50: 0.2, p90: 0.4, p95: 0.5, p99: 0.9 },
  { key: 'set', label: 'set', detail: 'insert', p50: 0.7, p90: 1.2, p95: 1.5, p99: 2.4 },
  { key: 'delete', label: 'delete', detail: 'unlink', p50: 0.2, p90: 0.5, p95: 0.7, p99: 1.1 },
  { key: 'evict', label: 'set', detail: 'with eviction', p50: 0.5, p90: 0.5, p95: 0.6, p99: 1.1 }
];

export const throughput = {
  mixed: 3011014,
  zipfian: 1987029,
  baseline: 1220877
};

/** Operations per second by value size, from the harness. */
export const valueSizes = [
  { label: '8 B', ops: 2405118 },
  { label: '128 B', ops: 2430016 },
  { label: '1 KB', ops: 636574 },
  { label: '10 KB', ops: 91694 },
  { label: '100 KB', ops: 9391 }
];
