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

  /* tiny ghost — the neofetch/danny logo */
  var GHOST_ART = [
    '        .-""""""-.',
    "      .'          '.",
    '     /   O      O   \\',
    "    :                :",
    "    |                |",
    "    : ','        ',' :",
    '     \\  \'-......-\'  /',
    "      '.          .'",
    "        '-......-'",
  ];

  var ghost = function (ctx) {
    GHOST_ART.forEach(function (row) {
      ctx.print('<span class="art">' + esc(row) + "</span>");
    });
  };

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
        lines: [
          "Redis-inspired in-memory cache built from scratch in Node.js — 3M+ ops/sec.",
          "O(1) LRU eviction via doubly linked list + hashmap; dual-layer TTL expiration.",
          "Byte-level memory caps, Sorted Sets with a Stampede Guard (99.9% fewer backend calls).",
          "p50/p95/p99 latency metrics via reservoir sampling. 79 unit tests, zero dependencies.",
        ],
      },
      {
        name: "EPUB-to-PDF Converter",
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

  /* full-page résumé — rendered into the overlay by main.js */
  window.app = window.app || {};   /* ensure the global exists here (bottom init is later) */
  window.app.cvHtml = function () {
    var h = [];
    var hr = function () {
      h.push('<div class="cvhr">' + "─".repeat(60) + "</div>");
    };
    var sec = function (num, name, body) {
      h.push('<div class="cv__sec"><span class="cv__num">[' + num + "]</span><span class=\"cv__secname\">" + name + "</span></div>");
      body();
    };
    h.push('<div class="cv">');
    h.push('<div class="cv__title">' + esc(CV.name) + "</div>");
    h.push('<div class="cv__sub">' + esc(CV.role) + "</div>");
    h.push('<div class="cv__muted">' + esc(CV.location) + "</div>");
    hr();
    CV.contacts.forEach(function (c) {
      h.push('<div class="cv__row">' + pad("<b>" + esc(c.label) + "</b>", 11) + linkify(c.value, c.href, c.external) +
        (c.copy ? " " + copyChip(c.value) : "") + "</div>");
    });
    hr();
    sec(1, "Summary", function () {
      h.push('<div class="cv__text">' + esc(CV.summary) + "</div>");
    });
    sec(2, "Experience", function () {
      CV.experience.forEach(function (job) {
        h.push('<div class="cv__job"><span>' + esc(job.role) + '</span><span class="cv__dates">' + esc(job.dates) + "</span></div>");
        job.bullets.forEach(function (b) {
          h.push('<div class="cv__bullet">· ' + esc(b) + "</div>");
        });
      });
    });
    sec(3, "Projects", function () {
      CV.projects.forEach(function (p) {
        h.push('<div class="cv__project"><b>' + esc(p.name) + "</b></div>");
        p.lines.forEach(function (l) {
          h.push('<div class="cv__bullet">· ' + esc(l) + "</div>");
        });
      });
    });
    sec(4, "Education", function () {
      h.push('<div class="cv__text">' + esc(CV.education) + "</div>");
    });
    sec(5, "Skills", function () {
      h.push('<div class="cv__skills">');
      CV.skills.forEach(function (s) {
        h.push('<div class="cv__skill"><span class="cv__skill-label">' + esc(s[0]) + '</span><span>' + esc(s[1]) + "</span></div>");
      });
      h.push("</div>");
    });
    sec(6, "Contact", function () {
      h.push('<div class="cv__text">prefer the short version? type <b>contact</b> back in the terminal.</div>');
      h.push('<div class="cv__row">' + pad("<b>email</b>", 11) + linkify(EMAIL, "mailto:" + EMAIL) + " " + copyChip(EMAIL) + "</div>");
      h.push('<div class="cv__row">' + pad("<b>linkedin</b>", 11) + linkify(LINKEDIN, LINKEDIN, true) + "</div>");
    });
    hr();
    h.push('<div class="cv__foot">generated from the terminal · esc to close</div>');
    h.push("</div>");
    return h.join("");
  };

  /* ============================================================
     COMMAND TABLE
     ============================================================ */
  var commands = {
    /* ---------- help ---------- */
    help: {
      help: "list every command",
      hash: "help",
      run: function (ctx) {
        ctx.print('<span class="dim">sections are offline — type <b>help</b> to boot one:</span>');
        ctx.print(pad("<b>help</b>", 15) + "— list every command");
        ctx.print(pad("<b>projects</b>", 15) + "— selected builds");
        ctx.print(pad("<b>stack</b>", 15) + "— print the stack");
        ctx.print(pad("<b>whoami</b>", 15) + "— identity");
        ctx.print(pad("<b>experience</b>", 15) + "— career log");
        ctx.print(pad("<b>penta</b>", 15) + "— studio blurb");
        ctx.print(pad("<b>hire</b>", 15) + "— availability card");
        ctx.print(pad("<b>contact</b>", 15) + "— reach me");
        ctx.print(pad("<b>info</b>", 15) + "— system overview (neofetch)");
        ctx.print(pad("<b>cv</b>", 15) + "— full résumé page");
        ctx.print(pad("<b>version</b>", 15) + "— build info");
        ctx.blank();
        ctx.print('<span class="dim">fun — because terminals need it:</span>');
        ctx.print(pad("<b>matrix</b>", 15) + "— green code rain");
        ctx.print(pad("<b>guess</b>", 15) + "— number guessing game");
        ctx.print(pad("<b>cowsay &lt;text&gt;</b>", 15) + "— (cow) your text");
        ctx.print(pad("<b>rick</b>", 15) + "— never gonna give you up");
        ctx.print(pad("<b>danny</b>", 15) + "— ascii danny phantom");
        ctx.print(pad("<b>sudo</b>", 15) + "— with great power…");
        ctx.print(pad("<b>su</b>", 15) + "— authentication failure");
        ctx.blank();
        ctx.print('<span class="dim">tools:</span>');
        ctx.print(pad("<b>ping</b>", 15) + "— real latency to this site");
        ctx.print(pad("<b>theme</b>", 15) + "— termux color schemes");
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
        ctx.print("  Redis-inspired in-memory cache built from scratch in Node.js —");
        ctx.print("  3M+ ops/sec. O(1) LRU eviction via doubly linked list + hashmap,");
        ctx.print("  dual-layer TTL expiration, byte-level memory caps, Sorted Sets");
        ctx.print("  with a Stampede Guard (99.9% fewer backend calls) and p50/p95/p99");
        ctx.print("  latency metrics. 79 unit tests, zero dependencies.");
        ctx.blank();
        ctx.print("<b>EPUB-to-PDF Converter</b>");
        ctx.print("  Unpacks EPUB archives, parses XHTML, renders each page via");
        ctx.print("  Puppeteer at exact viewport dimensions for fixed-layout fidelity.");
        ctx.print("  Font injection via @font-face with global CSS overrides; batch");
        ctx.print("  PDF generation and merging via pdf-lib; auto-cleanup of temp files.");
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
        var os = mobile() ? "Android · Termux" : "Windows 10.0.22631 · cmd.exe";
        var shell = mobile() ? "bash 5.2.15" : "cmd.exe";
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
          '<a href="#" data-action="cv">[open page]</a></span>');
      },
    },

    /* ---------- cv ---------- */
    cv: {
      help: "full résumé page",
      hash: "cv",
      run: function (ctx) {
        if (window.app.openCv) window.app.openCv();
        else ctx.print('<span class="dim">cv page unavailable on this build</span>');
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

    /* ---------- theme — Termux color schemes, persisted ---------- */
    theme: {
      help: "termux color schemes",
      hash: null,
      run: function (ctx, rest) {
        var SCHEMES = {
          termux: "green (default)",
          solarized: "yellow",
          dracula: "purple",
          gotham: "blue",
          fall: "amber",
          nord: "icy blue",
        };
        var current = "termux";
        try {
          current = localStorage.getItem("glgl-theme") || "termux";
        } catch (e) { /* ignore */ }
        if (rest) {
          var name = rest.trim().toLowerCase();
          if (!SCHEMES[name]) {
            ctx.print('<span class="dim">unknown scheme "' + esc(rest.trim()) + '" — pick one:</span>');
            Object.keys(SCHEMES).forEach(function (n) {
              ctx.print(pad("  " + n, 14) + SCHEMES[n]);
            });
            return;
          }
          try {
            localStorage.setItem("glgl-theme", name);
          } catch (e) { /* ignore */ }
          document.documentElement.setAttribute("data-theme", name);
          ctx.print("theme set to <b>" + name + "</b> (" + SCHEMES[name] + ") — persisted");
          return;
        }
        ctx.print("current theme: <b>" + current + "</b>");
        ctx.print('<span class="dim">usage: theme &lt;name&gt;</span>');
        Object.keys(SCHEMES).forEach(function (n) {
          ctx.print(pad("  " + n, 14) + SCHEMES[n]);
        });
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
        ctx.print("build 3.3.0 · last deployed " + today + " · running on " +
          (mobile() ? "Node.js 22 · Termux" : "Node.js 22 · cmd.exe"));
      },
    },

    /* ---------- fun ---------- */
    sudo: {
      help: "with great power…",
      hash: null,
      run: function (ctx) {
        ctx.print("<b>glgl</b> is not in the sudoers file.");
        ctx.print("This incident will be reported.");
      },
    },

    su: {
      help: "authentication failure",
      hash: null,
      run: function (ctx) {
        ctx.print("su: Authentication failure");
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
        ctx.print('<span class="dim">the green glow follows the <b>theme</b> you pick</span>');
      },
    },

    cowsay: {
      help: "(cow) your text",
      hash: null,
      run: function (ctx, rest) {
        var text = (rest || "moo").trim();
        if (text.length > 46) text = text.slice(0, 43) + "...";
        var top = "_" .repeat(text.length + 2);
        var bot = "-" .repeat(text.length + 2);
        ctx.print(" " + top);
        ctx.print("&lt; " + esc(text) + " &gt;");   /* &lt;/&gt; keep the typewriter's tag parser out of the art */
        ctx.print(" " + bot);
        ctx.print("        \\   ^__^");
        ctx.print("         \\  (oo)\\_______");
        ctx.print("            (__)\\       )\\/\\");
        ctx.print("                ||----w |");
        ctx.print("                ||     ||");
      },
    },

    /* ---------- clear ---------- */
    clear: {
      help: "wipe the terminal",
      hash: null, // note: clear has no shareable section
      run: function (ctx) {
        ctx.clear();
      },
    },
  };

  /* aliases — cheap to support */
  var ALIASES = { "?": "help", cls: "clear", dir: "projects", phantom: "danny", resume: "cv" };

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