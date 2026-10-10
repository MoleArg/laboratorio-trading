// Motor interactivo · trendlines. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, argExt, bridgePath, candlesFromPath, chart, clamp, drawCandles, el, extent, fig, gauss, hover, mulberry32, newSeed, ohlcRows, pivots, quiz, segBind, tag } from './core';
import { mirrorC, tri } from './liquidez';
/* =====================================================================
   MÓDULO 4 · LÍNEAS DE TENDENCIA
   ===================================================================== */
const tl = { sc: 'up', seed: 13, cs: null, A: null, B: null, C: null, P: null, dyn: null, hnd: null, drag: null, ar: 1 };
function buildTL() {
  const r = mulberry32(tl.seed), per = 5;
  const W = [[0, 100], [5, 102.5], [8, 101.2], [14, 104.5], [18, 102.6], [24, 106.3], [28, 104.0], [34, 107.8], [38, 105.4], [42, 106.2], [46, 104.0], [50, 106.7], [56, 102.0]];
  const up = tl.sc === 'up';
  const cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p: p + (b > 0 ? gauss(r) * 0.12 : 0) })), r, 0.12), per);
  tl.cs = up ? cs : cs.map(c => mirrorC(c, 103));
  tl.ar = tl.cs.reduce((s, c) => s + c.h - c.l, 0) / tl.cs.length;
  const key = up ? 'l' : 'h', fn = up ? 'min' : 'max', vals = tl.cs.map(c => c[key]);
  const a = argExt(vals, 6, 10, fn), b = argExt(vals, 16, 20, fn);
  tl.A = { i: a, p: vals[a] }; tl.B = { i: b, p: vals[b] };
}
function analyzeTL(cs, A, B, up, ar) {
  if (A.i === B.i) return null;
  const tol = 0.15 * ar, s = (B.p - A.p) / (B.i - A.i), line = k => A.p + s * (k - A.i);
  const i0 = Math.min(A.i, B.i), i1 = Math.max(A.i, B.i), n = cs.length;
  let brk = -1;
  for (let k = i1 + 1; k < n; k++) if (up ? cs[k].c < line(k) - tol : cs[k].c > line(k) + tol) { brk = k; break; }
  const end = brk < 0 ? n - 1 : brk - 1, touches = [];
  for (let k = i0; k <= end; k++) {
    const v = line(k), hit = up ? Math.abs(cs[k].l - v) <= tol && cs[k].c >= v - tol : Math.abs(cs[k].h - v) <= tol && cs[k].c <= v + tol;
    if (hit && (!touches.length || k - touches[touches.length - 1] > 2)) touches.push(k);
  }
  let viol = 0;
  for (let k = i0 + 1; k < i1; k++) if (up ? cs[k].c < line(k) - tol : cs[k].c > line(k) + tol) viol++;
  let retest = -1;
  if (brk >= 0) for (let k = brk + 1; k < n; k++) if (up ? cs[k].h >= line(k) - tol && cs[k].c < line(k) : cs[k].l <= line(k) + tol && cs[k].c > line(k)) { retest = k; break; }
  let ch = 0;
  for (let k = i0; k <= end; k++) { const d = up ? cs[k].h - line(k) : cs[k].l - line(k); if (up ? d > ch : d < ch) ch = d; }
  return { s, line, touches, brk, retest, viol, ch, i0 };
}
function autoTL() {
  const cs = tl.cs, up = tl.sc === 'up', key = up ? 'l' : 'h', vals = cs.map(c => c[key]);
  const pv = pivots(vals, up ? 'low' : 'high', 2, 2);
  let best = null;
  for (let x = 0; x < pv.length; x++) for (let y = x + 1; y < pv.length; y++) {
    const i = pv[x], j = pv[y];
    if (j - i < 4 || (up ? vals[j] <= vals[i] : vals[j] >= vals[i])) continue;
    const A = { i, p: vals[i] }, B = { i: j, p: vals[j] }, an = analyzeTL(cs, A, B, up, tl.ar);
    if (!an || an.viol) continue;
    const score = an.touches.length * 10 + (j - i) * 0.1;
    if (!best || score > best.score) best = { A, B, score };
  }
  if (best) { tl.A = best.A; tl.B = best.B; }
}
function drawTLDyn() {
  const C = tl.C, P = tl.P, cs = tl.cs, up = tl.sc === 'up', g = tl.dyn;
  while (g.firstChild) g.removeChild(g.firstChild);
  const an = analyzeTL(cs, tl.A, tl.B, up, tl.ar), xEnd = C.n - 1;
  if (an) {
    const yA = an.line(an.i0), yE = an.line(xEnd);
    el('line', { x1: C.x(an.i0), y1: P.y(yA), x2: C.x(xEnd), y2: P.y(yE), stroke: COL.range, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    if ($('#tl-ch').checked && an.ch) el('line', { x1: C.x(an.i0), y1: P.y(yA + an.ch), x2: C.x(xEnd), y2: P.y(yE + an.ch), stroke: COL.range, 'stroke-width': 1.5, 'stroke-dasharray': '6 4', opacity: 0.8 }, g);
    an.touches.forEach(k => el('circle', { cx: C.x(k), cy: P.y(an.line(k)), r: 4, fill: COL.range, stroke: COL.surface, 'stroke-width': 2 }, g));
    if ($('#tl-liq').checked) an.touches.forEach(k => { for (let q = 0; q < 3; q++) tri(g, C.x(k) + (q - 1) * 7, P.y(an.line(k) + (up ? -1 : 1) * (0.25 + q * 0.08) * tl.ar), !up, false, COL.liq, 3.5); });
    if (an.brk >= 0) { const c = cs[an.brk]; tri(g, C.x(an.brk), P.y(up ? c.l : c.h) + (up ? 14 : -14), !up, true, up ? COL.down : COL.up, 6); tag(g, C.x(an.brk), P.y(up ? c.l : c.h) + (up ? 30 : -30), 'Ruptura', up ? COL.down : COL.up, 'middle'); }
    if (an.retest >= 0) { const c = cs[an.retest]; tag(g, C.x(an.retest), P.y(up ? c.h : c.l) + (up ? -16 : 16), 'Retesteo', COL.text2, 'middle'); }
  }
  [['A', tl.A], ['B', tl.B]].forEach(([k, pt], idx) => { const h = tl.hnd.children[idx]; h.setAttribute('cx', C.x(pt.i)); h.setAttribute('cy', P.y(pt.p)); });
  const st = an ? [['Toques', an.touches.length], ['Pendiente por vela', (an.s >= 0 ? '+' : '') + an.s.toFixed(3)], ['Ruptura', an.brk >= 0 ? 'vela ' + (an.brk + 1) : '—'], ['Retesteo', an.retest >= 0 ? 'vela ' + (an.retest + 1) : '—']] : [['Toques', '—']];
  $('#tl-stats').innerHTML = st.map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  let t;
  if (!an) t = 'Separa los dos puntos: una línea necesita dos velas distintas.';
  else if ((up && an.s <= 0) || (!up && an.s >= 0)) t = up ? 'La línea no sube: en tendencia alcista debe unir <strong>mínimos crecientes</strong>.' : 'La línea no baja: en tendencia bajista debe unir <strong>máximos decrecientes</strong>.';
  else if (an.viol) t = `La línea <strong>atraviesa ${an.viol} vela(s)</strong> entre los dos puntos: está forzada. Reajusta los puntos a ${up ? 'mínimos' : 'máximos'} que la dejen ${up ? 'por debajo' : 'por encima'} del precio.`;
  else t = `${an.touches.length >= 3 ? '<strong>Línea validada</strong>' : '<strong>Línea definida</strong> (falta un 3.er toque para validarla)'} con ${an.touches.length} toques.` +
    (an.brk >= 0 ? ` Se rompe con un cierre en la vela ${an.brk + 1}` + (an.retest >= 0 ? ` y el precio la <strong>retestea</strong> desde el otro lado en la vela ${an.retest + 1}: el antiguo ${up ? 'soporte actúa como resistencia' : 'resistencia actúa como soporte'}.` : '.') : ' Todavía no hay ruptura.');
  $('#tl-explain').innerHTML = t;
}
const renderTL = fig(function () {
  const host = $('#fig-tl'); if (!host) return;
  if (!tl.cs) buildTL();
  const cs = tl.cs, [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length + 4, panels: [{ h: 340, yMin: lo, yMax: hi, dec: 0 }], aria: 'Dibuja una línea de tendencia' });
  const P = C.panels[0];
  drawCandles(C, P, cs);
  hover(C, i => i < cs.length ? [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(cs[i], 2)) : null);
  tl.C = C; tl.P = P;
  const clip = el('clipPath', { id: 'tl-clip' }, el('defs', {}, C.svg));
  el('rect', { x: C.padL, y: P.top, width: C.iw, height: P.h }, clip);
  tl.dyn = el('g', { 'clip-path': 'url(#tl-clip)' }, C.svg); tl.hnd = el('g', {}, C.svg);
  ['A', 'B'].forEach(k => {
    const h = el('circle', { r: 8, fill: '#ffffff', stroke: COL.range, 'stroke-width': 3, style: 'cursor:grab', tabindex: 0, 'aria-label': 'Punto ' + k + ' de la línea' }, tl.hnd);
    h.addEventListener('pointerdown', e => { e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch (err) { /* sin captura: el arrastre sigue funcionando sobre el punto */ } tl.drag = k; });
    h.addEventListener('pointermove', e => {
      if (tl.drag !== k) return;
      const r = C.svg.getBoundingClientRect(), sx = (e.clientX - r.left) * C.w / r.width, sy = (e.clientY - r.top) * C.h / r.height;
      const i = clamp(Math.round((sx - C.padL) / C.step - 0.5), 0, cs.length - 1);
      let p = P.yMax - (sy - P.top) / P.h * (P.yMax - P.yMin);
      const snap = tl.sc === 'up' ? cs[i].l : cs[i].h;
      if (Math.abs(p - snap) < 0.8 * tl.ar) p = snap;
      tl[k] = { i, p }; drawTLDyn();
    });
    const end = () => { tl.drag = null; };
    h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
  });
  drawTLDyn();
});
function initTrendlines() {
  segBind($('#tl-dibuja'), (k, v) => { tl.sc = v; buildTL(); renderTL(); });
  $('#tl-auto').addEventListener('click', () => { autoTL(); drawTLDyn(); });
  ['#tl-ch', '#tl-liq'].forEach(s => $(s).addEventListener('change', drawTLDyn));
  $('#tl-new').addEventListener('click', () => { tl.seed = newSeed(); buildTL(); renderTL(); });
  renderTL();
  quiz($('#trendlines-quiz'), 'Práctica: líneas de tendencia', QUIZZES["trendlines"].qs);
}

export { tl, buildTL, analyzeTL, autoTL, drawTLDyn, renderTL, initTrendlines };
