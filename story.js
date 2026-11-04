"use strict";

const SVGNS = "http://www.w3.org/2000/svg";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function palette() {
  const s = getComputedStyle(document.documentElement);
  const v = (n) => s.getPropertyValue(n).trim();
  return {
    ink: v("--ink"),
    soft: v("--ink-soft"),
    muted: v("--muted"),
    rule: v("--rule"),
    accent: v("--accent"),
    pass: v("--pass"),
    wash: v("--wash"),
  };
}

function el(name, attrs) {
  const node = document.createElementNS(SVGNS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}

function text(svg, x, y, str, o, C) {
  const t = el("text", {
    x, y,
    fill: o.fill || C.ink,
    "font-family": o.mono ? C.mono : C.sans,
    "font-size": o.size || 15,
    "font-weight": o.weight || 400,
    "text-anchor": o.anchor || "start",
  });
  t.textContent = str;
  if (o.opacity != null) t.setAttribute("opacity", o.opacity);
  svg.appendChild(t);
  return t;
}

function arrow(svg, rc, x1, y1, x2, y2, C, o = {}) {
  const color = o.color || C.soft;
  const width = o.width || 1.4;
  svg.appendChild(rc.line(x1, y1, x2, y2, {
    stroke: color, strokeWidth: width, roughness: o.dash ? 0.8 : 1.1, bowing: 0.6,
  }));
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a = 9;
  svg.appendChild(rc.linearPath([
    [x2 - a * Math.cos(ang - 0.42), y2 - a * Math.sin(ang - 0.42)],
    [x2, y2],
    [x2 - a * Math.cos(ang + 0.42), y2 - a * Math.sin(ang + 0.42)],
  ], { stroke: color, strokeWidth: width, roughness: 0.7 }));
}

function box(svg, rc, x, y, w, h, C, o = {}) {
  svg.appendChild(rc.rectangle(x, y, w, h, {
    stroke: o.color || C.ink,
    strokeWidth: o.width || 1.5,
    roughness: o.roughness == null ? 1.15 : o.roughness,
    bowing: 1,
    fill: o.fill || undefined,
    fillStyle: "hachure",
    hachureAngle: 41,
    hachureGap: 7,
    fillWeight: 0.8,
    strokeLineDash: o.dash ? [7, 7] : undefined,
  }));
}

function dot(svg, rc, cx, cy, r, C, color) {
  svg.appendChild(rc.circle(cx, cy, r * 2, {
    stroke: color || C.ink, strokeWidth: 1.5, roughness: 1, fill: "none",
  }));
}

/* ---------------------------------------------------------------- figures */

function drawHero(svg, rc, C) {
  const y = 150;
  dot(svg, rc, 68, y, 26, C);
  text(svg, 68, y + 5, "you", { size: 14, anchor: "middle", fill: C.ink }, C);

  text(svg, 128, y - 34, "one yes", { size: 14, fill: C.muted }, C);
  arrow(svg, rc, 98, y, 222, y, C, { color: C.ink });

  box(svg, rc, 226, y - 44, 150, 88, C);
  text(svg, 301, y - 8, "permission", { size: 15, anchor: "middle" }, C);
  text(svg, 301, y + 14, "signed once", { size: 13, anchor: "middle", fill: C.muted }, C);

  arrow(svg, rc, 380, y, 452, y, C, { color: C.ink });

  const xs = [456, 586, 716];
  xs.forEach((x, i) => {
    box(svg, rc, x, y - 36, 108, 72, C, { color: i === 2 ? C.accent : C.ink });
    text(svg, x + 54, y - 4, "program " + (i + 1), { size: 13, anchor: "middle", fill: i === 2 ? C.accent : C.ink }, C);
    text(svg, x + 54, y + 16, "spends", { size: 12, anchor: "middle", fill: C.muted }, C);
    if (i < 2) arrow(svg, rc, x + 110, y, xs[i + 1] - 2, y, C);
  });

  svg.appendChild(rc.line(68, y + 30, 770, y + 96, {
    stroke: C.accent, strokeWidth: 1.2, roughness: 1.4, strokeLineDash: [6, 8],
  }));
  text(svg, 792, y + 104, "your yes never arrives here", { size: 13, fill: C.accent }, C);

  text(svg, 906, y - 78, "and at the end, a receipt", { size: 13, fill: C.muted }, C);
  arrow(svg, rc, 776, y - 6, 900, y - 40, C, { color: C.rule });
  box(svg, rc, 906, y - 62, 150, 74, C, { color: C.muted, roughness: 1.2 });
  svg.appendChild(rc.line(922, y - 38, 1040, y - 38, { stroke: C.muted, strokeWidth: 1, roughness: 1.2 }));
  svg.appendChild(rc.line(922, y - 22, 1040, y - 22, { stroke: C.muted, strokeWidth: 1, roughness: 1.2 }));
  text(svg, 922, y + 2, "proof it happened", { size: 12, fill: C.muted }, C);

  text(svg, 40, 262, "The queue is where the money is actually spent. Everything below is about controlling it.", { size: 14, fill: C.muted }, C);
}

function drawParts(svg, rc, C) {
  const items = [
    ["1", "the ledger", "who owns what", C.ink],
    ["2", "the movement", "money changes hands", C.ink],
    ["3", "the permission", "you said yes to this", C.ink],
    ["4", "the receipt", "proof it happened", C.accent],
  ];
  const w = 246, gap = 30, y = 96, h = 150;
  items.forEach((it, i) => {
    const x = 16 + i * (w + gap);
    box(svg, rc, x, y, w, h, C, { color: it[3], width: it[3] === C.accent ? 2 : 1.5 });
    text(svg, x + 20, y + 34, it[0], { size: 26, fill: it[3] === C.accent ? C.accent : C.muted, mono: true }, C);
    text(svg, x + 20, y + 76, it[1], { size: 20 }, C);
    text(svg, x + 20, y + 104, it[2], { size: 14, fill: C.muted }, C);
    if (i < 3) arrow(svg, rc, x + w + 4, y + h / 2, x + w + gap - 4, y + h / 2, C);
  });

  text(svg, 16, 300, "Every rail in history is a different answer to two questions:", { size: 15, fill: C.soft }, C);
  text(svg, 16, 330, "who may write to the book, and what counts as proof that you agreed.", { size: 15, fill: C.ink }, C);
  text(svg, 16, 362, "The fourth part is the one software tends to skip.", { size: 14, fill: C.accent }, C);
}

function drawLayers(svg, rc, C) {
  const rows = [
    ["passes the request", "who is asking", C.ink],
    ["records your permission", "what they may do", C.ink],
    ["moves the money", "how value travels", C.ink],
    ["checks identity", "who they really are", C.muted],
  ];
  rows.forEach((r, i) => {
    const y = 40 + i * 96;
    box(svg, rc, 24, y, 470, 76, C, { color: r[2] });
    text(svg, 46, y + 32, r[1], { size: 17 }, C);
    text(svg, 46, y + 55, r[0], { size: 13, fill: C.muted }, C);
  });

  svg.appendChild(rc.line(516, 78, 516, 388, { stroke: C.accent, strokeWidth: 1.6, roughness: 1 }));
  text(svg, 534, 96, "but nobody", { size: 15, fill: C.accent }, C);
  text(svg, 534, 118, "checks delivery", { size: 15, fill: C.accent }, C);
  text(svg, 534, 156, "that is not a bug", { size: 13, fill: C.muted }, C);
  text(svg, 534, 176, "in any one layer.", { size: 13, fill: C.muted }, C);
  text(svg, 534, 196, "it is nobody's job.", { size: 13, fill: C.muted }, C);

  arrow(svg, rc, 24, 412, 494, 412, C, { color: C.rule });
  text(svg, 24, 440, "each layer stops where the next begins", { size: 13, fill: C.muted }, C);
}

function drawLoop(svg, rc, C) {
  const nodes = [
    ["1", "ask", 60, 90],
    ["2", "hear the price", 300, 60],
    ["3", "sign", 640, 60],
    ["4", "checked", 880, 100],
    ["5", "work happens", 700, 260],
    ["6", "money moves", 300, 260],
  ];
  const pos = {};
  nodes.forEach(([n, label, x, y]) => {
    pos[n] = { x, y };
    box(svg, rc, x, y, 200, 84, C, { color: n === "3" ? C.accent : C.ink, width: n === "3" ? 2 : 1.5 });
    text(svg, x + 16, y + 30, n, { size: 14, fill: n === "3" ? C.accent : C.muted, mono: true }, C);
    text(svg, x + 16, y + 58, label, { size: 16 }, C);
  });

  const link = (a, b, o) => {
    const A = pos[a], B = pos[b];
    arrow(svg, rc, A.x + 200, A.y + 42, B.x - 6, B.y + 42, C, o);
  };
  link("1", "2", {});
  link("2", "3", {});
  link("3", "4", { color: C.accent });
  arrow(svg, rc, pos["4"].x + 100, pos["4"].y + 84, pos["5"].x + 100, pos["5"].y - 4, C);
  arrow(svg, rc, pos["5"].x - 4, pos["5"].y + 42, pos["6"].x + 200 + 4, pos["6"].y + 42, C);
  arrow(svg, rc, pos["6"].x + 100, pos["6"].y - 4, pos["1"].x + 100, pos["1"].y + 84 + 4, C);

  text(svg, 60, 390, "step three is an instruction, not a payment. money moves at step six, after the work.", { size: 14, fill: C.soft }, C);
}

function drawGap1(svg, rc, C) {
  dot(svg, rc, 40, 60, 20, C);
  text(svg, 40, 65, "you", { size: 12, anchor: "middle" }, C);
  arrow(svg, rc, 62, 60, 92, 60, C);
  box(svg, rc, 96, 36, 80, 48, C);
  text(svg, 136, 65, "A", { size: 16, anchor: "middle" }, C);
  arrow(svg, rc, 178, 60, 208, 60, C);
  box(svg, rc, 212, 36, 80, 48, C);
  text(svg, 252, 65, "B", { size: 16, anchor: "middle" }, C);
  arrow(svg, rc, 294, 60, 314, 60, C);
  box(svg, rc, 236, 136, 84, 52, C, { color: C.accent, width: 1.8 });
  text(svg, 278, 168, "C", { size: 16, anchor: "middle", fill: C.accent }, C);
  arrow(svg, rc, 252, 86, 272, 132, C, { color: C.accent });
  text(svg, 40, 210, "C only knows B. your yes is three hops away.", { size: 13, fill: C.muted }, C);
  text(svg, 40, 230, "nothing in the message carries it.", { size: 13, fill: C.muted }, C);
}

function drawGap2(svg, rc, C) {
  box(svg, rc, 40, 46, 160, 96, C);
  text(svg, 62, 84, "receipt", { size: 15 }, C);
  text(svg, 62, 110, "paid: 0.03", { size: 13, fill: C.muted }, C);
  text(svg, 62, 130, "delivered", { size: 13, fill: C.muted }, C);

  box(svg, rc, 40, 168, 160, 60, C, { color: C.accent, dash: true });
  text(svg, 62, 205, "the box is empty", { size: 13, fill: C.accent }, C);

  svg.appendChild(rc.line(214, 60, 214, 220, { stroke: C.rule, strokeWidth: 1.2, roughness: 1 }));

  text(svg, 234, 96, "the checkmark", { size: 14 }, C);
  text(svg, 234, 118, "is about money,", { size: 14, fill: C.muted }, C);
  text(svg, 234, 140, "not about the thing", { size: 14, fill: C.muted }, C);
  text(svg, 234, 162, "you bought.", { size: 14, fill: C.muted }, C);
  text(svg, 234, 200, "nobody can reverse it.", { size: 13, fill: C.accent }, C);
}

function drawGap3(svg, rc, C) {
  svg.appendChild(rc.line(36, 30, 36, 200, { stroke: C.rule, strokeWidth: 1.6, roughness: 1 }));
  text(svg, 46, 46, "the door", { size: 13, fill: C.muted }, C);

  box(svg, rc, 52, 96, 92, 62, C);
  text(svg, 70, 122, "a note", { size: 13 }, C);
  text(svg, 70, 142, "push it", { size: 13, fill: C.muted }, C);

  arrow(svg, rc, 148, 126, 196, 126, C, { color: C.accent });

  box(svg, rc, 200, 88, 112, 78, C, { color: C.accent, width: 1.8 });
  text(svg, 216, 118, "assistant", { size: 14 }, C);
  text(svg, 216, 140, "believes it", { size: 13, fill: C.accent }, C);

  arrow(svg, rc, 312, 126, 336, 126, C, { color: C.accent });
  box(svg, rc, 230, 190, 96, 36, C);
  text(svg, 240, 214, "signs", { size: 13 }, C);

  text(svg, 40, 232, "every check passes. the damage happened earlier.", { size: 12.5, fill: C.muted }, C);
}

function drawChart(svg, rc, C) {
  const data = [
    ["agenteconomy", 196],
    ["majormatters", 199],
    ["Chainalysis", 138],
    ["Visa + Artemis", 110],
    ["x402.org", 75],
  ];
  const baseY = 360, left = 70, plotH = 260, max = 220;
  svg.appendChild(rc.line(left - 10, baseY, 1060, baseY, { stroke: C.ink, strokeWidth: 1.4, roughness: 0.8 }));
  svg.appendChild(rc.line(left - 10, baseY - plotH, left - 10, baseY, { stroke: C.rule, strokeWidth: 1.2, roughness: 0.8 }));

  [0, 50, 100, 150, 200].forEach((v) => {
    const y = baseY - (v / max) * plotH;
    svg.appendChild(rc.line(left - 6, y, left, y, { stroke: C.rule, strokeWidth: 1, roughness: 0.6 }));
    text(svg, left - 16, y + 5, String(v), { size: 12, fill: C.muted, anchor: "end", mono: true }, C);
  });
  text(svg, left - 16, baseY - plotH - 24, "millions", { size: 12, fill: C.muted, anchor: "end" }, C);

  const bw = 112, gap = 62;
  data.forEach(([label, v], i) => {
    const x = left + 50 + i * (bw + gap);
    const h = (v / max) * plotH;
    box(svg, rc, x, baseY - h, bw, h, C, { color: C.ink, roughness: 1.4, fill: C.wash });
    text(svg, x + bw / 2, baseY - h - 14, String(v), { size: 15, anchor: "middle", mono: true }, C);
    text(svg, x + bw / 2, baseY + 26, label, { size: 12.5, anchor: "middle", fill: C.muted }, C);
  });

  text(svg, 70, 430, "the same quantity, counted five ways. they disagree by more than twofold.", { size: 14, fill: C.soft }, C);
}

function drawSplit(svg, rc, C) {
  box(svg, rc, 40, 60, 380, 120, C, { roughness: 1 });
  svg.appendChild(rc.line(230, 60, 230, 180, { stroke: C.ink, strokeWidth: 1.6, roughness: 0.9 }));
  text(svg, 56, 96, "real use", { size: 15 }, C);
  text(svg, 56, 118, "paid access to data", { size: 12.5, fill: C.muted }, C);
  text(svg, 248, 96, "made up", { size: 15, fill: C.accent }, C);
  text(svg, 248, 118, "people paying themselves", { size: 12.5, fill: C.muted }, C);
  text(svg, 40, 220, "roughly half, by one independent estimate.", { size: 13, fill: C.muted }, C);
  text(svg, 40, 246, "which is why we do not quote the big numbers.", { size: 13, fill: C.muted }, C);
}

function drawModules(svg, rc, C) {
  const mods = [
    ["M1", "suggests"], ["M2", "checks"], ["M3", "caps"],
    ["M4", "signs"], ["M5", "moves"], ["M6", "holds"],
    ["M7", "inspects"], ["M8", "records"], ["M9", "attacks"],
  ];
  const w = 250, h = 96, gx = 52, gy = 56;
  mods.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * (w + gx);
    const y = 40 + row * (h + gy);
    const key = m[0] === "M2";
    box(svg, rc, x, y, w, h, C, { color: key ? C.accent : C.ink, width: key ? 2.2 : 1.4 });
    text(svg, x + 16, y + 30, m[0], { size: 13, fill: key ? C.accent : C.muted, mono: true }, C);
    text(svg, x + 16, y + 62, m[1], { size: 17, fill: key ? C.accent : C.ink }, C);

    if (col < 2) {
      arrow(svg, rc, x + w + 6, y + h / 2, x + w + gx - 6, y + h / 2, C, { color: C.muted });
    }
  });
}

