// Motor interactivo · patrones. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { $, $$, COL, bridgePath, candlesFromPath, chart, dataTable, drawCandles, el, extent, fig, gauss, hover, marker, mulberry32, newSeed, ohlcRows, quiz, vband } from './core';
/* =====================================================================
   MÓDULO 2 · PATRONES DE VELAS
   ===================================================================== */
const PATS = [
  { id: 'martillo', n: 'Martillo', t: 'bull', ctx: 'down', cs: [[99.7, 100.25, 97.4, 100.15]], k: 'Reversión alcista · 1 vela',
    r: ['Aparece tras una caída.', 'Cuerpo pequeño en la parte alta del rango.', 'Mecha inferior al menos 2 veces el cuerpo.', 'Mecha superior mínima.'],
    p: 'Los vendedores empujaron con fuerza, pero los compradores devolvieron el precio arriba antes del cierre: rechazo de precios bajos.', c: 'Confirmación: una vela que cierre por encima del máximo del martillo. Invalidación: por debajo de su mínimo.' },
  { id: 'martilloInv', n: 'Martillo invertido', t: 'bull', ctx: 'down', cs: [[99.7, 102.3, 99.55, 99.95]], k: 'Reversión alcista · 1 vela',
    r: ['Aparece tras una caída.', 'Cuerpo pequeño en la parte baja.', 'Mecha superior larga (≥ 2 veces el cuerpo).'],
    p: 'Primer intento comprador: no logró sostenerse, pero muestra que la venta ya no domina. Es más débil que el martillo.', c: 'Necesita una confirmación clara: vela alcista que cierre por encima de su cuerpo.' },
  { id: 'envA', n: 'Envolvente alcista', t: 'bull', ctx: 'down', cs: [[100, 100.2, 99.0, 99.2], [99.1, 100.9, 98.9, 100.7]], k: 'Reversión alcista · 2 velas',
    r: ['Tras una caída.', 'Vela 1 bajista.', 'Vela 2 alcista cuyo cuerpo cubre por completo el cuerpo de la vela 1.'],
    p: 'Los compradores no solo frenan la caída: recuperan todo lo perdido en la vela anterior y más. Cambio de control.', c: 'Más fuerte si la vela 2 es grande y aparece en un nivel clave. Invalidación: bajo el mínimo del patrón.' },
  { id: 'haramiA', n: 'Harami alcista', t: 'bull', ctx: 'down', cs: [[100.4, 100.5, 97.6, 97.8], [98.2, 98.9, 98.0, 98.7]], k: 'Reversión alcista · 2 velas',
    r: ['Tras una caída.', 'Vela 1 bajista grande.', 'Vela 2 pequeña con el cuerpo dentro del cuerpo de la vela 1 ("embarazada" en japonés).'],
    p: 'Después de un empuje vendedor fuerte, el mercado se frena y comprime: la presión bajista pierde fuerza.', c: 'Señal débil por sí sola: espera ruptura del máximo de la vela 1.' },
  { id: 'penetrante', n: 'Línea penetrante', t: 'bull', ctx: 'down', cs: [[100, 100.1, 98.0, 98.2], [97.9, 99.6, 97.7, 99.4]], k: 'Reversión alcista · 2 velas',
    r: ['Tras una caída.', 'Vela 1 bajista de buen tamaño.', 'Vela 2 abre por debajo del cierre de la vela 1 y cierra por encima de la mitad de su cuerpo (sin superar su apertura).'],
    p: 'La vela 2 empieza débil pero los compradores recuperan más de la mitad de la caída anterior.', c: 'Si cerrara por encima de la apertura de la vela 1, sería un envolvente (más fuerte).' },
  { id: 'manana', n: 'Estrella de la mañana', t: 'bull', ctx: 'down', cs: [[100, 100.1, 97.6, 97.8], [97.6, 97.9, 96.9, 97.5], [97.6, 99.6, 97.4, 99.4]], k: 'Reversión alcista · 3 velas',
    r: ['Tras una caída.', 'Vela 1 bajista grande.', 'Vela 2 de cuerpo pequeño (indecisión) en la parte baja.', 'Vela 3 alcista que cierra por encima de la mitad del cuerpo de la vela 1.'],
    p: 'Caída fuerte → indecisión → los compradores toman el control. Es la versión de 3 velas del giro.', c: 'Invalidación: por debajo del mínimo de la vela 2.' },
  { id: 'soldados', n: 'Tres soldados blancos', t: 'bull', ctx: 'down', cs: [[99.8, 100.9, 99.7, 100.8], [100.5, 101.9, 100.4, 101.8], [101.5, 102.9, 101.4, 102.8]], k: 'Reversión / continuación alcista · 3 velas',
    r: ['Tres velas alcistas seguidas, de buen tamaño.', 'Cada una abre dentro del cuerpo de la anterior y cierra más arriba.', 'Mechas superiores pequeñas.'],
    p: 'Compra sostenida durante tres periodos: el control comprador es claro.', c: 'Si aparece muy extendida (lejos de la media), el precio puede necesitar un retroceso.' },
  { id: 'pinzasS', n: 'Pinzas de suelo', t: 'bull', ctx: 'down', cs: [[100, 100.2, 98.6, 98.9], [98.9, 100.0, 98.62, 99.8]], k: 'Reversión alcista · 2 velas',
    r: ['Tras una caída.', 'Dos velas con mínimos prácticamente iguales.', 'Lo ideal: la primera bajista y la segunda alcista.'],
    p: 'El mismo nivel se defiende dos veces seguidas: soporte "probado". Ojo: debajo de mínimos iguales se acumula liquidez.', c: 'Invalidación: por debajo de los mínimos iguales.' },
  { id: 'doji', n: 'Doji', t: 'neutral', ctx: 'up', cs: [[100, 101, 99, 100.02]], k: 'Indecisión · 1 vela',
    r: ['Apertura y cierre casi iguales.', 'Mechas a uno o ambos lados.'],
    p: 'Ni compradores ni vendedores ganaron. Tras una tendencia avisa de pérdida de impulso, pero no indica dirección.', c: 'Lo que manda es la vela siguiente.' },
  { id: 'colgado', n: 'Hombre colgado', t: 'bear', ctx: 'up', cs: [[100.2, 100.5, 97.9, 100.4]], k: 'Reversión bajista · 1 vela',
    r: ['Misma forma que el martillo, pero tras una subida.', 'Cuerpo pequeño arriba, mecha inferior larga.'],
    p: 'Durante la vela apareció una venta fuerte que, aunque se recuperó, revela que hay vendedores activos en la zona alta.', c: 'Necesita confirmación bajista: cierre por debajo de su mínimo o de su cuerpo.' },
  { id: 'fugaz', n: 'Estrella fugaz', t: 'bear', ctx: 'up', cs: [[100.3, 102.7, 99.95, 100.05]], k: 'Reversión bajista · 1 vela',
    r: ['Tras una subida.', 'Cuerpo pequeño en la parte baja.', 'Mecha superior al menos 2 veces el cuerpo.'],
    p: 'Los compradores intentaron seguir subiendo y fueron rechazados con fuerza: precios altos rechazados.', c: 'Confirmación: cierre por debajo de su mínimo. Invalidación: por encima de su máximo.' },
  { id: 'envB', n: 'Envolvente bajista', t: 'bear', ctx: 'up', cs: [[100, 101.0, 99.8, 100.8], [100.9, 101.1, 99.1, 99.3]], k: 'Reversión bajista · 2 velas',
    r: ['Tras una subida.', 'Vela 1 alcista.', 'Vela 2 bajista cuyo cuerpo cubre por completo el de la vela 1.'],
    p: 'Los vendedores borran todo lo que ganaron los compradores en la vela anterior: cambio de control.', c: 'Invalidación: por encima del máximo del patrón.' },
  { id: 'haramiB', n: 'Harami bajista', t: 'bear', ctx: 'up', cs: [[99.6, 102.5, 99.5, 102.3], [101.9, 102.0, 101.2, 101.4]], k: 'Reversión bajista · 2 velas',
    r: ['Tras una subida.', 'Vela 1 alcista grande.', 'Vela 2 pequeña con el cuerpo dentro del cuerpo de la vela 1.'],
    p: 'Tras un empuje comprador fuerte, el mercado se frena: pérdida de impulso.', c: 'Espera ruptura del mínimo de la vela 1.' },
  { id: 'nube', n: 'Cubierta de nube oscura', t: 'bear', ctx: 'up', cs: [[100, 101.9, 99.9, 101.8], [102.1, 102.3, 100.5, 100.7]], k: 'Reversión bajista · 2 velas',
    r: ['Tras una subida.', 'Vela 1 alcista de buen tamaño.', 'Vela 2 abre por encima del cierre de la vela 1 y cierra por debajo de la mitad de su cuerpo.'],
    p: 'La vela 2 empieza fuerte, pero los vendedores la hunden más allá de la mitad de la subida anterior.', c: 'Espejo de la línea penetrante. Invalidación: por encima de su máximo.' },
  { id: 'tarde', n: 'Estrella de la tarde', t: 'bear', ctx: 'up', cs: [[100, 102.4, 99.9, 102.2], [102.4, 103.1, 102.2, 102.5], [102.4, 102.6, 100.4, 100.6]], k: 'Reversión bajista · 3 velas',
    r: ['Tras una subida.', 'Vela 1 alcista grande.', 'Vela 2 de cuerpo pequeño en la parte alta.', 'Vela 3 bajista que cierra por debajo de la mitad del cuerpo de la vela 1.'],
    p: 'Subida fuerte → indecisión en máximos → los vendedores toman el control.', c: 'Invalidación: por encima del máximo de la vela 2.' },
  { id: 'cuervos', n: 'Tres cuervos negros', t: 'bear', ctx: 'up', cs: [[100.2, 100.3, 99.0, 99.1], [99.4, 99.5, 98.0, 98.1], [98.4, 98.5, 97.0, 97.1]], k: 'Reversión bajista · 3 velas',
    r: ['Tres velas bajistas seguidas, de buen tamaño.', 'Cada una abre dentro del cuerpo de la anterior y cierra más abajo.', 'Mechas inferiores pequeñas.'],
    p: 'Venta sostenida durante tres periodos: el control vendedor es claro.', c: 'Tras caídas muy extendidas, puede venir un rebote.' },
  { id: 'pinzasT', n: 'Pinzas de techo', t: 'bear', ctx: 'up', cs: [[100, 101.4, 99.8, 101.1], [101.1, 101.38, 100.0, 100.2]], k: 'Reversión bajista · 2 velas',
    r: ['Tras una subida.', 'Dos velas con máximos prácticamente iguales.', 'Lo ideal: la primera alcista y la segunda bajista.'],
    p: 'El mismo nivel rechaza dos veces: resistencia probada. Encima de máximos iguales se acumula liquidez (BSL).', c: 'Invalidación: por encima de los máximos iguales.' },
  { id: 'metodosA', n: 'Tres métodos alcistas', t: 'bull', ctx: 'up', cont: true, cs: [[100, 102.2, 99.9, 102.0], [101.9, 102.0, 101.3, 101.5], [101.5, 101.7, 100.9, 101.1], [101.1, 101.3, 100.6, 100.8], [100.9, 103.0, 100.8, 102.8]], k: 'Continuación alcista · 5 velas',
    r: ['En tendencia alcista.', 'Vela 1 alcista grande.', 'Tres velas pequeñas que retroceden sin salir del rango de la vela 1.', 'Vela 5 alcista que cierra por encima del máximo de la vela 1.'],
    p: 'Una pausa ordenada (toma de beneficios) que no logra romper el rango del impulso: los compradores retoman el control.', c: 'Invalidación: por debajo del mínimo de la vela 1.' },
  { id: 'metodosB', n: 'Tres métodos bajistas', t: 'bear', ctx: 'down', cont: true, cs: [[100, 100.1, 97.8, 98.0], [98.1, 98.7, 98.0, 98.5], [98.5, 99.1, 98.3, 98.9], [98.9, 99.4, 98.7, 99.2], [99.1, 99.2, 97.0, 97.2]], k: 'Continuación bajista · 5 velas',
    r: ['En tendencia bajista.', 'Vela 1 bajista grande.', 'Tres velas pequeñas que rebotan sin salir del rango de la vela 1.', 'Vela 5 bajista que cierra por debajo del mínimo de la vela 1.'],
    p: 'Rebote débil dentro del rango del impulso: los vendedores retoman el control.', c: 'Invalidación: por encima del máximo de la vela 1.' }
];
let patSel = 'martillo';
function patSeries(P) {
  const ctx = [], first = P.cs[0][0], dir = P.ctx === 'down' ? -1 : 1, steps = [1.2, 0.6, 1.1, 0.7, 1.0, 0.9], tot = 4.8, sum = 5.5;
  let p0 = first - dir * tot;
  steps.forEach(s => { const o = p0, c = p0 + dir * s / sum * tot; ctx.push({ o, c, h: Math.max(o, c) + 0.25, l: Math.min(o, c) - 0.25 }); p0 = c; });
  const pat = P.cs.map(([o, h, l, c]) => ({ o, h, l, c }));
  const last = pat[pat.length - 1], fdir = P.t === 'bull' ? 1 : P.t === 'bear' ? -1 : -1, fol = [];
  let p = last.c;
  for (let k = 0; k < 3; k++) { const o = p, c = p + fdir * (0.7 + k * 0.1); fol.push({ o, c, h: Math.max(o, c) + 0.2, l: Math.min(o, c) - 0.2 }); p = c; }
  return { ctx, pat, fol };
}
const renderPat = fig(function () {
  const host = $('#fig-pat'); if (!host) return;
  const P = PATS.find(x => x.id === patSel), S = patSeries(P);
  const all = S.ctx.concat(S.pat, S.fol), n = all.length, a = S.ctx.length, b = a + S.pat.length - 1;
  const [lo, hi] = extent(all);
  const C = chart(host, { n: n + 1, panels: [{ h: 250, yMin: lo, yMax: hi, dec: 0 }], padB: 22, aria: 'Patrón ' + P.n });
  const PP = C.panels[0];
  vband(C, 0, a - 1, { op: 0.0, label: P.ctx === 'down' ? 'Contexto: caída' : 'Contexto: subida' });
  vband(C, a, b, { color: COL.accent, op: 0.12, label: P.n });
  vband(C, b + 1, n - 1, { op: 0.03, label: 'Confirmación' });
  drawCandles(C, PP, all, { dim: i => i > b });
  hover(C, i => i < n ? [['#', i < a ? 'Contexto' : i <= b ? P.n + ' · vela ' + (i - a + 1) : 'Confirmación']].concat(ohlcRows(all[i], 2)) : null);
  const tcol = P.t === 'bull' ? 'good' : P.t === 'bear' ? 'bad' : '';
  $('#pat-info').className = 'explain ' + tcol;
  $('#pat-info').innerHTML = `<strong>${P.n}</strong> — ${P.k}<br>${P.p}`;
  $('#pat-rules').innerHTML = '<strong>Reglas</strong><ul style="margin:4px 0 4px 18px">' + P.r.map(x => `<li>${x}</li>`).join('') + `</ul>${P.c}`;
  $$('#pat-list button').forEach(bt => bt.classList.toggle('on', bt.dataset.p === patSel));
});

