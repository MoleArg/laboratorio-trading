// Utilidades compartidas por los módulos agregados después del port (gestión, backtesting, psicología…).
import { $, COL, el, txt } from './core';

/* Fila de tarjetas .stat a partir de [[etiqueta, valor], ...] */
export const stats = rows => rows.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
export const sgn = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);
export const R = (v, d = 2) => sgn(v, d) + 'R';
export const pctS = (v, d = 0) => (v * 100).toFixed(d) + '%';
export const num = sel => +$(sel).value;
export const money = (v, d = 0) => (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

/* SVG vacío dentro de un .chart-host (reemplaza el anterior, conserva el tooltip) */
export function svgIn(host, w, h, aria) {
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': aria || 'Gráfico', class: w >= 700 ? 'wide' : null });
  host.insertBefore(svg, host.firstChild);
  return svg;
}

/* Histograma simple de valores en [lo, hi] con `bins` barras, dibujado en la caja (x, y, w, h) */
export function histogram(svg, vals, o) {
  const { x, y, w, h, lo, hi, bins } = o, cnt = Array(bins).fill(0), bw = (hi - lo) / bins;
  vals.forEach(v => { const b = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / bw))); cnt[b]++; });
  const mx = Math.max(...cnt, 1), X = v => x + (v - lo) / (hi - lo) * w;
  el('line', { x1: x, x2: x + w, y1: y + h, y2: y + h, stroke: COL.axis }, svg);
  cnt.forEach((c, b) => {
    const v0 = lo + b * bw, bh = c / mx * (h - 4);
    el('rect', { x: X(v0) + 0.5, y: y + h - bh, width: Math.max(1, w / bins - 1), height: bh, rx: 1.5, fill: o.color ? o.color(v0 + bw / 2) : COL.accent, 'fill-opacity': 0.85 }, svg);
  });
  (o.ticks || []).forEach(t => txt(svg, X(t), y + h + 13, o.fmt ? o.fmt(t) : String(t), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10 }));
  if (o.mark != null) {
    el('line', { x1: X(o.mark), x2: X(o.mark), y1: y, y2: y + h, stroke: COL.strong, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
  }
  if (o.title) txt(svg, x, y - 6, o.title, { fill: COL.text, 'font-size': 11.5, 'font-weight': 700 });
  return X;
}

/* Curva de capital acumulada (en R) dentro de una caja */
export function equityPath(svg, eq, o) {
  const { x, y, w, h } = o, lo = Math.min(0, ...eq), hi = Math.max(0, ...eq), sp = hi - lo || 1;
  const X = i => x + i / Math.max(1, eq.length - 1) * w, Y = v => y + h - (v - lo) / sp * h;
  el('line', { x1: x, x2: x + w, y1: Y(0), y2: Y(0), stroke: COL.axis, 'stroke-dasharray': '3 3' }, svg);
  el('path', { d: eq.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(''), fill: 'none', stroke: o.color || COL.accent, 'stroke-width': o.width || 2, 'stroke-linejoin': 'round' }, svg);
  return { X, Y, lo, hi };
}

/* Estadísticas de una lista de resultados en R */
export function rStats(rs) {
  const n = rs.length, wins = rs.filter(v => v > 0), losses = rs.filter(v => v < 0);
  const sum = rs.reduce((a, b) => a + b, 0), gw = wins.reduce((a, b) => a + b, 0), gl = -losses.reduce((a, b) => a + b, 0);
  let eq = 0, peak = 0, mdd = 0, cur = 0, ls = 0; const curve = [0];
  rs.forEach(v => { eq += v; curve.push(eq); if (eq > peak) peak = eq; mdd = Math.max(mdd, peak - eq); if (v < 0) { cur++; ls = Math.max(ls, cur); } else if (v > 0) cur = 0; });
  return {
    n, sum, exp: n ? sum / n : 0, wr: n ? wins.length / n : 0, avgW: wins.length ? gw / wins.length : 0, avgL: losses.length ? gl / losses.length : 0,
    pf: gl ? gw / gl : (gw ? Infinity : 0), mdd, ls, curve, best: n ? Math.max(...rs) : 0, worst: n ? Math.min(...rs) : 0
  };
}
