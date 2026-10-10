// Motor interactivo · smc. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, Player, aggregate, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, ohlcRows, quiz, segBind, tag, txt, vband, zone } from './core';
import { mirrorC, toC, tri } from './liquidez';
import { sTime } from './sesiones';
import { drawCandleRaw } from './velas';
/* =====================================================================
   MÓDULO 12 · SMART MONEY CONCEPTS
   ===================================================================== */
const SMC_FLOW = [
  ['1', 'Sesgo HTF', 'Estructura en diario / 4H', 'estructura'],
  ['2', 'Objetivo', '¿Qué liquidez busca: BSL o SSL?', 'liquidez'],
  ['3', 'Zona (POI)', 'OB, FVG o breaker en descuento / premium', 'liq-ob'],
  ['4', 'Tiempo', 'Sesión y killzone', 'sesiones'],
  ['5', 'Confirmación', 'Barrido + CHoCH / CISD, SMT', 'crt-entradas'],
  ['6', 'Ejecución', 'Entrada (OTE / FVG), stop, objetivo y tamaño', 'todo-riesgo']
];
const renderFlow = fig(function () {
  const host = $('#fig-smc-flow'); if (!host) return;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const W = 900, H = 150, gap = 16, bw = (W - gap * 5 - 4) / 6, svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Flujo de análisis SMC' });
  host.appendChild(svg);
  SMC_FLOW.forEach(([num, t, sub, target], i) => {
    const x = 2 + i * (bw + gap), g = el('g', { style: 'cursor:pointer', tabindex: 0, role: 'link', 'aria-label': t }, svg);
    el('rect', { x, y: 18, width: bw, height: 112, rx: 10, fill: COL.surface2, stroke: COL.axis, 'stroke-width': 1.2 }, g);
    el('circle', { cx: x + 18, cy: 40, r: 11, fill: COL.accent }, g);
    txt(g, x + 18, 44, num, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' });
    txt(g, x + 34, 45, t, { 'font-size': 12.5, 'font-weight': 700 });
    const words = sub.split(' '), lines = ['']; words.forEach(w => { if ((lines[lines.length - 1] + ' ' + w).length > 19) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
    lines.slice(0, 4).forEach((ln, k) => txt(g, x + 10, 70 + k * 15, ln, { 'font-size': 11, fill: COL.text2 }));
    if (i < SMC_FLOW.length - 1) el('path', { d: `M${x + bw + 3} 74 L${x + bw + gap - 3} 74 M${x + bw + gap - 8} 69 L${x + bw + gap - 3} 74 L${x + bw + gap - 8} 79`, stroke: COL.muted, 'stroke-width': 2, fill: 'none' }, svg);
    const go = () => { location.hash = target; };
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    g.addEventListener('pointerenter', () => g.firstChild.setAttribute('stroke', COL.accent));
    g.addEventListener('pointerleave', () => g.firstChild.setAttribute('stroke', COL.axis));
  });
});

/* --- inducement --- */
const IND_DATA = [[101.0, 101.3, 100.2, 100.5], [100.5, 100.7, 99.8, 100.0], [100.0, 101.8, 99.9, 101.6], [101.6, 103.2, 101.5, 103.0], [103.0, 103.9, 102.6, 103.7], [103.7, 104.8, 103.4, 104.6], [104.6, 105.2, 104.0, 104.4], [104.4, 105.9, 104.2, 105.7], [105.7, 106.6, 105.4, 106.4], [106.4, 106.8, 105.6, 105.8], [105.8, 106.0, 104.9, 105.1], [105.1, 105.3, 104.2, 104.5], [104.5, 105.4, 104.4, 105.2], [105.2, 105.9, 105.0, 105.6], [105.6, 105.7, 104.6, 104.8], [104.8, 104.9, 103.6, 103.8], [103.8, 103.9, 102.4, 102.7], [102.7, 102.9, 101.2, 101.4], [101.4, 102.9, 101.3, 102.7], [102.7, 104.4, 102.6, 104.2], [104.2, 105.6, 104.0, 105.4], [105.4, 106.4, 105.2, 106.2], [106.2, 107.4, 106.0, 107.2], [107.2, 108.1, 106.9, 107.9]].map(toC);
const IND_STEPS = [
  { k: 10, t: 'Contexto', d: 'Impulso alcista desde 99,8 hasta 106,8. Deja un <strong>order block</strong> (vela 2) y un <strong>FVG</strong> (velas 2–4) en la zona de descuento del impulso. El precio empieza a retroceder.' },
  { k: 13, t: '1 · Aparece el inducement', d: 'Se forma un mínimo menor muy evidente (vela 12). Muchos lo ven como "el retroceso" y compran ahí, con el stop justo debajo. Fíjate: está en <strong>premium</strong> (por encima del 50% del impulso).' },
  { k: 15, t: '2 · Barrido del inducement', d: 'El precio perfora ese mínimo y activa los stops de venta de quienes compraron antes de tiempo: esa liquidez alimenta el movimiento hacia la zona real.' },
  { k: 17, t: '3 · Llega al POI real', d: 'El precio alcanza el FVG en <strong>descuento</strong>, por encima del order block. Aquí reaccionan las órdenes que iniciaron el impulso.' },
  { k: 23, t: '4 · Giro y BOS', d: 'Reacción fuerte y ruptura del máximo anterior (BOS). Quien compró el inducement perdió; quien esperó el barrido y el POI entró con mejor precio y menos riesgo.' }
];
const indS = { step: 0 };
const renderInd = fig(function () {
  const host = $('#fig-smc-ind'); if (!host) return;
  const S = IND_STEPS[indS.step], cs = IND_DATA, k = S.k, st = indS.step;
  const C = chart(host, { n: cs.length + 2, panels: [{ h: 320, yMin: 99.2, yMax: 108.6, dec: 0 }], aria: 'Inducement' });
  const P = C.panels[0], eq = (99.8 + 106.8) / 2;
  zone(C, P, eq, 106.8, { x1: 8, color: COL.down, op: 0.05, stroke: false }); zone(C, P, 99.8, eq, { x1: 8, color: COL.up, op: 0.05, stroke: false });
  hline(C, P, eq, { x1: 8, color: COL.mid, width: 1, dash: '2 4', label: '50% del impulso', side: 'right' });
  zone(C, P, 99.8, 100.7, { x1: 1, color: COL.ob, op: 0.18, label: 'Order block', labelBelow: true });
  zone(C, P, 100.7, 101.5, { x1: 2, color: COL.fvg, op: 0.22, label: 'FVG (POI)', labelX: C.x(10) });
  if (st >= 1) {
    hline(C, P, 104.2, { x1: 11, x2: st >= 2 ? 15 : 25, color: COL.liq, width: 1.5, label: 'Inducement', side: 'left', below: true });
    for (let q = 0; q < 5; q++) tri(P.g.ann, C.x(11.5 + q * 0.6), P.y(104.05 - (q % 2) * 0.18), false, st < 2, COL.liq, 4);
  }
  if (st >= 2) marker(C, P, 15, cs[15].l, { shape: 'up', color: COL.liq, size: 5, label: 'Barrido', dy: 20 });
  if (st >= 3) marker(C, P, 17, cs[17].l, { shape: 'up', color: COL.text, size: 6, label: 'POI', dy: 20 });
  if (st >= 4) hline(C, P, 106.8, { x1: 9, x2: 22, color: COL.text2, width: 1.4, dash: '4 3', label: 'BOS', side: 'right' });
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  hover(C, j => j > k || !cs[j] ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
  $('#ind-step').innerHTML = `<h4>${S.t}</h4><div>${S.d}</div>`;
  $('#ind-dots').innerHTML = IND_STEPS.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#ind-prev').disabled = st === 0; $('#ind-next').disabled = st === IND_STEPS.length - 1;
});

/* --- breaker / mitigation --- */
const BK_COMMON = [[108.0, 108.3, 107.0, 107.2], [107.2, 107.4, 106.0, 106.3], [106.3, 106.6, 105.0, 105.3], [105.3, 106.4, 105.2, 106.2], [106.2, 107.0, 106.0, 106.8], [106.8, 106.9, 105.6, 105.8]];
const BK_TAIL = [[107.2, 107.6, 106.9, 107.3], [107.3, 107.4, 106.2, 106.4], [106.4, 107.8, 106.3, 107.6], [107.6, 108.9, 107.4, 108.7], [108.7, 109.6, 108.5, 109.4]];
const BK = {
  breaker: BK_COMMON.concat([[105.8, 105.9, 104.3, 104.5], [104.5, 105.8, 104.4, 105.6], [105.6, 107.4, 105.5, 107.2]], BK_TAIL).map(toC),
  mitigation: BK_COMMON.concat([[105.8, 105.9, 105.2, 105.4], [105.4, 106.3, 105.3, 106.1], [106.1, 107.4, 106.0, 107.2]], BK_TAIL).map(toC)
};
let bkSel = 'breaker';
const renderBK = fig(function () {
  const host = $('#fig-smc-bk'); if (!host) return;
  const cs = BK[bkSel], br = bkSel === 'breaker';
  const C = chart(host, { n: cs.length + 2, panels: [{ h: 300, yMin: 103.6, yMax: 110.2, dec: 0 }], aria: br ? 'Breaker block' : 'Mitigation block' });
  const P = C.panels[0];
  hline(C, P, 105.0, { x1: 2, x2: 8, color: COL.liq, label: 'Mínimo 1 · SSL', side: 'left', below: true });
  zone(C, P, 106.0, 107.0, { x1: 4, color: br ? COL.ob : COL.fvg, op: 0.2, label: br ? 'Breaker block' : 'Mitigation block', labelX: C.x(11) });
  hline(C, P, 107.0, { x1: 4, x2: 8, color: COL.text2, width: 1.4, dash: '4 3', label: 'MSS', side: 'left' });
  marker(C, P, 6, cs[6].l, { shape: 'up', color: br ? COL.liq : COL.text2, size: 5, label: br ? 'Barrido: mínimo más bajo' : 'Mínimo más alto: sin barrido', dy: 22 });
  marker(C, P, 10, cs[10].l, { shape: 'up', color: COL.text, size: 6, label: 'Retesteo → entrada', dy: 22 });
  drawCandles(C, P, cs);
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  $('#bk-explain').innerHTML = br
    ? 'Velas 4–5: rebote cuyas últimas velas alcistas forman la zona. Vela 7: <strong>barre el mínimo 1</strong> (toma la SSL). Vela 9: rompe por encima de la zona (MSS). La zona que "falló" como resistencia pasa a ser soporte: el <strong>breaker</strong>. El retesteo de la vela 11 es la entrada.'
    : 'Misma secuencia, pero la vela 7 <strong>no</strong> hace un mínimo más bajo: falla antes de barrer. Al romper la zona, el retesteo se llama <strong>mitigation block</strong>. Se suele leer como continuación y algunos lo consideran algo menos fuerte por no haber tomado liquidez.';
});
/* --- OTE --- */
const renderOTE = fig(function () {
  const host = $('#fig-smc-ote'); if (!host) return;
  const rr = +$('#ote-r').value / 100, cont = $('#ote-cont').checked;
  $('#ote-r-v').textContent = Math.round(rr * 100) + '%';
  const A = 100, B = 110, R = B - A, Lr = B - rr * R, per = 6, r = mulberry32(77);
  const wps = [[0, 101.6], [2, 100], [12, 110], [18, Lr]].concat(cont ? [[26, B + 0.27 * R]] : []);
  const cs = candlesFromPath(bridgePath(wps.map(([b, p]) => ({ t: b * per, p })), r, 0.13), per);
  const C = chart(host, { n: 30, panels: [{ h: 330, yMin: 98.4, yMax: 113.6, dec: 0 }], aria: 'Retroceso OTE con Fibonacci' });
  const P = C.panels[0], lv = x => B - x * R;
  zone(C, P, lv(0.62), lv(0.79), { x1: 12, color: COL.fvg, op: 0.2, label: 'OTE 62–79%', labelX: C.x(24) });
  [[0, '0 · máximo (BSL)'], [0.5, '0,5 · equilibrio'], [0.618, '0,618'], [0.705, '0,705'], [0.79, '0,79'], [1, '1 · inicio del impulso'], [-0.27, '−0,27 · extensión']].forEach(([x, s]) => {
    hline(C, P, lv(x), { x1: 2, color: x === 0 || x === -0.27 ? COL.liq : x === 1 ? COL.down : COL.muted, width: x === 0.705 ? 1.6 : 1, dash: x === 0.5 ? '2 4' : '5 3', label: s, side: 'right', below: x === 1 });
  });
  const stop = A - 0.05 * R;
  hline(C, P, stop, { x1: 12, color: COL.down, width: 1.5, dash: false });
  drawCandles(C, P, cs);
  el('line', { x1: C.x(12), x2: C.x(18), y1: P.y(Lr), y2: P.y(Lr), stroke: COL.text, 'stroke-width': 2 }, P.g.ann);
  marker(C, P, 18, Lr, { color: COL.text, size: 6, label: 'Retroceso ' + Math.round(rr * 100) + '%', dy: 18 });
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  const rr1 = (B - Lr) / (Lr - stop), rr2 = (B + 0.27 * R - Lr) / (Lr - stop);
  const zoneName = rr < 0.5 ? 'Premium' : rr < 0.62 ? 'Descuento (antes de la OTE)' : rr <= 0.79 ? 'OTE' : rr < 1 ? 'Muy profundo' : 'Invalidado';
  $('#ote-stats').innerHTML = [['Zona', zoneName], ['R:B al máximo', '1 : ' + rr1.toFixed(1)], ['R:B a −0,27', '1 : ' + rr2.toFixed(1)]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#ote-explain').innerHTML = (rr < 0.5 ? 'Retroceso poco profundo: entrar aquí es comprar en <strong>premium</strong>, con el stop lejos y peor riesgo/beneficio.'
    : rr < 0.62 ? 'Ya en descuento, pero aún por encima de la OTE: muchos esperan un poco más de profundidad.'
      : rr <= 0.79 ? '<strong>Dentro de la OTE:</strong> buena ubicación (descuento profundo) con el stop bajo el inicio del impulso y espacio hasta la liquidez del máximo.'
        : 'Retroceso muy profundo: cerca del inicio del impulso (el stop). El impulso pierde validez y el riesgo de invalidación sube.') +
    ' <span style="color:var(--muted)">La entrada aquí se calcula en el nivel de retroceso elegido, con stop un 5% del impulso por debajo de su inicio.</span>';
});

/* --- Power of 3 --- */
const po3 = { dir: 'bull', seed: 29, cs: null, k: 47 };
function buildPo3() {
  const r = mulberry32(po3.seed), per = 6;
  const W = [[0, 100], [4, 100.2], [6, 100.5], [8, 99.9], [10, 100.45], [12, 100.1], [15, 100.2], [17, 99.4], [19, 100.3], [21, 100.8], [24, 100.5], [27, 101.6], [30, 101.3], [33, 102.1], [38, 101.8], [44, 102.0], [48, 101.9]];
  po3.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p })), r, 0.045), per);
}
const renderPo3 = fig(function () {
  const host = $('#fig-smc-po3'); if (!host) return;
  if (!po3.cs) buildPo3();
  const bull = po3.dir === 'bull', cs = bull ? po3.cs : po3.cs.map(c => mirrorC(c, 100)), k = po3.k, n = cs.length;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n: n + 8, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 1 }], padB: 22, aria: 'Power of 3 en la vela diaria' });
  const P = C.panels[0];
  vband(C, 4, 11, { color: '#d95926', op: 0.08, label: 'Asia' }); vband(C, 16, 21, { color: '#199e70', op: 0.08, label: 'Londres' }); vband(C, 26, 33, { color: '#c98500', op: 0.08, label: 'Nueva York' });
  tag(P.g.lab, C.x(7.5), P.top + 14, 'Acumulación', COL.text2, 'middle');
  tag(P.g.lab, C.x(18.5), P.top + 14, 'Manipulación', COL.text2, 'middle');
  tag(P.g.lab, C.x(30), P.top + 14, 'Distribución', COL.text2, 'middle');
  hline(C, P, cs[0].o, { x1: 0, x2: n + 7, color: COL.muted, width: 1.2, dash: '4 4', label: 'Apertura del día', side: 'left', below: !bull });
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  const day = aggregate(cs.slice(0, k + 1), 999)[0];
  drawCandleRaw(el('g', {}, P.g.data), C.x(n + 3.5), 44, P.y(day.o), P.y(day.h), P.y(day.l), P.y(day.c), day.c >= day.o, { ww: 2.5 });
  txt(C.bg, C.x(n + 3.5), C.h - 6, 'Vela diaria', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  hover(C, j => j > k || j >= n ? null : [['#', sTime(j) + ' (NY)']].concat(ohlcRows(cs[j], 2)));
  let t;
  if (k < 12) t = '<strong>Acumulación (Asia):</strong> el precio oscila cerca de la apertura. La vela diaria todavía es pequeña.';
  else if (k < 26) t = `<strong>Manipulación (Londres):</strong> el precio se mueve <em>en contra</em> de la dirección del día, ${bull ? 'por debajo' : 'por encima'} de la apertura, barriendo la liquidez de ${bull ? 'debajo' : 'encima'} del rango de Asia. En la vela diaria esto será la <strong>mecha ${bull ? 'inferior' : 'superior'}</strong>.`;
  else t = `<strong>Distribución (Nueva York):</strong> la expansión en la dirección real forma el <strong>cuerpo</strong> de la vela diaria. Resultado: una vela ${bull ? 'alcista con mecha inferior' : 'bajista con mecha superior'}… exactamente el patrón que la CRT lee en temporalidad alta.`;
  $('#po3-explain').innerHTML = t;
});

function initSMC() {
  renderFlow();
  $('#ind-prev').addEventListener('click', () => { indS.step = Math.max(0, indS.step - 1); renderInd(); });
  $('#ind-next').addEventListener('click', () => { indS.step = Math.min(IND_STEPS.length - 1, indS.step + 1); renderInd(); });
  renderInd();
  segBind($('#smc-bk'), (k, v) => { bkSel = v; renderBK(); }); renderBK();
  $('#ote-r').addEventListener('input', renderOTE); $('#ote-cont').addEventListener('change', renderOTE); renderOTE();
  const pl = new Player(k => { po3.k = k; renderPo3(); }, 130);
  segBind($('#smc-po3'), (k, v) => { po3.dir = v; pl.play(47, 0); });
  $('#po3-play').addEventListener('click', () => pl.play(47, 0));
  renderPo3();
  quiz($('#smc-quiz'), 'Práctica: Smart Money Concepts', QUIZZES["smc"].qs);
}

export { SMC_FLOW, renderFlow, IND_DATA, IND_STEPS, indS, renderInd, BK_COMMON, BK_TAIL, BK, bkSel, renderBK, renderOTE, po3, buildPo3, renderPo3, initSMC };
