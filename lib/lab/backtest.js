// Motor interactivo · backtesting y validación (muestra, sobreajuste, walk-forward y métricas).
import { QUIZZES } from './shared';
import { $, COL, el, fig, mulberry32, newSeed, quiz, txt } from './core';
import { R, equityPath, histogram, pctS, rStats, stats, svgIn } from './kit';

/* --- tamaño de muestra --- */
const bm = { seed: 5 };
const renderSample = fig(function () {
  const host = $('#fig-bt-n'); if (!host) return;
  const wr = +$('#bn-wr').value / 100, rr = +$('#bn-rr').value / 4, n = +$('#bn-n').value;
  $('#bn-wr-v').textContent = Math.round(wr * 100) + '%'; $('#bn-rr-v').textContent = '1 : ' + rr.toFixed(2); $('#bn-n-v').textContent = n;
  const E = wr * rr - (1 - wr), r = mulberry32(bm.seed), S = 3000, exps = [], wrs = [];
  for (let s = 0; s < S; s++) { let w = 0; for (let t = 0; t < n; t++) if (r() < wr) w++; wrs.push(w / n); exps.push((w * rr - (n - w)) / n); }
  const so = exps.slice().sort((a, b) => a - b), sw = wrs.slice().sort((a, b) => a - b), q = (a, p) => a[Math.round(p * (a.length - 1))];
  const lo = Math.min(-1, q(so, 0.005)), hi = Math.max(rr * 0.6, q(so, 0.995)), W = 900, H = 230, svg = svgIn(host, W, H, 'Expectativa observada en muestras de ' + n + ' operaciones');
  const X = histogram(svg, exps, { x: 30, y: 26, w: W - 60, h: 170, lo, hi, bins: 50, color: v => v < 0 ? COL.down : COL.up, mark: E,
    ticks: [lo, (lo + E) / 2, E, (E + hi) / 2, hi].map(v => +v.toFixed(2)), fmt: v => R(v), title: 'Expectativa medida en 3 000 backtests de ' + n + ' operaciones' });
  const a = q(so, 0.05), b = q(so, 0.95);
  el('rect', { x: X(a), y: 26, width: X(b) - X(a), height: 170, fill: COL.strong, 'fill-opacity': 0.06 }, svg);
  txt(svg, X(E) + 6, 40, 'real: ' + R(E), { fill: COL.strong, 'font-size': 11, 'font-weight': 700 });
  const neg = exps.filter(v => v <= 0).length / S;
  $('#bn-out').innerHTML = stats([['Expectativa real', R(E)], ['El 90% de los backtests mide entre', R(a) + ' y ' + R(b)], ['% de acierto medido (90%)', pctS(q(sw, 0.05)) + ' – ' + pctS(q(sw, 0.95))], [E > 0 ? 'Backtests que parecen perdedores' : 'Backtests que parecen ganadores', pctS(E > 0 ? neg : 1 - neg)]]);
  $('#bn-explain').innerHTML = `Con <strong>${n}</strong> operaciones, una estrategia de ${R(E)} real puede medirse en cualquier punto entre ${R(a)} y ${R(b)}. ` +
    (n < 60 ? 'Con muestras tan cortas el ruido tapa casi cualquier ventaja: no saques conclusiones todavía.' : n < 200 ? 'Ya se distingue algo, pero el intervalo sigue siendo ancho.' : 'Con esta muestra el intervalo empieza a ser útil.') +
    ' El intervalo se estrecha con la raíz cuadrada de la muestra: para reducirlo a la mitad necesitas <strong>cuatro veces</strong> más operaciones.';
});

