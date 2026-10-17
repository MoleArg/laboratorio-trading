// Motor interactivo · fuerza de tendencia: ADX / DMI e Ichimoku.
import { QUIZZES } from './shared';
import { $, $$, COL, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, fmt, hline, hover, lineSeries, mulberry32, newSeed, ohlcRows, quiz, segBind, txt, vline } from './core';
import { trArr } from './volat';

/* --- cálculo de Wilder: +DI, −DI y ADX --- */
function adxCalc(cs, n) {
  const L = cs.length, tr = trArr(cs), pdm = Array(L).fill(0), mdm = Array(L).fill(0);
  for (let i = 1; i < L; i++) {
    const up = cs[i].h - cs[i - 1].h, dn = cs[i - 1].l - cs[i].l;
    pdm[i] = up > dn && up > 0 ? up : 0; mdm[i] = dn > up && dn > 0 ? dn : 0;
  }
  const pdi = Array(L).fill(null), mdi = Array(L).fill(null), dx = Array(L).fill(null), adx = Array(L).fill(null);
  let sTR = 0, sP = 0, sM = 0;
  for (let i = 1; i < L; i++) {
    if (i <= n) { sTR += tr[i]; sP += pdm[i]; sM += mdm[i]; if (i < n) continue; }
    else { sTR = sTR - sTR / n + tr[i]; sP = sP - sP / n + pdm[i]; sM = sM - sM / n + mdm[i]; }
    pdi[i] = 100 * sP / sTR; mdi[i] = 100 * sM / sTR;
    const s = pdi[i] + mdi[i]; dx[i] = s ? 100 * Math.abs(pdi[i] - mdi[i]) / s : 0;
  }
  let a = 0, cnt = 0;
  for (let i = n; i < L; i++) {
    if (dx[i] == null) continue;
    if (cnt < n) { a += dx[i]; cnt++; if (cnt === n) adx[i] = a /= n; }
    else { a = (a * (n - 1) + dx[i]) / n; adx[i] = a; }
  }
  return { pdi, mdi, adx, pdm, mdm, tr };
}

const AD_SC = {
  trend: { w: [[0, 100], [12, 101.2], [24, 99.6], [36, 100.6], [50, 106], [64, 111.5], [76, 116.5], [88, 118.4], [100, 117.6], [112, 119], [124, 118]],
    t: 'Rango, luego una tendencia alcista fuerte y al final otra vez lateral. El ADX sube por encima de 25 cuando arranca la tendencia y cae cuando se aplana, aunque el precio siga arriba.' },
  range: { w: [[0, 100], [10, 102.4], [22, 98.6], [34, 102], [46, 98.4], [58, 101.8], [70, 98.9], [82, 102.3], [94, 98.5], [106, 101.6], [124, 100.4]],
    t: 'Mercado lateral: +DI y −DI se cruzan una y otra vez y el ADX se queda por debajo de 20. Aquí los cruces de DI son ruido y funcionan mejor los osciladores (RSI, estocástico) en los extremos del rango.' },
  reversal: { w: [[0, 100], [20, 107], [40, 113], [52, 114.4], [60, 112.8], [72, 107], [92, 99.5], [110, 94], [124, 92.4]],
    t: 'Tendencia alcista que gira a bajista. Fíjate: el ADX <strong>baja</strong> durante el giro (la fuerza se pierde) y vuelve a <strong>subir</strong> con la caída. El ADX no tiene dirección: mide fuerza; la dirección la dan +DI y −DI.' }
};
const ad = { sc: 'trend', seed: 8, cs: null };
function buildAD() { const r = mulberry32(ad.seed); ad.cs = candlesFromPath(bridgePath(AD_SC[ad.sc].w.map(([b, p]) => ({ t: b * 5, p })), r, 0.17), 5); }
const renderADX = fig(function () {
  const host = $('#fig-adx'); if (!host) return;
  if (!ad.cs) buildAD();
  const cs = ad.cs, n = +$('#adx-n').value, R0 = adxCalc(cs, n);
  $('#adx-n-v').textContent = n;
  const [lo, hi] = extent(cs), top = Math.max(60, Math.ceil(Math.max(...R0.pdi.concat(R0.mdi, R0.adx).filter(v => v != null)) / 20) * 20);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 250, yMin: lo, yMax: hi, dec: 0 }, { h: 150, yMin: 0, yMax: top, step: 20, dec: 0, title: '+DI · −DI · ADX ' + n }], aria: 'Precio con ADX y DMI' });
  const [P, PA] = C.panels;
  hline(C, PA, 25, { color: COL.muted, width: 1, dash: '4 4', label: '25', side: 'axis' });
  hline(C, PA, 20, { color: COL.muted, width: 1, dash: '2 4', label: '20', side: 'axis' });
  drawCandles(C, P, cs);
  lineSeries(C, PA, R0.pdi, { color: COL.up, width: 1.5 });
  lineSeries(C, PA, R0.mdi, { color: COL.down, width: 1.5 });
  lineSeries(C, PA, R0.adx, { color: COL.strong, width: 2.4 });
  hover(C, j => cs[j] ? [['#', 'Vela ' + (j + 1)]].concat(ohlcRows(cs[j], 2), [['+DI', fmt(R0.pdi[j], 1)], ['−DI', fmt(R0.mdi[j], 1)], ['ADX', fmt(R0.adx[j], 1)]]) : null);
  const last = R0.adx[cs.length - 1];
  $('#adx-explain').innerHTML = AD_SC[ad.sc].t + ` Con un periodo de ${n}, ${n < 10 ? 'el ADX reacciona antes pero da más falsas señales' : n > 20 ? 'el ADX es más lento y suave' : 'el ADX tiene el equilibrio clásico de Wilder'}. ADX actual: <strong>${fmt(last, 1)}</strong>.`;
});

