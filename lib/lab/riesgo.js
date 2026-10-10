// Motor interactivo · riesgo. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, NS, chart, clamp, el, fig, hline, hover, mulberry32, newSeed, quiz, txt } from './core';
/* =====================================================================
   MÓDULO 18 · GESTIÓN DEL RIESGO
   ===================================================================== */
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lerpHex = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
const DIV = { neg: '#e66767', get mid() { return document.documentElement.dataset.theme === 'light' ? '#e4e4e0' : '#383835'; }, pos: '#3987e5' };
const expColor = e => { const t = clamp(e / 1.5, -1, 1); return t >= 0 ? lerpHex(DIV.mid, DIV.pos, t) : lerpHex(DIV.mid, DIV.neg, -t); };
const renderEx = fig(function () {
  const host = $('#fig-ex'); if (!host) return;
  const wr = +$('#ex-wr').value / 100, rr = +$('#ex-rr').value / 4, E = wr * rr - (1 - wr);
  $('#ex-wr-v').textContent = Math.round(wr * 100) + '%'; $('#ex-rr-v').textContent = '1 : ' + rr.toFixed(2);
  host.querySelectorAll('svg').forEach(s => s.remove());
  const W = 460, H = 370, L = 46, B = 40, T = 22, R = 8, svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Mapa de expectativa' });
  host.insertBefore(svg, host.firstChild);
  const wrs = [], rrs = []; for (let w = 10; w <= 90; w += 5) wrs.push(w / 100); for (let x = 0.5; x <= 5.001; x += 0.25) rrs.push(x);
  const cw = (W - L - R) / wrs.length, ch = (H - T - B) / rrs.length;
  const X = w => L + (w - 0.075) / (0.925 - 0.075) * (W - L - R), Y = x => H - B - (x - 0.375) / (5.125 - 0.375) * (H - T - B);
  wrs.forEach((w, i) => rrs.forEach((x, j) => {
    const e = w * x - (1 - w), rc = el('rect', { x: L + i * cw, y: H - B - (j + 1) * ch, width: cw - 1, height: ch - 1, fill: expColor(e), style: 'cursor:pointer' }, svg);
    const t = document.createElementNS(NS, 'title'); t.textContent = `Acierto ${Math.round(w * 100)}% · R:B ${x.toFixed(2)} → ${e >= 0 ? '+' : ''}${e.toFixed(2)}R`; rc.appendChild(t);
    rc.addEventListener('click', () => { $('#ex-wr').value = Math.round(w * 100); $('#ex-rr').value = Math.round(x * 4); renderEx(); });
  }));
  let d = ''; for (let x = 0.5; x <= 5.001; x += 0.05) { const w = 1 / (1 + x); if (w < 0.075 || w > 0.925) continue; d += (d ? 'L' : 'M') + X(w).toFixed(1) + ' ' + Y(x).toFixed(1); }
  el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg);
  [10, 30, 50, 70, 90].forEach(v => txt(svg, X(v / 100), H - B + 16, v + '%', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10.5 }));
  [0.5, 1, 2, 3, 4, 5].forEach(v => txt(svg, L - 6, Y(v) + 4, v.toFixed(1), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 }));
  txt(svg, (W + L) / 2, H - 4, '% de acierto', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  txt(svg, L, 12, 'R:B ↑', { fill: COL.muted, 'font-size': 11 });
  el('circle', { cx: X(wr), cy: Y(rr), r: 8, fill: 'none', stroke: '#fff', 'stroke-width': 3 }, svg);
  el('circle', { cx: X(wr), cy: Y(rr), r: 8, fill: 'none', stroke: COL.surface, 'stroke-width': 1 }, svg);
  const be = 1 / (1 + rr);
  $('#ex-out').innerHTML = [['Expectativa por operación', (E >= 0 ? '+' : '') + E.toFixed(2) + 'R'], ['En 100 operaciones', (E >= 0 ? '+' : '') + (E * 100).toFixed(0) + 'R'], ['Acierto mínimo con este R:B', (be * 100).toFixed(1) + '%']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#ex-explain').className = 'explain ' + (E > 0 ? 'good' : 'bad');
  $('#ex-explain').innerHTML = E > 0 ? `Con un ${Math.round(wr * 100)}% de acierto y R:B 1:${rr.toFixed(2)}, cada operación aporta de media <strong>${E.toFixed(2)}R</strong>. Arriesgando 1% por operación, eso es ~${(E * 100).toFixed(0)}% cada 100 operaciones (antes de costos).`
    : `Expectativa <strong>negativa</strong>: con este R:B necesitas acertar más del ${(be * 100).toFixed(1)}%. Ningún tamaño de posición arregla una expectativa negativa. Haz clic en cualquier celda del mapa para probarla.`;
});

