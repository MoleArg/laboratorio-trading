// Motor interactivo · segundo escenario guiado de «Todo junto»: venta con SMC en premium.
import { QUIZZES } from './shared';
import { $, COL, argExt, bridgePath, candlesFromPath, chart, drawCandles, extent, fig, hline, hover, marker, mulberry32, ohlcRows, quiz, zone } from './core';
import { tri } from './liquidez';

// precios en pips sobre 1.08000; las velas 35–42 (barrido, desplazamiento y FVG) están dibujadas a mano
let BR = null;
function buildBear() {
  const r = mulberry32(73), per = 4;
  const pre = candlesFromPath(bridgePath([[0, 50], [8, 12], [14, 46], [18, 32], [24, 68.6], [27, 57], [30, 68.8], [33, 59], [35, 62]].map(([b, p]) => ({ t: b * per, p })), r, 0.7), per);
  const mid = [[62, 67, 61, 66], [66, 84, 65, 72], [72, 74, 63, 64], [64, 65, 52, 53], [53, 55, 46, 48], [48, 57, 47, 56], [56, 59.5, 50, 51], [51, 52, 42, 43]].map(a => ({ o: a[0], h: a[1], l: a[2], c: a[3] }));
  const post = candlesFromPath(bridgePath([[0, 43], [4, 47.5], [9, 30], [14, 9]].map(([b, p]) => ({ t: b * per, p })), r, 0.8), per);
  const cs = pre.slice(0, 34).concat(mid, post);
  const lows = cs.map(c => c.l), highs = cs.map(c => c.h);
  const ssl = argExt(lows, 4, 11, 'min'), e1 = argExt(highs, 22, 26, 'max'), e2 = argExt(highs, 28, 32, 'max'), hl = argExt(lows, 31, 35, 'min');
  const eqh = Math.max(cs[e1].h, cs[e2].h), sweep = 35, fvgTop = cs[sweep + 1].l, fvgBot = cs[sweep + 3].h, entry = (fvgTop + fvgBot) / 2, stop = cs[sweep].h + 2;
  const tpI = cs.findIndex((c, i) => i > 42 && c.l <= cs[ssl].l);
  BR = { cs, ssl, e1, e2, hl, eqh, sweep, fvgTop, fvgBot, entry, stop, tpI: tpI < 0 ? cs.length - 1 : tpI };
}
const BEAR_STEPS = [
  ['1 · Contexto: sesgo bajista y zona premium', 'El diario y el 4H son bajistas. El precio rebota hacia un <strong>order block bajista de 4H</strong> que queda en premium. No vendemos en cualquier sitio: esperamos a que el rebote llegue a esa zona.'],
  ['2 · ¿Dónde está la liquidez?', 'Justo debajo de la zona hay <strong>máximos iguales</strong> (EQH): stops de quienes vendieron antes de tiempo y órdenes de compra de quienes esperan la ruptura. Es el inducement. Abajo, el mínimo previo acumula SSL: nuestro objetivo.'],
  ['3 · Barrido y llegada a la zona', 'Una vela perfora los máximos iguales, toma esa liquidez y entra en el order block… y cierra de nuevo por debajo. Es un barrido, no una ruptura: lo dice el cierre.'],
  ['4 · Confirmación: MSS y FVG', 'Desplazamiento bajista que rompe el último mínimo más alto (<strong>MSS</strong>) y deja un <strong>FVG</strong> entre las velas 37 y 39. La intención vendedora queda a la vista.'],
  ['5 · Entrada, stop y objetivo', 'Orden límite en el 50% del FVG, stop por encima del máximo del barrido y objetivo en la SSL del mínimo previo.'],
  ['6 · Resultado', 'El precio toca el FVG, gira y toma la liquidez del mínimo previo. Ojo: en el backtest se ve limpio porque sabes cómo termina. En vivo, la vela 36 también podía haber sido el inicio de una ruptura; por eso se espera al MSS y se arriesga una fracción pequeña.']
];
const brS = { step: 0 };
const renderBear = fig(function () {
  const host = $('#fig-todo-bear'); if (!host) return;
  if (!BR) buildBear();
  const st = brS.step, K = [33, 33, 35, 38, 40, BR.cs.length - 1][st], pr = v => 1.08 + v * 1e-4, b = BR;
  const cs = b.cs.map(c => ({ o: pr(c.o), h: pr(c.h), l: pr(c.l), c: pr(c.c) })), [lo, hi] = extent(cs, [pr(88)]);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 4, title: 'EUR/USD · 15 minutos' }], aria: 'Escenario bajista con SMC' });
  const P = C.panels[0];
  zone(C, P, pr(76), pr(87), { x1: 0, color: COL.ob, op: 0.16, label: 'Order block bajista 4H (premium)' });
  if (st >= 1) {
    hline(C, P, pr(b.eqh), { x1: b.e1, x2: Math.min(K, b.sweep), color: COL.liq, width: 1.3, label: 'EQH · inducement', side: 'left' });
    hline(C, P, pr(b.cs[b.ssl].l), { x1: b.ssl, color: COL.liq, width: 1.3, label: 'SSL · objetivo', side: 'left', below: true });
    for (let q = 0; q < 5; q++) tri(P.g.ann, C.x(b.e1 + 1 + q * 1.2), P.y(pr(b.eqh + 1 + (q % 2) * 1.2)), true, st < 2, COL.liq, 4);
  }
  if (st >= 2) marker(C, P, b.sweep, cs[b.sweep].h, { shape: 'down', color: COL.liq, size: 5, label: 'Barrido', dy: -18 });
  if (st >= 3) {
    hline(C, P, pr(b.cs[b.hl].l), { x1: b.hl, x2: b.sweep + 4, color: COL.text2, width: 1.4, dash: '4 3', label: 'MSS', side: 'right', below: true });
    zone(C, P, pr(b.fvgBot), pr(b.fvgTop), { x1: b.sweep + 2, x2: Math.min(K + 2, cs.length - 1), color: COL.fvg, op: 0.25 });
  }
  if (st >= 4) {
    const e = b.sweep + 5;
    zone(C, P, pr(b.entry), pr(b.stop), { x1: e, color: COL.down, op: 0.14 });
    zone(C, P, pr(b.entry), pr(b.cs[b.ssl].l), { x1: e, color: COL.up, op: 0.08 });
    hline(C, P, pr(b.entry), { x1: e, color: COL.entry, dash: false, width: 1.5, label: 'Entrada', side: 'right' });
    hline(C, P, pr(b.stop), { x1: e, color: COL.down, dash: false, width: 1.5, label: 'Stop', side: 'right' });
  }
  if (st >= 5) marker(C, P, b.tpI, cs[b.tpI].l, { color: COL.up, size: 6, label: 'Objetivo', dy: 18 });
  drawCandles(C, P, cs.map((c, j) => j <= K ? c : null));
  hover(C, j => j > K || !cs[j] ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 5)));
  const risk = b.stop - b.entry, rew = b.entry - b.cs[b.ssl].l;
  $('#bear-step').innerHTML = `<h4>${BEAR_STEPS[st][0]}</h4><div>${BEAR_STEPS[st][1]}${st === 4 ? ` Riesgo ${risk.toFixed(1)} pips para buscar ${rew.toFixed(1)}: R:B 1 : ${(rew / risk).toFixed(1)}.` : ''}</div>`;
  $('#bear-dots').innerHTML = BEAR_STEPS.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#bear-prev').disabled = st === 0; $('#bear-next').disabled = st === BEAR_STEPS.length - 1;
});

function initTodoBear() {
  $('#bear-prev').addEventListener('click', () => { brS.step = Math.max(0, brS.step - 1); renderBear(); });
  $('#bear-next').addEventListener('click', () => { brS.step = Math.min(BEAR_STEPS.length - 1, brS.step + 1); renderBear(); });
  renderBear();
  quiz($('#todo-quiz'), 'Práctica: el escenario completo', QUIZZES.todo.qs);
}

export { buildBear, BEAR_STEPS, renderBear, initTodoBear };
