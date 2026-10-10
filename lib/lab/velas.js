// Motor interactivo · velas. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, Player, aggregate, bridgePath, candleOf, candlesFromPath, chart, dataTable, drawCandles, el, extent, fig, gauss, hover, isHollow, mulberry32, newSeed, niceStep, ohlcRows, quiz, segBind, txt, vband } from './core';
/* =====================================================================
   MÓDULO 0 · VELAS
   ===================================================================== */
function drawCandleRaw(g, cx, bw, yo, yh, yl, yc, up, opt) {
  opt = opt || {};
  const col = up ? COL.up : COL.down, hollow = isHollow() && up;
  el('line', { x1: cx, x2: cx, y1: yh, y2: yl, stroke: col, 'stroke-width': opt.ww || 2 }, g);
  const t = Math.min(yo, yc), b = Math.max(yo, yc);
  el('rect', { x: cx - bw / 2, y: t, width: bw, height: Math.max(2, b - t), rx: 2, fill: hollow ? COL.surface : col, stroke: col, 'stroke-width': hollow ? 2 : 0.5 }, g);
}

const renderAnatomy = fig(function () {
  const host = $('#fig-anatomy'); if (!host) return;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 980 330', role: 'img', 'aria-label': 'Anatomía de una vela alcista y una bajista' });
  host.appendChild(svg);
  const exp = $('#anatomy-explain');
  const info = {
    high: 'El <strong>máximo</strong> es el precio más alto que se negoció en el periodo. Encima suele haber órdenes en espera (lo verás en Liquidez).',
    low: 'El <strong>mínimo</strong> es el precio más bajo que se negoció en el periodo.',
    open: 'La <strong>apertura</strong> es el primer precio del periodo.',
    close: 'El <strong>cierre</strong> es el último precio del periodo. Es el dato más importante: decide el color y dice quién ganó.',
    uw: 'La <strong>mecha superior</strong> muestra precios que se visitaron y se <strong>rechazaron</strong>: los vendedores devolvieron el precio hacia abajo.',
    lw: 'La <strong>mecha inferior</strong> muestra precios bajos que se <strong>rechazaron</strong>: los compradores devolvieron el precio hacia arriba.',
    body: 'El <strong>cuerpo</strong> va de la apertura al cierre: es la zona que el mercado terminó <strong>aceptando</strong>. Cuerpo grande = un bando dominó.'
  };
  function part(g, key, shape) { shape.setAttribute('tabindex', '0'); shape.style.cursor = 'help';
    const show = () => { exp.innerHTML = info[key]; };
    shape.addEventListener('pointerenter', show); shape.addEventListener('focus', show); }
  function one(cx, up, title) {
    const g = el('g', {}, svg);
    const yh = 40, yl = 290, yTop = 95, yBot = 225;
    const yo = up ? yBot : yTop, yc = up ? yTop : yBot;
    const col = up ? COL.up : COL.down;
    txt(g, cx, 22, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    const uw = el('line', { x1: cx, x2: cx, y1: yh, y2: yTop, stroke: col, 'stroke-width': 4 }, g); part(g, 'uw', uw);
    const lw = el('line', { x1: cx, x2: cx, y1: yBot, y2: yl, stroke: col, 'stroke-width': 4 }, g); part(g, 'lw', lw);
    const hollow = isHollow() && up;
    const body = el('rect', { x: cx - 38, y: yTop, width: 76, height: yBot - yTop, rx: 4, fill: hollow ? COL.surface : col, stroke: col, 'stroke-width': hollow ? 3 : 1 }, g); part(g, 'body', body);
    // marcas y etiquetas
    const lab = (y, s, key, side) => {
      const x2 = side > 0 ? cx + 130 : cx - 130;
      el('line', { x1: cx + side * 44, x2: x2 - side * 4, y1: y, y2: y, stroke: COL.axis, 'stroke-width': 1 }, g);
      const t = txt(g, x2, y + 4, s, { 'text-anchor': side > 0 ? 'start' : 'end', 'font-size': 13, fill: COL.text });
      part(g, key, t);
    };
    lab(yh, 'Máximo (High)', 'high', 1);
    lab(yc, up ? 'Cierre (Close)' : 'Cierre (Close)', 'close', 1);
    lab(yo, 'Apertura (Open)', 'open', 1);
    lab(yl, 'Mínimo (Low)', 'low', 1);
    lab((yh + yTop) / 2, 'Mecha superior', 'uw', -1);
    lab((yTop + yBot) / 2, 'Cuerpo', 'body', -1);
    lab((yBot + yl) / 2, 'Mecha inferior', 'lw', -1);
    txt(g, cx, 318, up ? 'Cierre > Apertura → alcista' : 'Cierre < Apertura → bajista', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 12 });
  }
  one(240, true, 'Vela alcista');
  one(730, false, 'Vela bajista');
});

