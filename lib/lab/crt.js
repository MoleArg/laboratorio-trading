// Motor interactivo · crt. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, Player, aggregate, argExt, bridgePath, candlesFromPath, chart, dataTable, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, newSeed, ohlcRows, quiz, segBind, tag, txt, vband, zone } from './core';
import { extendPath, mirrorC } from './liquidez';
import { drawCandleRaw } from './velas';
/* =====================================================================
   MÓDULO 3 · CRT
   ===================================================================== */
const crt3 = { dir: 'bull', close: 'in', step: 0 };
const CRT3_STEPS = 5;
function crt3Data() {
  const depth = +$('#crt-depth').value, R = 6, H1 = 106, L1 = 100, EQ = 103;
  const sweep = L1 - R * depth / 100 * 0.5;
  const c1 = { o: 104.2, h: H1, l: L1, c: 101.9 };
  const inside = crt3.close === 'in';
  const c2c = inside ? 101.4 : L1 - 0.4 * (L1 - sweep) - 0.05;
  const c2 = { o: 101.9, h: 102.5, l: sweep, c: c2c };
  const c3 = inside ? { o: c2c, h: H1 + 0.45, l: c2c - 0.35, c: H1 + 0.2 } : { o: c2c, h: c2c + 0.4, l: sweep - 1.6, c: sweep - 1.3 };
  const stop = sweep - 0.25, entry = c2c, risk = entry - stop, rr = inside ? (H1 - entry) / risk : null, rr1 = inside ? (EQ - entry) / risk : null;
  return { cs: [c1, c2, c3], H1, L1, EQ, sweep, stop, entry, rr, rr1, inside };
}
const renderCRT3 = fig(function () {
  const host = $('#fig-crt3'); if (!host) return;
  const d = crt3Data(), bull = crt3.dir === 'bull', m = 103, st = crt3.step;
  const tr = v => bull ? v : 2 * m - v;
  const cs = (bull ? d.cs : d.cs.map(c => mirrorC(c, m)));
  const shown = cs.map((c, i) => (i === 0 || (i === 1 && st >= 1) || (i === 2 && st >= 4)) ? c : null);
  const ext = extent(d.cs.concat(d.cs.map(c => mirrorC(c, m))));
  const C = chart(host, { n: 6, panels: [{ h: 330, yMin: ext[0], yMax: ext[1], dec: 0 }], padB: 24, aria: 'Modelo CRT de tres velas' });
  const P = C.panels[0];
  ['', 'Vela 1 · rango', 'Vela 2 · manipulación', 'Vela 3 · expansión'].forEach((s, i) => { if (s) txt(C.bg, C.x(i), C.h - 6, s, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }); });
  const hiLbl = bull ? 'CRT High · BSL' : 'CRT High · BSL', loLbl = 'CRT Low · SSL';
  hline(C, P, tr(d.H1), { x1: 1, x2: 5, color: COL.range, label: bull ? hiLbl : loLbl, side: 'left' });
  hline(C, P, tr(d.L1), { x1: 1, x2: 5, color: COL.range, label: bull ? loLbl : hiLbl, side: 'left', below: true });
  hline(C, P, tr(d.EQ), { x1: 1, x2: 5, color: COL.mid, width: 1, dash: '2 4', label: '50%', side: 'right' });
  if (st >= 1) {
    hline(C, P, tr(d.sweep), { x1: 2, x2: 5, color: COL.liq, width: 1.2, dash: '3 3' });
    marker(C, P, 2, tr(d.sweep), { shape: bull ? 'up' : 'down', color: COL.liq, size: 6, label: bull ? 'Barre el CRT Low' : 'Barre el CRT High', dy: bull ? 24 : -24, dx: 0 });
  }
  if (st >= 2) {
    const c2 = cs[1];
    el('line', { x1: C.x(2) - 34, x2: C.x(2) + 34, y1: P.y(c2.c), y2: P.y(c2.c), stroke: COL.text, 'stroke-width': 2.5 }, P.g.ann);
    tag(P.g.lab, C.x(2) + 38, P.y(c2.c), d.inside ? 'Cierra DENTRO → CRT válido' : 'Cierra FUERA → no es CRT', d.inside ? COL.up : COL.down, 'start');
  }
  if (st >= 3 && d.inside) {
    zone(C, P, tr(d.entry), tr(d.stop), { x1: 3, x2: 5, color: COL.down, op: 0.16 });
    zone(C, P, tr(d.entry), tr(d.H1), { x1: 3, x2: 5, color: COL.up, op: 0.12 });
    hline(C, P, tr(d.entry), { x1: 3, x2: 5, color: COL.entry, width: 1.5, dash: false, label: 'Entrada', side: 'right' });
    hline(C, P, tr(d.stop), { x1: 3, x2: 5, color: COL.down, width: 1.5, dash: false, label: 'Stop (tras el barrido)', side: 'right', below: bull });
  }
  drawCandles(C, P, shown, { bw: 54, offset: 1 });
  hover(C, i => (i >= 1 && i <= 3 && shown[i - 1]) ? [['#', 'Vela ' + i]].concat(ohlcRows(shown[i - 1], 2)) : null);
  // estadísticas y texto
  const st2 = [['CRT High', tr(bull ? d.H1 : d.L1).toFixed(2)], ['CRT Low', tr(bull ? d.L1 : d.H1).toFixed(2)], ['50%', d.EQ.toFixed(2)], ['Extremo del barrido', st >= 1 ? tr(d.sweep).toFixed(2) : '—']];
  if (d.inside && st >= 3) st2.push(['R:B al 50%', '1 : ' + d.rr1.toFixed(1)], ['R:B al extremo', '1 : ' + d.rr.toFixed(1)]);
  $('#crt3-stats').innerHTML = st2.map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const side = bull ? 'mínimo' : 'máximo', other = bull ? 'máximo' : 'mínimo', liqS = bull ? 'SSL (stops de venta)' : 'BSL (stops de compra)';
  const T = [
    ['Paso 1 · La vela 1 define el rango', `Marca su máximo (CRT High) y su mínimo (CRT Low), con mechas. Encima hay BSL y debajo SSL. El 50% es el equilibrio del rango.`],
    ['Paso 2 · La vela 2 barre un extremo', `La vela 2 supera el ${side} de la vela 1 y activa la ${liqS}. Es la "manipulación": quien vendió/compró la ruptura queda atrapado.`],
    d.inside ? ['Paso 3 · Cierra dentro del rango → CRT válido', `La vela 2 cierra de vuelta dentro del rango: el mercado rechazó los precios del barrido. El objetivo pasa a ser el ${other} de la vela 1.`]
      : ['Paso 3 · Cierra fuera del rango → NO es CRT', `La vela 2 cierra más allá del ${side}: el mercado <strong>aceptó</strong> esos precios. No hay rechazo, así que no hay CRT. Lo probable es continuación.`],
    d.inside ? ['Paso 4 · Plan: entrada, stop y objetivos', `Entrada conservadora al cierre de la vela 2; stop más allá del extremo del barrido; objetivo parcial en el 50% y principal en el ${other} de la vela 1. Mueve "Profundidad del barrido": un barrido más profundo agranda el stop y empeora el riesgo/beneficio.`]
      : ['Paso 4 · Sin plan', 'Sin cierre dentro del rango no hay setup CRT. Esperar es también una decisión.'],
    d.inside ? ['Paso 5 · La vela 3 expande', `La vela 3 viaja hacia el ${other} opuesto y toma la liquidez de ese lado: de liquidez a liquidez.`]
      : ['Paso 5 · Continuación', `El precio sigue más allá del ${side}: por eso el cierre de la vela 2 es la regla más importante.`]
  ];
  $('#crt3-step').innerHTML = `<h4>${T[st][0]}</h4><div>${T[st][1]}</div>`;
  $('#crt3-dots').innerHTML = T.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#crt3-prev').disabled = st === 0; $('#crt3-next').disabled = st === CRT3_STEPS - 1;
});

