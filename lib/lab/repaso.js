// Motor interactivo · repaso. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { GROUP_NAME, MOD_NAME, PROG } from './shared';
import { $, $$, COL, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, hline, lineSeries, marker, mulberry32, rsiCalc, safe, seg, tag, txt, vband, zone } from './core';
import { emaArr } from './emas';
import { shuffle } from './examen';
import { atrArr, bollinger } from './volat';
/* =====================================================================
   MÓDULO · REPASO RÁPIDO (tarjetas tipo Nibble)
   ===================================================================== */
const mvPath = (seed, W, per, noise) => candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p })), mulberry32(seed), noise), per);
function mvBase(host, cs, o) {
  o = o || {};
  const [lo, hi] = extent(cs, o.extra);
  const C = chart(host, { n: o.n || cs.length + 1, w: 560, padL: 12, padR: o.padR || 14, padT: 12, padB: o.padB || 12, panels: [{ h: o.h || 190, yMin: lo, yMax: hi, grid: false }].concat(o.panels || []), aria: o.aria || 'Ilustración' });
  const P = C.panels[0]; if (!o.noCandles) drawCandles(C, P, cs, o.dc);
  return { C, P };
}
function mvSvg(host, w, h) { host.querySelectorAll('svg').forEach(s => s.remove()); const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': 'Ilustración' }); host.appendChild(svg); return svg; }
const MV = {
  vela(host) {
    const svg = mvSvg(host, 560, 200), cx = 200, o = 140, c = 70, hi = 30, lo = 180;
    el('line', { x1: cx, x2: cx, y1: hi, y2: lo, stroke: COL.up, 'stroke-width': 3 }, svg);
    el('rect', { x: cx - 30, y: c, width: 60, height: o - c, rx: 4, fill: COL.up }, svg);
    [[hi, 'Máximo'], [c, 'Cierre'], [o, 'Apertura'], [lo, 'Mínimo']].forEach(([y, t]) => { el('line', { x1: cx + 40, x2: cx + 120, y1: y, y2: y, stroke: COL.muted, 'stroke-dasharray': '3 3' }, svg); txt(svg, cx + 128, y + 4, t, { fill: COL.text, 'font-size': 13, 'font-weight': 600 }); });
    txt(svg, cx - 120, 52, 'mecha', { fill: COL.muted, 'font-size': 12 }); txt(svg, cx - 120, 110, 'cuerpo', { fill: COL.muted, 'font-size': 12 });
  },
  martillo(host) {
    const cs = mvPath(4, [[0, 108], [3, 106], [6, 103.5], [9, 101.5], [11, 100.6]], 5, 0.14);
    cs.push({ o: 100.5, h: 100.8, l: 98.2, c: 100.7 }, { o: 100.7, h: 102, l: 100.5, c: 101.8 });
    const { C, P } = mvBase(host, cs, { extra: [97.8] });
    hline(C, P, 98.9, { x1: 0, color: COL.liq, width: 1.2, label: 'Soporte', side: 'left', below: true });
    marker(C, P, cs.length - 2, 98.2, { shape: 'up', color: COL.up, size: 6, label: 'Martillo', dy: 18 });
  },
  envolvente(host) {
    const cs = mvPath(9, [[0, 106], [4, 104], [7, 102.5], [9, 101.8]], 5, 0.12);
    cs.push({ o: 101.6, h: 101.8, l: 100.8, c: 101.0 }, { o: 100.8, h: 102.9, l: 100.6, c: 102.7 });
    const { C, P } = mvBase(host, cs);
    zone(C, P, 100.8, 102.7, { x1: cs.length - 2, x2: cs.length - 1, color: COL.up, op: 0.1, label: 'Envolvente alcista', labelBelow: true });
  },
  soporte(host) {
    const cs = mvPath(12, [[0, 104], [3, 100.2], [6, 103.2], [9, 100.1], [12, 103.5], [15, 100.2], [18, 102], [21, 99.2], [23, 98.4], [25, 99.8], [27, 98.6]], 4, 0.1);
    const { C, P } = mvBase(host, cs);
    zone(C, P, 99.85, 100.35, { x1: 0, x2: 19, color: COL.up, op: 0.15, label: 'Soporte', labelBelow: true });
    hline(C, P, 100.1, { x1: 20, color: COL.down, width: 1.4, label: 'ahora resistencia', side: 'right' });
  },
  estructura(host) {
    const cs = mvPath(3, [[0, 100], [4, 103], [7, 101.4], [11, 105], [14, 103.2], [18, 107], [21, 105.3], [24, 108.5]], 4, 0.1);
    const { C, P } = mvBase(host, cs);
    const key = cs.map(c => c.h), lows = cs.map(c => c.l);
    [[4, 'HH', 'h'], [11, 'HH', 'h'], [18, 'HH', 'h'], [7, 'HL', 'l'], [14, 'HL', 'l'], [21, 'HL', 'l']].forEach(([b, t, k]) => {
      const i = Math.min(cs.length - 1, Math.round(b * 4 / 4)); const j = argExt(k === 'h' ? key : lows, Math.max(0, i - 2), Math.min(cs.length - 1, i + 2), k === 'h' ? 'max' : 'min');
      marker(C, P, j, k === 'h' ? cs[j].h : cs[j].l, { color: k === 'h' ? COL.up : COL.range, size: 4, label: t, dy: k === 'h' ? -14 : 16 });
    });
  },
  choch(host) {
    const cs = mvPath(21, [[0, 100], [4, 103], [7, 101.5], [11, 105], [14, 103.3], [18, 106.2], [22, 102.2], [25, 103.4], [28, 100.5]], 4, 0.1);
    const { C, P } = mvBase(host, cs);
    const j = argExt(cs.map(c => c.l), 12, 16, 'min'), v = cs[j].l;
    hline(C, P, v, { x1: j, color: COL.down, width: 1.5, label: 'último HL', side: 'left', below: true });
    const b = cs.findIndex((c, i) => i > j + 3 && c.c < v);
    if (b > 0) marker(C, P, b, cs[b].l, { shape: 'down', color: COL.down, size: 6, label: 'CHoCH', dy: 18 });
  },
  trendline(host) {
    const cs = mvPath(31, [[0, 100], [3, 102.4], [5, 101.2], [8, 104], [10, 102.4], [13, 105.6], [15, 103.6], [18, 106.6], [20, 105]], 4, 0.08);
    const { C, P } = mvBase(host, cs);
    const t = [argExt(cs.map(c => c.l), 3, 7, 'min'), argExt(cs.map(c => c.l), 8, 12, 'min'), argExt(cs.map(c => c.l), 13, 17, 'min')];
    const a = cs[t[0]].l, b = cs[t[1]].l, s = (b - a) / (t[1] - t[0]);
    seg(C, P, 0, a - s * t[0], cs.length, a + s * (cs.length - t[0]), { color: COL.range, width: 2 });
    t.forEach((i, k) => marker(C, P, i, a + s * (i - t[0]), { color: COL.range, size: 4, label: (k + 1) + '.º', dy: 16 }));
  },
  fibo(host) {
    const cs = mvPath(7, [[0, 101], [2, 100], [10, 110], [16, 103.8], [20, 107]], 5, 0.12);
    const { C, P } = mvBase(host, cs, { extra: [99, 111] });
    const lv = x => 110 - x * 10;
    zone(C, P, lv(0.618), lv(0.786), { x1: 10, color: COL.fvg, op: 0.18 });
    [[0, '0'], [0.382, '0,382'], [0.5, '0,5'], [0.618, '0,618'], [1, '1']].forEach(([x, t]) => hline(C, P, lv(x), { x1: 2, color: x === 0.618 ? COL.liq : COL.muted, width: x === 0.618 ? 1.6 : 1, label: t, side: 'right', below: x === 1 }));
  },
  sesiones(host) {
    const svg = mvSvg(host, 560, 190), L = 90, W = 450, X = h => L + h / 24 * W;
    const rows = [['Sídney', 17, 26, '#3987e5'], ['Tokio', 19, 28, '#d95926'], ['Londres', 3, 12, '#199e70'], ['Nueva York', 8, 17, '#c98500']];
    el('rect', { x: X(8), y: 10, width: X(12) - X(8), height: 150, fill: COL.liq, 'fill-opacity': 0.13 }, svg);
    txt(svg, X(10), 176, 'solapamiento', { 'text-anchor': 'middle', fill: COL.liq, 'font-size': 11, 'font-weight': 700 });
    rows.forEach(([n, a, b, col], i) => {
      const y = 20 + i * 34; txt(svg, L - 8, y + 15, n, { 'text-anchor': 'end', fill: COL.text, 'font-size': 12 });
      const seg2 = (s, e) => el('rect', { x: X(s), y, width: X(e) - X(s), height: 20, rx: 4, fill: col, opacity: 0.85 }, svg);
      if (b > 24) { seg2(a, 24); seg2(0, b - 24); } else seg2(a, b);
    });
    [0, 6, 12, 18, 24].forEach(h => txt(svg, X(h), 160, String(h).padStart(2, '0') + ':00', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10 }));
  },
  volumen(host) {
    const cs = mvPath(15, [[0, 100], [3, 101.2], [6, 100.1], [9, 101.3], [12, 100.2], [15, 101.1], [16, 103.4], [18, 103]], 4, 0.07);
    const vol = cs.map((c, i) => (i >= 60 / 4 && i <= 64 / 4) ? 3.2 : 1 + ((i * 37) % 7) / 10);
    const { C, P } = mvBase(host, cs, { panels: [{ h: 50, yMin: 0, yMax: 3.6, grid: false }], h: 150 });
    hline(C, P, 101.35, { x1: 0, x2: 15, color: COL.liq, width: 1.2, label: 'resistencia', side: 'left' });
    const V = C.panels[1]; vol.forEach((v, i) => el('rect', { x: C.x(i) - C.bw / 2, y: V.y(v), width: C.bw, height: V.bottom - V.y(v), fill: v > 2 ? COL.up : COL.muted, opacity: 0.7 }, V.g.data));
  },
  emas(host) {
    const cs = mvPath(44, [[0, 106], [8, 101], [14, 100.5], [20, 104], [30, 109]], 4, 0.15), cl = cs.map(c => c.c);
    const { C, P } = mvBase(host, cs);
    lineSeries(C, P, emaArr(cl, 5), { color: COL.liq, width: 2 }); lineSeries(C, P, emaArr(cl, 14), { color: COL.fvg, width: 2 });
    tag(P.g.lab, C.x(cs.length - 1), P.y(cl[cl.length - 1]) - 18, 'EMA rápida', COL.liq, 'end');
  },
  rsi(host) {
    const cs = mvPath(52, [[0, 100], [10, 101], [22, 108], [28, 107.5]], 4, 0.1), r = rsiCalc(cs.map(c => c.c), 14).rsi;
    const { C } = mvBase(host, cs, { h: 120, panels: [{ h: 70, yMin: 0, yMax: 100, grid: false }] });
    const R = C.panels[1]; zone(C, R, 70, 100, { color: COL.down, op: 0.12, stroke: false }); zone(C, R, 0, 30, { color: COL.up, op: 0.12, stroke: false });
    hline(C, R, 70, { color: COL.down, width: 1, label: '70', side: 'left' }); lineSeries(C, R, r, { color: COL.rsi, width: 2 });
  },
  divergencia(host) {
    const cs = mvPath(61, [[0, 100], [5, 104.5], [8, 102.5], [12, 105.2], [15, 103]], 5, 0.09), r = rsiCalc(cs.map(c => c.c), 6).rsi;
    const { C, P } = mvBase(host, cs, { h: 120, panels: [{ h: 70, yMin: 0, yMax: 100, grid: false }] });
    const a = argExt(cs.map(c => c.h), 3, 7, 'max'), b = argExt(cs.map(c => c.h), 10, 14, 'max');
    seg(C, P, a, cs[a].h, b, cs[b].h, { color: COL.text, width: 2 });
    const R = C.panels[1]; lineSeries(C, R, r, { color: COL.rsi, width: 2 }); seg(C, R, a, r[a], b, r[b], { color: COL.down, width: 2 });
    tag(P.g.lab, C.x(b), P.y(cs[b].h) - 14, 'HH', COL.text, 'middle'); tag(R.g.lab, C.x(b), R.y(r[b]) - 12, 'LH', COL.down, 'middle');
  },
  bollinger(host) {
    const cs = mvPath(73, [[0, 100], [3, 103], [5, 99], [8, 102.4], [12, 100.6], [16, 101.5], [20, 101], [22, 101.3], [25, 105.5], [28, 107]], 4, 0.1), cl = cs.map(c => c.c), b = bollinger(cl, 10, 2);
    const { C, P } = mvBase(host, cs, { extra: b.up.concat(b.lo).filter(v => v != null) });
    lineSeries(C, P, b.up, { color: COL.range, width: 1.4 }); lineSeries(C, P, b.lo, { color: COL.range, width: 1.4 });
    const sq = argExt(b.bw.map(v => v == null ? 99 : v), 10, 24, 'min'); vband(C, sq - 2, sq + 2, { color: COL.liq, op: 0.12 });
    tag(P.g.lab, C.x(sq), P.top + 12, 'Squeeze', COL.liq, 'middle');
  },
  atr(host) {
    const cs = mvPath(85, [[0, 100], [6, 102], [10, 101.2], [14, 103.5]], 4, 0.12), a = atrArr(cs, 10), k = cs.length - 1, e = cs[k].c, s = e - 1.5 * a[k];
    const { C, P } = mvBase(host, cs, { extra: [s - 0.4], n: cs.length + 6 });
    zone(C, P, e, s, { x1: k, x2: k + 5, color: COL.down, op: 0.16, label: 'stop = 1,5 × ATR', labelBelow: true });
    hline(C, P, e, { x1: k, x2: k + 5, color: COL.entry, width: 1.4, dash: false });
  },
  barrido(host) {
    const cs = mvPath(91, [[0, 100], [4, 103], [7, 101.2], [11, 103.02], [14, 101], [17, 102.4]], 4, 0.07);
    cs.push({ o: 102.4, h: 103.8, l: 102.2, c: 102.6 }, { o: 102.6, h: 102.7, l: 100.6, c: 100.8 });
    const { C, P } = mvBase(host, cs);
    hline(C, P, 103.05, { x1: 3, x2: cs.length - 1, color: COL.liq, width: 1.4, label: 'BSL (máximos iguales)', side: 'left' });
    marker(C, P, cs.length - 2, 103.8, { shape: 'down', color: COL.down, size: 6, label: 'Barrido', dy: -16 });
  },
  fvg(host) {
    const cs = [{ o: 100, h: 100.9, l: 99.6, c: 100.6 }, { o: 100.6, h: 100.8, l: 100.1, c: 100.4 }, { o: 100.4, h: 102.9, l: 100.3, c: 102.7 }, { o: 102.7, h: 103.4, l: 101.8, c: 103.1 }, { o: 103.1, h: 103.6, l: 102.6, c: 103.3 }];
    const { C, P } = mvBase(host, cs, { n: 8 });
    zone(C, P, cs[1].h, cs[3].l, { x1: 1, x2: 7, color: COL.fvg, op: 0.22, label: 'FVG', labelX: C.x(5) });
    [1, 2, 3].forEach((i, k) => txt(C.bg, C.x(i), C.h - 2, String(k + 1), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }));
  },
  ob(host) {
    const cs = mvPath(97, [[0, 104], [4, 102.5], [7, 101.2]], 4, 0.1);
    cs.push({ o: 101.3, h: 101.4, l: 100.4, c: 100.6 }, { o: 100.6, h: 102.6, l: 100.5, c: 102.4 }, { o: 102.4, h: 104.4, l: 102.2, c: 104.1 }, { o: 104.1, h: 104.5, l: 103, c: 103.2 }, { o: 103.2, h: 103.4, l: 101.2, c: 101.6 }, { o: 101.6, h: 103.8, l: 101.1, c: 103.6 }, { o: 103.6, h: 105.5, l: 103.4, c: 105.2 });
    const { C, P } = mvBase(host, cs), i = cs.length - 8;
    zone(C, P, cs[i].h, cs[i].l, { x1: i, x2: cs.length - 1, color: COL.ob, op: 0.2, label: 'Order block', labelBelow: true });
  },
  crt(host) {
    const cs = [{ o: 101, h: 104, l: 100, c: 103.2 }, { o: 103.2, h: 103.6, l: 99.1, c: 101.2 }, { o: 101.2, h: 104.8, l: 101, c: 104.5 }];
    const { C, P } = mvBase(host, cs, { n: 5, dc: { bw: 34 }, extra: [98.6] });
    hline(C, P, 104, { x1: 0, x2: 4, color: COL.range, label: 'CRT High', side: 'right' }); hline(C, P, 100, { x1: 0, x2: 4, color: COL.range, label: 'CRT Low', side: 'right', below: true });
    marker(C, P, 1, 99.1, { shape: 'up', color: COL.liq, size: 6, label: 'barrido', dy: 18 });
    ['Rango', 'Manipulación', 'Expansión'].forEach((t, k) => txt(C.bg, C.x(k), P.top + 10, t, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }));
  },
  smt(host) {
    const a = mvPath(5, [[0, 102], [5, 100], [9, 101.6], [14, 99.2], [18, 101.8]], 4, 0.06).map(c => c.c), b = mvPath(6, [[0, 102], [5, 100], [9, 101.7], [14, 100.6], [18, 102.3]], 4, 0.06).map(c => c.c);
    host.querySelectorAll('svg').forEach(s => s.remove());
    const C = chart(host, { n: a.length, w: 560, padL: 12, padR: 90, padT: 12, padB: 12, panels: [{ h: 90, yMin: Math.min(...a) - 0.3, yMax: Math.max(...a) + 0.3, grid: false }, { h: 90, yMin: Math.min(...b) - 0.3, yMax: Math.max(...b) + 0.3, grid: false }], gap: 10, aria: 'SMT' });
    const [A, B] = C.panels; lineSeries(C, A, a, { color: COL.range, width: 2 }); lineSeries(C, B, b, { color: COL.liq, width: 2 });
    const i1 = argExt(a, 3, 7, 'min'), i2 = argExt(a, 11, 15, 'min');
    seg(C, A, i1, a[i1], i2, a[i2], { color: COL.down, width: 2 }); seg(C, B, i1, b[i1], i2, b[i2], { color: COL.up, width: 2 });
    txt(A.g.lab, C.padL + C.iw + 8, A.top + 50, 'EUR/USD LL', { fill: COL.down, 'font-size': 11, 'font-weight': 700 }); txt(B.g.lab, C.padL + C.iw + 8, B.top + 50, 'GBP/USD HL', { fill: COL.up, 'font-size': 11, 'font-weight': 700 });
  },
  spread(host) {
    const mid = mvPath(8, [[0, 100], [6, 100.6], [12, 100.2], [18, 100.9]], 4, 0.05).map(c => c.c);
    host.querySelectorAll('svg').forEach(s => s.remove());
    const C = chart(host, { n: mid.length, w: 560, padL: 12, padR: 60, padT: 12, padB: 12, panels: [{ h: 180, yMin: Math.min(...mid) - 0.3, yMax: Math.max(...mid) + 0.3, grid: false }], aria: 'Spread' }), P = C.panels[0];
    const ask = mid.map(v => v + 0.09), bid = mid.map(v => v - 0.09);
    let d = ''; ask.forEach((v, i) => d += (i ? 'L' : 'M') + C.x(i) + ' ' + P.y(v)); for (let i = bid.length - 1; i >= 0; i--) d += 'L' + C.x(i) + ' ' + P.y(bid[i]);
    el('path', { d: d + 'Z', fill: COL.liq, 'fill-opacity': 0.18 }, P.g.zone);
    lineSeries(C, P, ask, { color: COL.down, width: 2 }); lineSeries(C, P, bid, { color: COL.up, width: 2 });
    txt(P.g.lab, C.padL + C.iw + 6, P.y(ask[ask.length - 1]) + 4, 'Ask', { fill: COL.down, 'font-size': 12, 'font-weight': 700 });
    txt(P.g.lab, C.padL + C.iw + 6, P.y(bid[bid.length - 1]) + 4, 'Bid', { fill: COL.up, 'font-size': 12, 'font-weight': 700 });
  },
  rr(host) {
    const cs = mvPath(17, [[0, 101], [5, 99.6], [8, 100.4]], 4, 0.08), k = cs.length - 1, e = cs[k].c;
    const { C, P } = mvBase(host, cs, { n: cs.length + 10, extra: [e - 1, e + 2] });
    zone(C, P, e, e + 2, { x1: k, x2: k + 9, color: COL.up, op: 0.16, label: 'Beneficio 2R' }); zone(C, P, e, e - 1, { x1: k, x2: k + 9, color: COL.down, op: 0.16, label: 'Riesgo 1R', labelBelow: true });
    hline(C, P, e, { x1: k, x2: k + 9, color: COL.entry, width: 1.5, dash: false });
  },
  drawdown(host) {
    const svg = mvSvg(host, 560, 200), data = [[10, 11], [25, 33], [50, 100], [75, 300]], Y = v => 170 - Math.min(150, v / 300 * 150);
    data.forEach(([l, g], i) => {
      const x = 60 + i * 125;
      el('rect', { x, y: Y(l), width: 40, height: 170 - Y(l), rx: 4, fill: COL.down, opacity: 0.85 }, svg);
      el('rect', { x: x + 46, y: Y(g), width: 40, height: 170 - Y(g), rx: 4, fill: COL.up, opacity: 0.85 }, svg);
      txt(svg, x + 20, Y(l) - 5, '−' + l + '%', { 'text-anchor': 'middle', fill: COL.down, 'font-size': 11, 'font-weight': 700 });
      txt(svg, x + 66, Y(g) - 5, '+' + g + '%', { 'text-anchor': 'middle', fill: COL.up, 'font-size': 11, 'font-weight': 700 });
    });
    el('line', { x1: 40, x2: 540, y1: 170, y2: 170, stroke: COL.axis }, svg);
    txt(svg, 40, 192, 'Pérdida (rojo) y ganancia necesaria para recuperar (verde)', { fill: COL.muted, 'font-size': 11 });
  },
  sizing(host) {
    const svg = mvSvg(host, 560, 150), box = (x, w, t1, t2, col) => { el('rect', { x, y: 40, width: w, height: 70, rx: 10, fill: COL.surface, stroke: col, 'stroke-width': 2 }, svg); txt(svg, x + w / 2, 68, t1, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }); txt(svg, x + w / 2, 94, t2, { 'text-anchor': 'middle', fill: COL.text, 'font-size': 17, 'font-weight': 700 }); };
    box(20, 150, 'Riesgo (1% de $10 000)', '$100', COL.down); txt(svg, 190, 82, '÷', { fill: COL.text, 'font-size': 24, 'text-anchor': 'middle' });
    box(210, 160, 'Stop × valor del pip', '50 × $10', COL.liq); txt(svg, 390, 82, '=', { fill: COL.text, 'font-size': 24, 'text-anchor': 'middle' });
    box(410, 130, 'Tamaño', '0,2 lotes', COL.up);
  }
};
const MICRO = [
  { id: 'vela', g: 'fund', mod: 'velas', t: 'Una vela, cuatro precios', def: 'Cada vela resume un periodo con su apertura, máximo, mínimo y cierre (OHLC).', x: 'El <strong>cuerpo</strong> va de la apertura al cierre; las <strong>mechas</strong>, hasta los extremos que el precio visitó y rechazó.', q: { q: 'Si el cierre queda por encima de la apertura, la vela es…', o: ['Alcista', 'Bajista'], a: 0, why: 'Cerró más arriba de donde abrió: ganaron los compradores en ese periodo.' } },
  { id: 'martillo', g: 'fund', mod: 'patrones', t: 'El martillo', def: 'Cuerpo pequeño arriba y mecha inferior larga: el precio cayó y fue rechazado.', x: 'Solo significa algo <strong>en contexto</strong>: tras una caída y sobre un soporte.', q: { q: '¿Dónde tiene sentido un martillo?', o: ['Tras una caída, sobre un soporte', 'En medio de un rango, sin contexto'], a: 0, why: 'Sin una caída previa ni una zona relevante, la forma sola no dice nada.' } },
  { id: 'envolvente', g: 'fund', mod: 'patrones', t: 'Envolvente alcista', def: 'Una vela alcista cuyo cuerpo cubre todo el cuerpo bajista anterior.', x: 'Muestra un cambio de control: los compradores absorbieron toda la presión de la vela previa.', q: { q: 'En una envolvente alcista, el cuerpo verde…', o: ['Cubre todo el cuerpo rojo anterior', 'Es más pequeño que el rojo'], a: 0, why: '"Envuelve" el cuerpo anterior completo.' } },
  { id: 'soporte', g: 'fund', mod: 'sr', t: 'Soporte y cambio de polaridad', def: 'Una zona donde la demanda frenó caídas varias veces.', x: 'Cuando se rompe con un cierre claro, muchas veces el <strong>antiguo soporte pasa a ser resistencia</strong>.', q: { q: 'Un soporte roto con un cierre claro suele…', o: ['Convertirse en resistencia', 'Dejar de importar'], a: 0, why: 'Es el cambio de polaridad: quienes compraron ahí quieren salir "sin perder".' } },
  { id: 'estructura', g: 'fund', mod: 'estructura', t: 'HH y HL', def: 'Tendencia alcista = máximos más altos (HH) y mínimos más altos (HL).', x: 'La estructura se lee en los <strong>swings</strong>, no en el color de las velas.', q: { q: 'Una tendencia alcista por estructura es…', o: ['Máximos y mínimos crecientes', 'Muchas velas verdes seguidas'], a: 0, why: 'La secuencia de swings define la tendencia.' } },
  { id: 'choch', g: 'fund', mod: 'estructura', t: 'CHoCH: primer aviso', def: 'Change of character: romper el último mínimo creciente en una tendencia alcista.', x: 'Es la primera señal de que la estructura <strong>podría</strong> estar cambiando. El BOS, en cambio, rompe a favor de la tendencia.', q: { q: 'Romper el último HL en una tendencia alcista es…', o: ['Un CHoCH', 'Un BOS a favor'], a: 0, why: 'Rompe en contra de la tendencia: cambio de carácter.' } },
  { id: 'trendline', g: 'fund', mod: 'trendlines', t: 'El tercer toque', def: 'Dos puntos definen una línea; el tercer toque la valida.', x: 'Cuantos más toques, más relevante… y más stops acumula debajo.', q: { q: '¿Cuántos toques validan una línea de tendencia?', o: ['Tres', 'Uno'], a: 0, why: 'Con dos siempre se puede trazar una línea; el tercero demuestra que el mercado la respeta.' } },
  { id: 'fibo', g: 'fund', mod: 'fibo', t: 'Fibonacci: dónde retrocede', def: 'Los niveles miden el retroceso como proporción del impulso: 38,2 / 50 / 61,8 / 78,6%.', x: 'Por debajo del 50% estás en <strong>descuento</strong>; la zona 62–79% es la OTE de ICT.', q: { q: 'Un retroceso del 30% en un impulso alcista: comprar ahí es comprar en…', o: ['Premium', 'Descuento'], a: 0, why: 'Está por encima de la mitad del impulso: caro, con el stop lejos.' } },
  { id: 'sesiones', g: 'fund', mod: 'sesiones', t: 'El solapamiento', def: 'Entre las 8:00 y las 12:00 de Nueva York están abiertas Londres y Nueva York a la vez.', x: 'Es la franja con más volumen y movimientos más limpios del día en forex.', q: { q: 'La mayor liquidez del día en forex suele estar en…', o: ['El solapamiento Londres–Nueva York', 'La mitad de la sesión de Asia'], a: 0, why: 'Coinciden los dos centros financieros más grandes.' } },
  { id: 'volumen', g: 'fund', mod: 'volumen', t: 'Volumen que confirma', def: 'Una ruptura con volumen alto muestra participación real.', x: 'Si el precio rompe pero el volumen no acompaña, sospecha: puede ser un barrido.', q: { q: 'Una ruptura con volumen bajo es…', o: ['Sospechosa', 'Más fiable'], a: 0, why: 'Sin participación, la ruptura tiene menos "combustible".' } },
  { id: 'emas', g: 'ind', mod: 'emas', t: 'EMA rápida y lenta', def: 'La EMA pondera más los precios recientes que la SMA.', x: 'La rápida cruza a la lenta cuando el impulso cambia; en rangos, esos cruces dan muchas señales falsas.', q: { q: 'La EMA reacciona antes que la SMA porque…', o: ['Pondera más los precios recientes', 'Usa más datos'], a: 0, why: 'El peso decrece exponencialmente hacia atrás.' } },
  { id: 'rsi', g: 'ind', mod: 'rsi', t: 'RSI en sobrecompra', def: 'RSI > 70 indica que las subidas recientes dominan a las bajadas.', x: 'En una tendencia fuerte el RSI puede quedarse arriba mucho tiempo: <strong>no es una señal de venta</strong> por sí solo.', q: { q: 'RSI en 80 durante una tendencia fuerte significa…', o: ['Momentum fuerte, no venta automática', 'Hay que vender ya'], a: 0, why: 'Sobrecompra describe fuerza, no un techo.' } },
  { id: 'divergencia', g: 'ind', mod: 'rsi', t: 'Divergencia bajista', def: 'El precio marca un máximo más alto y el RSI uno más bajo.', x: 'El impulso se debilita aunque el precio suba. Necesita confirmación (estructura) para operar.', q: { q: 'Precio HH y RSI LH es…', o: ['Divergencia bajista', 'Confirmación alcista'], a: 0, why: 'El oscilador no acompaña al nuevo máximo.' } },
  { id: 'bollinger', g: 'ind', mod: 'volat', t: 'El squeeze', def: 'Bandas de Bollinger muy estrechas = volatilidad comprimida.', x: 'La compresión suele preceder a una expansión, pero <strong>no dice la dirección</strong>.', q: { q: 'Un squeeze anticipa…', o: ['Una expansión de volatilidad', 'Una subida'], a: 0, why: 'Indica que se viene movimiento, no hacia dónde.' } },
  { id: 'atr', g: 'ind', mod: 'volat', t: 'Stop con ATR', def: 'El ATR mide el rango medio de las velas: la volatilidad "normal".', x: 'Un stop a 1,5–2 ATR queda fuera del ruido habitual. Si el ATR sube, el stop se aleja y el <strong>tamaño baja</strong>.', q: { q: 'Si el ATR se duplica y arriesgas los mismos $, tu tamaño…', o: ['Se reduce a la mitad', 'Se duplica'], a: 0, why: 'Stop el doble de lejos con el mismo riesgo = la mitad de tamaño.' } },
  { id: 'barrido', g: 'smc', mod: 'liquidez', t: 'Barrido de máximos iguales', def: 'Sobre máximos iguales se acumulan stops (BSL).', x: 'El precio sube a tomarlos con una mecha y <strong>cierra de vuelta dentro</strong>: rechazo, no ruptura.', q: { q: 'Mecha por encima y cierre por debajo del máximo es…', o: ['Un barrido', 'Una ruptura aceptada'], a: 0, why: 'La clave es el cierre: el mercado rechazó esos precios.' } },
  { id: 'fvg', g: 'smc', mod: 'liquidez', t: 'Fair value gap', def: 'Un hueco entre la mecha de la vela 1 y la de la vela 3, dejado por una vela 2 de desplazamiento.', x: 'El precio suele volver a "rellenarlo" parcialmente antes de continuar.', q: { q: 'Un FVG alcista es el hueco entre…', o: ['El máximo de la vela 1 y el mínimo de la vela 3', 'La apertura y el cierre de una vela'], a: 0, why: 'Es la zona que la vela 2 atravesó sin solaparse.' } },
  { id: 'ob', g: 'smc', mod: 'smc', t: 'Order block', def: 'La última vela bajista antes de un desplazamiento alcista que rompe estructura.', x: 'Se espera que el precio vuelva a esa zona y reaccione (mitigación).', q: { q: 'Un order block alcista es…', o: ['La última vela bajista antes del desplazamiento alcista', 'Cualquier vela grande'], a: 0, why: 'Marca donde entraron las órdenes que generaron el impulso.' } },
  { id: 'crt', g: 'smc', mod: 'crt', t: 'Modelo CRT', def: 'Vela 1 define el rango; vela 2 barre un extremo y cierra dentro; vela 3 expande hacia el otro.', x: 'Es el patrón de "manipulación y distribución" leído en tres velas de temporalidad alta.', q: { q: 'En la CRT, la vela 2 debe…', o: ['Barrer un extremo y cerrar dentro del rango', 'Cerrar fuera del rango'], a: 0, why: 'Si cierra fuera, es una ruptura, no una purga.' } },
  { id: 'smt', g: 'smc', mod: 'smt', t: 'Divergencia SMT', def: 'Dos activos correlacionados no confirman el mismo extremo.', x: 'EUR/USD hace un mínimo más bajo y GBP/USD no: señal de fuerza oculta en el barrido.', q: { q: 'Un activo hace mínimo más bajo y su correlacionado no. Es…', o: ['SMT', 'Confirmación de tendencia'], a: 0, why: 'La falta de confirmación es la divergencia.' } },
  { id: 'spread', g: 'ges', mod: 'ordenes', t: 'Bid, ask y spread', def: 'Compras al ask, vendes al bid. La diferencia es el spread.', x: 'Cada operación empieza perdiendo el spread: importa más cuanto más corto es tu objetivo.', q: { q: 'Cuando compras a mercado, pagas el…', o: ['Ask', 'Bid'], a: 0, why: 'El ask es el precio al que alguien está dispuesto a venderte.' } },
  { id: 'rr', g: 'ges', mod: 'riesgo', t: 'Riesgo/beneficio 1:2', def: 'Arriesgas 1R para ganar 2R.', x: 'Con 1:2 te basta acertar <strong>un 33%</strong> para no perder dinero (sin contar costos).', q: { q: 'Con R:B 1:2, ¿qué acierto mínimo necesitas para empatar?', o: ['33%', '50%'], a: 0, why: '1 / (1 + 2) = 33%.' } },
  { id: 'drawdown', g: 'ges', mod: 'riesgo', t: 'La asimetría del drawdown', def: 'Perder X% exige ganar X / (100 − X) para recuperarlo.', x: 'Un −50% exige un +100%. Por eso proteger el capital pesa más que maximizar ganancias.', q: { q: 'Perder el 50% de la cuenta exige ganar…', o: ['100%', '50%'], a: 0, why: 'La mitad que queda tiene que duplicarse.' } },
  { id: 'sizing', g: 'ges', mod: 'riesgo', t: 'Tamaño de posición', def: 'Tamaño = riesgo en $ ÷ (distancia al stop × valor por unidad).', x: 'Primero decides cuánto arriesgar; el tamaño es la consecuencia, no al revés.', q: { q: 'Cuenta $10 000, riesgo 1%, stop de 50 pips a $10/pip por lote. ¿Tamaño?', o: ['0,2 lotes', '2 lotes'], a: 0, why: '$100 ÷ (50 × $10) = 0,2 lotes.' } }
];
const mc = { deck: 'dia', cards: [], i: 0, stars: 0, combo: 0, best: 0, res: [] };
function mcDecks() {
  const st = PROG.get().micro, wrong = (st.wrong || []).length;
  const ds = [['dia', '📅 Mazo del día · 8'], ['fund', 'Fundamentos'], ['ind', 'Indicadores'], ['smc', 'Smart Money'], ['ges', 'Gestión'], ['todo', 'Todas · ' + MICRO.length]].concat(wrong ? [['fallos', '↺ Mis fallos · ' + wrong]] : []);
  $('#mc-decks').innerHTML = ds.map(([k, t]) => `<button type="button" data-d="${k}" class="${k === mc.deck ? 'on' : ''}">${t}</button>`).join('');
  $$('#mc-decks button').forEach(b => b.addEventListener('click', () => mcStart(b.dataset.d)));
}
function mcStart(deck) {
  mc.deck = deck; const st = PROG.get().micro;
  const day = new Date(), seed = day.getFullYear() * 1000 + day.getMonth() * 40 + day.getDate();
  mc.cards = deck === 'dia' ? shuffle(MICRO, mulberry32(seed)).slice(0, 8) : deck === 'todo' ? shuffle(MICRO) : deck === 'fallos' ? shuffle(MICRO.filter(c => (st.wrong || []).includes(c.id))) : MICRO.filter(c => c.g === deck);
  mc.i = 0; mc.stars = 0; mc.combo = 0; mc.best = 0; mc.res = [];
  mcDecks(); mcShow();
}
function mcShow() {
  const stage = $('#mc-stage'), c = mc.cards[mc.i]; if (!c) return mcEnd();
  const segs = mc.cards.map((x, k) => `<span class="${k < mc.res.length ? (mc.res[k] ? 'ok' : 'ko') : k === mc.i ? 'cur' : ''}"></span>`).join('');
  const ord = shuffle(c.q.o.map((_, k) => k));
  stage.innerHTML = `<div class="mc-top"><div class="mc-segs">${segs}</div><span class="mc-combo">${mc.combo >= 2 ? '🔥 x' + mc.combo : ''}</span><span class="mc-stars">★ ${mc.stars}</span></div>
    <div class="mc-card"><div class="kick">${GROUP_NAME[c.g]} · ${MOD_NAME[c.mod]}</div><h3>${c.t}</h3>
    <div class="mc-viz"><div class="chart-host" id="mc-viz"></div></div>
    <div class="mc-def">${c.def}</div><p>${c.x}</p>
    <div class="mc-q"><p>${c.q.q}</p><div class="mc-opts">${ord.map(k => `<button type="button" data-k="${k}">${c.q.o[k]}</button>`).join('')}</div><div class="mc-why"></div></div>
    <div class="mc-foot"><a href="#${c.mod}" class="rp-hint">Ver el módulo ${MOD_NAME[c.mod]} →</a><button class="btn primary" id="mc-next" disabled>${mc.i === mc.cards.length - 1 ? 'Terminar' : 'Continuar'}</button></div></div>`;
  safe('mc-viz', () => MV[c.id]($('#mc-viz')));
  $$('.mc-opts button', stage).forEach(b => b.addEventListener('click', () => mcAnswer(+b.dataset.k)));
  $('#mc-next').addEventListener('click', () => { mc.i++; mcShow(); });
}
function mcAnswer(k) {
  const c = mc.cards[mc.i]; if (mc.res.length > mc.i) return;
  const ok = k === c.q.a; mc.res.push(ok);
  if (ok) { mc.combo++; mc.best = Math.max(mc.best, mc.combo); mc.stars += mc.combo >= 3 ? 2 : 1; } else mc.combo = 0;
  $$('.mc-opts button').forEach(b => { b.disabled = true; const kk = +b.dataset.k; if (kk === c.q.a) b.classList.add('right'); else if (kk === k) b.classList.add('wrong'); });
  const w = $('.mc-why'); w.innerHTML = (ok ? '✔ ' : '✘ ') + c.q.why + (ok && mc.combo >= 3 ? ' <b>¡Combo! +2 ★</b>' : ''); w.style.display = 'block';
  PROG.micro(s => { const set = new Set(s.wrong || []); ok ? set.delete(c.id) : set.add(c.id); s.wrong = [...set]; if (ok) s.stars = (s.stars || 0) + (mc.combo >= 3 ? 2 : 1); });
  $('.mc-stars').textContent = '★ ' + mc.stars; $('.mc-combo').textContent = mc.combo >= 2 ? '🔥 x' + mc.combo : '';
  $$('.mc-segs span')[mc.i].className = ok ? 'ok' : 'ko';
  const nb = $('#mc-next'); nb.disabled = false; nb.focus();
}
function mcEnd() {
  const ok = mc.res.filter(Boolean).length, n = mc.res.length;
  PROG.micro(s => { s.decks = (s.decks || 0) + 1; });
  const weak = {}; mc.cards.forEach((c, k) => { if (!mc.res[k]) weak[c.mod] = (weak[c.mod] || 0) + 1; });
  const wk = Object.keys(weak).sort((a, b) => weak[b] - weak[a])[0];
  $('#mc-stage').innerHTML = `<div class="mc-card mc-end"><div class="big">${ok === n ? '🏆' : ok >= n * 0.7 ? '⭐' : '💪'}</div><h3>${ok === n ? '¡Perfecto!' : ok >= n * 0.7 ? '¡Muy bien!' : 'Buen intento'}</h3>
    <p>${ok} de ${n} correctas · mejor combo x${mc.best}</p>
    <div class="readout"><div class="stat"><div class="k">Estrellas ganadas</div><div class="v">★ ${mc.stars}</div></div><div class="stat"><div class="k">Racha diaria</div><div class="v">🔥 ${PROG.streak()} d</div></div><div class="stat"><div class="k">Estrellas totales</div><div class="v">★ ${PROG.get().micro.stars}</div></div></div>
    <div class="mc-foot" style="justify-content:center"><button class="btn primary" id="mc-again">Otro mazo</button>${wk ? `<a class="btn" href="#${wk}">Repasar ${MOD_NAME[wk]}</a>` : ''}</div></div>`;
  $('#mc-again').addEventListener('click', () => mcStart(mc.deck === 'dia' ? 'todo' : mc.deck));
}
function initRepaso() {
  mcStart('dia');
  document.addEventListener('keydown', e => {
    if (!$('#m-repaso').classList.contains('active') || e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return;
    if (e.key === '1' || e.key === '2') { const b = $$('.mc-opts button')[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); b.click(); } }
    else if (e.key === 'Enter' && $('#mc-next') && !$('#mc-next').disabled && document.activeElement !== $('#mc-next')) { e.preventDefault(); $('#mc-next').click(); }
  });
}

export { mvPath, mvBase, mvSvg, MV, MICRO, mc, mcDecks, mcStart, mcShow, mcAnswer, mcEnd, initRepaso };
