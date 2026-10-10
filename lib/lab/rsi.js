// Motor interactivo · rsi. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, Player, bridgePath, candlesFromPath, chart, clamp, dataTable, drawCandles, el, extent, fig, fmt, gauss, hline, hover, lineSeries, marker, mulberry32, newSeed, pivots, quiz, rsiCalc, seg, segBind, tag, txt, vline, zone } from './core';
/* =====================================================================
   MÓDULO 1 · RSI
   ===================================================================== */
const renderBalance = fig(function () {
  const host = $('#fig-balance'); if (!host) return;
  const gm = +$('#bal-g').value / 10, pm = +$('#bal-l').value / 10;
  $('#bal-g-v').textContent = gm.toFixed(1); $('#bal-l-v').textContent = pm.toFixed(1);
  const rsi = gm + pm === 0 ? 50 : 100 * gm / (gm + pm);
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 900 190', role: 'img', 'aria-label': 'Balanza del RSI' });
  host.insertBefore(svg, host.firstChild);
  const X = v => 40 + v / 100 * 820;
  // barra de proporciones
  txt(svg, 40, 22, 'Proporción del movimiento reciente', { fill: COL.muted, 'font-size': 12 });
  const share = gm + pm === 0 ? 0.5 : gm / (gm + pm);
  el('rect', { x: 40, y: 32, width: 820 * share, height: 30, fill: COL.up, rx: 4 }, svg);
  el('rect', { x: 40 + 820 * share + 2, y: 32, width: Math.max(0, 820 * (1 - share) - 2), height: 30, fill: COL.down, rx: 4 }, svg);
  if (share > 0.12) txt(svg, 50, 52, 'Subidas ' + Math.round(share * 100) + '%', { fill: '#08130f', 'font-size': 12, 'font-weight': 700 });
  if (share < 0.88) txt(svg, 850, 52, 'Bajadas ' + Math.round((1 - share) * 100) + '%', { fill: '#1d0807', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'end' });
  // escala 0-100
  el('rect', { x: X(70), y: 100, width: X(100) - X(70), height: 22, fill: COL.down, 'fill-opacity': 0.18 }, svg);
  el('rect', { x: X(0), y: 100, width: X(30) - X(0), height: 22, fill: COL.up, 'fill-opacity': 0.18 }, svg);
  el('rect', { x: X(0), y: 100, width: 820, height: 22, fill: 'none', stroke: COL.axis }, svg);
  [0, 30, 50, 70, 100].forEach(v => { el('line', { x1: X(v), x2: X(v), y1: 100, y2: 128, stroke: COL.axis }, svg); txt(svg, X(v), 142, String(v), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }); });
  txt(svg, X(15), 115, 'sobreventa', { 'text-anchor': 'middle', fill: COL.text2, 'font-size': 11 });
  txt(svg, X(85), 115, 'sobrecompra', { 'text-anchor': 'middle', fill: COL.text2, 'font-size': 11 });
  const px = X(rsi);
  el('path', { d: `M${px} 98 L${px - 8} 84 L${px + 8} 84 Z`, fill: COL.text, stroke: COL.surface, 'stroke-width': 2 }, svg);
  el('line', { x1: px, x2: px, y1: 98, y2: 124, stroke: COL.text, 'stroke-width': 2 }, svg);
  txt(svg, px, 176, 'RSI ' + rsi.toFixed(1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
  const rs = pm === 0 ? (gm === 0 ? '—' : '∞') : (gm / pm).toFixed(2);
  let zoneTxt = rsi >= 70 ? 'Zona de sobrecompra: las subidas dominan con claridad (fuerza alcista).' : rsi <= 30 ? 'Zona de sobreventa: las bajadas dominan con claridad (fuerza bajista).' : rsi >= 50 ? 'Por encima de 50: las subidas pesan más que las bajadas.' : 'Por debajo de 50: las bajadas pesan más que las subidas.';
  if (gm + pm === 0) zoneTxt = 'Sin movimiento: por convención se muestra 50.';
  $('#balance-explain').innerHTML = `GM = ${gm.toFixed(1)}, PM = ${pm.toFixed(1)} → RS = ${rs} → <strong>RSI = ${rsi.toFixed(1)}</strong>: el ${rsi.toFixed(1)}% del movimiento reciente fue alcista. ${zoneTxt}`;
});

/* --- calculadora --- */
const calcState = { closes: [], n: 14, sel: 14, res: null };
function runCalc() {
  const raw = $('#calc-in').value.split(/[\s,;]+/).map(s => s.replace(',', '.')).map(Number).filter(v => !isNaN(v) && isFinite(v));
  const n = clamp(parseInt($('#calc-n').value, 10) || 14, 2, 30);
  $('#calc-n').value = n;
  calcState.closes = raw; calcState.n = n;
  if (raw.length < n + 1) {
    calcState.res = null;
    $('#calc-explain').innerHTML = `Necesitas al menos <strong>${n + 1}</strong> cierres para un RSI de ${n} periodos (tienes ${raw.length}).`;
    $('#calc-table').innerHTML = ''; $('#fig-calc').querySelectorAll('svg').forEach(s => s.remove());
    return;
  }
  calcState.res = rsiCalc(raw, n);
  if (calcState.sel < n || calcState.sel >= raw.length) calcState.sel = n;
  renderCalc();
}
const renderCalc = fig(function () {
  const res = calcState.res; if (!res) return;
  const cl = calcState.closes, n = calcState.n, sel = calcState.sel;
  // tabla
  const t = document.createElement('table'); t.className = 't';
  const hr = t.createTHead().insertRow();
  ['#', 'Cierre', 'Cambio', 'Ganancia', 'Pérdida', 'GM', 'PM', 'RS', 'RSI', 'Cálculo'].forEach(h => { const th = document.createElement('th'); th.textContent = h; hr.appendChild(th); });
  const tb = t.createTBody();
  cl.forEach((c, i) => {
    const tr = tb.insertRow(); if (i === sel) tr.className = 'hl';
    tr.style.cursor = i >= n ? 'pointer' : 'default';
    const rs = res.al[i] == null ? null : (res.al[i] === 0 ? Infinity : res.ag[i] / res.al[i]);
    [String(i + 1), fmt(c), i ? fmt(res.ch[i]) : '—', i ? fmt(res.g[i]) : '—', i ? fmt(res.lo[i]) : '—', fmt(res.ag[i], 4), fmt(res.al[i], 4),
      rs == null ? '—' : rs === Infinity ? '∞' : rs.toFixed(3), fmt(res.rsi[i]), i < n ? (i ? 'acumulando' : 'inicio') : i === n ? 'media simple' : 'Wilder'
    ].forEach(v => { const td = tr.insertCell(); td.textContent = v; });
    if (i >= n) tr.addEventListener('click', () => { calcState.sel = i; renderCalc(); });
  });
  $('#calc-table').replaceChildren(t);
  // explicación
  const ag = res.ag[sel], al = res.al[sel], r = res.rsi[sel];
  let ex;
  if (sel === n) {
    const sg = res.g.slice(1, n + 1).reduce((a, b) => a + b, 0), sl = res.lo.slice(1, n + 1).reduce((a, b) => a + b, 0);
    ex = `<strong>Vela ${sel + 1} — primer RSI.</strong> Suma de ganancias de los ${n} cambios = ${sg.toFixed(2)} → GM = ${sg.toFixed(2)} / ${n} = <strong>${ag.toFixed(4)}</strong>. Suma de pérdidas = ${sl.toFixed(2)} → PM = <strong>${al.toFixed(4)}</strong>. RS = ${al === 0 ? '∞' : (ag / al).toFixed(4)} → RSI = 100 − 100 / (1 + RS) = <strong>${r.toFixed(2)}</strong>.`;
  } else {
    const pg = res.ag[sel - 1], pl = res.al[sel - 1];
    ex = `<strong>Vela ${sel + 1} — suavizado de Wilder.</strong> Cambio = ${res.ch[sel].toFixed(2)} → ganancia ${res.g[sel].toFixed(2)}, pérdida ${res.lo[sel].toFixed(2)}.<br>GM = (${pg.toFixed(4)} × ${n - 1} + ${res.g[sel].toFixed(2)}) / ${n} = <strong>${ag.toFixed(4)}</strong> · PM = (${pl.toFixed(4)} × ${n - 1} + ${res.lo[sel].toFixed(2)}) / ${n} = <strong>${al.toFixed(4)}</strong><br>RS = ${al === 0 ? '∞' : (ag / al).toFixed(4)} → <strong>RSI = ${r.toFixed(2)}</strong>`;
  }
  $('#calc-explain').innerHTML = ex;
  // gráfico
  const host = $('#fig-calc');
  const lo = Math.min(...cl), hi = Math.max(...cl), pd = (hi - lo) * 0.12 || 1;
  const C = chart(host, { n: cl.length, w: 520, padR: 46, panels: [{ h: 150, yMin: lo - pd, yMax: hi + pd, dec: 0, ticks: 4, title: 'Cierres' }, { h: 120, yMin: 0, yMax: 100, grid: false, title: 'RSI ' + n }], aria: 'Cierres y RSI' });
  const [P1, P2] = C.panels;
  vline(C, sel, { color: COL.accent, dash: '0' });
  lineSeries(C, P1, cl, { color: COL.text2 });
  cl.forEach((c, i) => el('circle', { cx: C.x(i), cy: P1.y(c), r: i === sel ? 4.5 : 2.5, fill: i === sel ? COL.text : COL.text2, stroke: COL.surface, 'stroke-width': 1.5 }, P1.g.ann));
  [70, 50, 30].forEach(v => { hline(C, P2, v, { color: COL.muted, width: 1, dash: '4 4' }); txt(P2.g.lab, C.w - C.padR + 6, P2.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }); });
  lineSeries(C, P2, res.rsi, { color: COL.rsi });
  if (r != null) marker(C, P2, sel, r, { color: COL.rsi, label: r.toFixed(1), dy: r > 80 ? 16 : -16 });
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cl[i])], ['RSI', fmt(res.rsi[i])]]);
});
function initCalc() {
  $('#calc-go').addEventListener('click', runCalc);
  $('#calc-n').addEventListener('change', runCalc);
  runCalc();
}

