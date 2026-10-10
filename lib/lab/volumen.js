// Motor interactivo · volumen. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, bridgePath, candlesFromPath, chart, dataTable, drawCandles, el, extent, fig, fmt, hline, hover, lineSeries, mulberry32, newSeed, quiz, segBind } from './core';
/* =====================================================================
   MÓDULO 6 · VOLUMEN
   ===================================================================== */
const VOL_SC = {
  breakout: { w: [[0, 100], [5, 101.3], [10, 99.4], [16, 101.4], [22, 99.5], [28, 101.3], [34, 99.6], [40, 100.9], [42, 101.2], [44, 102.6], [48, 103.4], [52, 102.9], [58, 104.6], [64, 104.2], [70, 105.4]], m: k => k >= 42 && k <= 45 ? 3.2 : k > 45 && k <= 50 ? 1.6 : 1,
    t: 'La ruptura del rango llega con un volumen muy por encima de su media: mucha participación detrás del movimiento. El precio continúa.' },
  fake: { w: [[0, 100], [5, 101.3], [10, 99.4], [16, 101.4], [22, 99.5], [28, 101.3], [34, 99.6], [40, 100.9], [42, 101.2], [44, 102.0], [47, 101.0], [52, 99.6], [58, 98.6], [64, 99.0], [70, 98.2]], m: k => k >= 42 && k <= 44 ? 0.55 : k >= 46 && k <= 52 ? 1.5 : 1,
    t: 'El precio supera el máximo del rango, pero el volumen de la ruptura es <strong>bajo</strong>: nadie la acompaña. Vuelve al rango y cae (fue un barrido de liquidez, no una ruptura real).' },
  climax: { w: [[0, 104], [10, 102.5], [20, 101.2], [30, 99.2], [38, 97.8], [44, 95.6], [46, 94.6], [47, 95.6], [50, 96.8], [56, 96.2], [62, 97.8], [70, 98.6]], m: k => k >= 45 && k <= 47 ? 4.5 : k >= 30 && k < 45 ? 1 + (k - 30) * 0.05 : k > 47 ? 1.2 : 1,
    t: 'Tras una caída larga aparece un <strong>pico de volumen extremo</strong> con mecha de rechazo: capitulación. Los últimos vendedores salen y los compradores absorben todo. Después, el precio gira.' },
  div: { w: [[0, 98], [10, 100], [14, 99.4], [24, 101.8], [28, 101.2], [38, 103.2], [42, 102.7], [52, 104.1], [56, 103.8], [60, 104.4], [64, 102.6], [70, 101.4]], m: k => k <= 60 ? 1.8 - 1.2 * k / 60 : 1.6,
    t: 'Cada nuevo máximo llega con <strong>menos volumen</strong>: la participación se agota (divergencia de volumen). El OBV deja de acompañar y la subida termina cediendo.' }
};
const vol = { sc: 'breakout', seed: 19, cs: null, v: null };
function buildVol() {
  const r = mulberry32(vol.seed), S = VOL_SC[vol.sc], per = 6;
  const cs = candlesFromPath(bridgePath(S.w.map(([b, p]) => ({ t: b * per, p })), r, 0.11), per);
  const ab = cs.reduce((s, c) => s + Math.abs(c.c - c.o), 0) / cs.length;
  vol.cs = cs; vol.v = cs.map((c, k) => 1000 * (0.7 + 0.6 * r()) * (1 + 1.2 * Math.abs(c.c - c.o) / ab) * S.m(k));
}
function volumeProfile(cs, v, bins, pct) {
  const lo = Math.min(...cs.map(c => c.l)), hi = Math.max(...cs.map(c => c.h)), step = (hi - lo) / bins, bv = Array(bins).fill(0);
  cs.forEach((c, k) => {
    const span = Math.max(c.h - c.l, 1e-9);
    for (let b = 0; b < bins; b++) { const a = lo + b * step, e = a + step, ov = Math.min(e, c.h) - Math.max(a, c.l); if (ov > 0) bv[b] += v[k] * ov / span; }
  });
  const tot = bv.reduce((s, x) => s + x, 0), poc = bv.indexOf(Math.max(...bv));
  let a = poc, b = poc, acc = bv[poc];
  while (acc < tot * pct / 100 && (a > 0 || b < bins - 1)) {
    const up = b + 1 < bins ? bv[b + 1] : -1, dn = a - 1 >= 0 ? bv[a - 1] : -1;
    if (up >= dn) { b++; acc += up; } else { a--; acc += dn; }
  }
  return { lo, step, bv, poc, vaLo: a, vaHi: b, pocP: lo + (poc + 0.5) * step, val: lo + a * step, vah: lo + (b + 1) * step };
}
const renderVol = fig(function () {
  const host = $('#fig-vol'); if (!host) return;
  if (!vol.cs) buildVol();
  const cs = vol.cs, v = vol.v, n = cs.length, on = new Set($$('.vl').filter(c => c.checked).map(c => c.value)), pct = +$('#vl-va').value;
  $('#vl-va-v').textContent = pct + '%';
  const ma = v.map((_, i) => i < 19 ? null : v.slice(i - 19, i + 1).reduce((s, x) => s + x, 0) / 20);
  const obv = [0]; for (let i = 1; i < n; i++) obv.push(obv[i - 1] + (cs[i].c > cs[i - 1].c ? v[i] : cs[i].c < cs[i - 1].c ? -v[i] : 0));
  let sPV = 0, sV = 0, sP2V = 0; const vw = [], vu = [], vd = [];
  cs.forEach((c, i) => { const tp = (c.h + c.l + c.c) / 3; sPV += tp * v[i]; sV += v[i]; sP2V += tp * tp * v[i]; const m = sPV / sV, sd = Math.sqrt(Math.max(0, sP2V / sV - m * m)); vw.push(m); vu.push(m + sd); vd.push(m - sd); });
  const [lo, hi] = extent(cs), vmax = Math.max(...v) * 1.1;
  const panels = [{ h: 270, yMin: lo, yMax: hi, dec: 0, title: 'Precio' }, { h: 110, yMin: 0, yMax: vmax, ticks: 3, fmt: x => (x / 1000).toFixed(1) + 'k', title: 'Volumen' }];
  if (on.has('obv')) { const a = Math.min(...obv), b = Math.max(...obv), pd = (b - a) * 0.1 || 1; panels.push({ h: 100, yMin: a - pd, yMax: b + pd, ticks: 3, fmt: x => (x / 1000).toFixed(0) + 'k', title: 'OBV' }); }
  const C = chart(host, { n, panels, aria: 'Precio y volumen' });
  const [P1, P2, P3] = C.panels;
  if (on.has('vp')) {
    const vp = volumeProfile(cs, v, 28, pct), mx = Math.max(...vp.bv), x0 = C.padL + C.iw;
    vp.bv.forEach((bv, b) => {
      const w = bv / mx * 190, y1 = P1.y(vp.lo + (b + 1) * vp.step), y2 = P1.y(vp.lo + b * vp.step), inVA = b >= vp.vaLo && b <= vp.vaHi;
      el('rect', { x: x0 - w, y: y1 + 0.5, width: w, height: Math.max(1, y2 - y1 - 1), fill: b === vp.poc ? COL.liq : COL.text2, 'fill-opacity': b === vp.poc ? 0.7 : inVA ? 0.3 : 0.12 }, P1.g.zone);
    });
    hline(C, P1, vp.pocP, { color: COL.liq, width: 1.5, dash: false, label: 'POC', side: 'left' });
    hline(C, P1, vp.vah, { color: COL.text2, width: 1, dash: '4 3', label: 'VAH', side: 'left' });
    hline(C, P1, vp.val, { color: COL.text2, width: 1, dash: '4 3', label: 'VAL', side: 'left', below: true });
  }
  drawCandles(C, P1, cs);
  if (on.has('vwap')) {
    lineSeries(C, P1, vw, { color: COL.range, width: 2 });
    [vu, vd].forEach(s => lineSeries(C, P1, s, { color: COL.range, width: 1 }).setAttribute('stroke-dasharray', '4 4'));
  }
  cs.forEach((c, i) => {
    const big = ma[i] && v[i] > 1.5 * ma[i];
    el('rect', { x: C.x(i) - C.bw / 2, y: P2.y(v[i]), width: C.bw, height: Math.max(1, P2.y(0) - P2.y(v[i])), fill: c.c >= c.o ? COL.up : COL.down, 'fill-opacity': big ? 0.95 : 0.45 }, P2.g.data);
  });
  if (on.has('ma')) lineSeries(C, P2, ma, { color: COL.text2, width: 1.5 });
  if (P3) lineSeries(C, P3, obv, { color: COL.range, width: 2 });
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)], ['Volumen', Math.round(v[i]).toLocaleString('es')], ['Media 20', ma[i] ? Math.round(ma[i]).toLocaleString('es') : '—'], ['OBV', Math.round(obv[i]).toLocaleString('es')], ['VWAP', fmt(vw[i])]]);
  const peak = v.indexOf(Math.max(...v));
  $('#vol-explain').innerHTML = VOL_SC[vol.sc].t + ` <span style="color:var(--muted)">Barras opacas = volumen mayor que 1,5 × su media. Mayor volumen del gráfico: vela ${peak + 1} (${ma[peak] ? (v[peak] / ma[peak]).toFixed(1) + ' × la media' : '—'}).</span>`;
  dataTable($('#vol-data'), ['Vela', 'Cierre', 'Volumen', 'Media 20', 'OBV', 'VWAP'], cs.map((c, i) => [String(i + 1), fmt(c.c), Math.round(v[i]).toLocaleString('es'), ma[i] ? Math.round(ma[i]).toLocaleString('es') : '—', Math.round(obv[i]).toLocaleString('es'), fmt(vw[i])]));
});
function initVolumen() {
  segBind($('#vol-lab'), (k, x) => { vol.sc = x; buildVol(); renderVol(); });
  $$('.vl').forEach(c => c.addEventListener('change', renderVol));
  $('#vl-va').addEventListener('input', renderVol);
  $('#vl-new').addEventListener('click', () => { vol.seed = newSeed(); buildVol(); renderVol(); });
  renderVol();
  quiz($('#volumen-quiz'), 'Práctica: volumen', QUIZZES["volumen"].qs);
}

export { VOL_SC, vol, buildVol, volumeProfile, renderVol, initVolumen };
