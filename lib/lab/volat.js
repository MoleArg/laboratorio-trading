// Motor interactivo · volat. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, fmt, gauss, hline, hover, lineSeries, marker, mulberry32, newSeed, quiz, segBind, tag, txt, vband } from './core';
import { smaArr } from './emas';
import { drawCandleRaw } from './velas';
/* =====================================================================
   MÓDULO 12 · VOLATILIDAD: ATR Y BOLLINGER
   ===================================================================== */
function trArr(cs) { return cs.map((c, i) => i ? Math.max(c.h - c.l, Math.abs(c.h - cs[i - 1].c), Math.abs(c.l - cs[i - 1].c)) : c.h - c.l); }
function atrArr(cs, n) {
  const tr = trArr(cs), out = Array(cs.length).fill(null); let a = 0;
  for (let i = 1; i < cs.length; i++) {
    if (i <= n) { a += tr[i]; if (i === n) { a /= n; out[i] = a; } }
    else { a = (a * (n - 1) + tr[i]) / n; out[i] = a; }
  }
  return out;
}
function bollinger(cl, n, k) {
  const mid = smaArr(cl, n), up = [], lo = [], pb = [], bw = [];
  cl.forEach((c, i) => {
    if (mid[i] == null) { up.push(null); lo.push(null); pb.push(null); bw.push(null); return; }
    let v = 0; for (let j = i - n + 1; j <= i; j++) v += (cl[j] - mid[i]) ** 2;
    const sd = Math.sqrt(v / n), u = mid[i] + k * sd, l = mid[i] - k * sd;
    up.push(u); lo.push(l); pb.push(u === l ? 0.5 : (c - l) / (u - l)); bw.push((u - l) / mid[i] * 100);
  });
  return { mid, up, lo, pb, bw };
}
const VO_SC = {
  squeeze: [[0, 100, .18], [6, 103, .18], [12, 98.5, .16], [18, 102.2, .14], [24, 99.2, .12], [30, 101.4, .09], [36, 99.9, .06], [42, 100.9, .05], [48, 100.2, .05], [52, 100.6, .2], [55, 103.0, .22], [60, 105.5, .2], [66, 104.8, .2], [72, 107.6, .2], [80, 108.4]],
  trend: [[0, 100, .14], [8, 103.5, .14], [11, 102.8, .14], [20, 107, .14], [23, 106.2, .14], [32, 110.6, .14], [35, 109.8, .14], [44, 114.2, .14], [47, 113.4, .14], [56, 117.8, .14], [60, 117, .14], [70, 121, .14], [80, 122.5]],
  news: [[0, 100, .08], [10, 101, .08], [20, 99.5, .08], [30, 100.5, .08], [38, 100, .5], [40, 103.8, .4], [42, 101.5, .12], [50, 102.4, .1], [60, 101.8, .1], [70, 102.6, .1], [80, 102.2]],
  range: [[0, 100, .15], [7, 103, .15], [14, 97.5, .15], [21, 102.6, .15], [28, 97.8, .15], [35, 102.8, .15], [42, 98, .15], [49, 102.4, .15], [56, 97.6, .15], [63, 102.6, .15], [70, 98.4, .15], [80, 100]]
};
const VO_W = 40;
function genVO(sc, seed) {
  const r = mulberry32(seed), per = 6, wps = [{ t: 0, p: 100, n: 0.14 }];
  let p = 100; for (let b = 10; b < VO_W; b += 10) { p += gauss(r) * 1; wps.push({ t: b * per, p, n: 0.14 }); }
  VO_SC[sc].forEach(([b, pr, nz]) => wps.push({ t: (VO_W + b) * per, p: pr, n: nz }));
  return candlesFromPath(bridgePath(wps, r, 0.14), per);
}

