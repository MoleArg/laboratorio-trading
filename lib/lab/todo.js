// Motor interactivo · todo. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { $, $$, COL, aggregate, argExt, bridgePath, candlesFromPath, chart, drawCandles, extent, fig, fmt, gauss, hline, hover, lineSeries, marker, mulberry32, newSeed, rsiCalc, seg, tag, txt, vband, zone } from './core';
import { BASE, PIP, genCRTMTF } from './crt';
import { tri } from './liquidez';
/* =====================================================================
   MÓDULO 5 · TODO JUNTO
   ===================================================================== */
function genTodo(seed) {
  const d = genCRTMTF(seed); if (!d) return null;
  const r = mulberry32(seed + 777), per = 4;
  const pre = candlesFromPath(bridgePath([{ t: 0, p: 64 }, { t: 60, p: 50 }, { t: 120, p: d.path[0] }], r, 3), per);
  const rsi = rsiCalc(pre.map(c => c.c).concat(d.cs.map(c => c.c)), 14).rsi.slice(pre.length);
  const i1 = argExt(d.cs.map(c => c.l), 0, 15, 'min');
  const div = rsi[d.sIdx] != null && rsi[i1] != null && rsi[d.sIdx] > rsi[i1] + 2;
  // activo correlacionado: mismo recorrido + ruido propio + "joroba" que evita el barrido
  const N = d.path.length - 1, tS = d.sIdx * per + 2, A = (d.L1 - d.sweep) + 0.14 * d.R;
  const walk = [0]; for (let t = 1; t <= N; t++) walk.push(walk[t - 1] + gauss(r) * 1.1);
  const pathB = d.path.map((v, t) => v + (walk[t] - t / N * walk[N]) + A * Math.exp(-Math.pow((t - tS) / 10, 2)));
  const csB = candlesFromPath(pathB, per);
  const b1 = argExt(csB.map(c => c.l), 0, 15, 'min'), L1B = csB[b1].l, H1B = Math.max(...csB.slice(0, 16).map(c => c.h));
  const b2 = argExt(csB.map(c => c.l), 16, 31, 'min');
  if (!(csB[b2].l > L1B + 0.03 * d.R)) return null;
  return Object.assign({}, d, { rsi, i1, div, csB, b1, b2, L1B, H1B });
}
const todo = { seed: 205, d: null, step: 0 };
function buildTodo() {
  let fallback = null;
  for (let i = 0; i < 150; i++) {
    const d = genTodo(todo.seed);
    if (d && d.div) { todo.d = d; return; }
    if (d && !fallback) fallback = d;
    todo.seed = newSeed();
  }
  todo.d = fallback;
}
const TODO_STEPS = 9;
const renderTodo = fig(function () {
  const host = $('#fig-todo'); if (!host || !todo.d) return;
  let grid = host.querySelector('.mtf-grid');
  if (!grid) {
    grid = document.createElement('div'); grid.className = 'mtf-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 2.9fr;gap:10px;align-items:start';
    grid.innerHTML = '<div class="chart-host t-h"></div><div class="chart-host t-l"></div>';
    host.appendChild(grid);
  }
  const d = todo.d, st = todo.step;
  const K = [15, 15, 15, d.sIdx + 1, d.sIdx + 2, d.sIdx + 2, Math.max(d.fvg.j + 2, d.cisdBar), d.entryBar, 47][st];
  const pr = x => BASE + x * PIP, prB = x => 1.265 + x * 1.3e-4;
  const cs = d.cs.map(c => ({ o: pr(c.o), h: pr(c.h), l: pr(c.l), c: pr(c.c) }));
  const csB = d.csB.map(c => ({ o: prB(c.o), h: prB(c.h), l: prB(c.l), c: prB(c.c) }));
  const [lo, hi] = extent(cs, [pr(d.stop), pr(d.H1 + 0.15 * d.R)]);
  const [lb, hb] = extent(csB);
  // HTF
  const hc = [0, 1, 2].map(g => { const a = g * 16, b = Math.min(g * 16 + 15, K); return b < a ? null : aggregate(cs.slice(a, b + 1), 99)[0]; });
  const CH = chart(grid.querySelector('.t-h'), { n: 3, w: 300, padR: 8, padB: 22, panels: [{ h: 260, yMin: lo, yMax: hi, grid: false, title: 'EUR/USD 4H' }], aria: 'Velas de 4 horas' });
  const PH = CH.panels[0];
  ['Vela 1', 'Vela 2', 'Vela 3'].forEach((s, i) => txt(CH.bg, CH.x(i), CH.h - 6, s, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }));
  if (st >= 1) { hline(CH, PH, pr(d.H1), { color: COL.range }); hline(CH, PH, pr(d.L1), { color: COL.range }); hline(CH, PH, pr(d.EQ), { color: COL.mid, width: 1, dash: '2 4' }); }
  drawCandles(CH, PH, hc, { bw: 44 });
  // LTF: EUR/USD, RSI, GBP/USD
  const C = chart(grid.querySelector('.t-l'), { n: 48, w: 780, padB: 22, panels: [{ h: 260, yMin: lo, yMax: hi, dec: 4, title: 'EUR/USD 15m' }, { h: 110, yMin: 0, yMax: 100, grid: false, title: 'RSI 14' }, { h: 160, yMin: lb, yMax: hb, dec: 4, title: 'GBP/USD 15m (correlacionado)' }], aria: 'Escenario completo' });
  const [P, PR, PB] = C.panels;
  [0, 1, 2].forEach(g => vband(C, g * 16, g * 16 + 15, { op: g === 1 ? 0.04 : 0.012, label: 'Vela ' + (g + 1) + ' (4H)' }));
  [70, 50, 30].forEach(v => { hline(C, PR, v, { color: COL.muted, width: 1, dash: v === 50 ? '2 4' : '5 4' }); txt(PR.g.lab, C.w - C.padR + 6, PR.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }); });
  if (st >= 1) {
    hline(C, P, pr(d.H1), { color: COL.range, label: 'CRT High', side: 'left', x1: 0 });
    hline(C, P, pr(d.L1), { color: COL.range, label: 'CRT Low', side: 'left', x1: 0, below: true });
    hline(C, P, pr(d.EQ), { color: COL.mid, width: 1, dash: '2 4', label: '50%', side: 'left', x1: 0 });
  }
  if (st >= 2) {
    hline(C, P, pr(d.L1 - 0.02 * d.R), { x1: 10, x2: Math.min(K, d.sIdx), color: COL.liq, width: 1.2, dash: '3 3' });
    hline(C, P, pr(d.H1 + 0.02 * d.R), { x1: 16, color: COL.liq, width: 1.2, dash: '3 3', label: 'BSL · objetivo', side: 'left' });
    for (let q = 0; q < 6; q++) tri(P.g.ann, C.x(11 + q * 0.8), P.y(pr(d.L1 - (0.03 + (q % 3) * 0.035) * d.R)), false, !(st >= 3), COL.liq, 4);
  }
  if (st >= 3) marker(C, P, d.sIdx, cs[d.sIdx].l, { shape: 'up', color: COL.liq, size: 5, label: 'Barrido SSL', dy: 20 });
  if (st >= 4) {
    seg(C, P, d.i1, cs[d.i1].l, d.sIdx, cs[d.sIdx].l, { width: 2 });
    hline(C, PB, prB(d.L1B), { x1: 0, x2: 31, color: COL.range, label: 'CRT Low GBP', side: 'left', below: true });
    seg(C, PB, d.b1, csB[d.b1].l, d.b2, csB[d.b2].l, { width: 2 });
    tag(PB.g.lab, C.x(d.b2) + 8, PB.y(csB[d.b2].l) - 14, 'Mínimo más alto: no confirma (SMT)', COL.div, 'start');
  }
  if (st >= 5 && d.div) {
    seg(C, PR, d.i1, d.rsi[d.i1], d.sIdx, d.rsi[d.sIdx], { width: 2 });
    tag(PR.g.lab, C.x(d.sIdx) + 8, PR.y(d.rsi[d.sIdx]) + 4, 'Divergencia alcista', COL.div, 'start');
  }
  if (st >= 6) {
    hline(C, P, pr(d.cisd), { x1: d.q, x2: d.cisdBar, color: COL.text2, width: 1.5, dash: '4 3', label: 'CISD', side: 'right' });
    zone(C, P, pr(d.fvg.bot), pr(d.fvg.top), { x1: d.fvg.j, x2: Math.min(47, d.entryBar + 3), color: COL.fvg, op: 0.25 });
  }
  if (st >= 7) {
    zone(C, P, pr(d.entry), pr(d.stop), { x1: d.entryBar, x2: 47, color: COL.down, op: 0.14 });
    zone(C, P, pr(d.entry), pr(d.H1), { x1: d.entryBar, x2: 47, color: COL.up, op: 0.1 });
    hline(C, P, pr(d.entry), { x1: d.entryBar, x2: 47, color: COL.entry, dash: false, width: 1.5, label: 'Entrada', side: 'right' });
    hline(C, P, pr(d.stop), { x1: d.entryBar, x2: 47, color: COL.down, dash: false, width: 1.5, label: 'Stop', side: 'right', below: true });
  }
  if (st >= 8) marker(C, P, d.tpBar, cs[d.tpBar].h, { color: COL.up, size: 6, label: 'Objetivo', dy: -18 });
  drawCandles(C, P, cs.map((c, j) => j <= K ? c : null));
  drawCandles(C, PB, csB.map((c, j) => j <= K ? c : null));
  lineSeries(C, PR, d.rsi, { upTo: K });
  hover(C, j => j > K ? null : [['#', '15m #' + (j + 1)], ['EUR/USD', cs[j].c.toFixed(5)], ['RSI', fmt(d.rsi[j], 1)], ['GBP/USD', csB[j].c.toFixed(5)]]);
  const risk = d.entry - d.stop, rew = d.H1 - d.entry;
  const S = [
    ['1 · Contexto y sesgo', 'Supón que el gráfico diario es alcista y que el precio está en zona de descuento. Con ese sesgo solo buscamos <strong>compras</strong>. La vela 1 de 4H acaba de cerrar.'],
    ['2 · Rango CRT', 'Marcamos el máximo (CRT High) y el mínimo (CRT Low) de la vela 1, y su 50%. Ese es el mapa para las próximas horas.'],
    ['3 · ¿Dónde está la liquidez?', 'Bajo el CRT Low se acumulan stops de venta (SSL); sobre el CRT High, stops de compra (BSL). Con sesgo alcista esperamos un barrido de la SSL y un viaje hacia la BSL.'],
    ['4 · Barrido (vela 2)', 'La vela 2 perfora el CRT Low: los stops de venta se activan (triángulos huecos). Todavía no compramos: falta ver si es barrido (rechazo) o ruptura (aceptación).'],
    ['5 · SMT', 'Comparamos con el GBP/USD en el mismo momento: el EUR/USD hizo un mínimo más bajo, pero el GBP/USD hizo un <strong>mínimo más alto</strong> y no barrió su CRT Low. La caída del euro no está confirmada → SMT alcista.'],
    ['6 · RSI', d.div ? `En el mínimo del barrido el RSI marca ${fmt(d.rsi[d.sIdx], 1)}, por encima de los ${fmt(d.rsi[d.i1], 1)} del mínimo anterior: <strong>divergencia alcista</strong>. Otra señal de que la presión vendedora se agota (confluencia, no gatillo).`
      : 'En este escenario el RSI <strong>no</strong> muestra divergencia. No pasa nada: es una confluencia opcional. Lo obligatorio es el barrido, el cierre de vuelta dentro y la confirmación en LTF.'],
    ['7 · Confirmación: CISD + FVG', 'Un cuerpo cierra por encima de la apertura de la serie bajista que hizo el mínimo (<strong>CISD</strong>) y el impulso deja un <strong>FVG</strong>. Ahora sí hay intención compradora.'],
    ['8 · Entrada y gestión', `Orden límite en el 50% del FVG; stop bajo el barrido; objetivos: 50% del rango (parcial) y CRT High. Riesgo ${risk.toFixed(1)} pips para buscar ${rew.toFixed(1)} → R:B 1 : ${(rew / risk).toFixed(1)}.`],
    ['9 · Resultado', 'La vela 3 expande y toma la BSL sobre el CRT High. En 4H todo el proceso se ve como un CRT de manual: mecha de barrido en la vela 2 y expansión en la vela 3. <em>Recuerda: en la realidad también hay operaciones que tocan el stop; por eso el tamaño de posición importa.</em>']
  ];
  $('#todo-step').innerHTML = `<h4>${S[st][0]}</h4><div>${S[st][1]}</div>`;
  $('#todo-dots').innerHTML = S.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#todo-prev').disabled = st === 0; $('#todo-next').disabled = st === TODO_STEPS - 1;
  $('#todo-stats').innerHTML = st >= 7 ? [['Riesgo', risk.toFixed(1) + ' pips'], ['Beneficio al CRT High', rew.toFixed(1) + ' pips'], ['R:B', '1 : ' + (rew / risk).toFixed(1)], ['Resultado', st >= 8 ? 'Objetivo ✔' : 'En curso…']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('') : '';
});