/* --- sobreajuste --- */
const bo = { seed: 17 };
const renderOverfit = fig(function () {
  const host = $('#fig-bt-of'); if (!host) return;
  const K = +$('#bo-k').value, edge = +$('#bo-e').value / 100, n = 120, wr0 = 1 / 3 + edge / 3, rr = 2;
  $('#bo-k-v').textContent = K; $('#bo-e-v').textContent = edge === 0 ? 'ninguna' : R(edge);
  const r = mulberry32(bo.seed), pts = [];
  for (let k = 0; k < K; k++) {
    const run = () => { let s = 0; for (let t = 0; t < n; t++) s += r() < wr0 ? rr : -1; return s / n; };
    pts.push([run(), run()]);
  }
  const best = pts.reduce((bi, p, i) => p[0] > pts[bi][0] ? i : bi, 0), W = 900, H = 320, L = 60, B = 40, T = 16, Rr = 20;
  const svg = svgIn(host, W, H, 'Resultado dentro y fuera de muestra de cada combinación de parámetros');
  const lim = 0.8, X = v => L + (v + lim) / (2 * lim) * (W - L - Rr), Y = v => T + (lim - v) / (2 * lim) * (H - T - B), cl = v => Math.max(-lim, Math.min(lim, v));
  [-0.6, -0.3, 0, 0.3, 0.6].forEach(v => {
    el('line', { x1: X(v), x2: X(v), y1: T, y2: H - B, stroke: v === 0 ? COL.axis : COL.grid }, svg);
    el('line', { x1: L, x2: W - Rr, y1: Y(v), y2: Y(v), stroke: v === 0 ? COL.axis : COL.grid }, svg);
    txt(svg, X(v), H - B + 15, R(v, 1), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10.5 });
    txt(svg, L - 6, Y(v) + 4, R(v, 1), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 });
  });
  el('line', { x1: X(-lim), y1: Y(-lim), x2: X(lim), y2: Y(lim), stroke: COL.muted, 'stroke-dasharray': '4 4' }, svg);
  txt(svg, (W + L) / 2, H - 6, 'Expectativa en el periodo de prueba (in-sample) →', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  txt(svg, L, 12, '↑ Expectativa en datos nuevos (out-of-sample)', { fill: COL.muted, 'font-size': 11 });
  pts.forEach(([a, b], i) => { if (i !== best) el('circle', { cx: X(cl(a)), cy: Y(cl(b)), r: 3.2, fill: COL.text2, 'fill-opacity': 0.45 }, svg); });
  const [ba, bb] = pts[best];
  el('line', { x1: X(cl(ba)), y1: Y(cl(ba)), x2: X(cl(ba)), y2: Y(cl(bb)), stroke: COL.liq, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, svg);
  el('circle', { cx: X(cl(ba)), cy: Y(cl(bb)), r: 7, fill: COL.liq, stroke: COL.surface, 'stroke-width': 2 }, svg);
  txt(svg, X(cl(ba)) - 10, Y(cl(bb)) + 4, 'la elegida', { 'text-anchor': 'end', fill: COL.liq, 'font-size': 11, 'font-weight': 700 });
  const avgOut = pts.reduce((s, p) => s + p[1], 0) / K;
  $('#bo-out').innerHTML = stats([['La mejor en el backtest', R(ba)], ['La misma en datos nuevos', R(bb)], ['Media de todas fuera de muestra', R(avgOut)], ['Ventaja real', R(edge)]]);
  $('#bo-explain').className = 'explain ' + (ba - bb > 0.15 ? 'bad' : 'good');
  $('#bo-explain').innerHTML = `Probaste <strong>${K}</strong> combinaciones de parámetros sobre las mismas ${n} operaciones y te quedaste con la mejor: ${R(ba)}. En datos nuevos rinde ${R(bb)}. ` +
    (edge === 0 ? 'Ninguna combinación tenía ventaja: la "mejor" solo tuvo suerte en ese tramo. Cuantas más pruebes, más espectacular parece el ganador y más grande es la decepción.'
      : 'Fuera de muestra todas vuelven hacia la ventaja real. La diferencia entre el backtest y la realidad es el precio de haber elegido entre muchas.');
});

/* --- walk-forward --- */
const renderWF = fig(function () {
  const host = $('#fig-bt-wf'); if (!host) return;
  const W = 900, H = 200, svg = svgIn(host, W, H, 'Esquema de validación walk-forward'), L = 120, w = W - L - 20, rows = 4, seg = w / 7;
  txt(svg, L, 14, 'Datos históricos →', { fill: COL.muted, 'font-size': 11 });
  for (let i = 0; i < rows; i++) {
    const y = 28 + i * 40;
    txt(svg, L - 10, y + 19, 'Ventana ' + (i + 1), { 'text-anchor': 'end', fill: COL.text2, 'font-size': 11.5 });
    el('rect', { x: L + i * seg, y, width: seg * 3 - 3, height: 28, rx: 5, fill: COL.accent, 'fill-opacity': 0.25, stroke: COL.accent }, svg);
    txt(svg, L + i * seg + seg * 1.5, y + 18, 'Optimizar', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600 });
    el('rect', { x: L + (i + 3) * seg, y, width: seg - 3, height: 28, rx: 5, fill: COL.up, 'fill-opacity': 0.3, stroke: COL.up }, svg);
    txt(svg, L + (i + 3.5) * seg, y + 18, 'Probar', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600 });
  }
  txt(svg, L + 3 * seg, H - 6, 'Solo cuentan los tramos verdes: datos que la optimización nunca vio.', { fill: COL.muted, 'font-size': 11 });
});

