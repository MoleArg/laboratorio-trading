// Motor interactivo · sr. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, gauss, hline, hover, marker, mulberry32, newSeed, ohlcRows, pivots, quiz, tag, zone } from './core';
/* =====================================================================
   MÓDULO 3 · SOPORTES, RESISTENCIAS Y FIGURAS CHARTISTAS
   ===================================================================== */
const srS = { seed: 31, cs: null };
function buildSR() {
  const r = mulberry32(srS.seed), per = 5;
  const W = [[0, 101], [6, 104.0], [11, 100.1], [17, 103.9], [23, 100.2], [29, 104.1], [33, 102.6], [38, 105.6], [42, 104.15], [48, 107.2], [52, 106.1], [58, 108.6], [62, 107.4], [66, 108.4], [72, 105.0]];
  srS.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p: p + (b ? gauss(r) * 0.12 : 0) })), r, 0.13), per);
}
function srZones(cs, N, tol, minT) {
  const H = cs.map(c => c.h), L = cs.map(c => c.l);
  const pts = pivots(H, 'high', N, N).map(i => ({ i, p: H[i], t: 'H' })).concat(pivots(L, 'low', N, N).map(i => ({ i, p: L[i], t: 'L' }))).sort((a, b) => a.p - b.p);
  const cl = [];
  pts.forEach(pt => {
    const c = cl[cl.length - 1];
    if (c && Math.abs(pt.p - c.sum / c.pts.length) <= tol) { c.pts.push(pt); c.sum += pt.p; }
    else cl.push({ pts: [pt], sum: pt.p });
  });
  const mk = pts => {
    const ps = pts.map(x => x.p), mid = ps.reduce((s, x) => s + x, 0) / ps.length;
    return { mid, lo: Math.min(...ps) - tol * 0.2, hi: Math.max(...ps) + tol * 0.2, pts, first: Math.min(...pts.map(x => x.i)), flip: pts.some(x => x.t === 'H') && pts.some(x => x.t === 'L') };
  };
  const zs = cl.filter(c => c.pts.length >= minT).map(c => mk(c.pts)), out = [];
  zs.forEach(z => { const p = out[out.length - 1]; if (p && z.lo <= p.hi) out[out.length - 1] = mk(p.pts.concat(z.pts)); else out.push(z); });
  return out;
}
const renderSR = fig(function () {
  const host = $('#fig-sr'); if (!host) return;
  if (!srS.cs) buildSR();
  const cs = srS.cs, n = cs.length, ar = cs.reduce((s, c) => s + c.h - c.l, 0) / n;
  const N = +$('#sr-n').value, tol = +$('#sr-tol').value / 10 * ar, minT = +$('#sr-min').value;
  $('#sr-n-v').textContent = N; $('#sr-min-v').textContent = minT; $('#sr-tol-v').textContent = '±' + tol.toFixed(2);
  const zones = srZones(cs, N, tol, minT), last = cs[n - 1].c;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n: n + 10, panels: [{ h: 340, yMin: lo, yMax: hi, dec: 0 }], aria: 'Zonas de soporte y resistencia' });
  const P = C.panels[0];
  zones.forEach(z => {
    const sup = z.mid < last, col = sup ? COL.up : COL.down;
    zone(C, P, z.lo, z.hi, { x1: z.first, x2: n + 9, color: col, op: 0.14 });
    tag(P.g.lab, C.x(n + 9) + C.step / 2 - 2, P.y(z.mid), (sup ? 'Soporte' : 'Resistencia') + ' · ' + z.pts.length + (z.flip ? ' · S↔R' : ''), col, 'end');
  });
  drawCandles(C, P, cs);
  zones.forEach(z => z.pts.forEach(pt => el('circle', { cx: C.x(pt.i), cy: P.y(pt.p), r: 3.5, fill: COL.text, stroke: COL.surface, 'stroke-width': 1.5 }, P.g.ann)));
  hover(C, i => i < n ? [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(cs[i], 2)) : null);
  const best = zones.slice().sort((a, b) => b.pts.length - a.pts.length)[0], flips = zones.filter(z => z.flip).length;
  $('#sr-stats').innerHTML = [['Zonas', zones.length], ['Zona más tocada', best ? best.pts.length + ' toques' : '—'], ['Cambios de polaridad', flips]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#sr-explain').innerHTML = zones.length
    ? `Se detectan <strong>${zones.length}</strong> zonas con al menos ${minT} toques. ` + (flips ? `${flips} de ellas cambiaron de papel (S↔R): por ejemplo, la antigua resistencia del rango funciona como soporte tras la ruptura. ` : '') + 'Prueba un ancho de zona mayor: verás cómo varios niveles "casi iguales" se funden en una sola zona.'
    : 'Con estos ajustes no hay zonas con suficientes toques: baja los toques mínimos o aumenta el ancho de zona.';
});
/* --- figuras chartistas --- */
const CP_BASE = [
  { id: 'dt', n: 'Doble techo', t: 'bear', k: 'Reversión bajista', w: [[0, 100], [10, 106], [15, 103.6], [21, 106.05], [27, 103.1], [29, 103.7], [37, 101.0], [42, 100.6]],
    lines: [{ a: [15, 103.6], b: [29, 103.6], to: 42, lb: 'Línea de cuello' }], tops: [[10, 'Techo 1', 'H'], [21, 'Techo 2', 'H']], bl: 0, dir: -1, from: 22, h: 2.45, hb: [21, 106.05, 103.6], inv: 106.5,
    r: ['Dos máximos parecidos tras una subida.', 'Entre ambos, un mínimo: la línea de cuello.', 'Se confirma con un cierre por debajo de la línea de cuello.'],
    m: 'Objetivo: la altura (techo − cuello) proyectada hacia abajo desde la ruptura. Invalidación: por encima de los techos.',
    note: 'Los dos techos son máximos iguales: encima hay liquidez (BSL). Es habitual que el precio barra el segundo techo antes de caer.' },
  { id: 'hch', n: 'Hombro-cabeza-hombro', t: 'bear', k: 'Reversión bajista', w: [[0, 100], [8, 104], [12, 102.4], [18, 106.5], [23, 102.6], [29, 104.1], [34, 101.9], [36, 102.6], [44, 98.6], [46, 98.9]],
    lines: [{ a: [12, 102.4], b: [23, 102.6], to: 46, lb: 'Línea de cuello' }], tops: [[8, 'Hombro izq.', 'H'], [18, 'Cabeza', 'H'], [29, 'Hombro der.', 'H']], bl: 0, dir: -1, from: 30, h: 3.99, hb: [18, 106.5, 102.5], inv: 104.7,
    r: ['Tres máximos: el central (cabeza) más alto que los laterales (hombros).', 'La línea de cuello une los dos mínimos intermedios.', 'Se confirma con el cierre bajo la línea de cuello; a menudo hay retesteo.'],
    m: 'Objetivo: la distancia de la cabeza a la línea de cuello, proyectada desde la ruptura. Invalidación: por encima del hombro derecho.',
    note: 'El hombro derecho más bajo que la cabeza es un máximo más bajo (LH): la estructura ya está girando.' },
  { id: 'ta', n: 'Triángulo ascendente', t: 'bull', k: 'Continuación alcista (habitual)', w: [[0, 100], [6, 105], [11, 101.6], [17, 105], [22, 102.8], [27, 105], [31, 103.9], [34, 105.9], [42, 108.6], [45, 108.3]],
    lines: [{ a: [6, 105], b: [27, 105], to: 34, lb: 'Resistencia plana' }, { a: [11, 101.6], b: [22, 102.8], to: 33, lb: 'Mínimos crecientes' }], tops: [], bl: 0, dir: 1, from: 28, h: 3.4, hb: [11, 105, 101.6], inv: 103.6,
    r: ['Techo plano que rechaza varias veces.', 'Mínimos cada vez más altos: los compradores entran antes.', 'Se confirma con el cierre por encima del techo.'],
    m: 'Objetivo: la altura de la base del triángulo proyectada desde la ruptura. Invalidación: por debajo del último mínimo.',
    note: 'Un techo tocado muchas veces acumula buy stops encima (BSL): la ruptura suele ser rápida.' },
  { id: 'ts', n: 'Triángulo simétrico', t: 'bull', k: 'Continuación (por lo general, en la dirección previa)', w: [[0, 98], [6, 106], [11, 101], [16, 105], [21, 102], [25, 104.2], [28, 102.9], [31, 103.6], [34, 105.6], [42, 108.9], [45, 108.6]],
    lines: [{ a: [6, 106], b: [16, 105], to: 33, lb: 'Máximos decrecientes' }, { a: [11, 101], b: [21, 102], to: 33, lb: 'Mínimos crecientes' }], tops: [], bl: 0, dir: 1, from: 27, h: 5, hb: [8, 105.8, 101.0], inv: 102.6,
    r: ['Máximos decrecientes y mínimos crecientes que convergen.', 'Compresión: la volatilidad se reduce.', 'La ruptura (con cierre) indica la dirección.'],
    m: 'Objetivo: la altura de la parte más ancha proyectada desde la ruptura. Invalidación: vuelta al interior y ruptura del lado contrario.',
    note: 'No asumas la dirección antes de la ruptura: la compresión acumula liquidez a ambos lados.' },
  { id: 'ba', n: 'Bandera alcista', t: 'bull', k: 'Continuación alcista', w: [[0, 100], [6, 106], [9, 105.2], [11, 105.8], [14, 104.8], [16, 105.3], [19, 104.4], [22, 106.3], [30, 111.6], [33, 111.3]],
    lines: [{ a: [0, 100], b: [6, 106], to: 6, lb: 'Mástil' }, { a: [6, 106], b: [16, 105.3], to: 21, lb: '' }, { a: [9, 105.2], b: [19, 104.4], to: 21, lb: 'Bandera' }], tops: [], bl: 1, dir: 1, from: 17, h: 6, hb: [3, 106, 100], inv: 104.1,
    r: ['Impulso fuerte (mástil).', 'Retroceso ordenado y estrecho en un canal contrario (bandera).', 'Ruptura del canal en la dirección del mástil.'],
    m: 'Objetivo: la longitud del mástil proyectada desde la ruptura. Invalidación: por debajo del mínimo de la bandera.',
    note: 'La bandera es un retroceso con poco volumen: el mercado "respira" antes de continuar.' },
  { id: 'ca', n: 'Cuña ascendente', t: 'bear', k: 'Reversión bajista (habitual)', w: [[0, 100], [5, 103], [8, 101.5], [13, 104.2], [16, 103.0], [20, 104.9], [23, 104.1], [26, 105.3], [28, 104.4], [30, 103.6], [38, 100.6], [41, 100.9]],
    lines: [{ a: [5, 103], b: [20, 104.9], to: 28, lb: 'Cuña ascendente' }, { a: [8, 101.5], b: [23, 104.1], to: 30, lb: '' }], tops: [], bl: 1, dir: -1, from: 24, tgt: 101.0, hb: null, inv: 105.7,
    r: ['Máximos y mínimos crecientes, pero convergentes.', 'Cada impulso avanza menos: pérdida de momentum.', 'Se confirma al cerrar por debajo de la línea inferior.'],
    m: 'Objetivo habitual: el origen de la cuña. Invalidación: por encima del último máximo.',
    note: 'Suele coincidir con divergencias bajistas en RSI o MACD.' },
  { id: 'rc', n: 'Rectángulo', t: 'bull', k: 'Continuación o reversión (manda la ruptura)', w: [[0, 98], [4, 103], [9, 100.2], [14, 103], [19, 100.2], [24, 103], [28, 101.8], [30, 103.8], [38, 106.6], [41, 106.3]],
    lines: [{ a: [4, 103], b: [24, 103], to: 30, lb: 'Techo del rango' }, { a: [9, 100.2], b: [19, 100.2], to: 30, lb: 'Suelo del rango' }], tops: [], bl: 0, dir: 1, from: 25, h: 2.8, hb: [14, 103, 100.2], inv: 101.5,
    r: ['Precio atrapado entre un techo y un suelo horizontales.', 'Varios toques en ambos lados.', 'La ruptura con cierre (mejor con volumen) marca la dirección.'],
    m: 'Objetivo: la altura del rango proyectada desde la ruptura. Invalidación: vuelta al interior del rango.',
    note: 'Encima del techo hay BSL y debajo del suelo SSL: los barridos falsos son frecuentes. Espera el cierre.' }
];
function mirrorCP(s, id, n, k, labels, txt2) {
  const M = p => 206 - p;
  return Object.assign({}, s, {
    id, n, k, t: s.t === 'bull' ? 'bear' : 'bull', dir: -s.dir, w: s.w.map(([b, p]) => [b, M(p)]),
    lines: s.lines.map(l => ({ a: [l.a[0], M(l.a[1])], b: [l.b[0], M(l.b[1])], to: l.to, lb: (labels && labels[l.lb]) || l.lb })),
    tops: s.tops.map(([b, lb, ty], i) => [b, (labels && labels['top' + i]) || lb, ty === 'H' ? 'L' : 'H']),
    hb: s.hb ? [s.hb[0], M(s.hb[1]), M(s.hb[2])] : null, inv: M(s.inv), tgt: s.tgt != null ? M(s.tgt) : undefined
  }, txt2);
}
const CP = [CP_BASE[0],
  mirrorCP(CP_BASE[0], 'ds', 'Doble suelo', 'Reversión alcista', { top0: 'Suelo 1', top1: 'Suelo 2' }, { r: ['Dos mínimos parecidos tras una caída.', 'Entre ambos, un máximo: la línea de cuello.', 'Se confirma con un cierre por encima de la línea de cuello.'], m: 'Objetivo: la altura (cuello − suelo) proyectada hacia arriba desde la ruptura. Invalidación: por debajo de los suelos.', note: 'Los dos suelos son mínimos iguales: debajo hay SSL. Es habitual un barrido del segundo suelo antes de subir.' }),
  CP_BASE[1],
  mirrorCP(CP_BASE[1], 'hchi', 'HCH invertido', 'Reversión alcista', { top0: 'Hombro izq.', top1: 'Cabeza', top2: 'Hombro der.' }, { r: ['Tres mínimos: el central (cabeza) más bajo que los laterales.', 'La línea de cuello une los dos máximos intermedios.', 'Se confirma con el cierre por encima de la línea de cuello.'], m: 'Objetivo: la distancia de la cabeza a la línea de cuello, proyectada hacia arriba desde la ruptura. Invalidación: por debajo del hombro derecho.', note: 'El hombro derecho más alto que la cabeza es un mínimo más alto (HL): la estructura ya gira al alza.' }),
  CP_BASE[2],
  mirrorCP(CP_BASE[2], 'td', 'Triángulo descendente', 'Continuación bajista (habitual)', { 'Resistencia plana': 'Soporte plano', 'Mínimos crecientes': 'Máximos decrecientes' }, { r: ['Suelo plano que aguanta varias veces.', 'Máximos cada vez más bajos: los vendedores entran antes.', 'Se confirma con el cierre por debajo del suelo.'], m: 'Objetivo: la altura de la base proyectada hacia abajo desde la ruptura. Invalidación: por encima del último máximo.', note: 'Un suelo tocado muchas veces acumula sell stops debajo (SSL).' }),
  CP_BASE[3],
  CP_BASE[4],
  mirrorCP(CP_BASE[4], 'bb', 'Bandera bajista', 'Continuación bajista', null, { r: ['Caída fuerte (mástil).', 'Rebote ordenado y estrecho en un canal contrario.', 'Ruptura del canal en la dirección del mástil.'], m: 'Objetivo: la longitud del mástil proyectada hacia abajo desde la ruptura. Invalidación: por encima del máximo de la bandera.', note: 'El rebote suele tener poco volumen.' }),
  CP_BASE[5],
  mirrorCP(CP_BASE[5], 'cd', 'Cuña descendente', 'Reversión alcista (habitual)', { 'Cuña ascendente': 'Cuña descendente' }, { r: ['Máximos y mínimos decrecientes, pero convergentes.', 'Cada caída avanza menos: la venta se agota.', 'Se confirma al cerrar por encima de la línea superior.'], m: 'Objetivo habitual: el origen de la cuña. Invalidación: por debajo del último mínimo.', note: 'Suele coincidir con divergencias alcistas.' }),
  CP_BASE[6]
];
let cpSel = 'dt';
const renderCP = fig(function () {
  const host = $('#fig-cp'); if (!host) return;
  const S = CP.find(x => x.id === cpSel), per = 4;
  const cs = candlesFromPath(bridgePath(S.w.map(([b, p]) => ({ t: b * per, p })), mulberry32(5), 0.07), per), n = cs.length;
  const lineAt = (l, x) => l.a[1] + (l.b[1] - l.a[1]) / (l.b[0] - l.a[0]) * (x - l.a[0]);
  const bl = S.lines[S.bl];
  let brk = -1; for (let i = S.from; i < n; i++) if (S.dir < 0 ? cs[i].c < lineAt(bl, i) : cs[i].c > lineAt(bl, i)) { brk = i; break; }
  if (brk < 0) brk = Math.min(n - 1, S.from + 3);
  const tgt = S.tgt != null ? S.tgt : lineAt(bl, brk) + S.dir * S.h;
  const [lo, hi] = extent(cs, [tgt, S.inv]);
  const C = chart(host, { n: n + 4, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 0 }], aria: 'Figura chartista: ' + S.n });
  const P = C.panels[0];
  S.lines.forEach(l => {
    el('line', { x1: C.x(l.a[0]), y1: P.y(l.a[1]), x2: C.x(l.to), y2: P.y(lineAt(l, l.to)), stroke: COL.range, 'stroke-width': 2, 'stroke-linecap': 'round' }, P.g.ann);
    if (l.lb) tag(P.g.lab, C.x((l.a[0] + l.to) / 2), P.y(lineAt(l, (l.a[0] + l.to) / 2)) + (S.dir < 0 ? 16 : -16) * (l === bl ? 1 : -1), l.lb, COL.range, 'middle');
  });
  hline(C, P, tgt, { x1: brk, x2: n + 3, color: COL.liq, width: 1.6, label: 'Objetivo (proyección)', side: 'right', below: S.dir < 0 });
  hline(C, P, S.inv, { x1: brk, x2: n + 3, color: COL.down, width: 1.4, dash: '3 3', label: 'Invalidación', side: 'right', below: S.dir > 0 });
  drawCandles(C, P, cs);
  S.tops.forEach(([b, lb, ty]) => { const c = cs[Math.min(b, n - 1)]; marker(C, P, b, ty === 'H' ? c.h : c.l, { color: COL.text, size: 5, label: lb, dy: ty === 'H' ? -16 : 16 }); });
  marker(C, P, brk, S.dir > 0 ? cs[brk].l : cs[brk].h, { shape: S.dir > 0 ? 'up' : 'down', color: S.dir > 0 ? COL.up : COL.down, size: 6, label: 'Ruptura', dy: S.dir > 0 ? 22 : -22 });
  const arrow = (x, y1, y2, lb) => { el('line', { x1: x, x2: x, y1: P.y(y1), y2: P.y(y2), stroke: COL.liq, 'stroke-width': 1.6, 'stroke-dasharray': '2 3' }, P.g.ann); tag(P.g.lab, x + 6, P.y((y1 + y2) / 2), lb, COL.liq, 'start'); };
  if (S.hb) { arrow(C.x(S.hb[0]), S.hb[1], S.hb[2], 'Altura'); arrow(C.x(Math.min(n + 1, brk + 2)), lineAt(bl, brk), tgt, 'Misma altura'); }
  hover(C, i => i < n ? [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(cs[i], 2)) : null);
  $('#cp-info').className = 'explain ' + (S.t === 'bull' ? 'good' : 'bad');
  $('#cp-info').innerHTML = `<strong>${S.n}</strong> — ${S.k}<br>${S.note}`;
  $('#cp-rules').innerHTML = '<strong>Reglas</strong><ul style="margin:4px 0 4px 18px">' + S.r.map(x => `<li>${x}</li>`).join('') + '</ul>' + S.m;
  $$('#cp-list button').forEach(b => b.classList.toggle('on', b.dataset.cp === cpSel));
});
function initSR() {
  ['#sr-n', '#sr-tol', '#sr-min'].forEach(s => $(s).addEventListener('input', renderSR));
  $('#sr-new').addEventListener('click', () => { srS.seed = newSeed(); buildSR(); renderSR(); });
  renderSR();
  const list = $('#cp-list');
  [['bear', 'Bajistas'], ['bull', 'Alcistas']].forEach(([t, lb]) => {
    const g = document.createElement('div'); g.className = 'grp';
    const s = document.createElement('span'); s.className = 'lbl'; s.textContent = lb; g.appendChild(s);
    CP.filter(x => x.t === t).forEach(x => { const b = document.createElement('button'); b.className = 'btn'; b.dataset.cp = x.id; b.textContent = x.n; b.addEventListener('click', () => { cpSel = x.id; renderCP(); }); g.appendChild(b); });
    list.appendChild(g);
  });
  renderCP();
  quiz($('#sr-quiz'), 'Práctica: soportes, resistencias y figuras', QUIZZES["sr"].qs);
}

export { srS, buildSR, srZones, renderSR, CP_BASE, mirrorCP, CP, cpSel, renderCP, initSR };
