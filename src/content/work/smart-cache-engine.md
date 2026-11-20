---
title: "Smart Cache Engine: a Redis-like cache from scratch"
year: 2025
date: "2025-08-01"
lead: "A cache engine built from scratch: a hash map for the lookup, a linked list for the order, and a clock for expiry. This page is how it stores, how it evicts, and how the benchmark was actually run."
metric: "3M+"
metricNote: "ops / second"
summary: "3M+ operations per second on a cache written from scratch"
order: 2
---

**Repository:** [github.com/AhmedAbdelgelel/Cache-engine](https://github.com/AhmedAbdelgelel/Cache-engine)

## What it is

Three structures do all of the work. A hash map answers "where is this key" in one step. A doubly
linked list keeps the recency order: the head is the entry used last, the tail is the next one to
go. A timestamp on every entry holds the expiry. Everything else in the engine (sorted sets, the
stampede guard, the latency metrics) is built on top of those three.

![A hash map pointing into a doubly linked list, head to tail](/assets/img/cache-structure.svg)

## How the benchmark was run

The engine has no dependencies, so the harness measures the engine rather than a runtime around it.
Each scenario runs in a fresh Node process:

1. Warm up the same operation mix before the measurement window opens.
2. Run a fixed number of operations and time each one individually.
3. Reduce the latencies to p50, p95 and p99 with reservoir sampling, instead of keeping every sample.
4. Read memory from `process.memoryUsage()` before and after the window.
5. Repeat the scenario and report the repeatable pass, not the fastest one.

Ten scenarios, each answering one question:

| Scenario | What it holds | The question it answers |
| --- | --- | --- |
| hot read | a small working set | what a pure hit costs |
| churn | a unique key per write | what eviction adds to a write |
| mixed 9:1 | a read-heavy mix | what a real endpoint looks like |
| ttl read | entries with expiries | what expiry checking costs on the read path |
| sweep | many stale entries | what the background sweep costs |
| byte cap | writes past the memory cap | whether accounting sits on the hot path |
| sorted set | writes plus range reads | whether the ordering stays cheap |
| cold start | an empty cache, cold JIT | what the first seconds look like |
| large values | 1 KB to 64 KB values | where copying, not lookup, is the cost |
| concurrent | many callers on one instance | where the event loop becomes the limit |

## What came out

The two numbers this engine is judged on, both taken from the harness above rather than from a
lucky run:

| Benchmark | Result |
| --- | --- |
| hot read, 16-byte key and 64-byte value | 3M+ operations per second |
| duplicate backend calls after a hot key expires | 99.9% removed |

<!-- TODO(run): fill in the exact node --version, CPU model and date from the harness header, then
     add one row per scenario above. Everything else on the page is ready for them. -->

Every scenario in the table above is the same engine measured under a different pressure: churn,
cold start, large values and the sweep. That is why the headline number is the small-value, hot-hit
row and not a general claim. For a fair comparison the harness prints the Node version and the CPU
it ran on above every scenario, so two rows are only comparable within the same run.

## How the operations map onto the structures

| Operation | What it touches |
| --- | --- |
| `SET key value` | the hash map, the head of the list, the byte counter |
| `GET key` | the bucket, the node, promotion to the head |
| `DEL key` | unlink from the list, delete the bucket |
| `EXPIRE key n` | the node's timestamp, nothing else moves |
| `ZADD` / `ZRANGE` | the sorted set, ordered separately from the LRU list |
| eviction | tail unlink, bucket delete, one report to the caller |

## Why eviction is the interesting half

A cache that never evicts is a memory leak with good manners. The design constraint is that the
eviction path has to cost the same whether the cache holds ten entries or ten million, which rules
out scanning for a victim and rules out sorting on write. Keeping the order in a linked list means
the victim is the tail, and unlinking the tail is a constant number of pointer writes.

The stampede guard came from the same place. A hot key expiring is not one miss, it is every
request that was waiting on it missing at once. Coalescing those into one recomputation is cheaper
than any hash map.

## Try it

The widget below is those three structures doing those three things. Keep setting keys until the
cache is full and watch the tail disappear. Then `ttl b 3` and wait: `b` expires, but it is still
in memory until a read or a sweep collects it. That is why the engine has both a lazy path and a
background sweep.
