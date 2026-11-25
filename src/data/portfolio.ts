import type { Lang } from '../i18n/ui';

export interface MetaStat {
  label: string;
  value: string;
}

export interface ExperienceItem {
  num: string;
  company: string;
  shortRole: string;
  role: string;
  period: string;
  shortPeriod: string;
  stats: [MetaStat, MetaStat, MetaStat];
  bullets: string[];
  stack: string[];
}

export interface ProjectItem {
  num: string;
  slug: string;
  name: string;
  shortMeta: string;
  year: string;
  metric: string;
  repoUrl: string;
  summary: string;
  pipeline: string;
  bullets: string[];
  stack: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface PaletteOption {
  id: 'nile-silt' | 'deep-moss' | 'basalt' | 'nocturne';
  name: string;
  swatchBg: string;
  swatchAccent: string;
}

export interface PortfolioContent {
  meta: {
    title: string;
    description: string;
    jobTitle: string;
  };
  identity: {
    name: string;
    role: string;
    status: string;
    bioPrimary: string;
    bioSecondary: string;
  };
  controls: {
    resume: string;
    copyEmail: string;
    copied: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    paletteLabel: string;
    themeDark: string;
    themeLight: string;
    otherLangShort: string;
    otherLangFull: string;
    wheelHint: string;
    code: string;
    docs: string;
    aboutLink: string;
  };
  palettes: PaletteOption[];
  tabs: {
    experience: string;
    projects: string;
    stack: string;
    education: string;
  };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillGroup[];
  education: {
    school: string;
    degree: string;
    period: string;
    location: string;
    stats: [MetaStat, MetaStat, MetaStat];
    highlights: string[];
    courses: string[];
  };
}

export const contactInfo = {
  email: 'ahmed4bdelgelel@gmail.com',
  phoneDisplay: '+20 102 665 7839',
  phoneHref: 'tel:+201026657839',
  githubUrl: 'https://github.com/AhmedAbdelgelel',
  linkedinUrl: 'https://www.linkedin.com/in/ahmed-abdelgelel-6aa523283/',
  resumeUrl: '/assets/cv/AhmedAbdelgelel.pdf',
  avatarUrl: '/assets/img/ahmed.jpg'
} as const;

const en: PortfolioContent = {
  meta: {
    title: 'ahmed abdelgelel — backend engineer',
    description:
      'backend engineer in cairo. node.js, typescript, llm gateways, caches, and backends that hold up after launch.',
    jobTitle: 'Backend engineer'
  },
  identity: {
    name: 'ahmed abdelgelel',
    role: 'backend engineer · cairo',
    status: 'open to backend roles',
    bioPrimary:
      'i build backends in node.js and typescript — apis, caches, queues, and llm gateways that stay calm when real traffic shows up.',
    bioSecondary:
      'owning client backends from first schema to production: model gateways, semantic caching, mcp tools, and boring retry logic.'
  },
  controls: {
    resume: 'resume',
    copyEmail: 'copy email',
    copied: 'copied',
    email: 'email',
    phone: 'phone',
    github: 'github',
    linkedin: 'linkedin',
    paletteLabel: 'palette',
    themeDark: 'dark',
    themeLight: 'light',
    otherLangShort: 'ع',
    otherLangFull: 'العربية',
    wheelHint: '↑↓ switch',
    code: 'github',
    docs: 'blog',
    aboutLink: 'about me'
  },
  palettes: [
    { id: 'nile-silt', name: 'nile silt', swatchBg: '#151412', swatchAccent: '#d4a359' },
    { id: 'deep-moss', name: 'deep moss', swatchBg: '#121815', swatchAccent: '#c4b18d' },
    { id: 'basalt', name: 'basalt', swatchBg: '#161514', swatchAccent: '#e07a5f' },
    { id: 'nocturne', name: 'nocturne', swatchBg: '#12161d', swatchAccent: '#8fb89f' }
  ],
  tabs: {
    experience: 'experience',
    projects: 'projects',
    stack: 'stack',
    education: 'education'
  },
  experience: [
    {
      num: '01',
      company: 'penta studio',
      shortRole: 'co-founder',
      role: 'software engineer · co-founder',
      period: 'dec 2025 — now',
      shortPeriod: '2025 – now',
      stats: [
        { label: 'scope', value: '0 → prod' },
        { label: 'focus', value: 'llm & apis' },
        { label: 'systems', value: 'multi-tenant' }
      ],
      bullets: [
        'architected node.js & typescript backends from initial schema to production rollout.',
        'built llm gateways with semantic caching, mcp tool bridges, and fault-tolerant queues.',
        'owned latency budgets, observability, and zero-downtime client deployments.'
      ],
      stack: ['node.js', 'typescript', 'nestjs', 'postgresql', 'redis', 'queues']
    },
    {
      num: '02',
      company: 'amen stories',
      shortRole: 'backend',
      role: 'backend developer · remote',
      period: 'feb 2025 — oct 2026',
      shortPeriod: '2025 – 2026',
      stats: [
        { label: 'scope', value: 'full api' },
        { label: 'focus', value: 'stripe' },
        { label: 'systems', value: 'auto epub' }
      ],
      bullets: [
        'built the entire backend of a personalized story bookstore from zero to live orders.',
        'implemented stripe checkout webhooks, idempotent order flows, and artist queues.',
        'engineered background epub book generation, multilingual schemas, and role-based access.'
      ],
      stack: ['node.js', 'typescript', 'stripe', 'epub', 'workers', 'rbac']
    },
    {
      num: '03',
      company: 'naqaa al-ain',
      shortRole: 'freelance',
      role: 'freelance backend · saudi arabia',
      period: 'apr — aug 2025',
      shortPeriod: 'apr – aug 25',
      stats: [
        { label: 'scope', value: 'sole eng' },
        { label: 'focus', value: 'azure ocr' },
        { label: 'systems', value: 'billing' }
      ],
      bullets: [
        'designed rest apis for workshop orders, invoicing, and payment tracking workflows.',
        'built role-based auth separating admins, workshop staff, and customers.',
        'integrated azure ocr to extract vendor, date, and totals from uploaded receipts.'
      ],
      stack: ['node.js', 'rest apis', 'azure ocr', 'rbac', 'postgresql']
    }
  ],
  projects: [
    {
      num: '01',
      slug: 'smart-cache-engine',
      name: 'smart cache engine',
      shortMeta: '3m+ ops/s · 2025',
      year: '2025',
      metric: '3m+ ops/s',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Cache-engine',
      summary: 'zero-dependency redis-like in-memory cache engine built from scratch in node.js.',
      pipeline: 'cmd → map o(1) → lru slabs → ttl sweep',
      bullets: [
        'o(1) lru eviction over doubly linked list + hash map with byte-level memory caps.',
        'dual-layer ttl expiration (lazy on read + active sweep) and redis-style sorted sets.',
        'stampede guard removes 99.9% of duplicate misses; p50/p95/p99 reservoir latency metrics.'
      ],
      stack: ['node.js', 'lru', 'ttl', 'sorted sets', 'zero deps']
    },
    {
      num: '02',
      slug: 'epub-to-pdf',
      name: 'epub to pdf',
      shortMeta: '1:1 viewport · 2025',
      year: '2025',
      metric: '1:1 viewport',
      repoUrl: 'https://github.com/Mo7ammedd/epub-to-pdf',
      summary: 'fixed-layout book renderer preserving exact page geometry, artwork, and typography.',
      pipeline: 'zip → opf spine → puppeteer → pdf-lib',
      bullets: [
        'reads container/opf spine order and renders each xhtml page at its declared viewport.',
        'injects @font-face rules with configurable font replacement and css print overrides.',
        'supports batch shelves, pdf-lib merging, and guaranteed cross-platform temp cleanup.'
      ],
      stack: ['node.js', 'puppeteer', 'pdf-lib', 'xhtml']
    },
    {
      num: '03',
      slug: 'relay',
      name: 'relay · llm gateway',
      shortMeta: '50 → 1 · 2026',
      year: '2026',
      metric: '50 → 1 calls',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Relay',
      summary: 'openai-compatible llm gateway separating exact redis hits from policy-gated semantic reuse.',
      pipeline: 'req → redis → onnx/pgvec → policy gate',
      bullets: [
        'pure policy gate checks tenant, model, sampling params, system-prompt hash, and threshold.',
        'single-flight collapses 50 concurrent identical calls into 1 upstream request with sse streaming.',
        'circuit-breaker provider fallback, docker compose, 420 tests, and next.js evidence panel.'
      ],
      stack: ['fastify', 'typescript', 'pgvector', 'redis', 'onnx', 'docker']
    }
  ],
  skills: [
    { label: 'languages', items: ['typescript', 'javascript', 'go', 'c++', 'python', 'java', 'c'] },
    { label: 'backend & queues', items: ['node.js', 'fastify', 'nestjs', 'express', 'kafka', 'rabbitmq'] },
    { label: 'data & ai infra', items: ['postgresql', 'pgvector', 'redis', 'mongodb', 'mysql', 'onnx', 'mcp'] },
    { label: 'cloud & testing', items: ['docker', 'azure', 'ci/cd', 'linux', 'git', 'jest', 'mocha', 'react'] }
  ],
  education: {
    school: 'mansoura university',
    degree: 'b.sc. in computer science',
    period: '2021 — 2025',
    location: 'egypt',
    stats: [
      { label: 'degree', value: 'b.sc. cs' },
      { label: 'focus', value: 'systems & db' },
      { label: 'years', value: '2021 – 2025' }
    ],
    highlights: [
      'core focus on systems programming, database internals, algorithms, and distributed backend design.',
      'co-founded penta studio in cairo while completing the degree, shipping production client backends.'
    ],
    courses: ['data structures', 'algorithms', 'operating systems', 'databases', 'networks', 'software eng']
  }
};

const ar: PortfolioContent = {
  meta: {
    title: 'أحمد عبد الجليل — مهندس باك إند',
    description:
      'مهندس باك إند في القاهرة. أنظمة Node.js وTypeScript وبوابات نماذج اللغة ومحركات التخزين المؤقت.',
    jobTitle: 'مهندس باك إند'
  },
  identity: {
    name: 'أحمد عبد الجليل',
    role: 'مهندس باك إند · القاهرة',
    status: 'متاح لفرص باك إند',
    bioPrimary:
      'أبني أنظمة باك إند بـ node.js وtypescript — واجهات، كاش، طوابير، وبوابات لنماذج اللغة تصمد لما يبدأ الضغط الحقيقي.',
    bioSecondary:
      'أمسك الباك إند من أول تصميم لحد الإنتاج: بوابات النماذج، الكاش الدلالي، أدوات mcp، ومنطق إعادة المحاولة الهادئ.'
  },
  controls: {
    resume: 'السيرة',
    copyEmail: 'نسخ البريد',
    copied: 'تم النسخ',
    email: 'البريد',
    phone: 'الهاتف',
    github: 'github',
    linkedin: 'linkedin',
    paletteLabel: 'الألوان',
    themeDark: 'غامق',
    themeLight: 'فاتح',
    otherLangShort: 'en',
    otherLangFull: 'english',
    wheelHint: '↑↓ تنقل',
    code: 'github',
    docs: 'مقال',
    aboutLink: 'المزيد عني'
  },
  palettes: [
    { id: 'nile-silt', name: 'طمي النيل', swatchBg: '#151412', swatchAccent: '#d4a359' },
    { id: 'deep-moss', name: 'طحلب داكن', swatchBg: '#121815', swatchAccent: '#c4b18d' },
    { id: 'basalt', name: 'بازلت', swatchBg: '#161514', swatchAccent: '#e07a5f' },
    { id: 'nocturne', name: 'ليلي', swatchBg: '#12161d', swatchAccent: '#8fb89f' }
  ],
  tabs: {
    experience: 'الخبرة',
    projects: 'المشاريع',
    stack: 'التقنيات',
    education: 'التعليم'
  },
  experience: [
    {
      num: '01',
      company: 'penta studio',
      shortRole: 'مؤسس',
      role: 'مهندس برمجيات · مؤسس مشارك',
      period: 'ديسمبر 2025 — الآن',
      shortPeriod: '2025 – الآن',
      stats: [
        { label: 'النطاق', value: '0 → إنتاج' },
        { label: 'التركيز', value: 'llm / api' },
        { label: 'الأنظمة', value: 'متعددة' }
      ],
      bullets: [
        'تصميم وقيادة معمارية الباك إند بـ node.js وtypescript من أول مخطط حتى الإطلاق.',
        'بناء بوابات لنماذج اللغة بكاش دلالي، وأدوات mcp، وطوابير تتحمل الأخطاء.',
        'إدارة الأداء، المراقبة، وإطلاقات العملاء دون توقف.'
      ],
      stack: ['node.js', 'typescript', 'nestjs', 'postgresql', 'redis', 'queues']
    },
    {
      num: '02',
      company: 'amen stories',
      shortRole: 'باك إند',
      role: 'مطوّر باك إند · عن بُعد',
      period: 'فبراير 2025 — أكتوبر 2026',
      shortPeriod: '2025 – 2026',
      stats: [
        { label: 'النطاق', value: 'كامل' },
        { label: 'التركيز', value: 'stripe' },
        { label: 'الأنظمة', value: 'epub' }
      ],
      bullets: [
        'بناء الباك إند الكامل لمتجر قصص مخصّصة من الصفر حتى استقبال الطلبات الفعلية.',
        'تطوير مدفوعات stripe بالـ webhooks، ومسارات طلب آمنة، وطوابير إسناد الفنانين.',
        'هندسة مهام خلفية لتوليد كتب epub، ونماذج متعددة اللغات، وصلاحيات الإدارة.'
      ],
      stack: ['node.js', 'typescript', 'stripe', 'epub', 'workers', 'rbac']
    },
    {
      num: '03',
      company: 'نقاء العين',
      shortRole: 'مستقل',
      role: 'باك إند مستقل · السعودية',
      period: 'أبريل — أغسطس 2025',
      shortPeriod: '2025',
      stats: [
        { label: 'النطاق', value: 'وحيد' },
        { label: 'التركيز', value: 'azure ocr' },
        { label: 'الأنظمة', value: 'فواتير' }
      ],
      bullets: [
        'تصميم واجهات rest لإدارة طلبات الصيانة والفواتير ومسارات الدفع.',
        'بناء نظام صلاحيات يفصل بين الإدارة وفريق الورشة والعملاء.',
        'دمج azure ocr لاستخراج المورّد والتاريخ والمبلغ تلقائيًا من الإيصالات.'
      ],
      stack: ['node.js', 'rest apis', 'azure ocr', 'rbac', 'postgresql']
    }
  ],
  projects: [
    {
      num: '01',
      slug: 'smart-cache-engine',
      name: 'smart cache engine',
      shortMeta: '3m+ ops/s · 2025',
      year: '2025',
      metric: '3m+ ops/s',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Cache-engine',
      summary: 'محرك كاش في الذاكرة شبيه بـ redis مكتوب من الصفر بـ node.js دون اعتماديات.',
      pipeline: 'cmd → map o(1) → lru slabs → ttl sweep',
      bullets: [
        'استبعاد lru بزمن o(1) عبر قائمة مترابطة وجدول تجزئة مع سقف ذاكرة بالبايت.',
        'انتهاء صلاحية بطبقتين (كسول + مسح خلفي) ومجموعات مرتبة شبيهة بـ redis.',
        'حاجز اندفاع يمنع 99.9% من الطلبات المكررة وقياسات زمن استجابة p50/p95/p99.'
      ],
      stack: ['node.js', 'lru', 'ttl', 'sorted sets', 'zero deps']
    },
    {
      num: '02',
      slug: 'epub-to-pdf',
      name: 'epub to pdf',
      shortMeta: '1:1 viewport · 2025',
      year: '2025',
      metric: '1:1 viewport',
      repoUrl: 'https://github.com/Mo7ammedd/epub-to-pdf',
      summary: 'محوّل يعرض الكتب ثابتة التخطيط بأبعادها الأصلية دون كسر الرسوم أو الخطوط.',
      pipeline: 'zip → opf spine → puppeteer → pdf-lib',
      bullets: [
        'يقرأ ترتيب الـ opf spine ويعرض كل صفحة xhtml عبر puppeteer بأبعادها المعلنة.',
        'يحقن قواعد @font-face مع دعم استبدال الخطوط وتجاوزات الطباعة بـ css.',
        'يدعم التحويل الدفعي ودمج الصفحات بـ pdf-lib مع تنظيف تلقائي للملفات المؤقتة.'
      ],
      stack: ['node.js', 'puppeteer', 'pdf-lib', 'xhtml']
    },
    {
      num: '03',
      slug: 'relay',
      name: 'relay · llm gateway',
      shortMeta: '50 → 1 · 2026',
      year: '2026',
      metric: '50 → 1 calls',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Relay',
      summary: 'بوابة نماذج لغة تفصل المطابقة التامة في redis عن الكاش الدلالي المحكوم بالسياسات.',
      pipeline: 'req → redis → onnx/pgvec → policy gate',
      bullets: [
        'بوابة سياسات نقية تتحقق من العميل والنموذج ومعاملات التوليد وبصمة النظام وحد التشابه.',
        'دمج 50 طلبًا متزامنًا متطابقًا في استدعاء واحد للمزوّد مع بث sse مباشر.',
        'مزوّد احتياطي بقاطع دائرة، docker compose، 420 اختبارًا، ولوحة تحكم next.js.'
      ],
      stack: ['fastify', 'typescript', 'pgvector', 'redis', 'onnx', 'docker']
    }
  ],
  skills: [
    { label: 'اللغات', items: ['typescript', 'javascript', 'go', 'c++', 'python', 'java', 'c'] },
    { label: 'الباك إند والطوابير', items: ['node.js', 'fastify', 'nestjs', 'express', 'kafka', 'rabbitmq'] },
    { label: 'البيانات والذكاء', items: ['postgresql', 'pgvector', 'redis', 'mongodb', 'mysql', 'onnx', 'mcp'] },
    { label: 'السحابة والاختبارات', items: ['docker', 'azure', 'ci/cd', 'linux', 'git', 'jest', 'mocha', 'react'] }
  ],
  education: {
    school: 'جامعة المنصورة',
    degree: 'بكالوريوس علوم الحاسب',
    period: '2021 — 2025',
    location: 'مصر',
    stats: [
      { label: 'الدرجة', value: 'بكالوريوس' },
      { label: 'التركيز', value: 'أنظمة وبيانات' },
      { label: 'السنوات', value: '2021 – 2025' }
    ],
    highlights: [
      'تركيز على برمجة الأنظمة وقواعد البيانات والخوارزميات ومعمارية الباك إند الموزّع.',
      'شاركت في تأسيس penta studio في القاهرة أثناء الدراسة مع تسليم أنظمة فعلية للعملاء.'
    ],
    courses: ['هياكل البيانات', 'الخوارزميات', 'نظم التشغيل', 'قواعد البيانات', 'الشبكات', 'هندسة البرمجيات']
  }
};

export function getPortfolio(lang: Lang): PortfolioContent {
  return lang === 'ar' ? ar : en;
}
