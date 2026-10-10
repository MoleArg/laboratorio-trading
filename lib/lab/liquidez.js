// Motor interactivo · liquidez. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, Player, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, newSeed, ohlcRows, quiz, seg, segBind, tag, txt, vband, zone } from './core';
/* =====================================================================
   MÓDULO 2 · LIQUIDEZ
   ===================================================================== */
function extendPath(path, wps, r, noise) {
  const t0 = path.length - 1;
  const ext = bridgePath([{ t: 0, p: path[t0], n: wps[0].n0 }].concat(wps.map(w => ({ t: w.t - t0, p: w.p, n: w.n }))), r, noise);
  return path.concat(ext.slice(1));
}
const mirrorC = (c, m) => ({ o: 2 * m - c.o, c: 2 * m - c.c, h: 2 * m - c.l, l: 2 * m - c.h });
function tri(layer, x, y, up, filled, color, s) {
  s = s || 5;
  const d = up ? `M${x} ${y - s} L${x + s} ${y + s * 0.8} L${x - s} ${y + s * 0.8} Z` : `M${x} ${y + s} L${x + s} ${y - s * 0.8} L${x - s} ${y - s * 0.8} Z`;
  return el('path', { d, fill: filled ? color : COL.surface, stroke: color, 'stroke-width': 1.4 }, layer);
}

/* --- dónde están las órdenes --- */
let stopsData = null;
function buildStops() {
  const r = mulberry32(5), per = 6;
  const cs = candlesFromPath(bridgePath([[0, 101], [12, 106], [22, 100.6], [32, 104], [40, 103.2]].map(([b, p]) => ({ t: b * per, p })), r, 0.1), per);
  const hiI = argExt(cs.map(c => c.h), 8, 16, 'max'), loI = argExt(cs.map(c => c.l), 18, 26, 'min');
  const H = cs[hiI].h, L = cs[loI].l, orders = [];
  const add = (type, n, base, dir, spread) => { for (let k = 0; k < n; k++) orders.push({ type, i: 25 + r() * 14, p: base + dir * (0.06 + r() * spread) }); };
  add('sl-short', 7, H, 1, 0.55); add('bo-buy', 5, H, 1, 0.35); add('sl-long', 7, L, -1, 0.55); add('bo-sell', 5, L, -1, 0.35);
  stopsData = { cs, hiI, loI, H, L, orders };
}
const renderStops = fig(function () {
  const host = $('#fig-stops'); if (!host) return;
  if (!stopsData) buildStops();
  const { cs, hiI, loI, H, L, orders } = stopsData;
  const on = new Set($$('.stops-t').filter(c => c.checked).map(c => c.value));
  const [lo, hi] = extent(cs, [H + 1.1, L - 1.1]);
  const C = chart(host, { n: cs.length, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 1 }], aria: 'Órdenes pendientes sobre máximos y bajo mínimos' });
  const P = C.panels[0];
  drawCandles(C, P, cs);
  hline(C, P, H, { x1: hiI, color: COL.liq, label: 'Máximo → BSL (liquidez compradora)', side: 'left' });
  hline(C, P, L, { x1: loI, color: COL.liq, label: 'Mínimo → SSL (liquidez vendedora)', side: 'left', below: true });
  orders.forEach(o => {
    if (!on.has(o.type)) return;
    const buy = o.type === 'sl-short' || o.type === 'bo-buy', filled = o.type.startsWith('sl');
    tri(P.g.ann, C.padL + (o.i + 0.5) * C.step, P.y(o.p), buy, filled, COL.liq, 5);
  });
  tag(P.g.lab, C.x(32), P.y(H + 0.92), 'Órdenes de COMPRA en espera', COL.liq, 'middle');
  tag(P.g.lab, C.x(32), P.y(L - 0.92), 'Órdenes de VENTA en espera', COL.liq, 'middle');
  hover(C, i => [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(cs[i], 2)));
});

