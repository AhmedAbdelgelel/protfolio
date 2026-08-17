/* ============================================================
   Command engine — the whole terminal's brain.
   One structure: { commandName: { help, hash, run } }.
   To add a command: add one entry here + one line in `help`.
   No DOM access here — renderers get a tiny `ctx` API:
     ctx.print(html)  append a wrapped text line (pre-wrap)
     ctx.blank()      append an empty line
     ctx.clear()      wipe all output
     ctx.setHash(h)   route URL hash (shareable / back+forward)
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

  /* today as YYYY-MM-DD — used by `version` */
  var today = (function () {
    var d = new Date();
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  })();

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
        ctx.print("<b>projects</b>" + pad("", 11 - 8) + "— selected builds");
        ctx.print("<b>stack</b>" + pad("", 11 - 5) + "— print the stack");
        ctx.print("<b>whoami</b>" + pad("", 11 - 6) + "— identity");
        ctx.print("<b>penta</b>" + pad("", 11 - 5) + "— studio blurb");
        ctx.print("<b>experience</b>" + pad("", 11 - 10) + "— career log");
        ctx.print("<b>contact</b>" + pad("", 11 - 7) + "— reach me");
        ctx.print("<b>version</b>" + pad("", 11 - 7) + "— build info");
        ctx.print("<b>clear</b>" + pad("", 11 - 5) + "— wipe the page — nothing left to route to");
      },
    },

    /* ---------- whoami ---------- */
    whoami: {
      help: "identity",
      hash: "whoami",
      run: function (ctx) {
        ctx.print("<b>Ahmed Mohammed Abdelgelel</b>");
        ctx.print("Backend Software Engineer · Co-Founder @ Penta Studio");
        ctx.print("Cairo, Egypt");
        ctx.blank();
        ctx.print("2 years building Node.js / TypeScript backend systems — REST APIs,");
        ctx.print("auth flows, backend architecture. B.Sc. Computer Science, Mansoura");
        ctx.print("University, 2025.");
      },
    },

    /* ---------- projects ---------- */
    projects: {
      help: "selected builds",
      hash: "projects",
      run: function (ctx) {
        ctx.print("<b>Smart Cache Engine</b>");
        ctx.print("  Redis-inspired in-memory cache built from scratch in Node.js.");
        ctx.print("  O(1) LRU eviction, dual-layer TTL expiration, Sorted Sets with a");
        ctx.print("  Stampede Guard. 3M+ ops/sec, 79 unit tests, zero dependencies.");
        ctx.blank();
        ctx.print("<b>EPUB-to-PDF Converter</b>");
        ctx.print("  Fixed-layout EPUB rendering pipeline on Puppeteer. Parses XHTML,");
        ctx.print("  renders each page at exact viewport dimensions, batch PDF");
        ctx.print("  generation and merging via pdf-lib.");
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
        ctx.print(pad("devops", 10) + "Docker, Azure, CI/CD, Linux, Git");
        ctx.print(pad("testing", 10) + "Jest, Mocha");
      },
    },

    /* ---------- experience ---------- */
    experience: {
      help: "career log",
      hash: "experience",
      run: function (ctx) {
        ctx.job(
          "Co-Founder & Software Engineer — Penta Studio",
          "Dec 2025 — present",
          [
            "Architected and shipped backend services for startup and enterprise clients.",
            "Led Node.js / TypeScript architecture; set up Docker + CI/CD pipelines.",
            "Co-founded the studio Dec 2025 — 3+ products delivered since.",
          ]
        );
        ctx.job(
          "Backend Developer — Amen Stories",
          "Feb 2025 — present",
          [
            "Built REST APIs and auth flows (JWT, RBAC) serving 10k+ users.",
            "Shaved ~40% off API latency with MongoDB indexes + caching layers.",
            "200+ Jest unit tests across services.",
          ]
        );
        ctx.job(
          "Freelance Backend Developer — Naqaa Al-Ain, KSA",
          "Apr 2025 — Aug 2025",
          [
            "Delivered a full Node.js + PostgreSQL backend for a Saudi client.",
            "Integrated third-party payments; deployed on Azure with CI/CD.",
            "Kept 99%+ uptime with production monitoring.",
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

    /* ---------- contact ---------- */
    contact: {
      help: "reach me",
      hash: "contact",
      run: function (ctx) {
        ctx.print(pad("email", 9) + linkify(EMAIL, "mailto:" + EMAIL));
        ctx.print(pad("phone", 9) + linkify(PHONE, "tel:" + PHONE.replace(/\s/g, "")));
        ctx.print(pad("linkedin", 9) + linkify(LINKEDIN, LINKEDIN, true));
        ctx.print(pad("github", 9) + linkify(GITHUB, GITHUB, true));
      },
    },

    /* ---------- version ---------- */
    version: {
      help: "build info",
      hash: "version",
      run: function (ctx) {
        ctx.print("build 3.2.0 · last deployed " + today + " · running on Node.js");
      },
    },

    /* ---------- clear ---------- */
    clear: {
      help: "wipe the page — nothing left to route to",
      hash: null, // note: clear has no shareable section
      run: function (ctx) {
        ctx.clear();
      },
    },
  };

  /* aliases — keep cmd flavor, cheap to support */
  var ALIASES = { "?": "help", cls: "clear", dir: "projects" };

  /* expose a tiny global so main.js can talk to the engine */
  window.app = window.app || {};
  window.app.commands = commands;

  /* resolve a typed token to a command (case-insensitive), or null */
  window.app.resolve = function (name) {
    var key = String(name).toLowerCase().trim();
    return commands[ALIASES[key] || key] || null;
  };
})();