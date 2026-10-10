// Motor interactivo · smt. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, Player, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, mulberry32, newSeed, quiz, seg, segBind, tag, txt, vline } from './core';
import { mirrorC } from './liquidez';
import { drawCandleRaw } from './velas';
/* =====================================================================
   MÓDULO 4 · SMT
   ===================================================================== */
const smt = { t: 'bull', rel: 'pos', seed: 31, d: null, k: 39 };
function genSMT(seed) {
  const r = mulberry32(seed), per = 6;
  const A = [[0, .9], [6, .55], [10, .7], [16, .25], [21, .55], [27, .12], [29, .3], [33, .65], [40, .95]];
  const B = [[0, .88], [6, .57], [10, .68], [16, .24], [21, .54], [27, .36], [29, .42], [33, .66], [40, .93]];
  const mk = w => candlesFromPath(bridgePath(w.map(([b, p]) => ({ t: b * per, p })), r, 0.012), per);
  const a = mk(A), b = mk(B);
  const lw = (cs, x, y) => argExt(cs.map(c => c.l), x, y, 'min');
  const a1 = lw(a, 13, 19), a2 = lw(a, 24, 30), b1 = lw(b, 13, 19), b2 = lw(b, 24, 30);
  if (!(a[a2].l < a[a1].l - 0.04 && b[b2].l > b[b1].l + 0.04)) return null;
  return { a, b, a1, a2, b1, b2 };
}
function buildSMT() { for (let i = 0; i < 60; i++) { const d = genSMT(smt.seed); if (d) { smt.d = d; return; } smt.seed = newSeed(); } }
const renderSMT = fig(function () {
  const host = $('#fig-smt'); if (!host || !smt.d) return;
  const d = smt.d, bull = smt.t === 'bull', inv = smt.rel === 'inv', k = smt.k;
  const fA = c => bull ? c : mirrorC(c, 0.5);
  const mapA = v => 1.08 + v * 0.006;
  const mapB = inv ? (v => 104.5 - v * 0.6) : (v => 1.265 + v * 0.008);
  const conv = (c, f) => { const lo = f(c.l), hi = f(c.h); return { o: f(c.o), c: f(c.c), h: Math.max(lo, hi), l: Math.min(lo, hi) }; };
  const A = d.a.map(c => conv(fA(c), mapA)), B = d.b.map(c => conv(fA(c), mapB));
  const nameA = 'EUR/USD', nameB = inv ? 'DXY (índice dólar)' : 'GBP/USD';
  const [la, ha] = extent(A), [lb, hb] = extent(B);
  const C = chart(host, { n: 40, panels: [{ h: 210, yMin: la, yMax: ha, dec: 4, title: nameA }, { h: 210, yMin: lb, yMax: hb, dec: inv ? 2 : 4, title: nameB }], aria: 'Divergencia SMT' });
  const [PA, PB] = C.panels;
  drawCandles(C, PA, A.map((c, j) => j <= k ? c : null));
  drawCandles(C, PB, B.map((c, j) => j <= k ? c : null));
  // extremos: en A siempre el extremo "barrido"; en B depende de la correlación
  const aExt = c => bull ? c.l : c.h;
  const bLow = (bull !== inv); // ¿en B miramos mínimos?
  const bExt = c => bLow ? c.l : c.h;
  const done1 = k >= Math.max(d.a1, d.b1) + 2, done2 = k >= Math.max(d.a2, d.b2) + 2;
  if (done1) {
    hline(C, PA, aExt(A[d.a1]), { x1: d.a1, x2: done2 ? d.a2 + 2 : k, color: COL.liq, width: 1.2, dash: '4 3' });
    hline(C, PB, bExt(B[d.b1]), { x1: d.b1, x2: done2 ? d.b2 + 2 : k, color: COL.liq, width: 1.2, dash: '4 3' });
    vline(C, d.a1, { color: COL.muted });
  }
  if (done2) {
    vline(C, d.a2, { color: COL.muted });
    seg(C, PA, d.a1, aExt(A[d.a1]), d.a2, aExt(A[d.a2]), { width: 2.5 });
    seg(C, PB, d.b1, bExt(B[d.b1]), d.b2, bExt(B[d.b2]), { width: 2.5 });
    [[PA, d.a1, aExt(A[d.a1])], [PA, d.a2, aExt(A[d.a2])], [PB, d.b1, bExt(B[d.b1])], [PB, d.b2, bExt(B[d.b2])]].forEach(([P, i, v]) => el('circle', { cx: C.x(i), cy: P.y(v), r: 4.5, fill: COL.div, stroke: COL.surface, 'stroke-width': 2 }, P.g.ann));
    const ta = bull ? 'Mínimo más bajo: barre la SSL' : 'Máximo más alto: barre la BSL';
    const tb = bLow ? (bull ? 'Mínimo más alto: NO confirma' : 'Mínimo más alto: NO confirma') : (bull ? 'Máximo más bajo: NO confirma' : 'Máximo más bajo: NO confirma');
    tag(PA.g.lab, C.x(d.a2) + 10, PA.y(aExt(A[d.a2])) + (bull ? 14 : -14), ta, COL.div, 'start');
    tag(PB.g.lab, C.x(d.b2) + 10, PB.y(bExt(B[d.b2])) + (bLow ? 14 : -14), tb, COL.div, 'start');
  }
  hover(C, j => j > k ? null : [['#', 'Vela ' + (j + 1)], [nameA + ' cierre', A[j].c.toFixed(5)], [nameB + ' cierre', B[j].c.toFixed(inv ? 2 : 5)]]);
  let t;
  if (!done2) t = `Ambos activos se mueven juntos${inv ? ' (en espejo: cuando el euro baja, el dólar sube)' : ''}. Observa el próximo ${bull ? 'mínimo' : 'máximo'} del EUR/USD.`;
  else if (!inv) t = bull
    ? '<strong>SMT alcista:</strong> el EUR/USD hizo un mínimo más bajo (barrió los stops bajo el mínimo anterior), pero el GBP/USD hizo un mínimo más alto. La caída no fue confirmada por el activo correlacionado → posible giro al alza, que aquí se cumple.'
    : '<strong>SMT bajista:</strong> el EUR/USD hizo un máximo más alto (barrió los buy stops), pero el GBP/USD hizo un máximo más bajo. La subida no fue confirmada → posible giro a la baja.';
  else t = bull
    ? '<strong>SMT alcista con correlación inversa:</strong> el EUR/USD hizo un mínimo más bajo, pero el DXY <em>no</em> hizo un máximo más alto (hizo uno más bajo). El dólar no confirmó la fuerza que "explicaría" la caída del euro → posible giro alcista en EUR/USD.'
    : '<strong>SMT bajista con correlación inversa:</strong> el EUR/USD hizo un máximo más alto, pero el DXY <em>no</em> hizo un mínimo más bajo. El dólar no confirmó la debilidad → posible giro bajista en EUR/USD.';
  $('#smt-explain').innerHTML = t;
});

