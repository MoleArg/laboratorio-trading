// Motor interactivo · order flow: delta, CVD y footprint (ampliación del módulo de volumen).
import { $, COL, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, lineSeries, mulberry32, ohlcRows, segBind, txt, vband } from './core';
import { svgIn } from './kit';

const OF_SC = {
  sano: { w: [[0, 100], [8, 101.4], [12, 100.9], [22, 103.2], [26, 102.6], [36, 105.2], [40, 105]], d: (k, body, r) => body * 900 + (r() - 0.5) * 220,
    t: 'Tendencia sana: las velas alcistas llegan con <strong>delta positivo</strong> (más compras agresivas que ventas) y el CVD sube junto al precio. Compradores y precio cuentan la misma historia.', win: null },
  absorb: { w: [[0, 100], [10, 102.6], [14, 103.4], [26, 103.6], [30, 102.4], [40, 100.4]], d: (k, body, r) => k >= 14 && k <= 26 ? 650 + r() * 300 : body * 900 + (r() - 0.5) * 220,
    t: 'Entre las velas 15 y 27 el delta es <strong>muy positivo</strong>: los compradores pegan a mercado una y otra vez… y el precio no avanza. Hay vendedores pasivos (órdenes límite) absorbiéndolo todo. Cuando los compradores se cansan, el precio cae. Es la absorción de Wyckoff, vista por dentro.', win: [14, 26] },
  div: { w: [[0, 100], [10, 102.2], [14, 101.6], [24, 103.4], [28, 102.9], [34, 104], [36, 103.7], [40, 102.4]], d: (k, body, r) => body * 900 * (k > 22 ? 0.25 : 1) - (k > 22 ? 260 : 0) + (r() - 0.5) * 220,
    t: 'El precio hace <strong>máximos más altos</strong> en las velas 25 y 35, pero el CVD hace máximos más bajos: cada nuevo máximo tiene menos compras agresivas detrás. Es una divergencia de CVD, parecida a la del RSI pero medida en órdenes.', win: [22, 36] }
};
const of = { sc: 'sano', sel: 20, data: null };
function buildOF() {
  const S = OF_SC[of.sc], r = mulberry32(13), cs = candlesFromPath(bridgePath(S.w.map(([t, p]) => ({ t: t * 6, p })), r, 0.07), 6);
  const vol = cs.map(c => 1200 + 2400 * (c.h - c.l)), delta = cs.map((c, k) => Math.max(-0.9, Math.min(0.9, S.d(k, c.c - c.o, r) / vol[k])) * vol[k]);
  const cvd = []; delta.reduce((a, d, i) => (cvd[i] = a + d), 0);
  of.data = { cs, vol, delta, cvd };
}
const renderOF = fig(function () {
  const host = $('#fig-vol-flow'); if (!host) return;
  if (!of.data) buildOF();
  const { cs, delta, cvd } = of.data, S = OF_SC[of.sc], [lo, hi] = extent(cs), dm = Math.max(...delta.map(Math.abs)) * 1.15, cl = Math.min(...cvd), ch = Math.max(...cvd), pad = (ch - cl) * 0.12 || 1;
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 230, yMin: lo, yMax: hi, dec: 1 }, { h: 90, yMin: -dm, yMax: dm, grid: false, title: 'Delta por vela' }, { h: 100, yMin: cl - pad, yMax: ch + pad, grid: false, title: 'CVD (delta acumulado)' }], aria: 'Precio, delta y CVD' });
  const [P, PD, PC] = C.panels;
  if (S.win) vband(C, S.win[0], S.win[1], { op: 0.06 });
  vband(C, of.sel, of.sel, { color: COL.accent, op: 0.12 });
  hline(C, PD, 0, { color: COL.axis, width: 1, dash: false });
  drawCandles(C, P, cs);
  delta.forEach((d, j) => el('rect', { x: C.x(j) - C.bw / 2, y: Math.min(PD.y(0), PD.y(d)), width: C.bw, height: Math.abs(PD.y(d) - PD.y(0)), fill: d >= 0 ? COL.up : COL.down, 'fill-opacity': 0.75 }, PD.g.data));
  lineSeries(C, PC, cvd, { color: COL.strong, width: 2 });
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1) + ' · clic para el footprint']].concat(ohlcRows(cs[j], 2), [['Delta', Math.round(delta[j]).toLocaleString('es')], ['CVD', Math.round(cvd[j]).toLocaleString('es')]]) : null);
  const cap = C.hoverG.firstChild;
  cap.addEventListener('click', e => { const rc = C.svg.getBoundingClientRect(), sx = (e.clientX - rc.left) * (C.w / rc.width), i = Math.floor((sx - C.padL) / C.step); if (cs[i]) { of.sel = i; renderOF(); } });
  cap.style.cursor = 'pointer';
  $('#of-explain').innerHTML = S.t;
  renderFootprint();
});

