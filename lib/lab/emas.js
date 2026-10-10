// Motor interactivo · emas. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, fmt, gauss, hover, lineSeries, marker, mulberry32, newSeed, quiz, segBind, tag, txt } from './core';
/* =====================================================================
   MÓDULO 7 · MEDIAS MÓVILES
   ===================================================================== */
function smaArr(v, n) {
  const out = Array(v.length).fill(null); let s = 0, cnt = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] == null) { s = 0; cnt = 0; continue; }
    s += v[i]; cnt++;
    if (cnt > n) { s -= v[i - n]; cnt = n; }
    if (cnt === n) out[i] = s / n;
  }
  return out;
}
function emaArr(v, n) {
  const out = Array(v.length).fill(null), a = 2 / (n + 1);
  let st = v.findIndex(x => x != null); if (st < 0 || st + n > v.length) return out;
  let e = 0; for (let i = st; i < st + n; i++) e += v[i]; e /= n; out[st + n - 1] = e;
  for (let i = st + n; i < v.length; i++) { if (v[i] == null) continue; e = a * v[i] + (1 - a) * e; out[i] = e; }
  return out;
}
const renderEmaW = fig(function () {
  const host = $('#fig-ema-w'); if (!host) return;
  const N = +$('#ew-n').value, a = 2 / (N + 1), K = 30;
  $('#ew-n-v').textContent = N;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const W = 900, H = 230, L = 50, R = 20, T = 14, B = 34, svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Pesos de SMA y EMA' });
  host.insertBefore(svg, host.firstChild);
  const mx = Math.max(a, 1 / N) * 1.12, step = (W - L - R) / K, y = w => T + (1 - w / mx) * (H - T - B);
  for (let q = 0; q <= 4; q++) { const w = mx * q / 4, yy = y(w); el('line', { x1: L, x2: W - R, y1: yy, y2: yy, stroke: COL.grid }, svg); txt(svg, L - 6, yy + 4, (w * 100).toFixed(1) + '%', { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10 }); }
  for (let k = 0; k < K; k++) {
    const x = W - R - (k + 0.5) * step, ws = k < N ? 1 / N : 0, we = a * Math.pow(1 - a, k), bw = Math.min(10, step * 0.36);
    if (ws) el('rect', { x: x - bw - 1, y: y(ws), width: bw, height: y(0) - y(ws), rx: 2, fill: COL.text2, 'fill-opacity': 0.7 }, svg);
    el('rect', { x: x + 1, y: y(we), width: bw, height: Math.max(0.5, y(0) - y(we)), rx: 2, fill: COL.range }, svg);
    if (k % 5 === 0) txt(svg, x, H - 16, k === 0 ? 'actual' : k + ' atrás', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10 });
  }
  txt(svg, (W + L) / 2, H - 2, '← velas más antiguas · · · velas más recientes →', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10.5 });
  const half = Math.ceil(Math.log(0.5) / Math.log(1 - a));
  $('#ew-explain').innerHTML = `Con N = ${N}: α = 2/(${N}+1) = ${a.toFixed(3)}. La vela actual pesa <strong>${(a * 100).toFixed(1)}%</strong> en la EMA y <strong>${(100 / N).toFixed(1)}%</strong> en la SMA. La mitad del peso total de la EMA está en las últimas <strong>${half}</strong> velas; la SMA, en cambio, ignora por completo la vela ${N + 1}.`;
});

