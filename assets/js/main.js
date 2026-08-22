/* ============================================================
   Terminal main — boot, typewriter printer, input, history,
   hash routing, matrix, guess game, sound, speed, tab complete,
   did-you-mean, live clock, idle screensaver.

   Boot flow:  boot lines enqueue -> printer types char-by-char
   -> prompt fades in. Enter/Escape skips the typewriter.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- skin: Windows terminal (desktop) / Termux (Android) / zsh (iOS) ---------- */
  var mql = window.matchMedia("(max-width: 640px)");
  var mobile = mql.matches;
  var promptLabel = doc.getElementById("prompt-label");

  /* platform: detected BEFORE the width fallback, so a phone in landscape keeps its shell name */
  var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(navigator.userAgent);
  var phone = mobile || isIOS || isAndroid;   /* the phone skins: termux lives here */

  /* platform = the skin you actually see — the termux look is a width effect too */
  var setPlatform = function () {
    window.app.platform = isIOS ? "ios" : (isAndroid || mobile) ? "android" : "desktop";
  };
  setPlatform();

  /* apply the saved theme before first paint — the palette must survive reloads.
     termux is the mobile factory look (green-on-black), android AND ios — no save needed.
     "default" = the native look: no theme attribute at all */
  try {
    var savedTheme = localStorage.getItem("glgl-theme");
    if (!savedTheme && phone) savedTheme = "termux";
    if (savedTheme && savedTheme !== "default" && (savedTheme !== "termux" || phone))
      doc.documentElement.setAttribute("data-theme", savedTheme);
  } catch (e) { /* ignore */ }

  var shellPrompt = function () {
    if (!mobile) return "C:\\Users\\glgl>";
    return isIOS ? "glgl@iphone ~ %" : "glgl@phone:~$";
  };
  var shellTitle = function () {
    /* keep the real name in every tab title — recruiters search names,
       not shell binaries (the shell skin stays as the flavour suffix) */
    if (!mobile) return "Ahmed Abdelgelel — Backend Engineer · cmd.exe";
    return isIOS ? "Ahmed Abdelgelel — zsh" : "Ahmed Abdelgelel — Termux";
  };

  var updateSkin = function () {
    mobile = mql.matches;
    setPlatform();
    document.title = shellTitle();
    if (promptLabel) promptLabel.textContent = shellPrompt();
  };
  if (mql.addEventListener) mql.addEventListener("change", updateSkin);
  else mql.addListener(updateSkin);
  updateSkin();

  var term = doc.getElementById("terminal");
  var output = doc.getElementById("terminal-output");
  var input = doc.getElementById("term-input");
  var mirror = doc.getElementById("mirror");
  var promptRow = doc.getElementById("promptline");
  if (!term || !output || !input || !mirror) return;

  /* ---------- helpers ---------- */
  var esc = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  var scrollQueued = false;
  var scrollDown = function () {
    /* settle-save must run BEFORE the rAF gate: a queued-but-never-fired
       frame (hidden tabs throttle rAF to zero) used to swallow every
       later scrollDown — the post-stream snapshot never got written,
       leaving a stale screen + an undead resume marker behind */
    if (settled()) saveScreen();
    if (scrollQueued) return;
    scrollQueued = true;
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () {
        scrollQueued = false;
        output.scrollTop = output.scrollHeight;
      });
    } else {
      scrollQueued = false;
      output.scrollTop = output.scrollHeight;
    }
  };

  /* coming back to a tab that was hidden while output printed: rAF
     was throttled, so the queued scroll never fired — drop it now */
  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden) return;
    scrollQueued = false;
    output.scrollTop = output.scrollHeight;
    if (settled()) saveScreen();
  });

  /* ============================================================
     Screen memory — phones kill the tab when you switch apps and
     reload replays everything. Keep a snapshot of the screen in
     sessionStorage; on return, restore it instead of rebooting.
     Only settled screens are saved — a snapshot taken mid-stream
     would come back truncated, and half a résumé reads worse than
     none (the pre-stream screen is what comes back instead).
     Cleared by `clear`.
     ============================================================ */
  /* ---------- resume-after-reload ----------
     While a command's output is still generating, its full command
     line rides in sessionStorage under glgl-pending. A reload
     mid-stream finds the marker and re-runs that one command on top
     of the restored screen — generation continues instead of dying.
     The marker is erased the moment the screen settles (same tick
     the snapshot is saved), so a settled reload never replays. */
  var PENDING_KEY = "glgl-pending";
  var setPending = function (line) {
    try {
      if (line) sessionStorage.setItem(PENDING_KEY, line);
      else sessionStorage.removeItem(PENDING_KEY);
    } catch (e) { /* ignore */ }
  };

  var saveTimer = null;
  var settled = function () {
    return !isTyping && !QUEUE.length &&
      !(window.app.cvBusy && window.app.cvBusy()) && !matrixActive;
  };
  var saveScreen = function () {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      /* re-check: a command may have started after this save was
         scheduled (closeMenu defers one) — freezing a half-written
         line would come back truncated after a reload */
      if (!settled()) return;
      try {
        sessionStorage.setItem("glgl-screen",
          JSON.stringify({ v: 2, h: output.innerHTML, t: output.scrollTop }));
        sessionStorage.removeItem(PENDING_KEY);
      } catch (e) { /* ignore */ }
    }, 300);
  };

  /* ============================================================
     Typewriter printer — lines render char-by-char with a
     random jitter so output feels "printed" not pasted.
     ============================================================ */
  var QUEUE = [];
  /* the story commands render instantly — no typing, the wait is gone.
     typing stays for boot, streams (cv) and the playful commands */
  var INSTANT_COMMANDS = ["contact", "experience", "projects", "stack", "whoami", "penta", "hire", "education"];
  var savedSpeed = null;
  try { savedSpeed = localStorage.getItem("glgl-speed"); } catch (e) { /* ignore */ }
  var RATES = { slow: 18, normal: 5, fast: 2 };
  var SPEED = savedSpeed === "slow" || savedSpeed === "normal" || savedSpeed === "fast"
    ? RATES[savedSpeed] : 5;     // ms per character
  var typeTimer = null;
  var typeLine = null;           // { el, tokens, ti, ci, target, textNode, stack }
  var onDrained = null;
  var isTyping = false;

  var decodeToken = function (html) {
    var s = doc.createElement("span");
    s.innerHTML = html;
    return s.textContent;
  };

  var typeStep = function () {
    var tl = typeLine;
    if (!tl) return;
    var t = tl.tokens[tl.ti];

    if (t === undefined) { typeLine = null; return; }

    if (/^<\/?[a-z]/i.test(t)) {
      /* markup — apply instantly, keep walking (brackets followed by a
         tag name only; anything else is plain text, e.g. "< moo >") */
      if (/^<\//.test(t)) {
        if (tl.stack.length) tl.stack.pop();
      } else {
        var name = (t.match(/^<([a-z0-9]+)/i) || [])[1];
        if (name) {
          var el = doc.createElement(name);
          var m, re = /([\w-]+)="([^"]*)"/g;
          while ((m = re.exec(t))) el.setAttribute(m[1], m[2]);
          var parent = tl.stack.length ? tl.stack[tl.stack.length - 1] : tl.el;
          parent.appendChild(el);
          tl.stack.push(el);
        }
      }
      tl.ti++;
      return;
    }

    /* text — type one char per tick */
    if (!tl.textNode) {
      tl.target = decodeToken(t);
      tl.textNode = doc.createTextNode("");
      var par = tl.stack.length ? tl.stack[tl.stack.length - 1] : tl.el;
      par.appendChild(tl.textNode);
      tl.ci = 0;
      if (tl.target === "\u00a0") { /* blank spacer — skip typing */
        tl.ti++;
        tl.textNode = null;
        return;
      }
    }
    if (tl.ci < tl.target.length) {
      tl.textNode.appendData(tl.target.charAt(tl.ci));
      tl.ci++;
      return;
    }
    tl.ti++;
    tl.textNode = null;
  };

  var doneTyping = function () {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    isTyping = false;
    /* pending is NOT cleared here: the echo line draining would wipe
       the marker while the command's own output is still rendering.
       Only the settled save (same tick as the snapshot) retires it. */
    if (onDrained) { var cb = onDrained; onDrained = null; cb(); }
    scrollDown();
  };

  var startNext = function () {
    if (!QUEUE.length) return doneTyping();
    var item = QUEUE.shift();
    output.appendChild(item.el);
    typeLine = {
      el: item.el,
      tokens: item.html.match(/<[^>]+>|[^<]+/g) || [item.html],
      ti: 0, ci: 0, target: "", textNode: null, stack: [],
    };
  };

  var pump = function () {
    if (!typeLine && QUEUE.length) startNext();
    if (!typeLine) return doneTyping();
    /* burst a few chars per tick — streaming feels printed but fast */
    var n = SPEED <= 2 ? 5 : SPEED <= 5 ? 4 : 3;
    while (n > 0) {
      typeStep();
      n--;
      if (!typeLine) {
        if (QUEUE.length) startNext();
        else break;
      }
    }
    if (!typeLine && !QUEUE.length) return doneTyping();
    scrollDown();
  };

  var startTimer = function () {
    if (isTyping) return;
    isTyping = true;
    if (!typeLine) startNext();
    if (typeLine) typeTimer = setInterval(pump, SPEED);
    else doneTyping();
  };

  /* skip everything ahead instantly */
  var finishAll = function () {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    typeLine = null;
    while (QUEUE.length) {
      var it = QUEUE.shift();
      it.el.innerHTML = it.html;
      output.appendChild(it.el);
    }
    isTyping = false;
    /* same as doneTyping — the settled save retires pending, not us */
    if (onDrained) { var cb = onDrained; onDrained = null; cb(); }
    scrollDown();
  };

  var appendLine = function (html, cls, instant) {
    var div = doc.createElement("div");
    div.className = "line" + (cls ? " line--" + cls : "");
    if (reduced || instant) {
      div.innerHTML = html;
      div.style.animationDelay = "0ms";
      output.appendChild(div);
      scrollDown();
      return;
    }
    div.style.animationDelay = "0ms";
    QUEUE.push({ el: div, html: html });
    if (!isTyping) startTimer();
  };

  /* ============================================================
     Renderer context for commands.js
     ============================================================ */
  var ctxInstant = false;
  var ctx = {
    print: function (html) { appendLine(html, "", ctxInstant); },
    blank: function () { appendLine("&nbsp;"); },
    clear: function () {
      finishAll();
      output.innerHTML = "";
      try { sessionStorage.removeItem("glgl-screen"); } catch (e) { /* ignore */ }
      setPending(null);
      scrollDown();
    },
    job: function (role, dates, bullets) {
      appendLine(
        '<span class="jobrow"><span>' + esc(role) + '</span><span class="jobrow__dates">' +
        esc(dates) + "</span></span>"
      );
      bullets.forEach(function (b) {
        appendLine('<span class="dim">  · ' + esc(b) + "</span>");
      });
      appendLine("&nbsp;");
    },
    setHash: function (hash) {
      if (hash && location.hash !== "#" + hash) location.hash = hash;
    },
  };

  /* ============================================================
     Boot — typed by the printer; prompt after the drain
     ============================================================ */
  var bootLines = function () {
    return mobile
      ? isIOS
        ? ["agbox — the iphone shell with delusions of adequacy", "type help — same résumé, new shell", "glgl@iphone ~ % — home is where ~ is"]
        : ["Welcome to Termux!", "Docs: https://wiki.termux.com", "Community: https://termux.com/community"]
      : ["Microsoft Windows [Version 10.0.22631]", "(c) Microsoft Corporation. All rights reserved."];
  };

  var boot = function () {
    /* a saved screen means this session already lived — restore it
       instead of replaying boot text (phones reload on app switch).
       v-guard: snapshots from older builds (e.g. one holding a half
       done cv loader bar) are stale — throw them away. */
    var snap = null;
    /* typed URL / new tab / off-site link = a NEW visit: sessionStorage
       survives plain navigation, so without this the previous visit's
       screen would leak into it. Only genuine reloads (and mobile
       app-switch kills, also reported as reload) restore. */
    if (!isReload()) {
      try {
        sessionStorage.removeItem("glgl-screen");
        sessionStorage.removeItem(PENDING_KEY);
      } catch (e) { /* ignore */ }
    }
    try { snap = JSON.parse(sessionStorage.getItem("glgl-screen") || "null"); } catch (e) { snap = null; }
    if (!snap || snap.v !== 2 || typeof snap.h !== "string") {
      try { if (sessionStorage.getItem("glgl-screen")) sessionStorage.removeItem("glgl-screen"); } catch (e) { /* ignore */ }
      snap = null;
    }
    /* a pending marker only pairs with a snapshot from the same
       session — with no screen to restore it would replay onto a
       blank page; drop both together */
    var pendingLine = null;
    try { pendingLine = sessionStorage.getItem(PENDING_KEY); } catch (e) { pendingLine = null; }
    if (!snap && pendingLine) {
      setPending(null);
      pendingLine = null;
    }
    /* the rain can't be restored — its canvas repaints every frame,
       so the snapshot comes back as a dead blank screen. boot fresh. */
    if (snap && (snap.h.indexOf("matrix-canvas") !== -1 || snap.h.indexOf("matrix__hint") !== -1)) {
      try { sessionStorage.removeItem("glgl-screen"); } catch (e) { /* ignore */ }
      setPending(null);
      pendingLine = null;
      snap = null;
    }
    if (snap && snap.h) {
      output.innerHTML = snap.h;
      /* loader bars are transient UI — an interrupted one would sit
         frozen forever; drop any that didn't finish before the save */
      output.querySelectorAll(".line--load:not(.line--load-done)").forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      var rows = output.querySelector(".menu-block");
      if (rows) {           // the index was open — put it back, bound and live
        menuOpen = true;
        menuRows = rows;
        var selRow = rows.querySelector(".menu-row--sel");
        if (selRow) menuSel = Number(selRow.getAttribute("data-i")) || 0;
        hideDock();
      } else {
        showDock();
      }
      output.scrollTop = typeof snap.t === "number" ? snap.t : output.scrollHeight;
      /* a reload landed mid-generation: the restored screen holds the
         pre-stream view and glgl-pending holds the exact command line
         that was still printing — re-run it so generation CONTINUES
         instead of silently dying */
      if (pendingLine) {
        setPending(null);
        if (menuOpen) closeMenu();   // the replayed output replaces the index view
        replayedPending = true;
        term.classList.add("ready");
        focusInput();
        execute(pendingLine);
        return;
      }
      term.classList.add("ready");
      focusInput();
      return;
    }
    bootLines().forEach(function (line) { appendLine(esc(line)); });
    appendLine("&nbsp;");
    if (reduced) {
      showPrompt();
      if (pendingLine) {           // no animation to ride — run it outright
        setPending(null);
        replayedPending = true;
        execute(pendingLine);
      }
      return;
    }
    /* a pending command replays after the boot banner drains — the
       prompt reveal waits for THAT stream to finish instead */
    if (pendingLine) {
      setPending(null);
      onDrained = function () {
        replayedPending = true;
        term.classList.add("ready");
        focusInput();
        execute(pendingLine);
      };
    } else {
      onDrained = showPrompt;
    }
    if (!isTyping) startTimer();
  };

  /* ---------- prompt reveal + refresh behavior ---------- */
  var isReload = function () {
    try {
      var entry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (entry) return entry.type === "reload";
    } catch (e) { /* keep going */ }
    try {
      return window.performance.navigation.type === 1;
    } catch (e) {
      return false;
    }
  };

  /* set while boot() re-ran an interrupted command — the auto-menu
     timer stands down so the resumed output stays readable */
  var replayedPending = false;

  var showPrompt = function () {
    term.classList.add("ready");
    focusInput();
    if (isReload()) {
      if (location.hash) {
        try {
          window.history.replaceState(null, "", location.pathname + location.search);
        } catch (e) { /* file:// and exotic cases */ }
      }
      return;
    }
    if (location.hash) onHashChange();
  };

  /* ============================================================
     Hash routing — shareable sections + back/forward
     ============================================================ */
  var renderedHash = null;

  var onHashChange = function () {
    var name = location.hash.replace(/^#/, "");
    if (!name) return;
    var cmd = window.app.resolve(name);
    if (!cmd || cmd.hash !== name) return;
    if (name === renderedHash) return;
    renderedHash = name;
    appendLine('<span class="dim">glgl: opening \\' + esc(name) + " …</span>");
    cmd.run(ctx);
    /* same resume protection as typed commands — a deep link that was
       still streaming when the page died gets re-run by boot().
       `clear` has no hash so it can never land here. */
    if (INSTANT_COMMANDS.indexOf(name) === -1) setPending(name);
  };

  window.addEventListener("hashchange", onHashChange);

  /* ---------- history ---------- */
  var history = [];
  var histIndex = -1;
  var draft = "";

  /* ============================================================
     Matrix rain
     ============================================================ */
  var matrixActive = false, matrixTimer = null, matrixCanvas = null, matrixHint = null;

  var stopMatrix = function () {
    if (!matrixActive) return;
    matrixActive = false;
    if (matrixTimer) clearInterval(matrixTimer);
    matrixTimer = null;
    if (matrixCanvas && matrixCanvas.parentNode) matrixCanvas.parentNode.removeChild(matrixCanvas);
    matrixCanvas = null;
    if (matrixHint && matrixHint.parentNode) matrixHint.parentNode.removeChild(matrixHint);
    matrixHint = null;
  };

  var startMatrix = function () {
    stopMatrix();
    finishAll();
    output.innerHTML = "";
    matrixActive = true;

    matrixCanvas = doc.createElement("canvas");
    matrixCanvas.className = "matrix-canvas";
    output.appendChild(matrixCanvas);

    matrixHint = doc.createElement("div");
    matrixHint.className = "matrix__hint";
    matrixHint.textContent = "press Enter to exit the rain";
    output.appendChild(matrixHint);

    var c = matrixCanvas;
    var g = c.getContext("2d");
    var resize = function () { c.width = output.clientWidth; c.height = output.clientHeight; };
    resize();

    var chars = "\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c80123456789ABCDEF";
    var fontSize = 14;
    var cols = Math.max(1, Math.floor(c.width / fontSize));
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -20);

    var accent = "#3ddc84";
    try {
      var v = getComputedStyle(doc.documentElement).getPropertyValue("--ok").trim();
      if (v) accent = v;
    } catch (e) { /* ignore */ }

    var draw = function () {
      g.fillStyle = "rgba(0, 0, 0, 0.08)";
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = accent;
      g.font = fontSize + "px monospace";
      for (var j = 0; j < cols; j++) {
        g.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), j * fontSize, drops[j] * fontSize);
        if (drops[j] * fontSize > c.height && Math.random() > 0.975) drops[j] = 0;
        drops[j]++;
      }
    };
    draw();
    matrixTimer = setInterval(draw, 50);
  };

  /* ============================================================
     Guess game
     ============================================================ */
  var gameActive = false, secret = 0, tries = 0;
  /* su command sets window.app.suAsk (commands.js); execute() here consumes it */
  window.app.suAsk = false;
  /* admin session — sudo/su elevate, reboot revokes (see reboot()) */
  window.app.admin = false;

  /* ============================================================
     Sound blips — WebAudio, opt-in, persisted
     ============================================================ */
  var audioCtx = null;
  var soundOn = false;
  try { soundOn = localStorage.getItem("glgl-sound") === "1"; } catch (e) { /* ignore */ }

  var blip = function (low) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.type = "square";
      o.frequency.value = low ? 240 + Math.random() * 60 : 480 + Math.random() * 240;
      g.gain.value = 0.018;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.03);
    } catch (e) { /* audio unavailable */ }
  };

  /* ============================================================
     Command execution
     ============================================================ */
  var commandNames = function () {
    return Object.keys(window.app.commands).concat(Object.keys(window.app.aliases || {}));
  };

  var distance = function (a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    var prev = new Array(n + 1), cur = new Array(n + 1);
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur[0] = i;
      for (var j2 = 1; j2 <= n; j2++) {
        cur[j2] = Math.min(prev[j2] + 1, cur[j2 - 1] + 1, prev[j2 - 1] + (a[i - 1] === b[j2 - 1] ? 0 : 1));
      }
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[n];
  };

  var promptText = function () {
    return esc(shellPrompt());
  };

  var execute = function (raw) {
    var trimmed = raw.trim();
    /* the rain dies on any Enter — even an empty one (the hint says so) */
    if (matrixActive) stopMatrix();
    if (!trimmed) return;

    appendLine('<span class="echo-prompt">' + promptText() + "</span> " + esc(trimmed), "echo");

    if (gameActive) {
      if (trimmed.toLowerCase() === "quit") {
        gameActive = false;
        appendLine("the number was <b>" + secret + "</b> — thanks for playing!");
        return;
      }
      var n = parseInt(trimmed, 10);
      if (!isFinite(n)) {
        appendLine("enter a number between <b>1</b> and <b>100</b> — or <b>quit</b> to give up");
        return;
      }
      tries++;
      if (n < secret) appendLine("too low — aim higher");
      else if (n > secret) appendLine("too high — aim lower");
      else {
        appendLine("<b>Correct!</b> You got it in " + tries + (tries === 1 ? " try" : " tries") + ".");
        appendLine('<span class="dim">— your reward: a calm sense of closure.</span>');
        gameActive = false;
      }
      return;
    }

    if (window.app.suAsk) {
      window.app.suAsk = false;
      var pw = trimmed.toLowerCase();
      if (pw === "cancel" || pw === "quit" || pw === "q") {
        appendLine("su: authentication cancelled.");
        return;
      }
      if (pw === "glgl") {
        window.app.admin = true;
        appendLine("<b>admin</b> — root switch complete. the terminal bows to you.");
        appendLine('<span class="dim">(try <b>sudo</b> for the encore, or <b>ls</b> to look around)</span>');
      } else {
        appendLine("su: authentication failure — and yes, we saw that.");
        appendLine('<span class="dim">(hint: four lowercase letters, same as the username — run <b>su</b> to try again)</span>');
      }
      return;
    }

    history.push(trimmed);
    histIndex = -1;

    var token = trimmed.split(/\s+/)[0];
    var cmd = window.app.resolve(token);
    var rest = trimmed.slice(token.length).replace(/^\s+/, "");

    if (!cmd) {
      if (mobile) {
        appendLine("bash: " + esc(token) + ": command not found");
      } else {
        appendLine("'" + esc(token) + "' is not recognized as an internal or external command,");
        appendLine("operable program or batch file.");
      }
      var best = null, bestD = 3;
      commandNames().forEach(function (name) {
        var d = distance(token.toLowerCase(), name.toLowerCase());
        if (d > 0 && d < bestD) { best = name; bestD = d; }
      });
      if (best) appendLine('<span class="dim">did you mean <b>' + esc(best) + "</b>?</span>");
      ctx.blank();
      return;
    }

    ctxInstant = INSTANT_COMMANDS.indexOf(token) !== -1;
    /* remember what is generating: if the page dies mid-stream
       (reload, app-switch kill), boot() replays exactly this line.
       every typed non-instant command pends — even ones that finish
       fast — because the echo line drains asynchronously and busyness
       checks would race. the settled save retires the marker ~300ms
       later; `clear` must never pend (it wipes its own evidence). */
    if (!ctxInstant && token !== "clear") setPending(trimmed);
    cmd.run(ctx, rest);
    ctxInstant = false;
    renderedHash = cmd.hash;
    ctx.setHash(cmd.hash);
  };

  /* ============================================================
     Input row
     ============================================================ */
  var syncMirror = function () {
    var v = input.value;
    mirror.textContent = v || "type 'help'";
    mirror.classList.toggle("ghost", v.length === 0);
    promptRow.scrollLeft = promptRow.scrollWidth;
  };

  var tabState = null;           // tab autocomplete: current hit list + cycle position

  input.addEventListener("input", function () { tabState = null; syncMirror(); });
  syncMirror();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      blip(true);
      if (isTyping || QUEUE.length) finishAll();  // flush the stream, then run the command
      if (menuOpen) {
        if (!input.value.trim()) { pickMenuItem(menuSel); return; }
        closeMenu();               // typing a real command wins over the menu
      }
      var raw = input.value;
      input.value = "";
      syncMirror();
      execute(raw);
      draft = "";
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isTyping || QUEUE.length) {
        finishAll();                     // skip the animation — never break it
        if (menuReturn) { menuReturn = false; openMenu(); }   // still go home
        return;
      }
      if (menuOpen) { closeMenu(); return; }
      if (menuReturn) { menuReturn = false; openMenu(); return; }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!input.value) return;
      var text = input.value;
      var sp = text.indexOf(" ");
      var prefix, hits;
      if (tabState && input.value === tabState.lastFill) {
        /* repeated tab — keep cycling the previous candidate set */
        prefix = tabState.prefix;
        hits = tabState.hits;
      } else {
        if (sp === -1) {
          /* first token — a command or alias name */
          prefix = text.toLowerCase();
          hits = commandNames()
            .filter(function (n) { return n.toLowerCase().indexOf(prefix) === 0; })
            .sort();
        } else {
          /* argument — the resolved command may declare completions */
          var cmd = text.slice(0, sp).trim().toLowerCase();
          var target = window.app.resolve(cmd);
          var comp = (target && target.complete) ? target.complete(text.slice(sp + 1)) : [];
          prefix = text.slice(sp + 1).toLowerCase();
          hits = comp
            .filter(function (c) { return c.toLowerCase().indexOf(prefix) === 0; })
            .sort();
        }
        if (!hits.length) { tabState = null; return; }
        tabState = { hits: hits, prefix: prefix, i: 0 };
        if (hits.length > 1) appendLine("glgl: " + hits.join("  "), "echo");
      }
      var fill = tabState.hits[tabState.i];
      tabState.i = (tabState.i + 1) % tabState.hits.length;
      input.value = sp === -1 ? fill : text.slice(0, sp + 1) + fill;
      tabState.lastFill = input.value;
      syncMirror();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (menuOpen) { menuSel = (menuSel + MENU_ITEMS.length - 1) % MENU_ITEMS.length; renderMenu(); return; }
      if (!history.length) return;
      if (histIndex < 0) draft = input.value;
      histIndex = Math.min(histIndex + 1, history.length - 1);
      input.value = history[history.length - 1 - histIndex];
      syncMirror();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (menuOpen) { menuSel = (menuSel + 1) % MENU_ITEMS.length; renderMenu(); return; }
      if (histIndex < 0) return;
      histIndex -= 1;
      if (histIndex < 0) input.value = draft;
      else input.value = history[history.length - 1 - histIndex];
      syncMirror();
    } else if (menuOpen && /^[1-7]$/.test(e.key)) {
      e.preventDefault();
      pickMenuItem(Number(e.key) - 1);
    } else if (e.key.length === 1) {
      blip(false);
    }
  });

  /* ---------- copy chips ---------- */
  var wireCopy = function (root) {
    root.addEventListener("click", function (e) {
      var act = e.target.closest("[data-action]");
      if (act) {
        e.preventDefault();
        if (act.getAttribute("data-action") === "cv") execute("cv");
        return;
      }
      var c = e.target.closest("a.copy");
      if (!c) return;
      e.preventDefault();
      var val = c.getAttribute("data-copy") || "";
      var restore = function () { c.textContent = "[copy]"; };
      try {
        navigator.clipboard.writeText(val).then(function () {
          c.textContent = "copied!";
          setTimeout(restore, 1600);
        }, restore);
      } catch (err) {
        restore();
      }
    });
  };
  wireCopy(output);

  /* ============================================================
     cv.pdf — the résumé loads like a program, then the real pdf
     opens in a new tab; a quick in-terminal card always follows
     ============================================================ */
  var loadTimer = null;
  /* the pdf to open — follows the newest assets/cv/*.pdf via cv-data.js */
  var CV_PDF = (window.app.CV && window.app.CV.pdf) || "assets/cv/AhmedAbdelgelel.pdf";
  window.app.cvBusy = function () { return !!loadTimer; };   // openMenu waits for the loader too

  window.app.cvLoad = function () {
    if (!window.app.cvLines) return;
    if (loadTimer) return;              // already loading — ignore re-entry
    finishAll();
    /* a frozen loader from an interrupted session must never survive
       a new load — exactly one bar, always alive */
    output.querySelectorAll(".line--load:not(.line--load-done)").forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    var loadDiv = doc.createElement("div");
    loadDiv.className = "line line--load";
    loadDiv.setAttribute("role", "status");
    output.appendChild(loadDiv);
    var ticks = 10;
    var i = 0;
    var paint = function () {
      if (!loadDiv.parentNode) { clearInterval(loadTimer); loadTimer = null; return; }
      i += 1;
      var p = Math.min(i / ticks, 1);
      var filled = Math.round(p * 20);
      loadDiv.innerHTML =
        '<span class="dim">loading cv.pdf …</span> <span class="load__bar">[' +
        "▓".repeat(filled) + "░".repeat(20 - filled) + "]</span> " + Math.round(p * 100) + "%";
      scrollDown();
      if (p >= 1) {
        clearInterval(loadTimer);
        loadTimer = null;
        var cvContent = window.app.cvLines();
        loadDiv.classList.add("line--load-done");
        loadDiv.innerHTML =
          '<span class="dim">cv.pdf loaded — ' + cvContent.length + " lines, " + cvContent.join("").length + " bytes — ready.</span>";
        scrollDown();
        var openLink = doc.createElement("div");
        openLink.className = "line";
        openLink.innerHTML =
          '<a href="' + CV_PDF + '" target="_blank" rel="noopener">[open cv.pdf]</a> ' +
          '<span class="dim">— your choice: view the pdf, or keep reading the copy below</span>';
        output.appendChild(openLink);
        scrollDown();
        cvContent.forEach(function (html, idx) {
          appendLine(html);
          if (idx === Math.floor(cvContent.length * 0.66)) {
            appendLine('<span class="dim">— enter to skip the rest —</span>');
          }
        });
      }
    };
    paint();
    loadTimer = setInterval(paint, 70);
  };

  /* ---------- click to refocus ---------- */
  term.addEventListener("click", function (e) {
    if (e.target.closest("button, a")) return;
    input.focus();
  });

  /* ============================================================
     Window controls — minimize / maximize / close, with a
     Termux-style power-off screen and a reboot shortcut
     ============================================================ */
  var powerOn = true;
  var GOODBYES = [
    "saving session… done. the terminal will be alone with its thoughts now.",
    "powering down circuits (all two of them).",
    "you close the window, but the magic stays in the terminal.",
    "shutting down in style — exit code 0, dignity intact.",
    "the terminal agreed to go off. it says 'finally, some quiet'.",
  ];
  var nextGoodbye = 0;

  var minBtn = doc.querySelector(".win-min");
  var maxBtn = doc.querySelector(".win-max");
  var closeBtn = doc.querySelector(".win-close");
  var poweroff = doc.getElementById("poweroff");
  var powerEcho = doc.getElementById("poweroff-echo");
  var powerMsg = doc.getElementById("poweroff-msg");
  var powerReboot = doc.getElementById("poweroff-reboot");
  var taskbar = doc.getElementById("taskbar");
  var taskItem = doc.getElementById("taskbar-item");
  var taskName = doc.getElementById("taskbar-item-name");
  var taskClock = doc.getElementById("taskbar-clock");

  var minimized = false;
  var winAnim = false;
  var MIN_MS = 240;
  var reset = doc.getElementById("reset");

  /* the factory-reset joke — platform-flavoured skin */
  var showReset = function () {
    if (!reset) return;
    reset.hidden = false;
    var android = doc.getElementById("reset-android");
    var ios = doc.getElementById("reset-ios");
    if (android) android.hidden = isIOS;
    if (ios) ios.hidden = !isIOS;
  };
  var hideReset = function () {
    if (reset) reset.hidden = true;
  };

  /* Windows-style minimize: swoosh down into the taskbar */
  var collapseToTaskbar = function () {
    if (minimized || winAnim || !powerOn) return;
    if (reduced) {
      minimized = true;
      term.classList.add("is-minimized");
      if (mobile) showReset();
      else doc.body.classList.add("desktop-mode");
      taskbar.hidden = false;
      if (minBtn) minBtn.setAttribute("aria-pressed", "true");
      return;
    }
    winAnim = true;
    term.classList.add("is-minimizing");            // shrink toward the bar
    setTimeout(function () {
      minimized = true;
      term.classList.add("is-minimized");
      term.classList.remove("is-minimizing");
      if (mobile) showReset();
      else doc.body.classList.add("desktop-mode");
      taskbar.hidden = false;
      if (minBtn) minBtn.setAttribute("aria-pressed", "true");
      winAnim = false;
      if (taskItem) taskItem.focus({ preventScroll: true });
    }, MIN_MS);
  };

  var restoreFromTaskbar = function () {
    if (!minimized || winAnim) return;
    if (reduced) {
      minimized = false;
      term.classList.remove("is-minimized");
      hideReset();
      doc.body.classList.remove("desktop-mode");
      taskbar.hidden = true;
      if (minBtn) minBtn.setAttribute("aria-pressed", "false");
      focusInput();
      return;
    }
    winAnim = true;
    taskbar.hidden = true;
    hideReset();
    doc.body.classList.remove("desktop-mode");
    term.classList.remove("is-minimized");
    term.classList.add("is-minimizing");            // start from the collapsed pose
    void term.offsetWidth;                           // force reflow, then animate up
    term.classList.remove("is-minimizing");
    setTimeout(function () {
      minimized = false;
      if (minBtn) minBtn.setAttribute("aria-pressed", "false");
      winAnim = false;
      focusInput();
    }, MIN_MS);
  };

  if (minBtn) minBtn.addEventListener("click", function () {
    if (!powerOn) return;
    blip(true);
    if (minimized) restoreFromTaskbar();
    else collapseToTaskbar();
  });

  if (taskItem) taskItem.addEventListener("click", function () {
    blip(true);
    restoreFromTaskbar();
  });

  if (maxBtn) maxBtn.addEventListener("click", function () {
    if (!powerOn) return;
    blip(true);
    var on = term.classList.toggle("is-maximized");
    maxBtn.setAttribute("aria-pressed", String(on));
    try {
      if (on && doc.documentElement.requestFullscreen) {
        doc.documentElement.requestFullscreen()["catch"](function () { /* not supported */ });
      } else if (!on && doc.exitFullscreen) {
        doc.exitFullscreen()["catch"](function () { /* not supported */ });
      }
    } catch (err) { /* ignore */ }
  });

  doc.addEventListener("fullscreenchange", function () {
    if (doc.fullscreenElement) return;                  // entered via the button
    if (term.classList.contains("is-maximized")) {      // exited (e.g. Esc) — sync icon
      term.classList.remove("is-maximized");
      if (maxBtn) maxBtn.setAttribute("aria-pressed", "false");
    }
  });

  var shutdown = function () {
    if (!powerOn) return;
    powerOn = false;
    if (isTyping || QUEUE.length) finishAll();
    if (loadTimer) { clearInterval(loadTimer); loadTimer = null; }  // no loading after power-off
    setPending(null);   // the stream was flushed to the screen — nothing pending
    var echo = shellPrompt() + (mobile ? " poweroff" : " shutdown -s");
    var msg = GOODBYES[nextGoodbye % GOODBYES.length];
    nextGoodbye += 1;
    if (powerEcho) powerEcho.textContent = echo;
    if (powerMsg) powerMsg.textContent = msg;
    appendLine(echo, "echo");
    appendLine(msg, "dim");
    blip(true);
    minimized = false;
    winAnim = false;
    hideReset();
    doc.body.classList.remove("desktop-mode");
    if (taskbar) taskbar.hidden = true;
    term.classList.remove("is-minimizing");
    term.classList.add("is-off");
    if (poweroff) {
      poweroff.hidden = false;
      if (window.matchMedia("(pointer: fine)").matches && powerReboot) powerReboot.focus({ preventScroll: true });
    }
  };

  var reboot = function () {
    if (powerOn) return;
    powerOn = true;
    window.app.admin = false;  // reality check: root does not survive a reboot
    if (poweroff) poweroff.hidden = true;
    minimized = false;
    hideReset();
    doc.body.classList.remove("desktop-mode");
    if (taskbar) taskbar.hidden = true;
    term.classList.remove("is-off", "is-minimized", "is-minimizing");
    if (minBtn) minBtn.setAttribute("aria-pressed", "false");
    var echo = shellPrompt() + (mobile ? " reboot" : " shutdown /a");
    appendLine(echo, "echo");
    appendLine('welcome back. <span class="dim">type help to see the damage.</span>', "");
    blip(true);
    lastActive = Date.now();
    if (menuOpen && !menuRows) renderMenu();  // a shutdown must not eat the menu
    focusInput();
  };

  if (closeBtn) closeBtn.addEventListener("click", shutdown);

  if (poweroff) poweroff.addEventListener("click", function (e) {
    if (e.target.closest("button")) return;   // reboot chip handles its own click
    reboot();
  });
  if (powerReboot) powerReboot.addEventListener("click", function (e) {
    e.stopPropagation();
    reboot();
  });
  window.addEventListener("keydown", function (e) {
    if (!powerOn) {
      e.preventDefault();
      reboot();
    }
  }, true);

  var focusInput = function () {
    if (window.matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
  };

  /* ============================================================
     Live clock + idle screensaver
     ============================================================ */
  var clockEl = doc.getElementById("clock");
  var saver = doc.getElementById("saver");
  var saverClock = doc.getElementById("saver-clock");

  var pad2 = function (n) { return String(n).padStart(2, "0"); };
  var clockText = function (withSeconds) {
    var d = new Date();
    var t = pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    if (withSeconds) t += ":" + pad2(d.getSeconds());
    return t;
  };

  setInterval(function () {
    if (clockEl) clockEl.textContent = clockText(true);
    if (saverClock && !saver.hidden) saverClock.textContent = clockText(false);
    if (taskClock && taskbar && !taskbar.hidden) taskClock.textContent = clockText(false);
  }, 1000);
  if (clockEl) clockEl.textContent = clockText(true);

  var lastActive = Date.now();

  var activity = function () {
    lastActive = Date.now();
    if (saver && !saver.hidden) saver.hidden = true;
  };

  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, activity, { passive: true });
  });
  input.addEventListener("input", activity);

  setInterval(function () {
    if (reduced) return;
    if (!powerOn || minimized) return;                 // terminal is off / parked
    if (saver.hidden && !matrixActive && !gameActive &&
        Date.now() - lastActive > 60000 && doc.visibilityState !== "hidden") {
      saver.hidden = false;
      if (saverClock) saverClock.textContent = clockText(false);
    }
  }, 5000);

  /* ============================================================
     Engine-owned commands (live in this file: DOM/Audio/state)
     ============================================================ */
  window.app.commands.matrix = {
    help: "green code rain",
    hash: null,
    run: function () { startMatrix(); },
  };

  window.app.commands.guess = {
    help: "number guessing game",
    hash: null,
    run: function (ctx2) {
      gameActive = true;
      secret = Math.floor(Math.random() * 100) + 1;
      tries = 0;
      ctx2.print("I picked a number between <b>1</b> and <b>100</b>.");
      ctx2.print("type your guess — <b>quit</b> to give up.");
    },
  };

  window.app.commands.sound = {
    help: "keypress blips: on / off",
    hash: null,
    complete: function () { return ["on", "off"]; },
    run: function (ctx2, rest) {
      var arg = (rest || "").trim().toLowerCase();
if (arg === "on") {
          soundOn = true;
          try { localStorage.setItem("glgl-sound", "1"); } catch (e) { /* ignore */ }
          ctx2.print("keypress blips: <b>on</b>");
          ctx2.print('<span class="dim">saved — blips come back next visit</span>');
          blip(true);
        } else if (arg === "off") {
          soundOn = false;
          try { localStorage.setItem("glgl-sound", "0"); } catch (e) { /* ignore */ }
          ctx2.print("keypress blips: <b>off</b>");
          ctx2.print('<span class="dim">saved — silence is remembered</span>');
        } else {
        ctx2.print("keypress blips: currently <b>" + (soundOn ? "on" : "off") + "</b>");
        ctx2.print('<span class="dim">usage: sound on | sound off</span>');
      }
    },
  };

  window.app.commands.speed = {
    help: "typing speed: slow / normal / fast",
    hash: null,
    complete: function () { return ["slow", "normal", "fast"]; },
    run: function (ctx2, rest) {
      var arg = (rest || "").trim().toLowerCase();
      if (arg === "slow" || arg === "normal" || arg === "fast") {
        SPEED = RATES[arg];
        try { localStorage.setItem("glgl-speed", arg); } catch (e) { /* ignore */ }
        ctx2.print("typing speed: <b>" + arg + "</b>");
        ctx2.print('<span class="dim">saved — it stays this fast next visit</span>');
        return;
      }
      var current = SPEED >= 18 ? "slow" : SPEED >= 5 ? "normal" : "fast";
      ctx2.print("typing speed: currently <b>" + current + "</b>");
      ctx2.print('<span class="dim">usage: speed slow | speed normal | speed fast</span>');
    },
  };

  /* ============================================================
     In-terminal menu — one CLI, one entry point. the interactive
     index (cv, contact, projects…) lives inside the terminal,
     opens by default at boot, and can be reopened any time with
     the `menu` command.
     ============================================================ */
  var menuOpen = false;       // menu is currently rendered
  var menuReturn = false;     // a menu item was picked; esc returns
  var menuSel = 0;            // highlighted row
  var menuRows = null;        // element holding the menu rows
  var menuDock = doc.getElementById("menu-dock");   // mobile way home (null on old builds)
  var docked = false;         // a history entry for back-to-menu is pending

  var hideDock = function () { if (menuDock) menuDock.hidden = true; };
  var showDock = function () { if (menuDock) menuDock.hidden = false; };

  /* Android back button / browser back — pickMenu pushes one entry;
     popping it reopens the menu (the esc key of the phone).
     Only react when the popped state is OUR marker — some browsers
     fire stray popstate events (restores, odd navigations) and we
     must not reopen the menu off a state-less pop. */
  window.addEventListener("popstate", function (e) {
    if (menuOpen) return;
    if (!e.state || e.state.glgl !== "back-to-menu") return;
    openMenu();
  });

  /* the dock pill is a real button: tapping it comes home to the menu.
     (it lives in the header of this section so it exists even if the
     menu never opened at boot, e.g. deep links like /#cv) */
  if (menuDock) {
    menuDock.addEventListener("click", function (e) {
      e.stopPropagation();
      openMenu();
      scrollDown();
    });
  }

  /* one canonical command per row — the menu never drifts from the CLI */
  var MENU_ITEMS = [
    { title: "CV · full résumé", desc: "the real cv.pdf — open it when you want", cmd: "cv" },
    { title: "experience", desc: "three roles, real products", cmd: "experience" },
    { title: "projects", desc: "selected builds — repos included", cmd: "projects" },
    { title: "skills & stack", desc: "languages, backend, devops, testing", cmd: "stack" },
    { title: "education", desc: "the degree, the university, the year", cmd: "education" },
    { title: "contact", desc: "email, phone, linkedin, github", cmd: "contact" },
    { title: "hire me", desc: "open to roles — reach out", cmd: "contact" },
  ];

  var renderMenu = function () {
    if (!menuRows) {
      menuRows = doc.createElement("div");
      menuRows.className = "menu-block";
      output.appendChild(menuRows);
    }
    var h = [
      '<div class="menu-block__hint"><span class="dim">' +
        (window.innerWidth <= 640
          ? "tap a row to open it — <b>‹ menu</b> below brings you back · or type <b>menu</b>"
          : "use <b>↑↓</b> / <b>1–7</b> to pick — <b>enter</b> opens — <b>esc</b> closes — type <b>menu</b> to reopen") +
        "</span></div>",
    ];
    MENU_ITEMS.forEach(function (it, i) {
      h.push(
        '<button type="button" class="menu-row' + (i === menuSel ? " menu-row--sel" : "") + '" data-i="' + i + '">' +
          '<span class="menu-row__num">' + (i + 1) + "</span>" +
          '<span class="menu-row__body"><span class="menu-row__title">' + esc(it.title) + "</span>" +
          '<span class="menu-row__desc">' + esc(it.desc) + "</span></span>" +
          '<span class="menu-row__keys dim">' + esc(it.cmd) + "</span>" +
        "</button>"
      );
    });
    menuRows.innerHTML = h.join("");
    menuRows.setAttribute("role", "listbox");
    menuRows.querySelectorAll(".menu-row").forEach(function (row) {
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(row.getAttribute("data-i") === String(menuSel)));
    });
    scrollDown();
  };

  /* row taps are delegated on the output — the menu stays clickable even
     when it comes back from a session restore (no per-render listeners) */
  output.addEventListener("click", function (e) {
    var row = e.target.closest(".menu-row");
    if (!row || !menuOpen) return;
    e.stopPropagation();       // don't steal focus / fire term taps
    pickMenuItem(Number(row.getAttribute("data-i")));
  });

  var openMenuToken = 0;
  var openMenu = function () {
    if (menuOpen) return;
    menuOpen = true;
    menuReturn = false;
    menuSel = 0;
    docked = false;          // the back-entry was (or will be) consumed
    hideDock();
    var token = ++openMenuToken;
    var show = function () {
      if (!menuOpen || token !== openMenuToken) return;  // esc'd away / superseded
      renderMenu();
      scrollDown();
    };
    /* never interrupt a stream: render the menu only once the typewriter
       AND the cv loader are done — going back to the menu must never
       split or cut text that is still generating */
    var busy = function () {
      return isTyping || QUEUE.length || (window.app.cvBusy && window.app.cvBusy());
    };
    if (!busy()) { show(); return; }
    var tries = 0;
    (function waitIdle() {
      tries += 1;
      if (!busy()) return show();
      if (tries > 70) return show();      // never leave the user stranded
      setTimeout(waitIdle, 120);
    })();
  };

  var closeMenu = function () {
    menuOpen = false;
    if (menuRows) {
      if (menuRows.parentNode) menuRows.parentNode.removeChild(menuRows);
      menuRows = null;
    }
    showDock();
    saveScreen();
  };

  var pickMenuItem = function (i) {
    var it = MENU_ITEMS[i];
    if (!it) return;
    blip(true);
    closeMenu();
    menuReturn = true;
    if (!docked && history && history.pushState) {
      docked = true;
      try { history.pushState({ glgl: "back-to-menu" }, ""); } catch (err) { docked = false; }
    }
    execute(it.cmd);
    /* one button only: the dock pill is the way home (phones).
       on desktop the keyboard hint stays — esc or `menu` works. */
    if (window.innerWidth > 640) {
      var hint = doc.createElement("div");
      hint.className = "dim";
      hint.innerHTML = "— <b>esc</b> back to the menu · or type <b>menu</b> —";
      output.appendChild(hint);
      scrollDown();
    }
  };

  window.app.menuDidClear = function () {
    menuOpen = false;
    menuReturn = false;
    menuRows = null;
    showDock();
  };

  /* the always-available way back in: `menu` (alias: `list`,
     shareable deep link: <site>/#list) */
  window.app.commands.menu = {
    help: "interactive index — cv, contact, projects…",
    hash: "list", // #list reopens the menu from anywhere, incl. mobile shares
    run: function () { menuReturn = false; openMenu(); },
  };

  /* the index opens by default at boot — deep links skip straight to work */
  setTimeout(function () {
    if (replayedPending || (window.app.cvBusy && window.app.cvBusy())) return;
    // a pending replay is streaming — don't cover the resumed output with the menu
    if (!(location.hash.length > 1)) openMenu();
    else showDock();   // deep-linked (menu closed) — show the mobile way home
  }, 320);

  /* ---------- go ---------- */
  boot();

  if (typeof window.__termReady === "function") window.__termReady();
})();