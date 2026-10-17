// Motor interactivo · conceptos ICT adicionales (ampliación del módulo SMC):
// IFVG, volume imbalance, liquidity void, gaps de apertura (NWOG/NDOG), Silver Bullet y Market Maker Model.
import { $, COL, bridgePath, candlesFromPath, chart, drawCandles, extent, fig, hline, hover, marker, mulberry32, ohlcRows, segBind, txt, vband, vline, zone } from './core';
import { mirrorC, toC } from './liquidez';
import { zonedToUtc } from '../time';
import { localTZ } from './sesiones';

/* --- más PD arrays --- */
const PD = {
  ifvg: { cs: [[100, 100.6, 99.8, 100.4], [100.4, 100.6, 100.1, 100.3], [100.3, 102, 100.2, 101.8], [101.8, 102.4, 101, 102.2], [102.2, 102.5, 101.6, 101.7], [101.7, 101.9, 100.9, 101.1], [101.1, 101.2, 100, 100.2], [100.2, 100.5, 99.7, 99.9], [99.9, 100.85, 99.8, 100.7], [100.7, 100.9, 100.1, 100.2], [100.2, 100.3, 99.2, 99.4], [99.4, 99.6, 98.6, 98.8]],
    d: 'Las velas 2–4 dejan un <strong>FVG alcista</strong> (entre 100,6 y 101,0). En la vela 7 un cuerpo <strong>cierra por debajo</strong> del FVG: el hueco falló como soporte. A partir de ahí se lee como un <strong>IFVG</strong> (inversion FVG): la zona cambia de papel y actúa como resistencia. El retesteo desde abajo (vela 9) es la entrada en venta.',
    draw(C, P) { zone(C, P, 100.6, 101, { x1: 1, x2: 6, color: COL.up, op: 0.2, label: 'FVG alcista' }); zone(C, P, 100.6, 101, { x1: 6, x2: 11, color: COL.down, op: 0.2, label: 'IFVG (ahora resistencia)', labelBelow: true }); marker(C, P, 6, 100.2, { shape: 'down', color: COL.down, size: 5, label: 'Cierre por debajo', dy: 22 }); marker(C, P, 8, 100.85, { shape: 'down', color: COL.text, size: 5, label: 'Retesteo', dy: -18 }); } },
  vi: { cs: [[101, 101.3, 100.4, 100.6], [100.6, 100.8, 100, 100.2], [100.2, 100.5, 99.8, 100.4], [100.7, 101.4, 100.3, 101.2], [101.2, 101.9, 101.1, 101.8], [101.8, 102, 101.3, 101.4], [101.4, 101.5, 100.6, 100.7], [100.7, 101.6, 100.5, 101.5], [101.5, 102.4, 101.4, 102.3], [102.3, 102.9, 102.1, 102.8]],
    d: 'Entre las velas 3 y 4 los <strong>cuerpos no se tocan</strong> (cierre 100,4 y apertura 100,7), aunque las mechas sí se solapan. Ese hueco entre cuerpos es un <strong>volume imbalance</strong>: un precio en el que casi no se negoció. Es más pequeño que un FVG y funciona igual: el precio suele volver a tocarlo (vela 7) antes de seguir.',
    draw(C, P) { zone(C, P, 100.4, 100.7, { x1: 2, x2: 9, color: COL.fvg, op: 0.25, label: 'Volume imbalance', labelBelow: true }); marker(C, P, 6, 100.6, { shape: 'up', color: COL.text, size: 5, label: 'Vuelve a tocarlo', dy: 20 }); } },
  void: { cs: [[100, 100.3, 99.8, 100.1], [100.1, 100.4, 99.9, 100.2], [100.2, 101.6, 100.15, 101.5], [101.5, 103, 101.45, 102.9], [102.9, 104.3, 102.85, 104.2], [104.2, 104.6, 103.9, 104.1], [104.1, 104.3, 103.2, 103.4], [103.4, 103.5, 102.4, 102.6], [102.6, 102.8, 101.6, 101.8], [101.8, 102.4, 101.5, 102.3], [102.3, 103.1, 102.2, 103]],
    d: 'Tres velas grandes seguidas en la misma dirección, casi sin mechas ni solapamiento: un <strong>liquidity void</strong>. El precio pasó tan rápido que no hubo negociación en los dos sentidos. Igual que los FVG, esos tramos tienden a <strong>reequilibrarse</strong>: el precio vuelve a recorrer parte del vacío (aquí hasta su 50%) antes de decidir.',
    draw(C, P) { zone(C, P, 100.4, 104.2, { x1: 2, x2: 10, color: COL.fvg, op: 0.1, label: 'Liquidity void' }); hline(C, P, 102.3, { x1: 2, x2: 10, color: COL.mid, width: 1, dash: '2 4', label: '50%', side: 'right' }); } }
};
let pdSel = 'ifvg';
const renderPDA = fig(function () {
  const host = $('#fig-smc-pd'); if (!host) return;
  const S = PD[pdSel], cs = S.cs.map(toC), [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length + 2, panels: [{ h: 280, yMin: lo, yMax: hi, dec: 1 }], aria: 'PD arrays' });
  const P = C.panels[0];
  S.draw(C, P); drawCandles(C, P, cs);
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  $('#pda-explain').innerHTML = S.d;
});

