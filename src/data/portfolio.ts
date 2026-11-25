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
    title: 'ahmed abdelgelel — software engineer, ai systems',
    description:
      'software engineer in cairo building production ai and backend systems with client teams, from ambiguous workflows to reliable software in their environment.',
    jobTitle: 'Software engineer — AI systems and client delivery'
  },
  identity: {
    name: 'ahmed abdelgelel',
    role: 'software engineer · backend & ai systems · cairo',
    status: 'open to forward-deployed engineering roles',
    bioPrimary:
      'i architect production backends and ai infrastructure — apis, semantic caches, payment pipelines, and fault-tolerant workers built for real traffic.',
    bioSecondary:
      'from schema design and webhook idempotency to policy-gated llm gateways, i own the unglamorous reliability layer between prototypes and production.'
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
      shortRole: 'software engineer',
      role: 'software engineer',
      period: 'dec 2025 — now',
      shortPeriod: '2025 – now',
      stats: [
        { label: 'scope', value: '0 → prod' },
        { label: 'focus', value: 'ai & backend' },
        { label: 'systems', value: 'multi-tenant' }
      ],
      bullets: [
        'architected and shipped multi-tenant node.js & typescript backends for client products, owning database schemas, api contracts, and rollout.',
        'built production llm infrastructure: policy-gated semantic caching, mcp tool servers, async job queues, and automated provider failover.',
        'enforced latency budgets, structured telemetry, and zero-downtime release pipelines to keep live client systems predictable under load.'
      ],
      stack: ['node.js', 'typescript', 'nestjs', 'postgresql', 'redis', 'queues']
    },
    {
      num: '02',
      company: 'amen stories',
      shortRole: 'backend',
      role: 'backend engineer · remote',
      period: 'feb 2025 — oct 2026',
      shortPeriod: '2025 – 2026',
      stats: [
        { label: 'scope', value: '0 → full api' },
        { label: 'focus', value: 'stripe webhooks' },
        { label: 'systems', value: 'async epub' }
      ],
      bullets: [
        'built the entire backend from scratch for a personalized children’s bookstore—covering cart, order lifecycle, multilingual catalog, and media storage.',
        'engineered idempotent stripe checkout with webhooks as the single source of truth, driving state transitions and artist assignment queues.',
        'moved personalized epub compilation into background workers off the request path, backed by rbac for admins, illustrators, and customers.'
      ],
      stack: ['node.js', 'typescript', 'stripe', 'epub', 'workers', 'rbac']
    },
    {
      num: '03',
      company: 'naqaa al-ain',
      shortRole: 'sole backend',
      role: 'sole backend engineer · saudi arabia',
      period: 'apr — aug 2025',
      shortPeriod: 'apr – aug 25',
      stats: [
        { label: 'scope', value: 'sole backend' },
        { label: 'focus', value: 'azure ocr' },
        { label: 'systems', value: 'workshop erp' }
      ],
      bullets: [
        'designed and delivered end-to-end rest apis for a saudi workshop’s daily operations: service orders, invoicing, and payment reconciliation.',
        'implemented role-based access control separating workshop staff, administrators, and customers across distinct operational workflows.',
        'integrated azure document ocr into the billing pipeline to automatically parse vendor, date, and line totals from uploaded receipts.'
      ],
      stack: ['node.js', 'rest apis', 'azure ocr', 'rbac', 'postgresql']
    }
  ],
  projects: [
    {
      num: '01',
      slug: 'relay',
      name: 'relay · llm gateway',
      shortMeta: '50 → 1 · 2026',
      year: '2026',
      metric: '50 → 1 calls',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Relay',
      summary: 'multi-tenant llm gateway that governs semantic cache reuse with pure policy rules, in-process embeddings, and per-reply audit evidence.',
      pipeline: 'auth → redis exact → onnx + pgvector → policy gate → failover',
      bullets: [
        'enforced strict 6-dimension reuse gating (tenant, provider, model, sampling, system-prompt hash, policy version) calibrated on labelled prompt pairs.',
        'ran onnx embeddings in-process with pgvector + redis and single-flight coalescing to collapse 50 concurrent identical requests into 1 upstream call.',
        'preserved sse streaming passthrough, circuit-broken provider fallback, safe cache-outage degradation, and a next.js evidence control plane.'
      ],
      stack: ['fastify', 'typescript', 'pgvector', 'redis', 'onnx', 'docker']
    },
    {
      num: '02',
      slug: 'smart-cache-engine',
      name: 'smart cache engine',
      shortMeta: '3m+ ops/s · 2025',
      year: '2025',
      metric: '3m+ ops/s',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Cache-engine',
      summary: 'zero-dependency redis-like in-memory cache engine written from scratch in node.js and benchmarked across 10 isolated pressure scenarios.',
      pipeline: 'hash map o(1) → doubly linked lru → dual ttl → stampede guard',
      bullets: [
        'implemented o(1) lru eviction via hash map + doubly linked list with strict byte-level memory accounting and redis-style sorted sets (zadd/zrange).',
        'built dual-layer ttl expiration (lazy eviction on read + background active sweep) and a stampede guard eliminating 99.9% of duplicate misses.',
        'wrote an isolated 10-scenario benchmark harness tracking p50/p95/p99 reservoir latencies and memory footprint across churn, sweep, and large values.'
      ],
      stack: ['node.js', 'lru', 'ttl', 'sorted sets', 'zero deps']
    },
    {
      num: '03',
      slug: 'epub-to-pdf',
      name: 'epub to pdf',
      shortMeta: '1:1 viewport · 2025',
      year: '2025',
      metric: '1:1 viewport',
      repoUrl: 'https://github.com/Mo7ammedd/epub-to-pdf',
      summary: 'fixed-layout epub renderer that prints every xhtml page at its declared viewport—preserving exact artwork, fonts, and geometry.',
      pipeline: 'zip unpack → opf spine → puppeteer 1:1 → pdf-lib merge',
      bullets: [
        'parsed container.xml and opf spine ordering to render each fixed-layout xhtml page in puppeteer at its exact declared dimensions without reflow.',
        'injected @font-face font replacements and global css print overrides while handling non-ascii asset paths and malformed archive edges.',
        'added batch shelf conversion, pdf-lib page merging, and fail-safe cross-platform temp directory cleanup for ci and container runs.'
      ],
      stack: ['node.js', 'puppeteer', 'pdf-lib', 'xhtml']
    }
  ],
  skills: [
    { label: 'languages', items: ['typescript', 'javascript', 'go', 'c++', 'python'] },
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
      'focused on systems programming, database internals, algorithms, operating systems, and distributed backend architecture.',
      'worked as a software engineer at penta studio in cairo alongside the degree, designing and shipping production client backends.'
    ],
    courses: ['data structures', 'algorithms', 'operating systems', 'databases', 'networks', 'software eng']
  }
};

