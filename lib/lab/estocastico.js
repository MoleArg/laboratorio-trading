// Motor interactivo · estocastico. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, chart, drawCandles, el, extent, fig, fmt, hline, hover, lineSeries, marker, newSeed, quiz, rsiCalc, seg, segBind, tag, txt, zone } from './core';
import { smaArr } from './emas';
import { toC } from './liquidez';
import { LAB_W, detectDivs, genLab } from './rsi';
/* =====================================================================
   MÓDULO 9 · ESTOCÁSTICO
   ===================================================================== */
function stochCalc(cs, n, sk, d) {
  const raw = cs.map((c, i) => {
    if (i < n - 1) return null;
    let hh = -Infinity, ll = Infinity;
    for (let j = i - n + 1; j <= i; j++) { hh = Math.max(hh, cs[j].h); ll = Math.min(ll, cs[j].l); }
    return hh === ll ? 50 : 100 * (c.c - ll) / (hh - ll);
  });
  const K = sk > 1 ? smaArr(raw, sk) : raw;
  return { raw, K, D: smaArr(K, d) };
}
const SB_BASE = [[100, 101.2, 99.4, 100.9], [100.9, 102.3, 100.6, 102.0], [102.0, 102.6, 100.8, 101.1], [101.1, 101.4, 99.2, 99.6], [99.6, 100.1, 98.0, 98.4], [98.4, 99.6, 98.2, 99.3], [99.3, 100.8, 99.1, 100.6], [100.6, 102.0, 100.3, 101.7], [101.7, 104.0, 101.5, 103.6], [103.6, 103.8, 102.2, 102.5], [102.5, 102.9, 101.0, 101.3], [101.3, 101.8, 100.4, 101.5], [101.5, 102.4, 101.1, 102.0]].map(toC);
const renderStoBox = fig(function () {
  const host = $('#fig-sto-box'); if (!host) return;
  const HH = 104.0, LL = 98.0, pos = +$('#sb-c').value / 100, o = 102.0, c = LL + pos * (HH - LL);
  const last = { o, c, h: Math.min(HH, Math.max(o, c) + 0.3), l: Math.max(LL, Math.min(o, c) - 0.3) };
  const cs = SB_BASE.concat([last]), K = 100 * (c - LL) / (HH - LL);
  const C = chart(host, { n: 17, panels: [{ h: 260, yMin: 97.2, yMax: 104.8, dec: 0 }], aria: 'Posición del cierre en el rango' });
  const P = C.panels[0];
  zone(C, P, LL, HH, { x1: 0, x2: 13, color: COL.range, op: 0.05 });
  hline(C, P, HH, { x1: 0, x2: 16, color: COL.range, label: 'Máximo de 14 velas', side: 'left' });
  hline(C, P, LL, { x1: 0, x2: 16, color: COL.range, label: 'Mínimo de 14 velas', side: 'left', below: true });
  drawCandles(C, P, cs);
  const gx = C.x(15.5);
  el('rect', { x: gx - 9, y: P.y(HH), width: 18, height: P.y(LL) - P.y(HH), rx: 4, fill: COL.surface3, stroke: COL.axis }, P.g.ann);
  el('rect', { x: gx - 9, y: P.y(c), width: 18, height: P.y(LL) - P.y(c), rx: 4, fill: COL.range, 'fill-opacity': 0.7 }, P.g.ann);
  el('line', { x1: C.x(13), x2: gx - 10, y1: P.y(c), y2: P.y(c), stroke: COL.text, 'stroke-dasharray': '3 3' }, P.g.ann);
  tag(P.g.lab, gx, P.y(c) - 14, '%K ' + K.toFixed(0), COL.range, 'middle');
  $('#sb-explain').innerHTML = `El cierre (${c.toFixed(2)}) está al <strong>${K.toFixed(0)}%</strong> del recorrido entre el mínimo (${LL.toFixed(2)}) y el máximo (${HH.toFixed(2)}) de las últimas 14 velas → <strong>%K = ${K.toFixed(0)}</strong>. ` +
    (K >= 80 ? 'Zona de sobrecompra (≥ 80): cierre en la parte alta del rango.' : K <= 20 ? 'Zona de sobreventa (≤ 20): cierre en la parte baja del rango.' : 'Zona media.');
});

