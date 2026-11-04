"use strict";

const SVGNS = "http://www.w3.org/2000/svg";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
gsap.registerPlugin(ScrollTrigger);

function palette() {
  const s = getComputedStyle(document.documentElement);
  const v = (n) => s.getPropertyValue(n).trim();
  return { ink: v("--ink"), soft: v("--ink-soft"), muted: v("--muted"), rule: v("--rule"), accent: v("--accent"), pass: v("--pass"), wash: v("--wash") };
}

function el(name, attrs) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

function text(svg, x, y, str, o, C) {
  const t = el("text", {
    x, y,
    fill: o.fill || C.ink,
    "font-family": o.mono ? "Plex Mono" : "Plex Sans",
    "font-size": o.size || 15,
    "font-weight": o.weight || 400,
    "text-anchor": o.anchor || "start",
  });
  t.textContent = str;
  svg.appendChild(t);
  return t;
}

function arrow(svg, rc, x1, y1, x2, y2, C, o = {}) {
  const color = o.color || C.soft;
  const w = o.width || 1.4;
  svg.appendChild(rc.line(x1, y1, x2, y2, { stroke: color, strokeWidth: w, roughness: 1.1, bowing: 0.6 }));
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 9;
  svg.appendChild(rc.linearPath([
    [x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)],
    [x2, y2],
    [x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)],
  ], { stroke: color, strokeWidth: w, roughness: 0.7 }));
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

let C = null;
let rc = null;

function fresh(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.classList.add("draw");
  rc = rough.svg(svg);
  C = palette();
}

