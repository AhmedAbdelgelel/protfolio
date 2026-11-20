---
title: "Amen Stories: the backend of a story bookstore"
year: 2025
date: "2025-02-01"
lead: "A personalised story shop where a customer picks a story, an artist makes it theirs, and the book is generated from the order. I was the backend on the team that built it."
metric: "end to end"
metricNote: "cart to book"
summary: "the whole backend of a personalised story store, from the cart to the generated book"
order: 4
---

## What the product was

A bookstore where the books do not exist yet. A customer picks a story, chooses how it should be
personalised, pays, and a real person writes and illustrates it. Admins run the queue, customers
get a finished book, and the whole thing has to feel like buying something off a shelf.

That shape decides the backend: money first, long work after it, and a lot of state that a person
touches by hand.

## What I built

- **Cart and checkout.** Stripe Checkout for the payment, and the webhook as the source of truth, so
  a refresh or a double click cannot create a second order.
- **The order pipeline.** Once a payment lands, the order becomes the object everything else reads:
  what to build, who writes it, what to send.
- **Artist assignment.** A queue and a status per order, with role-based access so artists see their
  own work and admins see the board.
- **EPUB generation.** Personalised books built by a background job from the order, then stored
  against it. The generation never runs on the request path, so checkout stays fast.
- **Content models.** Multilingual stories, media uploads, and the role split between admins,
  artists and customers.

## How the team worked

Small team, early product, no backend to start from. I was the person who owned the backend end to
end: schema, endpoints, the payment path, the jobs, and the admin surfaces the team used daily. That
meant sitting in the product calls, arguing about what an order actually is before writing one, and
shipping the parts the demo did not need but the first real customer did.

## Why it is the clearest proof of the forward-deployed claim

This is the case study I would show first. The product had no backend, no queue, no payment path
and no admin tooling when I joined it, and it had all of them when I left: written against the
team's real constraints, not against a template.

## Why this belongs in a forward-deployed portfolio

Every part of it was somebody else's business model. The interesting decisions were not "which
framework" but "when does a customer own a book", "what happens if Stripe retries the webhook", and
"who is allowed to see this artwork". That is the job: write the system inside the customer's world,
and stay until the boring parts are boring.