/* --- cálculo paso a paso de una vela --- */
const renderADXStep = fig(function () {
  const host = $('#adx-step-t'); if (!host || !ad.cs) return;
  const cs = ad.cs, n = 14, R0 = adxCalc(cs, n), i = +$('#adx-i').value;
  $('#adx-i-v').textContent = 'vela ' + (i + 1);
  const c = cs[i], p = cs[i - 1], up = c.h - p.h, dn = p.l - c.l;
  const rows = [
    ['Movimiento hacia arriba', 'Máx − máx anterior', `${c.h.toFixed(2)} − ${p.h.toFixed(2)} = ${up.toFixed(2)}`],
    ['Movimiento hacia abajo', 'Mín anterior − mín', `${p.l.toFixed(2)} − ${c.l.toFixed(2)} = ${dn.toFixed(2)}`],
    ['+DM', 'El mayor de los dos, si es positivo', R0.pdm[i].toFixed(2)],
    ['−DM', '(el otro queda en 0)', R0.mdm[i].toFixed(2)],
    ['True Range', 'Ver módulo de volatilidad', R0.tr[i].toFixed(2)],
    ['+DI / −DI', '100 × DM suavizado / TR suavizado', `${fmt(R0.pdi[i], 1)} / ${fmt(R0.mdi[i], 1)}`],
    ['DX', '100 × |+DI − −DI| / (+DI + −DI)', R0.pdi[i] == null ? '—' : (100 * Math.abs(R0.pdi[i] - R0.mdi[i]) / (R0.pdi[i] + R0.mdi[i])).toFixed(1)],
    ['ADX', 'Media de Wilder del DX (14)', fmt(R0.adx[i], 1)]
  ];
  host.innerHTML = `<table class="t"><thead><tr><th>Paso</th><th>Fórmula</th><th>Valor</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td style="text-align:left;color:var(--text-2)">${r[1]}</td><td class="mono">${r[2]}</td></tr>`).join('')}</tbody></table>`;
});

/* --- Ichimoku --- */
const mid = (cs, i, n) => { if (i < n - 1) return null; let h = -Infinity, l = Infinity; for (let k = i - n + 1; k <= i; k++) { h = Math.max(h, cs[k].h); l = Math.min(l, cs[k].l); } return (h + l) / 2; };
function ichimoku(cs) {
  const L = cs.length, S = 26, tenkan = cs.map((_, i) => mid(cs, i, 9)), kijun = cs.map((_, i) => mid(cs, i, 26));
  const spanA = Array(L + S).fill(null), spanB = Array(L + S).fill(null), chikou = Array(L).fill(null);
  for (let i = 0; i < L; i++) {
    if (tenkan[i] != null && kijun[i] != null) spanA[i + S] = (tenkan[i] + kijun[i]) / 2;
    const b = mid(cs, i, 52); if (b != null) spanB[i + S] = b;
    if (i - S >= 0) chikou[i - S] = cs[i].c;
  }
  return { tenkan, kijun, spanA, spanB, chikou };
}
const ich = { seed: 3, cs: null };
function buildIch() {
  const r = mulberry32(ich.seed), j = s => s * (0.7 + 0.6 * r());
  const W = [[0, 100], [14, 101.8], [28, 99.2], [42, 101.2], [56, 99.8], [70, 106 + j(2)], [84, 104 + j(1)], [98, 111 + j(2)], [110, 108.4], [122, 104], [136, 100 + j(1.5)], [150, 98]];
  ich.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * 4, p })), r, 0.15), 4);
}
const renderIch = fig(function () {
  const host = $('#fig-ichi'); if (!host) return;
  if (!ich.cs) buildIch();
  const cs = ich.cs, I = ichimoku(cs), on = new Set($$('.ichi-c').filter(c => c.checked).map(c => c.value));
  const [lo, hi] = extent(cs, I.spanA.concat(I.spanB).filter(v => v != null));
  const C = chart(host, { n: cs.length + 27, panels: [{ h: 340, yMin: lo, yMax: hi, dec: 0 }], aria: 'Ichimoku Kinko Hyo' });
  const P = C.panels[0];
  if (on.has('kumo')) {
    for (let i = 1; i < I.spanA.length; i++) {
      const a0 = I.spanA[i - 1], a1 = I.spanA[i], b0 = I.spanB[i - 1], b1 = I.spanB[i];
      if ([a0, a1, b0, b1].some(v => v == null)) continue;
      el('path', { d: `M${C.x(i - 1)} ${P.y(a0)} L${C.x(i)} ${P.y(a1)} L${C.x(i)} ${P.y(b1)} L${C.x(i - 1)} ${P.y(b0)} Z`, fill: a1 >= b1 ? COL.up : COL.down, 'fill-opacity': 0.16, stroke: 'none' }, P.g.zone);
    }
    lineSeries(C, P, I.spanA, { color: COL.up, width: 1 }); lineSeries(C, P, I.spanB, { color: COL.down, width: 1 });
    vline(C, cs.length - 1, { color: COL.muted });
    txt(C.bg, C.padL + C.iw - 6, C.padT + 14, 'nube proyectada 26 velas →', { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10.5 });
  }
  drawCandles(C, P, cs);
  if (on.has('tenkan')) lineSeries(C, P, I.tenkan, { color: COL.rsi, width: 1.6 });
  if (on.has('kijun')) lineSeries(C, P, I.kijun, { color: COL.liq, width: 1.8 });
  if (on.has('chikou')) lineSeries(C, P, I.chikou, { color: COL.text2, width: 1.3 });
  hover(C, j => [['#', j < cs.length ? 'Vela ' + (j + 1) : 'Futuro +' + (j - cs.length + 1)]].concat(cs[j] ? ohlcRows(cs[j], 2) : [], [['Tenkan', fmt(I.tenkan[j], 2)], ['Kijun', fmt(I.kijun[j], 2)], ['Senkou A', fmt(I.spanA[j], 2)], ['Senkou B', fmt(I.spanB[j], 2)], ['Chikou', fmt(I.chikou[j], 2)]]));
  const k = cs.length - 1, c = cs[k].c, top = Math.max(I.spanA[k], I.spanB[k]), bot = Math.min(I.spanA[k], I.spanB[k]);
  const pos = c > top ? 'por encima de la nube (sesgo alcista)' : c < bot ? 'por debajo de la nube (sesgo bajista)' : 'dentro de la nube (zona de indecisión)';
  $('#ichi-explain').innerHTML = `Última vela: el precio está <strong>${pos}</strong>; Tenkan ${I.tenkan[k] > I.kijun[k] ? 'por encima' : 'por debajo'} de Kijun; la nube futura es ${I.spanA[k + 26] >= I.spanB[k + 26] ? 'verde (A sobre B)' : 'roja (B sobre A)'}. Activa y desactiva componentes para ver qué aporta cada uno.`;
});

function initADX() {
  buildAD();
  segBind($('#adx-lab'), (k, v) => { ad.sc = v; buildAD(); renderADX(); renderADXStep(); });
  $('#adx-n').addEventListener('input', renderADX);
  $('#adx-new').addEventListener('click', () => { ad.seed = newSeed(); buildAD(); renderADX(); renderADXStep(); });
  renderADX();
  $('#adx-i').addEventListener('input', renderADXStep); renderADXStep();
  $$('.ichi-c').forEach(c => c.addEventListener('change', renderIch));
  $('#ichi-new').addEventListener('click', () => { ich.seed = newSeed(); buildIch(); renderIch(); });
  renderIch();
  quiz($('#adx-quiz'), 'Práctica: ADX e Ichimoku', QUIZZES.adx.qs);
}

export { adxCalc, AD_SC, renderADX, renderADXStep, ichimoku, renderIch, initADX };