/* --- True Range --- */
const renderTR = fig(function () {
  const host = $('#fig-tr'); if (!host) return;
  const P = v => 100 + v * 0.1;
  let H = +$('#tr-h').value, L = +$('#tr-l').value; if (L > H) { const t = H; H = L; L = t; }
  const pc = +$('#tr-pc').value, prev = { o: P(pc) + 0.4, c: P(pc), h: P(pc) + 0.6, l: P(pc) - 0.3 };
  const cur = { o: P(L + 0.3 * (H - L)), c: P(L + 0.7 * (H - L)), h: P(H), l: P(L) };
  const comps = [['Máximo − Mínimo', cur.h - cur.l], ['|Máximo − Cierre ant.|', Math.abs(cur.h - prev.c)], ['|Mínimo − Cierre ant.|', Math.abs(cur.l - prev.c)]];
  const tr = Math.max(...comps.map(c => c[1])), win = comps.findIndex(c => c[1] === tr);
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 900 260', role: 'img', 'aria-label': 'Cálculo del True Range' });
  host.insertBefore(svg, host.firstChild);
  const y = v => 240 - (v - 99.5) / 11 * 225;
  for (let v = 100; v <= 110; v += 2) { el('line', { x1: 40, x2: 470, y1: y(v), y2: y(v), stroke: COL.grid }, svg); txt(svg, 476, y(v) + 4, v.toFixed(0), { fill: COL.muted, 'font-size': 10.5 }); }
  drawCandleRaw(el('g', {}, svg), 140, 46, y(prev.o), y(prev.h), y(prev.l), y(prev.c), prev.c >= prev.o, { ww: 2.5 });
  drawCandleRaw(el('g', {}, svg), 330, 46, y(cur.o), y(cur.h), y(cur.l), y(cur.c), cur.c >= cur.o, { ww: 2.5 });
  txt(svg, 140, 256, 'Vela anterior', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }); txt(svg, 330, 256, 'Vela actual', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  el('line', { x1: 140, x2: 420, y1: y(prev.c), y2: y(prev.c), stroke: COL.text2, 'stroke-dasharray': '4 4' }, svg);
  tag(svg, 168, y(prev.c) - 12, 'Cierre anterior', COL.text2, 'start');
  const bx = [550, 660, 770];
  comps.forEach(([lb, v], i) => {
    const top = i === 2 ? Math.max(cur.l, prev.c) : i === 1 ? Math.max(cur.h, prev.c) : cur.h, bot = top - v;
    el('rect', { x: bx[i] - 14, y: y(top), width: 28, height: Math.max(2, y(bot) - y(top)), rx: 4, fill: i === win ? COL.range : COL.text2, 'fill-opacity': i === win ? 0.85 : 0.35 }, svg);
    txt(svg, bx[i], 18, v.toFixed(2), { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 13 });
    txt(svg, bx[i], 252, ['H − L', '|H − Cant|', '|L − Cant|'][i], { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 });
  });
  $('#tr-explain').innerHTML = `TR = el mayor de ${comps.map(c => c[1].toFixed(2)).join(', ')} = <strong>${tr.toFixed(2)}</strong> (${comps[win][0]}). ` +
    (win === 0 ? 'Sin hueco relevante: el TR es simplemente el rango de la vela.' : 'El cierre anterior queda fuera del rango actual (hubo un hueco): el TR lo incluye para no subestimar la volatilidad.');
});

