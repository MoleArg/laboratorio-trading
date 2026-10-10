// Motor interactivo · ordenes. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, Player, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, lineSeries, marker, mulberry32, ohlcRows, quiz, segBind, tag, txt, vband, vline } from './core';
/* =====================================================================
   MÓDULO 17 · ÓRDENES Y COSTOS
   ===================================================================== */
const ordS = { t: 'bl', k: 19, cs: null };
function buildOrd() {
  const r = mulberry32(61), per = 5;
  const W = [[0, 101.2], [6, 100.4], [10, 101.4], [15, 99.8], [20, 100.0], [23, 99.2], [25, 98.6], [28, 100.3], [31, 101.8], [33, 102.8], [36, 101.6], [40, 103.0]];
  ordS.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p })), r, 0.08), per);
}
const ORD_N = { mkt: 'Compra a mercado', bl: 'Buy limit', bs: 'Buy stop', sl: 'Sell limit', ss: 'Sell stop' };
function ordFill(cs, t, lvl, slip) {
  for (let i = 20; i < cs.length; i++) {
    const c = cs[i];
    if (t === 'mkt') return { i, p: c.o };
    if (t === 'bl' && c.l <= lvl) return { i, p: Math.min(c.o, lvl) };
    if (t === 'bs' && c.h >= lvl) return { i, p: Math.max(c.o, lvl) + slip };
    if (t === 'sl' && c.h >= lvl) return { i, p: Math.max(c.o, lvl) };
    if (t === 'ss' && c.l <= lvl) return { i, p: Math.min(c.o, lvl) - slip };
  }
  return null;
}
const renderOrd = fig(function () {
  const host = $('#fig-ord'); if (!host) return;
  if (!ordS.cs) buildOrd();
  const cs = ordS.cs, n = cs.length, cur = cs[19].c, t = ordS.t, k = ordS.k;
  const lvl = cur + (+$('#ord-lvl').value) * 0.1, slip = $('#ord-fast').checked ? 0.25 : 0;
  $('#ord-lvl-v').textContent = t === 'mkt' ? '—' : lvl.toFixed(2);
  const buy = t === 'mkt' || t === 'bl' || t === 'bs';
  const wrong = (t === 'bl' || t === 'ss') ? lvl >= cur : (t === 'bs' || t === 'sl') ? lvl <= cur : false;
  const fill = wrong ? null : ordFill(cs, t, lvl, slip), done = fill && k >= fill.i;
  const [lo, hi] = extent(cs, [lvl]);
  const C = chart(host, { n: n + 2, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 0 }], aria: 'Simulador de órdenes' });
  const P = C.panels[0];
  vband(C, 20, n - 1, { op: 0.03, label: 'Futuro (se revela al simular)' });
  vline(C, 19.5, { color: COL.text2, dash: '0' });
  tag(P.g.lab, C.x(19.5), P.top + 12, 'Ahora ' + cur.toFixed(2), COL.text2, 'middle');
  if (t !== 'mkt') hline(C, P, lvl, { x1: 19, x2: n + 1, color: buy ? COL.up : COL.down, width: 1.8, label: ORD_N[t] + ' ' + lvl.toFixed(2), side: 'right', below: lvl < cur });
  drawCandles(C, P, cs.map((c, j) => j <= Math.max(19, k) ? c : null));
  if (done) marker(C, P, fill.i, fill.p, { shape: buy ? 'up' : 'down', color: buy ? COL.up : COL.down, size: 7, label: 'Ejecutada a ' + fill.p.toFixed(2), dy: buy ? 24 : -24 });
  hover(C, j => j < n && j <= Math.max(19, k) ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  let tx;
  if (wrong) tx = `<strong>Nivel en el lado equivocado:</strong> un ${ORD_N[t]} debe ir ${t === 'bl' || t === 'ss' ? 'por debajo' : 'por encima'} del precio actual. Si no, se ejecutaría al instante como orden a mercado (o la plataforma la rechaza).`;
  else if (k < 20) tx = 'Pulsa <strong>Simular</strong> para ver cómo se mueve el precio y si tu orden se ejecuta.';
  else if (!fill || !done) tx = k >= n - 1 ? '<strong>No se ejecutó:</strong> el precio nunca llegó a tu nivel. La orden sigue pendiente (y no tienes posición).' : 'Esperando a que el precio llegue al nivel…';
  else {
    const pnl = (cs[n - 1].c - fill.p) * (buy ? 1 : -1);
    const why = {
      mkt: 'Se ejecutó al instante, en la apertura de la vela siguiente: rapidez a cambio de aceptar el precio que haya.',
      bl: 'La orden límite compró en el retroceso, a tu precio o mejor. Ventaja: buen precio. Riesgo: si el precio no llega, te quedas fuera.',
      bs: `La orden stop se activó al superar el nivel y compró a mercado${slip ? ' (con deslizamiento: precio peor que el nivel)' : ''}. Entra a favor del movimiento, pero a peor precio.`,
      sl: 'La orden límite vendió cuando el precio subió hasta tu nivel (o mejor).',
      ss: `La orden stop vendió al perforar el nivel${slip ? ' (con deslizamiento)' : ''}… ¿y después? Si el precio gira, tu orden fue la liquidez que otro usó: así funcionan los barridos.`
    }[t];
    tx = why + ` Resultado al final del gráfico: <strong>${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</strong> por unidad.`;
  }
  $('#ord-explain').innerHTML = tx;
});

