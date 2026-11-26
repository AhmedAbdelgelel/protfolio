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
    courseworkLabel: string;
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
    title: 'ahmed abdelgelel — forward-deployed & agentic systems engineer',
    description:
      'software engineer in cairo owning the whole problem from discovery through deployment — building production backends, mcp servers, tool-calling agents, evals, and policy-gated llm gateways.',
    jobTitle: 'Forward-Deployed Software Engineer — Agentic AI & Backend Systems'
  },
  identity: {
    name: 'ahmed abdelgelel',
    role: 'forward-deployed & agentic systems engineer · cairo',
    status: 'open to forward-deployed engineering roles',
    bioPrimary:
      'i own the whole problem, not just the ticket — entering a customer’s workflow, exposing the real constraint, and turning it into simple, reliable software they can keep running after i leave.',
    bioSecondary:
      'i build production backends and agentic systems: mcp servers, tool loops, guardrails, evals, and policy-gated llm gateways. a model returning a good answer once is a demo; a system that explains and repeats it under real constraints is software.'
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
      role: 'software engineer · remote',
      period: 'dec 2025 — now',
      shortPeriod: '2025 – now',
      bullets: [
        'lead backend development and technical architecture across multiple client products at once — owning system design, apis, third-party integrations, and cloud delivery from concept to launch.',
        'build production node.js backends (nestjs, express, postgresql, redis) and agentic ai systems — mcp servers, tool-calling workflows, semantic caches, and background queues.',
        'work directly with frontend teams and client stakeholders from discovery through post-launch operations: exposing real constraints, debugging edge-case data, and shipping zero-downtime fixes.'
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
      bullets: [
        'built the entire backend from scratch for a personalized story-commerce platform — cart, stripe checkout, multilingual story models, media upload pipelines, and admin tooling.',
        'wired stripe webhooks as the single source of truth for order state, retries, and artist assignment queues so a refresh or double click never creates duplicate orders.',
        'moved personalized epub generation and session maintenance into automated background workers off the request path, with role-based access for admins, artists, and customers.'
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
      bullets: [
        'owned the entire backend between cairo and a car-maintenance workshop in saudi arabia — shipping rest apis for orders, invoicing, and payment workflows.',
        'built role-based authentication and authorization separating admins, workshop staff, and customers across daily operations.',
        'integrated azure ocr into the invoicing pipeline to extract vendor, date, and amount data from uploaded receipts and tuned database workflows for production load.'
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
      summary: 'openai-compatible two-layer cache gateway (exact + policy-gated semantic) in fastify/typescript with per-reply audit evidence and 522 automated tests.',
      pipeline: 'auth → redis exact → onnx + pgvector → policy gate → failover',
      bullets: [
        'built exact sha-256 caching (memory lru / redis) and a pure reuse-policy semantic gate (tenant, provider, model, temperature, max_tokens, system-prompt fingerprint, policy version) calibrated at 0.95 threshold.',
        'ran in-process onnx embeddings with single-flight coalescing (50 concurrent → 1 provider call), keeping hit latency flat (~15 ms p50) across 8 kb to 256 kb prompts with zero provider calls on hits.',
        'added multi-provider routing (openai, anthropic, gemini, opencode, ollama), sse streaming passthrough, circuit-broken fallback, safe cache-outage degradation, docker compose, a next.js evidence control plane, and 399 core + 123 ui tests.'
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
      summary: 'redis-inspired in-memory cache engine built from scratch in node.js (zero core deps + express rest api), hitting 3m+ ops/sec across 10 load scenarios.',
      pipeline: 'hash map o(1) → doubly linked lru → dual ttl → stampede guard',
      bullets: [
        'implemented o(1) lru eviction via map + doubly linked list with byte-level memory cap enforcement and redis-style sorted sets (zadd, zrank, zrange, zrangebyscore, zincrby).',
        'built dual-layer ttl expiration (lazy check on get + unref’d background sweep), stampede guard promise deduplication (99.9% fewer backend calls), and reservoir-sampled p50/p95/p99 latency metrics.',
        'validated with 79 unit tests across 5 modules using node’s built-in test runner and benchmarked across 10 scenarios (1m ops each: zipf hot keys, ttl storm, churn, memory pressure, and large values).'
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
      summary: 'fixed-layout epub-to-pdf pipeline that renders each xhtml spine page in puppeteer at its exact declared viewport—never re-typesetting artwork, fonts, or layout.',
      pipeline: 'zip unpack → opf spine → puppeteer 1:1 → pdf-lib merge',
      bullets: [
        'unpacked epub archives, parsed container.xml and opf spine ordering, and rendered every xhtml page in puppeteer at its exact declared viewport dimensions for 1:1 fixed-layout fidelity.',
        'injected @font-face rules with configurable font replacement and global css print overrides while surviving real-library edge cases like non-ascii asset paths and broken windows zip paths.',
        'added batch shelf conversion, pdf-lib page merging, and cross-platform extraction with guaranteed temp-directory cleanup on success or failure for ci and container runs.'
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
    courseworkLabel: 'coursework',
    courses: ['data structures', 'algorithms', 'operating systems', 'databases', 'networks', 'software eng']
  }
};

const ar: PortfolioContent = {
  meta: {
    title: 'أحمد عبد الجليل — مهندس أنظمة وكلاء ذكاء اصطناعي وهندسة ميدانية',
    description:
      'مهندس برمجيات في القاهرة أتولى المشكلة كاملة من الفهم حتى النشر — أبني أنظمة باك إند، وخوادم MCP، ووكلاء استدعاء الأدوات، والتقييمات، وبوابات النماذج المحكومة بالسياسات.',
    jobTitle: 'مهندس برمجيات وهندسة ميدانية — أنظمة الوكلاء والباك إند'
  },
  identity: {
    name: 'أحمد عبد الجليل',
    role: 'مهندس أنظمة وكلاء وباك إند · هندسة ميدانية · القاهرة',
    status: 'متاح لأدوار الهندسة الميدانية مع العملاء',
    bioPrimary:
      'أتولّى المشكلة كاملة لا المهمة المكتوبة في التذكرة فقط — أدخل سير عمل العميل، أكشف القيد الحقيقي، وأحوّله إلى نظام بسيط وموثوق يستطيع العميل الاستمرار في استخدامه بعد رحيلي.',
    bioSecondary:
      'أبني أنظمة باك إند ووكلاء ذكاء اصطناعي للإنتاج: خوادم MCP، وحلقات استدعاء الأدوات، وحدود الحماية، والتقييمات، وبوابات النماذج المحكومة بالسياسات. ردّ جيد مرة واحدة عرض تجريبي؛ أما النظام الذي يفسّر النتيجة ويكرّرها داخل قيود العميل فهذا هو البرنامج.'
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
      role: 'مهندس برمجيات · عن بُعد',
      period: 'ديسمبر 2025 — الآن',
      shortPeriod: '2025 – الآن',
      bullets: [
        'أقود تطوير الباك إند والمعمارية التقنية لعدة منتجات عملاء في الوقت نفسه — مع مسؤولية تصميم الأنظمة والـ apis والتكاملات الخارجية والتسليم السحابي من الفكرة حتى الإطلاق.',
        'أبني أنظمة باك إند بـ node.js (nestjs وexpress وpostgresql وredis) وأنظمة وكلاء ذكاء اصطناعي تشمل خوادم mcp وسير عمل استدعاء الأدوات والكاش الدلالي وطوابير المهام الخلفية.',
        'أعمل مباشرةً مع فرق الواجهة والعملاء من الاكتشاف حتى التشغيل بعد الإطلاق: كشف القيود الحقيقية، معالجة حالات البيانات غير المتوقعة، وشحن إصلاحات دون توقف.'
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
      bullets: [
        'بنيت الباك إند كاملًا من الصفر لمنصة متجر قصص مخصّصة — السلة، الدفع عبر stripe، نماذج القصص متعددة اللغات، رفع الوسائط، وأدوات الإدارة اليومية.',
        'اعتمدت stripe webhooks كمصدر حقيقة وحيد لحالات الطلب وإعادة المحاولة وطوابير إسناد الفنانين، بحيث لا يخلق التحديث أو الضغط المزدوج طلبًا مكررًا أبدًا.',
        'نقلت توليد ملفات epub المخصّصة وصيانة الجلسات إلى عمليات خلفية خارج مسار الطلب، مع صلاحيات rbac للإدارة والفنانين والعملاء.'
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
      bullets: [
        'تولّيت الباك إند بالكامل بين القاهرة وورشة صيانة سيارات في السعودية — وبنيت واجهات rest للطلبات والفواتير ومتابعة المدفوعات.',
        'بنيت نظام مصادقة وصلاحيات حسب الدور يفصل بين الإدارة وفريق الورشة والعملاء في التشغيل اليومي.',
        'دمجت azure ocr في مسار الفوترة لاستخراج المورّد والتاريخ والإجمالي تلقائيًا من صور الإيصالات، وحسّنت أداء قواعد البيانات لضغط الإنتاج.'
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
      summary: 'بوابة كاش من طبقتين متوافقة مع openai (كاش مطابق + كاش دلالي محكوم بالسياسات) بـ fastify/typescript مع دليل تدقيق لكل رد و522 اختبارًا آليًا.',
      pipeline: 'auth → redis exact → onnx + pgvector → policy gate → failover',
      bullets: [
        'بنيت كاشًا مطابقًا بـ sha-256 (ذاكرة lru / redis) وبوابة سياسة دلالية نقية (العميل، المزوّد، النموذج، temperature، max_tokens، بصمة النظام، إصدار السياسة) بمعايرة مقاسة عند 0.95.',
        'شغّلت تضمينات onnx داخل العملية مع تجميع single-flight (50 طلبًا متزامنًا ← طلب مزوّد واحد)، ما حافظ على كمون ثابت (~15 مللي ثانية p50) عبر مطالبات من 8 إلى 256 كيلوبايت دون أي استدعاء للمزوّد عند الإصابة.',
        'أضفت التوجيه متعدد المزوّدين (openai وanthropic وgemini وopencode وollama) وبث sse المباشر والتحويل التلقائي مع circuit breaker والتدهور الآمن عند تعطل الكاش وdocker compose ولوحة أدلة بـ next.js مع 399 اختبارًا أساسيًا + 123 اختبار واجهة.'
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
      summary: 'محرك كاش في الذاكرة مستوحى من redis مبني من الصفر بـ node.js (بلا اعتماديات في النواة + واجهة express rest)، يحقق أكثر من 3 ملايين عملية/ثانية عبر 10 سيناريوهات ضغط.',
      pipeline: 'hash map o(1) → doubly linked lru → dual ttl → stampede guard',
      bullets: [
        'نفّذت استبعاد lru بزمن o(1) عبر map وقائمة مترابطة مزدوجة مع فرض سقف ذاكرة بالبايت ومجموعات مرتبة شبيهة بـ redis (zadd وzrank وzrange وzrangebyscore وzincrby).',
        'بنيت انتهاء صلاحية بطبقتين (فحص كسول عند القراءة + مسح خلفي لا يعطل خروج العملية) وحاجز اندفاع يمنع 99.9% من الاستدعاءات المكررة وقياسات كمون p50/p95/p99 عبر reservoir sampling.',
        'تحقّقت من المحرك عبر 79 اختبار وحدة موزّعة على 5 وحدات باستخدام مشغّل اختبارات node المدمج، وقست الأداء عبر 10 سيناريوهات (مليون عملية لكل سيناريو: مفاتيح zipf وعاصفة ttl وضغط الذاكرة والقيم الكبيرة).'
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
      summary: 'مسار تحويل كتب epub ثابتة التخطيط يطبع كل صفحة xhtml عبر puppeteer بأبعادها المعلنة بالضبط — دون إعادة تنسيق الرسوم أو الخطوط أو التخطيط.',
      pipeline: 'zip unpack → opf spine → puppeteer 1:1 → pdf-lib merge',
      bullets: [
        'فككت أرشيفات epub وقرأت container.xml وترتيب opf spine لعرض كل صفحة xhtml في puppeteer بأبعادها المعلنة بدقة 1:1 للكتب ثابتة التخطيط.',
        'حقنت قواعد @font-face لاستبدال الخطوط وتجاوزات css للطباعة مع معالجة حالات المكتبات الحقيقية مثل المسارات غير اللاتينية ومسارات zip المعطوبة على ويندوز.',
        'أضفت التحويل الدفعي للمكتبات ودمج الصفحات بـ pdf-lib واستخراجًا عابرًا للمنصات مع تنظيف مضمون للمجلدات المؤقتة عند النجاح أو الفشل لبيئات ci والحاويات.'
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
    courseworkLabel: 'المقررات الدراسية',
    courses: ['هياكل البيانات', 'الخوارزميات', 'نظم التشغيل', 'قواعد البيانات', 'الشبكات', 'هندسة البرمجيات']
  }
};

export function getPortfolio(lang: Lang): PortfolioContent {
  return lang === 'ar' ? ar : en;
}
