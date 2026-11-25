---
title: "Relay: a gateway that decides when a cached answer may be reused"
lead: "Most LLM gateways cache on similarity. Relay caches on policy."
year: 2026
date: "2026-02-01"
metric: "50 → 1"
metricNote: "calls → 1 request"
summary: "50 concurrent identical calls collapse into one upstream request"
order: 1
---

## The shortcut everyone takes

A semantic cache does three things. It embeds the prompt, looks for a close neighbour, and if the
distance is small enough it serves the neighbour instead of calling the model. It is a good trick, and
in most gateways I have read, it is the whole trick.

It also has a failure mode that is rarely written down. The cache knows that two prompts look alike. It
does not know who asked, which model was requested, whether the system prompt changed this morning, or
whether the last time this policy fired it saved money or cost money. When it is wrong it is wrong
silently, and there is nothing to show the customer who received yesterday's answer.

## Two decisions, not one

Relay splits the decision in half.

1. An exact hit is a hash of the normalised request. If it hits, the answer is the answer.
2. A semantic hit is a candidate. It has to pass the reuse gate before anything is served.

The gate is pure: same inputs, same decision. No network calls, no model calls, no shared state. That
makes it unit-testable, and it makes every result explainable after the fact.

## What the gate checks

| Dimension | Why it is in the gate |
| --- | --- |
| tenant | a cached answer never crosses a customer boundary |
| provider and model | the same prompt sent to a different model is a different answer |
| temperature and max_tokens | sampling and truncation change what "the same answer" even means |
| system prompt fingerprint | the instructions changed, so the cache is stale |
| policy version | bumping the policy invalidates everything it used to allow |
| similarity threshold | the last line of defence, not the first |

Similarity is one row in that table. In a similarity-only cache it is the entire decision.

## Calibration, not a feeling

The threshold is not a number I liked the look of. I built a labelled set of request pairs and swept
both thresholds (exact and semantic) against two numbers: precision, meaning how often a reuse would
have been wrong, and cost, meaning what each reuse saved. The gate ships with the point where precision
stops improving and cost stops falling. Anything above it saves more money and starts costing trust.

## The plumbing that makes it hold

- Embeddings run in process with ONNX. Embedding a prompt is a function call, not a network hop.
- PostgreSQL with pgvector holds the neighbours. Redis serves the exact hits.
- Single-flight collapses 50 concurrent identical requests into one upstream call.
- SSE passes straight through, so streaming still streams.
- Provider fallback with retries and a circuit breaker, so a degraded provider is invisible to the caller.
- Docker and Compose bring the whole thing up with one command.

## Evidence, per reply

The Next.js control plane shows, for every reply, which decision was taken (miss, exact, semantic), the
policy that allowed it, the similarity that was accepted, and the cost it saved. If somebody asks why
they got a particular answer, the answer is on the screen.

## Why this shape

An agent loop retries. It re-asks the same prompt, or one that is trivially different, dozens of times a
minute. A gateway that cannot tell a retry from a new request turns a bad minute into a bill. A gateway
that can tell them apart is the difference between an agent that is cheap to run and one that is not.

## What Relay changed about how I engineer

Relay moved my unit of design from the endpoint to the decision. An AI feature is not finished when a
provider returns `200`. The system still has to define when an answer may be reused, which context makes
two requests different, what happens when a dependency fails, and how an operator reconstructs the result
later.

That changes where the engineering effort goes. Tenant isolation and prompt identity become executable
policy instead of assumptions in a design document. Thresholds come from labelled examples and measured
cost, not intuition. Tests include broken cache dependencies and malformed provider responses, and the
evidence panel is designed with the request path rather than added after an incident.

Model quality still matters. Production software determines whether that quality reaches a customer
safely, affordably, and repeatedly.

## How this translates to forward-deployed engineering

Forward-deployed work starts inside a customer's workflow, not with a preferred architecture. The same
method transfers: sit with the operators, find the expensive or fragile decision, make its boundaries
explicit, ship the smallest end-to-end path against real data, instrument it, and iterate when reality
disagrees with the demo.

Relay's gateway is one expression of that method. Another customer may need a document pipeline, a
tool-using agent, or an integration with a system they already run. The stack changes; the engineering
contract does not: explicit policy, safe degradation, measurable outcomes, and an operating surface the
customer can use after handoff.

That is the work I want to do: close enough to the customer to understand what should change, and
responsible for the unglamorous details after deployment.

[Repository](https://github.com/AhmedAbdelgelel/Relay)