/* --- laboratorio ATR --- */
const atrL = { sc: 'squeeze', seed: 33, cs: null };
const renderATR = fig(function () {
  const host = $('#fig-atr'); if (!host) return;
  if (!atrL.cs) atrL.cs = genVO(atrL.sc, atrL.seed);
  const n0 = +$('#atr-n').value; $('#atr-n-v').textContent = n0;
  const all = atrL.cs, tr = trArr(all), at = atrArr(all, n0), cs = all.slice(VO_W), T = tr.slice(VO_W), A = at.slice(VO_W), n = cs.length;
  const [lo, hi] = extent(cs), amax = Math.max(...T) * 1.1;
  const C = chart(host, { n, panels: [{ h: 250, yMin: lo, yMax: hi, dec: 0, title: 'Precio' }, { h: 130, yMin: 0, yMax: amax, ticks: 3, dec: 1, title: 'True Range y ATR ' + n0 }], aria: 'Precio y ATR' });
  const [P1, P2] = C.panels;
  drawCandles(C, P1, cs);
  T.forEach((v, i) => el('rect', { x: C.x(i) - C.bw / 2, y: P2.y(v), width: C.bw, height: Math.max(1, P2.y(0) - P2.y(v)), fill: COL.text2, 'fill-opacity': 0.3 }, P2.g.data));
  lineSeries(C, P2, A, { color: COL.range, width: 2.2 });
  hover(C, i => { const gi = i + VO_W, c = all[gi], p = all[gi - 1]; return [['#', 'Vela ' + (i + 1)], ['H − L', fmt(c.h - c.l)], ['|H − Cant|', fmt(Math.abs(c.h - p.c))], ['|L − Cant|', fmt(Math.abs(c.l - p.c))], ['TR', fmt(T[i])], ['ATR', fmt(A[i])]]; });
  const av = A.filter(x => x != null), mn = Math.min(...av), mx = Math.max(...av);
  const Tx = { squeeze: 'La volatilidad se comprime (ATR mínimo) y luego se expande con la ruptura: el ATR sube con retraso, siguiendo al movimiento.', trend: 'En tendencia el ATR se mantiene relativamente estable: las velas tienen un tamaño "normal" constante.', news: 'Una noticia dispara el TR de unas pocas velas. El ATR sube de golpe y tarda varias velas en "olvidar" el pico.' };
  $('#atr-explain').innerHTML = Tx[atrL.sc] + ` En este gráfico el ATR va de <strong>${mn.toFixed(2)}</strong> a <strong>${mx.toFixed(2)}</strong> (×${(mx / mn).toFixed(1)}): un stop fijo sería demasiado estrecho en unos momentos y demasiado amplio en otros.`;
});

/* --- stops con ATR --- */
const asL = { cs: null };
const renderAS = fig(function () {
  const host = $('#fig-atr-stop'); if (!host) return;
  if (!asL.cs) asL.cs = genVO('trend', 52);
  const e = +$('#as-e').value, k = +$('#as-k').value / 10, m = +$('#as-m').value / 10, risk = Math.max(1, +$('#as-r').value || 100);
  $('#as-e-v').textContent = e + 1; $('#as-k-v').textContent = k.toFixed(1); $('#as-m-v').textContent = m.toFixed(1);
  const all = asL.cs, atr = atrArr(all, 14), cs = all.slice(VO_W), A = atr.slice(VO_W), n = cs.length;
  const entry = cs[e].c, a0 = A[e], stop0 = entry - k * a0, units = risk / (k * a0);
  const trail = Array(n).fill(null); let hh = cs[e].h, stp = stop0, exit = -1, exitP = null;
  for (let t = e + 1; t < n; t++) {
    if (cs[t].l <= stp) { exit = t; exitP = Math.min(stp, cs[t].o); break; }
    hh = Math.max(hh, cs[t].h); stp = Math.max(stp, hh - m * A[t]); trail[t] = stp;
  }
  trail[e] = stop0;
  const [lo, hi] = extent(cs, [stop0]);
  const C = chart(host, { n, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 0 }], aria: 'Stops con ATR' });
  const P = C.panels[0];
  drawCandles(C, P, cs);
  hline(C, P, stop0, { x1: e, x2: Math.min(n - 1, e + 6), color: COL.down, width: 1.6, dash: false, label: 'Stop inicial', side: 'right', below: true });
  let d = ''; trail.forEach((v, t) => { if (v == null || (exit > 0 && t > exit)) return; d += (d ? 'L' : 'M') + C.x(t).toFixed(1) + ' ' + P.y(v).toFixed(1) + ' '; });
  el('path', { d, fill: 'none', stroke: COL.liq, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, P.g.ann);
  marker(C, P, e, entry, { shape: 'up', color: COL.text, size: 6, label: 'Entrada', dy: -18 });
  if (exit > 0) marker(C, P, exit, exitP, { shape: 'down', color: COL.liq, size: 6, label: 'Salida (chandelier)', dy: 22 });
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)], ['ATR 14', fmt(A[i])], ['Stop dinámico', fmt(trail[i])]]);
  const outP = exit > 0 ? exitP : cs[n - 1].c, R = (outP - entry) / (entry - stop0);
  $('#as-stats').innerHTML = [['ATR en la entrada', a0.toFixed(2)], ['Distancia al stop', (k * a0).toFixed(2)], ['Tamaño', units.toFixed(1) + ' unidades'], ['Resultado', (R >= 0 ? '+' : '') + R.toFixed(1) + ' R (' + (R * risk >= 0 ? '+' : '−') + '$' + Math.abs(R * risk).toFixed(0) + ')']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#as-explain').innerHTML = `Entrada en la vela ${e + 1} a ${entry.toFixed(2)}. Stop = entrada − ${k.toFixed(1)} × ATR = ${stop0.toFixed(2)}. Con $${risk} de riesgo, el tamaño es ${risk} / ${(k * a0).toFixed(2)} = <strong>${units.toFixed(1)} unidades</strong>. ` +
    (exit > 0 ? `El chandelier (${m.toFixed(1)} × ATR bajo el máximo) cerró la operación en la vela ${exit + 1}.` : 'El chandelier sigue acompañando la tendencia hasta el final del gráfico.') +
    ' Prueba un m pequeño: te saca antes, con más operaciones cortadas en retrocesos normales.';
});

