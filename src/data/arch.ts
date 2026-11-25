/**
 * Architecture maps for the case studies.
 *
 * Each project uses its own non-grid topology with explicit semantic node kinds, multi-zone
 * swimlane frames, orthogonal waypoints for feedback/safety rails, and scenario presets.
 * Flow copy and mono traces come from flows.ts (localized); `steps` ties each step to the
 * nodes it lights and the exact edges it animates.
 */
export type NodeKind =
  | 'client'
  | 'service'
  | 'store'
  | 'gate'
  | 'queue'
  | 'worker'
  | 'external'
  | 'stream';

export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: NodeKind;
  tag?: string;
}

export interface ArchFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: 'subtle' | 'accent';
}

export type EdgeSide = 'l' | 'r' | 't' | 'b';

export interface ArchEdge {
  from: string;
  to: string;
  fromSide?: EdgeSide;
  toSide?: EdgeSide;
  fromDx?: number;
  toDx?: number;
  fromDy?: number;
  toDy?: number;
  waypoints?: Array<{ x: number; y: number }>;
  label?: string;
  labelPos?: { x: number; y: number };
  dashed?: boolean;
  variant?: 'primary' | 'branch' | 'feedback';
}

export interface ArchScenario {
  id: string;
  labelEn: string;
  labelAr: string;
  stepIndex: number;
  badge?: string;
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
  scenarios?: ArchScenario[];
  /** 1-to-1 with `flow.steps`. */
  steps: ArchStepState[];
}

const NODE_H = 64;

