// Motor interactivo · Wyckoff (acumulación, distribución y esfuerzo contra resultado).
import { QUIZZES } from './shared';
import { $, COL, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, ohlcRows, quiz, segBind, vband, zone } from './core';
import { mirrorC, toC } from './liquidez';

/* --- esquema de acumulación (y su espejo, la distribución) --- */
const WY_W = [[0, 110], [6, 104.6], [8, 103.6], [9, 104.4], [12, 100], [15, 104], [19, 100.8], [23, 103.4], [27, 101.3], [31, 103.6], [34, 99.2], [35, 100.9], [37, 100.4], [41, 105.3], [44, 104.1], [52, 109]];
const WY_VOL = k => k < 6 ? 1 : k < 10 ? 1.7 : k < 13 ? 3.1 : k < 16 ? 1.6 : k < 20 ? 0.9 : k < 32 ? 0.7 : k < 35 ? 1.4 : k < 38 ? 0.5 : k < 42 ? 2.2 : k < 45 ? 0.6 : 1.3;
let WY = null;
function buildWy() {
  const r = mulberry32(31), per = 5, cs = candlesFromPath(bridgePath(WY_W.map(([b, p]) => ({ t: b * per, p })), r, 0.1), per);
  const lows = cs.map(c => c.l), highs = cs.map(c => c.h), ab = cs.reduce((s, c) => s + Math.abs(c.c - c.o), 0) / cs.length;
  const v = cs.map((c, k) => 1000 * (0.75 + 0.5 * r()) * (1 + 0.6 * Math.abs(c.c - c.o) / ab) * WY_VOL(k));
  const ix = { ps: argExt(lows, 6, 9, 'min'), sc: argExt(lows, 10, 13, 'min'), ar: argExt(highs, 13, 17, 'max'), st: argExt(lows, 17, 21, 'min'),
    spring: argExt(lows, 32, 35, 'min'), test: argExt(lows, 36, 38, 'min'), sos: argExt(highs, 39, 43, 'max'), lps: argExt(lows, 42, 46, 'min') };
  WY = { cs, v, ix, scL: cs[ix.sc].l, arH: cs[ix.ar].h, m: 105 };
}
const WY_STEPS = {
  acc: [
    { k: 9, t: 'Contexto: tendencia bajista', d: 'El precio cae con fuerza. Aparece el primer freno: <strong>PS</strong> (preliminary support), un rebote con más volumen. Los grandes compradores empiezan a interesarse, todavía sin parar la caída.' },
    { k: 13, t: 'SC · Selling climax', d: 'Pánico: vela grande con mecha larga y <strong>volumen extremo</strong>. Los últimos vendedores salen y las manos fuertes absorben todo lo que se vende. El mínimo del SC marca el suelo del rango.' },
    { k: 21, t: 'AR y ST · se dibuja el rango', d: 'Sin vendedores, el precio rebota solo: <strong>AR</strong> (automatic rally) fija el techo. Luego el <strong>ST</strong> (secondary test) vuelve a la zona del SC con <strong>mucho menos volumen</strong>: la oferta se agotó. Termina la fase A.' },
    { k: 32, t: 'Fase B · construir la causa', d: 'El precio oscila dentro del rango durante bastante tiempo y con volumen bajo. Las manos fuertes acumulan sin mover el precio. Cuanto más dura la causa, mayor suele ser el efecto (la subida posterior).' },
    { k: 35, t: 'Spring · el barrido', d: 'El precio perfora el mínimo del rango, activa los stops de venta (SSL) y vuelve a entrar rápido. Es la <strong>trampa final</strong> para vendedores: el equivalente Wyckoff de un barrido de liquidez.' },
    { k: 38, t: 'Test del spring', d: 'Una vuelta tranquila hacia la zona del spring con <strong>volumen muy bajo</strong> que hace un mínimo más alto. Nadie quiere vender a esos precios: entrada conservadora con stop bajo el spring.' },
    { k: 43, t: 'SOS · Sign of strength', d: 'Ruptura del techo del rango (AR) con <strong>volumen alto</strong> y velas amplias: la demanda toma el control. Es el desplazamiento / BOS de SMC.' },
    { k: 51, t: 'LPS y markup', d: 'El retroceso al antiguo techo (<strong>LPS</strong>, last point of support) llega con poco volumen y sostiene: la resistencia se volvió soporte. Desde ahí empieza la fase E, la tendencia alcista (markup).' }
  ],
  dist: [
    { k: 9, t: 'Contexto: tendencia alcista', d: 'El precio sube con fuerza. <strong>PSY</strong> (preliminary supply): primera venta seria con más volumen. Los grandes empiezan a repartir posiciones.' },
    { k: 13, t: 'BC · Buying climax', d: 'Euforia: vela grande con mecha superior y <strong>volumen extremo</strong>. Los últimos compradores entran tarde y las manos fuertes les venden. El máximo del BC marca el techo del rango.' },
    { k: 21, t: 'AR y ST · se dibuja el rango', d: 'Caída automática (<strong>AR</strong>) que fija el suelo del rango, y vuelta a la zona del BC (<strong>ST</strong>) con menos volumen: la demanda se agota.' },
    { k: 32, t: 'Fase B · distribuir', d: 'Oscilaciones dentro del rango con volumen bajo. Las manos fuertes venden a quien todavía cree en la tendencia.' },
    { k: 35, t: 'UTAD · el barrido', d: '<strong>Upthrust after distribution</strong>: el precio supera el máximo del rango, activa los stops de compra (BSL), atrae a quienes compran la ruptura y vuelve a entrar. Trampa final para compradores.' },
    { k: 38, t: 'Test del UTAD', d: 'Rebote flojo con volumen muy bajo que hace un máximo más bajo. Entrada conservadora en venta con stop sobre el UTAD.' },
    { k: 43, t: 'SOW · Sign of weakness', d: 'Ruptura del suelo del rango con <strong>volumen alto</strong>: la oferta manda. Desplazamiento bajista.' },
    { k: 51, t: 'LPSY y markdown', d: 'El rebote al antiguo suelo (<strong>LPSY</strong>, last point of supply) falla con poco volumen. Empieza la tendencia bajista (markdown).' }
  ]
};
const wyS = { step: 0, mode: 'acc' };
const renderWy = fig(function () {
  const host = $('#fig-wy'); if (!host) return;
  if (!WY) buildWy();
  const acc = wyS.mode === 'acc', S = WY_STEPS[wyS.mode][wyS.step], k = S.k, st = wyS.step, ix = WY.ix;
  const cs = acc ? WY.cs : WY.cs.map(c => mirrorC(c, WY.m)), tr = p => acc ? p : 2 * WY.m - p;
  const [lo, hi] = extent(cs), v = WY.v, vmax = Math.max(...v) * 1.1;
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 0 }, { h: 90, yMin: 0, yMax: vmax, grid: false, title: 'Volumen' }], aria: acc ? 'Esquema de acumulación de Wyckoff' : 'Esquema de distribución de Wyckoff' });
  const [P, PV] = C.panels;
  const PH = [['A', 6, 20], ['B', 21, 31], ['C', 32, 38], ['D', 39, 45], ['E', 46, cs.length - 1]];
  PH.forEach(([n, a, b], i) => { if (k >= a) vband(C, a, Math.min(b, k), { op: i % 2 ? 0.05 : 0.02, label: 'Fase ' + n }); });
  if (st >= 2) {
    const sup = tr(WY.scL), res = tr(WY.arH), top = Math.max(sup, res), bot = Math.min(sup, res);
    zone(C, P, bot, top, { x1: ix.sc, x2: Math.min(k, 45), color: COL.range, op: 0.06 });
    hline(C, P, sup, { x1: ix.sc, x2: Math.min(k, 45), color: COL.range, width: 1.2, label: acc ? 'Suelo (SC)' : 'Techo (BC)', side: 'right', below: acc });
    hline(C, P, res, { x1: ix.ar, x2: Math.min(k, 45), color: COL.text2, width: 1.2, label: acc ? 'Techo (AR)' : 'Suelo (AR)', side: 'right', below: !acc });
  }
  const lab = acc ? { ps: 'PS', sc: 'SC', ar: 'AR', st: 'ST', spring: 'Spring', test: 'Test', sos: 'SOS', lps: 'LPS' } : { ps: 'PSY', sc: 'BC', ar: 'AR', st: 'ST', spring: 'UTAD', test: 'Test', sos: 'SOW', lps: 'LPSY' };
  const show = [['ps', 0], ['sc', 1], ['ar', 2], ['st', 2], ['spring', 4], ['test', 5], ['sos', 6], ['lps', 7]];
  show.forEach(([key, s0]) => {
    if (st < s0) return;
    const i = ix[key], isLow = ['ps', 'sc', 'st', 'spring', 'test', 'lps'].includes(key), atLow = acc ? isLow : !isLow;
    const price = atLow ? cs[i].l : cs[i].h;
    const col = key === 'spring' ? COL.liq : key === 'sos' ? (acc ? COL.up : COL.down) : COL.text;
    marker(C, P, i, price, { shape: atLow ? 'up' : 'down', color: col, size: 5, label: lab[key], dy: atLow ? 20 : -18 });
  });
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  v.forEach((x, j) => { if (j > k) return; const up = cs[j].c >= cs[j].o; el('rect', { x: C.x(j) - C.bw / 2, y: PV.y(x), width: C.bw, height: PV.bottom - PV.y(x), fill: up ? COL.up : COL.down, 'fill-opacity': 0.55 }, PV.g.data); });
  hover(C, j => j > k ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2), [['Volumen', Math.round(v[j]).toLocaleString('es')]]));
  $('#wy-step').innerHTML = `<h4>${S.t}</h4><div>${S.d}</div>`;
  $('#wy-dots').innerHTML = WY_STEPS[wyS.mode].map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#wy-prev').disabled = st === 0; $('#wy-next').disabled = st === WY_STEPS[wyS.mode].length - 1;
});