/* --- Bollinger --- */
const bbL = { sc: 'squeeze', seed: 35, cs: null };
const renderBB = fig(function () {
  const host = $('#fig-bb'); if (!host) return;
  if (!bbL.cs) bbL.cs = genVO(bbL.sc, bbL.seed);
  const N = +$('#bb-n').value, K = +$('#bb-k').value / 10;
  $('#bb-n-v').textContent = N; $('#bb-k-v').textContent = K.toFixed(1);
  const all = bbL.cs, B = bollinger(all.map(c => c.c), N, K), cs = all.slice(VO_W), n = cs.length, sl = a => a.slice(VO_W);
  const mid = sl(B.mid), up = sl(B.up), lo2 = sl(B.lo), pb = sl(B.pb), bw = sl(B.bw);
  const [lo, hi] = extent(cs, up.concat(lo2).filter(x => x != null));
  const panels = [{ h: 270, yMin: lo, yMax: hi, dec: 0, title: 'Precio y bandas' }];
  if ($('#bb-pb').checked) panels.push({ h: 90, yMin: -0.3, yMax: 1.3, grid: false, title: '%B' });
  if ($('#bb-bw').checked) { const v = bw.filter(x => x != null); panels.push({ h: 90, yMin: 0, yMax: Math.max(...v) * 1.15, ticks: 3, dec: 1, title: 'Ancho de banda (%)' }); }
  const C = chart(host, { n, panels, aria: 'Bandas de Bollinger' });
  const P = C.panels[0];
  const sq = argExt(bw.map(x => x == null ? Infinity : x), 0, n - 1, 'min');
  vband(C, Math.max(0, sq - 2), Math.min(n - 1, sq + 2), { color: COL.liq, op: 0.1 });
  tag(P.g.lab, C.x(sq), P.top + 14, 'Squeeze (ancho mínimo)', COL.liq, 'middle');
  let area = '';
  for (let i = 0; i < n; i++) if (up[i] != null) area += (area ? 'L' : 'M') + C.x(i).toFixed(1) + ' ' + P.y(up[i]).toFixed(1);
  for (let i = n - 1; i >= 0; i--) if (lo2[i] != null) area += 'L' + C.x(i).toFixed(1) + ' ' + P.y(lo2[i]).toFixed(1);
  el('path', { d: area + 'Z', fill: COL.range, 'fill-opacity': 0.07, stroke: 'none' }, P.g.zone);
  lineSeries(C, P, up, { color: COL.range, width: 1.6 }); lineSeries(C, P, lo2, { color: COL.range, width: 1.6 });
  lineSeries(C, P, mid, { color: COL.text2, width: 1.2 }).setAttribute('stroke-dasharray', '4 4');
  drawCandles(C, P, cs);
  let outU = 0, outL = 0;
  cs.forEach((c, i) => { if (up[i] == null) return; if (c.c > up[i]) { outU++; el('circle', { cx: C.x(i), cy: P.y(c.h) - 8, r: 3, fill: COL.liq }, P.g.ann); } if (c.c < lo2[i]) { outL++; el('circle', { cx: C.x(i), cy: P.y(c.l) + 8, r: 3, fill: COL.liq }, P.g.ann); } });
  let pi = 1;
  if ($('#bb-pb').checked) { const PB = C.panels[pi++]; [1, 0.5, 0].forEach(v => { hline(C, PB, v, { color: COL.muted, width: 1, dash: v === 0.5 ? '2 4' : '5 4' }); txt(PB.g.lab, C.w - C.padR + 6, PB.y(v) + 4, String(v), { fill: COL.muted, 'font-size': 10.5 }); }); lineSeries(C, PB, pb, { color: COL.rsi, width: 1.8 }); }
  if ($('#bb-bw').checked) { const PW = C.panels[pi++]; lineSeries(C, PW, bw, { color: COL.liq, width: 1.8 }); marker(C, PW, sq, bw[sq], { color: COL.liq, size: 5 }); }
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)], ['Banda sup.', fmt(up[i])], ['Media', fmt(mid[i])], ['Banda inf.', fmt(lo2[i])], ['%B', fmt(pb[i], 2)], ['Ancho', fmt(bw[i], 2) + '%']]);
  $('#bb-stats').innerHTML = [['Cierres sobre la banda sup.', outU], ['Cierres bajo la banda inf.', outL], ['%B actual', fmt(pb[n - 1], 2)]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const Tx = { squeeze: 'Las bandas se estrechan al máximo (squeeze) y luego se abren con la ruptura. El squeeze avisó de la expansión, pero no de su dirección.', trend: `El precio "camina" por la banda superior: ${outU} cierres por encima y la tendencia sigue. En tendencia, tocar la banda es fuerza, no una señal de venta.`, range: 'En rango, los toques de las bandas vuelven hacia la media: aquí sí funciona la lectura de reversión.' };
  $('#bb-explain').innerHTML = Tx[bbL.sc];
});
function initVolat() {
  ['#tr-pc', '#tr-h', '#tr-l'].forEach(s => $(s).addEventListener('input', renderTR)); renderTR();
  segBind($('#vo-atr'), (k, v) => { atrL.sc = v; atrL.cs = genVO(v, atrL.seed); renderATR(); });
  $('#atr-n').addEventListener('input', renderATR);
  $('#atr-new').addEventListener('click', () => { atrL.seed = newSeed(); atrL.cs = genVO(atrL.sc, atrL.seed); renderATR(); });
  renderATR();
  ['#as-e', '#as-k', '#as-m', '#as-r'].forEach(s => $(s).addEventListener('input', renderAS)); renderAS();
  segBind($('#vo-bb'), (k, v) => { bbL.sc = v; bbL.cs = genVO(v, bbL.seed); renderBB(); });
  ['#bb-n', '#bb-k'].forEach(s => $(s).addEventListener('input', renderBB));
  ['#bb-pb', '#bb-bw'].forEach(s => $(s).addEventListener('change', renderBB));
  renderBB();
  quiz($('#volat-quiz'), 'Práctica: volatilidad', QUIZZES["volat"].qs);
}

export { trArr, atrArr, bollinger, VO_SC, VO_W, genVO, renderTR, atrL, renderATR, asL, renderAS, bbL, renderBB, initVolat };