/* --- laboratorio --- */
const LAB_SC = {
  up: [[0, 100, .12], [10, 104, .12], [14, 102.8, .12], [26, 109, .12], [30, 107.8, .12], [44, 115, .12], [48, 113.6, .12], [62, 121, .12], [66, 119.8, .12], [80, 126, .12], [90, 127.5]],
  range: [[0, 100, .15], [10, 104, .15], [20, 96, .15], [31, 104.5, .15], [42, 95.6, .15], [53, 104.2, .15], [64, 96, .15], [75, 103.6, .15], [85, 97.2, .15], [90, 99]],
  bear: [[0, 100, .12], [6, 98, .1], [22, 112, .1], [30, 106.5, .3], [52, 113.2, .12], [75, 102, .15], [90, 100]]
};
LAB_SC.down = LAB_SC.up.map(([b, p, nz]) => [b, 200 - p, nz]);
LAB_SC.bull = LAB_SC.bear.map(([b, p, nz]) => [b, 200 - p, nz]);
const LAB_W = 60, LAB_V = 90, LAB_PER = 8;
const lab = { sc: 'up', n: 14, ob: 70, os: 30, cs: null, k: LAB_V - 1, seed: 11 };
function genLab(sc, seed) {
  const r = mulberry32(seed), wps = [{ t: 0, p: 100 }];
  let p = 100;
  for (let b = 10; b < LAB_W; b += 10) { p += gauss(r) * 1.2; wps.push({ t: b * LAB_PER, p }); }
  LAB_SC[sc].forEach(([b, pr, nz]) => wps.push({ t: (LAB_W + b) * LAB_PER, p: pr, n: nz }));
  return candlesFromPath(bridgePath(wps, r, 0.12), LAB_PER);
}
function detectDivs(cs, rsi, from) {
  const H = cs.map(c => c.h), L = cs.map(c => c.l), out = [];
  const ph = pivots(H, 'high', 4, 4, from), pl = pivots(L, 'low', 4, 4, from);
  for (let k = 1; k < ph.length; k++) { const a = ph[k - 1], b = ph[k];
    if (b - a >= 6 && b - a <= 40 && rsi[a] != null && rsi[b] != null && H[b] > H[a] && rsi[b] < rsi[a] - 2 && rsi[a] > 55) out.push({ type: 'bear', a, b }); }
  for (let k = 1; k < pl.length; k++) { const a = pl[k - 1], b = pl[k];
    if (b - a >= 6 && b - a <= 40 && rsi[a] != null && rsi[b] != null && L[b] < L[a] && rsi[b] > rsi[a] + 2 && rsi[a] < 45) out.push({ type: 'bull', a, b }); }
  return out;
}
function buildLab() {
  for (let tries = 0; tries < 40; tries++) {
    const cs = genLab(lab.sc, lab.seed);
    if (lab.sc !== 'bear' && lab.sc !== 'bull') { lab.cs = cs; return; }
    const rsi = rsiCalc(cs.map(c => c.c), 14).rsi;
    const ok = detectDivs(cs, rsi, LAB_W).some(d => d.type === lab.sc && d.b >= LAB_W + 40 && d.b <= LAB_W + 62 && d.a >= LAB_W + 14 && d.a <= LAB_W + 34);
    if (ok) { lab.cs = cs; return; }
    lab.seed = newSeed();
  }
  lab.cs = genLab(lab.sc, lab.seed);
}
const LAB_TXT = {
  up: 'Tendencia alcista: fíjate cuánto tiempo pasa el RSI sobre el nivel de sobrecompra mientras el precio sigue subiendo. Muchas señales ▼ fallan: en tendencia, la sobrecompra es <strong>fuerza</strong>, no una orden de venta.',
  down: 'Tendencia bajista: el RSI vive en la parte baja y las señales ▲ de "sobreventa" fallan una y otra vez. En tendencia bajista, la sobreventa es <strong>debilidad sostenida</strong>.',
  range: 'Mercado lateral: aquí los extremos funcionan mejor. El precio gira cerca de los bordes del rango justo cuando el RSI llega a los niveles: es el entorno ideal para la lectura clásica 70/30.',
  bear: 'Divergencia bajista: el precio hace un <strong>máximo más alto</strong> (incluso barre el máximo anterior), pero el RSI hace un <strong>máximo más bajo</strong>: el segundo empuje tuvo menos fuerza. Luego el precio cae.',
  bull: 'Divergencia alcista: el precio hace un <strong>mínimo más bajo</strong> (barre el mínimo anterior), pero el RSI hace un <strong>mínimo más alto</strong>: la presión vendedora se agotó. Luego el precio sube.'
};
const renderLab = fig(function () {
  const host = $('#fig-rsi-lab'); if (!host || !lab.cs) return;
  const all = lab.cs, calc = rsiCalc(all.map(c => c.c), lab.n), W = LAB_W, V = LAB_V, k = lab.k;
  const cs = all.slice(W), rsi = calc.rsi.slice(W), ag = calc.ag.slice(W), al = calc.al.slice(W), ch = calc.ch.slice(W);
  const [lo, hi] = extent(cs);
  const C = chart(host, { n: V, panels: [{ h: 250, yMin: lo, yMax: hi, dec: 0, title: 'Precio (simulado)' }, { h: 150, yMin: 0, yMax: 100, grid: false, title: 'RSI ' + lab.n }], aria: 'Precio y RSI' });
  const [P1, P2] = C.panels;
  zone(C, P2, lab.ob, 100, { color: COL.down, op: 0.08, stroke: false });
  zone(C, P2, 0, lab.os, { color: COL.up, op: 0.08, stroke: false });
  [[lab.ob, 'sobrecompra'], [50, ''], [lab.os, 'sobreventa']].forEach(([v, s]) => {
    hline(C, P2, v, { color: COL.muted, width: 1, dash: v === 50 ? '2 4' : '5 4' });
    txt(P2.g.lab, C.w - C.padR + 6, P2.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5, 'font-family': 'Consolas, monospace' });
  });
  drawCandles(C, P1, cs.map((c, j) => j <= k ? c : null));
  lineSeries(C, P2, rsi, { upTo: k });
  // señales de salida de zona
  let sigs = 0, inOB = 0, inOS = 0;
  for (let j = 0; j <= k; j++) {
    const v = rsi[j]; if (v == null) continue;
    if (v >= lab.ob) inOB++; if (v <= lab.os) inOS++;
    const pv = j ? rsi[j - 1] : calc.rsi[W - 1];
    if (!$('#lab-sig').checked || pv == null) continue;
    if (pv > lab.ob && v <= lab.ob) { sigs++; marker(C, P1, j, cs[j].h + (hi - lo) * 0.03, { shape: 'down', color: COL.down, size: 5 }); }
    if (pv < lab.os && v >= lab.os) { sigs++; marker(C, P1, j, cs[j].l - (hi - lo) * 0.03, { shape: 'up', color: COL.up, size: 5 }); }
  }
  // divergencias
  let divs = [];
  if ($('#lab-div').checked) {
    divs = detectDivs(all, calc.rsi, W).filter(d => d.b - W <= k - 4);
    divs.slice(-3).forEach(d => {
      const a = d.a - W, b = d.b - W, ya = d.type === 'bear' ? cs[a].h : cs[a].l, yb = d.type === 'bear' ? cs[b].h : cs[b].l;
      seg(C, P1, a, ya, b, yb, { color: COL.div, width: 2 });
      seg(C, P2, a, rsi[a], b, rsi[b], { color: COL.div, width: 2 });
      [[a, ya, rsi[a]], [b, yb, rsi[b]]].forEach(([i, py, ry]) => { el('circle', { cx: C.x(i), cy: P1.y(py), r: 4, fill: COL.div, stroke: COL.surface, 'stroke-width': 2 }, P1.g.ann); el('circle', { cx: C.x(i), cy: P2.y(ry), r: 4, fill: COL.div, stroke: COL.surface, 'stroke-width': 2 }, P2.g.ann); });
      tag(P2.g.lab, C.x(b) + 8, P2.y(rsi[b]) + (d.type === 'bear' ? -14 : 14), d.type === 'bear' ? 'Div. bajista' : 'Div. alcista', COL.div, 'start');
    });
  }
  hover(C, j => {
    if (j > k) return null;
    const rs = al[j] == null ? '—' : al[j] === 0 ? '∞' : (ag[j] / al[j]).toFixed(2);
    return [['#', 'Vela ' + (j + 1)], ['Cierre', fmt(cs[j].c)], ['Cambio', fmt(ch[j])], ['GM', fmt(ag[j], 3)], ['PM', fmt(al[j], 3)], ['RS', rs], ['RSI', fmt(rsi[j], 1)]];
  });
  const cnt = k + 1;
  $('#lab-stats').innerHTML = [['RSI actual', fmt(rsi[k], 1)], ['Tiempo en sobrecompra', Math.round(inOB / cnt * 100) + '%'], ['Tiempo en sobreventa', Math.round(inOS / cnt * 100) + '%'], ['Señales de salida de zona', sigs], ['Divergencias detectadas', divs.length]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  let extra = '';
  if ((lab.sc === 'bear' || lab.sc === 'bull') && !divs.some(d => d.type === lab.sc) && k === V - 1 && $('#lab-div').checked) extra = ' <em>Con este periodo la divergencia no se detecta: prueba con 14.</em>';
  $('#lab-explain').innerHTML = LAB_TXT[lab.sc] + extra;
  dataTable($('#lab-data'), ['Vela', 'Cierre', 'Cambio', 'GM', 'PM', 'RSI'], cs.slice(0, k + 1).map((c, j) => [String(j + 1), fmt(c.c), fmt(ch[j]), fmt(ag[j], 3), fmt(al[j], 3), fmt(rsi[j], 1)]));
});
function initLab() {
  const root = $('#rsi-lab'), pl = new Player(k => { lab.k = k; renderLab(); }, 70);
  segBind(root, (key, v) => {
    if (key === 'sc') { lab.sc = v; lab.seed = 11 + v.length; buildLab(); }
    if (key === 'lv') { lab.ob = +v; lab.os = 100 - v; }
    pl.stop(); lab.k = LAB_V - 1; renderLab();
  });
  $('#lab-n').addEventListener('input', e => { lab.n = +e.target.value; $('#lab-n-v').textContent = lab.n; renderLab(); });
  ['#lab-sig', '#lab-div'].forEach(s => $(s).addEventListener('change', renderLab));
  $('#lab-play').addEventListener('click', () => pl.play(LAB_V - 1, 15));
  $('#lab-new').addEventListener('click', () => { pl.stop(); lab.seed = newSeed(); buildLab(); lab.k = LAB_V - 1; renderLab(); });
  buildLab(); renderLab();
}
/* --- rangos de Cardwell --- */
const rng = { seed: 21, cs: null };
function buildRanges() {
  const r = mulberry32(rng.seed), W = 40, per = 6, wps = [{ t: 0, p: 100 }];
  let p = 100;
  for (let b = 10; b < W; b += 10) { p += gauss(r) * 1; wps.push({ t: b * per, p }); }
  [[0, 100], [8, 104], [12, 102.5], [22, 108], [27, 106], [38, 112], [43, 110], [54, 116], [60, 117.5], [66, 113], [70, 114.6], [80, 109], [85, 110.8], [96, 104.5], [101, 106.2], [112, 100.5], [120, 99.5]]
    .forEach(([b, pr]) => wps.push({ t: (W + b) * per, p: pr }));
  rng.cs = candlesFromPath(bridgePath(wps, r, 0.1), per);
}
const renderRanges = fig(function () {
  const host = $('#fig-ranges'); if (!host) return;
  if (!rng.cs) buildRanges();
  const W = 40, all = rng.cs, rsi = rsiCalc(all.map(c => c.c), 14).rsi.slice(W), cs = all.slice(W), n = cs.length;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 200, yMin: lo, yMax: hi, dec: 0, title: 'Precio' }, { h: 150, yMin: 0, yMax: 100, grid: false, title: 'RSI 14' }], aria: 'Cambio de rango del RSI' });
  const [P1, P2] = C.panels;
  zone(C, P2, 40, 80, { x1: 0, x2: 61, color: COL.up, op: 0.12, label: 'Rango alcista 40–80' });
  zone(C, P2, 20, 60, { x1: 64, x2: n - 1, color: COL.down, op: 0.12, label: 'Rango bajista 20–60', labelBelow: true });
  [80, 70, 60, 50, 40, 30, 20].forEach(v => txt(P2.g.lab, C.w - C.padR + 6, P2.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }));
  hline(C, P2, 50, { color: COL.muted, width: 1, dash: '2 4' });
  vline(C, 62.5, { color: COL.text2 });
  tag(P1.g.lab, C.x(63), P1.top + 16, 'Cambio de tendencia', COL.text2, 'middle');
  drawCandles(C, P1, cs);
  lineSeries(C, P2, rsi);
  hover(C, j => [['#', 'Vela ' + (j + 1)], ['Cierre', fmt(cs[j].c)], ['RSI', fmt(rsi[j], 1)]]);
});