const DRAW = {
  hero: drawHero,
  parts: drawParts,
  layers: drawLayers,
  loop: drawLoop,
  gap1: drawGap1,
  gap2: drawGap2,
  gap3: drawGap3,
  chart: drawChart,
  split: drawSplit,
  modules: drawModules,
};

/* ---------------------------------------------------------------- runtime */

const drawn = [];

function renderFigure(fig) {
  const id = fig.dataset.draw;
  const svg = fig.querySelector("svg");
  if (!svg || !DRAW[id]) return;
  const C = palette();
  C.serif = "Instrument Serif";
  C.sans = "Plex Sans";
  C.mono = "Plex Mono";

  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.classList.add("draw");
  const rc = rough.svg(svg);
  DRAW[id](svg, rc, C);

  const marks = Array.from(svg.querySelectorAll("path, line, circle, ellipse")).filter(
    (n) => !n.closest("defs")
  );
  marks.forEach((n) => {
    const fill = n.getAttribute("fill");
    if (fill && fill !== "none" && fill !== "transparent") {
      n.dataset.fade = "1";
      n.style.opacity = "0";
    } else {
      n.dataset.dash = "1";
      n.setAttribute("pathLength", "1");
      n.style.strokeDasharray = "1";
      n.style.strokeDashoffset = "1";
    }
  });

  const record = { fig, svg, marks };
  const existing = drawn.findIndex((d) => d.fig === fig);
  if (existing >= 0) drawn[existing] = record;
  else drawn.push(record);
}