const ar: PortfolioContent = {
  meta: {
    title: 'أحمد عبد الجليل — مهندس برمجيات وأنظمة ذكاء اصطناعي',
    description:
      'مهندس برمجيات في القاهرة أبني أنظمة ذكاء اصطناعي وباك إند للإنتاج مع فرق العملاء، من سير العمل غير الواضح إلى برنامج موثوق داخل بيئتهم.',
    jobTitle: 'مهندس برمجيات — أنظمة ذكاء اصطناعي وتسليم للعملاء'
  },
  identity: {
    name: 'أحمد عبد الجليل',
    role: 'مهندس برمجيات · أنظمة الباك إند والذكاء · القاهرة',
    status: 'متاح لأدوار الهندسة الميدانية مع العملاء',
    bioPrimary:
      'أصمّم وأبني أنظمة باك إند وبنية ذكاء اصطناعي للإنتاج — واجهات، كاش دلالي، مسارات دفع، وعمليات خلفية تتحمّل ضغط التشغيل الفعلي.',
    bioSecondary:
      'من تصميم الجداول وضمان عدم تكرار الـ webhooks إلى بوابات النماذج المحكومة بالسياسات، أتولّى طبقة الاعتمادية بين التجربة والإنتاج.'
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
      shortRole: 'مهندس برمجيات',
      role: 'مهندس برمجيات',
      period: 'ديسمبر 2025 — الآن',
      shortPeriod: '2025 – الآن',
      stats: [
        { label: 'النطاق', value: '0 → إنتاج' },
        { label: 'التركيز', value: 'ذكاء وباك إند' },
        { label: 'الأنظمة', value: 'متعددة العملاء' }
      ],
      bullets: [
        'صمّمت وأطلقت أنظمة باك إند متعددة العملاء بـ node.js وtypescript، متولّيًا مخططات قواعد البيانات وعقود الـ api والإطلاق.',
        'بنيت بنية إنتاج لنماذج اللغة: كاش دلالي محكوم بالسياسات، خوادم أدوات mcp، طوابير مهام، وتحويل تلقائي عند تعطل المزوّد.',
        'فرضت ميزانيات زمن الاستجابة والمراقبة المستمرة وخطوط نشر بدون توقف لإبقاء أنظمة العملاء مستقرة تحت الضغط.'
      ],
      stack: ['node.js', 'typescript', 'nestjs', 'postgresql', 'redis', 'queues']
    },
    {
      num: '02',
      company: 'amen stories',
      shortRole: 'باك إند',
      role: 'مهندس باك إند · عن بُعد',
      period: 'فبراير 2025 — أكتوبر 2026',
      shortPeriod: '2025 – 2026',
      stats: [
        { label: 'النطاق', value: '0 → api كامل' },
        { label: 'التركيز', value: 'stripe webhooks' },
        { label: 'الأنظمة', value: 'توليد epub' }
      ],
      bullets: [
        'بنيت الباك إند كاملًا من الصفر لمتجر كتب أطفال مخصّصة — شامل السلة ودورة حياة الطلب والكتالوج متعدد اللغات والوسائط.',
        'طوّرت مسار دفع stripe آمن ضد التكرار باعتماد webhooks كمصدر حقيقة وحيد لإدارة حالات الطلب وطوابير إسناد الرسامين.',
        'نقلت تجميع ملفات epub المخصّصة إلى عمليات خلفية خارج مسار الطلب مع صلاحيات rbac للإدارة والفنانين والعملاء.'
      ],
      stack: ['node.js', 'typescript', 'stripe', 'epub', 'workers', 'rbac']
    },
    {
      num: '03',
      company: 'نقاء العين',
      shortRole: 'باك إند وحيد',
      role: 'مهندس باك إند وحيد · السعودية',
      period: 'أبريل — أغسطس 2025',
      shortPeriod: 'أبريل – أغسطس 25',
      stats: [
        { label: 'النطاق', value: 'مهندس وحيد' },
        { label: 'التركيز', value: 'azure ocr' },
        { label: 'الأنظمة', value: 'إدارة ورشة' }
      ],
      bullets: [
        'صمّمت وسلّمت واجهات rest كاملة للعمليات اليومية لورشة سعودية: أوامر الصيانة، الفواتير، ومطابقة المدفوعات.',
        'نفّذت نظام صلاحيات حسب الدور يفصل بين فريق الورشة والإدارة والعملاء عبر مسارات تشغيل مستقلة.',
        'دمجت azure document ocr داخل مسار الفوترة لاستخراج اسم المورّد والتاريخ والإجمالي تلقائيًا من صور الإيصالات.'
      ],
      stack: ['node.js', 'rest apis', 'azure ocr', 'rbac', 'postgresql']
    }
  ],
  projects: [
    {
      num: '01',
      slug: 'relay',
      name: 'relay · llm gateway',
      shortMeta: '50 → 1 · 2026',
      year: '2026',
      metric: '50 → 1 calls',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Relay',
      summary: 'بوابة llm متعددة العملاء تحكم إعادة استخدام الكاش الدلالي بقواعد سياسة بحتة وتضمينات محلية ودليل تدقيق لكل رد.',
      pipeline: 'auth → redis exact → onnx + pgvector → policy gate → failover',
      bullets: [
        'فرضت بوابة إعادة استخدام من 6 أبعاد (العميل، المزوّد، النموذج، معاملات التوليد، بصمة النظام، إصدار السياسة) بمعايرة مقاسة.',
        'شغّلت تضمينات onnx داخل نفس العملية مع pgvector وredis وتجميع single-flight لتحويل 50 طلبًا متزامنًا إلى طلب واحد.',
        'حافظت على بث sse المباشر مع تحويل تلقائي عند تعطل المزوّد وتدهور آمن عند توقف الكاش ولوحة أدلة بـ next.js.'
      ],
      stack: ['fastify', 'typescript', 'pgvector', 'redis', 'onnx', 'docker']
    },
    {
      num: '02',
      slug: 'smart-cache-engine',
      name: 'smart cache engine',
      shortMeta: '3m+ ops/s · 2025',
      year: '2025',
      metric: '3m+ ops/s',
      repoUrl: 'https://github.com/AhmedAbdelgelel/Cache-engine',
      summary: 'محرك كاش في الذاكرة شبيه بـ redis مكتوب من الصفر بـ node.js دون اعتماديات ومختبر عبر 10 سيناريوهات ضغط معزولة.',
      pipeline: 'hash map o(1) → doubly linked lru → dual ttl → stampede guard',
      bullets: [
        'نفّذت استبعاد lru بزمن o(1) عبر جدول تجزئة وقائمة مترابطة مزدوجة مع محاسبة ذاكرة بالبايت ومجموعات مرتبة (zadd/zrange).',
        'بنيت انتهاء صلاحية بطبقتين (كسول عند القراءة + مسح خلفي نشط) وحاجز اندفاع يمنع 99.9% من الإخفاقات المكررة.',
        'كتبت بيئة قياس معزولة من 10 سيناريوهات تتبع كمون p50/p95/p99 عبر reservoir sampling واستهلاك الذاكرة.'
      ],
      stack: ['node.js', 'lru', 'ttl', 'sorted sets', 'zero deps']
    },
    {
      num: '03',
      slug: 'epub-to-pdf',
      name: 'epub to pdf',
      shortMeta: '1:1 viewport · 2025',
      year: '2025',
      metric: '1:1 viewport',
      repoUrl: 'https://github.com/Mo7ammedd/epub-to-pdf',
      summary: 'محوّل كتب epub ثابتة التخطيط يطبع كل صفحة xhtml بأبعادها المعلنة مع الحفاظ التام على الرسوم والخطوط والهندسة.',
      pipeline: 'zip unpack → opf spine → puppeteer 1:1 → pdf-lib merge',
      bullets: [
        'يقرأ container.xml وترتيب opf spine لعرض كل صفحة xhtml عبر puppeteer بأبعادها الدقيقة دون إعادة تنسيق.',
        'يحقن قواعد @font-face لاستبدال الخطوط وتجاوزات الطباعة بـ css مع معالجة مسارات الملفات غير اللاتينية.',
        'يدعم التحويل الدفعي ودمج الصفحات بـ pdf-lib مع تنظيف آمن للمجلدات المؤقتة على مختلف أنظمة التشغيل.'
      ],
      stack: ['node.js', 'puppeteer', 'pdf-lib', 'xhtml']
    }
  ],
  skills: [
    { label: 'اللغات', items: ['typescript', 'javascript', 'go', 'c++', 'python'] },
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
      'تركيز على برمجة الأنظمة وبنية قواعد البيانات والخوارزميات ونظم التشغيل ومعمارية الباك إند الموزّع.',
      'عملت كمهندس برمجيات في penta studio في القاهرة أثناء الدراسة، مع تصميم وتسليم أنظمة فعلية للعملاء.'
    ],
    courses: ['هياكل البيانات', 'الخوارزميات', 'نظم التشغيل', 'قواعد البيانات', 'الشبكات', 'هندسة البرمجيات']
  }
};

export function getPortfolio(lang: Lang): PortfolioContent {
  return lang === 'ar' ? ar : en;
}
