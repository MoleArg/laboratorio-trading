// Motor interactivo · opciones y perpetuos (ampliación del módulo de mercados).
import { $, COL, el, fig, segBind, segVal, txt } from './core';
import { money, stats, svgIn } from './kit';

/* --- diagrama de pago de una opción al vencimiento --- */
const renderOption = fig(function () {
  const host = $('#fig-mk-opt'); if (!host) return;
  const root = $('#mk-opciones'), type = segVal(root, 'op-type') || 'call', side = segVal(root, 'op-side') || 'buy';
  const K = +$('#op-k').value, prem = +$('#op-p').value / 2, S0 = 100, mult = 100, sg = side === 'buy' ? 1 : -1;
  $('#op-k-v').textContent = '$' + K; $('#op-p-v').textContent = '$' + prem.toFixed(1);
  const pay = S => sg * ((type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S)) - prem) * mult;
  const W = 900, H = 300, L = 70, R = 20, T = 16, B = 34, svg = svgIn(host, W, H, 'Ganancia o pérdida al vencimiento');
  const sMin = 70, sMax = 130, vals = []; for (let s = sMin; s <= sMax; s += 0.5) vals.push([s, pay(s)]);
  const yAbs = Math.max(...vals.map(v => Math.abs(v[1])), prem * mult * 1.5), X = s => L + (s - sMin) / (sMax - sMin) * (W - L - R), Y = v => T + (yAbs - v) / (2 * yAbs) * (H - T - B);
  el('rect', { x: L, y: T, width: W - L - R, height: Y(0) - T, fill: COL.up, 'fill-opacity': 0.05 }, svg);
  el('rect', { x: L, y: Y(0), width: W - L - R, height: H - B - Y(0), fill: COL.down, 'fill-opacity': 0.05 }, svg);
  el('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: COL.axis }, svg);
  [70, 80, 90, 100, 110, 120, 130].forEach(s => { el('line', { x1: X(s), x2: X(s), y1: T, y2: H - B, stroke: COL.grid }, svg); txt(svg, X(s), H - B + 16, '$' + s, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10.5 }); });
  [-1, -0.5, 0.5, 1].forEach(f => txt(svg, L - 6, Y(f * yAbs) + 4, money(f * yAbs), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 }));
  txt(svg, (W + L) / 2, H - 4, 'Precio del activo al vencimiento', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  el('path', { d: vals.map(([s, v], i) => (i ? 'L' : 'M') + X(s).toFixed(1) + ' ' + Y(v).toFixed(1)).join(''), fill: 'none', stroke: COL.strong, 'stroke-width': 2.6 }, svg);
  el('line', { x1: X(K), x2: X(K), y1: T, y2: H - B, stroke: COL.liq, 'stroke-dasharray': '4 3' }, svg); txt(svg, X(K) + 4, T + 12, 'Strike', { fill: COL.liq, 'font-size': 10.5, 'font-weight': 700 });
  el('line', { x1: X(S0), x2: X(S0), y1: T, y2: H - B, stroke: COL.text2, 'stroke-dasharray': '2 4' }, svg); txt(svg, X(S0) + 4, H - B - 6, 'Precio hoy', { fill: COL.text2, 'font-size': 10.5 });
  const be = type === 'call' ? K + prem : K - prem;
  el('circle', { cx: X(be), cy: Y(0), r: 5, fill: COL.strong }, svg); txt(svg, X(be), Y(0) - 10, 'equilibrio $' + be.toFixed(1), { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700 });
  const cost = prem * mult, unl = (type === 'call');
  const maxG = side === 'buy' ? (unl ? 'Ilimitada' : money((K - prem) * mult)) : money(cost), maxL = side === 'buy' ? money(-cost) : (unl ? 'Ilimitada' : money(-(K - prem) * mult));
  $('#op-out').innerHTML = stats([[side === 'buy' ? 'Pagas de prima' : 'Cobras de prima', money(cost)], ['Punto de equilibrio', '$' + be.toFixed(1)], ['Ganancia máxima', maxG], ['Pérdida máxima', maxL]]);
  const name = (side === 'buy' ? 'Compra' : 'Venta') + ' de ' + (type === 'call' ? 'call' : 'put');
  $('#op-explain').className = 'explain ' + (side === 'sell' && unl ? 'bad' : '');
  $('#op-explain').innerHTML = `<strong>${name}</strong>, strike $${K}, 1 contrato = 100 acciones. ` + (side === 'buy'
    ? `Tu pérdida máxima es la prima. Necesitas que el precio ${type === 'call' ? 'suba por encima de' : 'baje por debajo de'} $${be.toFixed(1)} antes del vencimiento solo para cubrirla: no basta con acertar la dirección, también el cuánto y el cuándo.`
    : `Cobras la prima por adelantado y ganas si el precio ${type === 'call' ? 'no sube' : 'no baja'} mucho. A cambio asumes una pérdida ${unl ? '<strong>ilimitada</strong>' : 'grande'} si se mueve fuerte en tu contra. La mayoría de las veces ganas poco; pocas veces pierdes mucho.`);
});

/* --- funding de un perpetuo --- */
const renderFunding = fig(function () {
  const host = $('#mk-fund-out'); if (!host) return;
  const size = +$('#fd-size').value || 0, rate = +$('#fd-rate').value || 0, days = +$('#fd-days').value || 0, lev = +$('#fd-lev').value || 1;
  const side = segVal($('#mk-perp'), 'fd-side') || 'long', sg = side === 'long' ? -1 : 1, n = days * 3, total = sg * size * rate / 100 * n, margin = size / lev;
  host.innerHTML = stats([['Pagos de funding', n + ' (cada 8 h)'], [total < 0 ? 'Pagas en total' : 'Cobras en total', money(Math.abs(total), 2)], ['Sobre tu margen', (total / margin * 100).toFixed(1) + '%'], ['Tasa anualizada', (rate * 3 * 365).toFixed(1) + '%']]);
  $('#fd-explain').className = 'explain ' + (total < 0 && Math.abs(total / margin) > 0.05 ? 'bad' : '');
  $('#fd-explain').innerHTML = (rate >= 0 ? 'Funding positivo: el perpetuo cotiza por encima del contado y <strong>los largos pagan a los cortos</strong>. ' : 'Funding negativo: el perpetuo cotiza por debajo del contado y <strong>los cortos pagan a los largos</strong>. ') +
    `Con ${lev}x de apalancamiento el funding se calcula sobre la posición completa ($${size.toLocaleString('es')}), no sobre tu margen ($${margin.toLocaleString('es')}): por eso pesa tanto si mantienes la posición días o semanas.`;
});

function initDerivados() {
  segBind($('#mk-opciones'), () => renderOption());
  ['#op-k', '#op-p'].forEach(s => $(s).addEventListener('input', renderOption)); renderOption();
  segBind($('#mk-perp'), () => renderFunding());
  ['#fd-size', '#fd-rate', '#fd-days', '#fd-lev'].forEach(s => $(s).addEventListener('input', renderFunding)); renderFunding();
}

export { renderOption, renderFunding, initDerivados };