function classifyCandle(o, h, l, c) {
  const R = h - l; if (R < 1e-9) return { name: 'Sin movimiento', why: 'Apertura, máximo, mínimo y cierre son iguales.' };
  const B = Math.abs(c - o), U = h - Math.max(o, c), D = Math.min(o, c) - l, b = B / R, u = U / R, d = D / R;
  const dir = c > o ? 'alcista' : c < o ? 'bajista' : 'neutra';
  const side = c > o ? 'los compradores' : 'los vendedores';
  if (b <= 0.1) {
    if (d >= 0.6 && u <= 0.15) return { name: 'Doji libélula', why: 'Apertura y cierre casi iguales en la parte alta: se empujó el precio hacia abajo y se recuperó todo. Rechazo de precios bajos.' };
    if (u >= 0.6 && d <= 0.15) return { name: 'Doji lápida', why: 'Apertura y cierre casi iguales en la parte baja: se subió y se perdió todo lo ganado. Rechazo de precios altos.' };
    return { name: 'Doji', why: 'Apertura ≈ cierre: ninguno de los dos bandos ganó el periodo. Indecisión; lo importante es qué hace la siguiente vela.' };
  }
  if (b >= 0.85) return { name: 'Marubozu ' + dir, why: 'Casi sin mechas: ' + side + ' dominaron de principio a fin. Es una vela de "desplazamiento": muestra intención.' };
  if (D >= 2 * B && u <= 0.2) return { name: 'Pin bar alcista (martillo)', why: 'Mecha inferior larga: se rechazaron precios bajos. Tras una caída o al barrer un mínimo se llama martillo; tras subidas, "hombre colgado".' };
  if (U >= 2 * B && d <= 0.2) return { name: 'Pin bar bajista (estrella fugaz)', why: 'Mecha superior larga: se rechazaron precios altos. Tras subidas se llama estrella fugaz; tras caídas, martillo invertido.' };
  if (b < 0.35) return { name: 'Peonza (spinning top)', why: 'Cuerpo pequeño con mechas a ambos lados: hubo pelea en las dos direcciones y nadie se impuso.' };
  if (b >= 0.6) return { name: 'Vela de impulso ' + dir, why: 'El cuerpo ocupa la mayor parte del rango: ' + side + ' controlaron el periodo.' };
  return { name: 'Vela ' + dir + ' normal', why: 'Cuerpo y mechas equilibrados: ' + side + ' ganaron, pero con cierta resistencia.' };
}