/* --- divergencias (esquema) --- */
const DIVS = {
  rb: { P: [30, 55, 45, 70, 58, 74, 60, 50], R: [40, 72, 55, 78, 58, 66, 45, 35], k: [3, 5], hi: true, lp: ['Máximo', 'Máximo más alto'], lr: ['Máximo', 'Máximo más bajo'],
    why: 'Precio: <strong>máximo más alto</strong>. RSI: <strong>máximo más bajo</strong>. El segundo empuje alcista tuvo menos impulso → posible giro bajista. Confirmación típica: el precio rompe el último mínimo.' },
  ra: { P: [70, 45, 55, 30, 42, 26, 40, 50], R: [60, 28, 45, 22, 42, 34, 55, 62], k: [3, 5], hi: false, lp: ['Mínimo', 'Mínimo más bajo'], lr: ['Mínimo', 'Mínimo más alto'],
    why: 'Precio: <strong>mínimo más bajo</strong>. RSI: <strong>mínimo más alto</strong>. La caída pierde fuerza → posible giro alcista. Confirmación típica: el precio rompe el último máximo.' },
  oa: { P: [20, 45, 35, 62, 48, 75, 60, 85], R: [40, 70, 45, 72, 35, 74, 55, 78], k: [2, 4], hi: false, lp: ['Mínimo', 'Mínimo más alto'], lr: ['Mínimo', 'Mínimo más bajo'],
    why: 'En tendencia alcista: precio con <strong>mínimo más alto</strong> y RSI con <strong>mínimo más bajo</strong>. El retroceso fue brusco, pero la estructura alcista sigue intacta → señal de <strong>continuación</strong> alcista.' },
  ob: { P: [80, 55, 65, 40, 52, 28, 38, 15], R: [60, 30, 52, 28, 63, 25, 45, 22], k: [2, 4], hi: true, lp: ['Máximo', 'Máximo más bajo'], lr: ['Máximo', 'Máximo más alto'],
    why: 'En tendencia bajista: precio con <strong>máximo más bajo</strong> y RSI con <strong>máximo más alto</strong>. El rebote fue fuerte, pero no cambió la estructura bajista → señal de <strong>continuación</strong> bajista.' }
};
let divSel = 'rb';
const renderDiv = fig(function () {
  const host = $('#fig-div'); if (!host) return;
  const D = DIVS[divSel], n = D.P.length;
  const C = chart(host, { n, padR: 20, panels: [{ h: 170, yMin: 0, yMax: 100, grid: false, title: 'Precio' }, { h: 150, yMin: 0, yMax: 100, grid: false, title: 'RSI' }], aria: 'Esquema de divergencia' });
  const [P1, P2] = C.panels;
  lineSeries(C, P1, D.P, { color: COL.text2, width: 2.5 });
  lineSeries(C, P2, D.R, { width: 2.5 });
  const [a, b] = D.k;
  seg(C, P1, a, D.P[a], b, D.P[b], { width: 2.5 }); seg(C, P2, a, D.R[a], b, D.R[b], { width: 2.5 });
  [[P1, D.P, D.lp], [P2, D.R, D.lr]].forEach(([P, arr, lb]) => {
    [a, b].forEach((i, q) => { marker(C, P, i, arr[i], { color: COL.div, size: 6, label: lb[q], dy: D.hi ? -18 : 18 }); });
  });
  $('#div-explain').innerHTML = D.why;
});