/* --- ejercicio ¿válido? --- */
const CRT_CASES = [
  { cs: [[60, 80, 30, 45], [45, 52, 18, 40]], a: 1, why: 'Barre el mínimo de la vela 1 y cierra dentro: CRT alcista válido. Objetivo: el máximo de la vela 1.' },
  { cs: [[45, 80, 30, 72], [72, 92, 68, 88]], a: 0, why: 'Supera el máximo pero cierra por encima: aceptación (ruptura), no CRT.' },
  { cs: [[40, 75, 30, 62], [62, 86, 55, 66]], a: 1, why: 'Barre el máximo y cierra dentro: CRT bajista válido. Objetivo: el mínimo de la vela 1.' },
  { cs: [[35, 82, 22, 70], [70, 76, 48, 55]], a: 0, why: 'Vela interior: no barre ningún extremo. El rango sigue vigente; hay que esperar al barrido.' },
  { cs: [[50, 70, 40, 60], [60, 82, 28, 52]], a: 0, why: 'Barre ambos extremos (doble purga): escenario ambiguo. La mayoría lo evita.' },
  { cs: [[65, 78, 35, 48], [48, 55, 26, 52], [52, 56, 14, 18]], a: 1, why: 'La vela 2 sí formó un CRT alcista válido… pero la vela 3 perforó el mínimo del barrido: invalidación. El stop bajo el barrido limitó la pérdida. Ningún modelo acierta siempre.' }
];
const renderCases = fig(function () {
  const host = $('#crt-cases'); if (!host) return;
  host.innerHTML = '';
  let done = 0, right = 0;
  const score = $('#crt-cases-score'); score.textContent = '';
  CRT_CASES.forEach((cs, qi) => {
    const box = document.createElement('div'); box.className = 'case';
    const svg = el('svg', { viewBox: '0 0 220 140', role: 'img', 'aria-label': 'Caso ' + (qi + 1) });
    const y = v => 130 - v * 1.2;
    const c1 = cs.cs[0];
    [c1[1], c1[2]].forEach(v => el('line', { x1: 20, x2: 205, y1: y(v), y2: y(v), stroke: COL.range, 'stroke-dasharray': '5 4', 'stroke-width': 1.3 }, svg));
    cs.cs.forEach(([o, h, l, c], j) => drawCandleRaw(el('g', {}, svg), 55 + j * 55, 26, y(o), y(h), y(l), y(c), c >= o, { ww: 1.8 }));
    txt(svg, 10, 14, 'Caso ' + (qi + 1), { fill: COL.muted, 'font-size': 11 });
    box.appendChild(svg);
    const ans = document.createElement('div'); ans.className = 'ans';
    const fb = document.createElement('div'); fb.className = 'fb';
    ['No es CRT (aún)', 'CRT válido'].forEach((s, v) => {
      const b = document.createElement('button'); b.className = 'btn'; b.textContent = s;
      b.addEventListener('click', () => {
        if (box.dataset.done) return; box.dataset.done = '1'; done++;
        const ok = v === cs.a; if (ok) right++;
        b.style.borderColor = ok ? 'var(--c-up)' : 'var(--c-down)';
        fb.textContent = (ok ? '✔ ' : '✘ ') + cs.why; fb.style.display = 'block';
        score.textContent = `Aciertos: ${right} / ${done}`;
      });
      ans.appendChild(b);
    });
    box.appendChild(ans); box.appendChild(fb); host.appendChild(box);
  });
});
/* --- simulación multi-temporalidad --- */
const PIP = 1e-4, BASE = 1.08;
function genCRTMTF(seed) {
  const r = mulberry32(seed), per = 4;
  let path = bridgePath([[0, 30], [3, 52], [6, 14], [10, 40], [13, 8], [16, 22]].map(([b, p]) => ({ t: b * per, p })), r, 3.0);
  const c1 = candlesFromPath(path, per);
  const H1 = Math.max(...c1.map(c => c.h)), L1 = Math.min(...c1.map(c => c.l)), R = H1 - L1;
  const W = [[19, .26, 1.6], [23.4, -.13, 1.0], [24, -.05, 0.8], [25, .16, 0.8], [26, .40, 0.9], [27, .56, 1.2], [29.5, .22, 1.4], [32, .42, 2], [35, .66, 2], [37, .58, 2], [41, 1.02, 1.6], [43, 1.14, 1.6], [45, 1.02, 1.6], [48, 1.08]];
  path = extendPath(path, W.map(([b, f, n]) => ({ t: Math.round(b * per), p: L1 + f * R, n })), r, 2.8);
  const cs = candlesFromPath(path, per);
  // validaciones del modelo
  const c2 = cs.slice(16, 32), sIdx = 16 + argExt(c2.map(c => c.l), 0, 15, 'min'), sweep = cs[sIdx].l;
  if (!(sweep < L1 - 0.03 * R) || Math.max(...c2.map(c => c.h)) >= H1 || cs[31].c <= L1 + 0.05 * R || cs[31].c >= H1 - 0.1 * R) return null;
  const e = cs[sIdx].c < cs[sIdx].o ? sIdx : sIdx - 1;
  let q = e; while (q - 1 >= 16 && cs[q - 1].c < cs[q - 1].o) q--;
  const cisd = cs[q].o;
  let cisdBar = -1; for (let j = e + 1; j < 32; j++) if (cs[j].c > cisd) { cisdBar = j; break; }
  if (cisdBar < 0 || cisdBar > 30) return null;
  // FVG de entrada: el más profundo del impulso cuyo 50% (CE) el precio vuelve a tocar
  let fvg = null, entryBar = -1;
  for (let j = sIdx; j <= Math.min(cisdBar + 2, 29) && !fvg; j++) {
    if (cs[j + 2].l > cs[j].h + 0.02 * R) {
      const ce = (cs[j].h + cs[j + 2].l) / 2;
      for (let k = j + 3; k <= 40; k++) if (cs[k].l <= ce) { fvg = { j, bot: cs[j].h, top: cs[j + 2].l, ce }; entryBar = k; break; }
    }
  }
  if (!fvg) return null;
  const stop = sweep - 0.04 * R, entry = fvg.ce, EQ = L1 + R / 2;
  let tpBar = -1, tp1Bar = -1;
  for (let k = entryBar; k < cs.length; k++) {
    if (cs[k].l <= stop) return null;
    if (tp1Bar < 0 && cs[k].h >= EQ && k > entryBar) tp1Bar = k;
    if (cs[k].h >= H1) { tpBar = k; break; }
  }
  if (tpBar < 0) return null;
  return { cs, path, H1, L1, R, EQ, sIdx, sweep, q, e, cisd, cisdBar, fvg, entryBar, entry, stop, tpBar, tp1Bar };
}
const mtf = { dir: 'bull', seed: 101, d: null, k: 47 };
function buildMTF() {
  for (let i = 0; i < 80; i++) { const d = genCRTMTF(mtf.seed); if (d) { mtf.d = d; return; } mtf.seed = newSeed(); }
}
function mtfView() {
  const d = mtf.d, bull = mtf.dir === 'bull', m = (d.H1 + d.L1) / 2;
  const P = x => BASE + (bull ? x : 2 * m - x) * PIP;
  const cs = d.cs.map(c => { const cc = bull ? c : mirrorC(c, m); return { o: BASE + cc.o * PIP, h: BASE + cc.h * PIP, l: BASE + cc.l * PIP, c: BASE + cc.c * PIP }; });
  return { bull, P, cs };
}
const renderMTF = fig(function () {
  const host = $('#fig-crt-mtf'); if (!host || !mtf.d) return;
  let grid = host.querySelector('.mtf-grid');
  if (!grid) {
    grid = document.createElement('div'); grid.className = 'mtf-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 2.7fr;gap:10px';
    grid.innerHTML = '<div class="chart-host mtf-h"></div><div class="chart-host mtf-l"></div>';
    host.appendChild(grid);
  }
  const d = mtf.d, k = mtf.k, { bull, P: tp, cs } = mtfView();
  const [lo, hi] = extent(cs, [tp(d.stop), tp(d.H1 + 0.15 * d.R), tp(d.L1 - 0.3 * d.R)]);
  // HTF
  const hc = [0, 1, 2].map(g => { const a = g * 16, b = Math.min(g * 16 + 15, k); return b < a ? null : aggregate(cs.slice(a, b + 1), 99)[0]; });
  const CH = chart(grid.querySelector('.mtf-h'), { n: 3, w: 300, padR: 8, padB: 22, panels: [{ h: 330, yMin: lo, yMax: hi, grid: false, title: '4H' }], aria: 'Velas de 4 horas' });
  const PH = CH.panels[0];
  ['Vela 1', 'Vela 2', 'Vela 3'].forEach((s, i) => txt(CH.bg, CH.x(i), CH.h - 6, s, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }));
  if (k >= 15) {
    hline(CH, PH, tp(d.H1), { color: COL.range }); hline(CH, PH, tp(d.L1), { color: COL.range }); hline(CH, PH, tp(d.EQ), { color: COL.mid, width: 1, dash: '2 4' });
  }
  drawCandles(CH, PH, hc, { bw: 44 });
  hover(CH, i => hc[i] ? [['#', 'Vela ' + (i + 1) + ' de 4H']].concat(ohlcRows(hc[i], 5)) : null);
  // LTF
  const C = chart(grid.querySelector('.mtf-l'), { n: 48, w: 760, padB: 22, panels: [{ h: 330, yMin: lo, yMax: hi, dec: 4, title: '15 minutos' }], aria: 'Velas de 15 minutos' });
  const PL = C.panels[0];
  [0, 1, 2].forEach(g => vband(C, g * 16, g * 16 + 15, { op: g === 1 ? 0.045 : 0.015, label: 'Vela ' + (g + 1) + ' (4H)' }));
  if (k >= 15) {
    hline(C, PL, tp(d.H1), { color: COL.range, label: bull ? 'CRT High · objetivo' : 'CRT Low · objetivo', side: 'left', x1: 0 });
    hline(C, PL, tp(d.L1), { color: COL.range, label: bull ? 'CRT Low' : 'CRT High', side: 'left', x1: 0, below: bull });
    hline(C, PL, tp(d.EQ), { color: COL.mid, width: 1, dash: '2 4', label: '50%', side: 'left', x1: 0 });
  }
  if (k >= d.sIdx) marker(C, PL, d.sIdx, bull ? cs[d.sIdx].l : cs[d.sIdx].h, { shape: bull ? 'up' : 'down', color: COL.liq, size: 5, label: 'Barrido', dy: bull ? 20 : -20 });
  if (k >= d.cisdBar) hline(C, PL, tp(d.cisd), { x1: d.q, x2: d.cisdBar, color: COL.text2, width: 1.5, dash: '4 3', label: 'CISD', side: 'right', below: !bull });
  if (k >= d.fvg.j + 2) zone(C, PL, tp(d.fvg.bot), tp(d.fvg.top), { x1: d.fvg.j, x2: Math.min(47, d.entryBar + 3), color: COL.fvg, op: 0.25 });
  if (k >= d.entryBar) {
    zone(C, PL, tp(d.entry), tp(d.stop), { x1: d.entryBar, x2: 47, color: COL.down, op: 0.14 });
    zone(C, PL, tp(d.entry), tp(d.H1), { x1: d.entryBar, x2: 47, color: COL.up, op: 0.1 });
    hline(C, PL, tp(d.entry), { x1: d.entryBar, x2: 47, color: COL.entry, dash: false, width: 1.5, label: 'Entrada (50% del FVG)', side: 'right' });
    hline(C, PL, tp(d.stop), { x1: d.entryBar, x2: 47, color: COL.down, dash: false, width: 1.5, label: 'Stop', side: 'right', below: bull });
  }
  if (k >= d.tpBar) marker(C, PL, d.tpBar, bull ? cs[d.tpBar].h : cs[d.tpBar].l, { color: COL.up, size: 6, label: 'Objetivo alcanzado', dy: bull ? -18 : 18 });
  drawCandles(C, PL, cs.map((c, j) => j <= k ? c : null));
  hover(C, j => j > k ? null : [['#', '15m #' + (j + 1) + ' · vela ' + (Math.floor(j / 16) + 1) + ' de 4H']].concat(ohlcRows(cs[j], 5)));
  // lectura
  const risk = Math.abs(d.entry - d.stop), rew = Math.abs(d.H1 - d.entry);
  $('#mtf-stats').innerHTML = [['Riesgo', (risk).toFixed(1) + ' pips'], ['Beneficio al objetivo', rew.toFixed(1) + ' pips'], ['Riesgo : beneficio', '1 : ' + (rew / risk).toFixed(1)], ['Resultado', k >= d.tpBar ? 'Objetivo ✔' : k >= d.entryBar ? 'En curso…' : 'Sin entrada']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const low = bull ? 'mínimo' : 'máximo', lq = bull ? 'SSL' : 'BSL', other = bull ? 'CRT High' : 'CRT Low';
  let t;
  if (k < 15) t = 'Se está formando la <strong>vela 1</strong> de 4H. Su máximo y su mínimo serán el rango CRT.';
  else if (k < d.sIdx) t = `Vela 1 cerrada: rango definido. Ahora la vela 2 se acerca al ${low} de la vela 1, donde está la ${lq}.`;
  else if (k < d.cisdBar) t = `<strong>Barrido:</strong> en 15m el precio perfora el ${low} de la vela 1 y activa los stops (${lq}). En 4H esto será solo una <strong>mecha</strong>.`;
  else if (k < d.fvg.j + 2) t = `<strong>CISD:</strong> un cuerpo cierra ${bull ? 'por encima' : 'por debajo'} de la apertura de la serie de velas que hizo el ${low}. El precio cambió de dirección de entrega.`;
  else if (k < d.entryBar) t = '<strong>Desplazamiento + FVG:</strong> el impulso deja un hueco de valor razonable. Se coloca una orden límite en el 50% del FVG (consequent encroachment), con el stop tras el barrido.';
  else if (k < 31) t = '<strong>Entrada ejecutada</strong> en el retroceso al FVG. Falta que la vela 2 de 4H cierre dentro del rango para confirmar el CRT.';
  else if (k < d.tpBar) t = `<strong>Vela 2 cerrada dentro del rango → CRT confirmado.</strong> Ahora la vela 3 debería expandir hacia el ${other}.`;
  else t = `<strong>Objetivo alcanzado:</strong> el precio tomó la liquidez del ${other}. Mira la vela 2 en 4H: todo el barrido de 15m quedó resumido en una mecha.`;
  $('#mtf-explain').innerHTML = t;
  dataTable($('#mtf-data'), ['15m', 'Vela 4H', 'Apertura', 'Máximo', 'Mínimo', 'Cierre'], cs.slice(0, k + 1).map((c, j) => [String(j + 1), String(Math.floor(j / 16) + 1), c.o.toFixed(5), c.h.toFixed(5), c.l.toFixed(5), c.c.toFixed(5)]));
});

