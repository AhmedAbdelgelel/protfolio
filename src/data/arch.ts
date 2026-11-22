/**
 * Architecture maps for the case studies.
 *
 * Geometry lives in a 760x330 view box that is rendered at up to 1000px wide, so the type inside
 * the drawing lands at a readable size instead of shrinking into the text column. Flow steps come
 * from flows.ts (localized); `stepNodes` ties each step to the node it is about.
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
}

export interface ArchGraph {
  width: number;
  height: number;
  frames?: ArchFrame[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  stepNodes: string[];
}

const NODE_H = 58;

const relay: ArchGraph = {
  width: 760,
  height: 292,
  frames: [{ x: 152, y: 44, w: 378, h: 246, label: 'relay gateway' }],
  nodes: [
    { id: 'client', label: 'Client', sub: 'OpenAI SDK', x: 70, y: 92, w: 112 },
    { id: 'admission', label: 'Admission', sub: 'key + validate', x: 245, y: 92, w: 146 },
    { id: 'exact', label: 'Exact cache', sub: 'Redis or LRU', x: 432, y: 92, w: 158, kind: 'store' },
    { id: 'reply', label: 'Reply', sub: 'with evidence', x: 664, y: 92, w: 120 },
    { id: 'semantic', label: 'Semantic lookup', sub: 'embed + vectors', x: 245, y: 232, w: 156, kind: 'store' },
    { id: 'gate', label: 'Policy gate', sub: 'pure function', x: 432, y: 232, w: 150 },
    { id: 'provider', label: 'Providers', sub: 'route + retry', x: 664, y: 232, w: 120 }
  ],
  edges: [
    { from: 'client', to: 'admission' },
    { from: 'admission', to: 'exact' },
    { from: 'exact', to: 'reply', label: 'hit' },
    { from: 'exact', to: 'semantic', label: 'miss', dashed: true },
    { from: 'semantic', to: 'gate' },
    { from: 'gate', to: 'provider' },
    { from: 'provider', to: 'reply', label: 'answer', dashed: true }
  ],
  stepNodes: ['client', 'exact', 'exact', 'semantic', 'gate', 'provider']
};

const cache: ArchGraph = {
  width: 760,
  height: 292,
  frames: [{ x: 150, y: 44, w: 556, h: 246, label: 'cache engine' }],
  nodes: [
    { id: 'http', label: 'HTTP', sub: 'POST /cache', x: 68, y: 92, w: 112 },
    { id: 'service', label: 'Service', sub: 'ops + policy', x: 245, y: 92, w: 146 },
    { id: 'map', label: 'Hash map', sub: 'O(1) lookup', x: 432, y: 92, w: 156, kind: 'store' },
    { id: 'list', label: 'LRU list', sub: 'head to tail', x: 616, y: 92, w: 148, kind: 'store' },
    { id: 'backend', label: 'Backend', sub: 'fetcher', x: 68, y: 232, w: 116 },
    { id: 'stampede', label: 'Stampede guard', sub: 'one miss', x: 245, y: 232, w: 152 },
    { id: 'expiry', label: 'Expiry', sub: 'lazy + sweep', x: 432, y: 232, w: 150 },
    { id: 'memory', label: 'Memory cap', sub: 'bytes, evict', x: 616, y: 232, w: 148 }
  ],
  edges: [
    { from: 'http', to: 'service' },
    { from: 'service', to: 'map' },
    { from: 'map', to: 'list' },
    { from: 'service', to: 'stampede', label: 'miss', dashed: true },
    { from: 'stampede', to: 'backend' },
    { from: 'list', to: 'memory', label: 'charge' },
    { from: 'expiry', to: 'list', label: 'sweep', dashed: true }
  ],
  stepNodes: ['map', 'list', 'memory', 'list', 'map', 'expiry']
};

const epub: ArchGraph = {
  width: 760,
  height: 300,
  nodes: [
    { id: 'epub', label: 'EPUB', sub: 'zip archive', x: 75, y: 95, w: 130 },
    { id: 'container', label: 'Container', sub: 'OPF path', x: 220, y: 95, w: 140 },
    { id: 'spine', label: 'Spine', sub: 'page order', x: 360, y: 95, w: 120 },
    { id: 'pages', label: 'XHTML + CSS', sub: 'per page', x: 505, y: 95, w: 150 },
    { id: 'viewport', label: 'Viewport', sub: 'book size', x: 655, y: 95, w: 130 },
    { id: 'render', label: 'Render', sub: 'fonts + print', x: 655, y: 235, w: 130 },
    { id: 'merge', label: 'Merge', sub: 'in spine order', x: 500, y: 235, w: 140 },
    { id: 'pdf', label: 'PDF', sub: 'one document', x: 345, y: 235, w: 120, kind: 'store' },
    { id: 'cleanup', label: 'Cleanup', sub: 'temp dir', x: 190, y: 235, w: 130 }
  ],
  edges: [
    { from: 'epub', to: 'container' },
    { from: 'container', to: 'spine' },
    { from: 'spine', to: 'pages' },
    { from: 'pages', to: 'viewport' },
    { from: 'viewport', to: 'render', dashed: true },
    { from: 'render', to: 'merge' },
    { from: 'merge', to: 'pdf' },
    { from: 'pdf', to: 'cleanup', dashed: true }
  ],
  stepNodes: ['container', 'spine', 'pages', 'viewport', 'render', 'merge']
};

const amen: ArchGraph = {
  width: 760,
  height: 300,
  nodes: [
    { id: 'cart', label: 'Cart', sub: 'story + format', x: 75, y: 95, w: 130 },
    { id: 'stripe', label: 'Stripe', sub: 'checkout', x: 220, y: 95, w: 120, kind: 'external' },
    { id: 'webhook', label: 'Webhook', sub: 'source of truth', x: 365, y: 95, w: 140 },
    { id: 'order', label: 'Order', sub: 'state machine', x: 515, y: 95, w: 130, kind: 'store' },
    { id: 'artist', label: 'Artist queue', sub: 'assignment', x: 655, y: 95, w: 130 },
    { id: 'gen', label: 'EPUB job', sub: 'background', x: 655, y: 235, w: 130 },
    { id: 'delivery', label: 'Delivery', sub: 'download + session', x: 500, y: 235, w: 150 }
  ],
  edges: [
    { from: 'cart', to: 'stripe' },
    { from: 'stripe', to: 'webhook' },
    { from: 'webhook', to: 'order' },
    { from: 'order', to: 'artist' },
    { from: 'artist', to: 'gen', dashed: true },
    { from: 'gen', to: 'delivery' }
  ],
  stepNodes: ['cart', 'stripe', 'order', 'artist', 'gen', 'delivery']
};

export const NODE_HEIGHT = NODE_H;

export const graphs: Record<string, ArchGraph> = {
  relay,
  'smart-cache-engine': cache,
  'epub-to-pdf': epub,
  'amen-stories': amen
};

export const getGraph = (slug: string): ArchGraph | undefined => graphs[slug];
