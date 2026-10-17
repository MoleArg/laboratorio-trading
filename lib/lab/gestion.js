// Motor interactivo · gestión del trade abierto (break-even, parciales, trailing stop y reglas de salida).
import { QUIZZES } from './shared';
import { $, COL, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, gauss, hline, hover, marker, mulberry32, newSeed, ohlcRows, pivots, quiz, segBind, segVal, txt } from './core';
import { atrArr } from './volat';
import { R, histogram, pctS, rStats, stats, svgIn } from './kit';

/* --- laboratorio de reglas de salida --- */
const RULES = [
  ['fijo', 'Stop y objetivo fijos'],
  ['be', 'Break-even'],
  ['parcial', 'Parcial 50% + BE'],
  ['trail', 'Trailing stop']
];
const gx = { seed: 41, key: '', res: null };
function simRules(o) {
  const r = mulberry32(o.seed), S = 1500, ticks = 260, sd = 0.11, ns = sd * Math.sqrt(1 - o.phi * o.phi), out = { fijo: [], be: [], parcial: [], trail: [] };
  for (let s = 0; s < S; s++) {
    let p = 0, inc = 0, mx = 0;
    const st = { fijo: null, be: null, parcial: null, trail: null };
    let beStop = -1, partDone = false, trStop = -1;
    for (let t = 0; t < ticks; t++) {
      inc = o.phi * inc + ns * gauss(r) + o.mu;
      p += inc; if (p > mx) mx = p;
      if (st.fijo == null) { if (p <= -1) st.fijo = -1; else if (p >= o.T) st.fijo = o.T; }
      if (st.be == null) { if (p <= beStop) st.be = beStop; else if (p >= o.T) st.be = o.T; else if (mx >= o.b) beStop = 0; }
      if (st.parcial == null) {
        if (!partDone) { if (p <= -1) st.parcial = -1; else if (p >= 1) partDone = true; }
        else if (p <= 0) st.parcial = 0.5; else if (p >= o.T) st.parcial = 0.5 + 0.5 * o.T;
      }
      if (st.trail == null) { if (p <= trStop) st.trail = trStop; else trStop = Math.max(trStop, mx - o.k); }
      if (st.fijo != null && st.be != null && st.parcial != null && st.trail != null) break;
    }
    // salida por tiempo al final de la ventana
    out.fijo.push(st.fijo ?? p); out.be.push(st.be ?? p);
    out.parcial.push(st.parcial ?? (partDone ? 0.5 + 0.5 * p : p)); out.trail.push(st.trail ?? p);
  }
  return Object.fromEntries(RULES.map(([k]) => [k, Object.assign(rStats(out[k]), { rs: out[k] })]));
}
const renderRules = fig(function () {
  const host = $('#fig-gt-rules'); if (!host) return;
  const mu = +$('#gt-mu').value / 1000, T = +$('#gt-t').value / 2, b = +$('#gt-b').value / 4, k = +$('#gt-k').value / 4;
  const phi = { rnd: 0, trend: 0.35, chop: -0.35 }[segVal($('#gt-lab') || document, 'gt-reg') || 'rnd'];
  $('#gt-mu-v').textContent = mu === 0 ? 'ninguna' : (mu > 0 ? '+' : '') + (mu * 1000).toFixed(0);
  $('#gt-t-v').textContent = T.toFixed(1) + 'R'; $('#gt-b-v').textContent = '+' + b.toFixed(2) + 'R'; $('#gt-k-v').textContent = k.toFixed(2) + 'R';
  const key = [mu, T, b, k, phi, gx.seed].join('|');
  if (key !== gx.key) { gx.res = simRules({ mu, T, b, k, phi, seed: gx.seed }); gx.key = key; }
  const res = gx.res, W = 900, H = 230, svg = svgIn(host, W, H, 'Distribución de resultados por regla de salida');
  const hi = Math.max(5, T + 0.5), lo = -1.5;
  RULES.forEach(([key2, name], i) => {
    const x = 14 + i * 222;
    histogram(svg, res[key2].rs, { x, y: 30, w: 196, h: 160, lo, hi, bins: 26, ticks: [-1, 0, Math.round(hi / 2), Math.floor(hi)], fmt: v => v + 'R', title: name,
      mark: res[key2].exp, color: v => v < -0.05 ? COL.down : v > 0.05 ? COL.up : COL.muted });
    txt(svg, x + 196, 42, 'E = ' + R(res[key2].exp), { 'text-anchor': 'end', fill: COL.strong, 'font-size': 11, 'font-weight': 700 });
  });
  const rows = RULES.map(([key2, name]) => { const s = res[key2]; return `<tr><td>${name}</td><td>${pctS(s.wr)}</td><td>${R(s.avgW)}</td><td>−${s.avgL.toFixed(2)}R</td><td><b>${R(s.exp)}</b></td><td>${s.ls}</td></tr>`; }).join('');
  $('#gt-table').innerHTML = `<table class="t"><thead><tr><th>Regla</th><th>% ganadoras</th><th>Ganancia media</th><th>Pérdida media</th><th>Expectativa</th><th>Peor racha</th></tr></thead><tbody>${rows}</tbody></table>`;
  const best = RULES.map(([q]) => q).sort((a, c) => res[c].exp - res[a].exp)[0], spread = res[best].exp - Math.min(...RULES.map(([q]) => res[q].exp));
  const ex = $('#gt-explain');
  if (mu === 0 && phi === 0) ex.innerHTML = 'Precio <strong>sin ventaja</strong> (paseo aleatorio): todas las reglas terminan cerca de <strong>0R</strong>. Mover el stop o cerrar parciales cambia el <em>porcentaje</em> de ganadoras y el tamaño de cada una, pero no fabrica ventaja. Si tu sistema no la tiene, ninguna gestión lo salva.';
  else ex.innerHTML = `Con estas condiciones la mejor regla es <strong>${RULES.find(([q]) => q === best)[1]}</strong> (${R(res[best].exp)} por operación) y la diferencia entre la mejor y la peor es de ${spread.toFixed(2)}R. ` +
    (phi > 0 ? 'En un mercado <strong>tendencial</strong> los movimientos se extienden: el trailing stop y los objetivos lejanos aprovechan las corridas largas.'
      : phi < 0 ? 'En un mercado <strong>con retrocesos</strong> el precio vuelve sobre sus pasos: el break-even temprano y el trailing ajustado te sacan justo antes de que el trade funcione.'
        : 'Fíjate en el % de ganadoras: el break-even lo baja (muchas salen en 0) y el parcial lo sube a costa de recortar las ganadoras grandes.');
});