const relay: ArchGraph = {
  width: 940,
  height: 440,
  accent: 'blue',
  frames: [
    { x: 12, y: 32, w: 128, h: 120, label: 'Ingress', tone: 'subtle' },
    { x: 162, y: 32, w: 382, h: 120, label: 'Hot Exact Path (<2ms)', tone: 'accent' },
    { x: 178, y: 172, w: 590, h: 112, label: 'Semantic & Policy Plane', tone: 'subtle' },
    { x: 492, y: 308, w: 420, h: 112, label: 'Upstream Resilience', tone: 'subtle' }
  ],
  nodes: [
    { id: 'client', label: 'Client', sub: 'OpenAI SDK', x: 76, y: 100, w: 112, kind: 'client', tag: 'SDK' },
    { id: 'normalizer', label: 'Normalizer', sub: 'body + sys hash', x: 246, y: 100, w: 136, kind: 'service', tag: 'SHA-256' },
    { id: 'exact', label: 'Exact cache', sub: 'Redis / LRU', x: 454, y: 100, w: 148, kind: 'store', tag: '<2ms' },
    { id: 'reply', label: 'SSE Reply', sub: 'stream + evidence', x: 852, y: 100, w: 116, kind: 'stream', tag: 'SSE' },
    { id: 'embed', label: 'ONNX Embed', sub: 'in-process vec', x: 254, y: 236, w: 132, kind: 'worker', tag: '384-d' },
    { id: 'pgvector', label: 'pgvector', sub: 'tenant + model', x: 448, y: 236, w: 140, kind: 'store', tag: 'HNSW' },
    { id: 'gate', label: 'Policy gate', sub: 'pure decision', x: 682, y: 236, w: 140, kind: 'gate', tag: '6 rules' },
    { id: 'singleflight', label: 'Single-flight', sub: 'coalesce key', x: 632, y: 372, w: 136, kind: 'queue', tag: '50->1' },
    { id: 'providers', label: 'Providers', sub: 'retry + breaker', x: 830, y: 372, w: 136, kind: 'external', tag: 'circuit' }
  ],
  edges: [
    { from: 'client', to: 'normalizer', fromSide: 'r', toSide: 'l' },
    { from: 'normalizer', to: 'exact', fromSide: 'r', toSide: 'l' },
    {
      from: 'exact',
      to: 'reply',
      fromSide: 'r',
      toSide: 'l',
      label: 'exact hit',
      labelPos: { x: 662, y: 88 }
    },
    {
      from: 'exact',
      to: 'embed',
      fromSide: 'b',
      fromDx: -20,
      toSide: 'l',
      waypoints: [
        { x: 434, y: 162 },
        { x: 156, y: 162 },
        { x: 156, y: 236 }
      ],
      label: 'miss',
      labelPos: { x: 156, y: 198 },
      dashed: true,
      variant: 'branch'
    },
    {
      from: 'embed',
      to: 'pgvector',
      fromSide: 'r',
      toSide: 'l',
      label: 'vector',
      labelPos: { x: 349, y: 222 }
    },
    {
      from: 'pgvector',
      to: 'gate',
      fromSide: 'r',
      toSide: 'l',
      label: 'candidate',
      labelPos: { x: 565, y: 222 }
    },
    {
      from: 'gate',
      to: 'reply',
      fromSide: 'r',
      toSide: 'b',
      toDx: -16,
      waypoints: [{ x: 836, y: 236 }],
      label: 'reuse pass',
      labelPos: { x: 794, y: 222 }
    },
    {
      from: 'gate',
      to: 'singleflight',
      fromSide: 'b',
      fromDx: 10,
      toSide: 't',
      toDx: 60,
      label: 'reject',
      labelPos: { x: 692, y: 294 },
      dashed: true,
      variant: 'branch'
    },
    {
      from: 'singleflight',
      to: 'providers',
      fromSide: 'r',
      toSide: 'l',
      label: '50->1',
      labelPos: { x: 731, y: 358 }
    },
    {
      from: 'providers',
      to: 'reply',
      fromSide: 't',
      fromDx: 38,
      toSide: 'b',
      toDx: 16,
      label: 'SSE',
      labelPos: { x: 868, y: 274 }
    },
    {
      from: 'providers',
      to: 'exact',
      fromSide: 'r',
      toSide: 't',
      waypoints: [
        { x: 924, y: 372 },
        { x: 924, y: 14 },
        { x: 454, y: 14 }
      ],
      label: 'cache fill',
      labelPos: { x: 700, y: 14 },
      dashed: true,
      variant: 'feedback'
    }
  ],
  scenarios: [
    { id: 'exact-hit', labelEn: 'Exact hit', labelAr: 'إصابة مطابقة', stepIndex: 2, badge: '<2ms' },
    { id: 'semantic-reuse', labelEn: 'Semantic reuse', labelAr: 'إعادة استخدام دلالي', stepIndex: 4, badge: '6 rules' },
    { id: 'miss-coalesce', labelEn: 'Miss + coalesce', labelAr: 'فوات + دمج', stepIndex: 5, badge: '50->1' }
  ],
  steps: [
    // 01 Request: an OpenAI-compatible request arrives
    { nodes: ['client', 'normalizer'], edges: [['client', 'normalizer']] },
    // 02 Fingerprint: the request is hashed, the prompt fingerprinted
    { nodes: ['normalizer', 'exact'], edges: [['client', 'normalizer'], ['normalizer', 'exact']] },
    // 03 Exact hit: an exact hit never reaches a model
    { nodes: ['exact', 'reply'], edges: [['normalizer', 'exact'], ['exact', 'reply']] },
    // 04 Semantic search: a miss becomes a vector search
    { nodes: ['embed', 'pgvector', 'exact'], edges: [['exact', 'embed'], ['embed', 'pgvector']] },
    // 05 Policy gate: the proposal has to pass the gate
    { nodes: ['gate', 'pgvector', 'reply'], edges: [['pgvector', 'gate'], ['gate', 'reply']] },
    // 06 Upstream: one call upstream, streamed back with its evidence
    {
      nodes: ['singleflight', 'providers', 'reply', 'exact'],
      edges: [
        ['gate', 'singleflight'],
        ['singleflight', 'providers'],
        ['providers', 'reply'],
        ['providers', 'exact']
      ]
    }
  ]
};