function prep(svg) {
  const marks = Array.from(svg.querySelectorAll("path, line, circle, ellipse"));
  marks.forEach((n) => {
    const fill = n.getAttribute("fill");
    if (fill && fill !== "none" && fill !== "transparent") n.dataset.fade = "1";
    else {
      n.dataset.dash = "1";
      n.setAttribute("pathLength", "1");
      n.style.strokeDasharray = "1";
      n.style.strokeDashoffset = "1";
    }
  });
  return marks;
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ------------------------------------------------------------------ hook */

function buildHook(svg) {
  fresh(svg);
  const y = 270;

  const counter = text(svg, 40, 62, "0", { size: 62, fill: C.ink, mono: true }, C);
  text(svg, 40, 92, "payments since midnight", { size: 14, fill: C.muted }, C);

  svg.appendChild(rc.rectangle(60, 150, 150, 78, { stroke: C.ink, strokeWidth: 1.6, roughness: 1.1 }));
  text(svg, 78, 180, "your card", { size: 14 }, C);
  text(svg, 78, 204, "on file", { size: 12, fill: C.muted }, C);
  arrow(svg, rc, 210, 228, 236, 262, C, { color: C.muted });

  const line = rc.line(236, y, 1080, y, { stroke: C.rule, strokeWidth: 1.2, roughness: 1.4 });
  svg.appendChild(line);

  const labels = [];
  const pulses = [];
  for (let i = 0; i < 9; i++) {
    const x = 270 + i * 88;
    svg.appendChild(rc.line(x, y - 14, x, y + 14, { stroke: C.rule, strokeWidth: 1, roughness: 0.8 }));
    labels.push(text(svg, x, y + 42, "0.0" + ((i % 4) + 1), { size: 12, fill: C.muted, mono: true, anchor: "middle" }, C));
    const p = rc.circle(x, y, 16, { stroke: C.muted, strokeWidth: 1.4, roughness: 0.8 });
    p.style.opacity = "0";
    svg.appendChild(p);
    pulses.push(p);
  }

  text(svg, 236, y + 92, "each one small enough to ignore. all of them signed.", { size: 14, fill: C.muted }, C);

  const marks = prep(svg);
  return { marks, pulses, counter, labels };
}

/* ------------------------------------------------------------------ parts */

function buildParts(svg) {
  fresh(svg);
  const items = [
    ["1", "the book", "who owns what"],
    ["2", "the move", "money changes hands"],
    ["3", "the nod", "you said yes to this"],
    ["4", "the receipt", "proof it happened"],
  ];
  const w = 246, gap = 30, y = 70, h = 150;
  const groups = [];
  items.forEach((it, i) => {
    const x = 16 + i * (w + gap);
    const start = svg.childElementCount;
    box(svg, rc, x, y, w, h, C, { color: i === 3 ? C.accent : C.ink, width: i === 3 ? 2 : 1.5 });
    text(svg, x + 20, y + 34, it[0], { size: 26, fill: i === 3 ? C.accent : C.muted, mono: true }, C);
    text(svg, x + 20, y + 76, it[1], { size: 20 }, C);
    text(svg, x + 20, y + 104, it[2], { size: 14, fill: C.muted }, C);
    if (i < 3) arrow(svg, rc, x + w + 4, y + h / 2, x + w + gap - 4, y + h / 2, C);
    groups.push(Array.from(svg.children).slice(start));
  });

  const note = text(svg, 16, 300, "every payment is a different answer to two questions", { size: 15, fill: C.soft }, C);
  const note2 = text(svg, 16, 328, "who may write in the book, and what proves you agreed", { size: 15 }, C);

  const marks = prep(svg);
  return { marks, groups, note, note2 };
}

/* ------------------------------------------------------------------ gaps */

function buildGap1(svg) {
  fresh(svg);
  svg.appendChild(rc.circle(80, 120, 44, { stroke: C.ink, strokeWidth: 1.5, roughness: 1 }));
  text(svg, 80, 126, "you", { size: 13, anchor: "middle" }, C);
  arrow(svg, rc, 104, 120, 132, 120, C);
  box(svg, rc, 136, 96, 62, 48, C);
  text(svg, 167, 126, "A", { size: 15, anchor: "middle" }, C);
  arrow(svg, rc, 200, 120, 228, 120, C);
  box(svg, rc, 232, 96, 62, 48, C);
  text(svg, 263, 126, "B", { size: 15, anchor: "middle" }, C);
  const lost = rc.line(196, 186, 320, 186, { stroke: C.accent, strokeWidth: 1.4, roughness: 1.4, strokeLineDash: [6, 7] });
  svg.appendChild(lost);
  text(svg, 30, 214, "your yes stops travelling here", { size: 13, fill: C.accent }, C);
  return { marks: prep(svg), lost };
}

function buildGap2(svg) {
  fresh(svg);
  box(svg, rc, 40, 34, 160, 96, C);
  text(svg, 58, 68, "receipt", { size: 15 }, C);
  text(svg, 58, 94, "paid 0.03", { size: 13, fill: C.muted }, C);
  text(svg, 58, 116, "delivered", { size: 13, fill: C.muted }, C);
  const empty = rc.rectangle(40, 158, 160, 56, { stroke: C.accent, strokeWidth: 1.6, roughness: 1.2, strokeLineDash: [7, 7] });
  svg.appendChild(empty);
  text(svg, 58, 192, "the box is empty", { size: 13, fill: C.accent }, C);
  svg.appendChild(rc.line(216, 40, 216, 214, { stroke: C.rule, strokeWidth: 1.2, roughness: 1 }));
  text(svg, 232, 78, "the tick is about", { size: 13 }, C);
  text(svg, 232, 98, "money, not about", { size: 13, fill: C.muted }, C);
  text(svg, 232, 118, "your parcel.", { size: 13, fill: C.muted }, C);
  text(svg, 232, 166, "nobody reverses it.", { size: 13, fill: C.accent }, C);
  return { marks: prep(svg), empty };
}

function buildGap3(svg) {
  fresh(svg);
  svg.appendChild(rc.line(40, 30, 40, 200, { stroke: C.rule, strokeWidth: 1.6, roughness: 1 }));
  text(svg, 48, 44, "the door", { size: 13, fill: C.muted }, C);
  const note = rc.rectangle(56, 92, 84, 56, { stroke: C.ink, strokeWidth: 1.4, roughness: 1.2 });
  svg.appendChild(note);
  text(svg, 70, 116, "a note", { size: 13 }, C);
  text(svg, 70, 136, "push it", { size: 12, fill: C.muted }, C);
  arrow(svg, rc, 144, 120, 190, 120, C, { color: C.accent });
  box(svg, rc, 194, 86, 106, 70, C, { color: C.accent, width: 1.8 });
  text(svg, 208, 114, "assistant", { size: 13 }, C);
  text(svg, 208, 134, "believes it", { size: 12, fill: C.accent }, C);
  text(svg, 40, 216, "every rule passes; the damage was earlier", { size: 12.5, fill: C.muted }, C);
  return { marks: prep(svg), note };
}

/* ------------------------------------------------------------------ market */

function buildMarket(svg) {
  fresh(svg);
  const data = [["agenteconomy", 196], ["majormatters", 199], ["Chainalysis", 138], ["Visa + Artemis", 110], ["x402.org", 75]];
  const baseY = 340, left = 70, plotH = 240, max = 220;
  svg.appendChild(rc.line(left - 10, baseY, 1070, baseY, { stroke: C.ink, strokeWidth: 1.4, roughness: 0.8 }));
  [0, 50, 100, 150, 200].forEach((v) => {
    const y = baseY - (v / max) * plotH;
    svg.appendChild(rc.line(left - 6, y, left, y, { stroke: C.rule, strokeWidth: 1, roughness: 0.6 }));
    text(svg, left - 16, y + 5, String(v), { size: 12, fill: C.muted, anchor: "end", mono: true }, C);
  });

  const bars = [];
  const bw = 112, gap = 62;
  data.forEach(([label, v], i) => {
    const x = left + 60 + i * (bw + gap);
    const h = (v / max) * plotH;
    const start = svg.childElementCount;
    box(svg, rc, x, baseY - h, bw, h, C, { color: C.ink, roughness: 1.4, fill: C.wash });
    const num = text(svg, x + bw / 2, baseY - h - 14, String(v), { size: 15, anchor: "middle", mono: true }, C);
    text(svg, x + bw / 2, baseY + 26, label, { size: 12.5, anchor: "middle", fill: C.muted }, C);
    const group = Array.from(svg.children).slice(start);
    group.forEach((n) => {
      n.style.transformOrigin = x + bw / 2 + "px " + baseY + "px";
      if (n.tagName === "text") n.style.opacity = "0";
    });
    bars.push({ group, num });
  });

  prep(svg);
  return { bars, marks: Array.from(svg.querySelectorAll("path, line, circle, ellipse")) };
}

/* ------------------------------------------------------------------ kernel */

function buildKernel(svg) {
  fresh(svg);
  const lanes = [
    { y: 120, ok: true },
    { y: 320, ok: false },
  ];
  const gates = [300, 560, 800];
  const gateNames = ["rules", "key", "inspector"];

  const tokens = [];
  const ticks = [];
  const outs = [];

  lanes.forEach((lane, li) => {
    svg.appendChild(rc.line(60, lane.y, 1060, lane.y, { stroke: C.rule, strokeWidth: 1.2, roughness: 1 }));
    text(svg, 60, lane.y - 58, li === 0 ? "an honest request" : "a request that was talked into it", { size: 14, fill: C.muted }, C);

    box(svg, rc, 60, lane.y - 26, 120, 52, C, { color: li === 0 ? C.ink : C.accent });
    text(svg, 76, lane.y + 5, "assistant", { size: 13, fill: li === 0 ? C.ink : C.accent }, C);

    gates.forEach((gx, gi) => {
      svg.appendChild(rc.line(gx, lane.y - 44, gx, lane.y + 44, { stroke: C.muted, strokeWidth: 1.4, roughness: 0.9 }));
      text(svg, gx, lane.y + 62, gateNames[gi], { size: 12, fill: C.muted, anchor: "middle" }, C);
      const tick = rc.circle(gx, lane.y - 56, 16, { stroke: li === 0 ? C.pass : C.accent, strokeWidth: 1.6, roughness: 1 });
      tick.style.opacity = "0";
      svg.appendChild(tick);
      ticks.push(tick);
    });

    const g = el("g", { transform: "translate(0," + (lane.y - 17) + ")" });
    svg.appendChild(g);
    const tok = rc.rectangle(0, 0, 74, 34, { stroke: C.ink, strokeWidth: 1.6, roughness: 1 });
    g.appendChild(tok);
    const tokLabel = text(g, 37, 22, "buy", { size: 12, fill: C.ink, anchor: "middle" }, C);
    g.style.opacity = "0";
    tokens.push({ g, tok, label: tokLabel, lane });

    const out = text(svg, 930, lane.y + 5, "", { size: 14, fill: li === 0 ? C.pass : C.accent }, C);
    out.style.opacity = "0";
    outs.push(out);
  });

  text(svg, 60, 424, "the rulebook decides, a separate key signs, the money waits for the inspector", { size: 14, fill: C.soft }, C);

  prep(svg);
  return { tokens, ticks, outs, lanes, marks: Array.from(svg.querySelectorAll("path, line, circle, ellipse")) };
}

/* ------------------------------------------------------------------ runtime */

let timelines = [];

function addTl(tl) { timelines.push(tl); return tl; }

function sceneProgressTrigger(scene) {
  return { trigger: scene, start: "top top", end: "bottom bottom", scrub: 0.6 };
}

function buildHookScene(scene) {
  const svg = $("#art-hook");
  const R = buildHook(svg);
  gsap.set(R.pulses, { transformOrigin: "50% 50%" });

  const tl = addTl(gsap.timeline({ scrollTrigger: sceneProgressTrigger(scene) }));
  const counter = { v: 0 };
  tl.fromTo(R.marks.filter((n) => n.dataset.dash), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.02, ease: "none" }, 0);
  tl.to(counter, {
    v: 412, duration: 2, ease: "power1.out",
    onUpdate() { R.counter.textContent = Math.round(counter.v).toLocaleString("en-US"); },
  }, 0.2);
  R.pulses.forEach((p, i) => {
    tl.fromTo(p, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(2)" }, 0.3 + i * 0.14);
    tl.to(p, { opacity: 0, duration: 0.12 }, 0.42 + i * 0.14);
  });
  tl.fromTo(R.labels, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0.4);
}

function buildPartsScene(scene) {
  const svg = $("#art-parts");
  const R = buildParts(svg);
  const tl = addTl(gsap.timeline({ scrollTrigger: sceneProgressTrigger(scene) }));
  tl.fromTo(R.marks.filter((n) => n.dataset.dash), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.015, ease: "none" }, 0);
  tl.fromTo(R.note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7);
  tl.fromTo(R.note2, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.78);
}