/* --- parciales --- */
const renderPartial = fig(function () {
  const p = +$('#gp-p').value / 100, T1 = +$('#gp-t1').value / 4, T2 = +$('#gp-t2').value / 2, a = +$('#gp-a').value / 100, q = +$('#gp-q').value / 100;
  const be = (segVal($('#gt-parcial') || document, 'gp-rest') || 'be') === 'be', rest = be ? 0 : -1;
  $('#gp-p-v').textContent = Math.round(p * 100) + '%'; $('#gp-t1-v').textContent = T1.toFixed(2) + 'R'; $('#gp-t2-v').textContent = T2.toFixed(1) + 'R';
  $('#gp-a-v').textContent = Math.round(a * 100) + '%'; $('#gp-q-v').textContent = Math.round(q * 100) + '%';
  const back = p * T1 + (1 - p) * rest, full = p * T1 + (1 - p) * T2;
  const eP = a * (q * full + (1 - q) * back) + (1 - a) * -1, eN = a * q * T2 - (1 - a * q);
  const host = $('#fig-gt-parcial'), W = 900, H = 200, svg = svgIn(host, W, H, 'Resultado de cada escenario con y sin parcial');
  const cases = [['Toca el stop antes del parcial', -1, -1], ['Llega a ' + T1.toFixed(2) + 'R y vuelve', back, -1], ['Llega al objetivo final', full, T2]];
  const lo = -1.2, hi = Math.max(T2, 1) + 0.4, Y = v => 30 + (hi - v) / (hi - lo) * 140, bw = 80;
  el('line', { x1: 20, x2: W - 20, y1: Y(0), y2: Y(0), stroke: COL.axis }, svg);
  cases.forEach(([name, withP, without], i) => {
    const x0 = 60 + i * 290;
    [[withP, COL.accent, 'Con parcial'], [without, COL.text2, 'Sin parcial']].forEach(([v, c, lab], j) => {
      const x = x0 + j * (bw + 14);
      el('rect', { x, y: Math.min(Y(0), Y(v)), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 4, fill: c, 'fill-opacity': 0.85 }, svg);
      txt(svg, x + bw / 2, v >= 0 ? Y(v) - 6 : Y(v) + 14, R(v), { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700 });
      txt(svg, x + bw / 2, H - 8, lab, { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10 });
    });
    txt(svg, x0 + bw + 7, 18, name, { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 600 });
  });
  $('#gp-out').innerHTML = stats([['Expectativa con parcial', R(eP)], ['Expectativa sin parcial', R(eN)], ['% de operaciones ganadoras con parcial', pctS(a)], ['% ganadoras sin parcial', pctS(a * q)]]);
  $('#gp-explain').className = 'explain ' + (eP >= eN ? 'good' : 'bad');
  $('#gp-explain').innerHTML = (eP >= eN
    ? `Aquí el parcial <strong>suma</strong> (${R(eP - eN)} por operación): muchas operaciones llegan a ${T1.toFixed(2)}R y luego se dan la vuelta, y el parcial rescata algo de esas.`
    : `Aquí el parcial <strong>resta</strong> (${R(eP - eN)} por operación): como la mayoría de las que llegan a ${T1.toFixed(2)}R siguen hasta el objetivo, recortarlas cuesta más de lo que protege.`) +
    ' El parcial no es bueno ni malo en sí: depende de cuántas operaciones se dan la vuelta a mitad de camino, y eso solo lo sabes con tu propio registro.';
});

