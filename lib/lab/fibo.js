// Motor interactivo · fibo. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, argExt, bridgePath, candlesFromPath, chart, clamp, drawCandles, el, extent, fig, gauss, hline, hover, lineSeries, marker, mulberry32, newSeed, ohlcRows, quiz, segBind, txt, zone } from './core';
import { mirrorC } from './liquidez';
/* =====================================================================
   MÓDULO · FIBONACCI
   ===================================================================== */
const FIB_RET = [0.236, 0.382, 0.5, 0.618, 0.786];
const FIB_EXT = [-0.272, -0.618, -1];
const fibLbl = x => (x === 0 ? '0' : x === 1 ? '1' : x.toFixed(3).replace(/0+$/, '').replace('.', ','));
const renderFbSeq = fig(function () {
  const host = $('#fig-fb-seq'); if (!host) return;
  const F = [1, 1]; while (F.length < 17) F.push(F[F.length - 1] + F[F.length - 2]);
  const q = F.slice(0, 16).map((v, i) => v / F[i + 1]);
  const C = chart(host, { n: q.length, panels: [{ h: 190, yMin: 0.45, yMax: 1.05, dec: 2, step: 0.1 }], padB: 22, aria: 'Cociente entre términos consecutivos de Fibonacci' });
  const P = C.panels[0];
  hline(C, P, 0.618, { color: COL.liq, width: 1.4, label: '0,618', side: 'left' });
  lineSeries(C, P, q, { color: COL.range, width: 2.2 });
  q.forEach((v, i) => { el('circle', { cx: C.x(i), cy: P.y(v), r: 3.2, fill: COL.range, stroke: COL.surface, 'stroke-width': 1.5 }, P.g.ann); txt(C.bg, C.x(i), C.h - 6, String(F[i]), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10 }); });
  hover(C, i => [['#', `${F[i]} / ${F[i + 1]}`], ['Cociente', q[i].toFixed(5)], ['Distancia a 0,618', (q[i] - 0.6180340).toFixed(5)]]);
});

