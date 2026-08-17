/* ============================================================
   Terminal main — boot, input handling, history, hash routing.
   The command table itself lives in commands.js.

   Boot flow:
     1. lines print line-by-line into the output pane
     2. the prompt/input row fades in (ghost "type 'help'")
     3. URL hash, if any, is routed to its command output
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var term = doc.getElementById("terminal");
  var output = doc.getElementById("terminal-output");
  var input = doc.getElementById("term-input");
  var mirror = doc.getElementById("mirror");
  var promptRow = doc.getElementById("promptline");
  var chips = Array.prototype.slice.call(doc.querySelectorAll(".chips button"));

  /* the terminal is booting — abort early if markup is missing */
  if (!term || !output || !input || !mirror) return;

  /* ============================================================
     Renderer context handed to every command in commands.js
     ============================================================ */
  var esc = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  var scrollDown = function () {
    output.scrollTop = output.scrollHeight;
  };

  var appendLine = function (html, cls) {
    var div = doc.createElement("div");
    div.className = "line" + (cls ? " line--" + cls : "");
    div.innerHTML = html;
    output.appendChild(div);
  };

  var ctx = {
    /* plain output line (pre-wrapped, indentation preserved) */
    print: function (html) {
      appendLine(html);
      scrollDown();
    },
    /* empty spacer line */
    blank: function () {
      appendLine("&nbsp;");
      scrollDown();
    },
    /* wipe the screen — prompt row sits outside #terminal-output */
    clear: function () {
      output.innerHTML = "";
      scrollDown();
    },
    /* a job block: role row (flex: role left, dates right) + bullets */
    job: function (role, dates, bullets) {
      appendLine(
        '<span class="jobrow"><span>' + esc(role) + '</span><span class="jobrow__dates">' +
        esc(dates) + "</span></span>"
      );
      bullets.forEach(function (b) {
        appendLine('<span class="dim">  · ' + esc(b) + "</span>");
      });
      appendLine("&nbsp;");
      scrollDown();
    },
    /* route the result of a command to a URL hash for sharing */
    setHash: function (hash) {
      if (hash && location.hash !== "#" + hash) {
        location.hash = hash; // fires hashchange → guarded in onHashChange
      }
    },
  };

  /* ============================================================
     Boot sequence — printed line by line, not all at once
     ============================================================ */
  var BOOT_LINES = [
    "Microsoft Windows [Version 10.0.22631]",
    "(c) Microsoft Corporation. All rights reserved.",
  ];

  var boot = function () {
    if (reduced) {
      /* motion off → print everything instantly */
      BOOT_LINES.forEach(function (line) {
        appendLine(esc(line));
      });
      appendLine("&nbsp;");
      showPrompt();
      return;
    }
    var delay = 110;
    BOOT_LINES.forEach(function (line, i) {
      setTimeout(function () {
        appendLine(esc(line));
        scrollDown();
      }, i * delay);
    });
    setTimeout(function () {
      appendLine("&nbsp;");
      scrollDown();
    }, BOOT_LINES.length * delay);
    setTimeout(showPrompt, (BOOT_LINES.length + 1) * delay + 120);
  };

  /* refresh (F5/reload) always boots the fresh home screen — deep-link
   rendering is kept for direct visits and back/forward navigation */
var isReload = function () {
  try {
    var entry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if (entry) return entry.type === "reload";
  } catch (e) { /* keep going */ }
  try {
    return window.performance.navigation.type === 1; // legacy API
  } catch (e) {
    return false;
  }
};

