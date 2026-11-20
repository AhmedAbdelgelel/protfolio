export interface FlowStep {
  label: string;
  title: string;
  body: string;
  notes?: string[];
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
        body:
          'Concurrent identical requests are coalesced into a single in-flight call. Providers are tried in order behind retries and a breaker. The answer streams to the caller while the decision is written back for the control plane.',
        notes: ['single-flight, 50 concurrent calls into one', 'fallback with retries and a circuit breaker', 'per-reply evidence: decision, policy, similarity, cost']
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