const fb = { dir: 'up', seed: 41, cs: null, now: 0, A: null, B: null, C: null, P: null, dyn: null, hnd: null, drag: null, ar: 1, target: 0.618 };
function buildFb() {
  const r = mulberry32(fb.seed), per = 5;
  const tgt = FIB_RET[1 + Math.floor(r() * 4)] + (r() - 0.5) * 0.03, ext = r() < 0.5 ? 0.272 : 0.618;
  fb.target = tgt;
  const A = 100, B = 100 + 9 + r() * 4, R = B - A, L = B - tgt * R;
  const W = [[0, 102.6], [3, 103.4], [6, 101.6], [9, 102.2], [12, A], [16, A + R * 0.45], [18, A + R * 0.36], [24, B], [27, B - tgt * R * 0.55], [29, B - tgt * R * 0.3], [33, L], [36, L + R * 0.18], [44, B + R * 0.02], [47, B - R * 0.08], [54, B + ext * R], [58, B + ext * R - R * 0.12]];
  const cs = candlesFromPath(bridgePath(W.map(([b, p], k) => ({ t: b * per, p: p + (k && k !== 4 && k !== 7 && k !== 10 ? gauss(r) * 0.15 : 0) })), r, 0.16), per);
  fb.cs = fb.dir === 'up' ? cs : cs.map(c => mirrorC(c, 106));
  fb.now = 37;
  fb.ar = fb.cs.reduce((s, c) => s + c.h - c.l, 0) / fb.cs.length;
  autoFb();
}
function autoFb() {
  const up = fb.dir === 'up', cs = fb.cs;
  const a = argExt(cs.map(c => up ? c.l : c.h), 9, 15, up ? 'min' : 'max');
  const b = argExt(cs.map(c => up ? c.h : c.l), a + 1, 27, up ? 'max' : 'min');
  fb.A = { i: a, p: up ? cs[a].l : cs[a].h }; fb.B = { i: b, p: up ? cs[b].h : cs[b].l };
}
function analyzeFb() {
  const up = fb.dir === 'up', cs = fb.cs, A = fb.A, B = fb.B, R = B.p - A.p;
  if (B.i <= A.i) return { err: 'order' };
  if (up ? R <= 0 : R >= 0) return { err: 'dir' };
  const lv = x => B.p - x * R;
  const last = $('#fb-fut').checked ? cs.length - 1 : fb.now;
  let ext = B.i, extV = B.p, newEx = -1;
  for (let k = B.i + 1; k <= last; k++) {
    if (up ? cs[k].h > B.p : cs[k].l < B.p) { newEx = k; break; }
    const v = up ? cs[k].l : cs[k].h; if (up ? v < extV : v > extV) { extV = v; ext = k; }
  }
  const depth = (B.p - extV) / R;
  let near = FIB_RET[0]; FIB_RET.forEach(x => { if (Math.abs(x - depth) < Math.abs(near - depth)) near = x; });
  let hitExt = null;
  if (newEx >= 0) for (let k = newEx; k <= last; k++) FIB_EXT.forEach(x => { if (up ? cs[k].h >= lv(x) : cs[k].l <= lv(x)) if (hitExt == null || x < hitExt) hitExt = x; });
  const beforeA = A.i < 1 ? 0 : cs.slice(Math.max(0, A.i - 4), A.i).filter(c => up ? c.l < A.p : c.h > A.p).length;
  const afterB = cs.slice(A.i + 1, B.i).filter(c => up ? c.h > B.p : c.l < B.p).length;
  return { up, R, lv, ext, extV, depth, near, newEx, hitExt, last, beforeA, afterB };
}
function drawFbDyn() {
  const C = fb.C, P = fb.P, g = fb.dyn, cs = fb.cs;
  while (g.firstChild) g.removeChild(g.firstChild);
  const an = analyzeFb(), xEnd = C.n - 1;
  [fb.A, fb.B].forEach((pt, idx) => { const h = fb.hnd.children[idx]; h.setAttribute('transform', `translate(${C.x(pt.i)},${P.y(pt.p)})`); });
  if (an.err) {
    $('#fb-stats').innerHTML = '';
    $('#fb-explain').className = 'explain bad';
    $('#fb-explain').innerHTML = an.err === 'order' ? 'El punto <b>1</b> (inicio del impulso) tiene que estar <strong>antes</strong> que el <b>0</b> (final).'
      : fb.dir === 'up' ? 'En un impulso <strong>alcista</strong> el 1 va en el mínimo y el 0 en el máximo: el 0 tiene que estar más arriba.' : 'En un impulso <strong>bajista</strong> el 1 va en el máximo y el 0 en el mínimo: el 0 tiene que estar más abajo.';
    return;
  }
  const x1 = C.x(fb.A.i), x2 = C.x(xEnd) + C.step / 2, levels = [0, ...FIB_RET, 1].concat($('#fb-ext-on').checked ? FIB_EXT : []);
  const yA = an.lv(0.618), yB = an.lv(0.786);
  el('rect', { x: C.x(fb.B.i), y: Math.min(P.y(yA), P.y(yB)), width: x2 - C.x(fb.B.i), height: Math.abs(P.y(yA) - P.y(yB)), fill: COL.fvg, 'fill-opacity': 0.12 }, g);
  levels.forEach(x => {
    const v = an.lv(x), yy = P.y(v), isExt = x < 0, isKey = x === 0.618 || x === 0.5;
    const col = isExt ? COL.up : x === 0 || x === 1 ? COL.text2 : x === 0.5 ? COL.muted : COL.liq;
    el('line', { x1, x2, y1: yy, y2: yy, stroke: col, 'stroke-width': isKey ? 1.6 : 1, 'stroke-dasharray': x === 0 || x === 1 ? null : isExt ? '2 3' : '6 4', opacity: 0.9 }, g);
    const s = `${fibLbl(x)}  ${v.toFixed(2)}`;
    const tw = s.length * 6 + 8;
    el('rect', { x: C.padL + C.iw - tw - 2, y: yy - 8, width: tw, height: 15, rx: 3, fill: COL.surface2, opacity: 0.92 }, g);
    txt(g, C.padL + C.iw - tw + 2, yy + 4, s, { fill: col, 'font-size': 10.5, 'font-family': 'Consolas, monospace' });
  });
  el('line', { x1: C.x(fb.A.i), y1: P.y(fb.A.p), x2: C.x(fb.B.i), y2: P.y(fb.B.p), stroke: COL.text2, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, g);
  if (an.ext > fb.B.i) {
    marker(C, { y: P.y, g: { ann: g, lab: g } }, an.ext, an.extV, { color: COL.text, size: 5, label: 'Retroceso ' + (an.depth * 100).toFixed(1) + '%', dy: an.up ? 20 : -18 });
  }
  if (!$('#fb-fut').checked) {
    const xn = C.x(fb.now) + C.step / 2;
    el('rect', { x: xn, y: P.top, width: C.padL + C.iw - xn, height: P.h, fill: COL.surface3, 'fill-opacity': 0.35 }, g);
    txt(g, (xn + C.padL + C.iw) / 2, P.top + P.h / 2, '? Futuro oculto', { fill: COL.muted, 'font-size': 13, 'text-anchor': 'middle' });
  }
  const st = [['Impulso', Math.abs(an.R).toFixed(2)], ['Retroceso máx.', an.ext > fb.B.i ? (an.depth * 100).toFixed(1) + '%' : '—'], ['Nivel más cercano', an.ext > fb.B.i ? fibLbl(an.near) : '—'],
    ['Zona', an.ext > fb.B.i ? (an.depth < 0.5 ? 'Premium' : an.depth <= 0.79 ? 'Descuento' : 'Muy profundo') : '—']];
  if ($('#fb-fut').checked) st.push(['Extensión alcanzada', an.hitExt == null ? (an.newEx >= 0 ? 'superó el 0' : 'no') : fibLbl(an.hitExt)]);
  $('#fb-stats').innerHTML = st.map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const ex = $('#fb-explain'); ex.className = 'explain';
  const warn = [];
  if (an.beforeA) warn.push(`hay velas justo antes del punto 1 que ${an.up ? 'bajan' : 'suben'} más: el impulso probablemente empieza antes`);
  if (an.afterB) warn.push(`entre el 1 y el 0 hay velas que ${an.up ? 'superan' : 'perforan'} el punto 0: no marcaste el extremo real del impulso`);
  let t = warn.length ? `<strong>Revisa el trazado:</strong> ${warn.join('; ')}. ` : '';
  if (an.ext <= fb.B.i) t += 'Todavía no hay retroceso después del punto 0.';
  else {
    const d = an.depth, dz = Math.abs(d - an.near);
    t += `El precio retrocedió hasta el <strong>${(d * 100).toFixed(1)}%</strong> del impulso` + (dz < 0.03 ? `, prácticamente en el nivel <strong>${fibLbl(an.near)}</strong>.` : `, entre niveles (el más cercano es ${fibLbl(an.near)}).`);
    t += d < 0.382 ? ' Retroceso poco profundo: típico de tendencias fuertes, pero comprar ahí es comprar en premium.'
      : d <= 0.79 ? ' Zona de descuento: es donde se buscan las entradas a favor del impulso, con el stop más allá del punto 1.'
        : ' Retroceso muy profundo: el impulso pierde validez.';
    if ($('#fb-fut').checked) t += an.newEx >= 0 ? ` Después el precio superó el punto 0 en la vela ${an.newEx + 1}` + (an.hitExt != null ? ` y alcanzó la extensión <strong>${fibLbl(an.hitExt)}</strong>.` : '.') : ' Después, el precio no superó el punto 0.';
    else t += ' Activa "Ver el futuro" para ver cómo siguió.';
    if (!warn.length) ex.className = 'explain good';
  }
  $('#fb-explain').innerHTML = t;
}
const renderFb = fig(function () {
  const host = $('#fig-fb'); if (!host) return;
  if (!fb.cs) buildFb();
  const cs = fb.cs, show = $('#fb-fut').checked, ext = analyzeFb();
  const extra = ext.err ? [] : [ext.lv(-0.618)];
  const [lo, hi] = extent(cs, $('#fb-ext-on').checked ? extra : []);
  const C = chart(host, { n: cs.length + 2, panels: [{ h: 360, yMin: lo, yMax: hi, dec: 0 }], aria: 'Traza retrocesos de Fibonacci' });
  const P = C.panels[0];
  drawCandles(C, P, show ? cs : cs.map((c, j) => j <= fb.now ? c : null));
  hover(C, i => i < cs.length && (show || i <= fb.now) ? [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(cs[i], 2)) : null);
  fb.C = C; fb.P = P;
  const clip = el('clipPath', { id: 'fb-clip' }, el('defs', {}, C.svg));
  el('rect', { x: C.padL, y: P.top, width: C.iw, height: P.h }, clip);
  fb.dyn = el('g', { 'clip-path': 'url(#fb-clip)' }, C.svg); fb.hnd = el('g', {}, C.svg);
  ['A', 'B'].forEach((k, idx) => {
    const h = el('g', { style: 'cursor:grab', tabindex: 0, role: 'slider', 'aria-label': idx ? 'Punto 0: final del impulso' : 'Punto 1: inicio del impulso' }, fb.hnd);
    el('circle', { r: 9, fill: '#ffffff', stroke: COL.liq, 'stroke-width': 3 }, h);
    txt(h, 0, 4, idx ? '0' : '1', { fill: '#0b0e14', 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', 'pointer-events': 'none' });
    h.addEventListener('pointerdown', e => { e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ } fb.drag = k; });
    h.addEventListener('pointermove', e => {
      if (fb.drag !== k) return;
      const r = C.svg.getBoundingClientRect(), sx = (e.clientX - r.left) * C.w / r.width, sy = (e.clientY - r.top) * C.h / r.height;
      const i = clamp(Math.round((sx - C.padL) / C.step - 0.5), 0, show ? cs.length - 1 : fb.now);
      let p = P.yMax - (sy - P.top) / P.h * (P.yMax - P.yMin);
      const lo2 = cs[i].l, hi2 = cs[i].h, snap = Math.abs(p - lo2) < Math.abs(p - hi2) ? lo2 : hi2;
      if (Math.abs(p - snap) < 0.9 * fb.ar) p = snap;
      fb[k] = { i, p }; drawFbDyn();
    });
    const end = () => { fb.drag = null; };
    h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    h.addEventListener('keydown', e => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return;
      e.preventDefault(); const pt = fb[k]; const i = clamp(pt.i + d[0], 0, show ? cs.length - 1 : fb.now);
      fb[k] = { i, p: d[0] ? ((k === 'A') === (fb.dir === 'up') ? cs[i].l : cs[i].h) : pt.p + d[1] * fb.ar * 0.25 }; drawFbDyn();
    });
  });
  drawFbDyn();
});

const renderFbExt = fig(function () {
  const host = $('#fig-fb-ext'); if (!host) return;
  const r = +$('#fx-r').value / 100, s = +$('#fx-s').value / 100;
  $('#fx-r-v').textContent = Math.round(r * 100) + '%'; $('#fx-s-v').textContent = Math.round(s * 100) + '%';
  const A = 100, B = 110, R = B - A, lv = x => B - x * R, entry = lv(r), stop = A - s * R, risk = entry - stop;
  const per = 6, rand = mulberry32(19);
  const W = [[0, 101.5], [3, A], [13, B], [19, entry], [27, B + 0.1], [30, B - 1.4], [38, lv(-0.618)], [41, lv(-0.45)]];
  const cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p })), rand, 0.12), per);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 320, yMin: stop - 1.2, yMax: lv(-1) + 0.8, dec: 0 }], aria: 'Extensiones de Fibonacci como objetivos' });
  const P = C.panels[0];
  zone(C, P, entry, stop, { x1: 19, x2: cs.length, color: COL.down, op: 0.13, stroke: false });
  zone(C, P, entry, lv(-0.618), { x1: 19, x2: cs.length, color: COL.up, op: 0.09, stroke: false });
  [[1, '1 · inicio'], [r, 'Entrada ' + Math.round(r * 100) + '%'], [0, '0 · máximo previo'], [-0.272, '−0,272 (127,2%)'], [-0.618, '−0,618 (161,8%)'], [-1, '−1 (AB = CD)']].forEach(([x, sl]) => {
    hline(C, P, lv(x), { x1: 3, color: x < 0 ? COL.up : x === r ? COL.entry : x === 0 ? COL.liq : COL.muted, width: x === r ? 1.8 : 1.1, dash: x === r ? false : '5 3', label: sl, side: 'right', below: x === 1 });
  });
  hline(C, P, stop, { x1: 3, color: COL.down, width: 1.6, dash: false, label: 'Stop', side: 'left', below: true });
  drawCandles(C, P, cs);
  marker(C, P, 19, entry, { color: COL.entry, size: 5 });
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2)) : null);
  const rows = [['Máximo previo (0)', 0], ['Extensión −0,272', -0.272], ['Extensión −0,618', -0.618], ['Extensión −1', -1]].map(([n, x]) => [n, lv(x).toFixed(2), '1 : ' + ((lv(x) - entry) / risk).toFixed(2)]);
  const t = document.createElement('table'); t.className = 't'; t.style.maxWidth = '520px'; t.style.marginTop = '10px';
  t.innerHTML = '<thead><tr><th>Objetivo</th><th>Precio</th><th>R:B</th></tr></thead><tbody>' + rows.map(rw => `<tr>${rw.map(v => `<td>${v}</td>`).join('')}</tr>`).join('') + '</tbody>';
  $('#fx-table').replaceChildren(t);
  const rb0 = (B - entry) / risk;
  $('#fx-explain').className = 'explain ' + (rb0 >= 2 ? 'good' : rb0 < 1 ? 'bad' : '');
  $('#fx-explain').innerHTML = `Entrando en el ${Math.round(r * 100)}% con el stop un ${Math.round(s * 100)}% del impulso bajo su inicio, el riesgo es de ${risk.toFixed(2)} puntos. El primer objetivo (el máximo previo) da <strong>1 : ${rb0.toFixed(2)}</strong>.` +
    (rb0 < 1 ? ' Con un retroceso tan poco profundo el primer objetivo no compensa el riesgo: o esperas más profundidad o apuntas a una extensión.' : rb0 >= 2 ? ' Buen punto de partida: puedes asegurar una parte en el máximo y dejar el resto hacia las extensiones.' : ' Aceptable, aunque muchos traders exigen al menos 1:2 para el primer objetivo.') +
    ' <span style="color:var(--muted)">Observa: cuanto más profundo es el retroceso, mejor el R:B… pero también más probable es que el impulso falle.</span>';
});

function initFibo() {
  renderFbSeq();
  segBind($('#fb-lab'), (k, v) => { fb.dir = v; buildFb(); renderFb(); });
  $('#fb-auto').addEventListener('click', () => { autoFb(); drawFbDyn(); });
  $('#fb-fut').addEventListener('change', () => { if (!$('#fb-fut').checked) { fb.A.i = Math.min(fb.A.i, fb.now); fb.B.i = Math.min(fb.B.i, fb.now); } renderFb(); });
  $('#fb-ext-on').addEventListener('change', renderFb);
  $('#fb-new').addEventListener('click', () => { fb.seed = newSeed(); $('#fb-fut').checked = false; buildFb(); renderFb(); });
  renderFb();
  ['#fx-r', '#fx-s'].forEach(s => $(s).addEventListener('input', renderFbExt));
  renderFbExt();
  quiz($('#fibo-quiz'), 'Práctica: Fibonacci', QUIZZES["fibo"].qs);
}

export { FIB_RET, FIB_EXT, fibLbl, renderFbSeq, fb, buildFb, autoFb, analyzeFb, drawFbDyn, renderFb, renderFbExt, initFibo };
