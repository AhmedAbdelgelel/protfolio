import type { Lang } from '../i18n/ui';

export interface FlowStep {
  label: string;
  title: string;
  body: string;
  notes?: string[];
  /** An optional number or fact pinned to the step, shown as a chip. */
  metric?: string;
  /** Live mono execution trace shown inside the step panel. */
  trace?: string;
}

export interface Flow {
  title: string;
  hint: string;
  steps: FlowStep[];
}

const en: Record<string, Flow> = {
  relay: {
    title: 'How the request moves',
    hint: 'Click a step',
    steps: [
      {
        label: 'Request',
        title: 'An OpenAI-compatible request arrives',
        body:
          'Clients keep the provider SDK they already use and change a base URL. The Normalizer folds the payload into a stable canonical shape: tenant, provider, model, sampling parameters and messages.',
        trace: 'POST /v1/chat/completions -> normalize(tenant, model, temp, msgs)',
        notes: ['POST /v1/chat/completions', 'Streaming and non-streaming take the same path']
      },
      {
        label: 'Fingerprint',
        title: 'The request is hashed, the prompt fingerprinted',
        body:
          'The normalised body becomes a SHA-256 key for the Exact cache. The system prompt is fingerprinted separately, because it changes far more often than the user message and invalidates everything it touches.',
        trace: 'sha256(normalized_body) + sha256(sys_prompt) -> GET exact:{hash}',
        notes: ['hash of the normalised body', 'separate fingerprint for the system prompt']
      },
      {
        label: 'Exact hit',
        title: 'An exact hit never reaches a model',
        body:
          'If the hash is known in Redis or local LRU and its policy version is current, the stored answer comes back over SSE with the evidence of that decision. The cost of the request is one cache read.',
        trace: 'Redis HIT (1.1ms) -> policy_ver==current -> SSE + evidence{EXACT}',
        notes: ['served from Redis or LRU', 'reuse still recorded, so it can be audited']
      },
      {
        label: 'Semantic search',
        title: 'A miss becomes a vector search',
        body:
          'An exact miss drops into the semantic plane: ONNX Embed computes a 384-d vector in process and queries pgvector scoped to the same tenant and model. The nearest neighbour is not an answer yet. It is a proposal.',
        trace: 'Exact MISS -> ONNX 384-d embed -> pgvector HNSW top-k (tenant, model)',
        notes: ['embedding computed in process', 'neighbours from pgvector, scoped by tenant and model']
      },
      {
        label: 'Policy gate',
        title: 'The proposal has to pass the gate',
        body:
          'A pure Policy gate decides whether the two requests are genuinely equivalent. Same inputs, same decision: no model calls, no network, no shared state, so it can be tested and explained.',
        trace: 'gate(tenant, model, temp, sys_fp, policy_ver, sim>=th) -> PASS -> SSE',
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
          'Rejected requests enter Single-flight, coalescing concurrent identical calls into one upstream request behind retries and a circuit breaker. The SSE Reply streams back while the cache fill writes the answer to Exact cache.',
        trace: 'gate REJECT -> singleflight(50->1) -> retry/breaker -> SSE + cache fill',
        notes: [
          'single-flight, 50 concurrent calls into one',
          'fallback with retries and a circuit breaker',
          'per-reply evidence: decision, policy, similarity, cost'
        ]
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
          'Op Router inserts the new entry into the Hash map for O(1) lookup and into the head of the LRU list for ordering. One of them alone gives you a cache that is fast but cannot evict, or one that evicts but must scan to find a key.',
        metric: 'O(1)',
        trace: 'SET k v -> map[k]=node + lru.pushHead(node) -> O(1) dual write',
        notes: ['hash map: key to node', 'linked list: recency order', 'both are updated in the same operation']
      },
      {
        label: 'Order',
        title: 'The list is the age of the data',
        body:
          'The node at the head of the LRU list is the most recently used, the node at the tail is next to go. Every read or write moves a node to the head via four pointer assignments and never a search.',
        trace: 'lru.moveToHead(node) -> prev/next ptr relink (4 ops, 0 scans)',
        notes: ['head = most recently used', 'tail = least recently used', 'promotion is pointer work, not a sort']
      },
      {
        label: 'Account',
        title: 'Every entry is charged before it is stored',
        body:
          'Byte cap counts keys, values and entry overhead in bytes. When a write would cross the memory ceiling, the cache does not throw: it makes room. That is the difference between a cache and a dictionary.',
        trace: 'bytes += len(k) + len(v) + overhead -> check(bytes <= cap_bytes)',
        notes: ['byte-level accounting, not entry counts', 'the cap is enforced on write', 'the caller sees a normal put']
      },
      {
        label: 'Evict',
        title: 'A full cache drops the tail',
        body:
          'Tail evictor unlinks the least recently used node from the LRU tail in constant time and deletes its Hash map bucket in the same step. Nothing is scanned, so eviction does not get slower as the cache fills.',
        metric: 'O(1)',
        trace: 'bytes > cap -> tail=lru.popTail() -> delete map[tail.k] -> O(1) free',
        notes: ['unlink tail, delete bucket', 'no scan, no sort', 'the evicted key is reported so the caller can tell']
      },
      {
        label: 'Read',
        title: 'A read is a lookup plus a promotion',
        body:
          'The Hash map bucket points straight at the node. On a hit the node moves to the head and the value returns. On a miss, Stampede guard coalesces concurrent callers for the same key so origin is hit once.',
        trace: 'GET k -> map[k]? promote : stampede.coalesce(k) -> fill once',
        notes: ['hit: O(1) lookup, move node', 'miss: coalesced by Stampede guard, never a thundering herd']
      },
      {
        label: 'Expire',
        title: 'TTL is indexed on write, and swept in the background',
        body:
          'Every expiring write records its deadline in the TTL ZSet while reads check expiry lazily. A budgeted TTL Sweeper walks expired keys on an interval so stale entries do not sit in memory waiting to be read.',
        trace: 'ZADD ttl_zset exp k -> lazy read check + sweeper(batch) -> unlink',
        notes: ['ZADD expiry index on write', 'lazy expiry on read + active background sweep', 'expired is a miss, never a stale answer']
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
          'The storefront sells personalized stories. A Cart holds the book, the language, the format and the personalization choices, and hands the validated payload to Stripe Checkout.',
        trace: 'POST /cart -> {story_id, lang, format, child_name} -> checkout.create()',
        notes: ['multilingual catalog', 'format and personalization carried through the order']
      },
      {
        label: 'Payment',
        title: 'Stripe takes the money, the webhook closes the loop',
        body:
          'Checkout runs in Stripe. The backend verifies the Webhook HMAC signature and treats that event as the source of truth, so a refresh or a double click cannot create a second order.',
        trace: 'POST /webhooks/stripe -> verify(HMAC-SHA256) -> checkout.session.completed',
        notes: ['Stripe Checkout', 'HMAC-verified webhook state, not client callbacks']
      },
      {
        label: 'Order',
        title: 'The order is the record the rest of the system reads',
        body:
          'Once paid, Orders FSM becomes the idempotent record that every background job reads: what to build, who illustrates it, and what to ship. Idempotency lives here, not in the UI.',
        trace: 'INSERT orders ON CONFLICT(stripe_event_id) DO NOTHING -> state=PAID',
        notes: ['one order per payment', 'FSM status transitions drive the jobs']
      },
      {
        label: 'Assign',
        title: 'An artist is assigned and approved art updates the order',
        body:
          'Personalized stories need human artwork. Studio RBAC scopes Artist Queue so artists only see their assigned orders and admins see everything; approved art transitions the order forward.',
        trace: 'rbac(role==ARTIST) -> artist_queue.claim() -> approved art -> FSM',
        notes: ['artist queue scoped by Studio RBAC', 'approved artwork loops back to Orders FSM']
      },
      {
        label: 'Build',
        title: 'The EPUB is generated asynchronously from the order',
        body:
          'EPUB Worker pulls approved orders off the request path, renders the personalized book from story, language and artwork, and attaches the file to the order while checkout stays fast.',
        trace: 'enqueue(order_id) -> worker.renderEPUB(lang, art, text) -> attach asset',
        notes: ['generation off the request path', 'the file is attached to the order']
      },
      {
        label: 'Deliver',
        title: 'The book is delivered and the session is kept alive',
        body:
          'Delivery serves the finished EPUB tied to the order, while background jobs keep sessions and order state healthy afterwards, which is the part nobody sees until it stops working.',
        trace: 'signed_url(EPUB) -> customer download + cron session/order upkeep',
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
          'An EPUB ZIP is a structured archive with rules. The pipeline unpacks it into a working directory and reads META-INF/container.xml first to locate the package document instead of guessing file names.',
        trace: 'unzip(book.epub, tmp_dir) -> read META-INF/container.xml -> OPF',
        notes: ['unpack in a temporary working directory', 'container.xml points at the package file']
      },
      {
        label: 'Package',
        title: 'The package file gives the spine',
        body:
          'The Container OPF lists the manifest and the spine. The spine is the author\'s exact page order and feeds the Spine XHTML render queue along with the declared page dimensions.',
        trace: 'parse(OPF) -> manifest[id->href] + spine[0..N] + pageSize(w, h)',
        notes: ['spine order, not alphabetical order', 'manifest maps ids to files', 'page size read from the book metadata']
      },
      {
        label: 'Page',
        title: 'One spine item at a time',
        body:
          'Each Spine XHTML item loads with its own markup and publisher stylesheet. Nothing is merged or reflowed across pages, because that is how fixed-layout books break.',
        trace: 'for item in spine -> load(item.xhtml, item.css) -> isolated page',
        notes: ['XHTML parsed per spine item', 'publisher CSS respected']
      },
      {
        label: 'Viewport',
        title: 'The viewport is the page',
        body:
          'Viewport locks the browser frame to the exact size the book declares at scale=1, then Fonts + CSS applies @font-face replacements and print overrides so screen coordinates match paper.',
        trace: 'setViewport({ width: w, height: h, deviceScaleFactor: 1 }) + CSS',
        notes: ['exact viewport, scale=1', 'a page is a page, not a reflowed approximation']
      },
      {
        label: 'Render',
        title: 'Fonts in, page out, loop per spine',
        body:
          'Puppeteer prints the styled page at print density, then loops back to the next Spine XHTML item until every page in the spine has been captured cleanly.',
        trace: 'inject(@font-face + print.css) -> page.pdf() -> spine[i].pdf -> next',
        notes: ['@font-face injection with replacement', 'global print CSS overrides', 'per-spine loop until complete']
      },
      {
        label: 'Assemble',
        title: 'Merge in spine order, then clean up on all paths',
        body:
          'PDF Merger stitches the per-page PDFs with pdf-lib in spine order. Cleanup removes the working directory via a guaranteed finally rail on both success and failure so a batch run cannot fill the disk.',
        trace: 'pdf-lib.merge(spine[0..N]) -> out.pdf -> finally { rm(tmp_dir) }',
        notes: ['merge with pdf-lib', 'batch a shelf, not a file', 'finally cleanup always runs']
      }
    ]
  }
};