/* --- SMT + CRT --- */
let smtcDir = 'bull';
const renderSMTCRT = fig(function () {
  const host = $('#fig-smt-crt'); if (!host) return;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 900 300', role: 'img', 'aria-label': 'CRT en dos activos con divergencia SMT' });
  host.insertBefore(svg, host.firstChild);
  const bull = smtcDir === 'bull', F = v => bull ? v : 100 - v, y = v => 268 - F(v) * 2.4;
  const sets = [
    { name: 'EUR/USD', x0: 40, cs: [[70, 90, 30, 45], [45, 55, 15, 50], [50, 96, 46, 92]], swept: true },
    { name: 'GBP/USD', x0: 480, cs: [[68, 88, 32, 47], [47, 56, 38, 52], [52, 94, 49, 90]], swept: false }
  ];
  sets.forEach(s => {
    txt(svg, s.x0, 18, s.name + ' · 4H', { 'font-weight': 700, 'font-size': 13 });
    const [, h1, l1] = s.cs[0];
    [[h1, bull ? 'CRT High' : 'CRT Low'], [l1, bull ? 'CRT Low' : 'CRT High']].forEach(([v, lb]) => {
      el('line', { x1: s.x0, x2: s.x0 + 380, y1: y(v), y2: y(v), stroke: COL.range, 'stroke-dasharray': '6 4', 'stroke-width': 1.4 }, svg);
      tag(svg, s.x0 + 380, y(v) + (F(v) > 50 ? -12 : 12), lb, COL.range, 'end');
    });
    s.cs.forEach(([o, h, l, c], j) => { const oo = F(o), cc = F(c); drawCandleRaw(el('g', {}, svg), s.x0 + 60 + j * 110, 40, y(o), Math.min(y(h), y(l)), Math.max(y(h), y(l)), y(c), cc >= oo, { ww: 2 }); });
    const c2 = s.cs[1], ext = c2[2];
    tag(svg, s.x0 + 170, y(ext) + (bull ? 22 : -22), s.swept ? (bull ? 'Barre el CRT Low' : 'Barre el CRT High') : 'NO barre el extremo', s.swept ? COL.liq : COL.div, 'middle');
  });
  $('#smt-crt-explain').innerHTML = bull
    ? 'Vela 2: el EUR/USD barre su CRT Low y cierra dentro (CRT alcista), mientras el GBP/USD ni siquiera llega a su CRT Low (SMT alcista). Dos lecturas independientes coinciden: alta calidad. Objetivo: el CRT High del activo que operes.'
    : 'Vela 2: el EUR/USD barre su CRT High y cierra dentro (CRT bajista), mientras el GBP/USD no llega a su CRT High (SMT bajista). Objetivo: el CRT Low.';
});

function initSMT() {
  const pl = new Player(k => { smt.k = k; renderSMT(); }, 120);
  segBind($('#smt-que'), (key, v) => { smt[key] = v; pl.stop(); smt.k = 39; renderSMT(); });
  $('#smt-play').addEventListener('click', () => pl.play(39, 8));
  $('#smt-new').addEventListener('click', () => { smt.seed = newSeed(); buildSMT(); pl.play(39, 8); });
  buildSMT(); renderSMT();
  segBind($('#smt-crt'), (key, v) => { smtcDir = v; renderSMTCRT(); });
  renderSMTCRT();
  quiz($('#smt-quiz'), 'Práctica: SMT', QUIZZES["smt"].qs);
}

export { smt, genSMT, buildSMT, renderSMT, smtcDir, renderSMTCRT, initSMT };