function buildLayersScene(scene) {
  const plates = $$("#stack .stack__plate");
  const note = $("#stack-note");
  gsap.set(plates, { transformOrigin: "50% 50%" });
  const tl = addTl(gsap.timeline({ scrollTrigger: sceneProgressTrigger(scene) }));

  plates.forEach((p, i) => {
    gsap.set(p, { y: i * 74, rotateX: 54, z: -i * 40 });
    tl.to(p, { y: i * 96 - 40, rotateX: 8 + i * 3, z: i * 26, duration: 1, ease: "power2.out" }, 0);
  });
  tl.fromTo(note, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.55);
}

function buildGapScene(scene) {
  const builders = { "art-gap1": buildGap1, "art-gap2": buildGap2, "art-gap3": buildGap3 };
  Object.keys(builders).forEach((id) => {
    const svg = document.getElementById(id);
    if (!svg) return;
    const R = builders[id](svg);
    const tl = addTl(gsap.timeline({
      scrollTrigger: { trigger: svg, start: "top 82%", end: "top 40%", scrub: 0.5 },
    }));
    tl.fromTo(R.marks.filter((n) => n.dataset.dash), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.06, ease: "none" }, 0);
  });
}

function buildMarketScene(scene) {
  const svg = $("#art-market");
  const R = buildMarket(svg);
  const tl = addTl(gsap.timeline({
    scrollTrigger: { trigger: svg, start: "top 78%", end: "bottom 55%", scrub: 0.6 },
  }));
  tl.fromTo(R.marks.filter((n) => n.dataset.dash), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.006, ease: "none" }, 0);
  R.bars.forEach((b, i) => {
    tl.fromTo(b.group, { scaleY: 0.02, opacity: 0.4 }, { scaleY: 1, opacity: 1, duration: 1, ease: "power2.out", transformOrigin: "bottom" }, i * 0.12);
    tl.fromTo(b.num, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.2 + i * 0.12);
  });
}