/* --- gaps de apertura: NWOG --- */
const renderGap = fig(function () {
  const host = $('#fig-smc-gap'); if (!host) return;
  const r = mulberry32(61), fri = candlesFromPath(bridgePath([[0, 99.2], [5, 100.3], [10, 99.7], [14, 100]].map(([b, p]) => ({ t: b * 4, p })), r, 0.06), 4);
  const mon = candlesFromPath(bridgePath([[0, 100.9], [6, 101.3], [12, 101.7], [20, 100.5], [24, 100.75], [30, 101.9], [36, 102.4]].map(([b, p]) => ({ t: b * 4, p })), r, 0.06), 4);
  const cs = fri.concat([null], mon), k = fri.length, top = mon[0].o, bot = fri[k - 1].c, ce = (top + bot) / 2, [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 280, yMin: lo, yMax: hi, dec: 2, title: 'Futuro del índice · velas de 1 hora' }], aria: 'New week opening gap' });
  const P = C.panels[0];
  vband(C, 0, k - 1, { op: 0.03, label: 'Viernes' }); vband(C, k + 1, cs.length - 1, { op: 0.015, label: 'Lunes y martes' }); vline(C, k, { color: COL.muted });
  zone(C, P, bot, top, { x1: k - 1, color: COL.liq, op: 0.14, label: 'NWOG' });
  hline(C, P, ce, { x1: k - 1, color: COL.liq, width: 1.3, dash: '4 3', label: 'CE (50%)', side: 'right', below: true });
  drawCandles(C, P, cs);
  const ix = k + 1 + 19; if (mon[19]) marker(C, P, ix, mon[19].l, { shape: 'up', color: COL.text, size: 5, label: 'Reacción en el CE', dy: 20 });
  hover(C, j => cs[j] ? [['#', j < k ? 'Viernes' : 'Semana nueva']].concat(ohlcRows(cs[j], 2)) : null);
});