/* --- detector --- */
function detectPatterns(cs) {
  const body = c => Math.abs(c.c - c.o), rng = c => c.h - c.l, up = c => Math.max(c.o, c.c), dn = c => Math.min(c.o, c.c);
  const isBull = c => c.c > c.o, isBear = c => c.c < c.o, out = [];
  for (let i = 8; i < cs.length; i++) {
    const w = cs.slice(i - 8, i), ab = w.reduce((s, c) => s + body(c), 0) / 8, ar = w.reduce((s, c) => s + rng(c), 0) / 8;
    const ch = cs[i - 1].c - cs[Math.max(0, i - 6)].c, down = ch < -1.5 * ab, upT = ch > 1.5 * ab;
    const c = cs[i], p = cs[i - 1], q = cs[i - 2], B = body(c), U = c.h - up(c), D = dn(c) - c.l, R = rng(c), found = [];
    if (R > 0.5 * ar) {
      if (D >= 2 * B && U <= 0.35 * B + 0.05 * R && B > 0.04 * R) found.push(down ? ['Martillo', 'bull'] : upT ? ['Hombre colgado', 'bear'] : null);
      if (U >= 2 * B && D <= 0.35 * B + 0.05 * R && B > 0.04 * R) found.push(down ? ['Martillo invertido', 'bull'] : upT ? ['Estrella fugaz', 'bear'] : null);
      if (B <= 0.08 * R) found.push(['Doji', 'neutral']);
    }
    if (down && isBear(p) && isBull(c) && c.c >= p.o && c.o <= p.c && B > body(p)) found.push(['Envolvente alcista', 'bull']);
    if (upT && isBull(p) && isBear(c) && c.c <= p.o && c.o >= p.c && B > body(p)) found.push(['Envolvente bajista', 'bear']);
    if (down && isBear(p) && body(p) > 1.2 * ab && isBull(c) && up(c) <= p.o && dn(c) >= p.c && B < 0.6 * body(p)) found.push(['Harami alcista', 'bull']);
    if (upT && isBull(p) && body(p) > 1.2 * ab && isBear(c) && up(c) <= p.c && dn(c) >= p.o && B < 0.6 * body(p)) found.push(['Harami bajista', 'bear']);
    if (down && isBear(p) && body(p) > ab && isBull(c) && c.o <= p.c && c.c > (p.o + p.c) / 2 && c.c < p.o) found.push(['Línea penetrante', 'bull']);
    if (upT && isBull(p) && body(p) > ab && isBear(c) && c.o >= p.c && c.c < (p.o + p.c) / 2 && c.c > p.o) found.push(['Nube oscura', 'bear']);
    const ch2 = cs[i - 3].c - cs[Math.max(0, i - 8)].c;
    if (ch2 < -1.5 * ab && isBear(q) && body(q) > ab && body(p) < 0.4 * body(q) && up(p) <= q.c + 0.25 * body(q) && isBull(c) && c.c > (q.o + q.c) / 2) found.push(['Estrella de la mañana', 'bull']);
    if (ch2 > 1.5 * ab && isBull(q) && body(q) > ab && body(p) < 0.4 * body(q) && dn(p) >= q.c - 0.25 * body(q) && isBear(c) && c.c < (q.o + q.c) / 2) found.push(['Estrella de la tarde', 'bear']);
    if ([q, p, c].every(isBull) && [q, p, c].every(x => body(x) > 0.7 * ab) && p.c > q.c && c.c > p.c && p.o >= q.o && p.o <= q.c && c.o >= p.o && c.o <= p.c) found.push(['Tres soldados blancos', 'bull']);
    if ([q, p, c].every(isBear) && [q, p, c].every(x => body(x) > 0.7 * ab) && p.c < q.c && c.c < p.c && p.o <= q.o && p.o >= q.c && c.o <= p.o && c.o >= p.c) found.push(['Tres cuervos negros', 'bear']);
    if (down && isBear(p) && isBull(c) && Math.abs(c.l - p.l) < 0.1 * ar) found.push(['Pinzas de suelo', 'bull']);
    if (upT && isBull(p) && isBear(c) && Math.abs(c.h - p.h) < 0.1 * ar) found.push(['Pinzas de techo', 'bear']);
    const f = found.filter(Boolean);
    if (f.length) {
      const dir = f.some(x => x[1] === 'bull') ? 'bull' : f.some(x => x[1] === 'bear') ? 'bear' : 'neutral';
      out.push({ i, names: f.map(x => x[0]), dir, atr: ar });
    }
  }
  return out;
}
const pscan = { seed: 17, cs: null };
function buildScan() {
  const r = mulberry32(pscan.seed), per = 6, wps = [{ t: 0, p: 100 }];
  let p = 100;
  for (let b = 6; b <= 90; b += 6) { p += gauss(r) * 2.2; wps.push({ t: b * per, p }); }
  pscan.cs = candlesFromPath(bridgePath(wps, r, 0.28), per);
}
const renderScan = fig(function () {
  const host = $('#fig-pscan'); if (!host) return;
  if (!pscan.cs) buildScan();
  const cs = pscan.cs, n = cs.length, on = new Set($$('.ps-f').filter(c => c.checked).map(c => c.value)), ctxOnly = $('#ps-ctx').checked;
  let det = detectPatterns(cs).filter(d => on.has(d.dir));
  if (ctxOnly) det = det.filter(d => {
    const w = cs.slice(Math.max(0, d.i - 20), d.i + 1);
    return d.dir === 'bull' ? Math.min(...w.map(c => c.l)) >= Math.min(cs[d.i].l, cs[d.i - 1].l) - 1e-9 : d.dir === 'bear' ? Math.max(...w.map(c => c.h)) <= Math.max(cs[d.i].h, cs[d.i - 1].h) + 1e-9 : false;
  });
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 320, yMin: lo, yMax: hi, dec: 0 }], aria: 'Escáner de patrones de velas' });
  const P = C.panels[0];
  drawCandles(C, P, cs);
  let hits = 0, tot = 0;
  const rows = [];
  det.forEach(d => {
    const c = cs[d.i], off = (hi - lo) * 0.035;
    if (d.dir === 'bull') marker(C, P, d.i, c.l - off, { shape: 'up', color: COL.up, size: 5 });
    else if (d.dir === 'bear') marker(C, P, d.i, c.h + off, { shape: 'down', color: COL.down, size: 5 });
    else el('circle', { cx: C.x(d.i), cy: P.y(c.h + off), r: 4, fill: COL.liq, stroke: COL.surface, 'stroke-width': 2 }, P.g.ann);
    let res = '—';
    if (d.dir !== 'neutral' && d.i + 5 < n) {
      tot++;
      const mv = cs[d.i + 5].c - c.c, ok = d.dir === 'bull' ? mv > 0 : mv < 0;
      if (ok) hits++;
      res = (ok ? '✔ ' : '✘ ') + (mv >= 0 ? '+' : '') + mv.toFixed(2);
    }
    rows.push([String(d.i + 1), d.names.join(' + '), d.dir === 'bull' ? 'Alcista' : d.dir === 'bear' ? 'Bajista' : 'Indecisión', res]);
  });
  hover(C, i => { const d = det.find(x => x.i === i); return [['#', 'Vela ' + (i + 1) + (d ? ' · ' + d.names.join(' + ') : '')]].concat(ohlcRows(cs[i], 2)); });
  $('#ps-stats').innerHTML = [['Patrones detectados', det.length], ['Evaluables (5 velas después)', tot], ['Fueron en la dirección esperada', tot ? hits + ' (' + Math.round(hits / tot * 100) + '%)' : '—']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  dataTable($('#ps-data'), ['Vela', 'Patrón', 'Dirección esperada', 'Cierre 5 velas después'], rows);
});

function initPatrones() {
  const list = $('#pat-list');
  [['bull', 'Alcistas'], ['bear', 'Bajistas'], ['neutral', 'Indecisión']].forEach(([t, lb]) => {
    const g = document.createElement('div'); g.className = 'grp';
    const s = document.createElement('span'); s.className = 'lbl'; s.textContent = lb; g.appendChild(s);
    PATS.filter(p => p.t === t).forEach(p => {
      const b = document.createElement('button'); b.className = 'btn'; b.dataset.p = p.id; b.textContent = p.n;
      b.addEventListener('click', () => { patSel = p.id; renderPat(); });
      g.appendChild(b);
    });
    list.appendChild(g);
  });
  renderPat();
  $$('.ps-f').forEach(c => c.addEventListener('change', renderScan));
  $('#ps-ctx').addEventListener('change', renderScan);
  $('#ps-new').addEventListener('click', () => { pscan.seed = newSeed(); buildScan(); renderScan(); });
  renderScan();
  quiz($('#patrones-quiz'), 'Práctica: patrones de velas', QUIZZES["patrones"].qs);
}

export { PATS, patSel, patSeries, renderPat, detectPatterns, pscan, buildScan, renderScan, initPatrones };