const cache: ArchGraph = {
  width: 940,
  height: 440,
  accent: 'amber',
  frames: [
    { x: 12, y: 38, w: 300, h: 356, label: 'Ingress & Guard', tone: 'subtle' },
    { x: 378, y: 38, w: 410, h: 124, label: 'O(1) Dual-Structure Core', tone: 'accent' },
    { x: 326, y: 186, w: 328, h: 114, label: 'Dual TTL Clocks', tone: 'subtle' },
    { x: 670, y: 186, w: 230, h: 222, label: 'Byte Cap & Eviction', tone: 'subtle' }
  ],
  nodes: [
    { id: 'caller', label: 'Caller', sub: 'GET · SET · DEL', x: 78, y: 114, w: 114, kind: 'client', tag: 'HTTP/API' },
    { id: 'router', label: 'Op Router', sub: 'ops + guard', x: 240, y: 114, w: 128, kind: 'service', tag: 'ops' },
    { id: 'hashmap', label: 'Hash map', sub: 'key -> node', x: 468, y: 114, w: 140, kind: 'store', tag: 'O(1)' },
    { id: 'lru', label: 'LRU list', sub: 'head <-> tail', x: 696, y: 114, w: 148, kind: 'store', tag: 'doubly' },
    { id: 'zset', label: 'TTL ZSet', sub: 'expiry index', x: 406, y: 248, w: 132, kind: 'store', tag: 'ZADD' },
    { id: 'sweeper', label: 'TTL Sweeper', sub: 'budgeted scan', x: 582, y: 248, w: 132, kind: 'worker', tag: 'interval' },
    { id: 'bytes', label: 'Byte cap', sub: 'mem accounting', x: 804, y: 248, w: 140, kind: 'gate', tag: 'cap B' },
    { id: 'stampede', label: 'Stampede guard', sub: 'coalesce misses', x: 186, y: 344, w: 148, kind: 'gate', tag: 'coalesce' },
    { id: 'evictor', label: 'Tail evictor', sub: 'unlink + drop', x: 758, y: 360, w: 148, kind: 'worker', tag: 'tail O(1)' }
  ],
  edges: [
    { from: 'caller', to: 'router', fromSide: 'r', toSide: 'l' },
    { from: 'router', to: 'hashmap', fromSide: 'r', toSide: 'l' },
    {
      from: 'hashmap',
      to: 'lru',
      fromSide: 'r',
      toSide: 'l',
      label: 'ptr link',
      labelPos: { x: 580, y: 98 }
    },
    {
      from: 'router',
      to: 'zset',
      fromSide: 'b',
      fromDx: 30,
      toSide: 'l',
      waypoints: [{ x: 270, y: 248 }],
      label: 'ZADD',
      labelPos: { x: 270, y: 196 }
    },
    {
      from: 'lru',
      to: 'bytes',
      fromSide: 'r',
      toSide: 'r',
      waypoints: [
        { x: 888, y: 114 },
        { x: 888, y: 248 }
      ],
      label: 'charge',
      labelPos: { x: 888, y: 168 }
    },
    {
      from: 'bytes',
      to: 'evictor',
      fromSide: 'b',
      toSide: 't',
      waypoints: [
        { x: 804, y: 304 },
        { x: 758, y: 304 }
      ],
      label: 'over cap',
      labelPos: { x: 781, y: 304 },
      dashed: true,
      variant: 'branch'
    },
    {
      from: 'evictor',
      to: 'hashmap',
      fromSide: 'r',
      toSide: 't',
      waypoints: [
        { x: 918, y: 360 },
        { x: 918, y: 14 },
        { x: 588, y: 14 },
        { x: 588, y: 60 },
        { x: 468, y: 60 }
      ],
      label: 'del bucket',
      labelPos: { x: 730, y: 14 },
      dashed: true,
      variant: 'feedback'
    },
    {
      from: 'hashmap',
      to: 'stampede',
      fromSide: 'b',
      fromDx: 26,
      toSide: 'r',
      waypoints: [{ x: 494, y: 344 }],
      label: 'miss',
      labelPos: { x: 380, y: 330 },
      dashed: true,
      variant: 'branch'
    },
    {
      from: 'stampede',
      to: 'router',
      fromSide: 't',
      fromDx: 10,
      toSide: 'b',
      toDx: -44,
      label: 'fill once',
      labelPos: { x: 196, y: 228 },
      dashed: true,
      variant: 'feedback'
    },
    {
      from: 'sweeper',
      to: 'lru',
      fromSide: 't',
      toSide: 'b',
      waypoints: [
        { x: 582, y: 174 },
        { x: 696, y: 174 }
      ],
      label: 'sweep',
      labelPos: { x: 639, y: 174 },
      dashed: true
    }
  ],
  scenarios: [
    { id: 'write-evict', labelEn: 'Write + evict', labelAr: 'كتابة + استبعاد', stepIndex: 3, badge: 'O(1)' },
    { id: 'stampede-miss', labelEn: 'Stampede miss', labelAr: 'فوات متزامن', stepIndex: 4, badge: 'coalesce' },
    { id: 'dual-ttl', labelEn: 'Dual TTL', labelAr: 'انتهاء مزدوج', stepIndex: 5, badge: 'ZADD+sweep' }
  ],
  steps: [
    // 01 Set: a write touches two structures at once
    {
      nodes: ['caller', 'router', 'hashmap', 'lru'],
      edges: [
        ['caller', 'router'],
        ['router', 'hashmap'],
        ['hashmap', 'lru']
      ]
    },
    // 02 Order: the list is the age of the data
    { nodes: ['lru', 'hashmap'], edges: [['hashmap', 'lru']] },
    // 03 Account: every entry is charged before it is stored
    { nodes: ['bytes', 'lru'], edges: [['lru', 'bytes']] },
    // 04 Evict: a full cache drops the tail
    {
      nodes: ['evictor', 'bytes', 'hashmap'],
      edges: [
        ['bytes', 'evictor'],
        ['evictor', 'hashmap']
      ]
    },
    // 05 Read: lookup + promotion, misses coalesced
    {
      nodes: ['router', 'hashmap', 'stampede'],
      edges: [
        ['caller', 'router'],
        ['router', 'hashmap'],
        ['hashmap', 'stampede'],
        ['stampede', 'router']
      ]
    },
    // 06 Expire: TTL is indexed on write and swept in the background
    {
      nodes: ['zset', 'sweeper', 'lru'],
      edges: [
        ['router', 'zset'],
        ['sweeper', 'lru']
      ]
    }
  ]
};