/* --- barrido animado --- */
const sw = { dir: 'bull', seed: 3, data: null, k: 45 };
function buildSweep() {
  const r = mulberry32(sw.seed), per = 6;
  let path = bridgePath([[0, 102.0], [4.5, 104.4], [10.5, 100.05], [16.5, 104.3], [22.5, 100.0], [27, 102.2], [30, 101.3]].map(([b, p]) => ({ t: Math.round(b * per), p })), r, 0.07);
  const pre = candlesFromPath(path, per);
  const EQL = Math.min(...pre.map(c => c.l)), EQH = Math.max(...pre.map(c => c.h));
  path = extendPath(path, [[30.6, EQL - 0.75, 0.04], [31, EQL + 0.35, 0.05], [32, EQL + 1.6, 0.04], [34, EQL + 3.1, 0.06], [36, EQL + 2.55, 0.08], [40, EQH - 0.3, 0.07], [42, EQH + 0.55, 0.06], [44, EQH - 0.2, 0.06], [46, EQH + 0.05]]
    .map(([b, p, n]) => ({ t: Math.round(b * per), p, n })), r, 0.07);
  const cs = candlesFromPath(path, per);
  const sells = [], buys = [];
  for (let k = 0; k < 12; k++) sells.push({ i: 24 + r() * 5.5, p: EQL - (0.04 + r() * 0.6) });
  for (let k = 0; k < 10; k++) buys.push({ i: 24 + r() * 5.5, p: EQH + (0.04 + r() * 0.45) });
  sw.data = { cs, EQL, EQH, sells, buys };
}
const renderSweep = fig(function () {
  const host = $('#fig-sweep'); if (!host) return;
  if (!sw.data) buildSweep();
  const bull = sw.dir === 'bull', m = (sw.data.EQL + sw.data.EQH) / 2;
  const cs = bull ? sw.data.cs : sw.data.cs.map(c => mirrorC(c, m));
  const lowLvl = bull ? sw.data.EQL : 2 * m - sw.data.EQH, highLvl = bull ? sw.data.EQH : 2 * m - sw.data.EQL;
  const sweepOrders = (bull ? sw.data.sells : sw.data.buys.map(o => ({ i: o.i, p: 2 * m - o.p })));
  const targetOrders = (bull ? sw.data.buys : sw.data.sells.map(o => ({ i: o.i, p: 2 * m - o.p })));
  const k = sw.k, n = cs.length;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 330, yMin: lo, yMax: hi, dec: 1 }], aria: 'Barrido de liquidez animado' });
  const P = C.panels[0];
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  const sweepLvl = bull ? lowLvl : highLvl, tgtLvl = bull ? highLvl : lowLvl;
  hline(C, P, sweepLvl, { x1: 8, x2: 33, color: COL.liq, label: bull ? 'Mínimos iguales (EQL) · SSL' : 'Máximos iguales (EQH) · BSL', side: 'left', below: bull });
  hline(C, P, tgtLvl, { x1: 2, color: COL.liq, label: bull ? 'Máximos iguales (EQH) · BSL' : 'Mínimos iguales (EQL) · SSL', side: 'left', below: !bull });
  const ext = (a, b, fn) => { let v = fn === 'min' ? Infinity : -Infinity; for (let j = a; j <= Math.min(b, k); j++) v = fn === 'min' ? Math.min(v, cs[j].l) : Math.max(v, cs[j].h); return v; };
  const lowSoFar = ext(0, n - 1, 'min'), highSoFar = ext(0, n - 1, 'max');
  let trigA = 0, trigB = 0;
  sweepOrders.forEach(o => { const hit = bull ? lowSoFar <= o.p : highSoFar >= o.p; if (hit) trigA++;
    tri(P.g.ann, C.padL + (o.i + 0.5) * C.step, P.y(o.p), !bull, !hit, COL.liq, 5).setAttribute('opacity', hit ? 0.35 : 1); });
  targetOrders.forEach(o => { const hit = bull ? highSoFar >= o.p : lowSoFar <= o.p; if (hit) trigB++;
    tri(P.g.ann, C.padL + (o.i + 0.5) * C.step, P.y(o.p), bull, !hit, COL.liq, 5).setAttribute('opacity', hit ? 0.35 : 1); });
  if (k >= 30) marker(C, P, 30, bull ? cs[30].l : cs[30].h, { shape: bull ? 'up' : 'down', color: COL.liq, size: 6, label: 'Barrido', dy: bull ? 22 : -22 });
  hover(C, j => j > k ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
  const nA = sweepOrders.length, nB = targetOrders.length;
  $('#sweep-stats').innerHTML = [[bull ? 'Stops de venta activados (SSL)' : 'Stops de compra activados (BSL)', trigA + ' / ' + nA], [bull ? 'Stops de compra activados (BSL)' : 'Stops de venta activados (SSL)', trigB + ' / ' + nB]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  let t;
  if (k < 30) t = `Se forma un rango con ${bull ? 'mínimos' : 'máximos'} iguales. Cada toque deja más stops ${bull ? 'debajo' : 'encima'} (triángulos llenos = órdenes aún pendientes; al activarse se vuelven huecos y tenues).`;
  else if (k < 32) t = `<strong>Barrido:</strong> la mecha atraviesa el nivel y activa ${trigA} stops. Cada stop activado es una ${bull ? 'venta' : 'compra'} a mercado que un participante grande puede usar como contrapartida para ${bull ? 'comprar' : 'vender'}. La vela <strong>cierra de vuelta dentro</strong>: rechazo.`;
  else if (k < 39) t = `<strong>Desplazamiento:</strong> velas grandes en la dirección contraria al barrido. Ya se usó la liquidez de ${bull ? 'abajo' : 'arriba'}; el siguiente "imán" es la liquidez del otro lado.`;
  else t = `<strong>De liquidez a liquidez:</strong> el precio llega a ${bull ? 'los máximos iguales y activa los buy stops' : 'los mínimos iguales y activa los sell stops'}. Ahí quien ${bull ? 'compró abajo puede vender' : 'vendió arriba puede comprar'} para tomar beneficios.`;
  $('#sweep-explain').innerHTML = t;
});