/* --- bid / ask --- */
let spBid = null;
const renderSpread = fig(function () {
  const host = $('#fig-spread'); if (!host) return;
  if (!spBid) spBid = bridgePath([[0, 1.0850], [10, 1.0858], [20, 1.0846], [24, 1.0852], [30, 1.0855], [40, 1.0849]].map(([b, p]) => ({ t: b, p })), mulberry32(71), 0.00012);
  const sp = +$('#sp-s').value / 10, news = $('#sp-news').checked, pip = 0.0001;
  $('#sp-s-v').textContent = sp.toFixed(1);
  const sprd = spBid.map((_, i) => (news && i >= 23 && i <= 26 ? sp * 8 : sp) * pip), ask = spBid.map((b, i) => b + sprd[i]);
  const bmaxN = Math.max(...spBid.slice(21, 29)), stopLvl = bmaxN + Math.max(sp * pip * 2.5, 2.2 * pip);
  const hitI = ask.findIndex((a, i) => i >= 21 && a >= stopLvl);
  const all = spBid.concat(ask, [stopLvl]), lo = Math.min(...all) - 2 * pip, hi = Math.max(...all) + 3 * pip;
  const C = chart(host, { n: spBid.length, panels: [{ h: 260, yMin: lo, yMax: hi, dec: 4, ticks: 4 }], aria: 'Bid, ask y spread' });
  const P = C.panels[0];
  let d = ''; spBid.forEach((b, i) => d += (i ? 'L' : 'M') + C.x(i).toFixed(1) + ' ' + P.y(ask[i]).toFixed(1));
  for (let i = spBid.length - 1; i >= 0; i--) d += 'L' + C.x(i).toFixed(1) + ' ' + P.y(spBid[i]).toFixed(1);
  el('path', { d: d + 'Z', fill: COL.liq, 'fill-opacity': 0.18 }, P.g.zone);
  lineSeries(C, P, spBid, { color: COL.text2, width: 2 }); lineSeries(C, P, ask, { color: COL.range, width: 2 });
  tag(P.g.lab, C.x(spBid.length - 1), P.y(spBid[spBid.length - 1]) + 12, 'Bid (gráfico)', COL.text2, 'end');
  tag(P.g.lab, C.x(spBid.length - 1), P.y(ask[ask.length - 1]) - 12, 'Ask', COL.range, 'end');
  marker(C, P, 8, ask[8], { shape: 'up', color: COL.up, size: 6, label: 'Compra al ask', dy: -18 });
  marker(C, P, 8, spBid[8], { color: COL.text2, size: 5, label: 'Valor al bid', dy: 18 });
  hline(C, P, stopLvl, { x1: 18, color: COL.down, width: 1.5, label: 'Stop de un corto', side: 'left' });
  if (hitI >= 0) marker(C, P, hitI, ask[hitI], { shape: 'down', color: COL.down, size: 6, label: 'El ask toca el stop', dy: -18 });
  hover(C, i => [['#', 'Tick ' + (i + 1)], ['Bid', spBid[i].toFixed(5)], ['Ask', ask[i].toFixed(5)], ['Spread', (sprd[i] / pip).toFixed(1) + ' pips']]);
  $('#sp-explain').innerHTML = `Spread de ${sp.toFixed(1)} pips = <strong>$${(sp * 10).toFixed(2)} por lote estándar</strong>: es lo que pierdes nada más comprar (compras al ask, tu posición vale al bid). ` +
    (hitI >= 0 ? 'En la noticia el spread se abre: el <strong>ask</strong> toca el stop del corto aunque la línea del gráfico (bid) nunca llegue ahí.' : 'Sin noticia, el spread es estable y el stop del corto no se toca.');
});

