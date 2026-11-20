<!--
  This file is the About page. "npm run build" renders it into /about.

  meta: {"title":"Ahmed Abdelgelel","description":"Backend engineer in Cairo, forward deployed on client teams: Node.js and TypeScript backends, LLM gateways, and agentic systems that hold up in production."}
-->

![Ahmed Abdelgelel](/assets/img/ahmed.jpg)

I'm a backend engineer in Cairo. For the last two years I've been building the systems other people's
businesses run on: client products at a studio I co-founded, a story-commerce backend for Amen
Stories, an orders and invoicing system for a car-maintenance company in Saudi Arabia.

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

## What I've built

[Relay](/work/relay/) sits in front of model providers, and every request is normalised and hashed
before it goes anywhere. An identical call never reaches a model. A miss is turned into a vector
search over previous answers, and the nearest candidate then has to pass a policy gate before it can
be served: same tenant, same model, same sampling parameters, an unchanged system prompt, a current
policy version, and a similarity above the calibrated threshold. Whatever fails the gate goes
upstream. Once it is upstream, concurrent identical calls are coalesced into one in-flight request,
providers are tried in order behind retries and a breaker, and the answer streams back while it is
stored with the evidence of the decision that produced it.

The [Smart Cache Engine](/work/smart-cache-engine/) is a Redis-like cache I wrote from scratch. O(1)
LRU over a linked list and a hashmap, dual-layer TTL, sorted sets, byte-level memory caps. It runs
3M+ operations per second on my benchmarks, and the stampede guard removes 99.9% of the duplicate
backend calls that pile up when a hot key expires.

[EPUB to PDF](/work/epub-to-pdf/) treats the book as a rendering job rather than a text conversion.
It opens the archive, reads the container and the package file to get the spine, which is the
author's own page order, then works one spine item at a time: set the page viewport to the size the
book declares, load that page's XHTML and its stylesheet, swap in the fonts the book needs, render,
capture. Pages are assembled in spine order into a single document, and the working directory is
removed whether the run succeeded or failed.

Client work sits next to those. At [Amen Stories](/work/amen-stories/) I was the backend half of the small team that built
a story bookstore: customers pick a story, artists make it theirs, and the shop charges them and
hands over a book. I built everything behind that: cart, Stripe payments, the order pipeline,
automated EPUB generation, artist assignment and the admin roles the team ran it with. At Naqaa
Al-Ain I wrote the orders, invoices, payments and OCR receipts for a car-maintenance operator in
Saudi Arabia. At Penta Studio I ran backend architecture for several client products at once, and
the client calls that came with them.

## Agents, briefly

I build agents that call tools: MCP servers, tool loops, guardrails, and the evals that show whether a
change helped or hurt. The gateway work pays for itself here. A retry against the cache is free. A
retry against the provider is not.

## Experience

- **Software Engineer, Penta Studio** (remote, Dec 2025 to Nov 2026). Backend architecture for client products, several at once. The design, the APIs, the integrations, and the calls with the people paying for them.
- **Backend Developer, Amen Stories** (Feb 2025 to Oct 2026, remote). Backend on the team that built a personalised story bookstore: cart, Stripe, the order pipeline, generated EPUBs, artist assignment, admin roles.
- **Freelance Backend Developer, Naqaa Al-Ain** (Apr to Aug 2025, Saudi Arabia). Orders, invoices, payments, auth and OCR receipts for a car-maintenance operator. One engineer, one client, four months.

## How I work

I'd rather write the retry logic first and find out on Monday that I didn't need it than ship a clever
abstraction and find out in production. I test before I quote a number. I leave notes behind, because
I don't want the next person to have to call me.

I studied computer science at Mansoura University and co-founded Penta Studio in Cairo, which is where
most of this happened.

## Stack

TypeScript, JavaScript, Go, C++, Python, Java. Node.js, Express, NestJS, Fastify. Kafka, RabbitMQ.
PostgreSQL, MongoDB, MySQL, pgvector, Redis. Docker, Azure, CI/CD, Linux, Git.

## Contact

I'm looking for backend roles, remote or in Cairo.

- [ahmed4bdelgelel@gmail.com](mailto:ahmed4bdelgelel@gmail.com)
- [+20 102 665 7839](tel:+201026657839)
- [GitHub](https://github.com/AhmedAbdelgelel) · [LinkedIn](https://www.linkedin.com/in/ahmed-abdelgelel-6aa523283/)
- [Résumé (PDF)](/assets/cv/AhmedAbdelgelel.pdf)