// Motor interactivo · momentum. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, COL, argExt, chart, drawCandles, el, extent, fig, fmt, hline, hover, lineSeries, marker, newSeed, pivots, quiz, rsiCalc, seg, segBind, tag, vline } from './core';
import { emaArr } from './emas';
import { LAB_W, detectDivs, genLab } from './rsi';
/* =====================================================================
   MÓDULO 10 · MOMENTUM Y MACD
   ===================================================================== */
const renderMomPhys = fig(function () {
  const host = $('#fig-mom-phys'); if (!host) return;
  const T = 111, pr = Array.from({ length: T }, (_, t) => 100 + 5 * Math.sin(2 * Math.PI * (t - 10) / 100));
  const mo = pr.map((p, t) => t < 10 ? null : p - pr[t - 10]), t = +$('#mp-t').value;
  const mPeak = argExt(mo, 10, 60, 'max'), pPeak = argExt(pr, 0, 70, 'max');
  const C = chart(host, { n: T, panels: [{ h: 170, yMin: 94, yMax: 106, dec: 0, title: 'Precio (posición)' }, { h: 140, yMin: -3.6, yMax: 3.6, dec: 0, ticks: 4, title: 'Momentum 10 (velocidad)' }], aria: 'Precio y su momentum' });
  const [P1, P2] = C.panels;
  hline(C, P2, 0, { color: COL.muted, width: 1, dash: '3 3' });
  vline(C, mPeak, { color: COL.range }); vline(C, pPeak, { color: COL.text2 });
  tag(P2.g.lab, C.x(mPeak), P2.top + 14, 'Máximo del momentum', COL.range, 'middle');
  tag(P1.g.lab, C.x(pPeak), P1.top + 14, 'Máximo del precio', COL.text2, 'middle');
  lineSeries(C, P1, pr, { color: COL.text, width: 2.2 });
  lineSeries(C, P2, mo, { color: COL.range, width: 2.2 });
  el('line', { x1: C.x(t), x2: C.x(t), y1: C.padT, y2: C.h - C.padB, stroke: COL.liq, 'stroke-width': 1.5 }, C.bg);
  marker(C, P1, t, pr[t], { color: COL.liq, size: 6 }); marker(C, P2, t, mo[t], { color: COL.liq, size: 6 });
  hover(C, i => [['#', 't = ' + i], ['Precio', pr[i].toFixed(2)], ['Momentum', fmt(mo[i])]]);
  const v = mo[t], acc = mo[t] - mo[t - 1], rising = pr[t] > pr[t - 1];
  let txt2 = `Precio ${pr[t].toFixed(2)} (${rising ? 'subiendo' : 'bajando'}) · momentum ${v.toFixed(2)} (${v > 0 ? 'positivo' : 'negativo'}, ${acc > 0 ? 'acelerando' : 'frenando'}).`;
  if (rising && acc < 0 && v > 0) txt2 += ' <strong>El precio todavía sube, pero cada vez más despacio:</strong> el momentum ya giró a la baja. Es el aviso adelantado.';
  else if (!rising && v < 0) txt2 += ' El precio ya cae: el momentum lo anticipó unas ' + (pPeak - mPeak) + ' velas antes.';
  $('#mp-explain').innerHTML = txt2;
});