/* --- mapa de liquidez --- */
const mp = { seed: 8, cs: null };
function buildMap() {
  const r = mulberry32(mp.seed), per = 6;
  const W = [[0, 101.0], [5, 103.2], [9, 100.2], [14.5, 102.4], [16.5, 101.5], [19.5, 102.38], [22, 100.9], [24, 101.3], [26, 101.7], [28, 101.0], [30, 101.6], [32, 101.15], [33.5, 100.72], [36, 102.0], [38, 101.7], [40, 102.5], [42, 102.1], [44, 102.9], [45, 102.45], [47.9, 103.5]];
  mp.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: Math.round(b * per), p })), r, 0.07), per).slice(0, 48);
}
const renderMap = fig(function () {
  const host = $('#fig-map'); if (!host) return;
  if (!mp.cs) buildMap();
  const cs = mp.cs, on = new Set($$('.map-l').filter(c => c.checked).map(c => c.value));
  const d1 = cs.slice(0, 24), asia = cs.slice(24, 32);
  const PDH = Math.max(...d1.map(c => c.h)), PDL = Math.min(...d1.map(c => c.l)), AH = Math.max(...asia.map(c => c.h)), AL = Math.min(...asia.map(c => c.l));
  const [lo, hi] = extent(cs);
  const C = chart(host, { n: 48, panels: [{ h: 340, yMin: lo, yMax: hi, dec: 1 }], padB: 22, aria: 'Mapa de liquidez' });
  const P = C.panels[0];
  vband(C, 0, 23, { op: 0.02, label: 'Día 1' });
  vband(C, 24, 31, { op: 0.05, label: 'Asia' }); vband(C, 32, 38, { op: 0.02, label: 'Londres' }); vband(C, 39, 47, { op: 0.05, label: 'Nueva York' });
  if (on.has('pd')) { hline(C, P, PDH, { x1: 24, color: COL.liq, label: 'PDH', side: 'left' }); hline(C, P, PDL, { x1: 24, color: COL.liq, label: 'PDL', side: 'left', below: true }); }
  if (on.has('asia')) { zone(C, P, AH, AL, { x1: 24, x2: 31, color: COL.range, op: 0.1 });
    hline(C, P, AH, { x1: 24, color: COL.range, label: 'Asia H', dash: '3 3' }); hline(C, P, AL, { x1: 24, color: COL.range, label: 'Asia L', dash: '3 3', below: true }); }
  if (on.has('eq')) {
    const a = argExt(cs.map(c => c.h), 12, 16, 'max'), b = argExt(cs.map(c => c.h), 17, 21, 'max');
    hline(C, P, Math.max(cs[a].h, cs[b].h), { x1: a, x2: 43, color: COL.liq, label: 'EQH', dash: '2 3' });
    [a, b].forEach(i => el('circle', { cx: C.x(i), cy: P.y(cs[i].h), r: 4, fill: COL.liq, stroke: COL.surface, 'stroke-width': 2 }, P.g.ann));
  }
  if (on.has('tl')) {
    const a = argExt(cs.map(c => c.l), 36, 39, 'min'), b = argExt(cs.map(c => c.l), 40, 43, 'min'), s = (cs[b].l - cs[a].l) / (b - a);
    seg(C, P, a, cs[a].l, 47, cs[a].l + s * (47 - a), { color: COL.liq, width: 1.5, dash: '6 4' });
    tag(P.g.lab, C.x(44), P.y(cs[a].l + s * (44 - a)) + 18, 'Stops bajo la tendencia', COL.liq, 'middle');
    [a, b].forEach(i => el('circle', { cx: C.x(i), cy: P.y(cs[i].l), r: 4, fill: COL.liq, stroke: COL.surface, 'stroke-width': 2 }, P.g.ann));
  }
  drawCandles(C, P, cs);
  hover(C, i => [['#', (i < 24 ? 'Día 1' : 'Día 2') + ' · ' + String(i % 24).padStart(2, '0') + ':00']].concat(ohlcRows(cs[i], 2)));
});
/* --- barrido vs ruptura --- */
const toC = a => ({ o: a[0], h: a[1], l: a[2], c: a[3] });
const SVB_BASE = [[100.5, 101.6, 100.2, 101.4], [101.4, 103.2, 101.1, 102.9], [102.9, 104.6, 102.6, 104.3], [104.3, 105.0, 103.6, 103.9], [103.9, 104.1, 102.4, 102.7], [102.7, 103.0, 101.8, 102.2], [102.2, 103.1, 101.9, 102.9], [102.9, 103.9, 102.7, 103.7], [103.7, 104.5, 103.4, 104.3], [104.3, 104.9, 104.0, 104.6]];
const SVB = {
  sweep: SVB_BASE.concat([[104.6, 105.7, 104.3, 104.5], [104.5, 104.6, 103.2, 103.4], [103.4, 103.6, 102.3, 102.5], [102.5, 102.8, 101.6, 101.9], [101.9, 102.2, 101.0, 101.2], [101.2, 101.5, 100.4, 100.7]]).map(toC),
  break: SVB_BASE.concat([[104.6, 105.9, 104.5, 105.7], [105.7, 106.6, 105.5, 106.4], [106.4, 106.5, 105.4, 105.6], [105.6, 105.8, 105.05, 105.6], [105.6, 106.9, 105.5, 106.8], [106.8, 107.6, 106.6, 107.4]]).map(toC)
};
const svb = { mode: 'sweep', k: 15 };
const renderSVB = fig(function () {
  const host = $('#fig-svb'); if (!host) return;
  const cs = SVB[svb.mode], k = svb.k, sweep = svb.mode === 'sweep';
  const C = chart(host, { n: cs.length, panels: [{ h: 290, yMin: 99.8, yMax: 108.2, dec: 0 }], aria: 'Barrido frente a ruptura' });
  const P = C.panels[0];
  hline(C, P, 105.0, { x1: 3, color: COL.liq, label: 'Máximo previo · BSL', side: 'left' });
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  if (k >= 10) {
    const c = cs[10];
    el('line', { x1: C.x(10) - 18, x2: C.x(10) + 18, y1: P.y(c.c), y2: P.y(c.c), stroke: COL.text, 'stroke-width': 2 }, P.g.ann);
    tag(P.g.lab, C.x(10) + 22, P.y(c.c), sweep ? 'Cierra DENTRO → barrido (rechazo)' : 'Cierra FUERA → ruptura (aceptación)', sweep ? COL.down : COL.up, 'start');
  }
  if (!sweep && k >= 13) tag(P.g.lab, C.x(13), P.y(cs[13].l) + 20, 'Retesteo: la resistencia ahora es soporte', COL.liq, 'middle');
  hover(C, j => j > k ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
  $('#svb-explain').innerHTML = sweep
    ? 'La vela 11 supera el máximo con la <strong>mecha</strong> (activa los buy stops) pero <strong>cierra por debajo</strong>. Ese cierre dice: "precios rechazados". Lo esperable después de un barrido es un movimiento hacia el lado contrario, buscando la liquidez de abajo.'
    : 'La vela 11 <strong>cierra por encima</strong> del máximo: el mercado acepta esos precios. La liquidez (buy stops) sirvió de combustible para continuar, y en el retesteo el antiguo máximo actúa como soporte.';
});

/* --- FVG --- */
const fvgS = { dir: 'bull', k: 2 };
function fvgCandles() {
  const force = +$('#fvg-force').value, ret = +$('#fvg-ret').value;
  const c1 = { o: 100, h: 101.2, l: 99.6, c: 100.9 };
  const c2c = 100.9 + force * 0.06, c2 = { o: 100.9, c: c2c, h: c2c + 0.2, l: 100.75 };
  let l3 = c2c - (ret / 100) * (c2c - c1.l);
  const o3 = c2c, c3c = Math.min(c2c + 0.35, c2.h + 0.3);
  l3 = Math.min(l3, o3 - 0.05);
  const c3 = { o: o3, c: c3c, h: c3c + 0.25, l: l3 };
  const cs = [c1, c2, c3];
  const has = c3.l > c1.h, top = c2.h, gTop = c3.l, gBot = c1.h, ce = (gTop + gBot) / 2;
  if (has) {
    let p = c3.c;
    const mk = (o, c, hx, lx) => ({ o, c, h: Math.max(o, c) + hx, l: Math.min(o, c) - lx });
    const c4 = mk(p, p + 0.4, 0.25, 0.15); p = c4.c;
    const c5 = mk(p, gTop + 0.3, 0.1, 0.2); p = c5.c;
    const c6 = { o: p, c: ce + 0.5, h: p + 0.15, l: ce }; p = c6.c;
    const c7 = mk(p, gTop + 0.9, 0.2, 0.1); p = c7.c;
    const c8 = mk(p, top + 0.6, 0.25, 0.1); p = c8.c;
    const c9 = mk(p, top + 1.4, 0.2, 0.2);
    cs.push(c4, c5, c6, c7, c8, c9);
  }
  return { cs, has, gTop, gBot, ce };
}
const renderFVG = fig(function () {
  const host = $('#fig-fvg'); if (!host) return;
  const bull = fvgS.dir === 'bull', d = fvgCandles(), m = 103;
  const cs = bull ? d.cs : d.cs.map(c => mirrorC(c, m));
  const tr = v => bull ? v : 2 * m - v;
  const k = Math.min(fvgS.k, cs.length - 1), n = 9;
  const [lo, hi] = extent(d.has ? cs : cs.slice(0, 3));
  const C = chart(host, { n, panels: [{ h: 280, yMin: lo, yMax: hi, dec: 0 }], aria: 'Fair value gap' });
  const P = C.panels[0];
  if (d.has) {
    zone(C, P, tr(d.gBot), tr(d.gTop), { x1: 1, x2: n - 1, color: COL.fvg, op: 0.18, label: (bull ? 'FVG alcista' : 'FVG bajista') + ' (' + Math.abs(d.gTop - d.gBot).toFixed(2) + ')', labelX: C.x(3) - C.step / 2 + 4, labelBelow: !bull });
    hline(C, P, tr(d.ce), { x1: 0, color: COL.fvg, width: 1, dash: '2 3', label: 'CE 50%' });
  }
  hline(C, P, tr(bull ? d.cs[0].h : d.cs[0].h), { x1: 0, x2: 2, color: COL.muted, width: 1, dash: '3 3' });
  hline(C, P, tr(d.cs[2].l), { x1: 0, x2: 2, color: COL.muted, width: 1, dash: '3 3' });
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  ['Vela 1', 'Vela 2', 'Vela 3'].forEach((s, j) => txt(P.g.lab, C.x(j), P.bottom - 6, s, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }));
  hover(C, j => j > k || !cs[j] ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
  const a = bull ? 'el mínimo de la vela 3' : 'el máximo de la vela 3', b = bull ? 'el máximo de la vela 1' : 'el mínimo de la vela 1';
  let t = d.has
    ? `<strong>Hay FVG:</strong> ${a} (${tr(d.gTop).toFixed(2)}) no toca ${b} (${tr(d.gBot).toFixed(2)}). Ese hueco de ${Math.abs(d.gTop - d.gBot).toFixed(2)} es la ineficiencia que dejó el desplazamiento de la vela 2.`
    : `<strong>No hay FVG:</strong> ${a} se solapa con ${b}; la vela 3 retrocedió demasiado y "rellenó" el tramo. Prueba con más fuerza en la vela 2 o menos retroceso.`;
  if (d.has && k >= 5) t += ` El precio volvió al FVG, tocó el 50% (CE) y continuó: el hueco funcionó como zona de ${bull ? 'soporte' : 'resistencia'}.`;
  $('#fvg-explain').innerHTML = t;
});

/* --- order block paso a paso --- */
const OB_DATA = [[110.0, 110.4, 108.8, 109.0], [109.0, 109.6, 107.9, 108.2], [108.2, 108.9, 107.6, 108.6], [108.6, 109.1, 107.2, 107.5], [107.5, 107.8, 106.0, 106.3], [106.3, 107.4, 106.1, 107.1], [107.1, 107.6, 106.5, 106.8], [106.8, 107.0, 105.2, 105.5], [105.5, 105.8, 104.6, 104.9], [104.9, 106.0, 104.8, 105.8], [105.8, 106.5, 105.5, 106.2], [106.2, 106.7, 105.9, 106.0], [106.0, 106.1, 105.2, 105.4], [105.4, 105.6, 104.9, 105.1], [105.1, 105.2, 104.1, 104.4], [104.4, 105.9, 104.3, 105.8], [105.8, 107.2, 105.7, 107.0], [107.0, 107.6, 106.5, 107.4], [107.4, 107.7, 106.9, 107.1], [107.1, 107.2, 106.3, 106.5], [106.5, 106.8, 106.0, 106.6], [106.6, 107.8, 106.5, 107.6], [107.6, 108.6, 107.4, 108.4], [108.4, 109.5, 108.2, 109.3], [109.3, 110.6, 109.0, 110.3]].map(toC);
const OB_STEPS = [
  { upto: 13, t: 'Contexto', d: 'Tendencia bajista: máximos y mínimos decrecientes. Bajo el mínimo de la vela 9 hay stops de venta acumulados (SSL).',
    db: 'Tendencia alcista: máximos y mínimos crecientes. Sobre el máximo de la vela 9 hay stops de compra acumulados (BSL).' },
  { upto: 14, t: '1 · Barrido de liquidez', d: 'La vela 15 perfora ese mínimo y activa los stops de venta: contrapartida para quien quiere comprar.',
    db: 'La vela 15 supera ese máximo y activa los stops de compra: contrapartida para quien quiere vender.' },
  { upto: 14, t: '2 · Order block', d: 'La vela 15 es también la <strong>última vela bajista antes del impulso</strong>: el order block alcista. Su rango es la zona; su 50%, el <em>mean threshold</em>.',
    db: 'La vela 15 es también la <strong>última vela alcista antes de la caída</strong>: el order block bajista. Su rango es la zona; su 50%, el <em>mean threshold</em>.' },
  { upto: 17, t: '3 · Desplazamiento + FVG', d: 'Dos velas grandes alcistas. Entre el máximo de la vela 16 y el mínimo de la vela 18 queda un <strong>FVG</strong>.',
    db: 'Dos velas grandes bajistas. Entre el mínimo de la vela 16 y el máximo de la vela 18 queda un <strong>FVG</strong>.' },
  { upto: 17, t: '4 · MSS (cambio de estructura)', d: 'El impulso rompe el último máximo descendente (vela 12): primera ruptura en contra de la tendencia bajista, con desplazamiento y tras un barrido. El "carácter" del mercado cambió.',
    db: 'La caída rompe el último mínimo ascendente (vela 12): primera ruptura en contra de la tendencia alcista, con desplazamiento y tras un barrido. El "carácter" del mercado cambió.' },
  { upto: 20, t: '5 · Retroceso a la zona', d: 'El precio vuelve al FVG y lo respeta. Aquí se buscan las entradas, con stop por debajo del barrido.',
    db: 'El precio vuelve al FVG y lo respeta. Aquí se buscan las entradas en venta, con stop por encima del barrido.' },
  { upto: 24, t: '6 · Continuación', d: 'Nuevo impulso y nuevas rupturas (BOS) hasta la liquidez de arriba: el máximo de la vela 1 (BSL). De liquidez a liquidez.',
    db: 'Nueva caída y nuevas rupturas (BOS) hasta la liquidez de abajo: el mínimo de la vela 1 (SSL). De liquidez a liquidez.' }
];
const obS = { step: 0, dir: 'bull' };
const renderOB = fig(function () {
  const host = $('#fig-ob'); if (!host) return;
  const bull = obS.dir === 'bull', m = 107.4, st = obS.step, S = OB_STEPS[st];
  const cs = bull ? OB_DATA : OB_DATA.map(c => mirrorC(c, m)), tr = v => bull ? v : 2 * m - v;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n: cs.length, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 0 }], aria: 'Order block, FVG y cambio de estructura' });
  const P = C.panels[0];
  hline(C, P, tr(104.6), { x1: 8, x2: st >= 1 ? 15 : 24, color: COL.liq, label: bull ? 'SSL (stops de venta)' : 'BSL (stops de compra)', side: 'left', below: bull });
  if (st >= 2) { zone(C, P, cs[14].h, cs[14].l, { x1: 14, x2: 24, color: COL.ob, op: 0.16, label: 'Order block', labelBelow: bull, labelX: C.x(19) }); hline(C, P, (cs[14].o + cs[14].c) / 2, { x1: 14, x2: 24, color: COL.ob, width: 1, dash: '2 3' }); }
  if (st >= 3) zone(C, P, tr(105.9), tr(106.5), { x1: 16, x2: 24, color: COL.fvg, op: 0.2, label: 'FVG', labelX: C.x(20) });
  if (st >= 4) hline(C, P, tr(106.7), { x1: 11, x2: 17, color: COL.text2, width: 1.5, dash: '4 3', label: 'MSS', side: 'left' });
  if (st >= 6) hline(C, P, tr(110.4), { x1: 0, color: COL.liq, label: bull ? 'BSL (objetivo)' : 'SSL (objetivo)', side: 'left' });
  if (st >= 1) marker(C, P, 14, bull ? cs[14].l : cs[14].h, { shape: bull ? 'up' : 'down', color: COL.liq, size: 6, label: 'Barrido', dy: bull ? 22 : -22 });
  if (st >= 5) marker(C, P, 20, bull ? cs[20].l : cs[20].h, { shape: bull ? 'up' : 'down', color: COL.text, size: 6, label: 'Entrada', dy: bull ? 22 : -22 });
  drawCandles(C, P, cs.map((c, j) => j <= S.upto ? c : null), { dim: j => st === 2 && j !== 14 });
  hover(C, j => j > S.upto ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
  $('#ob-step').innerHTML = `<h4>${S.t}</h4><div>${bull ? S.d : S.db}</div>`;
  $('#ob-dots').innerHTML = OB_STEPS.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#ob-prev').disabled = st === 0; $('#ob-next').disabled = st === OB_STEPS.length - 1;
});