function progressFor(fig) {
  const r = fig.getBoundingClientRect();
  const vh = window.innerHeight || 800;
  const start = vh * 0.95;
  const end = vh * 0.32;
  return Math.max(0, Math.min(1, (start - r.top) / (start - end)));
}

function paint(record) {
  const raw = reduced ? 1 : progressFor(record.fig);
  const p = 1 - Math.pow(1 - raw, 3);
  record.marks.forEach((n, i) => {
    const stagger = Math.min(0.45, i * 0.012);
    const local = Math.max(0, Math.min(1, p * 1.4 - stagger));
    if (n.dataset.dash) {
      n.style.strokeDashoffset = String(1 - local);
    } else if (n.dataset.fade) {
      n.style.opacity = String(local);
    }
  });

  if (!reduced) {
    const r = record.fig.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const centre = r.top + r.height / 2;
    const off = Math.max(-1, Math.min(1, (centre - vh / 2) / vh));
    const factor = parseFloat(record.fig.dataset.parallax || "0.1");
    record.svg.style.transform = "translate3d(0," + (off * factor * -140).toFixed(2) + "px,0)";
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    drawn.forEach(paint);
    ticking = false;
  });
}

function applyTheme(next, persist) {
  document.documentElement.setAttribute("data-theme", next);
  const btn = document.getElementById("theme");
  if (btn) {
    const dark = next === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  if (persist) {
    try { localStorage.setItem("kernel-theme", next); } catch (e) { /* private mode */ }
  }
  drawn.length = 0;
  document.querySelectorAll("[data-draw]").forEach(renderFigure);
  requestAnimationFrame(() => drawn.forEach(paint));
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("kernel-theme"); } catch (e) { /* ignore */ }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"), false);

  const btn = document.getElementById("theme");
  if (btn) {
    btn.addEventListener("click", () => {
      const now = document.documentElement.getAttribute("data-theme");
      applyTheme(now === "dark" ? "light" : "dark", true);
    });
  }
}

function boot() {
  initTheme();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  requestAnimationFrame(() => drawn.forEach(paint));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