/* --- Silver Bullet --- */
const SB = [[100, 100.3, 99.7, 100.2], [100.2, 100.6, 100.1, 100.5], [100.5, 100.8, 100.3, 100.7], [100.7, 100.85, 100.4, 100.5], [100.5, 100.84, 100.3, 100.4], [100.4, 100.5, 100, 100.1], [100.1, 100.2, 99.75, 99.9], [99.9, 100, 99.45, 99.6], [99.6, 100.1, 99.5, 100], [100, 100.75, 99.95, 100.7], [100.7, 100.9, 100.35, 100.8], [100.8, 100.85, 100.25, 100.3], [100.3, 100.6, 100.2, 100.55], [100.55, 100.8, 100.5, 100.75], [100.75, 101, 100.7, 100.95], [100.95, 101.1, 100.8, 100.9], [100.9, 101, 100.7, 100.8], [100.8, 100.9, 100.6, 100.7], [100.7, 100.9, 100.6, 100.85], [100.85, 101, 100.7, 100.75], [100.75, 100.8, 100.5, 100.6], [100.6, 100.7, 100.4, 100.5], [100.5, 100.7, 100.45, 100.65], [100.65, 100.8, 100.55, 100.7]];
const sbTime = i => { const m = 9 * 60 + 30 + i * 5; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const renderSB = fig(function () {
  const host = $('#fig-smc-sb'); if (!host) return;
  const cs = SB.map(toC), [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 2, title: 'NQ · velas de 5 minutos (hora de Nueva York)' }], aria: 'Silver Bullet de 10 a 11' });
  const P = C.panels[0];
  vband(C, 6, 17, { op: 0.06, label: 'Ventana 10:00–11:00' });
  hline(C, P, 99.7, { x1: 0, x2: 7, color: COL.liq, width: 1.3, label: 'SSL (mínimo 9:30)', side: 'left', below: true });
  hline(C, P, 100.85, { x1: 2, x2: 14, color: COL.liq, width: 1.3, label: 'BSL · objetivo', side: 'left' });
  zone(C, P, 100.1, 100.35, { x1: 8, x2: 14, color: COL.fvg, op: 0.25, label: 'FVG', labelBelow: true });
  marker(C, P, 7, 99.45, { shape: 'up', color: COL.liq, size: 5, label: 'Barrido', dy: 20 });
  marker(C, P, 11, 100.3, { shape: 'up', color: COL.entry, size: 5, label: 'Entrada', dy: 22 });
  marker(C, P, 14, 101, { color: COL.up, size: 5, label: 'Objetivo', dy: -18 });
  drawCandles(C, P, cs);
  hover(C, j => cs[j] ? [['#', sbTime(j) + ' NY']].concat(ohlcRows(cs[j], 2)) : null);
  const d = new Date(), f = new Intl.DateTimeFormat('es', { timeZone: localTZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const loc = (h) => f.format(new Date(zonedToUtc('America/New_York', d.getFullYear(), d.getMonth() + 1, d.getDate(), h, 0)));
  $('#sb-times').innerHTML = [[3, 'Londres'], [10, 'Nueva York AM'], [14, 'Nueva York PM']].map(([h, n]) => `<div class="stat"><div class="k">${n} (${h}:00–${h + 1}:00 NY)</div><div class="v">${loc(h)}–${loc(h + 1)}</div></div>`).join('');
});

/* --- Market Maker Model --- */
const MMM_W = [[0, 110], [6, 108.2], [9, 108.9], [15, 106.4], [18, 107.2], [24, 104.6], [27, 105.3], [33, 102.4], [36, 104.1], [38, 103.6], [42, 105.6], [44, 105.1], [48, 107.6], [50, 107.2], [56, 109.8]];
let mmmSel = 'buy';
const renderMMM = fig(function () {
  const host = $('#fig-smc-mmm'); if (!host) return;
  const buy = mmmSel === 'buy', base = candlesFromPath(bridgePath(MMM_W.map(([b, p]) => ({ t: b * 4, p })), mulberry32(17), 0.07), 4), m = 106;
  const cs = buy ? base : base.map(c => mirrorC(c, m)), tr = v => buy ? v : 2 * m - v, [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 0 }], aria: buy ? 'Market Maker Buy Model' : 'Market Maker Sell Model' });
  const P = C.panels[0];
  vband(C, 0, 32, { op: 0.03, label: buy ? 'Lado vendedor de la curva' : 'Lado comprador de la curva' }); vband(C, 33, cs.length - 1, { op: 0.015, label: buy ? 'Lado comprador de la curva' : 'Lado vendedor de la curva' });
  [[108.9, 9, '1'], [107.2, 18, '2'], [105.3, 27, '3']].forEach(([v, i, n]) => hline(C, P, tr(v), { x1: i, color: COL.range, width: 1.2, dash: '4 3', label: 'Consolidación ' + n, side: 'right', below: !buy }));
  zone(C, P, tr(102.2), tr(103.2), { x1: 30, x2: 37, color: COL.fvg, op: 0.22, label: buy ? 'PD array de HTF (descuento)' : 'PD array de HTF (premium)', labelBelow: buy, labelX: C.x(18) });
  marker(C, P, 33, tr(102.4), { shape: buy ? 'up' : 'down', color: COL.liq, size: 6, label: 'SMR', dy: buy ? 22 : -20 });
  drawCandles(C, P, cs);
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  txt(C.bg, C.padL + 8, C.padT + 16, buy ? 'Original consolidation → bajada en escalones → giro → vuelta por los mismos niveles' : 'Original consolidation → subida en escalones → giro → vuelta por los mismos niveles', { fill: COL.muted, 'font-size': 11 });
});

function initICT() {
  segBind($('#smc-pd'), (k, v) => { pdSel = v; renderPDA(); }); renderPDA();
  renderGap(); renderSB();
  segBind($('#smc-mmm'), (k, v) => { mmmSel = v; renderMMM(); }); renderMMM();
}

export { PD, renderPDA, renderGap, SB, renderSB, MMM_W, renderMMM, initICT };
