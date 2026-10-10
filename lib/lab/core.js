// Motor interactivo · core. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { PROG } from './shared';
/* =====================================================================
   NÚCLEO: utilidades, colores, generador de precios y motor de gráficos
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, attrs) {
  const t = el('text', Object.assign({ x, y, fill: COL.text, 'font-size': 11 }, attrs || {}), parent);
  t.textContent = s;
  return t;
}
const COL = {};
function refreshColors() {
  const cs = getComputedStyle(document.documentElement);
  ['up', 'down', 'range', 'ob', 'liq', 'fvg', 'rsi', 'div', 'entry', 'mid'].forEach(k => COL[k] = cs.getPropertyValue('--c-' + k).trim());
  ['text', 'text-2', 'muted', 'grid', 'axis', 'surface', 'surface-2', 'surface-3', 'accent', 'strong'].forEach(k => COL[k.replace('-', '')] = cs.getPropertyValue('--' + k).trim());
}
refreshColors();
const isHollow = () => document.body.classList.contains('hollow');

/* ---------- aleatoriedad reproducible ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
let seedCounter = 7;
const newSeed = () => (seedCounter = (seedCounter * 9301 + 49297) % 233280) + Math.floor(Math.random() * 1e6);

/* Camino de precio que pasa EXACTAMENTE por los puntos de paso (puente browniano).
   wps: [{t: subpaso, p: precio, n: ruido opcional del tramo}] */
function bridgePath(wps, rand, noise) {
  const out = [wps[0].p];
  for (let w = 0; w < wps.length - 1; w++) {
    const a = wps[w], b = wps[w + 1], m = b.t - a.t;
    if (m <= 0) continue;
    const sd = a.n != null ? a.n : noise;
    const walk = [0];
    for (let k = 1; k <= m; k++) walk.push(walk[k - 1] + gauss(rand) * sd);
    for (let k = 1; k <= m; k++) { const f = k / m; out.push(a.p + (b.p - a.p) * f + walk[k] - f * walk[m]); }
  }
  return out;
}
/* Vela a partir de un tramo del camino [a..b] (incluye ambos extremos) */
function candleOf(path, a, b) {
  let h = -Infinity, l = Infinity;
  for (let k = a; k <= b; k++) { const v = path[k]; if (v > h) h = v; if (v < l) l = v; }
  return { o: path[a], h, l, c: path[b] };
}
function candlesFromPath(path, per) {
  const n = Math.floor((path.length - 1) / per), out = [];
  for (let j = 0; j < n; j++) out.push(candleOf(path, j * per, (j + 1) * per));
  return out;
}
function aggregate(cs, k) {
  const out = [];
  for (let i = 0; i < cs.length; i += k) {
    const g = cs.slice(i, i + k);
    out.push({ o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map(x => x.h)), l: Math.min(...g.map(x => x.l)), from: i, to: i + g.length - 1 });
  }
  return out;
}
function extent(cs, extra) {
  let lo = Infinity, hi = -Infinity;
  cs.forEach(c => { if (!c) return; lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); });
  (extra || []).forEach(v => { if (v == null || isNaN(v)) return; lo = Math.min(lo, v); hi = Math.max(hi, v); });
  const pad = (hi - lo) * 0.08 || 1;
  return [lo - pad, hi + pad];
}

/* ---------- RSI de Wilder (compartido) ---------- */
function rsiCalc(closes, n) {
  const L = closes.length, rsi = Array(L).fill(null), ag = Array(L).fill(null), al = Array(L).fill(null),
    ch = Array(L).fill(null), g = Array(L).fill(null), lo = Array(L).fill(null);
  let sg = 0, sl = 0, a = 0, b = 0;
  for (let i = 1; i < L; i++) {
    const c = closes[i] - closes[i - 1];
    ch[i] = c; g[i] = c > 0 ? c : 0; lo[i] = c < 0 ? -c : 0;
    if (i <= n) { sg += g[i]; sl += lo[i]; if (i === n) { a = sg / n; b = sl / n; } }
    else { a = (a * (n - 1) + g[i]) / n; b = (b * (n - 1) + lo[i]) / n; }
    if (i >= n) { ag[i] = a; al[i] = b; rsi[i] = b === 0 ? (a === 0 ? 50 : 100) : 100 - 100 / (1 + a / b); }
  }
  return { rsi, ag, al, ch, g, lo };
}
function pivots(vals, type, left, right, from, to) {
  const out = [];
  for (let i = Math.max(from || 0, left); i <= Math.min(to == null ? vals.length - 1 : to, vals.length - 1 - right); i++) {
    const v = vals[i]; if (v == null) continue;
    let ok = true;
    for (let k = i - left; k <= i + right && ok; k++) {
      if (k === i || vals[k] == null) continue;
      if (type === 'high' ? vals[k] > v : vals[k] < v) ok = false;
    }
    if (ok) out.push(i);
  }
  return out;
}
function argExt(arr, a, b, type) {
  let best = a;
  for (let i = a; i <= b; i++) if (type === 'max' ? arr[i] > arr[best] : arr[i] < arr[best]) best = i;
  return best;
}

