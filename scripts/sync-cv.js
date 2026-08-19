/* sync-cv.js — automated CV sync for the glgl terminal.

   Reads the NEWEST pdf in assets/cv/, extracts its text with pdfjs-dist
   (the only dependency), sectionizes it into the CV shape the terminal
   renders, and writes assets/cv/cv-data.js.

   Automated: runs on every vercel deploy ("buildCommand") and locally via
     npm install          (first time only — pulls pdfjs-dist)
     node scripts/sync-cv.js
   Replacing assets/cv/*.pdf with a new résumé is enough — the next deploy
   rebuilds cv-data.js and every CV section (cv / experience / projects /
   stack / cat *.txt) picks the new content up automatically. */
"use strict";
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "..");
const CV_DIR = path.join(ROOT, "assets", "cv");

(async function main() {
  const pdfjs = await import(
    pathToFileURL(path.join(ROOT, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.mjs")).href
  );

  /* ---------- 1 · pick the freshest pdf ---------- */
  const pdfs = fs.readdirSync(CV_DIR)
    .filter(function (f) { return /\.pdf$/i.test(f); })
    .map(function (f) {
      const st = fs.statSync(path.join(CV_DIR, f));
      return { name: f, mtime: st.mtimeMs, size: st.size };
    })
    .sort(function (a, b) { return b.mtime - a.mtime; });

  if (!pdfs.length) {
    console.error("sync-cv: no pdf found in assets/cv/");
    process.exit(1);
  }
  const PDF = pdfs[0];

  /* ---------- 2 · extract text (pdfjs — handles CID/ToUnicode fonts) ---------- */
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(fs.readFileSync(path.join(CV_DIR, PDF.name))),
    disableFontFace: true,
    standardFontDataUrl: "file:///nonexistent-standard-fonts/",
  }).promise;

  const lines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    /* pdfjs emits items in reading order; break lines on baseline jumps */
    let lastY = null;
    let cur = [];
    tc.items.forEach(function (it) {
      if (!it.str) return;
      const y = Math.round(it.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 2 && cur.length) {
        lines.push(cur.join(" "));
        cur = [];
      }
      lastY = y;
      cur.push(it.str);
    });
    if (cur.length) lines.push(cur.join(" "));
  }
  try { await doc.destroy(); } catch (e) { /* ignore */ }

  /* ---------- 3 · cleanup ---------- */
  const clean = function (s) {
    return s
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:])/g, "$1")
      .replace(/\s+([)\]'])($)/g, "$1")
      .trim();
  };

  /* ---------- 4 · sectionize ---------- */
  const HEADERS = /^(profile|summary|objective|experience|projects|skills|education|contact|certifications?|languages|references|awards|activities|interests|honors)$/i;
  const MONTHS = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+\\d{4}";
  const DATERANGE = new RegExp(MONTHS + "\\s*[–—-]\\s*(present|today|now|" + MONTHS + ")", "i");

  function sectionize(raw) {
    const ls = raw.map(clean).filter(Boolean);

    /* merge wrapped lines into their head line (unless headers/entries) */
    const merged = [];
    ls.forEach(function (l) {
      const isHeader = HEADERS.test(l);
      const isEntry = /\|/.test(l) || DATERANGE.test(l);
      const prev = merged[merged.length - 1];
      if (prev && !isHeader && !isEntry && !HEADERS.test(prev) &&
          !/^[•·]/.test(l) && !/^[•·]/.test(prev) && !/[.!?:]$/.test(prev) &&
          !/^[A-Za-z][A-Za-z /]{0,30}:\s/.test(l)) {
        merged[merged.length - 1] = prev + " " + l;
      } else merged.push(l);
    });

    /* section boundaries */
    const starts = {};
    merged.forEach(function (l, i) {
      const h = l.match(HEADERS);
      if (h) starts[h[1].toLowerCase()] = i;
    });
    const order = Object.keys(starts).sort(function (a, b) { return starts[a] - starts[b]; });
    const endOf = function (name) {
      const i = order.indexOf(name);
      return i < 0 ? merged.length : (order[i + 1] ? starts[order[i + 1]] : merged.length);
    };
    const sec = function (name) {
      if (starts[name] === undefined) return [];
      return merged.slice(starts[name] + 1, endOf(name));
    };

    /* header block */
    const header = merged.slice(0, starts.profile === undefined ? merged.length : starts.profile);
    const name = header[0] || "Ahmed Mohammed Abdelgelel";
    const role = (header.find(function (l) { return /@|—|–|-|\|/.test(l) && !/@gmail|@hotmail|@outlook/.test(l); }) || "").replace(/\s*\|\s*/g, " · ");
    const contactRow = header.find(function (l) { return /@|\+?\d{2,}|egypt/i.test(l) && /\|/.test(l); }) || "";
    const location = (contactRow.match(/([A-Za-z ,]+?Egypt)/) || [])[1] || "Cairo, Egypt";

    /* profile */
    const summary = sec("profile").join(" ") || sec("summary").join(" ");

    /* experience */
    const experience = [];
    let cur = null;
    sec("experience").forEach(function (l) {
      if (/^[•·]/.test(l)) {
        if (cur) cur.bullets.push(clean(l.slice(1)));
        return;
      }
      if (DATERANGE.test(l)) {                   /* the dates row of the open entry */
        if (cur && !cur.dates) cur.dates = l;
        return;
      }
      if (cur && cur.bullets.length && !/\|/.test(l) && !/^[A-Z0-9(]/.test(l)) {   /* wrapped bullet line */
        cur.bullets[cur.bullets.length - 1] += " " + clean(l);
        return;
      }
      cur = { role: l, dates: "", bullets: [] }; /* new entry header (has a | or a bare title) */
      experience.push(cur);
    });
    experience.forEach(function (e) {
      const els = e.role.split("|").map(clean);
      if (els.length > 1) {
        const strip = function (t) { return clean(t.replace(/[–—-]\s*(remote|hybrid|on-?site|in-?person).*$/i, "")); };
        e.role = strip(els[0]) + " — " + strip(els[1]);
      }
      e.bullets = e.bullets.filter(Boolean);
    });

    /* projects */
    const projects = [];
    let pc = null;
    sec("projects").forEach(function (l) {
      if (/^[•·]/.test(l)) {
        if (pc) pc.lines.push(clean(l.slice(1)));
        return;
      }
      if (pc && pc.lines.length && !/^[A-Z][A-Za-z]/.test(l)) {   /* wrapped bullet line */
        pc.lines[pc.lines.length - 1] += " " + clean(l);
        return;
      }
      pc = { name: l, url: "", lines: [] };
      projects.push(pc);
    });
    const REPOS = {
      "Smart Cache Engine": "https://github.com/AhmedAbdelgelel/Cache-engine",
      "EPUB-to-PDF Converter": "https://github.com/Mo7ammedd/epub-to-pdf",
    };
    projects.forEach(function (p) {
      p.name = clean(p.name.split(/\s+[–—-]\s+/)[0]);
      p.url = REPOS[p.name] || "";
      p.lines = p.lines.filter(Boolean);
    });

    /* skills */
    const skills = [];
    sec("skills").forEach(function (l) {
      const m = l.match(/^([^:]{2,28}):\s*(.*)$/);
      if (m) skills.push([m[1].toLowerCase().replace(/\s*\/\s*/g, "/"), clean(m[2])]);
    });

    /* education */
    const education = sec("education").join(" · ");

    return {
      meta: {
        source: PDF.name,
        updated: new Date(PDF.mtime).toISOString().slice(0, 10),
        bytes: PDF.size,
        pages: doc.numPages,
      },
      name: name,
      role: role,
      location: location,
      summary: summary,
      experience: experience,
      projects: projects,
      skills: skills,
      education: education || "B.Sc. Computer Science — Mansoura University, 2025",
    };
  }

  /* ---------- 5 · write assets/cv/cv-data.js ---------- */
  const data = sectionize(lines);
  const outFile = path.join(CV_DIR, "cv-data.js");
  const out =
    "/* auto-generated by scripts/sync-cv.js from " + PDF.name + " (updated " + data.meta.updated + ") —\n" +
    "   do not hand-edit. drop a new pdf into assets/cv/ and deploy (or run\n" +
    "   node scripts/sync-cv.js) — this file rebuilds automatically. */\n" +
    "window.CV_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  fs.writeFileSync(outFile, out);

  console.log("sync-cv: " + PDF.name + " (" + PDF.size + " bytes, updated " + data.meta.updated + ", " + doc.numPages + " pages)");
  console.log("  name       " + data.name);
  console.log("  role       " + data.role);
  console.log("  location   " + data.location);
  console.log("  summary    " + data.summary.length + " chars");
  console.log("  experience " + data.experience.length + " → " + data.experience.map(function (e) { return '"' + e.role + '" [' + e.bullets.length + "]"; }).join(" · "));
  console.log("  projects   " + data.projects.length + " → " + data.projects.map(function (p) { return '"' + p.name + '" [' + p.lines.length + "]"; }).join(" · "));
  console.log("  skills     " + data.skills.length + " → " + data.skills.map(function (s) { return s[0] + "(" + s[1].split(",").length + ")"; }).join(", "));
  console.log("  education  " + data.education);
  console.log("wrote " + path.relative(ROOT, outFile));
})().catch(function (e) {
  console.error("sync-cv failed:", e && e.message || e);
  process.exit(1);
});