var showPrompt = function () {
    term.classList.add("ready"); // CSS fades prompt + chips in
    focusInput();
    if (isReload()) {
      /* refresh → reset to a clean home: drop any section hash from the URL
         (window.history — our local `history` array shadows the global) */
      if (location.hash) {
        try {
          window.history.replaceState(null, "", location.pathname + location.search);
        } catch (e) { /* ignore — file:// and exotic cases */ }
      }
      return;
    }
    if (location.hash) onHashChange(); // deep link → render that section
  };

  /* ============================================================
     Hash routing — #projects, #contact, ... shareable + back/forward
     ============================================================ */
  var renderedHash = null; // hash we already rendered (guards duplicates)

  var onHashChange = function () {
    var name = location.hash.replace(/^#/, "");
    if (!name) return;
    var cmd = window.app.resolve(name);
    if (!cmd || cmd.hash !== name) return;
    if (name === renderedHash) return; // we just rendered this via execute()
    renderedHash = name;
    cmd.run(ctx); // output only — no echo, no re-hash
  };

  window.addEventListener("hashchange", onHashChange);

  /* ============================================================
     History (ArrowUp / ArrowDown) + draft preservation
     ============================================================ */
  var history = [];
  var histIndex = -1;
  var draft = "";

  /* ============================================================
     Command execution — echo exactly like cmd.exe, then render
     ============================================================ */
  var execute = function (raw) {
    var trimmed = raw.trim();
    if (!trimmed) return; // real cmd: empty line just reprints the prompt

    history.push(trimmed);
    histIndex = -1;

    /* echo:  C:\Users\glgl>  <command>   (own line, then output below) */
    appendLine(
      '<span class="echo-prompt">C:\\Users\\glgl&gt;</span> ' + esc(trimmed),
      "echo"
    );
    scrollDown();

    var token = trimmed.split(/\s+/)[0];
    var cmd = window.app.resolve(token);

    if (!cmd) {
      /* mimic real cmd.exe's "not recognized" message verbatim */
      appendLine("'" + esc(token) + "' is not recognized as an internal or external command,");
      appendLine("operable program or batch file.");
      ctx.blank();
      scrollDown();
      return;
    }

    /* record the guard BEFORE setHash so the hashchange it fires
       (async) is recognized as already-rendered and not re-printed */
    cmd.run(ctx);
    renderedHash = cmd.hash;
    ctx.setHash(cmd.hash); // e.g. whoami → #whoami
  };

  /* ============================================================
     Live input row — real <input> (a11y) + mirrored text
     + blinking block cursor (visual fidelity)
     ============================================================ */
  var syncMirror = function () {
    var v = input.value;
    /* empty → show the dim "type 'help'" ghost inside the prompt line */
    mirror.textContent = v || "type 'help'";
    mirror.classList.toggle("ghost", v.length === 0);
    /* keep the typing line scrolled so the cursor stays visible */
    promptRow.scrollLeft = promptRow.scrollWidth;
  };

  input.addEventListener("input", syncMirror);

  /* render the initial ghost "type 'help'" prompt */
  syncMirror();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      var raw = input.value;
      input.value = "";
      syncMirror();
      execute(raw);
      draft = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      if (histIndex < 0) draft = input.value; // remember current draft
      histIndex = Math.min(histIndex + 1, history.length - 1);
      input.value = history[history.length - 1 - histIndex];
      syncMirror();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex < 0) return;
      histIndex -= 1;
      if (histIndex < 0) {
        input.value = draft; // back past the newest command → draft
      } else {
        input.value = history[history.length - 1 - histIndex];
      }
      syncMirror();
    }
  });

  /* ============================================================
     Quick-command chips — mobile only. Tap = typed + submitted.
     ============================================================ */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      execute(chip.dataset.cmd || chip.textContent);
    });
  });

  /* ============================================================
     Click anywhere in the terminal → refocus the hidden input
     ============================================================ */
  term.addEventListener("click", function (e) {
    if (e.target.closest("button, a")) return; // let buttons/links keep focus
    input.focus();
  });

  /* autofocus on desktop only — focusing on touch pops the keyboard */
  var focusInput = function () {
    if (window.matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
  };

  /* ============================================================
     Start
     ============================================================ */
  boot();

  /* tell the inline <head> guard that JS fully booted */
  if (typeof window.__termReady === "function") window.__termReady();
})();