/* --- trailing stop: ATR vs estructura --- */
const gtr = { seed: 12, cs: null };
function buildTrail() {
  const r = mulberry32(gtr.seed), j = s => s * (0.8 + 0.4 * r());
  const W = [[0, 100], [6, 98.4], [12, 99.4], [18, 102.6 + j(0.6)], [22, 101.4], [30, 105.4 + j(0.8)], [34, 103.8 + j(0.5)], [42, 108 + j(1)], [46, 106.4 + j(0.6)], [52, 110 + j(1)], [58, 106.2], [66, 103]];
  gtr.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * 5, p })), r, 0.16), 5);
}
const ENTRY = 12;
function runTrail(cs, atr, kind, k) {
  const entry = cs[ENTRY].c, stop0 = Math.min(...cs.slice(ENTRY - 4, ENTRY + 1).map(c => c.l)) - 0.15, risk = entry - stop0;
  const lowsP = pivots(cs.map(c => c.l), 'low', 2, 2), line = Array(cs.length).fill(null);
  let stop = stop0, hh = cs[ENTRY].h, exit = null;
  for (let i = ENTRY + 1; i < cs.length; i++) {
    line[i] = stop;
    if (cs[i].l <= stop) { exit = { i, p: Math.min(cs[i].o, stop) }; break; }
    hh = Math.max(hh, cs[i].h);
    if (kind === 'atr' && atr[i] != null) stop = Math.max(stop, hh - k * atr[i]);
    if (kind === 'est') { const pv = lowsP.filter(x => x > ENTRY && x + 2 <= i).pop(); if (pv != null) stop = Math.max(stop, cs[pv].l - 0.12); }
  }
  if (!exit) exit = { i: cs.length - 1, p: cs[cs.length - 1].c, open: true };
  const top = Math.max(...cs.slice(ENTRY, exit.i + 1).map(c => c.h));
  return { line, exit, entry, stop0, risk, r: (exit.p - entry) / risk, left: (top - exit.p) / risk, top };
}
const renderTrail = fig(function () {
  const host = $('#fig-gt-trail'); if (!host) return;
  if (!gtr.cs) buildTrail();
  const cs = gtr.cs, k = +$('#gtr-k').value / 4, mode = segVal($('#gt-trail') || document, 'gtr-mode') || 'both';
  $('#gtr-k-v').textContent = k.toFixed(2) + ' × ATR';
  const atr = atrArr(cs, 14), A = runTrail(cs, atr, 'atr', k), Sx = runTrail(cs, atr, 'est', k);
  const [lo, hi] = extent(cs, [A.stop0]);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 0 }], aria: 'Trailing stop por ATR y por estructura' });
  const P = C.panels[0];
  hline(C, P, A.entry, { x1: ENTRY, color: COL.entry, width: 1.2, dash: '2 3' });
  const step = (res, color, label) => {
    let d = ''; res.line.forEach((v, i) => { if (v == null) return; const x0 = C.x(i) - C.step / 2, x1 = C.x(i) + C.step / 2; d += (d ? 'L' : 'M') + x0.toFixed(1) + ' ' + P.y(v).toFixed(1) + 'L' + x1.toFixed(1) + ' ' + P.y(v).toFixed(1); });
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, P.g.ann);
    if (!res.exit.open) marker(C, P, res.exit.i, res.exit.p, { shape: 'down', color, size: 6, label: label + ' ' + R(res.r, 1), dy: 22 });
  };
  drawCandles(C, P, cs);
  if (mode !== 'est') step(A, COL.liq, 'ATR');
  if (mode !== 'atr') step(Sx, COL.ob, 'Estructura');
  marker(C, P, ENTRY, A.entry, { shape: 'up', color: COL.entry, size: 6, label: 'Compra', dy: 24 });
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2), [['ATR 14', atr[j] ? atr[j].toFixed(2) : '—'], ['Stop ATR', A.line[j] ? A.line[j].toFixed(2) : '—'], ['Stop estructura', Sx.line[j] ? Sx.line[j].toFixed(2) : '—']]) : null);
  $('#gtr-out').innerHTML = stats([['Trailing ATR', R(A.r, 1)], ['Dejado sobre la mesa (ATR)', A.left.toFixed(1) + 'R'], ['Trailing por estructura', R(Sx.r, 1)], ['Dejado sobre la mesa (estructura)', Sx.left.toFixed(1) + 'R']]);
  $('#gtr-explain').innerHTML = `Un multiplicador bajo (${k.toFixed(2)} × ATR${k < 2 ? ', ajustado' : ''}) protege más pero te saca en cualquier retroceso normal; uno alto aguanta los retrocesos y devuelve más ganancia al final. ` +
    'El trailing por <strong>estructura</strong> solo sube el stop cuando se confirma un nuevo mínimo más alto (HL): respeta la lógica de la tendencia, pero puede quedar lejos. Pulsa “Nuevo gráfico” varias veces: ninguno gana siempre.';
});

