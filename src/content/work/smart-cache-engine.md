---
title: "Smart Cache Engine: a Redis-like cache from scratch"
year: 2025
date: "2025-08-01"
metric: "3M+"
metricNote: "ops / second"
summary: "3M+ operations per second on a cache written from scratch"
order: 2
---

A Redis-inspired in-memory cache engine written from scratch in Node.js, with no external
dependencies.

- O(1) LRU eviction over a doubly linked list plus a hashmap, with byte-level memory caps.
- Dual-layer TTL: lazy expiry on read and an active background sweep.
- Redis-style sorted sets with lazy-sort optimisation.
- Stampede guard: 99.9% fewer backend calls when a popular key expires.
- Benchmarked at 3M+ operations per second across ten load scenarios.

[Repository](https://github.com/AhmedAbdelgelel/Cache-engine)