/* --- calculadora de métricas --- */
const SAMPLE = '2, -1, -1, 1.5, -1, 3, -1, -1, 2, -0.5, 1, -1, 2.5, -1, -1, -1, 2, 0, -1, 1.8, -1, 2, -1, 3.2, -1, -1, 1.5, -1, 2, -1';
const renderMetrics = fig(function () {
  const host = $('#fig-bt-eq'); if (!host) return;
  const rs = ($('#bt-rs').value || '').replace(/,(?=\d)/g, '.').split(/[\s;,]+|\n/).map(s => s.trim().replace(/r$/i, '')).filter(Boolean).map(Number).filter(v => !isNaN(v));
  if (!rs.length) { host.querySelectorAll('svg').forEach(s => s.remove()); $('#bt-out').innerHTML = ''; $('#bt-explain').textContent = 'Escribe o pega tus resultados en R, separados por espacios, comas o saltos de línea.'; return; }
  const s = rStats(rs), W = 900, H = 200, svg = svgIn(host, W, H, 'Curva de capital en R');
  const { X, Y } = equityPath(svg, s.curve, { x: 40, y: 14, w: W - 60, h: H - 40, color: s.sum >= 0 ? COL.up : COL.down });
  [Math.min(0, ...s.curve), 0, Math.max(0, ...s.curve)].forEach(v => txt(svg, 34, Y(v) + 4, R(v, 1), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10 }));
  txt(svg, X(s.curve.length - 1), H - 8, s.n + ' operaciones', { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 });
  const be = s.avgL ? s.avgL / (s.avgW + s.avgL) : 0;
  $('#bt-out').innerHTML = stats([['Operaciones', s.n], ['Resultado total', R(s.sum, 1)], ['Expectativa', R(s.exp)], ['% de acierto', pctS(s.wr)], ['R medio ganador / perdedor', (s.avgW.toFixed(2)) + ' / ' + s.avgL.toFixed(2)],
    ['Profit factor', isFinite(s.pf) ? s.pf.toFixed(2) : '∞'], ['Drawdown máximo', s.mdd.toFixed(1) + 'R'], ['Peor racha', s.ls + ' pérdidas'], ['Acierto mínimo con ese R:B', pctS(be, 1)]]);
  const msgs = [];
  if (s.n < 30) msgs.push(`Solo <strong>${s.n}</strong> operaciones: es una anécdota, no una estadística.`);
  else if (s.n < 100) msgs.push(`${s.n} operaciones: sirve para detectar problemas graves, todavía no para confirmar una ventaja.`);
  msgs.push(s.exp > 0 ? `Expectativa positiva de ${R(s.exp)} por operación.` : 'La expectativa es negativa o nula: antes de pensar en gestión, revisa la entrada.');
  if (s.wr < be) msgs.push('Tu % de acierto está por debajo del mínimo que exige tu R:B medio.');
  if (s.pf > 0 && s.pf < 1.2 && s.exp > 0) msgs.push('Profit factor bajo: los costos (spread, comisión) pueden comérselo.');
  msgs.push(`Con un drawdown de ${s.mdd.toFixed(1)}R, arriesgando 1% por operación habrías caído alrededor de un ${((1 - Math.pow(0.99, s.mdd)) * 100).toFixed(0)}%.`);
  $('#bt-explain').className = 'explain ' + (s.exp > 0 && s.n >= 30 ? 'good' : 'bad');
  $('#bt-explain').innerHTML = msgs.join(' ');
});

function initBacktest() {
  ['#bn-wr', '#bn-rr', '#bn-n'].forEach(s => $(s).addEventListener('input', renderSample));
  $('#bn-new').addEventListener('click', () => { bm.seed = newSeed(); renderSample(); });
  renderSample();
  ['#bo-k', '#bo-e'].forEach(s => $(s).addEventListener('input', renderOverfit));
  $('#bo-new').addEventListener('click', () => { bo.seed = newSeed(); renderOverfit(); });
  renderOverfit();
  renderWF();
  const ta = $('#bt-rs'); if (!ta.value) ta.value = SAMPLE;
  ta.addEventListener('input', renderMetrics);
  $('#bt-sample').addEventListener('click', () => { ta.value = SAMPLE; renderMetrics(); });
  renderMetrics();
  quiz($('#backtest-quiz'), 'Práctica: backtesting y validación', QUIZZES.backtest.qs);
}

export { renderSample, renderOverfit, renderWF, renderMetrics, initBacktest };