function initGestion() {
  ['#gt-mu', '#gt-t', '#gt-b', '#gt-k'].forEach(s => $(s).addEventListener('change', renderRules));
  ['#gt-mu', '#gt-t', '#gt-b', '#gt-k'].forEach(s => $(s).addEventListener('input', () => {
    const mu = +$('#gt-mu').value; $('#gt-mu-v').textContent = mu === 0 ? 'ninguna' : (mu > 0 ? '+' : '') + mu;
    $('#gt-t-v').textContent = (+$('#gt-t').value / 2).toFixed(1) + 'R'; $('#gt-b-v').textContent = '+' + (+$('#gt-b').value / 4).toFixed(2) + 'R'; $('#gt-k-v').textContent = (+$('#gt-k').value / 4).toFixed(2) + 'R';
  }));
  segBind($('#gt-lab'), () => renderRules());
  $('#gt-new').addEventListener('click', () => { gx.seed = newSeed(); renderRules(); });
  renderRules();
  ['#gp-p', '#gp-t1', '#gp-t2', '#gp-a', '#gp-q'].forEach(s => $(s).addEventListener('input', renderPartial));
  segBind($('#gt-parcial'), () => renderPartial());
  renderPartial();
  $('#gtr-k').addEventListener('input', renderTrail);
  segBind($('#gt-trail'), () => renderTrail());
  $('#gtr-new').addEventListener('click', () => { gtr.seed = newSeed(); buildTrail(); renderTrail(); });
  renderTrail();
  quiz($('#gestion-quiz'), 'Práctica: gestión del trade abierto', QUIZZES.gestion.qs);
}

export { simRules, renderRules, renderPartial, renderTrail, initGestion };