const CHECK = [
  [true, 'Sesgo de temporalidad mayor a favor de la operación'],
  [true, 'Rango CRT claro: vela de temporalidad alta ya cerrada'],
  [true, 'Barrido de un extremo y cierre de vuelta dentro del rango'],
  [false, 'El barrido llega a una zona clave de HTF (FVG, order block, máximo/mínimo previo)'],
  [false, 'Divergencia SMT con el activo correlacionado'],
  [true, 'Confirmación en temporalidad baja (CISD o MSS)'],
  [false, 'Entrada en el FVG / order block que dejó el impulso'],
  [false, 'El RSI acompaña (divergencia o salida de zona extrema)'],
  [true, 'Stop más allá del barrido y R:B de al menos 1 : 1,5'],
  [false, 'Horario con volumen y sin noticias de alto impacto']
];
function renderCheck() {
  const boxes = $$('#checklist input'), on = boxes.filter(b => b.checked).length;
  const missing = CHECK.filter((c, i) => c[0] && !boxes[i].checked).length;
  $('#check-meter').style.width = (on / CHECK.length * 100) + '%';
  $('#check-explain').className = 'explain ' + (missing ? 'bad' : 'good');
  $('#check-explain').innerHTML = missing ? `Faltan <strong>${missing}</strong> punto(s) obligatorio(s) ★ → <strong>no hay operación</strong>. Esperar también es operar bien.`
    : `Obligatorios completos. Confluencias opcionales: <strong>${on - CHECK.filter(c => c[0]).length} de ${CHECK.filter(c => !c[0]).length}</strong>. Más confluencias suelen significar un setup más limpio, no un resultado garantizado.`;
}
function renderRisk() {
  const cap = +$('#rk-cap').value, pct = +$('#rk-pct').value, en = +$('#rk-entry').value, sl = +$('#rk-stop').value, tp = +$('#rk-tp').value;
  const dist = Math.abs(en - sl);
  if (!(dist > 0) || !(cap > 0) || !(pct > 0)) { $('#rk-out').innerHTML = ''; $('#rk-explain').textContent = 'Introduce capital, riesgo y una distancia entre entrada y stop mayor que cero.'; return; }
  const money = cap * pct / 100, units = money / dist, rr = Math.abs(tp - en) / dist, be = 1 / (1 + rr);
  $('#rk-out').innerHTML = [['Pérdida máxima', '$' + money.toFixed(2)], ['Distancia al stop', (dist / PIP).toFixed(1) + ' pips'], ['Tamaño (unidades)', Math.round(units).toLocaleString('es')], ['Lotes estándar', (units / 100000).toFixed(2)], ['R:B', '1 : ' + rr.toFixed(2)], ['Beneficio potencial', '$' + (money * rr).toFixed(2)]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#rk-explain').innerHTML = `Con R:B 1 : ${rr.toFixed(2)} necesitas acertar más del <strong>${(be * 100).toFixed(1)}%</strong> de las operaciones solo para no perder (sin contar comisiones ni spread). ${rr < 1.5 ? 'Es un R:B ajustado: exige mucha precisión.' : 'Es un R:B razonable.'} Para pares XXX/USD, 1 lote estándar = 100 000 unidades.`;
}

export { genTodo, todo, buildTodo, TODO_STEPS, renderTodo, CHECK, renderCheck, renderRisk };
