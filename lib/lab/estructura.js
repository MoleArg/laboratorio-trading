// Motor interactivo · estructura. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, aggregate, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, gauss, hline, hover, mulberry32, newSeed, ohlcRows, pivots, quiz, segBind, txt, vband } from './core';
/* =====================================================================
   MÓDULO 3 · ESTRUCTURA DE MERCADO
   ===================================================================== */
function marketStructure(cs, N) {
  const H = cs.map(c => c.h), L = cs.map(c => c.l);
  const raw = pivots(H, 'high', N, N).map(i => ({ i, type: 'H', p: H[i] })).concat(pivots(L, 'low', N, N).map(i => ({ i, type: 'L', p: L[i] })))
    .sort((a, b) => a.i - b.i || (a.type === 'H' ? -1 : 1));
  const sw = [];
  raw.forEach(s => {
    const last = sw[sw.length - 1];
    if (last && last.type === s.type) { if ((s.type === 'H' && s.p > last.p) || (s.type === 'L' && s.p < last.p)) sw[sw.length - 1] = s; }
    else sw.push(s);
  });
  let pH = null, pL = null;
  sw.forEach(s => {
    if (s.type === 'H') { s.lab = pH ? (s.p > pH.p ? 'HH' : 'LH') : 'H'; pH = s; }
    else { s.lab = pL ? (s.p > pL.p ? 'HL' : 'LL') : 'L'; pL = s; }
  });
  const ev = [], trendAt = Array(cs.length).fill(null);
  let trend = null, refH = null, refL = null;
  for (let t = 0; t < cs.length; t++) {
    sw.forEach(s => { if (s.i + N === t) { if (s.type === 'H') refH = s; else refL = s; } });
    if (refH && !refH.broken && t > refH.i && cs[t].c > refH.p) { ev.push({ t, s: refH, kind: trend === 'down' ? 'CHoCH' : 'BOS', dir: 'up' }); refH.broken = true; trend = 'up'; }
    if (refL && !refL.broken && t > refL.i && cs[t].c < refL.p) { ev.push({ t, s: refL, kind: trend === 'up' ? 'CHoCH' : 'BOS', dir: 'down' }); refL.broken = true; trend = 'down'; }
    trendAt[t] = trend;
  }
  let strong = null, weak = null;
  const lastEv = ev[ev.length - 1];
  if (lastEv) {
    const up = lastEv.dir === 'up', a = lastEv.s.i, b = lastEv.t;
    const si = argExt(up ? L : H, a, b, up ? 'min' : 'max');
    strong = { i: si, p: up ? L[si] : H[si], up };
    const wi = argExt(up ? H : L, b, cs.length - 1, up ? 'max' : 'min');
    weak = { i: wi, p: up ? H[wi] : L[wi], up };
  }
  return { sw, ev, trendAt, trend, strong, weak };
}
const est = { seed: 41, base: null, tf: 1, N: 3 };
function buildEst() {
  const r = mulberry32(est.seed), per = 5;
  const W = [[0, 100], [6, 104], [10, 102], [17, 107], [21, 105], [28, 110], [32, 108.2], [36, 109.4], [41, 104.5], [45, 106.5], [51, 101.5], [55, 103.5], [61, 98.5], [65, 101], [69, 99.5], [74, 104.5], [78, 102.5], [84, 107], [90, 106]];
  est.base = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p: p + gauss(r) * 0.35 })), r, 0.22), per);
}
const renderEst = fig(function () {
  const host = $('#fig-est'); if (!host) return;
  if (!est.base) buildEst();
  const cs = est.tf === 1 ? est.base : aggregate(est.base, est.tf), n = cs.length, N = est.N;
  const S = marketStructure(cs, N), on = new Set($$('.est-l').filter(c => c.checked).map(c => c.value));
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 340, yMin: lo, yMax: hi, dec: 0 }], aria: 'Estructura de mercado' });
  const P = C.panels[0];
  if (on.has('bg')) {
    let a = 0;
    for (let t = 1; t <= n; t++) {
      if (t === n || S.trendAt[t] !== S.trendAt[a]) {
        if (S.trendAt[a]) vband(C, a, t - 1, { color: S.trendAt[a] === 'up' ? COL.up : COL.down, op: 0.07 });
        a = t;
      }
    }
  }
  drawCandles(C, P, cs);
  const off = (hi - lo) * 0.045;
  S.sw.forEach(s => {
    el('circle', { cx: C.x(s.i), cy: P.y(s.p), r: 3.5, fill: COL.text, stroke: COL.surface, 'stroke-width': 1.5 }, P.g.ann);
    if (on.has('lab')) txt(P.g.lab, C.x(s.i), P.y(s.type === 'H' ? s.p + off : s.p - off) + (s.type === 'H' ? 0 : 9), s.lab, { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: COL.text2 });
  });
  if (on.has('bos')) S.ev.forEach(e => {
    const col = e.kind === 'CHoCH' ? COL.liq : COL.text2;
    hline(C, P, e.s.p, { x1: e.s.i, x2: e.t, color: col, width: 1.4, dash: '4 3' });
    txt(P.g.lab, (C.x(e.s.i) + C.x(e.t)) / 2, P.y(e.s.p) + (e.dir === 'up' ? -5 : 13), e.kind, { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: COL.text });
  });
  if (on.has('sw') && S.strong) {
    const up = S.strong.up;
    hline(C, P, S.strong.p, { x1: S.strong.i, color: COL.range, width: 1.6, dash: '6 3', label: up ? 'Mínimo fuerte' : 'Máximo fuerte', side: 'right', below: up });
    hline(C, P, S.weak.p, { x1: S.weak.i, color: COL.liq, width: 1.6, dash: '6 3', label: up ? 'Máximo débil (BSL)' : 'Mínimo débil (SSL)', side: 'right', below: !up });
  }
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Tendencia', S.trendAt[i] === 'up' ? 'alcista' : S.trendAt[i] === 'down' ? 'bajista' : '—']].concat(ohlcRows(cs[i], 2)));
  const nb = S.ev.filter(e => e.kind === 'BOS').length, nc = S.ev.filter(e => e.kind === 'CHoCH').length, last = S.ev[S.ev.length - 1];
  $('#est-stats').innerHTML = [['Swings detectados', S.sw.length], ['BOS', nb], ['CHoCH', nc], ['Tendencia actual', S.trend === 'up' ? 'Alcista' : S.trend === 'down' ? 'Bajista' : '—']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#est-explain').innerHTML = `Con N = ${N}${est.tf > 1 ? ' en la temporalidad mayor' : ''} se ven ${S.sw.length} puntos de giro. ` +
    (last ? `Último evento: <strong>${last.kind} ${last.dir === 'up' ? 'alcista' : 'bajista'}</strong> en la vela ${last.t + 1} (cierre ${last.dir === 'up' ? 'por encima del máximo' : 'por debajo del mínimo'} de la vela ${last.s.i + 1}). ` : '') +
    (est.tf > 1 ? 'En la temporalidad mayor desaparece el "ruido": muchos CHoCH de la base eran solo retrocesos.' : 'Sube N o cambia a la temporalidad mayor para ver solo la estructura principal.');
});
function initEstructura() {
  $('#est-n').addEventListener('input', e => { est.N = +e.target.value; $('#est-n-v').textContent = est.N; renderEst(); });
  segBind($('#est-lab'), (k, v) => { est.tf = +v; renderEst(); });
  $$('.est-l').forEach(c => c.addEventListener('change', renderEst));
  $('#est-new').addEventListener('click', () => { est.seed = newSeed(); buildEst(); renderEst(); });
  renderEst();
  quiz($('#estructura-quiz'), 'Práctica: estructura de mercado', QUIZZES["estructura"].qs);
}

export { marketStructure, est, buildEst, renderEst, initEstructura };