/* --- calculadoras --- */
const PIP_DEF = { xusd: 1.0850, usdx: 1.3650, usdjpy: 150.00, xjpy: 162.50 };
function renderPip() {
  const pair = $('#pip-pair').value, price = +$('#pip-price').value, jpy = +$('#pip-jpy').value, lots = +$('#pip-lots').value, mv = +$('#pip-move').value;
  const pipSize = pair === 'usdjpy' || pair === 'xjpy' ? 0.01 : 0.0001, units = lots * 100000;
  const pv = pair === 'xusd' ? units * pipSize : pair === 'usdx' ? units * pipSize / price : pair === 'usdjpy' ? units * pipSize / price : units * pipSize / jpy;
  $('#pip-out').innerHTML = [['Tamaño del pip', String(pipSize)], ['Unidades', Math.round(units).toLocaleString('es')], ['Valor del pip', '$' + (isFinite(pv) ? pv.toFixed(2) : '—')], [mv + ' pips', '$' + (isFinite(pv) ? (pv * mv).toFixed(2) : '—')]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const f = { xusd: 'unidades × 0,0001 (la cotizada ya es USD)', usdx: 'unidades × 0,0001 / precio (se convierte de la divisa cotizada a USD)', usdjpy: 'unidades × 0,01 / precio', xjpy: 'unidades × 0,01 / USDJPY (el valor está en yenes y se pasa a USD)' }[pair];
  $('#pip-explain').innerHTML = `Valor del pip = ${f}. Recuerda: el resultado depende del <strong>tamaño</strong> (lotes), no del apalancamiento.`;
}
const renderLev = fig(function () {
  const host = $('#fig-lev'); if (!host) return;
  const cap = Math.max(1, +$('#lv-cap').value || 1), lev = +$('#lv-lev').value, lots = Math.max(0.01, +$('#lv-lots').value || 0.01), price = +$('#lv-price').value || 1;
  const notional = lots * 100000 * price, margin = notional / lev, free = cap - margin, lvl = cap / margin * 100, eff = notional / cap, pv = lots * 10;
  const lossSO = cap - 0.5 * margin, pipsSO = lossSO / pv;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 900 90', role: 'img', 'aria-label': 'Uso del margen' });
  host.insertBefore(svg, host.firstChild);
  const W = 860, x0 = 20, mW = Math.min(1, margin / cap) * W;
  el('rect', { x: x0, y: 30, width: W, height: 26, rx: 5, fill: COL.surface3 }, svg);
  el('rect', { x: x0, y: 30, width: Math.max(2, mW), height: 26, rx: 5, fill: margin > cap ? COL.down : COL.range }, svg);
  txt(svg, x0, 22, 'Capital $' + cap.toLocaleString('es'), { fill: COL.muted, 'font-size': 11 });
  txt(svg, x0 + 6, 48, 'Margen usado $' + margin.toFixed(0), { fill: '#fff', 'font-size': 11, 'font-weight': 700 });
  if (margin < cap) txt(svg, x0 + W - 6, 48, 'Libre $' + free.toFixed(0), { fill: COL.text, 'font-size': 11, 'text-anchor': 'end' });
  txt(svg, x0, 80, `Valor de la posición: $${Math.round(notional).toLocaleString('es')} · apalancamiento efectivo ${eff.toFixed(1)}:1`, { fill: COL.text2, 'font-size': 11.5 });
  $('#lv-out').innerHTML = [['Margen requerido', '$' + margin.toFixed(2)], ['Nivel de margen', isFinite(lvl) ? lvl.toFixed(0) + '%' : '—'], ['Valor del pip', '$' + pv.toFixed(2)], ['1% de movimiento', '$' + (notional * 0.01).toFixed(0) + ' (' + (notional * 0.01 / cap * 100).toFixed(1) + '% de la cuenta)'], ['Pips hasta stop out (50%)', margin > cap ? '—' : pipsSO.toFixed(0)]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#lv-explain').className = 'explain ' + (margin > cap || eff > 10 ? 'bad' : 'good');
  $('#lv-explain').innerHTML = margin > cap ? '<strong>No alcanza el margen:</strong> esta posición necesita más capital del que tienes con este apalancamiento.'
    : `Con apalancamiento efectivo de ${eff.toFixed(1)}:1, un movimiento del 1% en el precio equivale a un <strong>${(eff).toFixed(1)}%</strong> de tu cuenta. ` + (eff > 10 ? 'Es mucho: unas pocas operaciones malas pueden vaciar la cuenta.' : 'Es un nivel prudente.') + ' Cambia el apalancamiento máximo: el margen cambia, pero el valor del pip y el riesgo real no.';
});
function renderCost() {
  const sp = +$('#ct-sp').value, com = +$('#ct-com').value, sw = +$('#ct-sw').value, nights = +$('#ct-n').value, lots = +$('#ct-lots').value, tr = +$('#ct-tr').value, cap = Math.max(1, +$('#ct-cap').value);
  const cSp = sp * 10 * lots, cCom = com * lots, cSw = -sw * lots * nights, per = cSp + cCom + cSw, month = per * tr, pipsNeed = per / (lots * 10);
  $('#ct-out').innerHTML = [['Spread por operación', '$' + cSp.toFixed(2)], ['Comisión por operación', '$' + cCom.toFixed(2)], ['Swap por operación', (cSw >= 0 ? '$' : '−$') + Math.abs(cSw).toFixed(2)], ['Costo total al mes', '$' + month.toFixed(0) + ' (' + (month / cap * 100).toFixed(1) + '% del capital)'], ['Pips para cubrir costos', pipsNeed.toFixed(1) + ' por operación']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#ct-explain').innerHTML = `Cada operación necesita moverse <strong>${pipsNeed.toFixed(1)} pips</strong> a tu favor solo para quedar en cero. Con ${tr} operaciones al mes eso son $${month.toFixed(0)}. Si tu estrategia busca pocos pips por operación, los costos pueden ser la diferencia entre ganar y perder.`;
}
function initOrdenes() {
  const pl = new Player(k => { ordS.k = k; renderOrd(); }, 160);
  segBind($('#ord-tipos'), (k, v) => { ordS.t = v; pl.stop(); ordS.k = 19; renderOrd(); });
  ['#ord-lvl', '#ord-fast'].forEach(s => $(s).addEventListener('input', () => { pl.stop(); ordS.k = 19; renderOrd(); }));
  $('#ord-play').addEventListener('click', () => pl.play(39, 19));
  renderOrd();
  ['#sp-s', '#sp-news'].forEach(s => $(s).addEventListener('input', renderSpread)); renderSpread();
  $('#pip-pair').addEventListener('change', () => { $('#pip-price').value = PIP_DEF[$('#pip-pair').value]; renderPip(); });
  ['#pip-price', '#pip-jpy', '#pip-lots', '#pip-move'].forEach(s => $(s).addEventListener('input', renderPip)); renderPip();
  ['#lv-cap', '#lv-lots', '#lv-price'].forEach(s => $(s).addEventListener('input', renderLev)); $('#lv-lev').addEventListener('change', renderLev); renderLev();
  ['#ct-sp', '#ct-com', '#ct-sw', '#ct-n', '#ct-lots', '#ct-tr', '#ct-cap'].forEach(s => $(s).addEventListener('input', renderCost)); renderCost();
  quiz($('#ordenes-quiz'), 'Práctica: órdenes y costos', QUIZZES["ordenes"].qs);
}

export { ordS, buildOrd, ORD_N, ordFill, renderOrd, spBid, renderSpread, PIP_DEF, renderPip, renderLev, renderCost, initOrdenes };