/* --- esfuerzo contra resultado --- */
const ER = {
  climax: { t: 'Clímax', cs: [[106, 106.2, 105, 105.2], [105.2, 105.4, 104.2, 104.4], [104.4, 104.6, 103.3, 103.5], [103.5, 103.7, 102.4, 102.6], [102.6, 102.8, 101.1, 101.4], [101.4, 101.6, 98.6, 100.9], [100.9, 102.1, 100.7, 101.9], [101.9, 102.6, 101.6, 102.4], [102.4, 102.8, 101.9, 102.1], [102.1, 103.4, 102, 103.2]],
    v: [1, 1.1, 1.2, 1.3, 1.8, 4.6, 1.9, 1.2, 0.8, 1.3], i: 5, d: 'Esfuerzo enorme (volumen ×4) y la vela cierra lejos de su mínimo: el resultado bajista fue pequeño para tanto volumen. Alguien absorbió toda esa venta. Suele marcar el final de un movimiento.' },
  nodemand: { t: 'Sin demanda', cs: [[100, 101.2, 99.8, 101], [101, 102.3, 100.9, 102.1], [102.1, 103.2, 101.9, 103], [103, 103.4, 102.4, 102.6], [102.6, 103.5, 102.5, 103.3], [103.3, 103.7, 103.1, 103.5], [103.5, 103.8, 103.2, 103.6], [103.6, 103.7, 102.6, 102.8], [102.8, 102.9, 101.6, 101.8], [101.8, 101.9, 100.8, 101]],
    v: [1.6, 1.7, 1.5, 1.1, 0.7, 0.45, 0.35, 1.3, 1.6, 1.5], i: 6, d: 'El precio marca máximos nuevos con velas pequeñas y <strong>volumen cada vez menor</strong>: no hay demanda que empuje. Poco esfuerzo, poco resultado, y nadie interesado. La subida está agotada.' },
  absorb: { t: 'Absorción', cs: [[100, 100.9, 99.8, 100.7], [100.7, 101.8, 100.6, 101.6], [101.6, 102.3, 101.4, 102.1], [102.1, 102.4, 101.7, 101.9], [101.9, 102.4, 101.8, 102.2], [102.2, 102.5, 101.9, 102.1], [102.1, 102.45, 101.85, 102.3], [102.3, 102.5, 102, 102.2], [102.2, 103.6, 102.1, 103.4], [103.4, 104.6, 103.3, 104.4]],
    v: [1, 1.2, 1.2, 2.2, 2.4, 2.6, 2.5, 2.3, 2.6, 2], i: 5, d: 'Volumen alto durante varias velas y el precio <strong>no se mueve</strong> (velas pequeñas contra una resistencia). Mucho esfuerzo, ningún resultado: los vendedores en ese nivel están siendo absorbidos. Cuando se acaban, el precio rompe.' }
};
let erSel = 'climax';
const renderER = fig(function () {
  const host = $('#fig-wy-er'); if (!host) return;
  const S = ER[erSel], cs = S.cs.map(toC), [lo, hi] = extent(cs), vmax = Math.max(...S.v) * 1.15;
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 220, yMin: lo, yMax: hi, dec: 0 }, { h: 90, yMin: 0, yMax: vmax, grid: false, title: 'Volumen' }], aria: 'Esfuerzo contra resultado: ' + S.t });
  const [P, PV] = C.panels;
  vband(C, erSel === 'absorb' ? 3 : S.i, erSel === 'absorb' ? 7 : S.i, { op: 0.07 });
  drawCandles(C, P, cs);
  S.v.forEach((x, j) => el('rect', { x: C.x(j) - C.bw / 2, y: PV.y(x), width: C.bw, height: PV.bottom - PV.y(x), fill: j === S.i ? COL.liq : COL.text2, 'fill-opacity': j === S.i ? 0.85 : 0.45 }, PV.g.data));
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2), [['Volumen', '×' + S.v[j].toFixed(1)]]) : null);
  $('#wy-er-explain').innerHTML = S.d;
});

function initWyckoff() {
  buildWy();
  $('#wy-prev').addEventListener('click', () => { wyS.step = Math.max(0, wyS.step - 1); renderWy(); });
  $('#wy-next').addEventListener('click', () => { wyS.step = Math.min(WY_STEPS[wyS.mode].length - 1, wyS.step + 1); renderWy(); });
  segBind($('#wy-acum'), (k, v) => { if (k === 'wy-mode') { wyS.mode = v; renderWy(); } });
  renderWy();
  segBind($('#wy-er'), (k, v) => { erSel = v; renderER(); });
  renderER();
  quiz($('#wyckoff-quiz'), 'Práctica: Wyckoff', QUIZZES.wyckoff.qs);
}

export { WY_W, buildWy, WY_STEPS, renderWy, ER, renderER, initWyckoff };
