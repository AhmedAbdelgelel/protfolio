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

<figure class="cache-diagram" role="img" aria-label="A hash map pointing into a doubly linked list ordered from most recently used (head) to least recently used (tail), showing the read and write paths" style="margin:1.75rem 0"><svg viewBox="0 0 640 240" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;font-family:'Geist Mono',ui-monospace,SFMono-Regular,Consolas,monospace;overflow:visible"><text x="0" y="14" style="fill:var(--muted-2);font-size:10px;letter-spacing:1.4px">HASH MAP</text><text x="330" y="14" style="fill:var(--muted-2);font-size:10px;letter-spacing:1.4px">DOUBLY LINKED LIST / LRU ORDER</text><g fill="none" style="stroke:var(--muted-3);stroke-width:1.2"><rect x="0" y="28" width="70" height="26" rx="4"/><rect x="0" y="60" width="70" height="26" rx="4"/><rect x="0" y="92" width="70" height="26" rx="4"/><rect x="0" y="124" width="70" height="26" rx="4"/></g><g style="fill:var(--strong);font-size:11px"><text x="10" y="45">b0</text><text x="10" y="77">b1</text><text x="10" y="109">b2</text></g><text x="10" y="141" style="fill:var(--muted-2);font-size:11px">b3</text><g fill="none" style="stroke:var(--muted-3);stroke-width:1.2"><path d="M70 41 C130 41 150 60 176 70"/><path d="M70 105 C120 105 150 92 176 84"/></g><g style="fill:var(--ink)"><circle cx="70" cy="41" r="2.2"/><circle cx="70" cy="105" r="2.2"/><circle cx="176" cy="70" r="2.2"/><circle cx="176" cy="84" r="2.2"/></g><g fill="none" style="stroke:var(--muted-3);stroke-width:1.2"><rect x="180" y="56" width="96" height="42" rx="6"/><rect x="302" y="56" width="96" height="42" rx="6"/><rect x="424" y="56" width="96" height="42" rx="6"/></g><g style="fill:var(--strong);font-size:12px"><text x="192" y="74">"a"</text><text x="314" y="74">"c"</text><text x="436" y="74">"b"</text></g><g style="fill:var(--muted-2);font-size:9px"><text x="192" y="89">ttl 4s</text><text x="314" y="89">no ttl</text><text x="436" y="89">ttl 12s</text></g><g fill="none" style="stroke:var(--ink);stroke-width:1.4"><path d="M276 70 h22"/><path d="M294 66 l4 4 -4 4"/><path d="M398 70 h22"/><path d="M416 66 l4 4 -4 4"/><path d="M276 84 h-22"/><path d="M258 80 l-4 4 4 4"/><path d="M398 84 h-22"/><path d="M380 80 l-4 4 4 4"/><path d="M180 112 v10"/><path d="M424 112 v10"/></g><g style="fill:var(--ink);font-size:10px"><text x="180" y="126">head · most recent</text><text x="424" y="126">tail · next to evict</text></g><text x="0" y="176" style="fill:var(--muted-2);font-size:10px;letter-spacing:1.4px">READ PATH</text><text x="0" y="196" style="fill:var(--article);font-size:11px">hash(key) → bucket → node (O(1)) → move node to head → return value</text><text x="0" y="216" style="fill:var(--muted-2);font-size:10px;letter-spacing:1.4px">WRITE PATH</text><text x="0" y="236" style="fill:var(--article);font-size:11px">new node at head → if count &gt; capacity, unlink tail → delete its bucket entry</text></svg></figure>

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

<!-- chart -->

Every row is the same engine measured under a different pressure: churn, cold start, large values
and the sweep. That is why the headline number is the small-value, hot-hit row and not a general
claim. The harness prints the Node version and the platform above every scenario, so two numbers
are only comparable within the same run.

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