const epub: ArchGraph = {
  width: 940,
  height: 420,
  accent: 'emerald',
  frames: [
    { x: 12, y: 108, w: 292, h: 124, label: 'Archive Unpack', tone: 'subtle' },
    { x: 316, y: 40, w: 342, h: 274, label: 'Per-Spine 1:1 Render Loop', tone: 'accent' },
    { x: 682, y: 92, w: 244, h: 222, label: 'Assembly & Cleanup', tone: 'subtle' }
  ],
  nodes: [
    { id: 'archive', label: 'EPUB ZIP', sub: 'input archive', x: 76, y: 174, w: 108, kind: 'client', tag: 'ZIP' },
    { id: 'container', label: 'Container', sub: 'OPF + spine', x: 228, y: 174, w: 128, kind: 'service', tag: 'OPF' },
    { id: 'xhtml', label: 'Spine XHTML', sub: 'per spine item', x: 394, y: 152, w: 126, kind: 'queue', tag: 'spine[i]' },
    { id: 'viewport', label: 'Viewport', sub: '1:1 book size', x: 394, y: 266, w: 126, kind: 'gate', tag: 'scale=1' },
    { id: 'fonts', label: 'Fonts + CSS', sub: '@font-face print', x: 576, y: 266, w: 132, kind: 'service', tag: 'CSS' },
    { id: 'puppeteer', label: 'Puppeteer', sub: 'headless print', x: 576, y: 152, w: 132, kind: 'worker', tag: 'Chromium' },
    { id: 'merger', label: 'PDF Merger', sub: 'pdf-lib spine', x: 804, y: 152, w: 148, kind: 'service', tag: 'pdf-lib' },
    { id: 'cleanup', label: 'Cleanup', sub: 'output · rm tmp', x: 804, y: 266, w: 148, kind: 'store', tag: 'finally' }
  ],
  edges: [
    { from: 'archive', to: 'container', fromSide: 'r', toSide: 'l' },
    {
      from: 'container',
      to: 'xhtml',
      fromSide: 'r',
      toSide: 'l',
      waypoints: [
        { x: 306, y: 174 },
        { x: 306, y: 152 }
      ]
    },
    { from: 'xhtml', to: 'viewport', fromSide: 'b', toSide: 't' },
    { from: 'viewport', to: 'fonts', fromSide: 'r', toSide: 'l' },
    { from: 'fonts', to: 'puppeteer', fromSide: 't', toSide: 'b' },
    {
      from: 'puppeteer',
      to: 'xhtml',
      fromSide: 't',
      toSide: 't',
      waypoints: [
        { x: 576, y: 80 },
        { x: 394, y: 80 }
      ],
      label: 'next spine',
      labelPos: { x: 485, y: 80 },
      dashed: true,
      variant: 'feedback'
    },
    { from: 'puppeteer', to: 'merger', fromSide: 'r', toSide: 'l' },
    { from: 'merger', to: 'cleanup', fromSide: 'b', toSide: 't' },
    {
      from: 'container',
      to: 'cleanup',
      fromSide: 'b',
      toSide: 'b',
      waypoints: [
        { x: 228, y: 368 },
        { x: 804, y: 368 }
      ],
      label: 'finally: rm tmp',
      labelPos: { x: 516, y: 368 },
      dashed: true,
      variant: 'branch'
    }
  ],
  scenarios: [
    { id: 'opf-spine', labelEn: 'OPF spine', labelAr: 'ترتيب الحزمة', stepIndex: 1, badge: 'OPF' },
    { id: 'render-loop', labelEn: '1:1 render loop', labelAr: 'حلقة العرض 1:1', stepIndex: 3, badge: 'scale=1' },
    { id: 'merge-cleanup', labelEn: 'Merge + cleanup', labelAr: 'دمج + تنظيف', stepIndex: 5, badge: 'finally' }
  ],
  steps: [
    // 01 Archive: open the book as an archive
    { nodes: ['archive', 'container'], edges: [['archive', 'container']] },
    // 02 Package: the package file gives the spine
    { nodes: ['container', 'xhtml'], edges: [['container', 'xhtml']] },
    // 03 Page: one spine item at a time
    { nodes: ['xhtml', 'viewport'], edges: [['xhtml', 'viewport']] },
    // 04 Viewport: exact page size, fonts and CSS prepared
    { nodes: ['viewport', 'fonts'], edges: [['viewport', 'fonts']] },
    // 05 Render: Chromium captures the page and loops per spine item
    {
      nodes: ['puppeteer', 'fonts', 'xhtml'],
      edges: [
        ['fonts', 'puppeteer'],
        ['puppeteer', 'xhtml']
      ]
    },
    // 06 Assemble: merge in spine order, then clean up on all paths
    {
      nodes: ['merger', 'cleanup', 'container'],
      edges: [
        ['puppeteer', 'merger'],
        ['merger', 'cleanup'],
        ['container', 'cleanup']
      ]
    }
  ]
};

