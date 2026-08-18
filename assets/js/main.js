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

  /* ---------- skin: Windows terminal (desktop) / Termux (mobile) ---------- */
  var mql = window.matchMedia("(max-width: 640px)");
  var mobile = mql.matches;
  var promptLabel = doc.getElementById("prompt-label");

  var updateSkin = function () {
    mobile = mql.matches;
    document.title = mobile ? "glgl — Termux" : "glgl — C:\\Windows\\system32\\cmd.exe";
    if (promptLabel) promptLabel.textContent = mobile ? "glgl@phone:~$" : "C:\\Users\\glgl>";
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

  /* ---------- platform: factory-reset skins differ phone-to-phone ---------- */
  var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(navigator.userAgent);

  /* ---------- helpers ---------- */
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

  /* ============================================================
     Typewriter printer — lines render char-by-char with a
     random jitter so output feels "printed" not pasted.
     ============================================================ */
  var QUEUE = [];
  var SPEED = 5;                 // ms per character
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
    var n = SPEED <= 2 ? 4 : SPEED <= 5 ? 3 : 2;
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
    if (onDrained) { var cb = onDrained; onDrained = null; cb(); }
    scrollDown();
  };

  var appendLine = function (html, cls) {
    var div = doc.createElement("div");
    div.className = "line" + (cls ? " line--" + cls : "");
    if (reduced) {
      div.innerHTML = html;
      div.style.animationDelay = "0ms";
      output.appendChild(div);
      return;
    }
    div.style.animationDelay = Math.floor(Math.random() * 70 + 10) + "ms";
    QUEUE.push({ el: div, html: html });
    if (!isTyping) startTimer();
  };

  /* ============================================================
     Renderer context for commands.js
     ============================================================ */
  var ctx = {
    print: function (html) { appendLine(html); },
    blank: function () { appendLine("&nbsp;"); },
    clear: function () { finishAll(); output.innerHTML = ""; scrollDown(); },
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
      ? ["Welcome to Termux!", "Docs: https://wiki.termux.com", "Community: https://termux.com/community"]
      : ["Microsoft Windows [Version 10.0.22631]", "(c) Microsoft Corporation. All rights reserved."];
  };

  var boot = function () {
    bootLines().forEach(function (line) { appendLine(esc(line)); });
    appendLine("&nbsp;");
    if (reduced) { showPrompt(); return; }
    onDrained = showPrompt;
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
    return esc(mobile ? "glgl@phone:~$" : "C:\\Users\\glgl>");
  };

  var execute = function (raw) {
    var trimmed = raw.trim();
    if (!trimmed) return;

    appendLine('<span class="echo-prompt">' + promptText() + "</span> " + esc(trimmed), "echo");

    if (matrixActive) stopMatrix();

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

    cmd.run(ctx, rest);
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

  input.addEventListener("input", syncMirror);
  syncMirror();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      blip(true);
      if (isTyping || QUEUE.length) { finishAll(); return; }  // skip animation
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
      if (isTyping || QUEUE.length) { finishAll(); return; }
      if (menuOpen) { closeMenu(); return; }
      if (menuReturn) { menuReturn = false; openMenu(); return; }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (input.value.indexOf(" ") === -1 && input.value.length) {
        var pre = input.value.toLowerCase();
        var hits = commandNames()
          .filter(function (n) { return n.toLowerCase().indexOf(pre) === 0; })
          .sort();
        if (hits.length === 1) {
          input.value = hits[0];
          syncMirror();
        } else if (hits.length > 1) {
          appendLine("glgl: " + hits.join("  "), "echo");
        }
      }
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
        if (act.getAttribute("data-action") === "cv") window.app.cvLoad();
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
     cv.txt — the résumé loads like a program INSIDE the terminal:
     a loader bar first, then the document streams in line by line
     ============================================================ */
  var loadTimer = null;

  window.app.cvLoad = function () {
    if (!window.app.cvLines) return;
    if (loadTimer) return;              // already loading — ignore re-entry
    finishAll();
    var loadDiv = doc.createElement("div");
    loadDiv.className = "line line--load";
    output.appendChild(loadDiv);
    var ticks = 14;
    var i = 0;
    var paint = function () {
      if (!loadDiv.parentNode) { clearInterval(loadTimer); loadTimer = null; return; }
      i += 1;
      var p = Math.min(i / ticks, 1);
      var filled = Math.round(p * 20);
      loadDiv.innerHTML =
        '<span class="dim">loading cv.txt …</span> <span class="load__bar">[' +
        "▓".repeat(filled) + "░".repeat(20 - filled) + "]</span> " + Math.round(p * 100) + "%";
      scrollDown();
      if (p >= 1) {
        clearInterval(loadTimer);
        loadTimer = null;
        var cvContent = window.app.cvLines();
        loadDiv.classList.add("line--load-done");
        loadDiv.innerHTML =
          '<span class="dim">cv.txt loaded — ' + cvContent.length + " lines, " + cvContent.join("").length + " bytes — streaming…</span>";
        scrollDown();
        cvContent.forEach(function (html) { appendLine(html); });
      }
    };
    paint();
    loadTimer = setInterval(paint, 85);
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
    var echo = mobile ? "glgl@phone:~$ poweroff" : "C:\\Users\\glgl> shutdown -s";
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
    if (poweroff) poweroff.hidden = true;
    minimized = false;
    hideReset();
    doc.body.classList.remove("desktop-mode");
    if (taskbar) taskbar.hidden = true;
    term.classList.remove("is-off", "is-minimized", "is-minimizing");
    if (minBtn) minBtn.setAttribute("aria-pressed", "false");
    var echo = mobile ? "glgl@phone:~$ reboot" : "C:\\Users\\glgl> shutdown /a";
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
    run: function (ctx2, rest) {
      var arg = (rest || "").trim().toLowerCase();
      if (arg === "on") {
        soundOn = true;
        try { localStorage.setItem("glgl-sound", "1"); } catch (e) { /* ignore */ }
        ctx2.print("keypress blips: <b>on</b>");
        blip(true);
      } else if (arg === "off") {
        soundOn = false;
        try { localStorage.setItem("glgl-sound", "0"); } catch (e) { /* ignore */ }
        ctx2.print("keypress blips: <b>off</b>");
      } else {
        ctx2.print("keypress blips: currently <b>" + (soundOn ? "on" : "off") + "</b>");
        ctx2.print('<span class="dim">usage: sound on | sound off</span>');
      }
    },
  };

  window.app.commands.speed = {
    help: "typing speed: slow / normal / fast",
    hash: null,
    run: function (ctx2, rest) {
      var arg = (rest || "").trim().toLowerCase();
      var RATES = { slow: 18, normal: 5, fast: 2 };
      if (RATES[arg]) {
        SPEED = RATES[arg];
        ctx2.print("typing speed: <b>" + arg + "</b>");
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

  /* one canonical command per row — the menu never drifts from the CLI */
  var MENU_ITEMS = [
    { title: "CV · full résumé", desc: "the whole story in one tidy document", cmd: "cv" },
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
      '<div class="menu-block__hint"><span class="dim">use <b>↑↓</b> / <b>1–7</b> to pick — <b>enter</b> opens — <b>esc</b> closes — type <b>menu</b> to reopen</span></div>',
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
    menuRows.querySelectorAll(".menu-row").forEach(function (row) {
      row.addEventListener("click", function (e) {
        e.stopPropagation();     // don't steal focus / fire term taps
        if (!menuOpen) return;
        pickMenuItem(Number(row.getAttribute("data-i")));
      });
    });
    scrollDown();
  };

  var openMenu = function () {
    if (menuOpen) return;
    menuOpen = true;
    menuReturn = false;
    menuSel = 0;
    renderMenu();
  };

  var closeMenu = function () {
    menuOpen = false;
    if (menuRows) {
      if (menuRows.parentNode) menuRows.parentNode.removeChild(menuRows);
      menuRows = null;
    }
  };

  var pickMenuItem = function (i) {
    var it = MENU_ITEMS[i];
    if (!it) return;
    blip(true);
    closeMenu();
    menuReturn = true;
    execute(it.cmd);
    if (it.cmd !== "cv") {       // the cv overlay handles its own esc
      setTimeout(function () {
        var hint = doc.createElement("div");
        hint.className = "dim";
        hint.innerHTML = "— <b>esc</b> back to the menu · or type <b>menu</b> —";
        output.appendChild(hint);
        scrollDown();
      }, 10);
    }
  };

  window.app.menuDidClear = function () {
    menuOpen = false;
    menuReturn = false;
    menuRows = null;
  };

  /* the always-available way back in: `menu` (alias: `list`) */
  window.app.commands.menu = {
    help: "interactive index — cv, contact, projects…",
    hash: null, // the menu lives in the terminal, not in a URL anchor
    run: function () { menuReturn = false; openMenu(); },
  };

  /* the index opens by default at boot — deep links skip straight to work */
  setTimeout(function () {
    if (!(location.hash.length > 1)) openMenu();
  }, 320);

  /* ---------- go ---------- */
  boot();

  if (typeof window.__termReady === "function") window.__termReady();
})();