const builder = { o: 40, h: 80, l: 20, c: 70 };
const bPrice = v => 100 + v * 0.2;
const renderBuilder = fig(function () {
  const host = $('#fig-builder'); if (!host) return;
  const { o, h, l, c } = builder;
  ['o', 'h', 'l', 'c'].forEach(k => { $('#b-' + k).value = builder[k]; $('#b-' + k + '-v').textContent = bPrice(builder[k]).toFixed(2); });
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 420 300', role: 'img', 'aria-label': 'Vela construida' });
  host.appendChild(svg);
  const y = v => 280 - v * 2.6;
  for (let v = 0; v <= 100; v += 25) {
    el('line', { x1: 20, x2: 330, y1: y(v), y2: y(v), stroke: COL.grid }, svg);
    txt(svg, 338, y(v) + 4, bPrice(v).toFixed(1), { fill: COL.muted, 'font-size': 11, 'font-family': 'Consolas, monospace' });
  }
  const g = el('g', {}, svg);
  drawCandleRaw(g, 150, 70, y(o), y(h), y(l), y(c), c >= o, { ww: 3 });
  const lab = (v, s) => { el('line', { x1: 192, x2: 232, y1: y(v), y2: y(v), stroke: COL.axis }, svg); txt(svg, 236, y(v) + 4, s, { 'font-size': 12 }); };
  const used = [];
  [[h, 'Máximo'], [Math.max(o, c), c >= o ? 'Cierre' : 'Apertura'], [Math.min(o, c), c >= o ? 'Apertura' : 'Cierre'], [l, 'Mínimo']].forEach(([v, s]) => {
    let yy = v; while (used.some(u => Math.abs(y(u) - y(yy)) < 14)) yy -= 6; used.push(yy); lab(yy, s);
  });
  const R = h - l, B = Math.abs(c - o), U = h - Math.max(o, c), D = Math.min(o, c) - l;
  const pct = x => R > 0 ? Math.round(x / R * 100) + '%' : '—';
  const stats = [['Rango', (bPrice(h) - bPrice(l)).toFixed(2)], ['Cuerpo', pct(B)], ['Mecha superior', pct(U)], ['Mecha inferior', pct(D)], ['Cierre dentro del rango', R > 0 ? Math.round((c - l) / R * 100) + '%' : '—']];
  $('#builder-stats').innerHTML = stats.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  const cl = classifyCandle(o, h, l, c);
  const ex = $('#builder-explain');
  ex.className = 'explain ' + (c > o ? 'good' : c < o ? 'bad' : '');
  ex.innerHTML = `<strong>${cl.name}.</strong> ${cl.why}<br><span style="color:var(--muted)">"Cierre dentro del rango" = dónde cerró respecto a su recorrido: 0% en el mínimo, 100% en el máximo.</span>`;
});
function initBuilder() {
  ['o', 'h', 'l', 'c'].forEach(k => {
    $('#b-' + k).addEventListener('input', e => {
      const v = +e.target.value; builder[k] = v;
      if (k === 'o' || k === 'c') { builder.h = Math.max(builder.h, v); builder.l = Math.min(builder.l, v); }
      if (k === 'h') builder.h = Math.max(v, builder.o, builder.c);
      if (k === 'l') builder.l = Math.min(v, builder.o, builder.c);
      renderBuilder();
    });
  });
  const presets = { marubozu: [20, 82, 19, 81], doji: [50, 80, 20, 51], hammer: [66, 78, 15, 76], star: [34, 85, 22, 24], spin: [45, 80, 15, 55], bear: [78, 86, 16, 28] };
  $$('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const p = presets[b.dataset.preset]; builder.o = p[0]; builder.h = p[1]; builder.l = p[2]; builder.c = p[3]; renderBuilder();
  }));
  renderBuilder();
}