const ELS = {
  trend: [[0, 100], [8, 103], [12, 101.8], [22, 106], [26, 104.6], [36, 109], [40, 107.6], [50, 112], [54, 110.6], [64, 115], [68, 113.8], [78, 117.5], [82, 116.4], [92, 120], [100, 121]],
  range: [[0, 100], [7, 103], [14, 98], [21, 102.5], [28, 97.6], [35, 102.8], [42, 98.2], [49, 102.2], [56, 97.8], [63, 102.6], [70, 98.4], [77, 102], [84, 98.6], [91, 101.6], [100, 100]],
  rev: [[0, 100], [10, 104], [14, 103], [24, 108], [28, 106.8], [38, 111], [44, 109.5], [48, 110.6], [56, 105.5], [60, 107], [70, 102], [74, 103.4], [84, 98.5], [88, 99.8], [100, 95]]
};
const emaL = { sc: 'trend', ty: 'ema', seed: 9, cs: null, W: 60, n: { f: 9, s: 21, l: 50 } };
function buildEmaL() {
  const r = mulberry32(emaL.seed), per = 6, W = emaL.W, wps = [{ t: 0, p: 100 }];
  let p = 100; for (let b = 12; b < W; b += 12) { p += gauss(r) * 1; wps.push({ t: b * per, p }); }
  ELS[emaL.sc].forEach(([b, pr]) => wps.push({ t: (W + b) * per, p: pr }));
  emaL.cs = candlesFromPath(bridgePath(wps, r, 0.16), per);
}
const EL_COL = () => ({ f: COL.liq, s: COL.range, l: COL.fvg });
const renderEmaL = fig(function () {
  const host = $('#fig-ema-lab'); if (!host) return;
  if (!emaL.cs) buildEmaL();
  const W = emaL.W, all = emaL.cs, cl = all.map(c => c.c), cs = all.slice(W), n = cs.length, f = emaL.ty === 'ema' ? emaArr : smaArr, cols = EL_COL();
  const on = Object.fromEntries($$('.el-on').map(c => [c.dataset.k, c.checked]));
  const ma = {}; ['f', 's', 'l'].forEach(k => { ma[k] = f(cl, emaL.n[k]).slice(W); });
  const [lo, hi] = extent(cs, [].concat(...['f', 's', 'l'].filter(k => on[k]).map(k => ma[k].filter(x => x != null))));
  const C = chart(host, { n: n + 6, panels: [{ h: 330, yMin: lo, yMax: hi, dec: 0 }], aria: 'Precio y medias móviles' });
  const P = C.panels[0];
  drawCandles(C, P, cs);
  const nm = emaL.ty.toUpperCase();
  ['l', 's', 'f'].forEach(k => {
    if (!on[k]) return;
    lineSeries(C, P, ma[k], { color: cols[k], width: 2 });
    const last = ma[k][n - 1]; if (last != null) tag(P.g.lab, C.x(n - 1) + 8, P.y(last), nm + ' ' + emaL.n[k], cols[k], 'start');
  });
  let cross = 0, firstDeath = -1;
  if (on.f && on.s) for (let i = 1; i < n; i++) {
    const a0 = ma.f[i - 1], b0 = ma.s[i - 1], a1 = ma.f[i], b1 = ma.s[i];
    if ([a0, b0, a1, b1].some(x => x == null)) continue;
    if (a0 <= b0 && a1 > b1) { cross++; marker(C, P, i, cs[i].l - (hi - lo) * 0.04, { shape: 'up', color: COL.up, size: 5 }); }
    if (a0 >= b0 && a1 < b1) { cross++; if (firstDeath < 0 && i > 40) firstDeath = i; marker(C, P, i, cs[i].h + (hi - lo) * 0.04, { shape: 'down', color: COL.down, size: 5 }); }
  }
  hover(C, i => i >= n ? null : [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)]].concat(['f', 's', 'l'].filter(k => on[k]).map(k => [nm + ' ' + emaL.n[k], fmt(ma[k][i])])));
  $('#el-legend').innerHTML = ['f', 's', 'l'].filter(k => on[k]).map(k => `<span><i style="background:${cols[k]}"></i>${nm} ${emaL.n[k]}</span>`).join('') + '<span>▲▼ Cruce de la rápida sobre / bajo la lenta</span>';
  const above = on.l ? cs.filter((c, i) => ma.l[i] != null && c.c > ma.l[i]).length : null;
  $('#el-stats').innerHTML = [['Cruces rápida / lenta', on.f && on.s ? cross : '—'], ['Velas sobre la media larga', above != null ? Math.round(above / n * 100) + '%' : '—']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const top = argExt(cs.map(c => c.h), 30, 60, 'max');
  const T = {
    trend: 'En tendencia, el precio vive por encima de las medias, éstas apuntan hacia arriba y los retrocesos se frenan cerca de la media lenta: soporte dinámico. Hay pocos cruces.',
    range: `En lateral las medias se aplanan y se entrelazan: <strong>${cross} cruces</strong>, casi todos "latigazos". Aquí las medias no aportan dirección.`,
    rev: `En el giro, las medias tardan en reaccionar: el máximo llega en la vela ${top + 1}${firstDeath > 0 ? ` y el cruce bajista en la vela ${firstDeath + 1} (${firstDeath - top} velas después)` : ''}. Cambia entre EMA y SMA: la EMA cruza antes porque pesa más lo reciente.`
  };
  $('#el-explain').innerHTML = T[emaL.sc];
});
function initEMAs() {
  $('#ew-n').addEventListener('input', renderEmaW); renderEmaW();
  segBind($('#ema-lab'), (k, v) => { if (k === 'sc') { emaL.sc = v; buildEmaL(); } else emaL.ty = v; renderEmaL(); });
  $$('.el-n').forEach(s => s.addEventListener('input', () => { emaL.n[s.dataset.k] = +s.value; $('#el-' + s.dataset.k + '-v').textContent = s.value; renderEmaL(); }));
  $$('.el-on').forEach(c => c.addEventListener('change', renderEmaL));
  $('#el-new').addEventListener('click', () => { emaL.seed = newSeed(); buildEmaL(); renderEmaL(); });
  renderEmaL();
  quiz($('#emas-quiz'), 'Práctica: medias móviles', QUIZZES["emas"].qs);
}

export { smaArr, emaArr, renderEmaW, ELS, emaL, buildEmaL, EL_COL, renderEmaL, initEMAs };