/* --- Monte Carlo --- */
const mcS = { seed: 101 };
const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
function simulate(wr, rr, risk, n, seed, S) {
  const r = mulberry32(seed), eqAll = new Float64Array(S * (n + 1)), finals = [], mdds = [], streaks = []; let ruin = 0;
  for (let s = 0; s < S; s++) {
    let eq = 1, peak = 1, mdd = 0, cur = 0, ls = 0, mn = 1; eqAll[s * (n + 1)] = 1;
    for (let t = 1; t <= n; t++) {
      const win = r() < wr;
      eq *= win ? 1 + risk * rr : 1 - risk;
      if (win) cur = 0; else { cur++; if (cur > ls) ls = cur; }
      if (eq > peak) peak = eq; const dd = 1 - eq / peak; if (dd > mdd) mdd = dd; if (eq < mn) mn = eq;
      eqAll[s * (n + 1) + t] = eq;
    }
    finals.push(eq); mdds.push(mdd); streaks.push(ls); if (mn <= 0.5) ruin++;
  }
  const bands = { p5: [], p50: [], p95: [] }, tmp = new Float64Array(S);
  for (let t = 0; t <= n; t++) {
    for (let s = 0; s < S; s++) tmp[s] = eqAll[s * (n + 1) + t];
    const so = Array.from(tmp).sort((a, b) => a - b);
    bands.p5.push(pct(so, 0.05)); bands.p50.push(pct(so, 0.5)); bands.p95.push(pct(so, 0.95));
  }
  const paths = []; for (let s = 0; s < 40; s++) paths.push(Array.from(eqAll.subarray(s * (n + 1), (s + 1) * (n + 1))));
  const srt = a => a.slice().sort((x, y) => x - y);
  return { paths, bands, finals: srt(finals), mdds: srt(mdds), streaks: srt(streaks), ruin: ruin / S, S };
}
const renderMC = fig(function () {
  const host = $('#fig-mc'); if (!host) return;
  const wr = +$('#mc-wr').value / 100, rr = +$('#mc-rr').value / 10, risk = +$('#mc-risk').value / 4 / 100, n = +$('#mc-n').value;
  $('#mc-wr-v').textContent = Math.round(wr * 100) + '%'; $('#mc-rr-v').textContent = '1 : ' + rr.toFixed(1); $('#mc-risk-v').textContent = (risk * 100).toFixed(2).replace(/\.?0+$/, '') + '%'; $('#mc-n-v').textContent = n;
  const R = simulate(wr, rr, risk, n, mcS.seed, 1000), cap = 10000;
  const yMax = Math.min(Math.max(1.6, Math.max(...R.bands.p95) * 1.08), 12);
  const C = chart(host, { n: n + 1, panels: [{ h: 320, yMin: 0, yMax, fmt: v => '$' + (v * cap / 1000).toFixed(0) + 'k', ticks: 5 }], aria: 'Simulación Monte Carlo de la cuenta' });
  const P = C.panels[0];
  const clip = el('clipPath', { id: 'mc-clip' }, el('defs', {}, C.svg)); el('rect', { x: C.padL, y: P.top, width: C.iw, height: P.h }, clip);
  const g = el('g', { 'clip-path': 'url(#mc-clip)' }, P.g.data);
  const pathD = arr => arr.map((v, t) => (t ? 'L' : 'M') + C.x(t).toFixed(1) + ' ' + P.y(v).toFixed(1)).join('');
  R.paths.forEach(p => el('path', { d: pathD(p), fill: 'none', stroke: COL.text2, 'stroke-opacity': 0.22, 'stroke-width': 1 }, g));
  el('path', { d: pathD(R.bands.p5), fill: 'none', stroke: COL.down, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g);
  el('path', { d: pathD(R.bands.p95), fill: 'none', stroke: COL.up, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g);
  el('path', { d: pathD(R.bands.p50), fill: 'none', stroke: COL.strong, 'stroke-width': 2.5 }, g);
  hline(C, P, 1, { color: COL.muted, width: 1, dash: '2 4', label: 'Capital inicial', side: 'left' });
  hline(C, P, 0.5, { color: COL.down, width: 1, dash: '2 4', label: '−50%', side: 'left', below: true });
  hover(C, t => [['#', 'Operación ' + t], ['Mediana', '$' + Math.round(R.bands.p50[t] * cap).toLocaleString('es')], ['Peor 5%', '$' + Math.round(R.bands.p5[t] * cap).toLocaleString('es')], ['Mejor 5%', '$' + Math.round(R.bands.p95[t] * cap).toLocaleString('es')]]);
  const E = wr * rr - (1 - wr), loseP = R.finals.filter(v => v < 1).length / R.S;
  $('#mc-out').innerHTML = [['Cuenta mediana al final', '$' + Math.round(pct(R.finals, 0.5) * cap).toLocaleString('es')], ['Prob. de terminar en pérdida', (loseP * 100).toFixed(0) + '%'], ['Drawdown máximo típico', (pct(R.mdds, 0.5) * 100).toFixed(0) + '%'], ['Drawdown en el peor 5%', (pct(R.mdds, 0.95) * 100).toFixed(0) + '%'], ['Racha perdedora típica', pct(R.streaks, 0.5) + ' seguidas'], ['Prob. de caer un 50%', (R.ruin * 100).toFixed(1) + '%']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#mc-explain').innerHTML = `Expectativa: <strong>${E >= 0 ? '+' : ''}${E.toFixed(2)}R</strong> por operación. ` +
    (E <= 0 ? 'Con expectativa negativa, todas las cuentas tienden a perder; el tamaño solo decide la velocidad.' :
      `El sistema es ganador, pero fíjate en la dispersión: misma estrategia, finales muy distintos. Arriesgando ${(risk * 100).toFixed(2).replace(/\.?0+$/, '')}% el drawdown típico es del ${(pct(R.mdds, 0.5) * 100).toFixed(0)}%` + (R.ruin > 0.05 ? ' y <strong>más de 1 de cada 20 cuentas pierde la mitad</strong>: demasiado riesgo para la misma ventaja.' : '. Prueba a subir el riesgo al 5% o más y mira cómo se dispara el peor caso.'));
});

/* --- drawdown --- */
const renderDD = fig(function () {
  const host = $('#fig-dd'); if (!host) return;
  const lossP = +$('#dd-l').value, need = lossP / (100 - lossP) * 100;
  $('#dd-l-v').textContent = '−' + lossP + '%';
  host.querySelectorAll('svg').forEach(s => s.remove());
  const W = 900, H = 240, L = 50, B = 30, T = 14, svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Ganancia necesaria para recuperar una pérdida' });
  host.insertBefore(svg, host.firstChild);
  const cats = [10, 20, 30, 40, 50, 60, 70, 80, 90], ymax = Math.max(400, need) * 1.08, bw = (W - L - 20) / cats.length;
  const Y = v => H - B - Math.min(v, ymax) / ymax * (H - B - T);
  [0, 100, 200, 300, 400].filter(v => v <= ymax).forEach(v => { el('line', { x1: L, x2: W - 20, y1: Y(v), y2: Y(v), stroke: COL.grid }, svg); txt(svg, L - 6, Y(v) + 4, '+' + v + '%', { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 }); });
  cats.forEach((c, i) => {
    const g2 = c / (100 - c) * 100, x = L + i * bw + bw * 0.2, w = Math.min(24, bw * 0.6), sel = Math.abs(c - lossP) < 5;
    el('rect', { x: x + (bw * 0.6 - w) / 2, y: Y(g2), width: w, height: H - B - Y(g2), rx: 4, fill: sel ? COL.liq : COL.range, 'fill-opacity': sel ? 1 : 0.55 }, svg);
    txt(svg, x + bw * 0.3, H - B + 16, '−' + c + '%', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
    txt(svg, x + bw * 0.3, Math.max(T + 10, Y(g2) - 6), '+' + (g2 > 999 ? '∞' : g2.toFixed(0)) + '%', { 'text-anchor': 'middle', fill: COL.text, 'font-size': 10.5, 'font-weight': 600 });
  });
  $('#dd-explain').innerHTML = `Tras perder un <strong>${lossP}%</strong>, necesitas ganar un <strong>${need.toFixed(1)}%</strong> para recuperarte. ` + (lossP >= 50 ? 'A partir de aquí la recuperación es casi imposible en la práctica.' : lossP >= 25 ? 'Ya exige un rendimiento muy superior a la pérdida.' : 'Todavía manejable: por eso conviene cortar los drawdowns pronto.');
});

function streakTable() {
  const wrs = [30, 40, 50, 60, 70], ns = [50, 100, 250, 500], r = mulberry32(909), res = {};
  wrs.forEach(w => ns.forEach(n => {
    const arr = [];
    for (let s = 0; s < 400; s++) { let cur = 0, ls = 0; for (let t = 0; t < n; t++) { if (r() < w / 100) cur = 0; else { cur++; if (cur > ls) ls = cur; } } arr.push(ls); }
    arr.sort((a, b) => a - b); res[w + '_' + n] = arr[200];
  }));
  const t = document.createElement('table'); t.className = 't';
  const hr = t.createTHead().insertRow(); ['% de acierto'].concat(ns.map(n => n + ' operaciones')).forEach(h => { const th = document.createElement('th'); th.textContent = h; hr.appendChild(th); });
  const tb = t.createTBody();
  wrs.forEach(w => { const tr = tb.insertRow(); [w + '%'].concat(ns.map(n => res[w + '_' + n] + ' pérdidas')).forEach(v => { const td = tr.insertCell(); td.textContent = v; }); });
  $('#rg-table').replaceChildren(t);
  const L5 = res['50_250'];
  $('#rg-tbl-explain').innerHTML = `Con un 50% de acierto, en 250 operaciones lo normal es encadenar <strong>${L5} pérdidas seguidas</strong>. Arriesgando 1% por operación eso es un ${((1 - Math.pow(0.99, L5)) * 100).toFixed(1)}% de caída; arriesgando 5%, un <strong>${((1 - Math.pow(0.95, L5)) * 100).toFixed(1)}%</strong>. La racha no significa que la estrategia dejó de funcionar: es estadística.`;
}

function initRiesgo() {
  ['#ex-wr', '#ex-rr'].forEach(s => $(s).addEventListener('input', renderEx)); renderEx();
  ['#mc-wr', '#mc-rr', '#mc-risk', '#mc-n'].forEach(s => $(s).addEventListener('change', renderMC));
  ['#mc-wr', '#mc-rr', '#mc-risk', '#mc-n'].forEach(s => $(s).addEventListener('input', () => {
    $('#mc-wr-v').textContent = $('#mc-wr').value + '%'; $('#mc-rr-v').textContent = '1 : ' + (+$('#mc-rr').value / 10).toFixed(1);
    $('#mc-risk-v').textContent = (+$('#mc-risk').value / 4).toFixed(2).replace(/\.?0+$/, '') + '%'; $('#mc-n-v').textContent = $('#mc-n').value;
  }));
  $('#mc-new').addEventListener('click', () => { mcS.seed = newSeed(); renderMC(); });
  renderMC();
  $('#dd-l').addEventListener('input', renderDD); renderDD();
  streakTable();
  quiz($('#riesgo-quiz'), 'Práctica: gestión del riesgo', QUIZZES["riesgo"].qs);
}

export { hexRgb, lerpHex, DIV, expColor, renderEx, mcS, pct, simulate, renderMC, renderDD, streakTable, initRiesgo };
