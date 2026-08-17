/* ============================================================
   Main interactions — typing effect, reveal on scroll,
   sticky nav, mobile menu
   ============================================================ */
(function () {
  "use strict";

  const doc = document;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav: background on scroll ---------- */
  const nav = doc.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = doc.getElementById("nav-toggle");
  const links = doc.getElementById("nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    doc.addEventListener("click", (e) => {
      if (!e.target.closest(".nav") && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- boot system: sections unlock via terminal or nav ---------- */
  const unlock = (id) => {
    const el = doc.getElementById(id);
    if (!el) return null;
    const wasLocked = el.classList.contains("locked");
    el.classList.remove("locked");
    el.classList.add("booted");
    const rs = el.querySelectorAll(".reveal");
    rs.forEach((r, i) => {
      if (!r.classList.contains("in")) {
        r.classList.add("in");
        if (wasLocked) r.style.transitionDelay = Math.min(i * 70, 700) + "ms";
      }
    });
    if (wasLocked) {
      setTimeout(() => rs.forEach((r) => (r.style.transitionDelay = "")), 1000);
    }
    return el;
  };

  /* nav anchor click → boot + smooth scroll (keeps nav useful while sections are offline) */
  doc.querySelectorAll("a[href^='#']").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = doc.getElementById(id);
    if (!target || id === "top" || id === "hero") return;
    a.addEventListener("click", (e) => {
      if (target.classList.contains("locked")) {
        e.preventDefault();
        unlock(id);
        setTimeout(() => target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 90);
      }
    });
  });

  /* ---------- terminal typing effect ---------- */
  const typed = doc.getElementById("typed");
  if (typed) {
    const text = typed.dataset.text || "";
    const output = doc.getElementById("term-output");

    const showHint = () => {
      if (!output) return;
      const p = doc.createElement("p");
      p.className = "term-out";
      p.innerHTML = '<span class="term-muted">sections are offline — type <span class="term-ok">help</span> to boot one</span>';
      output.appendChild(p);
    };

    if (reduced || !text) {
      typed.textContent = text;
      showHint();
    } else {
      let i = 0;
      const speed = 34;
      const total = 700 + text.length * speed;
      setTimeout(showHint, total + 600);
      setTimeout(function tick() {
        i++;
        typed.textContent = text.slice(0, i);
        if (i < text.length) setTimeout(tick, speed);
      }, 700);

      const finish = () => { typed.textContent = text; };
      doc.addEventListener("pointerdown", finish, { once: true });
      doc.addEventListener("keydown", finish, { once: true });
    }
  }

  /* ---------- interactive terminal ---------- */
  initTerminal();

  function initTerminal() {
    const input = doc.getElementById("term-input");
    const output = doc.getElementById("term-output");
    if (!input || !output) return;

    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const print = (html) => {
      const p = doc.createElement("p");
      p.className = "term-out";
      p.innerHTML = html;
      output.appendChild(p);
      output.scrollTop = output.scrollHeight;
    };

    const route = (id) => {
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const el = unlock(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 90);
      }
    };

    const routes = {
      profile: "profile",
      about: "profile",
      experience: "experience",
      jobs: "experience",
      work: "experience",
      projects: "projects",
      skills: "skills",
      stack: "skills",
      education: "education",
      edu: "education",
      study: "education",
      contact: "contact",
      reach: "contact",
      home: "top",
      top: "top",
    };

    const help = () => {
      print('<span class="term-muted">sections are offline — each command boots its section:</span>');
      print('  <span class="term-ok">profile</span>  <span class="term-muted">/ about — who i am</span>');
      print('  <span class="term-ok">experience</span>  <span class="term-muted">/ jobs / work — roles</span>');
      print('  <span class="term-ok">projects</span>  <span class="term-muted">— selected builds</span>');
      print('  <span class="term-ok">skills</span>  <span class="term-muted">/ stack — tooling</span>');
      print('  <span class="term-ok">education</span>  <span class="term-muted">/ edu — studies</span>');
      print('  <span class="term-ok">contact</span>  <span class="term-muted">/ reach — talk to me</span>');
      print('  <span class="term-ok">stack</span>      <span class="term-muted">— print the stack</span>');
      print('  <span class="term-ok">whoami</span>     <span class="term-muted">— identity</span>');
      print('  <span class="term-ok">penta</span>      <span class="term-muted">— studio blurb</span>');
      print('  <span class="term-ok">version</span>    <span class="term-muted">— build info</span>');
      print('  <span class="term-ok">clear</span>      <span class="term-muted">— reset the screen</span>');
    };

    const history = [];
    let histIdx = -1;

    const run = () => {
      const raw = input.value.trim();
      input.value = "";
      if (!raw) return;
      history.push(raw);
      histIdx = -1;
      print('<span class="prompt">$</span>' + escapeHtml(raw));

      const [name, ...args] = raw.toLowerCase().split(/\s+/);
      switch (name) {
        case "help":
        case "?": help(); break;
        case "whoami":
          print('<span class="term-ok">Ahmed Abdelgelel — Backend Engineer · Node.js / TypeScript / Go</span>'); break;
        case "stack":
          print('<span class="term-ok">node.js · typescript · go · express · nestjs · postgresql · redis · rabbitmq · kafka · grpc · azure</span>'); break;
        case "penta":
          print('<span class="term-ok">Penta Studio — digital product studio. Software that ships.</span>'); break;
        case "version":
          print('<span class="term-ok">ahmed@portfolio v2.0 — black phosphor build</span>'); break;
        case "clear":
        case "cls":
          output.innerHTML = ""; break;
        default: {
          const target = routes[name];
          if (target) {
            route(target);
            print('<span class="term-ok">→ booted /' + target + '</span>');
          } else {
            const arg = args.join(" ");
            print('<span class="term-err">command not found: ' + escapeHtml(name) + (arg ? " " + escapeHtml(arg) : "") + '</span>');
            print('<span class="term-muted">try <span class="term-ok">help</span></span>');
          }
        }
      }
      output.scrollTop = output.scrollHeight;
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!history.length) return;
        histIdx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
        input.value = history[histIdx];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx >= 0) {
          histIdx++;
          if (histIdx >= history.length) { histIdx = -1; input.value = ""; }
          else input.value = history[histIdx];
        }
      }
    });

    const card = input.closest(".hero__terminal");
    if (card) {
      card.addEventListener("click", (e) => {
        if (!e.target.closest("a, button, .terminal__input")) input.focus();
      });
    }
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = doc.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- footer year ---------- */
  const year = doc.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ============================================================
     CUSTOM CURSOR — dot, halo, glow light, stardust trail
     ============================================================ */
  initCursor();

  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = doc.createElement("div");
    dot.className = "cur-dot";
    const halo = doc.createElement("div");
    halo.className = "cur-halo";
    const glow = doc.createElement("div");
    glow.className = "cur-glow";
    doc.body.append(glow, halo, dot);
    doc.body.classList.add("has-cur");

    /* stardust pool */
    const pool = [];
    for (let i = 0; i < 36; i++) {
      const p = doc.createElement("i");
      p.className = "cur-spark";
      doc.body.appendChild(p);
      pool.push(p);
    }
    let poolIdx = 0;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let hx = mx, hy = my;
    let gx = mx, gy = my;
    let visible = false;
    let lastSpawn = 0;

    function spawn(x, y) {
      const size = 2 + Math.random() * 4;
      const hues = ["#7affc4", "#5ec8ff", "#eaf6f0", "#8f7bff", "#ffffff"];
      const c = hues[(Math.random() * hues.length) | 0];
      const p = pool[poolIdx];
      poolIdx = (poolIdx + 1) % pool.length;
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.background = c;
      p.style.boxShadow = "0 0 6px " + c;
      p.style.setProperty("--dx", (Math.random() - 0.5) * 56 + "px");
      p.style.setProperty("--dy", (Math.random() - 0.5) * 56 + "px");
      p.classList.remove("go");
      void p.offsetWidth;
      p.classList.add("go");
    }

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.classList.add("on");
        halo.classList.add("on");
        glow.classList.add("on");
      }
      const now = performance.now();
      if (now - lastSpawn > 24) {
        spawn(mx, my);
        lastSpawn = now;
      }
    }, { passive: true });

    window.addEventListener("pointerdown", () => dot.classList.add("press"));
    window.addEventListener("pointerup", () => dot.classList.remove("press"));

    const interactive = "a, button, .project, .tags span, .facts li, .nav__links a, .prose p, .job__points li, .project__points li, .section__title, .job__role, .project__title";
    doc.addEventListener("pointerover", (e) => {
      doc.body.classList.toggle("cur-hover", !!e.target.closest(interactive));
    });

    doc.addEventListener("mouseleave", () => {
      visible = false;
      dot.classList.remove("on");
      halo.classList.remove("on");
      glow.classList.remove("on");
    });
    doc.addEventListener("mouseenter", () => {
      visible = true;
      dot.classList.add("on");
      halo.classList.add("on");
      glow.classList.add("on");
    });

    function loop() {
      hx += (mx - hx) * 0.18;
      hy += (my - hy) * 0.18;
      gx += (mx - gx) * 0.07;
      gy += (my - gy) * 0.07;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      halo.style.transform = "translate(" + hx + "px," + hy + "px) translate(-50%,-50%)";
      glow.style.transform = "translate(" + gx + "px," + gy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    loop();
  }
})();