const amen: ArchGraph = {
  width: 940,
  height: 430,
  accent: 'rose',
  frames: [
    { x: 12, y: 44, w: 314, h: 120, label: 'Storefront & Stripe', tone: 'subtle' },
    { x: 350, y: 44, w: 404, h: 120, label: 'Webhook & Order FSM', tone: 'accent' },
    { x: 332, y: 186, w: 544, h: 228, label: 'Studio RBAC & Async Fulfillment', tone: 'subtle' }
  ],
  nodes: [
    { id: 'cart', label: 'Cart', sub: 'story + format', x: 80, y: 112, w: 116, kind: 'client', tag: 'i18n' },
    { id: 'stripe', label: 'Stripe', sub: 'checkout', x: 248, y: 112, w: 128, kind: 'external', tag: 'Checkout' },
    { id: 'webhook', label: 'Webhook', sub: 'verified event', x: 434, y: 112, w: 136, kind: 'gate', tag: 'HMAC' },
    { id: 'orders', label: 'Orders FSM', sub: 'source of truth', x: 668, y: 112, w: 140, kind: 'store', tag: 'FSM' },
    { id: 'rbac', label: 'Studio RBAC', sub: 'scoped queue', x: 420, y: 250, w: 136, kind: 'gate', tag: 'role=art' },
    { id: 'artist', label: 'Artist Queue', sub: 'human artwork', x: 420, y: 364, w: 140, kind: 'queue', tag: 'studio' },
    { id: 'worker', label: 'EPUB Worker', sub: 'async builder', x: 788, y: 250, w: 136, kind: 'worker', tag: 'async' },
    { id: 'delivery', label: 'Delivery', sub: 'book + session', x: 788, y: 364, w: 148, kind: 'stream', tag: 'EPUB' }
  ],
  edges: [
    { from: 'cart', to: 'stripe', fromSide: 'r', toSide: 'l' },
    {
      from: 'stripe',
      to: 'webhook',
      fromSide: 'r',
      toSide: 'l',
      label: 'signed',
      labelPos: { x: 339, y: 98 }
    },
    {
      from: 'webhook',
      to: 'orders',
      fromSide: 'r',
      toSide: 'l',
      label: 'idempotent',
      labelPos: { x: 550, y: 98 }
    },
    {
      from: 'orders',
      to: 'rbac',
      fromSide: 'b',
      fromDx: -54,
      toSide: 'r',
      waypoints: [{ x: 614, y: 250 }],
      label: 'assign',
      labelPos: { x: 552, y: 236 },
      dashed: true,
      variant: 'branch'
    },
    { from: 'rbac', to: 'artist', fromSide: 'b', toSide: 't' },
    {
      from: 'artist',
      to: 'orders',
      fromSide: 'r',
      toSide: 'b',
      toDx: -4,
      waypoints: [{ x: 664, y: 364 }],
      label: 'approved art',
      labelPos: { x: 576, y: 364 },
      dashed: true,
      variant: 'feedback'
    },
    {
      from: 'orders',
      to: 'worker',
      fromSide: 'r',
      toSide: 't',
      waypoints: [{ x: 788, y: 112 }],
      label: 'enqueue',
      labelPos: { x: 788, y: 158 }
    },
    {
      from: 'worker',
      to: 'delivery',
      fromSide: 'b',
      toSide: 't',
      label: 'EPUB',
      labelPos: { x: 788, y: 307 }
    }
  ],
  scenarios: [
    { id: 'webhook-truth', labelEn: 'Webhook truth', labelAr: 'مصدر الحقيقة', stepIndex: 1, badge: 'HMAC' },
    { id: 'artist-loop', labelEn: 'Artist loop', labelAr: 'حلقة الفنان', stepIndex: 3, badge: 'RBAC' },
    { id: 'async-epub', labelEn: 'Async EPUB', labelAr: 'توليد غير متزامن', stepIndex: 4, badge: 'worker' }
  ],
  steps: [
    // 01 Cart: a customer picks a story and a format
    { nodes: ['cart', 'stripe'], edges: [['cart', 'stripe']] },
    // 02 Payment: Stripe takes the money, the webhook closes the loop
    {
      nodes: ['stripe', 'webhook'],
      edges: [
        ['cart', 'stripe'],
        ['stripe', 'webhook']
      ]
    },
    // 03 Order: the order is the record the rest of the system reads
    { nodes: ['orders', 'webhook'], edges: [['webhook', 'orders']] },
    // 04 Assign: RBAC scopes artist work and approved art updates the order
    {
      nodes: ['rbac', 'artist', 'orders'],
      edges: [
        ['orders', 'rbac'],
        ['rbac', 'artist'],
        ['artist', 'orders']
      ]
    },
    // 05 Build: the EPUB is generated asynchronously from the order
    { nodes: ['worker', 'orders'], edges: [['orders', 'worker']] },
    // 06 Deliver: the book is delivered and the session is kept alive
    { nodes: ['delivery', 'worker'], edges: [['worker', 'delivery']] }
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