/* --- premium / descuento --- */
let pdData = null;
function buildPD() {
  const r = mulberry32(4), per = 6;
  const cs = candlesFromPath(bridgePath([[0, 100.4], [3, 99.6], [8, 103.2], [10, 102.6], [16, 110.0], [22, 106.5], [26, 107.6], [30, 105.9]].map(([b, p]) => ({ t: b * per, p })), r, 0.08), per);
  const lo = Math.min(...cs.slice(0, 6).map(c => c.l)), hi = Math.max(...cs.slice(12, 20).map(c => c.h));
  let best = null;
  for (let i = 3; i < 16; i++) { const g = cs[i + 2].l - cs[i].h; if (g > 0 && (!best || g > best.g)) best = { i, g, top: cs[i + 2].l, bot: cs[i].h }; }
  pdData = { cs, lo, hi, fvg: best };
}
const renderPD = fig(function () {
  const host = $('#fig-pd'); if (!host) return;
  if (!pdData) buildPD();
  const { cs, lo, hi, fvg } = pdData, pct = +$('#pd-p').value, price = lo + (hi - lo) * pct / 100, eq = (lo + hi) / 2;
  $('#pd-v').textContent = price.toFixed(2);
  const C = chart(host, { n: cs.length + 6, panels: [{ h: 300, yMin: lo - 0.8, yMax: hi + 0.8, dec: 0 }], aria: 'Premium y descuento' });
  const P = C.panels[0];
  zone(C, P, eq, hi, { color: COL.down, op: 0.08, stroke: false });
  zone(C, P, lo, eq, { color: COL.up, op: 0.08, stroke: false });
  txt(P.g.lab, C.x(cs.length + 2), P.y((eq + hi) / 2) + 4, 'PREMIUM', { 'text-anchor': 'middle', fill: COL.text2, 'font-weight': 700 });
  txt(P.g.lab, C.x(cs.length + 2), P.y((eq + lo) / 2) + 4, 'DESCUENTO', { 'text-anchor': 'middle', fill: COL.text2, 'font-weight': 700 });
  hline(C, P, hi, { color: COL.liq, label: 'Máximo del rango · ERL (BSL)', side: 'left' });
  hline(C, P, lo, { color: COL.liq, label: 'Mínimo del rango · ERL (SSL)', side: 'left', below: true });
  hline(C, P, eq, { color: COL.mid, width: 1, label: 'Equilibrio 50%', side: 'left' });
  if (fvg) zone(C, P, fvg.bot, fvg.top, { x1: fvg.i, x2: cs.length + 5, color: COL.fvg, op: 0.2, label: 'FVG · IRL', labelX: C.x(cs.length - 2) });
  drawCandles(C, P, cs);
  hline(C, P, price, { color: COL.text, width: 2, dash: false, label: 'Precio ' + price.toFixed(2) });
  const zoneTxt = pct > 55 ? `<strong>Premium</strong> (${pct}% del rango): caro. Con sesgo alcista no conviene comprar aquí; con sesgo bajista es donde se buscan ventas.` :
    pct < 45 ? `<strong>Descuento</strong> (${pct}% del rango): barato. Con sesgo alcista es la zona preferida para buscar compras.` :
      `<strong>Equilibrio</strong> (${pct}% del rango): precio "justo". Ninguna ventaja clara por ubicación.`;
  $('#pd-explain').innerHTML = zoneTxt + (fvg ? ' El FVG (liquidez interna) dentro del descuento es un buen candidato para una reacción alcista antes de ir a por la liquidez externa (el máximo).' : '');
  hover(C, j => j >= cs.length ? null : [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)));
});