const mom = { sc: 'bear', ind: 'macd', seed: 21, cs: null, N: 10, f: 12, s: 26, sg: 9 };
function buildMom() {
  for (let t = 0; t < 40; t++) {
    const cs = genLab(mom.sc, mom.seed);
    if (mom.sc !== 'bear' && mom.sc !== 'bull') { mom.cs = cs; return; }
    const r = rsiCalc(cs.map(c => c.c), 14).rsi;
    if (detectDivs(cs, r, LAB_W).some(dv => dv.type === mom.sc && dv.b >= LAB_W + 40)) { mom.cs = cs; return; }
    mom.seed = newSeed();
  }
  mom.cs = genLab(mom.sc, mom.seed);
}
function detectDivsOsc(cs, osc, from) {
  const H = cs.map(c => c.h), L = cs.map(c => c.l), out = [], vals = osc.filter(x => x != null), span = (Math.max(...vals) - Math.min(...vals)) || 1;
  const ph = pivots(H, 'high', 4, 4, from), pl = pivots(L, 'low', 4, 4, from);
  for (let k = 1; k < ph.length; k++) { const a = ph[k - 1], b = ph[k]; if (b - a >= 6 && b - a <= 40 && osc[a] != null && osc[b] != null && H[b] > H[a] && osc[a] > 0 && osc[b] < osc[a] - 0.04 * span) out.push({ type: 'bear', a, b }); }
  for (let k = 1; k < pl.length; k++) { const a = pl[k - 1], b = pl[k]; if (b - a >= 6 && b - a <= 40 && osc[a] != null && osc[b] != null && L[b] < L[a] && osc[a] < 0 && osc[b] > osc[a] + 0.04 * span) out.push({ type: 'bull', a, b }); }
  return out.sort((x, y) => x.b - y.b);
}
function momParamsUI() {
  const box = $('#ml-params');
  const sl = (id, lb, mn, mx, val) => `<div class="grp"><span class="lbl">${lb}</span><input type="range" id="${id}" min="${mn}" max="${mx}" value="${val}" style="width:100px"><span class="val" id="${id}-v">${val}</span></div>`;
  box.innerHTML = mom.ind === 'macd' ? sl('mlf', 'EMA rápida', 5, 20, mom.f) + sl('mls', 'EMA lenta', 15, 50, mom.s) + sl('mlg', 'Señal', 3, 15, mom.sg) : sl('mln', 'N (velas atrás)', 3, 30, mom.N);
  [['mlf', 'f'], ['mls', 's'], ['mlg', 'sg'], ['mln', 'N']].forEach(([id, k]) => { const e = $('#' + id); if (e) e.addEventListener('input', () => { mom[k] = +e.value; $('#' + id + '-v').textContent = e.value; renderMomL(); }); });
}
const renderMomL = fig(function () {
  const host = $('#fig-mom-lab'); if (!host) return;
  if (!mom.cs) buildMom();
  const W = LAB_W, all = mom.cs, cl = all.map(c => c.c), cs = all.slice(W), n = cs.length;
  let main, sig = null, hist = null, name;
  if (mom.ind === 'macd') {
    const e1 = emaArr(cl, mom.f), e2 = emaArr(cl, mom.s);
    main = cl.map((_, i) => e1[i] != null && e2[i] != null ? e1[i] - e2[i] : null);
    sig = emaArr(main, mom.sg); hist = main.map((m, i) => m != null && sig[i] != null ? m - sig[i] : null);
    name = `MACD ${mom.f}, ${mom.s}, ${mom.sg}`;
  } else {
    main = cl.map((c, i) => i < mom.N ? null : mom.ind === 'mom' ? c - cl[i - mom.N] : (c / cl[i - mom.N] - 1) * 100);
    name = (mom.ind === 'mom' ? 'Momentum ' : 'ROC ') + mom.N;
  }
  const vis = a => a ? a.slice(W) : null, M = vis(main), S = vis(sig), Hh = vis(hist);
  const vals = [].concat(M, S || [], Hh || []).filter(x => x != null), mx = Math.max(Math.abs(Math.min(...vals)), Math.abs(Math.max(...vals))) * 1.15 || 1;
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 240, yMin: lo, yMax: hi, dec: 0, title: 'Precio (simulado)' }, { h: 160, yMin: -mx, yMax: mx, dec: mom.ind === 'roc' ? 1 : 2, ticks: 4, title: name }], aria: 'Precio y oscilador de momentum' });
  const [P1, P2] = C.panels;
  hline(C, P2, 0, { color: COL.muted, width: 1, dash: '3 3' });
  drawCandles(C, P1, cs);
  if (Hh) Hh.forEach((h, i) => { if (h == null) return; const grow = i > 0 && Hh[i - 1] != null && Math.abs(h) > Math.abs(Hh[i - 1]);
    el('rect', { x: C.x(i) - C.bw / 2, y: Math.min(P2.y(h), P2.y(0)), width: C.bw, height: Math.max(1, Math.abs(P2.y(h) - P2.y(0))), fill: h >= 0 ? COL.up : COL.down, 'fill-opacity': grow ? 0.75 : 0.35 }, P2.g.data); });
  lineSeries(C, P2, M, { color: COL.range, width: 2 });
  if (S) lineSeries(C, P2, S, { color: COL.liq, width: 1.6 });
  let crosses = 0;
  for (let i = 1; i < n; i++) {
    const a0 = M[i - 1], a1 = M[i], b0 = S ? S[i - 1] : 0, b1 = S ? S[i] : 0;
    if ([a0, a1, b0, b1].some(x => x == null)) continue;
    if (a0 <= b0 && a1 > b1) { crosses++; marker(C, P2, i, a1, { shape: 'up', color: COL.up, size: 4.5 }); }
    if (a0 >= b0 && a1 < b1) { crosses++; marker(C, P2, i, a1, { shape: 'down', color: COL.down, size: 4.5 }); }
  }
  const divs = detectDivsOsc(all, main, W).slice(-2);
  divs.forEach(dv => {
    const a = dv.a - W, b = dv.b - W, ya = dv.type === 'bear' ? cs[a].h : cs[a].l, yb = dv.type === 'bear' ? cs[b].h : cs[b].l;
    seg(C, P1, a, ya, b, yb, { width: 2 }); seg(C, P2, a, M[a], b, M[b], { width: 2 });
    tag(P2.g.lab, C.x(b) + 8, P2.y(M[b]) + (dv.type === 'bear' ? -12 : 12), dv.type === 'bear' ? 'Div. bajista' : 'Div. alcista', COL.div, 'start');
  });
  hover(C, i => [['#', 'Vela ' + (i + 1)], ['Cierre', fmt(cs[i].c)], [mom.ind === 'macd' ? 'MACD' : name, fmt(M[i], 3)]].concat(S ? [['Señal', fmt(S[i], 3)], ['Histograma', fmt(Hh[i], 3)]] : []));
  $('#ml-legend').innerHTML = mom.ind === 'macd'
    ? '<span><i style="background:var(--c-range)"></i>Línea MACD</span><span><i style="background:var(--c-liq)"></i>Señal</span><span><i class="box" style="background:var(--c-up)"></i>Histograma (opaco = creciendo)</span><span>▲▼ Cruces MACD / señal</span>'
    : `<span><i style="background:var(--c-range)"></i>${name}</span><span>▲▼ Cruces de la línea cero</span>`;
  $('#ml-stats').innerHTML = [['Valor actual', fmt(M[n - 1], 3)], [mom.ind === 'macd' ? 'Cruces con la señal' : 'Cruces de cero', crosses], ['Divergencias', divs.length]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const T = {
    bear: 'El precio marca un máximo más alto, pero el oscilador uno más bajo: el segundo empuje tuvo menos velocidad. En el MACD, el histograma se encoge antes del giro.',
    bull: 'El precio marca un mínimo más bajo con menos velocidad de caída: el oscilador hace un mínimo más alto y anticipa el giro alcista.',
    up: 'En tendencia el oscilador se mantiene mayormente sobre cero. Sus caídas hacia cero suelen ser retrocesos, no giros.',
    range: 'En lateral el oscilador cruza cero (o la señal) una y otra vez: muchas señales sin recorrido.'
  };
  $('#ml-explain').innerHTML = T[mom.sc];
});
function initMomentum() {
  $('#mp-t').addEventListener('input', renderMomPhys); renderMomPhys();
  segBind($('#mom-lab'), (k, v) => { if (k === 'sc') { mom.sc = v; mom.seed = 21 + v.length; buildMom(); } else { mom.ind = v; momParamsUI(); } renderMomL(); });
  $('#ml-new').addEventListener('click', () => { mom.seed = newSeed(); buildMom(); renderMomL(); });
  momParamsUI(); renderMomL();
  quiz($('#momentum-quiz'), 'Práctica: momentum y MACD', QUIZZES["momentum"].qs);
}

export { renderMomPhys, mom, buildMom, detectDivsOsc, momParamsUI, renderMomL, initMomentum };