const ar: Record<string, Flow> = {
  relay: {
    title: 'كيف يتحرك الطلب',
    hint: 'اختر خطوة',
    steps: [
      {
        label: 'الطلب',
        title: 'يصل طلب متوافق مع OpenAI',
        body:
          'يحتفظ العملاء بمكتبة المزوّد التي يستخدمونها، ويغيّرون عنوان الأساس فقط. يطبّع Normalizer جسم الطلب إلى شكل ثابت: العميل، والمزوّد، والنموذج، ومعاملات التوليد، والرسائل.',
        trace: 'POST /v1/chat/completions -> normalize(tenant, model, temp, msgs)',
        notes: ['POST /v1/chat/completions', 'البث وغير البث يسلكان المسار نفسه']
      },
      {
        label: 'البصمة',
        title: 'يُحوَّل الطلب إلى بصمة، وتُبصم تعليمات النظام',
        body:
          'يصبح الجسم المطبَّع مفتاح SHA-256 للبحث في Exact cache. وتُبصم تعليمات النظام على حدة، لأنها تتغير أكثر بكثير من رسالة المستخدم، وتُبطل كل ما تلمسه.',
        trace: 'sha256(normalized_body) + sha256(sys_prompt) -> GET exact:{hash}',
        notes: ['بصمة للجسم المطبَّع', 'بصمة منفصلة لتعليمات النظام']
      },
      {
        label: 'إصابة مطابقة',
        title: 'الإصابة المطابقة لا تصل إلى نموذج أبدًا',
        body:
          'إن كانت البصمة معروفة في Redis أو الذاكرة المحلية وإصدار سياستها حديثًا، يعود الرد المخزّن عبر SSE ومعه دليل القرار. وتكلفة الطلب قراءة واحدة من الكاش.',
        trace: 'Redis HIT (1.1ms) -> policy_ver==current -> SSE + evidence{EXACT}',
        notes: ['يُقدَّم من Redis أو LRU', 'إعادة الاستخدام تُسجَّل أيضًا، حتى يمكن تدقيقها']
      },
      {
        label: 'بحث دلالي',
        title: 'الطلب الفائت يتحول إلى بحث متجهي',
        body:
          'عند الفوات يحسب ONNX Embed متجهًا من 384 بُعدًا داخل العملية ويستعلم pgvector ضمن العميل والنموذج أنفسهما. أقرب جار ليس إجابة بعد؛ إنه اقتراح.',
        trace: 'Exact MISS -> ONNX 384-d embed -> pgvector HNSW top-k (tenant, model)',
        notes: ['التضمين يُحسب داخل العملية', 'الجيران من pgvector، ضمن العميل والنموذج']
      },
      {
        label: 'بوابة السياسة',
        title: 'على الاقتراح أن يعبر البوابة',
        body:
          'دالة Policy gate النقية تقرر هل الطلبان متكافئان فعلًا. نفس المدخلات، نفس القرار: بلا استدعاء نموذج، وبلا شبكة، وبلا حالة مشتركة، فيمكن اختبارها وتفسيرها.',
        trace: 'gate(tenant, model, temp, sys_fp, policy_ver, sim>=th) -> PASS -> SSE',
        notes: [
          'العميل والمزوّد والنموذج',
          'temperature وmax_tokens',
          'بصمة تعليمات النظام وإصدار السياسة',
          'تشابه يتجاوز الحد المعاير'
        ]
      },
      {
        label: 'إلى المزوّد',
        title: 'استدعاء واحد إلى المزوّد يعود بالبث ومعه دليله',
        metric: '50 → 1',
        body:
          'تُدمج الطلبات المرفوضة المتطابقة في Single-flight إلى استدعاء واحد خلف إعادة المحاولة وقاطع الدائرة. يبث SSE Reply الإجابة بينما يُملأ Exact cache بالنتيجة.',
        trace: 'gate REJECT -> singleflight(50->1) -> retry/breaker -> SSE + cache fill',
        notes: [
          'single-flight: خمسون استدعاءً متزامنًا في واحد',
          'تبديل إلى مزوّد آخر مع إعادة المحاولة وقاطع الدائرة',
          'دليل لكل رد: القرار، والسياسة، والتشابه، والتكلفة'
        ]
      }
    ]
  },
  'smart-cache-engine': {
    title: 'كيف يمر المفتاح في الكاش',
    hint: 'اختر خطوة',
    steps: [
      {
        label: 'الكتابة',
        title: 'الكتابة تلمس بنيتين في اللحظة نفسها',
        body:
          'يدخل Op Router العنصر الجديد إلى Hash map للبحث بزمن O(1)، وإلى مقدمة LRU list للترتيب. إحداهما وحدها تعطيك كاشًا سريعًا لا يستبعد، أو كاشًا يستبعد لكنه يمسح كل شيء ليجد مفتاحًا.',
        metric: 'O(1)',
        trace: 'SET k v -> map[k]=node + lru.pushHead(node) -> O(1) dual write',
        notes: ['جدول التجزئة: من المفتاح إلى العقدة', 'القائمة المترابطة: ترتيب الحداثة', 'الاثنان يتحدثان في العملية نفسها']
      },
      {
        label: 'الترتيب',
        title: 'القائمة هي عمر البيانات',
        body:
          'المقدمة أحدث ما استُخدم، والذيل أول ما يخرج. وكل قراءة أو كتابة تنقل عقدة إلى مقدمة LRU list بأربع إسنادات للمؤشرات لا بحث.',
        trace: 'lru.moveToHead(node) -> prev/next ptr relink (4 ops, 0 scans)',
        notes: ['المقدمة = الأحدث', 'الذيل = الأقدم', 'الترقية عمل مؤشرات، لا فرز']
      },
      {
        label: 'المحاسبة',
        title: 'كل عنصر يُحاسَب قبل أن يُخزَّن',
        body:
          'يعدّ Byte cap المفاتيح والقيم والحمولة الزائدة بالبايت. وحين تتجاوز الكتابة سقف الذاكرة، لا يرمي الكاش استثناءً بل يفسح مكانًا. هذا الفرق بين كاش وقاموس.',
        trace: 'bytes += len(k) + len(v) + overhead -> check(bytes <= cap_bytes)',
        notes: ['محاسبة بالبايت، لا بعدد العناصر', 'السقف مفروض عند الكتابة', 'المتصل يرى عملية تخزين عادية']
      },
      {
        label: 'الاستبعاد',
        title: 'الكاش الممتلئ يُسقط الذيل',
        body:
          'يفصل Tail evictor عقدة الأقل استخدامًا من ذيل القائمة بزمن ثابت، ويحذف خانتها من Hash map في الخطوة نفسها. لا مسح لأي شيء، فلا يصبح الاستبعاد أبطأ كلما امتلأ الكاش.',
        metric: 'O(1)',
        trace: 'bytes > cap -> tail=lru.popTail() -> delete map[tail.k] -> O(1) free',
        notes: ['افصل الذيل واحذف الخانة', 'بلا مسح وبلا فرز', 'يُبلَّغ بالمفتاح المستبعد كي يعرف المتصل']
      },
      {
        label: 'القراءة',
        title: 'القراءة بحث وترقية',
        body:
          'تشير الخانة إلى العقدة مباشرة. عند الإصابة تنتقل العقدة إلى المقدمة وتُعاد القيمة، وعند الفوات يدمج Stampede guard الطلبات المتزامنة على المفتاح نفسه ليُملأ مرة واحدة.',
        trace: 'GET k -> map[k]? promote : stampede.coalesce(k) -> fill once',
        notes: ['إصابة: بحث O(1) ونقل للعقدة', 'فوات: يدمجه Stampede guard بلا تدافع']
      },
      {
        label: 'الانتهاء',
        title: 'TTL يُفهرَس عند الكتابة، ويُمسح في الخلفية',
        body:
          'كل كتابة بانتهاء صلاحية تسجّل موعدها في TTL ZSet بينما تفحص القراءة الانتهاء بتكاسل. ويمسح TTL Sweeper دفعات منتهية دوريًا في الخلفية حتى لا تشغل الذاكرة.',
        trace: 'ZADD ttl_zset exp k -> lazy read check + sweeper(batch) -> unlink',
        notes: ['فهرس ZADD عند الكتابة', 'انتهاء متكاسل عند القراءة + مسح نشط في الخلفية', 'المنتهي فوات، لا إجابة قديمة']
      }
    ]
  },
  'amen-stories': {
    title: 'كيف يتحول الطلب إلى كتاب',
    hint: 'اختر خطوة',
    steps: [
      {
        label: 'السلة',
        title: 'العميل يختار قصة وصيغة',
        body:
          'المتجر يبيع قصصًا مخصّصة. تحمل السلة الكتاب واللغة والصيغة وخيارات التخصيص، وتسلّم البيانات الموثَّقة إلى Stripe Checkout.',
        trace: 'POST /cart -> {story_id, lang, format, child_name} -> checkout.create()',
        notes: ['كتالوج بعدة لغات', 'الصيغة والتخصيص يمران مع الطلب']
      },
      {
        label: 'الدفع',
        title: 'Stripe يأخذ المال، والـ webhook يغلق الحلقة',
        body:
          'الدفع يجري في Stripe. يتحقق الباك إند من توقيع HMAC في Webhook ويعدّه مصدر الحقيقة، فلا ينشئ تحديث للصفحة ولا نقر مزدوج طلبًا ثانيًا.',
        trace: 'POST /webhooks/stripe -> verify(HMAC-SHA256) -> checkout.session.completed',
        notes: ['Stripe Checkout', 'حالة موثقة بتوقيع HMAC، لا ردود العميل']
      },
      {
        label: 'الطلب',
        title: 'الطلب هو السجل الذي يقرأ منه بقية النظام',
        body:
          'بعد الدفع يصبح Orders FSM السجل المتكرر الآمن الذي تعمل منه كل مهمة في الخلفية: ماذا يُبنى، ومن يرسمه، وماذا يُرسل. والـ idempotency مكانها هنا، لا في الواجهة.',
        trace: 'INSERT orders ON CONFLICT(stripe_event_id) DO NOTHING -> state=PAID',
        notes: ['طلب واحد لكل دفعة', 'تحولات الحالة FSM هي التي تقود المهام']
      },
      {
        label: 'الإسناد',
        title: 'يُسند العمل إلى فنان وتحديث الطلب بالرسم المعتمد',
        body:
          'القصص المخصّصة تحتاج رسمًا بشريًا. يقيّد Studio RBAC قائمة Artist Queue ليرى كل فنان طلباته فقط ويرى المدير كل شيء، وعند اعتماد الرسم يعود التحديث إلى Orders FSM.',
        trace: 'rbac(role==ARTIST) -> artist_queue.claim() -> approved art -> FSM',
        notes: ['قائمة الفنان محكومة بصلاحيات RBAC', 'الرسم المعتمد يعود لتحديث الطلب']
      },
      {
        label: 'البناء',
        title: 'يُولَّد EPUB غير متزامنًا من الطلب',
        body:
          'يسحب EPUB Worker الطلبات المعتمدة خارج مسار الطلب ويبني الكتاب من القصة واللغة والرسم المعتمد، ثم يربط الملف بالطلب ليبقى الدفع سريعًا.',
        trace: 'enqueue(order_id) -> worker.renderEPUB(lang, art, text) -> attach asset',
        notes: ['التوليد خارج مسار الطلب', 'الملف مربوط بالطلب']
      },
      {
        label: 'التسليم',
        title: 'يُسلَّم الكتاب وتبقى الجلسة حية',
        body:
          'يقدّم Delivery كتاب EPUB الجاهز مربوطًا بالطلب، وتبقي المهام الخلفية الجلسات وحالة الطلبات سليمة بعد ذلك. وهذا الجزء لا يراه أحد إلى أن يتوقف عن العمل.',
        trace: 'signed_url(EPUB) -> customer download + cron session/order upkeep',
        notes: ['التسليم مربوط بالطلب', 'مهام خلفية لصيانة الجلسات']
      }
    ]
  },
  'epub-to-pdf': {
    title: 'كيف يتحول الكتاب إلى PDF',
    hint: 'اختر خطوة',
    steps: [
      {
        label: 'الأرشيف',
        title: 'افتح الكتاب كأرشيف',
        body:
          'EPUB ZIP أرشيف له قواعد. يفكّه الخط في مجلد عمل مؤقت ويقرأ META-INF/container.xml أولًا ليجد ملف الحزمة، بدل التخمين في أسماء الملفات.',
        trace: 'unzip(book.epub, tmp_dir) -> read META-INF/container.xml -> OPF',
        notes: ['الفك في مجلد عمل مؤقت', 'container.xml يشير إلى ملف الحزمة']
      },
      {
        label: 'الحزمة',
        title: 'ملف الحزمة يعطيك الـ spine',
        body:
          'يضم Container OPF البيان والـ spine. والـ spine هو ترتيب الصفحات الدقيق الذي وضعه المؤلف، ويغذّي قائمة Spine XHTML مع أبعاد الصفحة المعلنة.',
        trace: 'parse(OPF) -> manifest[id->href] + spine[0..N] + pageSize(w, h)',
        notes: ['ترتيب الـ spine، لا الترتيب الأبجدي', 'البيان يربط المعرّفات بالملفات', 'حجم الصفحة من بيانات الكتاب']
      },
      {
        label: 'الصفحة',
        title: 'عنصر spine واحد في كل مرة',
        body:
          'تُحمَّل كل صفحة Spine XHTML بوسومها وورقة أنماطها. ولا دمج ولا إعادة تنسيق بين الصفحات، فإن كتب التخطيط الثابت تنكسر هكذا.',
        trace: 'for item in spine -> load(item.xhtml, item.css) -> isolated page',
        notes: ['تحليل XHTML لكل عنصر spine', 'أنماط الناشر محترمة']
      },
      {
        label: 'مساحة العرض',
        title: 'مساحة العرض هي الصفحة',
        body:
          'يضبط Viewport الإطار على الحجم المعلن في الكتاب بمعامل scale=1، ثم يطبّق Fonts + CSS حقن الخطوط وتجاوزات الطباعة ليطابق الشاشة الورق.',
        trace: 'setViewport({ width: w, height: h, deviceScaleFactor: 1 }) + CSS',
        notes: ['مساحة دقيقة، scale=1', 'الصفحة صفحة، لا تقريب أعيد تنسيقه']
      },
      {
        label: 'العرض',
        title: 'الخطوط تدخل والصفحة تخرج، مع حلقة لكل spine',
        body:
          'يلتقط Puppeteer الصفحة بكثافة الطباعة، ثم يدور عبر مسار العودة إلى عنصر Spine XHTML التالي حتى تُطبع كل صفحات الكتاب.',
        trace: 'inject(@font-face + print.css) -> page.pdf() -> spine[i].pdf -> next',
        notes: ['حقن @font-face مع الاستبدال', 'تجاوزات CSS للطباعة', 'تكرار الحلقة لكل عنصر spine']
      },
      {
        label: 'التجميع',
        title: 'اجمع بترتيب الـ spine ثم نظّف في جميع المسارات',
        body:
          'يدمج PDF Merger صفحات PDF بترتيب الـ spine عبر pdf-lib. ويمسح Cleanup مجلد العمل عبر مسار finally المضمون عند النجاح وعند الفشل حتى لا يمتلئ القرص.',
        trace: 'pdf-lib.merge(spine[0..N]) -> out.pdf -> finally { rm(tmp_dir) }',
        notes: ['الدمج بـ pdf-lib', 'رفّ كامل لا ملف واحد', 'مسار finally للتنظيف يعمل دائمًا']
      }
    ]
  }
};

export const flows: Record<Lang, Record<string, Flow>> = { en, ar };

export const getFlow = (lang: Lang, slug: string): Flow | undefined => flows[lang]?.[slug];
