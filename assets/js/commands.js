/* ============================================================
   Command engine — the whole terminal's brain.
   One structure: { commandName: { help, hash, run } }.
   To add a command: add one entry here + one line in `help`.
   No DOM access here — renderers get a tiny `ctx` API:
     ctx.print(html)  append a wrapped text line (pre-wrap)
     ctx.blank()      append an empty line
     ctx.clear()      wipe all output
     ctx.setHash(h)   route URL hash (shareable / back+forward)
   Commands receive (ctx, rest) — rest is everything typed after
   the command name (used by cowsay, encode, decode, ping, theme).
   Everything else (input, history, boot, hashing) lives in main.js
   ============================================================ */

(function () {
  "use strict";

  /* ---------- editable constants — replace the two URLs with the real profiles ---------- */
  var LINKEDIN = "https://www.linkedin.com/in/ahmed-abdelgelel-6aa523283/";
  var GITHUB = "https://github.com/AhmedAbdelgelel";
  var EMAIL = "ahmed4bdelgelel@gmail.com";
  var PHONE = "+20 102 665 7839";

  /* ---------- tiny helpers ---------- */
  var pad = function (s, n) {
    return s + " ".repeat(Math.max(0, n - s.length));
  };

  var esc = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  /* external = true → opens in a new tab; mailto/tel stay in place */
  var linkify = function (label, href, external) {
    var extra = external ? ' target="_blank" rel="noopener"' : "";
    return '<a href="' + esc(href) + '"' + extra + ">" + esc(label || href) + "</a>";
  };

  /* copy chip — main.js intercepts clicks and writes to the clipboard */
  var copyChip = function (value, label) {
    return '<a class="copy" data-copy="' + esc(value) + '" href="#">[' +
      (label || "copy") + "]</a>";
  };

  /* today as YYYY-MM-DD — used by `version` */
  var today = (function () {
    var d = new Date();
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  })();

  /* skin detection — mirrors main.js (kept local so commands can adapt text) */
  var mobile = function () {
    try {
      return window.matchMedia("(max-width: 640px)").matches;
    } catch (e) {
      return false;
    }
  };

  /* sheet-ghost — the neofetch/danny logo */
  var GHOST_ART = [
    '        .-""""""-.',
    "      .'          '.",
    "     /   (o)  (o)   \\",
    "    :     \\____/     :",
    "    :   (  '--'  )   :",
    "     \\  (_______)  /",
    "      '.   ~~|~~  .'",
    "        '.  | |  .'",
    "          '.| |.'",
    "            | |",
    "           (_|_)",
  ];

  var ghost = function (ctx) {
    GHOST_ART.forEach(function (row) {
      ctx.print('<span class="art">' + esc(row) + "</span>");
    });
  };

  /* danny caption rotation — one random post-script after the classic quote */
  var GHOST_BANTER = [
    "the terminal reports <b>ECTOPLASM</b> levels: off the charts.",
    "he is half ghost, half human, 100% unhireable.",
    "you file a bug report — he wails at it until it resolves itself.",
    "license plate: <b>GHOST14</b> — yes, really.",
    "he lists 'boo' as a full-stack skill on his ghost resume.",
    "his wail auto-scales. no autoscaling groups needed.",
    "dash through walls, deploy through <b>vault</b> — same energy.",
    "he tried printf(\"boo\"); — the terminal got scared.",
  ];

  /* ---------- CV database + full-page renderer ---------- */
  var CV = {
    name: "Ahmed Mohammed Abdelgelel",
    role: "Software Engineer · Co-Founder @ Penta Studio",
    location: "Cairo, Egypt · UTC+2 · Remote-friendly",
    contacts: [
      { label: "email", value: EMAIL, href: "mailto:" + EMAIL, copy: true, external: false },
      { label: "phone", value: PHONE, href: "tel:" + PHONE.replace(/\s/g, ""), copy: true, external: false },
      { label: "linkedin", value: LINKEDIN, href: LINKEDIN, copy: false, external: true },
      { label: "github", value: GITHUB, href: GITHUB, copy: false, external: true },
    ],
    summary:
      "Backend engineer with 2 years of hands-on experience building real-world products in " +
      "Node.js / JavaScript — RESTful APIs, session & auth flows, backend architecture. " +
      "Comfortable owning services end-to-end: system design, payments, media pipelines, " +
      "background jobs and cloud infrastructure. 79 unit tests and zero excuses.",
    experience: [
      {
        role: "Co-Founder & Software Engineer — Penta Studio (Remote)",
        dates: "Dec 2025 — present",
        bullets: [
          "Co-founded a digital product studio building secure, scalable web and mobile products.",
          "Architect and lead backend for client projects — ExpressJS / NestJS + cloud infra.",
          "System design, API architecture and third-party integrations, concept to launch.",
        ],
      },
      {
        role: "Backend Developer — Amen Stories",
        dates: "Feb 2025 — present",
        bullets: [
          "Full backend for a story-commerce platform: cart, Stripe payments, EPUB generation.",
          "Artist assignment workflows, multilingual story structures, media upload pipelines.",
          "RBAC for admins, artists and customers; background jobs for order processing.",
        ],
      },
      {
        role: "Freelance Backend Developer — Naqaa Al-Ain, KSA",
        dates: "Apr 2025 — Aug 2025",
        bullets: [
          "RESTful APIs for orders, invoices and payment workflows.",
          "Role-based auth for admins, staff and clients; Azure OCR receipt extraction.",
          "Optimized DB workflows for reliability and scalability in production.",
        ],
      },
    ],
    projects: [
      {
        name: "Smart Cache Engine",
        url: "https://github.com/AhmedAbdelgelel/Cache-engine",
        lines: [
          "Redis-inspired in-memory cache built from scratch in Node.js — 3M+ ops/sec.",
          "O(1) LRU eviction via doubly linked list + hashmap; dual-layer TTL expiration.",
          "Byte-level memory caps, Sorted Sets with a Stampede Guard (99.9% fewer backend calls).",
          "p50/p95/p99 latency metrics via reservoir sampling. 79 unit tests, zero dependencies.",
        ],
      },
      {
        name: "EPUB-to-PDF Converter",
        url: "https://github.com/Mo7ammedd/epub-to-pdf",
        lines: [
          "Fixed-layout EPUB rendering pipeline: XHTML parsing, Puppeteer viewport rendering.",
          "Font injection via @font-face with global CSS overrides; batch PDF generation via pdf-lib.",
          "Auto-cleanup of temp files; designed to run as an unattended background job.",
        ],
      },
    ],
    education: "B.Sc. Computer Science — Mansoura University, 2025",
    skills: [
      ["languages", "JavaScript, TypeScript, C++, C#, Java, Go, Python"],
      ["backend", "Node.js, Express.js, NestJS, REST API Design"],
      ["databases", "MongoDB, PostgreSQL, MySQL"],
      ["devops", "Docker, Azure, Cloud Storage, CI/CD, Linux, Git"],
      ["testing", "Jest, Mocha"],
      ["frontend", "HTML, CSS, Bootstrap, React.js"],
    ],
  };

  /* résumé streamed into the terminal by the cv.txt loader in main.js */
  window.app = window.app || {};   /* ensure the global exists here (bottom init is later) */
  window.app.CV = CV;              /* the menu + loader read the same data */
  window.app.CONST = { EMAIL: EMAIL, PHONE: PHONE, LINKEDIN: LINKEDIN, GITHUB: GITHUB };
  window.app.cvLines = function () {
    var L = [];
    var rule = function () { L.push('<span class="dim">' + "─".repeat(60) + "</span>"); };
    var sec = function (num, name) {
      rule();
      L.push('<span class="dim">[' + num + "] " + name + "</span>");
    };
    var wrap = function (text, width) {
      var out = [], cur = "";
      text.split(" ").forEach(function (w) {
        if (cur && (cur + " " + w).length > width) { out.push(cur); cur = w; }
        else cur = cur ? cur + " " + w : w;
      });
      if (cur) out.push(cur);
      return out;
    };
    L.push("<b>" + esc(CV.name) + "</b>");
    L.push(esc(CV.role));
    L.push('<span class="dim">' + esc(CV.location) + "</span>");
    wrap(CV.summary, 66).forEach(function (ln) { L.push("  " + esc(ln)); });

    sec("01", "experience");
    CV.experience.forEach(function (job) {
      L.push('<span class="jobrow"><span><b>' + esc(job.role) + "</b></span><span class=\"jobrow__dates\">" + esc(job.dates) + "</span></span>");
      job.bullets.forEach(function (b, i) { L.push("  " + (i + 1) + ". " + esc(b)); });
    });

    sec("02", "projects");
    CV.projects.forEach(function (p) {
      L.push("<b>" + esc(p.name) + "</b>" +
        (p.url ? ' <a href="' + p.url + '" target="_blank" rel="noopener" class="dim">' + esc(p.url.replace("https://github.com/", "")) + "</a>" : ""));
      p.lines.forEach(function (l, i) { L.push("  " + (i + 1) + ". " + esc(l)); });
    });

    sec("03", "skills & stack");
    CV.skills.forEach(function (s) { L.push(pad(s[0], 11) + esc(s[1])); });

    sec("04", "education");
    L.push(esc(CV.education));

    sec("05", "contact");
    CV.contacts.forEach(function (c) {
      L.push(pad("<b>" + esc(c.label) + "</b>", 11) + linkify(c.value, c.href, c.external) +
        (c.copy ? " " + copyChip(c.value) : ""));
    });
    rule();
    L.push('<span class="dim">(end of cv.txt — type <b>menu</b> to reopen the index)</span>');
    return L;
  };

  /* shell per platform — ios → zsh, android → termux bash, else cmd.exe */
  var shellName = function () {
    var p = (window.app && window.app.platform) || "desktop";
    if (p === "ios") return "zsh 5.9 (iOS)";
    if (p === "android") return "bash 5.2.15 (Termux)";
    return "cmd.exe";
  };

  /* ============================================================
     COMMAND TABLE
     ============================================================ */
  var commands = {
    /* ---------- help ---------- */
    help: {
      help: "list every command",
      hash: "help",
      run: function (ctx, rest) {
        if (rest.trim()) {
          var target = window.app.resolve(rest.trim());
          if (target && target.help) {
            ctx.print(pad("<b>" + esc(rest.trim()) + "</b>", 15) + "— " + esc(target.help) +
              (target.hash ? ' <span class="dim">· shareable: /#' + esc(target.hash) + "</span>" : ""));
          } else {
            ctx.print('<span class="dim">help: no such command — try <b>help</b> for the list</span>');
          }
          return;
        }
        ctx.print('<span class="dim">sections are offline — type <b>help</b> to boot one:</span>');
        ctx.print(pad("<b>help</b>", 15) + "— list every command · try <b>help &lt;cmd&gt;</b> for details");
        ctx.print(pad("<b>projects</b>", 15) + "— selected builds");
        ctx.print(pad("<b>stack</b>", 15) + "— print the stack");
        ctx.print(pad("<b>whoami</b>", 15) + "— identity");
        ctx.print(pad("<b>experience</b>", 15) + "— career log");
        ctx.print(pad("<b>penta</b>", 15) + "— studio blurb");
        ctx.print(pad("<b>hire</b>", 15) + "— availability card");
        ctx.print(pad("<b>contact</b>", 15) + "— reach me");
        ctx.print(pad("<b>info</b>", 15) + "— system overview (neofetch)");
        ctx.print(pad("<b>cv</b>", 15) + "— full résumé (opens cv.pdf)");
        ctx.print(pad("<b>version</b>", 15) + "— build info");
        ctx.blank();
        ctx.print('<span class="dim">fun — because terminals need it:</span>');
        ctx.print(pad("<b>matrix</b>", 15) + "— green code rain");
        ctx.print(pad("<b>guess</b>", 15) + "— number guessing game");
        ctx.print(pad("<b>cowsay &lt;text&gt;</b>", 15) + "— (cow) your text");
        ctx.print(pad("<b>rick</b>", 15) + "— never gonna give you up");
        ctx.print(pad("<b>danny</b>", 15) + "— ascii danny phantom");
        ctx.print(pad("<b>sudo</b>", 15) + "— admin access");
        ctx.print(pad("<b>su</b>", 15) + "— switch user — guess the password");
        ctx.print(pad("<b>fortune</b>", 15) + "— cookie, terminal edition");
        ctx.print(pad("<b>hack &lt;target&gt;</b>", 15) + "— full mainframe invasion (probably)");
        ctx.print(pad("<b>coffee</b>", 15) + "— brew a virtual one");
        ctx.blank();
        ctx.print('<span class="dim">tools:</span>');
        ctx.print(pad("<b>ls &lt;dir&gt;</b>", 15) + "— files in this terminal");
        ctx.print(pad("<b>tree</b>", 15) + "— the file tree, drawn badly");
        ctx.print(pad("<b>cat &lt;file&gt;</b>", 15) + "— read a terminal file");
        ctx.print(pad("<b>ping</b>", 15) + "— real latency to this site");
        ctx.print(pad("<b>theme</b>", 15) + "— exact official vscode palettes: theme list / theme <name>");
        ctx.print(pad("<b>encode &lt;text&gt;</b>", 15) + "— base64 encode");
        ctx.print(pad("<b>decode &lt;text&gt;</b>", 15) + "— base64 decode");
        ctx.print(pad("<b>speed</b>", 15) + "— typing speed: slow / normal / fast");
        ctx.print(pad("<b>sound</b>", 15) + "— keypress blips: on / off");
        ctx.print(pad("<b>clear</b>", 15) + "— wipe the terminal");
        ctx.blank();
        ctx.print('<span class="dim">aliases: ? · cls · dir · phantom</span>');
      },
    },

    /* ---------- whoami ---------- */
    whoami: {
      help: "identity",
      hash: "whoami",
      run: function (ctx) {
        ctx.print("<b>Ahmed Mohammed Abdelgelel</b>");
        ctx.print("Software Engineer · Co-Founder @ Penta Studio");
        ctx.print("Cairo, Egypt");
        ctx.blank();
        ctx.print("2 years building Node.js / JavaScript backend systems — RESTful");
        ctx.print("APIs, session &amp; auth flows, backend architecture for real-world");
        ctx.print("products. B.Sc. Computer Science, Mansoura University, 2025.");
      },
    },

    /* ---------- projects ---------- */
    projects: {
      help: "selected builds",
      hash: "projects",
      run: function (ctx) {
        ctx.print("<b>Smart Cache Engine</b>");
        ctx.print("  <a href=\"https://github.com/AhmedAbdelgelel/Cache-engine\" target=\"_blank\" rel=\"noopener\" class=\"dim\">github.com/AhmedAbdelgelel/Cache-engine</a>");
        ctx.print("  Redis-inspired in-memory cache built from scratch in Node.js —");
        ctx.print("  3M+ ops/sec. O(1) LRU eviction via doubly linked list + hashmap,");
        ctx.print("  dual-layer TTL expiration, byte-level memory caps, Sorted Sets");
        ctx.print("  with a Stampede Guard (99.9% fewer backend calls) and p50/p95/p99");
        ctx.print("  latency metrics. 79 unit tests, zero dependencies.");
        ctx.blank();
        ctx.print("<b>EPUB-to-PDF Converter</b>");
        ctx.print("  <a href=\"https://github.com/Mo7ammedd/epub-to-pdf\" target=\"_blank\" rel=\"noopener\" class=\"dim\">github.com/Mo7ammedd/epub-to-pdf</a>");
        ctx.print("  Unpacks EPUB archives, parses XHTML, renders each page via");
        ctx.print("  Puppeteer at exact viewport dimensions for fixed-layout fidelity.");
        ctx.print("  Font injection via @font-face with global CSS overrides; batch");
        ctx.print("  PDF generation and merging via pdf-lib; auto-cleanup of temp files.");
      },
    },

    /* ---------- education ---------- */
    education: {
      help: "B.Sc. Computer Science",
      hash: "education",
      run: function (ctx) {
        ctx.print("<b>education</b>");
        ctx.print("  " + CV.education);
      },
    },

    /* ---------- stack ---------- */
    stack: {
      help: "print the stack",
      hash: "stack",
      run: function (ctx) {
        ctx.print(pad("languages", 10) + "JavaScript, TypeScript, C++, C#, Java, Go, Python");
        ctx.print(pad("backend", 10) + "Node.js, Express.js, NestJS, REST API Design");
        ctx.print(pad("databases", 10) + "MongoDB, PostgreSQL, MySQL");
        ctx.print(pad("devops", 10) + "Docker, Azure, Cloud Storage, CI/CD, Linux, Git");
        ctx.print(pad("testing", 10) + "Jest, Mocha");
        ctx.print(pad("frontend", 10) + "HTML, CSS, Bootstrap, React.js");
      },
    },

    /* ---------- experience ---------- */
    experience: {
      help: "career log",
      hash: "experience",
      run: function (ctx) {
        ctx.job(
          "Co-Founder & Software Engineer — Penta Studio (Remote)",
          "Dec 2025 — present",
          [
            "Co-founded a digital product studio building secure, scalable web and mobile products.",
            "Architect and lead backend for client projects — ExpressJS / NestJS + cloud infra.",
            "System design, API architecture and third-party integrations, concept to launch.",
          ]
        );
        ctx.job(
          "Backend Developer — Amen Stories",
          "Feb 2025 — present",
          [
            "Full backend for a story-commerce platform: cart, Stripe payments, EPUB generation.",
            "Artist assignment workflows, multilingual story structures, media upload pipelines.",
            "RBAC for admins, artists and customers; background jobs for order processing.",
          ]
        );
        ctx.job(
          "Freelance Backend Developer — Naqaa Al-Ain, KSA",
          "Apr 2025 — Aug 2025",
          [
            "RESTful APIs for orders, invoices and payment workflows.",
            "Role-based auth for admins, staff and clients; Azure OCR receipt extraction.",
            "Optimized DB workflows for reliability and scalability in production.",
          ]
        );
      },
    },

    /* ---------- penta ---------- */
    penta: {
      help: "studio blurb",
      hash: "penta",
      run: function (ctx) {
        ctx.print("<b>Penta Studio</b>");
        ctx.print("A digital product studio building secure, scalable web and mobile");
        ctx.print("products for startups and enterprises. Co-founded Dec 2025.");
      },
    },

    /* ---------- info — neofetch-style system screen ---------- */
    info: {
      help: "system overview (neofetch)",
      hash: "info",
      run: function (ctx) {
        var host = mobile() ? "glgl@phone" : "glgl@win";
        var ua = "";
        try {
          ua = navigator.userAgent;
        } catch (e) { /* ignore */ }
        var v8 = (ua.match(/Chrome\/(\d+)/) || [])[1] || "ES2024";
        var p = (window.app && window.app.platform) || "desktop";
        var os = p === "ios" ? "iOS 17 · agbox" : p === "android" ? "Android 14 · Termux" : "Windows 10.0.22631 · cmd.exe";
        var shell = shellName();
        var uptime = Math.round(performance.now() / 1000) + "s";
        var theme = "termux";
        try {
          theme = localStorage.getItem("glgl-theme") || "termux";
        } catch (e) { /* ignore */ }

        ghost(ctx);
        ctx.print('<span class="dim">' + pad(host, 12) + "</span>");
        ctx.print(pad("OS", 10) + os);
        ctx.print(pad("Host", 10) + "this site — vanilla JS, zero deps");
        ctx.print(pad("Kernel", 10) + "V8 " + v8 + " (browser)");
        ctx.print(pad("Uptime", 10) + uptime + " + a few decades of caffeine");
        ctx.print(pad("Shell", 10) + shell);
        ctx.print(pad("Theme", 10) + theme);
        ctx.print(pad("Commands", 10) + Object.keys(window.app.commands).length + " available");
        ctx.print(pad("Links", 10) + linkify("GitHub", GITHUB, true) + " · " + linkify("LinkedIn", LINKEDIN, true));
      },
    },

    /* ---------- hire ---------- */
    hire: {
      help: "availability card",
      hash: "hire",
      run: function (ctx) {
        ctx.print("<b>Currently open to backend &amp; full-stack roles</b>");
        ctx.print('<span class="dim">  · remote-friendly · Cairo, Egypt (UTC+2)</span>');
        ctx.print('<span class="dim">  · available immediately</span>');
        ctx.blank();
        ctx.print("request a résumé: " + linkify(EMAIL, "mailto:" + EMAIL) +
          " " + copyChip(EMAIL, "copy"));
        ctx.print("or connect on " + linkify("LinkedIn", LINKEDIN, true));
        ctx.blank();
        ctx.print('<span class="dim">full résumé: run <b>cv</b> ' +
          '<a href="#" data-action="cv">[open cv.pdf]</a></span>');
      },
    },

    /* ---------- cv ---------- */
    cv: {
      help: "full résumé — cv.pdf is offered as an option to open",
      hash: "cv",
      run: function (ctx) {
        if (window.app.cvLoad) window.app.cvLoad();
        else ctx.print('<span class="dim">cv loader unavailable on this build</span>');
      },
    },

    /* ---------- contact ---------- */
    contact: {
      help: "reach me",
      hash: "contact",
      run: function (ctx) {
        ctx.print(pad("email", 10) + linkify(EMAIL, "mailto:" + EMAIL) + " " + copyChip(EMAIL));
        ctx.print(pad("phone", 10) + linkify(PHONE, "tel:" + PHONE.replace(/\s/g, "")) + " " + copyChip(PHONE, "copy"));
        ctx.print(pad("linkedin", 10) + linkify(LINKEDIN, LINKEDIN, true));
        ctx.print(pad("github", 10) + linkify(GITHUB, GITHUB, true));
        ctx.blank();
        ctx.print('<span class="dim">scan to connect:</span>');
        ctx.print(
          '<img class="qr" loading="lazy" alt="QR code — LinkedIn profile" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=' +
          encodeURIComponent(LINKEDIN) +
          '" />'
        );
      },
    },

    /* ---------- ping — real latency against this site ---------- */
    ping: {
      help: "real latency to this site",
      hash: null,
      run: function (ctx, rest) {
        if (rest) {
          ctx.print('<span class="dim">ping: cross-origin targets are blocked by CORS —</span>');
          ctx.print('<span class="dim">use bare <b>ping</b> to probe this site.</span>');
          return;
        }
        var origin = "";
        try {
          origin = location.origin;
        } catch (e) { /* ignore */ }
        var url = origin + "/?probe=" + Date.now();
        var times = [];
        var seq = function (i) {
          var t0 = performance.now();
          fetch(url, { cache: "no-store" })
            .then(function (r) {
              var ms = performance.now() - t0;
              return r.text().then(function () { return ms; });
            })
            .catch(function () {
              throw new Error("fetch failed");
            })
            .then(function (ms) {
              times.push(ms);
              ctx.print("64 bytes from " + esc(origin.replace(/^https?:\/\//, "")) + ": icmp_seq=" + (i + 1) + " time=" + ms.toFixed(1) + " ms");
              if (i === 3) summary(ctx, times);
            })
            .catch(function () {
              ctx.print("Request failed — offline or CORS-blocked.");
              ctx.blank();
            });
        };
        var summary = function (ctx2, ts) {
          if (ts.length !== 4) return;
          var avg = ts.reduce(function (a, b) { return a + b; }, 0) / ts.length;
          var min = Math.min.apply(null, ts);
          var max = Math.max.apply(null, ts);
          ctx2.print("--- latency statistics ---");
          ctx2.print("4 packets transmitted, 4 received, 0% packet loss");
          ctx2.print("rtt min/avg/max = " + min.toFixed(1) + "/" + avg.toFixed(1) + "/" + max.toFixed(1) + " ms");
          ctx2.blank();
        };
        ctx.print("PING " + esc(origin.replace(/^https?:\/\//, "")) + " (56 data bytes)");
        for (var i = 0; i < 4; i++) seq(i);
      },
    },

    /* ---------- theme — 12 exact official vscode palettes, applied instantly ---------- */
    theme: {
      help: "12 exact official vscode palettes — theme <name> or theme list",
      hash: null,
      run: function (ctx, rest) {
        /* termux is android-only: the real Termux default scheme — green on black.
           on cmd.exe / iOS it does not exist, so it cannot even be picked. */
        var plat = (window.app && window.app.platform) || "desktop";
        var STORE = [
          { n: "termux",     a: "Termux",           c: "#00ff41", d: "the real termux default — green on black (android only)" },
          { n: "solarized",  a: "Ethan Schoonover", c: "#b58900", d: "a precise color scheme for machines and people" },
          { n: "dracula",    a: "Dracula Theme",   c: "#bd93f9", d: "dark theme, purple vibes, zero vampires" },
          { n: "onedark",    a: "binaryify",       c: "#61afef", d: "one dark pro — the vscode staple" },
          { n: "monokaipro", a: "monokai",         c: "#ffd866", d: "monokai pro — a filter machine for your eyes" },
          { n: "gotham",     a: "whatyouhide",     c: "#599caa", d: "gotham dim — blue hour, terminal edition" },
          { n: "nord",       a: "arcticicestudio", c: "#88c0d0", d: "nord — an arctic, north-bluish palette" },
          { n: "tokyonight", a: "enkia",           c: "#7aa2f7", d: "tokyo night — city lights at 2am" },
          { n: "gruvbox",    a: "morhetz",         c: "#fabd2f", d: "gruvbox dark — retro grease that never cleans off" },
          { n: "catppuccin", a: "Catppuccin",      c: "#89b4fa", d: "catppuccin mocha — soothing pastels" },
          { n: "synthwave",  a: "Robb Owen",       c: "#ff7edb", d: "synthwave '84 — outrun the mainframe" },
          { n: "fall",       a: "Glgl OS",         c: "#ff9e64", d: "autumn amber — the local favorite" },
        ].filter(function (t) { return t.n !== "termux" || plat === "android"; });
        var byName = {};
        STORE.forEach(function (t) { byName[t.n] = t; });

        var current = null;
        try {
          current = localStorage.getItem("glgl-theme");
        } catch (e) { /* ignore */ }
        if (!current) current = plat === "android" ? "termux" : "default";

        var apply = function (ctx2, t) {
          try {
            localStorage.setItem("glgl-theme", t.n);
          } catch (e) { /* ignore */ }
          document.documentElement.setAttribute("data-theme", t.n);
          ctx2.print("theme <b>" + esc(t.n) + "</b> applied — <b>" + esc(t.a) + "</b> <span class=\"dim\">· " +
            esc(t.d) + "</span>");
        };

        var list = function (ctx2) {
          ctx2.print('<span class="dim">─ the theme store · ' + STORE.length + ' themes · the exact palettes from the official vscode releases ─</span>');
          STORE.forEach(function (t) {
            ctx2.print(pad("<b>" + esc(t.n) + "</b>", 14) +
              '<span style="color:' + t.c + '">██</span> ' +
              '<span class="dim">' + esc(t.a) + " · " + esc(t.d) + "</span>");
          });
          ctx2.print('<span class="dim">─ apply one instantly: <b>theme &lt;name&gt;</b> — no installs, no restarts ─</span>');
        };

        var arg = rest.trim().toLowerCase();
        if (!arg) {
          var label = current === "default"
            ? "glgl default <span class=\"dim\">(the native terminal look)</span>"
            : current;
          ctx.print("current theme: <b>" + label + "</b>");
          ctx.print('<span class="dim">usage: <b>theme list</b> — browse · <b>theme &lt;name&gt;</b> — apply instantly</span>');
          return;
        }
        if (arg === "list" || arg === "store" || arg === "browse") { list(ctx); return; }
        if (arg.indexOf("install ") === 0) {
          ctx.print('<span class="dim">no install needed — themes already ship inside the terminal. just pick one:</span>');
          list(ctx);
          return;
        }
        var t = byName[arg];
        if (!t) {
          ctx.print('<span class="dim">"' + esc(rest.trim()) + '" is not in the store — <b>theme list</b> to browse:</span>');
          list(ctx);
          return;
        }
        apply(ctx, t);
      },
    },

    /* ---------- encode / decode — working base64, UTF-8 safe ---------- */
    encode: {
      help: "base64 encode",
      hash: null,
      run: function (ctx, rest) {
        if (!rest) {
          ctx.print('<span class="dim">usage: encode &lt;text to base64-encode&gt;</span>');
          return;
        }
        try {
          var bytes = new TextEncoder().encode(rest);
          var bin = "";
          bytes.forEach(function (b) { bin += String.fromCharCode(b); });
          ctx.print(btoa(bin));
        } catch (e) {
          ctx.print('<span class="dim">encoding failed — ' + esc(String(e)) + "</span>");
        }
      },
    },

    decode: {
      help: "base64 decode",
      hash: null,
      run: function (ctx, rest) {
        if (!rest) {
          ctx.print('<span class="dim">usage: decode &lt;base64 text&gt;</span>');
          return;
        }
        try {
          var bin = atob(rest.replace(/\s/g, ""));
          var bytes = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          ctx.print(new TextDecoder().decode(bytes));
        } catch (e) {
          ctx.print('<span class="dim">decoding failed — is that valid base64?</span>');
        }
      },
    },

    /* ---------- version ---------- */
    version: {
      help: "build info",
      hash: "version",
      run: function (ctx) {
        ctx.print("build 3.3.0 · last deployed " + today + " · running Node.js 22 · " + shellName());
      },
    },

  /* ---------- fun ---------- */
    sudo: {
      help: "admin access — elevates your privileges",
      hash: null,
      run: function (ctx) {
        window.app.admin = true;
        ctx.print("<b>admin</b> — access granted, the terminal is now root.");
        ctx.print('<span class="dim">(with great power comes great responsibility · try <b>ls</b> to look around)</span>');
        ctx.print('<span class="dim">root extras: <b>ls -a</b> · <b>cat .secret</b> · <b>id</b> · <b>top</b> · <b>chmod</b></span>');
      },
    },

    /* root-only theater — a normal user just gets permission denied */
    top: {
      help: "root only — live process list",
      hash: null,
      run: function (ctx) {
        if (!window.app.admin) {
          ctx.print("top: permission denied — system metrics are above your pay grade");
          ctx.print('<span class="dim">(hint: root can see <b>top</b>, <b>ls -a</b>, <b>cat .secret</b>…)</span>');
          return;
        }
        ctx.print('<span class="dim">PID   USER COMMAND</span>');
        ctx.print("1     root nightwatch.ghost — spawning green pixels");
        ctx.print("399   root fix-typos-in-comments.sh (sleeping)");
        ctx.print("1337  glgl  chrome.exe — this very tab (you)");
        ctx.print("404   root cv.pdf — open, loved");
        ctx.print("555   root coffee.engine — steam at full capacity");
        ctx.blank();
        ctx.print('<span class="dim">load average: 0.00, 0.01, 0.69 · memory: 2 résumés of RAM free</span>');
      },
    },

    id: {
      help: "root only — print user identity",
      hash: null,
      run: function (ctx) {
        if (!window.app.admin) {
          ctx.print("uid=1000(glgl) gid=1000(glgl) groups=1000(glgl),27(sudo)");
          return;
        }
        ctx.print("uid=0(root) gid=0(root) groups=0(root), 1337(legend)");
        ctx.print('<span class="dim">(the terminal fears you a little bit now)</span>');
      },
    },

    chmod: {
      help: "root only — wreck the permissions (fun)",
      hash: null,
      run: function (ctx) {
        if (!window.app.admin) {
          ctx.print("chmod: permission denied — 775 is none of your business");
          return;
        }
        ctx.print("chmod 777 * — done.");
        ctx.print('<span class="dim">everything is now readable, writable, and owns you.</span>');
      },
    },

    su: {
      help: "switch user — guess the password",
      hash: null,
      run: function (ctx) {
        ctx.print("password: <span class='dim'>(four lowercase letters — type it, or <b>cancel</b>)</span>");
        window.app.suAsk = true;
      },
    },

    rick: {
      help: "never gonna give you up",
      hash: null,
      run: function (ctx) {
        ctx.print("<b>Never gonna give you up</b>");
        ctx.print("Never gonna let you down");
        ctx.print("Never gonna run around and desert you");
        ctx.print("Never gonna make you cry");
        ctx.print("Never gonna say goodbye");
        ctx.print("Never gonna tell a lie and hurt you");
        ctx.blank();
        ctx.print("you've been rickrolled — " + linkify("youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", true));
      },
    },

    danny: {
      help: "ascii danny phantom",
      hash: "danny",
      run: function (ctx) {
        ghost(ctx);
        ctx.blank();
        ctx.print('"I\'m going ghost!" — Danny Phantom');
        ctx.print('<span class="dim">' + GHOST_BANTER[Math.floor(Math.random() * GHOST_BANTER.length)] + "</span>");
        if (Math.random() < 0.4) {
          ctx.print('<span class="dim">the ghost glow follows the <b>theme</b> you pick — try <b>theme dracula</b></span>');
        }
      },
    },

    cowsay: {
      help: "(cow) your text — moods: -b -d -g -p -s -t -w -y",
      hash: null,
      run: function (ctx, rest) {
        /* real cowsay moods: the flag swaps the eyes (and -d hangs a tongue) */
        var MOODS = { b: "==", d: "xx", g: "$$", p: "@@", s: "**", t: "--", w: "OO", y: ".." };
        var LONG = { borg: "==", dead: "xx", greedy: "$$", paranoid: "@@", stoned: "**", tired: "--", wired: "OO", young: ".." };
        var parts = rest.trim().split(/\s+/).filter(Boolean);
        var eyes = "oo", tongued = false, text;
        if (parts.length >= 2 && /^-/.test(parts[0])) {
          var key = parts[0].toLowerCase().replace(/^-+/, "");
          if (MOODS[key] || LONG[key]) {
            eyes = MOODS[key] || LONG[key];
            tongued = key === "d" || key === "dead";
            parts = parts.slice(1);
          }
        }
        text = (parts.length ? parts.join(" ") : "moo").trim();
        if (text.length > 46) text = text.slice(0, 43) + "...";
        var top = "_" .repeat(text.length + 2);
        var bot = "-" .repeat(text.length + 2);
        ctx.print(" " + top);
        ctx.print("&lt; " + esc(text) + " &gt;");   /* &lt;/&gt; keep the typewriter's tag parser out of the art */
        ctx.print(" " + bot);
        ctx.print("        \\   ^__^");
        ctx.print("         \\  (" + eyes + ")\\_______");
        ctx.print("            (__)\\       )\\/\\");
        if (tongued) ctx.print("             U  ||----w |");
        ctx.print("                ||----w |");
        ctx.print("                ||     ||");
        if (tongued) ctx.print('<span class="dim">(she is dead, jim — but her commit history is immaculate)</span>');
      },
    },

    /* ---------- clear ---------- */
    clear: {
      help: "wipe the terminal",
      hash: null, // note: clear has no shareable section
      run: function (ctx) {
        if (window.app.menuDidClear) window.app.menuDidClear();
        ctx.clear();
      },
    },

    /* ---------- ls ---------- */
    ls: {
      help: "list the files of this terminal — try: ls projects",
      hash: "ls", // shareable: <site>/#ls
      run: function (ctx, rest) {
        var dir = rest.trim().toLowerCase();
        if (dir === "-a" || dir === "--all") {
          if (!window.app.admin) {
            ctx.print("ls -a: permission denied — the hidden files stay hidden");
            ctx.print('<span class="dim">(hint: root sees everything — including <b>.secret</b>)</span>');
            return;
          }
          ctx.print('<span class="dim">hidden files — root eyes only:</span>');
          [
            ["-rw-------", ".secret", "the good stuff — root may cat it"],
            ["-rw-r--r--", ".glglrc", "theme, volume & secrets (may or may not contain secrets)"],
            ["-rw-------", ".sudo_as_admin_successful", "it literally is"],
            ["-rw-r--r--", ".terminalrc", "you are not using xterm — verified"],
            ["-rw-r--r--", ".bash_history", "mostly: sudo, sudo, ls (you)"],
            ["-rw-r--r--", ".zsh_history", "12,486 lines of theme tokyonight + undo"],
            ["-rw-r--r--", ".ntuser.dat.LOG1", "do not open. seriously."],
          ].forEach(function (f) {
            ctx.print(pad('<span class="dim">' + f[0] + "</span>", 12) + " " + "<b>" + esc(f[1]) + "</b>" +
              ' <span class="dim">' + esc(f[2]) + "</span>");
          });
          ctx.blank();
          return;
        }
        if (dir === "projects" || dir === "projects/") {
          ctx.print('<span class="dim">projects/ — selected builds, repos included:</span>');
          ctx.print(pad("<b>cache-engine</b>", 18) + "— high-throughput redis cache middleware");
          ctx.print(pad("<b>epub-to-pdf</b>", 18) + "— in-browser epub to pdf converter");
          ctx.blank();
          ctx.print('<span class="dim">open one: <b>projects</b></span>');
          return;
        }
        if (dir === "experience" || dir === "experience/") {
          ctx.print('<span class="dim">experience/ — career log:</span>');
          ctx.print(pad("<b>penta</b>", 18) + "— dev studio, node.js backend · since 2023");
          ctx.blank();
          ctx.print('<span class="dim">open it: <b>experience</b></span>');
          return;
        }
        if (dir) {
          ctx.print('<span class="dim">ls: ' + esc(rest.trim()) + ": no such directory — try <b>ls projects</b> or <b>ls experience</b></span>");
          return;
        }
        ctx.print('<span class="dim">total 7 — everything you need lives here</span>');
        [
          ["drwxr-xr-x", "projects/", "selected builds — repos included"],
          ["drwxr-xr-x", "experience/", "career log"],
          ["-rw-r--r--", "cv.pdf", "full résumé"],
          ["-rw-r--r--", "skills.txt", "print the stack"],
          ["-rw-r--r--", "education.txt", "the degree, the year"],
          ["-rw-r--r--", "contact.txt", "reach me"],
          ["-rw-r--r--", "README.txt", "type help — the manual of this terminal"],
        ].forEach(function (f) {
          ctx.print(pad('<span class="dim">' + f[0] + "</span>", 12) + " " + "<b>" + esc(f[1]) + "</b>" +
            ' <span class="dim">' + esc(f[2]) + "</span>");
        });
        ctx.blank();
        ctx.print('<span class="dim">every file opens by name — try <b>cv</b>, <b>contact</b>, <b>projects</b>…</span>');
      },
    },

    /* ---------- cat — read a terminal file ---------- */
    cat: {
      help: "read a terminal file — try: cat README.txt",
      hash: "cat", // shareable: <site>/#cat
      run: function (ctx, rest) {
        var files = {
          "README.txt": "glgl terminal — a résumé disguised as cmd.exe. run <b>help</b> for the manual.",
          "cv.pdf": "a binary file — browsers handle it better than we do. run <b>cv</b> to open it.",
          "skills.txt": "node.js · express · nestjs · redis · postgres · docker · aws",
          "education.txt": "B.Sc. computer science — Mansoura University, class of 2025.",
          "experience.txt": "three chapters of backend shipping — run <b>experience</b> for the log.",
          "projects.txt": "two builds, repos included — run <b>projects</b> to walk through them.",
          "contact.txt": "ahmed4bdelgelel@gmail.com — run <b>contact</b> for linkedin, github & more.",
        };
        var name = rest.trim().toLowerCase();
        var content = files[name];
        if (name === ".secret") {
          if (!window.app.admin) {
            ctx.print("cat: .secret: permission denied — you are not root. yet.");
            ctx.print('<span class="dim">(hint: <b>sudo</b> / <b>su</b> first — the root password is four lowercase letters)</span>');
          } else {
            ctx.print(".secret: <span class='dim'>the terminal's darkest secret is that there is no secret.</span>");
            ctx.print('<span class="dim">you are now 3 steps deep inside a résumé. tell no one.</span>');
          }
          return;
        }
        if (name) {
          if (content) {
            ctx.print(esc(name) + ': <span class="dim">' + content + "</span>");
          } else {
            ctx.print('<span class="dim">cat: ' + esc(rest.trim()) + ': no such file — run <b>ls</b> to see what lives here</span>');
          }
          return;
        }
        ctx.print('<span class="dim">usage: cat &lt;file&gt; — try <b>cat README.txt</b> or <b>cat skills.txt</b></span>');
      },
    },

    /* ---------- tree — the file tree, drawn badly ---------- */
    tree: {
      help: "the terminal's file tree, drawn badly",
      hash: null,
      run: function (ctx) {
        ctx.print("<span class='dim'>.</span>");
        ctx.print("<span class='dim'>├──</span> projects/");
        ctx.print("<span class='dim'>│   ├──</span> cache-engine");
        ctx.print("<span class='dim'>│   └──</span> epub-to-pdf");
        ctx.print("<span class='dim'>├──</span> experience/");
        ctx.print("<span class='dim'>│   └──</span> penta /");
        ctx.print("<span class='dim'>├──</span> cv.pdf");
        ctx.print("<span class='dim'>├──</span> contact.txt");
        ctx.print("<span class='dim'>└──</span> README.txt");
        ctx.blank();
        ctx.print('<span class="dim">1 directory, 2 builds, 0 broken promises.</span>');
      },
    },

    /* ---------- fortune ---------- */
    fortune: {
      help: "a fortune cookie, terminal edition",
      hash: null,
      run: function (ctx) {
        var fortunes = [
          "you will deploy on a friday. may god have mercy.",
          "your code will work on the first try. roll for initiative.",
          "a recruiter will find this portfolio. you will check the date twice.",
          "the bug is not in your code. it is in your heart.",
          "merge conflicts: an opportunity to learn about merge conflicts.",
          "today's lucky command is sudo. today's lucky number is no.",
          "someone, somewhere, will ask you to make the logo bigger.",
          "production is fine. said no one, ever, at 3am.",
          "the internet was down. the real problem was you had no coffee.",
          "you will read this fortune twice. it is the same both times.",
        ];
        ctx.print('<span class="dim">fortune:</span> ' + esc(fortunes[Math.floor(Math.random() * fortunes.length)]));
      },
    },

    /* ---------- hack — full mainframe invasion (probably) ---------- */
    hack: {
      help: "invade a mainframe (probably)",
      hash: "hack",
      run: function (ctx, rest) {
        var target = rest.trim() || "the mainframe";
        ctx.print('<span class="dim">hacking ' + esc(target) + "…</span>");
        ctx.print('<span class="dim">bypassing firewall… done</span>');
        ctx.print('<span class="dim">decrypting passwords…</span>');
        ctx.print('<span class="dim">  the passwords were "glgl" — 100% of them</span>');
        ctx.print('<span class="dim">uploading viruses…</span>');
        ctx.print('<span class="dim">  the viruses were you</span>');
        ctx.print('<span class="dim">gaining admin…</span>');
        ctx.print('<span class="dim">  you were already admin (sudo remembers)</span>');
        ctx.blank();
        ctx.print("<b>ACCESS GRANTED</b> — hmm. nothing happened. " + esc(target) +
          " is a static site with no backend. you got pranked by a résumé.");
      },
    },

    /* ---------- coffee ---------- */
    coffee: {
      help: "brew a virtual coffee",
      hash: null,
      run: function (ctx) {
        ctx.print("<span class='dim'>brewing… [▓▓▓▓▓▓▓▓▓▓] done.</span>");
        ctx.print("   ( ( ");
        ctx.print("    ) )");
        ctx.print("   _____");
        ctx.print("  |     |");
        ctx.print("  |  ☕  |");
        ctx.print("  |_____|");
        ctx.print("   `---'");
        ctx.blank();
        ctx.print("hot, black, zero calories — like your commit messages.");
        ctx.print('<span class="dim">(productivity +10 — apply at the next sentence)</span>');
      },
    },
  };

  /* aliases — cheap to support */
  var ALIASES = { "?": "help", cls: "clear", dir: "projects", phantom: "danny", resume: "cv", list: "menu" };

  /* expose a tiny global so main.js can talk to the engine */
  window.app = window.app || {};
  window.app.commands = commands;
  window.app.aliases = ALIASES;

  /* resolve a typed token to a command (case-insensitive), or null */
  window.app.resolve = function (name) {
    var key = String(name).toLowerCase().trim();
    return commands[ALIASES[key] || key] || null;
  };
})();