/* ---------- motor de gráficos SVG ---------- */
function niceStep(range, count) {
  const raw = range / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), nrm = raw / mag;
  return (nrm < 1.5 ? 1 : nrm < 3 ? 2 : nrm < 7 ? 5 : 10) * mag;
}
/* Crea un gráfico con uno o varios paneles que comparten el eje X */
function chart(host, o) {
  const w = o.w || 900, padL = o.padL != null ? o.padL : 10, padR = o.padR != null ? o.padR : 70,
    padT = o.padT != null ? o.padT : 12, padB = o.padB != null ? o.padB : 12, gap = o.gap || 16;
  const panelsCfg = o.panels;
  const h = padT + padB + panelsCfg.reduce((s, p) => s + p.h, 0) + gap * (panelsCfg.length - 1);
  host.querySelectorAll('svg').forEach(s => s.remove());
  let tip = host.querySelector('.tip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; host.appendChild(tip); }
  tip.style.display = 'none';
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': o.aria || 'Gráfico', class: w >= 700 ? 'wide' : null });
  host.insertBefore(svg, tip);
  const n = o.n, iw = w - padL - padR, step = iw / n;
  const C = { svg, w, h, n, padL, padR, padT, padB, step, iw, host, tip, bw: Math.max(1.5, Math.min(22, step * 0.62)) };
  C.x = i => padL + step * (i + 0.5);
  C.bg = el('g', {}, svg);
  let top = padT;
  C.panels = panelsCfg.map(pc => {
    const P = { top, h: pc.h, bottom: top + pc.h, yMin: pc.yMin, yMax: pc.yMax };
    P.y = v => P.top + (P.yMax - v) / (P.yMax - P.yMin) * P.h;
    P.g = {};
    ['grid', 'zone', 'data', 'ann', 'lab'].forEach(k => P.g[k] = el('g', {}, svg));
    el('rect', { x: padL, y: P.top, width: iw, height: P.h, fill: 'none', stroke: COL.axis, 'stroke-width': 1 }, P.g.grid);
    if (pc.grid !== false) {
      const st = pc.step || niceStep(P.yMax - P.yMin, pc.ticks || 5), dec = pc.dec != null ? pc.dec : 2;
      for (let k = Math.ceil(P.yMin / st); k * st <= P.yMax + 1e-9; k++) {
        const v = k * st, yy = P.y(v);
        if (yy < P.top + 2 || yy > P.bottom - 2) continue;
        el('line', { x1: padL, x2: padL + iw, y1: yy, y2: yy, stroke: COL.grid, 'stroke-width': 1 }, P.g.grid);
        txt(P.g.grid, padL + iw + 6, yy + 4, pc.fmt ? pc.fmt(v) : v.toFixed(dec), { fill: COL.muted, 'font-size': 10.5, 'font-family': 'Consolas, monospace' });
      }
    }
    if (pc.title) txt(P.g.lab, padL + 6, P.top + 14, pc.title, { fill: COL.muted, 'font-size': 11, 'font-weight': 600 });
    top += pc.h + gap;
    return P;
  });
  C.hoverG = el('g', {}, svg);
  return C;
}
function drawCandles(C, P, cs, opt) {
  opt = opt || {};
  const off = opt.offset || 0, hollow = isHollow();
  cs.forEach((d, j) => {
    if (!d) return;
    const i = j + off, up = d.c >= d.o, col = up ? COL.up : COL.down, cx = C.x(i);
    const dim = opt.dim && opt.dim(i);
    const g = el('g', { opacity: dim ? 0.28 : 1 }, P.g.data);
    el('line', { x1: cx, x2: cx, y1: P.y(d.h), y2: P.y(d.l), stroke: col, 'stroke-width': Math.max(1, Math.min(1.6, C.step * 0.12)) }, g);
    const t = P.y(Math.max(d.o, d.c)), b = P.y(Math.min(d.o, d.c));
    const bw = opt.bw || C.bw;
    el('rect', { x: cx - bw / 2, y: t, width: bw, height: Math.max(1.2, b - t), rx: 1,
      fill: hollow && up ? COL.surface : col, stroke: col, 'stroke-width': hollow && up ? 1.4 : 0.6 }, g);
  });
}
function lineSeries(C, P, vals, opt) {
  opt = opt || {};
  let d = '', pen = false;
  vals.forEach((v, i) => {
    if (v == null || (opt.upTo != null && i > opt.upTo)) { pen = false; return; }
    d += (pen ? 'L' : 'M') + C.x(i).toFixed(1) + ' ' + P.y(v).toFixed(1) + ' ';
    pen = true;
  });
  return el('path', { d, fill: 'none', stroke: opt.color || COL.rsi, 'stroke-width': opt.width || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, P.g.data);
}
/* Etiqueta tipo "píldora": texto en tinta neutra, borde del color de la marca */
function tag(layer, x, y, s, color, anchor) {
  const w = s.length * 6.3 + 12, h = 17;
  let x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  const g = el('g', {}, layer);
  el('rect', { x: x0, y: y - h / 2, width: w, height: h, rx: 4, fill: COL.surface2, stroke: color || COL.axis, 'stroke-width': 1.2 }, g);
  txt(g, x0 + 6, y + 4, s, { fill: COL.text, 'font-size': 10.5, 'font-weight': 600 });
  return g;
}
function hline(C, P, v, o) {
  o = o || {};
  const x1 = o.x1 != null ? C.x(o.x1) - C.step / 2 : C.padL, x2 = o.x2 != null ? C.x(o.x2) + C.step / 2 : C.padL + C.iw;
  const yy = P.y(v);
  el('line', { x1, x2, y1: yy, y2: yy, stroke: o.color || COL.muted, 'stroke-width': o.width || 1.5, 'stroke-dasharray': o.dash === false ? null : (o.dash || '6 4') }, P.g.ann);
  if (o.label) {
    if (o.side === 'left') tag(P.g.lab, x1 + 4, yy - (o.below ? -11 : 11), o.label, o.color, 'start');
    else if (o.side === 'axis') tag(P.g.lab, C.padL + C.iw + 2, yy, o.label, o.color, 'start');
    else tag(P.g.lab, x2 - 4, yy - (o.below ? -11 : 11), o.label, o.color, 'end');
  }
}
function zone(C, P, v1, v2, o) {
  o = o || {};
  const x1 = o.x1 != null ? C.x(o.x1) - C.step / 2 : C.padL, x2 = o.x2 != null ? C.x(o.x2) + C.step / 2 : C.padL + C.iw;
  const a = P.y(Math.max(v1, v2)), b = P.y(Math.min(v1, v2));
  el('rect', { x: x1, y: a, width: Math.max(1, x2 - x1), height: Math.max(1, b - a), fill: o.color || COL.fvg, 'fill-opacity': o.op != null ? o.op : 0.16,
    stroke: o.stroke === false ? 'none' : (o.color || COL.fvg), 'stroke-opacity': 0.7, 'stroke-width': 1 }, P.g.zone);
  if (o.label) tag(P.g.lab, o.labelX != null ? o.labelX : x1 + 4, o.labelBelow ? b + 11 : a - 11, o.label, o.color, 'start');
}
function seg(C, P, i1, v1, i2, v2, o) {
  o = o || {};
  return el('line', { x1: C.x(i1), y1: P.y(v1), x2: C.x(i2), y2: P.y(v2), stroke: o.color || COL.div, 'stroke-width': o.width || 2,
    'stroke-dasharray': o.dash || null, 'stroke-linecap': 'round' }, o.layer || P.g.ann);
}
function marker(C, P, i, v, o) {
  o = o || {};
  const x = C.x(i), y = P.y(v), s = o.size || 6, c = o.color || COL.text, L = P.g.ann;
  if (o.shape === 'up') el('path', { d: `M${x} ${y - s} L${x + s} ${y + s} L${x - s} ${y + s} Z`, fill: c, stroke: COL.surface, 'stroke-width': 2 }, L);
  else if (o.shape === 'down') el('path', { d: `M${x} ${y + s} L${x + s} ${y - s} L${x - s} ${y - s} Z`, fill: c, stroke: COL.surface, 'stroke-width': 2 }, L);
  else el('circle', { cx: x, cy: y, r: s * 0.75, fill: c, stroke: COL.surface, 'stroke-width': 2 }, L);
  if (o.label) tag(P.g.lab, x + (o.dx || 0), y + (o.dy != null ? o.dy : -16), o.label, c, o.anchor || 'middle');
}
function vband(C, i1, i2, o) {
  o = o || {};
  const x1 = C.x(i1) - C.step / 2, x2 = C.x(i2) + C.step / 2;
  el('rect', { x: x1, y: C.padT, width: x2 - x1, height: C.h - C.padT - C.padB, fill: o.color || COL.strong, 'fill-opacity': o.op != null ? o.op : 0.04 }, C.bg);
  if (o.label) txt(C.bg, (x1 + x2) / 2, C.h - 2, o.label, { fill: COL.muted, 'font-size': 10.5, 'text-anchor': 'middle' });
}
function vline(C, i, o) {
  o = o || {};
  const x = C.x(i) + (o.dx || 0);
  el('line', { x1: x, x2: x, y1: C.padT, y2: C.h - C.padB, stroke: o.color || COL.axis, 'stroke-width': 1, 'stroke-dasharray': o.dash || '3 4' }, C.bg);
}
/* Cruz + tooltip. rows(i) devuelve [[etiqueta, valor], ...] o null */
function hover(C, rows) {
  const cap = el('rect', { x: C.padL, y: C.padT, width: C.iw, height: C.h - C.padT - C.padB, fill: 'transparent' }, C.hoverG);
  const vl = el('line', { y1: C.padT, y2: C.h - C.padB, x1: -20, x2: -20, stroke: COL.text2, 'stroke-width': 1, 'stroke-opacity': 0.45, 'pointer-events': 'none' }, C.hoverG);
  const tip = C.tip;
  function move(e) {
    const r = C.svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (C.w / r.width);
    const i = clamp(Math.floor((sx - C.padL) / C.step), 0, C.n - 1);
    const data = rows(i);
    if (!data) { tip.style.display = 'none'; return; }
    vl.setAttribute('x1', C.x(i)); vl.setAttribute('x2', C.x(i));
    tip.innerHTML = data.map(([k, v]) => k === '#' ? `<div style="color:var(--strong);font-weight:700;margin-bottom:2px">${v}</div>` : `<div class="row"><b>${v}</b><span class="k">${k}</span></div>`).join('');
    tip.style.display = 'block';
    const hr = C.host.getBoundingClientRect();
    let left = e.clientX - hr.left + 14, topp = e.clientY - hr.top + 12;
    if (left + tip.offsetWidth > hr.width - 4) left = e.clientX - hr.left - tip.offsetWidth - 14;
    if (topp + tip.offsetHeight > hr.height) topp = Math.max(0, hr.height - tip.offsetHeight - 4);
    tip.style.left = (Math.max(0, left) + C.host.scrollLeft) + 'px'; tip.style.top = topp + 'px';
  }
  cap.addEventListener('pointermove', move);
  cap.addEventListener('pointerdown', move);
  cap.addEventListener('pointerleave', () => { tip.style.display = 'none'; vl.setAttribute('x1', -20); vl.setAttribute('x2', -20); });
}
const ohlcRows = (c, dec) => c ? [['Apertura', c.o.toFixed(dec)], ['Máximo', c.h.toFixed(dec)], ['Mínimo', c.l.toFixed(dec)], ['Cierre', c.c.toFixed(dec)]] : [];

/* Tabla de datos accesible (el "gemelo" de cada gráfico) */
function dataTable(details, cols, rows, hlIndex) {
  if (!details) return;
  let wrap = details.querySelector('.tbl-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'tbl-wrap'; details.appendChild(wrap); }
  const t = document.createElement('table'); t.className = 't';
  const hr = t.createTHead().insertRow();
  cols.forEach(c => { const th = document.createElement('th'); th.textContent = c; hr.appendChild(th); });
  const tb = t.createTBody();
  rows.forEach((r, k) => { const tr = tb.insertRow(); if (k === hlIndex) tr.className = 'hl'; r.forEach(v => { const td = tr.insertCell(); td.textContent = v; }); });
  wrap.replaceChildren(t);
}

/* ---------- controles ---------- */
function segBind(root, cb) {
  $$('.seg', root).forEach(sg => {
    $$('button', sg).forEach(b => b.addEventListener('click', () => {
      $$('button', sg).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      cb(sg.dataset.key, b.dataset.v);
    }));
  });
}
function segVal(root, key) { const b = $(`.seg[data-key="${key}"] button.on`, root); return b ? b.dataset.v : null; }
const PLAYERS = new Set();
function stopPlayers() { PLAYERS.forEach(p => p.stop()); }
class Player {
  constructor(onFrame, ms) {
    PLAYERS.add(this); this.onFrame = onFrame; this.ms = ms || 120; this.k = 0; this.total = 0; this.timer = null; this.onEnd = null; }
  play(total, from) {
    this.stop(); this.total = total; this.k = from != null ? from : 0;
    this.timer = setInterval(() => { this.onFrame(this.k); if (this.k >= this.total) { this.stop(); if (this.onEnd) this.onEnd(); } else this.k++; }, this.ms);
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  get running() { return !!this.timer; }
}
const FIGS = [];
function fig(render) { FIGS.push(render); return render; }
function safe(name, fn) { try { fn(); } catch (e) { console.error('Error en ' + name, e); } }

/* ---------- quiz ---------- */
function quiz(host, title, qs) {
  if (!host) return;
  const qmod = (host.closest('.module') || {}).dataset ? host.closest('.module').dataset.mod : null;
  host.classList.add('quiz');
  host.innerHTML = `<h3>${title}</h3><p class="fig-sub">Elige una respuesta: verás al instante si es correcta y por qué.</p>`;
  let answered = 0, right = 0;
  const score = document.createElement('div'); score.className = 'score';
  qs.forEach((q, qi) => {
    const box = document.createElement('div'); box.className = 'q';
    const p = document.createElement('p'); p.textContent = (qi + 1) + '. ' + q.q; box.appendChild(p);
    const opts = document.createElement('div'); opts.className = 'opts'; box.appendChild(opts);
    const fb = document.createElement('div'); fb.className = 'fb';
    q.o.forEach((t, oi) => {
      const b = document.createElement('button'); b.className = 'opt'; b.textContent = t;
      b.addEventListener('click', () => {
        if (box.dataset.done) return;
        box.dataset.done = '1'; answered++;
        if (oi === q.a) { right++; b.classList.add('right'); fb.textContent = '✔ Correcto. ' + q.why; }
        else { b.classList.add('wrong'); opts.children[q.a].classList.add('right'); fb.textContent = '✘ No exactamente. ' + q.why; }
        fb.style.display = 'block';
        score.textContent = `Puntuación: ${right} / ${answered} respondidas (de ${qs.length})`;
        if (answered === qs.length) { if (qmod) PROG.quiz(qmod, right, qs.length); score.textContent += right / qs.length >= 0.8 ? ' · ¡Aprobado! ✔' : ' · Necesitas 80% para aprobar: recarga el módulo para reintentar.'; }
      });
      opts.appendChild(b);
    });
    box.appendChild(fb); host.appendChild(box);
  });
  host.appendChild(score);
}
const fmt = (v, d) => (v == null || isNaN(v)) ? '—' : Number(v).toFixed(d == null ? 2 : d);

export { NS, $, $$, clamp, el, txt, COL, refreshColors, isHollow, mulberry32, gauss, seedCounter, newSeed, bridgePath, candleOf, candlesFromPath, aggregate, extent, rsiCalc, pivots, argExt, niceStep, chart, drawCandles, lineSeries, tag, hline, zone, seg, marker, vband, vline, hover, ohlcRows, dataTable, segBind, segVal, PLAYERS, stopPlayers, Player, FIGS, fig, safe, quiz, fmt };