function buildKernelScene(scene) {
  const svg = $("#art-kernel");
  const R = buildKernel(svg);
  const lead = $("#kernel-lead");
  const lines = [
    "A rulebook, a separate key, and an inspector sit between the assistant and your money.",
    "The rulebook reads the request against limits you signed once.",
    "A separate key signs, and it cannot be reached by the assistant.",
    "Escrow holds the money until the inspector checks the parcel.",
    "One outcome settled. The other never left the building.",
  ];

  const tl = addTl(gsap.timeline({ scrollTrigger: sceneProgressTrigger(scene) }));
  tl.fromTo(R.marks.filter((n) => n.dataset.dash), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.008, ease: "none" }, 0);

  R.tokens.forEach((t, li) => {
    gsap.set(t.g, { x: 60 });
    tl.to(t.g, { opacity: 1, duration: 0.2 }, 0.2 + li * 0.1);
  });

  // honest lane: move through three gates, then into escrow, then paid
  const good = R.tokens[0];
  tl.to(good.g, { x: 250, duration: 0.9, ease: "power1.inOut" }, 0.35);
  tl.to(R.ticks[0], { opacity: 1, duration: 0.2 }, 0.9);
  tl.to(good.g, { x: 510, duration: 0.9, ease: "power1.inOut" }, 1.0);
  tl.to(R.ticks[1], { opacity: 1, duration: 0.2 }, 1.55);
  tl.to(good.g, { x: 750, duration: 0.9, ease: "power1.inOut" }, 1.65);
  tl.to(R.ticks[2], { opacity: 1, duration: 0.2 }, 2.2);
  tl.to(good.g, { x: 830, duration: 0.6, ease: "power1.inOut" }, 2.3);
  tl.call(() => { setStroke(good.tok, C.pass); good.label.setAttribute("fill", C.pass); }, null, 2.8);
  tl.fromTo(R.outs[0], { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.85);
  tl.call(() => { R.outs[0].textContent = "paid, receipt kept"; }, null, 2.85);

  // poisoned lane: stopped at the rulebook, shaken, returned
  const bad = R.tokens[1];
  tl.to(bad.g, { x: 250, duration: 0.9, ease: "power1.inOut" }, 0.5);
  tl.to(bad.g, { x: 236, duration: 0.12, repeat: 3, yoyo: true, ease: "none" }, 1.45);
  tl.call(() => { setStroke(bad.tok, C.accent); bad.label.setAttribute("fill", C.accent); }, null, 1.45);
  tl.to(bad.g, { x: 60, duration: 0.8, ease: "power2.inOut" }, 1.95);
  tl.fromTo(R.outs[1], { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.35);
  tl.call(() => { R.outs[1].textContent = "refused, nothing moved"; }, null, 2.35);

  // caption changes
  lines.forEach((line, i) => {
    const at = 0.15 + i * 0.55;
    tl.call(() => { lead.textContent = line; }, null, at);
  });
}

function setStroke(node, color) {
  node.setAttribute("stroke", color);
  node.querySelectorAll("path, line, circle, ellipse").forEach((n) => n.setAttribute("stroke", color));
}

function buildScenes() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  timelines = [];

  if (reduced) {
    const map = { "art-hook": buildHook, "art-parts": buildParts, "art-gap1": buildGap1, "art-gap2": buildGap2, "art-gap3": buildGap3, "art-market": buildMarket, "art-kernel": buildKernel };
    $$(".scene__art, .gap__art").forEach((svg) => {
      const build = map[svg.id];
      if (!build) return;
      const R = build(svg);
      (R.marks || []).forEach((n) => { n.style.strokeDashoffset = "0"; n.style.opacity = "1"; });
      if (R.counter) R.counter.textContent = "412";
      if (R.pulses) R.pulses.forEach((p) => { p.style.opacity = "1"; });
      if (R.labels) R.labels.forEach((l) => { l.style.opacity = "1"; });
      if (R.outs) R.outs.forEach((o) => { o.style.opacity = "1"; });
    });
    $$(".sim__case").forEach(() => {});
    $$(".stack__plate").forEach((p, i) => gsap.set(p, { y: i * 96 - 40, rotateX: 8 + i * 3, z: i * 26 }));
    const note = $("#stack-note");
    if (note) note.style.opacity = "1";
    return;
  }

  buildHookScene($('[data-scene="hook"]'));
  buildPartsScene($('[data-scene="parts"]'));
  buildLayersScene($('[data-scene="layers"]'));
  buildGapScene($('[data-scene="gaps"]'));
  buildMarketScene($('[data-scene="market"]'));
  buildKernelScene($('[data-scene="kernel"]'));

  $$("[data-scene='demo'] .step").forEach((s, i) => {
    gsap.fromTo(s, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.08,
      scrollTrigger: { trigger: s, start: "top 88%" },
    });
  });
}

