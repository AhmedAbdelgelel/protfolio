/**
 * Architecture graphs for the case studies.
 *
 * Geometry is in a fixed 1000x320 view box; the SVG scales with the column. Steps come from
 * flows.ts (localized); `stepNodes` maps each step to the node it focuses on, so clicking a
 * node and reading a step are the same action.
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

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  /** secondary edges are routed below the spine */
  soft?: boolean;
}

export interface ArchGraph {
  width: number;
  height: number;
  nodes: ArchNode[];
  edges: ArchEdge[];
  stepNodes: string[];
}

const relay: ArchGraph = {
  width: 1000,
  height: 268,
  nodes: [
    { id: 'client', label: 'Client', sub: 'OpenAI SDK', x: 78, y: 74, w: 104 },
    { id: 'admission', label: 'Admission', sub: 'key + validate', x: 226, y: 74, w: 124 },
    { id: 'exact', label: 'Exact cache', sub: 'Redis or LRU', x: 392, y: 74, w: 126, kind: 'store' },
    { id: 'semantic', label: 'Semantic lookup', sub: 'embed + vectors', x: 286, y: 210, w: 150, kind: 'store' },
    { id: 'gate', label: 'Policy gate', sub: 'pure function', x: 474, y: 210, w: 126 },
    { id: 'provider', label: 'Providers', sub: 'route + retry', x: 650, y: 210, w: 122 },
    { id: 'store', label: 'Store', sub: 'both layers', x: 806, y: 210, w: 96, kind: 'store' },
    { id: 'reply', label: 'Reply', sub: 'with evidence', x: 880, y: 74, w: 118 }
  ],
  edges: [
    { from: 'client', to: 'admission' },
    { from: 'admission', to: 'exact' },
    { from: 'exact', to: 'reply', label: 'hit' },
    { from: 'exact', to: 'semantic', label: 'miss', dashed: true },
    { from: 'semantic', to: 'gate' },
    { from: 'gate', to: 'provider' },
    { from: 'provider', to: 'store' },
    { from: 'store', to: 'reply', dashed: true }
  ],
  stepNodes: ['client', 'exact', 'exact', 'semantic', 'gate', 'provider']
};

const cache: ArchGraph = {
  width: 1000,
  height: 286,
  nodes: [
    { id: 'http', label: 'HTTP', sub: 'POST /cache', x: 80, y: 76, w: 106 },
    { id: 'route', label: 'Route', sub: 'Express', x: 222, y: 76, w: 102 },
    { id: 'service', label: 'Service', sub: 'ops + policy', x: 372, y: 76, w: 108 },
    { id: 'map', label: 'Hash map', sub: 'O(1) lookup', x: 562, y: 76, w: 118, kind: 'store' },
    { id: 'list', label: 'LRU list', sub: 'head to tail', x: 744, y: 76, w: 112, kind: 'store' },
    { id: 'backend', label: 'Backend', sub: 'fetcher', x: 168, y: 208, w: 104 },
    { id: 'stampede', label: 'Stampede guard', sub: 'one miss', x: 372, y: 208, w: 140 },
    { id: 'memory', label: 'Memory cap', sub: 'bytes, evict', x: 562, y: 208, w: 118 },
    { id: 'expiry', label: 'Expiry', sub: 'lazy + sweep', x: 744, y: 208, w: 112 }
  ],
  edges: [
    { from: 'http', to: 'route' },
    { from: 'route', to: 'service' },
    { from: 'service', to: 'map' },
    { from: 'map', to: 'list' },
    { from: 'service', to: 'stampede', label: 'miss', dashed: true },
    { from: 'stampede', to: 'backend' },
    { from: 'backend', to: 'service', dashed: true, soft: true },
    { from: 'map', to: 'memory', label: 'charge' },
    { from: 'memory', to: 'list', label: 'evict', dashed: true, soft: true },
    { from: 'expiry', to: 'list', label: 'sweep', dashed: true, soft: true }
  ],
  stepNodes: ['map', 'list', 'memory', 'list', 'map', 'expiry']
};

const epub: ArchGraph = {
  width: 1000,
  height: 272,
  nodes: [
    { id: 'epub', label: 'EPUB', sub: 'zip archive', x: 70, y: 74, w: 104 },
    { id: 'container', label: 'Container', sub: 'OPF path', x: 208, y: 74, w: 112 },
    { id: 'spine', label: 'Spine', sub: 'page order', x: 348, y: 74, w: 102 },
    { id: 'pages', label: 'XHTML + CSS', sub: 'per page', x: 500, y: 74, w: 124 },
    { id: 'viewport', label: 'Viewport', sub: 'book size', x: 654, y: 74, w: 110 },
    { id: 'render', label: 'Render', sub: 'fonts + print', x: 806, y: 74, w: 116 },
    { id: 'merge', label: 'Merge', sub: 'in spine order', x: 806, y: 212, w: 118 },
    { id: 'pdf', label: 'PDF', sub: 'one document', x: 654, y: 212, w: 104, kind: 'store' },
    { id: 'cleanup', label: 'Cleanup', sub: 'temp dir', x: 500, y: 212, w: 108 }
  ],
  edges: [
    { from: 'epub', to: 'container' },
    { from: 'container', to: 'spine' },
    { from: 'spine', to: 'pages' },
    { from: 'pages', to: 'viewport' },
    { from: 'viewport', to: 'render' },
    { from: 'render', to: 'merge', dashed: true },
    { from: 'merge', to: 'pdf' },
    { from: 'pdf', to: 'cleanup', dashed: true, soft: true }
  ],
  stepNodes: ['container', 'spine', 'pages', 'viewport', 'render', 'merge']
};

const amen: ArchGraph = {
  width: 1000,
  height: 272,
  nodes: [
    { id: 'cart', label: 'Cart', sub: 'story + format', x: 70, y: 74, w: 108 },
    { id: 'stripe', label: 'Stripe', sub: 'checkout', x: 210, y: 74, w: 100, kind: 'external' },
    { id: 'webhook', label: 'Webhook', sub: 'source of truth', x: 356, y: 74, w: 122 },
    { id: 'order', label: 'Order', sub: 'state machine', x: 512, y: 74, w: 106, kind: 'store' },
    { id: 'artist', label: 'Artist queue', sub: 'assignment', x: 664, y: 74, w: 124 },
    { id: 'gen', label: 'EPUB job', sub: 'background', x: 812, y: 74, w: 112 },
    { id: 'delivery', label: 'Delivery', sub: 'download', x: 812, y: 212, w: 112 },
    { id: 'roles', label: 'Roles', sub: 'admin / artist / customer', x: 640, y: 212, w: 190 },
    { id: 'events', label: 'Events', sub: 'order timeline', x: 470, y: 212, w: 110, kind: 'store' }
  ],
  edges: [
    { from: 'cart', to: 'stripe' },
    { from: 'stripe', to: 'webhook' },
    { from: 'webhook', to: 'order' },
    { from: 'order', to: 'artist' },
    { from: 'artist', to: 'gen' },
    { from: 'gen', to: 'delivery', dashed: true },
    { from: 'order', to: 'events', dashed: true, soft: true },
    { from: 'roles', to: 'order', dashed: true, soft: true }
  ],
  stepNodes: ['cart', 'stripe', 'order', 'artist', 'gen', 'delivery']
};

export const graphs: Record<string, ArchGraph> = {
  relay,
  'smart-cache-engine': cache,
  'epub-to-pdf': epub,
  'amen-stories': amen
};

export const getGraph = (slug: string): ArchGraph | undefined => graphs[slug];