function initCRT() {
  const root = $('#crt-modelo');
  segBind(root, (key, v) => { crt3[key] = v; renderCRT3(); });
  $('#crt-depth').addEventListener('input', renderCRT3);
  $('#crt3-prev').addEventListener('click', () => { crt3.step = Math.max(0, crt3.step - 1); renderCRT3(); });
  $('#crt3-next').addEventListener('click', () => { crt3.step = Math.min(CRT3_STEPS - 1, crt3.step + 1); renderCRT3(); });
  $('#crt3-all').addEventListener('click', () => { crt3.step = CRT3_STEPS - 1; renderCRT3(); });
  renderCRT3();
  renderCases();
  const speeds = [420, 260, 160, 100, 55];
  const pl = new Player(k => { mtf.k = k; renderMTF(); }, 160);
  const play = () => { pl.ms = speeds[+$('#mtf-speed').value - 1]; pl.play(47, 0); };
  segBind($('#crt-mtf'), (key, v) => { mtf.dir = v; pl.stop(); mtf.k = 47; renderMTF(); });
  $('#mtf-play').addEventListener('click', play);
  $('#mtf-end').addEventListener('click', () => { pl.stop(); mtf.k = 47; renderMTF(); });
  $('#mtf-new').addEventListener('click', () => { pl.stop(); mtf.seed = newSeed(); buildMTF(); play(); });
  buildMTF(); renderMTF();
  quiz($('#crt-quiz'), 'Práctica: CRT', QUIZZES["crt"].qs);
}

export { crt3, CRT3_STEPS, crt3Data, renderCRT3, CRT_CASES, renderCases, PIP, BASE, genCRTMTF, mtf, buildMTF, mtfView, renderMTF, initCRT };
