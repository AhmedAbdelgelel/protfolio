/**
 * Architecture maps for the case studies.
 *
 * Geometry lives in a 780x304 view box that is rendered at up to 1000px wide, so the type inside
 * the drawing lands at a readable size instead of shrinking into the text column. Flow steps come
 * from flows.ts (localized); `steps` ties each step to the nodes it lights and the exact edges it
 * animates.
 */
export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  kind?: 'store' | 'external';
}

export interface ArchFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  /** Horizontal offset for the target anchor port (avoids overlapping another edge). */
  toDx?: number;
  /** Horizontal offset for the source anchor port. */
  fromDx?: number;
}

export interface ArchStepState {
  /** Active nodes for this step. The first is the primary focus; the rest are co-active. */
  nodes: string[];
  /** Directed edges `[from, to]` that light up and animate on this step. */
  edges?: Array<[string, string]>;
}

export type Accent = 'blue' | 'amber' | 'emerald' | 'rose';

export interface ArchGraph {
  width: number;
  height: number;
  accent: Accent;
  frames?: ArchFrame[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** 1-to-1 with `flow.steps`. */
  steps: ArchStepState[];
}

const NODE_H = 60;

const relay: ArchGraph = {
  width: 780,
  height: 304,
  accent: 'blue',
  frames: [{ x: 156, y: 40, w: 408, h: 244, label: 'relay gateway' }],
  nodes: [
    { id: 'client', label: 'Client', sub: 'OpenAI SDK', x: 72, y: 96, w: 116 },
    { id: 'admission', label: 'Admission', sub: 'hash + fingerprint', x: 254, y: 96, w: 152 },
    { id: 'exact', label: 'Exact cache', sub: 'Redis or LRU', x: 458, y: 96, w: 156, kind: 'store' },
    { id: 'reply', label: 'Reply', sub: 'with evidence', x: 692, y: 96, w: 128 },
    { id: 'semantic', label: 'Semantic lookup', sub: 'ONNX + pgvector', x: 254, y: 228, w: 156, kind: 'store' },
    { id: 'gate', label: 'Policy gate', sub: 'pure function', x: 458, y: 228, w: 152 },
    { id: 'provider', label: 'Providers', sub: 'single-flight + retry', x: 692, y: 228, w: 132 }
  ],
  edges: [
    { from: 'client', to: 'admission' },
    { from: 'admission', to: 'exact' },
    { from: 'exact', to: 'reply', label: 'hit' },
    { from: 'exact', to: 'semantic', label: 'miss', dashed: true },
    { from: 'semantic', to: 'gate' },
    { from: 'gate', to: 'provider' },
    { from: 'provider', to: 'reply', label: 'stream', dashed: true }
  ],
  steps: [
    // 01 Request: an OpenAI-compatible request arrives
    { nodes: ['client', 'admission'], edges: [['client', 'admission']] },
    // 02 Fingerprint: the request is hashed, the prompt fingerprinted
    { nodes: ['admission', 'exact'], edges: [['client', 'admission'], ['admission', 'exact']] },
    // 03 Exact hit: an exact hit never reaches a model
    { nodes: ['exact', 'reply'], edges: [['admission', 'exact'], ['exact', 'reply']] },
    // 04 Semantic search: a miss becomes a vector search
    { nodes: ['semantic'], edges: [['exact', 'semantic']] },
    // 05 Policy gate: the proposal has to pass the gate
    { nodes: ['gate'], edges: [['semantic', 'gate']] },
    // 06 Upstream: one call upstream, streamed back with its evidence
    { nodes: ['provider', 'reply'], edges: [['gate', 'provider'], ['provider', 'reply']] }
  ]
};

const cache: ArchGraph = {
  width: 780,
  height: 304,
  accent: 'amber',
  frames: [{ x: 154, y: 40, w: 604, h: 244, label: 'cache engine' }],
  nodes: [
    { id: 'http', label: 'HTTP / API', sub: 'GET · SET · TTL', x: 70, y: 96, w: 116 },
    { id: 'service', label: 'Service', sub: 'ops + policy', x: 252, y: 96, w: 146 },
    { id: 'map', label: 'Hash map', sub: 'O(1) lookup', x: 454, y: 96, w: 152, kind: 'store' },
    { id: 'list', label: 'LRU list', sub: 'head to tail', x: 656, y: 96, w: 152, kind: 'store' },
    { id: 'backend', label: 'Backend', sub: 'origin fetcher', x: 70, y: 228, w: 116 },
    { id: 'stampede', label: 'Stampede guard', sub: 'coalesce misses', x: 252, y: 228, w: 152 },
    { id: 'expiry', label: 'Expiry', sub: 'lazy + sweep', x: 454, y: 228, w: 150 },
    { id: 'memory', label: 'Memory cap', sub: 'bytes + evict', x: 656, y: 228, w: 152 }
  ],
  edges: [
    { from: 'http', to: 'service' },
    { from: 'service', to: 'map' },
    { from: 'map', to: 'list' },
    { from: 'service', to: 'stampede', label: 'miss', dashed: true },
    { from: 'stampede', to: 'backend' },
    { from: 'list', to: 'memory', label: 'charge' },
    { from: 'expiry', to: 'list', label: 'sweep', dashed: true, toDx: -36 }
  ],
  steps: [
    // 01 Set: a write arrives through the API and touches two structures at once
    { nodes: ['map', 'list', 'http'], edges: [['http', 'service'], ['service', 'map'], ['map', 'list']] },
    // 02 Order: the list is the age of the data
    { nodes: ['list'], edges: [['map', 'list']] },
    // 03 Account: every entry is charged before it is stored
    { nodes: ['memory'], edges: [['list', 'memory']] },
    // 04 Evict: a full cache drops the tail
    { nodes: ['memory', 'list', 'map'], edges: [['list', 'memory'], ['map', 'list']] },
    // 05 Read: a read is a lookup plus a promotion, a miss is coalesced
    { nodes: ['service', 'map', 'stampede', 'backend'], edges: [['http', 'service'], ['service', 'map'], ['service', 'stampede'], ['stampede', 'backend']] },
    // 06 Expire: TTL is checked lazily, and swept in the background
    { nodes: ['expiry', 'list'], edges: [['expiry', 'list']] }
  ]
};

const epub: ArchGraph = {
  width: 780,
  height: 304,
  accent: 'emerald',
  frames: [{ x: 176, y: 40, w: 568, h: 244, label: 'conversion pipeline' }],
  nodes: [
    { id: 'epub', label: 'EPUB', sub: 'zip archive', x: 80, y: 96, w: 104 },
    { id: 'container', label: 'Container', sub: 'META-INF / OPF', x: 264, y: 96, w: 136 },
    { id: 'spine', label: 'Spine', sub: 'page order', x: 428, y: 96, w: 120 },
    { id: 'pages', label: 'XHTML + CSS', sub: 'per spine item', x: 592, y: 96, w: 148 },
    { id: 'viewport', label: 'Viewport', sub: '1:1 book size', x: 664, y: 228, w: 120 },
    { id: 'render', label: 'Render', sub: 'fonts + print', x: 500, y: 228, w: 128 },
    { id: 'merge', label: 'Merge', sub: 'pdf-lib spine', x: 330, y: 228, w: 124 },
    { id: 'pdf', label: 'PDF + Cleanup', sub: 'output · rm temp', x: 88, y: 228, w: 124, kind: 'store' }
  ],
  edges: [
    { from: 'epub', to: 'container' },
    { from: 'container', to: 'spine' },
    { from: 'spine', to: 'pages' },
    { from: 'pages', to: 'viewport', dashed: true },
    { from: 'viewport', to: 'render' },
    { from: 'render', to: 'merge' },
    { from: 'merge', to: 'pdf' }
  ],
  steps: [
    // 01 Archive: open the book as an archive
    { nodes: ['epub', 'container'], edges: [['epub', 'container']] },
    // 02 Package: the package file gives the spine
    { nodes: ['spine'], edges: [['container', 'spine']] },
    // 03 Page: one spine item at a time
    { nodes: ['pages'], edges: [['spine', 'pages']] },
    // 04 Viewport: the viewport is the page
    { nodes: ['viewport'], edges: [['pages', 'viewport']] },
    // 05 Render: fonts in, page out
    { nodes: ['render'], edges: [['viewport', 'render']] },
    // 06 Assemble: merge in spine order, then clean up
    { nodes: ['merge', 'pdf'], edges: [['render', 'merge'], ['merge', 'pdf']] }
  ]
};

const amen: ArchGraph = {
  width: 780,
  height: 304,
  accent: 'rose',
  frames: [{ x: 310, y: 40, w: 400, h: 244, label: 'story backend' }],
  nodes: [
    { id: 'cart', label: 'Cart', sub: 'story + format', x: 76, y: 96, w: 122 },
    { id: 'stripe', label: 'Stripe', sub: 'checkout', x: 228, y: 96, w: 118, kind: 'external' },
    { id: 'webhook', label: 'Webhook', sub: 'source of truth', x: 402, y: 96, w: 142 },
    { id: 'order', label: 'Order', sub: 'state machine', x: 616, y: 96, w: 142, kind: 'store' },
    { id: 'artist', label: 'Artist queue', sub: 'RBAC assignment', x: 616, y: 228, w: 146 },
    { id: 'gen', label: 'EPUB job', sub: 'async worker', x: 402, y: 228, w: 142 },
    { id: 'delivery', label: 'Delivery', sub: 'book + session', x: 152, y: 228, w: 152 }
  ],
  edges: [
    { from: 'cart', to: 'stripe' },
    { from: 'stripe', to: 'webhook' },
    { from: 'webhook', to: 'order' },
    { from: 'order', to: 'artist', dashed: true },
    { from: 'artist', to: 'gen' },
    { from: 'gen', to: 'delivery' }
  ],
  steps: [
    // 01 Cart: a customer picks a story and a format
    { nodes: ['cart', 'stripe'], edges: [['cart', 'stripe']] },
    // 02 Payment: Stripe takes the money, the webhook closes the loop
    { nodes: ['stripe', 'webhook'], edges: [['cart', 'stripe'], ['stripe', 'webhook']] },
    // 03 Order: the order is the record the rest of the system reads
    { nodes: ['order'], edges: [['webhook', 'order']] },
    // 04 Assign: an artist is assigned and the work is tracked
    { nodes: ['artist'], edges: [['order', 'artist']] },
    // 05 Build: the EPUB is generated from the order
    { nodes: ['gen'], edges: [['artist', 'gen']] },
    // 06 Deliver: the book is delivered and the session is kept alive
    { nodes: ['delivery'], edges: [['gen', 'delivery']] }
  ]
};

export const NODE_HEIGHT = NODE_H;

export const graphs: Record<string, ArchGraph> = {
  relay,
  'smart-cache-engine': cache,
  'epub-to-pdf': epub,
  'amen-stories': amen
};

export const getGraph = (slug: string): ArchGraph | undefined => graphs[slug];