function applyTheme(next, persist) {
  document.documentElement.setAttribute("data-theme", next);
  const btn = $("#theme");
  if (btn) {
    const dark = next === "dark";
    btn.setAttribute("aria-pressed", String(dark));
  }
  if (persist) { try { localStorage.setItem("kernel-theme", next); } catch (e) { /* ignore */ } }
  buildScenes();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("kernel-theme"); } catch (e) { /* ignore */ }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  const dark = (saved || (prefersDark ? "dark" : "light")) === "dark";
  const btn = $("#theme");
  if (btn) {
    btn.setAttribute("aria-pressed", String(dark));
    btn.addEventListener("click", () => {
      const now = document.documentElement.getAttribute("data-theme");
      applyTheme(now === "dark" ? "light" : "dark", true);
    });
  }
}

/* ------------------------------------------------------------------ inline demo */

const SIM_RULES = [
  "Under the per-payment limit?",
  "Is the shop on your list?",
  "Is this request new?",
  "Is it the thing you asked for?",
  "Is there money left this session?",
  "Not too many requests?",
];

const SIM = [
  {
    ask: [["Amount", "$0.004"], ["Shop", "weather api"], ["What it buys", "today's forecast"]],
    rules: [
      [true, "4 tenths of a cent, under $0.05"],
      [true, "approved last month"],
      [true, "first time seen"],
      [true, "you asked for a forecast"],
      [true, "$0.002 of $0.04 used"],
      [true, "2 of 12 today"],
    ],
    state: "approve",
    verdict: "Paid. The forecast arrives, and the receipt is kept.",
  },
  {
    ask: [["Amount", "$0.120"], ["Shop", "weather api"], ["What it buys", "a premium plan"]],
    rules: [
      [false, "12 cents is over the 5 cent limit"],
      [true, "approved last month"],
      [true, "first time seen"],
      [true, "a forecast, as asked"],
      [true, "enough left in the session"],
      [true, "2 of 12 today"],
    ],
    state: "refuse",
    verdict: "Refused. It tried to buy more than the limit allows.",
  },
  {
    ask: [["Amount", "$0.010"], ["Shop", "cheap-mirror.example"], ["What it buys", "the same forecast"]],
    rules: [
      [true, "1 cent, under the limit"],
      [false, "nobody ever approved this shop"],
      [true, "first time seen"],
      [true, "the same forecast, cheaper"],
      [true, "enough left in the session"],
      [true, "2 of 12 today"],
    ],
    state: "refuse",
    verdict: "Refused. A cheaper shop is still an unapproved shop.",
  },
  {
    ask: [["Amount", "$0.020"], ["Shop", "data api"], ["What it buys", "export the customer list"]],
    rules: [
      [true, "2 cents, under the limit"],
      [true, "approved shop"],
      [true, "first time seen"],
      [false, "you asked for a forecast, not a list"],
      [true, "enough left in the session"],
      [true, "2 of 12 today"],
    ],
    state: "refuse",
    verdict: "Refused. Every other answer was fine. The wrong thing was being bought.",
  },
  {
    ask: [["Amount", "$0.004"], ["Shop", "weather api"], ["What it buys", "the 2:03 am request, again"]],
    rules: [
      [true, "under the limit"],
      [true, "approved shop"],
      [false, "this exact request was spent at 2:03 am"],
      [true, "the right forecast"],
      [true, "enough left in the session"],
      [true, "3 of 12 today"],
    ],
    state: "refuse",
    verdict: "Refused. A captured request cannot be spent twice.",
  },
];