/* footprint de la vela seleccionada: volumen en el bid (ventas agresivas) y en el ask (compras agresivas) por nivel */
function renderFootprint() {
  const host = $('#fig-vol-fp'); if (!host || !of.data) return;
  const { cs, vol, delta } = of.data, i = of.sel, c = cs[i], tick = 0.1, r = mulberry32(100 + i);
  const top = Math.ceil(c.h / tick) * tick, bot = Math.floor(c.l / tick) * tick, n = Math.max(1, Math.round((top - bot) / tick));
  const poc = (c.o + c.c) / 2, buyShare = 0.5 + 0.5 * delta[i] / vol[i], rows = [];
  for (let k = 0; k < n; k++) {
    const p = top - (k + 0.5) * tick, w = Math.exp(-Math.pow((p - poc) / ((c.h - c.l) * 0.35 + 0.05), 2)) * (0.7 + 0.6 * r());
    const tilt = (p - (c.h + c.l) / 2) / ((c.h - c.l) || 1) * (c.c >= c.o ? 0.25 : -0.25);
    rows.push({ p, w, b: Math.min(0.95, Math.max(0.05, buyShare + tilt + (r() - 0.5) * 0.2)) });
  }
  const tw = rows.reduce((s, x) => s + x.w, 0);
  rows.forEach(x => { const v = vol[i] * x.w / tw; x.ask = Math.round(v * x.b); x.bid = Math.round(v * (1 - x.b)); });
  const mxV = Math.max(...rows.map(x => x.ask + x.bid)), pocRow = rows.reduce((a, x) => x.ask + x.bid > a.ask + a.bid ? x : a, rows[0]);
  const W = 520, rh = 22, H = n * rh + 46, svg = svgIn(host, W, H, 'Footprint de la vela ' + (i + 1)), x0 = 90, cw = 150;
  txt(svg, x0 + cw / 2, 16, 'Bid (ventas)', { 'text-anchor': 'middle', fill: COL.down, 'font-size': 11.5, 'font-weight': 700 });
  txt(svg, x0 + cw * 1.5 + 6, 16, 'Ask (compras)', { 'text-anchor': 'middle', fill: COL.up, 'font-size': 11.5, 'font-weight': 700 });
  rows.forEach((x, k) => {
    const y = 26 + k * rh, imbB = x.bid > 3 * Math.max(1, x.ask), imbA = x.ask > 3 * Math.max(1, x.bid);
    txt(svg, x0 - 10, y + 15, x.p.toFixed(2), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5, 'font-family': 'Consolas, monospace' });
    el('rect', { x: x0, y, width: cw, height: rh - 2, fill: COL.down, 'fill-opacity': 0.06 + 0.4 * x.bid / mxV, stroke: imbB ? COL.down : 'none', 'stroke-width': 2 }, svg);
    el('rect', { x: x0 + cw + 6, y, width: cw, height: rh - 2, fill: COL.up, 'fill-opacity': 0.06 + 0.4 * x.ask / mxV, stroke: imbA ? COL.up : 'none', 'stroke-width': 2 }, svg);
    txt(svg, x0 + cw - 8, y + 15, String(x.bid), { 'text-anchor': 'end', 'font-size': 11, 'font-family': 'Consolas, monospace', 'font-weight': imbB ? 700 : 400 });
    txt(svg, x0 + cw + 14, y + 15, String(x.ask), { 'font-size': 11, 'font-family': 'Consolas, monospace', 'font-weight': imbA ? 700 : 400 });
    if (x === pocRow) txt(svg, x0 + cw * 2 + 14, y + 15, '← POC', { fill: COL.liq, 'font-size': 10.5, 'font-weight': 700 });
  });
  const d = Math.round(delta[i]);
  txt(svg, x0, H - 6, `Vela ${i + 1} · volumen ${Math.round(vol[i]).toLocaleString('es')} · delta ${d >= 0 ? '+' : ''}${d.toLocaleString('es')}`, { fill: COL.text2, 'font-size': 11 });
}

function initOrderflow() {
  segBind($('#vol-flow'), (k, v) => { of.sc = v; of.sel = OF_SC[v].win ? OF_SC[v].win[0] + 4 : 20; buildOF(); renderOF(); });
  renderOF();
}

export { OF_SC, buildOF, renderOF, renderFootprint, initOrderflow };