/* --- formación de una vela --- */
const FORM = {
  'rechazo-abajo': { w: [[0, 100], [12, 99.2], [30, 94.2], [48, 99.8], [64, 101.4]], why: 'El precio cayó con fuerza, pero los compradores lo devolvieron arriba y cerró cerca del máximo. Resultado: <strong>mecha inferior larga</strong> (rechazo de precios bajos) → pin bar alcista / martillo.' },
  'rechazo-arriba': { w: [[0, 100], [12, 101], [30, 105.8], [48, 100.6], [64, 99.0]], why: 'El precio subió, pero los vendedores lo devolvieron abajo y cerró cerca del mínimo. Resultado: <strong>mecha superior larga</strong> (rechazo de precios altos) → estrella fugaz.' },
  'tendencia': { w: [[0, 100], [20, 102.2], [30, 101.7], [50, 104.4], [64, 105.2]], why: 'El precio avanzó casi sin retrocesos y cerró cerca del máximo. Resultado: <strong>cuerpo grande y mechas cortas</strong> → vela de impulso.' },
  'indecision': { w: [[0, 100], [18, 103.6], [42, 96.6], [64, 100.1]], why: 'Subió, bajó y terminó donde empezó. Resultado: <strong>cuerpo minúsculo y mechas a ambos lados</strong> → doji (indecisión).' }
};
const formState = { sc: 'rechazo-abajo', path: null, k: 64 };
function buildFormPath() {
  const sc = FORM[formState.sc], r = mulberry32(newSeed());
  formState.path = bridgePath(sc.w.map(([t, p]) => ({ t, p })), r, 0.22);
}
const renderForm = fig(function () {
  const host = $('#fig-form'); if (!host) return;
  if (!formState.path) buildFormPath();
  const path = formState.path, k = formState.k, N = path.length - 1;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: '0 0 900 300', role: 'img', 'aria-label': 'Formación de una vela' });
  host.insertBefore(svg, host.firstChild);
  let lo = Math.min(...path), hi = Math.max(...path); const pd = (hi - lo) * 0.12; lo -= pd; hi += pd;
  const y = v => 20 + (hi - v) / (hi - lo) * 250, x = t => 30 + t / N * 560;
  const st = niceStep(hi - lo, 5);
  for (let q = Math.ceil(lo / st); q * st <= hi; q++) { const yy = y(q * st); el('line', { x1: 30, x2: 860, y1: yy, y2: yy, stroke: COL.grid }, svg); txt(svg, 864, yy + 4, (q * st).toFixed(1), { fill: COL.muted, 'font-size': 10.5 }); }
  txt(svg, 30, 292, 'Recorrido del precio dentro del periodo →', { fill: COL.muted, 'font-size': 11 });
  txt(svg, 740, 292, 'Vela resultante', { fill: COL.muted, 'font-size': 11, 'text-anchor': 'middle' });
  let d = ''; for (let t = 0; t <= k; t++) d += (t ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(path[t]).toFixed(1);
  el('path', { d, fill: 'none', stroke: COL.text2, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
  const cnd = candleOf(path, 0, k);
  el('circle', { cx: x(k), cy: y(path[k]), r: 5, fill: COL.text, stroke: COL.surface, 'stroke-width': 2 }, svg);
  [[cnd.h, 'máximo'], [cnd.l, 'mínimo']].forEach(([v, s]) => {
    el('line', { x1: 30, x2: 700, y1: y(v), y2: y(v), stroke: COL.axis, 'stroke-dasharray': '4 4' }, svg);
    txt(svg, 34, y(v) + (s === 'máximo' ? -5 : 13), s, { fill: COL.muted, 'font-size': 10.5 });
  });
  el('line', { x1: 30, x2: 700, y1: y(cnd.o), y2: y(cnd.o), stroke: COL.axis, 'stroke-dasharray': '2 5' }, svg);
  txt(svg, 34, y(cnd.o) - 5, 'apertura', { fill: COL.muted, 'font-size': 10.5 });
  drawCandleRaw(el('g', {}, svg), 740, 54, y(cnd.o), y(cnd.h), y(cnd.l), y(cnd.c), cnd.c >= cnd.o, { ww: 3 });
  const ex = $('#form-explain');
  ex.innerHTML = k < N ? `Formándose… apertura ${cnd.o.toFixed(2)} · máximo ${cnd.h.toFixed(2)} · mínimo ${cnd.l.toFixed(2)} · precio actual ${cnd.c.toFixed(2)}` : FORM[formState.sc].why;
});
function initForm() {
  const pl = new Player(k => { formState.k = k; renderForm(); }, 45);
  const root = $('#velas-formacion');
  segBind(root, (key, v) => { formState.sc = v; buildFormPath(); pl.play(formState.path.length - 1); });
  $('#form-play').addEventListener('click', () => { buildFormPath(); pl.play(formState.path.length - 1); });
  buildFormPath(); formState.k = formState.path.length - 1; renderForm();
}

/* --- temporalidades --- */
const tfState = { k: 1, h1: null };
function buildTF() {
  const r = mulberry32(newSeed()), per = 6, wps = [{ t: 0, p: 100 }];
  let p = 100;
  for (let b = 6; b <= 48; b += 6) { p += gauss(r) * 1.4 + (r() < .5 ? -0.3 : 0.3); wps.push({ t: b * per, p }); }
  tfState.h1 = candlesFromPath(bridgePath(wps, r, 0.12), per);
}
const renderTF = fig(function () {
  const host = $('#fig-tf'); if (!host) return;
  if (!tfState.h1) buildTF();
  const h1 = tfState.h1, k = tfState.k, groups = aggregate(h1, k);
  const [lo, hi] = extent(h1);
  const C = chart(host, { n: 48, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 1 }], padB: 22, aria: 'Velas agrupadas por temporalidad' });
  const P = C.panels[0];
  for (let dday = 0; dday < 2; dday++) vband(C, dday * 24, dday * 24 + 23, { op: dday ? 0.0 : 0.025, label: dday ? 'Día 2' : 'Día 1' });
  const hl = el('rect', { x: -100, y: C.padT, width: 0, height: P.h, fill: COL.accent, 'fill-opacity': 0.1 }, C.bg);
  if (k === 1) drawCandles(C, P, h1);
  else {
    drawCandles(C, P, h1, { dim: () => true, bw: C.bw * 0.7 });
    groups.forEach(g => {
      const cx = (C.x(g.from) + C.x(g.to)) / 2, bw = Math.min(g.to - g.from + 1, 6) * C.step * 0.62;
      drawCandleRaw(el('g', {}, P.g.data), cx, bw, P.y(g.o), P.y(g.h), P.y(g.l), P.y(g.c), g.c >= g.o, { ww: 2 });
    });
  }
  hover(C, i => {
    const g = groups.find(g => i >= g.from && i <= g.to);
    hl.setAttribute('x', C.x(g.from) - C.step / 2); hl.setAttribute('width', (g.to - g.from + 1) * C.step);
    const name = k === 1 ? 'Vela 1H #' + (i + 1) : `Vela ${k === 4 ? '4H' : '1D'} (1H #${g.from + 1}–#${g.to + 1})`;
    return [['#', name]].concat(ohlcRows(g, 2));
  });
  dataTable($('#tf-data'), ['Vela', 'Apertura', 'Máximo', 'Mínimo', 'Cierre', 'Velas 1H'], groups.map((g, j) => [String(j + 1), g.o.toFixed(2), g.h.toFixed(2), g.l.toFixed(2), g.c.toFixed(2), `#${g.from + 1}–#${g.to + 1}`]));
});
function initTF() {
  segBind($('#velas-tf'), (key, v) => { tfState.k = +v; renderTF(); });
  $('#tf-new').addEventListener('click', () => { buildTF(); renderTF(); });
  renderTF();
}