const sto = { sc: 'range', seed: 15, cs: null, n: 14, k: 3, d: 3 };
function buildSto() {
  for (let t = 0; t < 40; t++) {
    const cs = genLab(sto.sc, sto.seed);
    if (sto.sc !== 'bear' && sto.sc !== 'bull') { sto.cs = cs; return; }
    const r = rsiCalc(cs.map(c => c.c), 14).rsi;
    if (detectDivs(cs, r, LAB_W).some(dv => dv.type === sto.sc && dv.b >= LAB_W + 40)) { sto.cs = cs; return; }
    sto.seed = newSeed();
  }
  sto.cs = genLab(sto.sc, sto.seed);
}
const renderStoL = fig(function () {
  const host = $('#fig-sto-lab'); if (!host) return;
  if (!sto.cs) buildSto();
  ['n', 'k', 'd'].forEach(x => { $('#sl-' + x).value = sto[x]; $('#sl-' + x + '-v').textContent = sto[x]; });
  const W = LAB_W, all = sto.cs, S = stochCalc(all, sto.n, sto.k, sto.d), cs = all.slice(W), K = S.K.slice(W), D = S.D.slice(W), n = cs.length;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 240, yMin: lo, yMax: hi, dec: 0, title: 'Precio (simulado)' }, { h: 150, yMin: 0, yMax: 100, grid: false, title: `Estocástico ${sto.n}, ${sto.k}, ${sto.d}` }], aria: 'Precio y estocástico' });
  const [P1, P2] = C.panels;
  zone(C, P2, 80, 100, { color: COL.down, op: 0.08, stroke: false });
  zone(C, P2, 0, 20, { color: COL.up, op: 0.08, stroke: false });
  [80, 50, 20].forEach(v => { hline(C, P2, v, { color: COL.muted, width: 1, dash: v === 50 ? '2 4' : '5 4' }); txt(P2.g.lab, C.w - C.padR + 6, P2.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }); });
  drawCandles(C, P1, cs);
  lineSeries(C, P2, K, { color: COL.range, width: 2 });
  if (sto.d > 1 || sto.k > 1) lineSeries(C, P2, D, { color: COL.liq, width: 1.6 });
  let sig = 0, ob = 0, os = 0;
  for (let i = 1; i < n; i++) {
    const k0 = K[i - 1], d0 = D[i - 1], k1 = K[i], d1 = D[i];
    if (k1 != null) { if (k1 >= 80) ob++; if (k1 <= 20) os++; }
    if ([k0, d0, k1, d1].some(x => x == null)) continue;
    if (k0 <= d0 && k1 > d1 && Math.min(k0, k1) < 20) { sig++; marker(C, P2, i, k1, { shape: 'up', color: COL.up, size: 5 }); }
    if (k0 >= d0 && k1 < d1 && Math.max(k0, k1) > 80) { sig++; marker(C, P2, i, k1, { shape: 'down', color: COL.down, size: 5 }); }
  }
  const divs = detectDivs(all, S.K, W).slice(-2);
  divs.forEach(dv => {
    const a = dv.a - W, b = dv.b - W, ya = dv.type === 'bear' ? cs[a].h : cs[a].l, yb = dv.type === 'bear' ? cs[b].h : cs[b].l;
    seg(C, P1, a, ya, b, yb, { width: 2 }); seg(C, P2, a, K[a], b, K[b], { width: 2 });
  });
  hover(C, i => {
    let hh = -Infinity, ll = Infinity; const gi = i + W;
    for (let j = Math.max(0, gi - sto.n + 1); j <= gi; j++) { hh = Math.max(hh, all[j].h); ll = Math.min(ll, all[j].l); }
    return [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)], ['Máx. ' + sto.n, fmt(hh)], ['Mín. ' + sto.n, fmt(ll)], ['%K', fmt(K[i], 1)], ['%D', fmt(D[i], 1)]];
  });
  $('#sl-stats').innerHTML = [['Tiempo sobre 80', Math.round(ob / n * 100) + '%'], ['Tiempo bajo 20', Math.round(os / n * 100) + '%'], ['Cruces en zona extrema', sig], ['Divergencias', divs.length]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const T = {
    range: 'En lateral, los cruces de %K y %D en las zonas extremas coinciden con los giros del rango: es el entorno ideal del estocástico.',
    up: 'En tendencia alcista el %K se queda "pegado" sobre 80 durante muchas velas y las señales ▼ fallan: es fuerza, no agotamiento. Usa los retrocesos a la zona de 20 a favor de la tendencia.',
    bear: 'El precio marca un máximo más alto, pero el estocástico no lo confirma: divergencia bajista y posterior caída.',
    bull: 'El precio marca un mínimo más bajo, pero el estocástico hace un mínimo más alto: divergencia alcista y posterior subida.'
  };
  $('#sl-explain').innerHTML = T[sto.sc] + (sto.k === 1 ? ' <em>Con suavizado 1 (rápido) la línea es mucho más nerviosa: compara con 14,3,3.</em>' : '');
});
function initEstocastico() {
  $('#sb-c').addEventListener('input', renderStoBox); renderStoBox();
  segBind($('#sto-lab'), (k, v) => { sto.sc = v; sto.seed = 15 + v.length; buildSto(); renderStoL(); });
  ['n', 'k', 'd'].forEach(x => $('#sl-' + x).addEventListener('input', e => { sto[x] = +e.target.value; renderStoL(); }));
  $$('[data-sp]').forEach(b => b.addEventListener('click', () => { const [a, k, d] = b.dataset.sp.split(',').map(Number); sto.n = a; sto.k = k; sto.d = d; renderStoL(); }));
  $('#sl-new').addEventListener('click', () => { sto.seed = newSeed(); buildSto(); renderStoL(); });
  renderStoL();
  quiz($('#estocastico-quiz'), 'Práctica: estocástico', QUIZZES["estocastico"].qs);
}

export { stochCalc, SB_BASE, renderStoBox, sto, buildSto, renderStoL, initEstocastico };