function initLiq() {
  $$('.stops-t').forEach(c => c.addEventListener('change', renderStops)); renderStops();
  const swp = new Player(k => { sw.k = k; renderSweep(); }, 130);
  segBind($('#liq-barrido'), (key, v) => { sw.dir = v; swp.play(45, 20); });
  $('#sweep-play').addEventListener('click', () => swp.play(45, 18));
  $('#sweep-new').addEventListener('click', () => { sw.seed = newSeed(); buildSweep(); swp.play(45, 18); });
  renderSweep();
  $$('.map-l').forEach(c => c.addEventListener('change', renderMap));
  $('#map-new').addEventListener('click', () => { mp.seed = newSeed(); buildMap(); renderMap(); });
  renderMap();
  const svp = new Player(k => { svb.k = k; renderSVB(); }, 450);
  segBind($('#liq-svb'), (key, v) => { svb.mode = v; svp.play(15, 9); });
  $('#svb-play').addEventListener('click', () => svp.play(15, 9));
  renderSVB();
  const fvp = new Player(k => { fvgS.k = k; renderFVG(); }, 380);
  segBind($('#liq-fvg'), (key, v) => { fvgS.dir = v; fvp.stop(); fvgS.k = 2; renderFVG(); });
  ['#fvg-force', '#fvg-ret'].forEach(s => $(s).addEventListener('input', () => { fvp.stop(); fvgS.k = 2; renderFVG(); }));
  $('#fvg-play').addEventListener('click', () => fvp.play(8, 2));
  renderFVG();
  $('#ob-prev').addEventListener('click', () => { obS.step = Math.max(0, obS.step - 1); renderOB(); });
  $('#ob-next').addEventListener('click', () => { obS.step = Math.min(OB_STEPS.length - 1, obS.step + 1); renderOB(); });
  segBind($('#liq-ob'), (key, v) => { obS.dir = v; renderOB(); });
  renderOB();
  $('#pd-p').addEventListener('input', renderPD); renderPD();
  quiz($('#liq-quiz'), 'Práctica: liquidez', QUIZZES["liquidez"].qs);
}

export { extendPath, mirrorC, tri, stopsData, buildStops, renderStops, sw, buildSweep, renderSweep, mp, buildMap, renderMap, toC, SVB_BASE, SVB, svb, renderSVB, fvgS, fvgCandles, renderFVG, OB_DATA, OB_STEPS, obS, renderOB, pdData, buildPD, renderPD, initLiq };
