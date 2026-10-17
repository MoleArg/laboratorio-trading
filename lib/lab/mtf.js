// Motor interactivo · análisis multi-temporal (ampliación del módulo de estructura).
import { $, COL, aggregate, argExt, bridgePath, candlesFromPath, chart, drawCandles, extent, fig, hline, hover, marker, mulberry32, ohlcRows, zone } from './core';

// camino en velas de 15 minutos: tendencia alcista en 4H, retroceso a la zona de demanda y giro en 15m
const MTF_W = [[0, 100], [80, 104], [120, 102.6], [200, 107], [262, 105.3], [340, 109.2], [400, 107.4], [420, 107.9], [440, 105.65], [446, 106.05], [454, 105.2], [466, 106.4], [474, 105.95], [511, 108.3]];
let MT = null;
function buildMTF() {
  const r = mulberry32(55), cs15 = candlesFromPath(bridgePath(MTF_W.map(([t, p]) => ({ t: t * 4, p })), r, 0.035), 4);
  const h1 = aggregate(cs15, 4), h4 = aggregate(cs15, 16);
  const z = argExt(h4.map(c => c.l), 14, 18, 'min'), zLo = h4[z].l, zHi = Math.min(h4[z].o, h4[z].c) + 0.25;
  const sw = argExt(cs15.map(c => c.l), 448, 458, 'min'), ll = argExt(cs15.map(c => c.h), 442, 450, 'max');
  MT = { cs15, h1, h4, z, zLo, zHi, sw, ll, hh: argExt(h4.map(c => c.h), 18, 25, 'max') };
}
const MTF_STEPS = [
  ['1 · 4H: ¿hacia dónde va el mercado?', 'En 4 horas la estructura es alcista: máximos y mínimos crecientes. Mientras no se rompa el último mínimo relevante, solo buscamos <strong>compras</strong>. El último máximo (BSL) es el objetivo.'],
  ['2 · 4H: ¿dónde comprar?', 'Marcamos la zona de demanda que originó el último impulso (el mínimo más alto). No compramos en medio del retroceso: esperamos a que el precio llegue a la zona, en <strong>descuento</strong>.'],
  ['3 · 1H: el retroceso llega a la zona', 'En 1 hora el retroceso tiene su propia estructura <strong>bajista</strong> (máximos más bajos). Es normal: es un retroceso dentro de una tendencia mayor. Necesitamos que esa estructura pequeña se rompa al alza dentro de la zona.'],
  ['4 · 15m: barrido y cambio de carácter', 'En 15 minutos el precio barre el último mínimo (toma la SSL) dentro de la zona y luego rompe el último máximo bajista: <strong>CHoCH alcista</strong>. Ahora las tres temporalidades están alineadas.'],
  ['5 · 15m: entrada, stop y objetivo', 'Entrada en el retroceso tras el CHoCH, stop bajo el barrido (pocos pips en 15m) y objetivo en el máximo de 4H. El stop pequeño de la temporalidad baja con el objetivo de la alta da un riesgo/beneficio que en 4H sería imposible.']
];
const mtS = { step: 0 };
const renderMTF = fig(function () {
  const host = $('#fig-est-mtf'); if (!host) return;
  if (!MT) buildMTF();
  let grid = host.querySelector('.mtf-grid');
  if (!grid) {
    grid = document.createElement('div'); grid.className = 'mtf-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start';
    grid.innerHTML = '<div class="chart-host m4"></div><div class="chart-host m1"></div><div class="chart-host m15" style="grid-column:1/-1"></div>';
    host.appendChild(grid);
  }
  const st = mtS.step, end15 = st < 4 ? 470 : MT.cs15.length - 1, { cs15, h1, h4 } = MT;
  const k4 = Math.floor(end15 / 16), k1 = Math.floor(end15 / 4);
  // 4H
  const C4 = chart(grid.querySelector('.m4'), { n: h4.length + 1, w: 440, padR: 46, panels: [{ h: 230, yMin: 99, yMax: 110.4, dec: 0, title: '4H' }], aria: 'Temporalidad de 4 horas' });
  const P4 = C4.panels[0];
  if (st >= 1) zone(C4, P4, MT.zLo, MT.zHi, { x1: MT.z, color: COL.up, op: 0.18, label: 'Demanda 4H', labelBelow: true });
  if (st >= 0) hline(C4, P4, h4[MT.hh].h, { x1: MT.hh, color: COL.liq, width: 1.2, label: 'BSL', side: 'right' });
  drawCandles(C4, P4, h4.map((c, i) => i <= k4 ? c : null));
  // 1H: últimas 40 velas
  const a1 = h1.length - 48, s1 = h1.slice(a1).map((c, i) => a1 + i <= k1 ? c : null);
  const [l1, u1] = extent(h1.slice(a1), [MT.zLo]);
  const C1 = chart(grid.querySelector('.m1'), { n: 49, w: 440, padR: 46, panels: [{ h: 230, yMin: l1, yMax: u1, dec: 1, title: '1H (últimas 48 velas)' }], aria: 'Temporalidad de 1 hora' });
  const P1 = C1.panels[0];
  if (st >= 1) zone(C1, P1, MT.zLo, MT.zHi, { color: COL.up, op: 0.14, stroke: false });
  if (st >= 2) {
    const hs = [argExt(h1.map(c => c.h), 82, 88, 'max'), argExt(h1.map(c => c.h), 102, 108, 'max')];
    hs.forEach((i, n) => marker(C1, P1, i - a1, h1[i].h, { shape: 'down', color: COL.down, size: 4, label: n ? 'LH' : 'H', dy: -14 }));
  }
  drawCandles(C1, P1, s1);
  // 15m: últimas 72 velas
  const a15 = cs15.length - 72, s15 = cs15.slice(a15), [l15, u15] = extent(s15);
  const C15 = chart(grid.querySelector('.m15'), { n: 73, w: 900, panels: [{ h: 260, yMin: Math.min(l15, MT.zLo), yMax: u15, dec: 2, title: '15m (últimas 72 velas)' }], aria: 'Temporalidad de 15 minutos' });
  const P15 = C15.panels[0], x = i => i - a15;
  zone(C15, P15, MT.zLo, MT.zHi, { color: COL.up, op: st >= 1 ? 0.12 : 0, stroke: st >= 1 });
  if (st >= 3) {
    hline(C15, P15, cs15[MT.ll].h, { x1: x(MT.ll), x2: x(Math.min(end15, 470)), color: COL.text2, width: 1.4, dash: '4 3', label: 'CHoCH', side: 'right' });
    marker(C15, P15, x(MT.sw), cs15[MT.sw].l, { shape: 'up', color: COL.liq, size: 5, label: 'Barrido', dy: 20 });
  }
  if (st >= 4) {
    const e = 474, entry = cs15[e].l + 0.08, stop = cs15[MT.sw].l - 0.08, tgt = h4[MT.hh].h;
    zone(C15, P15, entry, stop, { x1: x(e), color: COL.down, op: 0.14 });
    zone(C15, P15, entry, Math.min(tgt, u15), { x1: x(e), color: COL.up, op: 0.08 });
    hline(C15, P15, entry, { x1: x(e), color: COL.entry, dash: false, label: 'Entrada', side: 'left' });
    $('#mtf-rr').textContent = `R:B hasta el máximo de 4H ≈ 1 : ${((tgt - entry) / (entry - stop)).toFixed(1)}`;
  } else $('#mtf-rr').textContent = '';
  drawCandles(C15, P15, s15.map((c, i) => a15 + i <= end15 ? c : null));
  hover(C15, j => s15[j] && a15 + j <= end15 ? [['#', '15m #' + (a15 + j + 1)]].concat(ohlcRows(s15[j], 2)) : null);
  $('#mtf-step').innerHTML = `<h4>${MTF_STEPS[st][0]}</h4><div>${MTF_STEPS[st][1]}</div>`;
  $('#mtf-dots').innerHTML = MTF_STEPS.map((_, i) => `<span class="${i === st ? 'on' : ''}"></span>`).join('');
  $('#mtf-prev').disabled = st === 0; $('#mtf-next').disabled = st === MTF_STEPS.length - 1;
});

function initMTF() {
  $('#mtf-prev').addEventListener('click', () => { mtS.step = Math.max(0, mtS.step - 1); renderMTF(); });
  $('#mtf-next').addEventListener('click', () => { mtS.step = Math.min(MTF_STEPS.length - 1, mtS.step + 1); renderMTF(); });
  renderMTF();
}

export { MTF_W, buildMTF, MTF_STEPS, renderMTF, initMTF };