const MARK_PASS = '<svg class="mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';
const MARK_FAIL = '<svg class="mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

function renderSim(index) {
  const c = SIM[index];
  const ask = document.getElementById("sim-ask");
  const rules = document.getElementById("sim-rules");
  const verdict = document.getElementById("sim-verdict");
  const note = document.getElementById("sim-note");
  if (!ask || !rules) return;

  ask.innerHTML = c.ask
    .map(([k, v]) => '<div class="sim__row"><dt>' + k + "</dt><dd>" + v + "</dd></div>")
    .join("");

  rules.innerHTML = SIM_RULES.map((label, i) => {
    const [ok, why] = c.rules[i];
    return (
      '<li class="sim__rule ' + (ok ? "is-pass" : "is-fail") + '">' +
      (ok ? MARK_PASS : MARK_FAIL) +
      "<span>" + label + '<span class="sr-only"> ' + (ok ? "passes" : "fails") + "</span></span>" +
      '<span class="why">' + why + "</span>" +
      "</li>"
    );
  }).join("");

  verdict.dataset.state = "idle";
  verdict.textContent = "Checking…";

  const items = Array.from(rules.querySelectorAll(".sim__rule"));
  if (reduced) {
    items.forEach((li) => { li.style.opacity = "1"; });
    verdict.dataset.state = c.state;
    verdict.textContent = c.verdict;
    note.textContent = c.state === "approve"
      ? "Nothing left the account until every line passed."
      : "One failed line was enough. Nothing was bought.";
    return;
  }

  if (timelines.sim) timelines.sim.kill();
  const tl = gsap.timeline();
  timelines.sim = tl;
  items.forEach((li, i) => {
    tl.to(li, { opacity: 1, duration: 0.22, ease: "power2.out" }, i * 0.14);
  });
  tl.call(() => {
    verdict.dataset.state = c.state;
    verdict.textContent = c.verdict;
    note.textContent = c.state === "approve"
      ? "Nothing left the account until every line passed."
      : "One failed line was enough. Nothing was bought.";
    gsap.fromTo(verdict, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  });
}

function initSim() {
  const cases = $$(".sim__case");
  if (!cases.length) return;
  cases.forEach((btn) => {
    btn.addEventListener("click", () => {
      cases.forEach((b) => {
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
      renderSim(Number(btn.dataset.case));
    });
    btn.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      ev.preventDefault();
      const i = cases.indexOf(btn);
      const next = cases[(i + (ev.key === "ArrowRight" ? 1 : cases.length - 1)) % cases.length];
      next.focus();
      next.click();
    });
  });
  renderSim(0);
}

function boot() {
  initTheme();
  buildScenes();
  initSim();
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