/* --- galería --- */
const GALLERY = [
  ['Marubozu alcista', [[15, 88, 12, 86]], 'Cuerpo casi completo: compradores al mando todo el periodo.'],
  ['Marubozu bajista', [[86, 88, 12, 15]], 'Vendedores al mando de principio a fin.'],
  ['Doji', [[50, 85, 15, 51]], 'Apertura ≈ cierre. Indecisión: manda la vela siguiente.'],
  ['Martillo / pin bar alcista', [[68, 80, 12, 78]], 'Rechazo de precios bajos. Fuerte si barre un mínimo relevante.'],
  ['Estrella fugaz', [[32, 88, 20, 22]], 'Rechazo de precios altos. Fuerte si barre un máximo relevante.'],
  ['Peonza', [[45, 80, 20, 55]], 'Pelea en ambas direcciones; nadie gana.'],
  ['Envolvente alcista', [[60, 65, 38, 42], [38, 75, 35, 72]], 'El cuerpo verde cubre el cuerpo rojo previo: cambio de control.'],
  ['Envolvente bajista', [[40, 62, 35, 58], [62, 65, 25, 28]], 'El cuerpo rojo cubre el verde previo.'],
  ['Vela interior (inside bar)', [[20, 85, 15, 80], [65, 70, 40, 50]], 'Todo su rango queda dentro de la anterior: pausa/compresión.'],
  ['Vela exterior (barre ambos lados)', [[45, 65, 35, 58], [55, 80, 20, 40]], 'Supera máximo y mínimo previos: barrido doble, mucha volatilidad.']
];
const renderGallery = fig(function () {
  const host = $('#gallery'); if (!host) return;
  host.innerHTML = '';
  GALLERY.forEach(([name, cs, why]) => {
    const it = document.createElement('div'); it.className = 'g-item';
    const svg = el('svg', { viewBox: '0 0 100 100', role: 'img', 'aria-label': name });
    const y = v => 95 - v * 0.9, n = cs.length;
    cs.forEach(([o, h, l, c], j) => drawCandleRaw(el('g', {}, svg), n === 1 ? 50 : 32 + j * 36, 20, y(o), y(h), y(l), y(c), c >= o, { ww: 1.6 }));
    it.appendChild(svg);
    const b = document.createElement('b'); b.textContent = name; it.appendChild(b);
    const s = document.createElement('small'); s.textContent = why; it.appendChild(s);
    host.appendChild(it);
  });
});

function initVelas() {
  renderAnatomy(); initBuilder(); initForm(); initTF(); renderGallery();
  quiz($('#velas-quiz'), 'Práctica: velas', QUIZZES["velas"].qs);
}

export { drawCandleRaw, renderAnatomy, classifyCandle, builder, bPrice, renderBuilder, initBuilder, FORM, formState, buildFormPath, renderForm, initForm, tfState, buildTF, renderTF, initTF, GALLERY, renderGallery, initVelas };
