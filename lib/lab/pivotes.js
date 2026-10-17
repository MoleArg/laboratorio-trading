// Motor interactivo · puntos pivote (ampliación del módulo de soportes y resistencias).
import { $, COL, bridgePath, candlesFromPath, chart, drawCandles, extent, fig, hline, hover, mulberry32, newSeed, ohlcRows, segBind, segVal } from './core';

function pivotLevels(H, L, C, kind) {
  const P = (H + L + C) / 3, Rg = H - L;
  if (kind === 'fib') return { P, R1: P + 0.382 * Rg, R2: P + 0.618 * Rg, R3: P + Rg, S1: P - 0.382 * Rg, S2: P - 0.618 * Rg, S3: P - Rg };
  if (kind === 'cam') return { P, R1: C + Rg * 1.1 / 12, R2: C + Rg * 1.1 / 6, R3: C + Rg * 1.1 / 4, R4: C + Rg * 1.1 / 2, S1: C - Rg * 1.1 / 12, S2: C - Rg * 1.1 / 6, S3: C - Rg * 1.1 / 4, S4: C - Rg * 1.1 / 2 };
  return { P, R1: 2 * P - L, S1: 2 * P - H, R2: P + Rg, S2: P - Rg, R3: H + 2 * (P - L), S3: L - 2 * (H - P) };
}
const pv = { seed: 4, cs: null, key: '' };
const renderPivots = fig(function () {
  const host = $('#fig-sr-pivot'); if (!host) return;
  const H = +$('#pv-h').value, L = +$('#pv-l').value, C = +$('#pv-c').value, kind = segVal($('#sr-pivot'), 'pv-kind') || 'classic';
  if (!(H > L) || C > H || C < L) { $('#pv-explain').className = 'explain bad'; $('#pv-explain').textContent = 'El máximo tiene que ser mayor que el mínimo y el cierre tiene que estar entre ambos.'; return; }
  const lv = pivotLevels(H, L, C, kind), cls = pivotLevels(H, L, C, 'classic'), Rg = H - L;
  const key = [H, L, C, pv.seed].join('|');
  if (key !== pv.key) {
    // día siguiente en velas de 15 minutos: abre cerca del cierre, visita el pivote y rebota en R1/S1
    const r = mulberry32(pv.seed), up = r() < 0.5, a = up ? cls.R1 : cls.S1, b = up ? cls.S1 : cls.R1;
    const W = [[0, C], [14, cls.P + (r() - 0.5) * 0.1 * Rg], [34, a + (up ? -1 : 1) * 0.04 * Rg], [48, cls.P + (up ? 0.15 : -0.15) * Rg], [70, (cls.P + b) / 2], [96, cls.P + (r() - 0.5) * 0.3 * Rg]];
    pv.cs = candlesFromPath(bridgePath(W.map(([t, p]) => ({ t: t * 4, p })), r, Rg * 0.012), 4); pv.key = key;
  }
  const cs = pv.cs, names = Object.keys(lv).filter(k => k !== 'P' || kind !== 'cam'), vals = names.map(k => lv[k]);
  const [lo, hi] = extent(cs, vals.filter(v => Math.abs(v - C) < Rg * 1.3));
  const Cc = chart(host, { n: cs.length + 1, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 4 }], aria: 'Puntos pivote sobre el día siguiente' });
  const P = Cc.panels[0];
  names.forEach(k => {
    const v = lv[k]; if (v < lo || v > hi) return;
    hline(Cc, P, v, { color: k === 'P' ? COL.strong : k[0] === 'R' ? COL.down : COL.up, width: k === 'P' ? 1.8 : 1.2, dash: k === 'P' ? false : '5 4', label: k + ' ' + v.toFixed(4), side: 'right' });
  });
  drawCandles(Cc, P, cs);
  hover(Cc, j => cs[j] ? [['#', 'Vela de 15m ' + (j + 1)]].concat(ohlcRows(cs[j], 4)) : null);
  $('#pv-t').innerHTML = '<table class="t"><thead><tr><th>Nivel</th><th>Precio</th></tr></thead><tbody>' +
    names.slice().sort((x, y) => lv[y] - lv[x]).map(k => `<tr${k === 'P' ? ' class="hl"' : ''}><td>${k === 'P' ? 'P (pivote)' : k}</td><td class="mono">${lv[k].toFixed(5)}</td></tr>`).join('') + '</tbody></table>';
  $('#pv-explain').className = 'explain';
  $('#pv-explain').innerHTML = kind === 'cam'
    ? 'Camarilla calcula los niveles desde el <strong>cierre</strong> y los aprieta mucho: R3/S3 se usan para operar reversión dentro del rango y R4/S4 como niveles de ruptura.'
    : kind === 'fib' ? 'Pivotes de Fibonacci: mismo P, pero los niveles se separan 38,2%, 61,8% y 100% del rango de ayer.'
      : 'Pivote clásico: P = (máximo + mínimo + cierre) / 3. Precio por encima de P = sesgo intradía alcista; por debajo, bajista. R1/S1 son los niveles que más se respetan; R3/S3 solo se alcanzan en días de tendencia fuerte.';
});

function initPivotes() {
  ['#pv-h', '#pv-l', '#pv-c'].forEach(s => $(s).addEventListener('input', renderPivots));
  segBind($('#sr-pivot'), () => renderPivots());
  $('#pv-new').addEventListener('click', () => { pv.seed = newSeed(); pv.key = ''; renderPivots(); });
  renderPivots();
}

export { pivotLevels, renderPivots, initPivotes };
