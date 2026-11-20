export interface FlowStep {
  label: string;
  title: string;
  body: string;
  notes?: string[];
  /** An optional number or fact pinned to the step, shown as a chip. */
  metric?: string;
}

export interface Flow {
  title: string;
  hint: string;
  steps: FlowStep[];
}

export const flows: Record<string, Flow> = {
  relay: {
    title: 'How the request moves',
    hint: 'Click a step',
    steps: [
      {
        label: 'Request',
        title: 'An OpenAI-compatible request arrives',
        body:
          'Clients keep the provider SDK they already use and change a base URL. The body is normalised into a stable shape: tenant, provider, model, sampling parameters and messages.',
        notes: ['POST /v1/chat/completions', 'Streaming and non-streaming take the same path']
      },
      {
        label: 'Fingerprint',
        title: 'The request is hashed, the prompt fingerprinted',
        body:
          'The normalised body becomes a hash for exact lookups. The system prompt is fingerprinted separately, because it changes far more often than the user message and invalidates everything it touches.',
        notes: ['hash of the normalised body', 'separate fingerprint for the system prompt']
      },
      {
        label: 'Exact hit',
        title: 'An exact hit never reaches a model',
        body:
          'If the hash is known and its policy version is current, the stored answer comes back with the evidence of that decision. The cost of the request is one cache read.',
        notes: ['served from Redis', 'reuse still recorded, so it can be audited']
      },
      {
        label: 'Semantic search',
        title: 'A miss becomes a vector search',
        body:
          'The prompt is embedded in process and compared against previous answers for the same tenant and model. The nearest neighbour is not an answer yet. It is a proposal.',
        notes: ['embedding computed in process', 'neighbours from pgvector, scoped by tenant and model']
      },
      {
        label: 'Policy gate',
        title: 'The proposal has to pass the gate',
        body:
          'A pure function decides whether the two requests are genuinely equivalent. Same inputs, same decision: no model calls, no network, no shared state, so it can be tested and explained.',
        notes: [
          'tenant, provider and model',
          'temperature and max_tokens',
          'system prompt fingerprint and policy version',
          'similarity above the calibrated threshold'
        ]
      },
      {
        label: 'Upstream',
        title: 'One call upstream, streamed back with its evidence',
        metric: '50 → 1',
        body:
          'Concurrent identical requests are coalesced into a single in-flight call. Providers are tried in order behind retries and a breaker. The answer streams to the caller while the decision is written back for the control plane.',
        notes: ['single-flight, 50 concurrent calls into one', 'fallback with retries and a circuit breaker', 'per-reply evidence: decision, policy, similarity, cost']
      }
    ]
  },
  'smart-cache-engine': {
    title: 'How a key moves through the cache',
    hint: 'Click a step',
    steps: [
      {
        label: 'Set',
        title: 'A write touches two structures at once',
        body:
          'A new entry goes into the hash map for the O(1) lookup and into the head of the linked list for the ordering. One of them alone gives you a cache that is fast but cannot evict, or one that evicts but must scan to find a key.',
        metric: 'O(1)',
        notes: ['hash map: key to node', 'linked list: recency order', 'both are updated in the same operation']
      },
      {
        label: 'Order',
        title: 'The list is the age of the data',
        body:
          'The node at the head is the most recently used, the node at the tail is next to go. Every read or write moves a node to the head, which is a handful of pointer assignments and never a search.',
        notes: ['head = most recently used', 'tail = least recently used', 'promotion is pointer work, not a sort']
      },
      {
        label: 'Account',
        title: 'Every entry is charged before it is stored',
        body:
          'Keys, values and overhead are counted in bytes. When a write would cross the memory cap, the cache does not throw: it makes room. That is the difference between a cache and a dictionary.',
        notes: ['byte-level accounting, not entry counts', 'the cap is enforced on write', 'the caller sees a normal put']
      },
      {
        label: 'Evict',
        title: 'A full cache drops the tail',
        body:
          'The least recently used node is unlinked from both ends of the list in constant time and its bucket entry is deleted in the same step. Nothing is scanned, so eviction does not get slower as the cache fills.',
        metric: 'O(1)',
        notes: ['unlink tail, delete bucket', 'no scan, no sort', 'the evicted key is reported so the caller can tell']
      },
      {
        label: 'Read',
        title: 'A read is a lookup plus a promotion',
        body:
          'The bucket points straight at the node. On a hit the node moves to the head and the value is returned. On a miss there is nothing to promote and the caller decides what to do next.',
        notes: ['hit: O(1) lookup, move node', 'miss: returns nothing, never a wrong value']
      },
      {
        label: 'Expire',
        title: 'TTL is checked lazily, and swept in the background',
        body:
          'Each node carries an expiry timestamp. Reads treat an expired node as a miss and unlink it there and then. A background sweep walks part of the list on an interval so expired entries do not occupy memory until someone asks for them.',
        notes: ['lazy expiry on read', 'active sweep in the background', 'expired is a miss, never a stale answer']
      }
    ]
  },
  'amen-stories': {
    title: 'How an order becomes a book',
    hint: 'Click a step',
    steps: [
      {
        label: 'Cart',
        title: 'A customer picks a story and a format',
        body:
          'The store sells personalised stories. A cart holds the book, the format and the personalisation choices, and it is the first place where the product rules live.',
        notes: ['multilingual catalogue', 'format and personalisation carried through the order']
      },
      {
        label: 'Payment',
        title: 'Stripe takes the money, the webhook closes the loop',
        body:
          'Checkout runs in Stripe. The backend treats the webhook as the source of truth, so a refresh or a double click cannot create a second order.',
        notes: ['Stripe Checkout', 'webhook-driven state, not client callbacks']
      },
      {
        label: 'Order',
        title: 'The order is the record the rest of the system reads',
        body:
          'Once paid, the order becomes the object that every background job works from: what to build, who writes it, what to send. Idempotency lives here, not in the UI.',
        notes: ['one order per payment', 'status transitions drive the jobs']
      },
      {
        label: 'Assign',
        title: 'An artist is assigned and the work is tracked',
        body:
          'Personalised stories need a human. Artist assignment, workload and status live in the admin side, with role-based access so artists only see their queue and admins see everything.',
        notes: ['artist queue and status', 'role-based access for admins, artists, customers']
      },
      {
        label: 'Build',
        title: 'The EPUB is generated from the order',
        body:
          'A background job builds the book from the chosen story, language and personalisation, then stores the file against the order. Long work leaves the request path, so checkout stays fast.',
        notes: ['generation off the request path', 'the file is attached to the order']
      },
      {
        label: 'Deliver',
        title: 'The book is delivered and the session is kept alive',
        body:
          'The customer gets the finished book, and the same background layer keeps sessions and order state healthy afterwards, which is the part nobody sees until it stops working.',
        notes: ['delivery tied to the order', 'background jobs for session upkeep']
      }
    ]
  },
  'epub-to-pdf': {
    title: 'How a book becomes a PDF',
    hint: 'Click a step',
    steps: [
      {
        label: 'Archive',
        title: 'Open the book as an archive',
        body:
          'An EPUB is a ZIP with rules. The pipeline reads the container first to find the package document, instead of guessing at file names.',
        notes: ['unpack in a working directory', 'container.xml points at the package file']
      },
      {
        label: 'Package',
        title: 'The package file gives the spine',
        body:
          'The package document lists the manifest and the spine. The spine is the author\'s own page order, and it becomes the render queue. The declared page size comes from the same document.',
        notes: ['spine order, not alphabetical order', 'manifest maps ids to files', 'page size read from the book metadata']
      },
      {
        label: 'Page',
        title: 'One spine item at a time',
        body:
          'Each page is loaded with its own XHTML and its own stylesheet. Nothing is merged or reflowed across pages, because that is how fixed-layout books break.',
        notes: ['XHTML parsed per page', 'publisher CSS respected']
      },
      {
        label: 'Viewport',
        title: 'The viewport is the page',
        body:
          'The rendering viewport is set to the size the book declares. One page, one viewport, no scaling, so positions on screen are positions on paper.',
        notes: ['exact viewport, no scale factor', 'a page is a page, not a reflowed approximation']
      },
      {
        label: 'Render',
        title: 'Fonts in, page out',
        body:
          'Fonts are injected or replaced before the capture, and a small set of CSS overrides fixes the cases where the publisher stylesheet assumes a screen rather than a print target.',
        notes: ['@font-face injection with replacement', 'global CSS overrides', 'capture at print density']
      },
      {
        label: 'Assemble',
        title: 'Merge in spine order, then clean up',
        body:
          'Pages are assembled into a single document in spine order and written out. The working directory is removed on success and on failure, so a batch run cannot fill the disk.',
        notes: ['merge with pdf-lib', 'batch a shelf, not a file', 'cleanup always runs']
      }
    ]
  }
};