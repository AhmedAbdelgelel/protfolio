<!--
  This file is the About page. "npm run build" renders it into /about.

  meta: {"title":"Ahmed Abdelgelel","description":"Backend engineer in Cairo, forward deployed on client teams: Node.js and TypeScript backends, LLM gateways, and agentic systems that hold up in production."}
-->

![Ahmed Abdelgelel](/assets/img/ahmed.jpg)

I'm a backend engineer in Cairo, and the work I keep choosing is the part that gets harder as a
system grows: caching and eviction, routing between providers, queues that stay correct under
retries, and the difference between an API that works and one that survives its first thousand users.

Most of that curiosity now points at model infrastructure. An agent is only as good as the plumbing
under it, so I spend my time on gateways, retrieval, evaluation, and the caching that makes a loop
affordable to run. Two years of shipping these systems into other people's businesses is where the
interest comes from, and where it gets tested.

## Working inside a team

The work I remember is never the architecture diagram. It's the week after launch. The data doesn't
look like the sample. A provider rate-limits you on a Friday. Someone calls because the invoice total
is off by one cent and it has to be right before Monday.

It means being the engineer on that side of the table. You sit with the customer's team, you write
the software against their data, and you're the one who gets called when it breaks. It's less glamorous than it sounds, which is probably why I'm good at it.

I've done it under different titles. At Penta Studio I was the backend for several client products at
once, and the person on the call when scope moved. At Amen Stories the product had no backend, so I
built one: cart, Stripe, order flows, EPUB generation, artist workflows, admin roles, and then the
parts nobody planned for. At Naqaa Al-Ain I was the only engineer between Cairo and a workshop in
Saudi Arabia. I wrote the orders, invoices, payments and the OCR that reads receipts, and I answered
the questions about them afterwards.

The AI work is the same job with less predictable dependencies. Relay caches and routes model calls,
so a provider going slow doesn't take a product offline on a Friday. That's the work I want to keep doing, on the hook when it breaks.

## Agents, briefly

I build agents that call tools: MCP servers, tool loops, guardrails, and the evals that show whether a
change helped or hurt. The gateway work pays for itself here. A retry against the cache is free. A
retry against the provider is not.

## How I work

I'd rather write the retry logic first and find out on Monday that I didn't need it than ship a clever
abstraction and find out in production. I test before I quote a number. I leave notes behind, because
I don't want the next person to have to call me.

I studied computer science at Mansoura University and worked as a software engineer at Penta Studio in Cairo, which is where
most of this happened.