/* --- failure swing --- */
const FS = {
  top: { R: [55, 68, 78, 64, 73, 58, 45], A: 2, B: 3, Cc: 4, X: 5, lv: 70,
    steps: ['1) El RSI supera 70: pico <strong>A</strong> en sobrecompra.', '2) Retrocede y forma un valle <strong>B</strong>. Ese nivel es el "punto de fallo".', '3) Vuelve a subir pero <strong>no supera A</strong> (pico C más bajo): el impulso falla.', '4) Rompe por debajo del valle B → <strong>señal bajista</strong> (failure swing de techo).'] },
  bot: { R: [45, 32, 22, 36, 27, 42, 55], A: 2, B: 3, Cc: 4, X: 5, lv: 30,
    steps: ['1) El RSI cae por debajo de 30: mínimo <strong>A</strong> en sobreventa.', '2) Rebota y forma un pico <strong>B</strong>. Ese nivel es el "punto de fallo".', '3) Vuelve a caer pero <strong>no perfora A</strong> (mínimo C más alto): la presión vendedora falla.', '4) Rompe por encima del pico B → <strong>señal alcista</strong> (failure swing de suelo).'] }
};
const fsState = { t: 'top', step: 3 };
const renderFS = fig(function () {
  const host = $('#fig-fs'); if (!host) return;
  const F = FS[fsState.t], st = fsState.step, upto = [2, 3, 4, 5][st];
  const C = chart(host, { n: F.R.length, padR: 46, panels: [{ h: 230, yMin: 0, yMax: 100, grid: false, title: 'RSI' }], aria: 'Failure swing' });
  const P = C.panels[0];
  [70, 50, 30].forEach(v => { hline(C, P, v, { color: COL.muted, width: 1, dash: v === 50 ? '2 4' : '5 4' }); txt(P.g.lab, C.w - C.padR + 6, P.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }); });
  lineSeries(C, P, F.R, { upTo: upto, width: 2.5 });
  const up = fsState.t === 'top';
  marker(C, P, F.A, F.R[F.A], { color: COL.rsi, label: 'A', dy: up ? -16 : 16 });
  if (st >= 1) { marker(C, P, F.B, F.R[F.B], { color: COL.rsi, label: 'B', dy: up ? 16 : -16 }); hline(C, P, F.R[F.B], { x1: F.B, x2: F.R.length - 1, color: COL.text2, width: 1.2, dash: '3 3', label: 'Punto de fallo', below: !up }); }
  if (st >= 2) marker(C, P, F.Cc, F.R[F.Cc], { color: COL.rsi, label: 'C', dy: up ? -16 : 16 });
  if (st >= 3) marker(C, P, F.X, F.R[F.X], { shape: up ? 'down' : 'up', color: up ? COL.down : COL.up, size: 7, label: up ? 'Señal bajista' : 'Señal alcista', dy: up ? 20 : -20 });
  $('#fs-explain').innerHTML = F.steps.slice(0, st + 1).join('<br>');
});

function initRSI() {
  ['#bal-g', '#bal-l'].forEach(s => $(s).addEventListener('input', renderBalance));
  renderBalance();
  initCalc();
  initLab();
  $('#ranges-new').addEventListener('click', () => { rng.seed = newSeed(); buildRanges(); renderRanges(); });
  renderRanges();
  segBind($('#rsi-div'), (k, v) => { divSel = v; renderDiv(); });
  renderDiv();
  const fsp = new Player(k => { fsState.step = k; renderFS(); }, 1100);
  segBind($('#rsi-fs'), (k, v) => { fsState.t = v; fsp.stop(); fsState.step = 3; renderFS(); });
  $('#fs-play').addEventListener('click', () => fsp.play(3));
  renderFS();
  quiz($('#rsi-quiz'), 'Práctica: RSI', QUIZZES["rsi"].qs);
}

export { renderBalance, calcState, runCalc, renderCalc, initCalc, LAB_SC, LAB_W, LAB_V, LAB_PER, lab, genLab, detectDivs, buildLab, LAB_TXT, renderLab, initLab, rng, buildRanges, renderRanges, DIVS, divSel, renderDiv, FS, fsState, renderFS, initRSI };
