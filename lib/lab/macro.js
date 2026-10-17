// Motor interactivo · macro y calendario económico (calendario en hora local, sorpresa, cadena de activos y deslizamiento).
import { QUIZZES } from './shared';
import { $, COL, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, ohlcRows, quiz, segBind, vline, zone } from './core';
import { zonedToUtc } from '../time';
import { localTZ } from './sesiones';
import { stats } from './kit';

/* --- calendario: horas habituales convertidas a la zona local --- */
const CAL = [
  ['Decisión de tasas de la Fed (FOMC)', 'America/New_York', 14, 0, '8 veces al año (miércoles)', 'Muy alto', 'USD, índices, oro, todo'],
  ['Conferencia de prensa del FOMC', 'America/New_York', 14, 30, 'Tras la decisión', 'Muy alto', 'Lo que dice el presidente de la Fed sobre las próximas reuniones'],
  ['IPC / CPI de EE. UU. (inflación)', 'America/New_York', 8, 30, 'Mensual, mediados de mes', 'Muy alto', 'USD, tasas, índices'],
  ['Nóminas no agrícolas (NFP) y desempleo', 'America/New_York', 8, 30, 'Primer viernes del mes', 'Muy alto', 'USD, índices, oro'],
  ['PCE (inflación preferida por la Fed)', 'America/New_York', 8, 30, 'Mensual, fin de mes', 'Alto', 'USD, tasas'],
  ['PIB de EE. UU. (avance)', 'America/New_York', 8, 30, 'Trimestral', 'Alto', 'USD, índices'],
  ['Ventas minoristas de EE. UU.', 'America/New_York', 8, 30, 'Mensual', 'Medio-alto', 'USD'],
  ['ISM manufacturero / servicios', 'America/New_York', 10, 0, 'Primeros días del mes', 'Medio-alto', 'USD, índices'],
  ['Decisión de tasas del BCE', 'Europe/Berlin', 14, 15, '8 veces al año (jueves)', 'Muy alto', 'EUR'],
  ['Decisión de tasas del Banco de Inglaterra', 'Europe/London', 12, 0, '8 veces al año (jueves)', 'Muy alto', 'GBP'],
  ['IPC de la zona euro (preliminar)', 'Europe/Berlin', 11, 0, 'Fin / principio de mes', 'Alto', 'EUR']
];
function renderCal() {
  const host = $('#mc-cal-t'); if (!host) return;
  const d = new Date(), y = d.getFullYear(), mo = d.getMonth() + 1, dd = d.getDate();
  const f = new Intl.DateTimeFormat('es', { timeZone: localTZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const rows = CAL.map(([n, tz, h, mi, when, imp, mov]) => {
    const local = f.format(new Date(zonedToUtc(tz, y, mo, dd, h, mi))), src = String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0') + ' ' + (tz === 'America/New_York' ? 'NY' : tz === 'Europe/London' ? 'Londres' : 'Fráncfort');
    return `<tr><td>${n}</td><td>${src}</td><td><b>${local}</b></td><td>${when}</td><td>${imp}</td><td>${mov}</td></tr>`;
  }).join('');
  host.innerHTML = `<table class="t wide"><thead><tr><th>Evento</th><th>Hora de origen</th><th>Tu hora</th><th>Cuándo</th><th>Impacto</th><th>Qué mueve</th></tr></thead><tbody>${rows}</tbody></table>`;
  $('#mc-cal-tz').textContent = localTZ;
}

/* --- la sorpresa mueve el precio --- */
const ms = { seed: 21 };
const renderSurprise = fig(function () {
  const host = $('#fig-mc-sur'); if (!host) return;
  const cons = +$('#ms-c').value / 10, real = +$('#ms-r').value / 10, priced = $('#ms-p').checked;
  $('#ms-c-v').textContent = cons.toFixed(1) + '%'; $('#ms-r-v').textContent = real.toFixed(1) + '%';
  const sur = (real - cons) / 0.1, eff = priced ? sur * 0.35 : sur, dir = -Math.sign(eff) || 1, mag = Math.min(4, Math.abs(eff));
  // EUR/USD en velas de 1 minuto, en pips sobre 1.08000: un IPC más alto sube el dólar y baja el EUR/USD
  const r = mulberry32(ms.seed + Math.round(sur * 10) + (priced ? 7 : 0)), per = 6, base = 0, mv = dir * (6 + mag * 11);
  const W = [[0, base], [20, base + 0.8], [21, base - mv * 0.15], [22, base + mv * (mag < 0.6 ? -0.25 : 0.7)], [24, base + mv * (mag < 0.6 ? 0.5 : 0.45)], [28, base + mv * (mag < 0.6 ? -0.1 : 1)], [36, base + mv * (mag < 0.6 ? 0.2 : 1.15)]];
  const path = bridgePath(W.map(([b, p], i) => ({ t: b * per, p, n: i === 0 ? 0.35 : 1.4 })), r, 1);
  const cs = candlesFromPath(path, per), pr = v => 1.08 + v * 1e-4, C0 = cs.map(c => ({ o: pr(c.o), h: pr(c.h), l: pr(c.l), c: pr(c.c) }));
  const [lo, hi] = extent(C0);
  const C = chart(host, { n: C0.length + 1, panels: [{ h: 280, yMin: lo, yMax: hi, dec: 4, title: 'EUR/USD · 1 minuto' }], aria: 'Reacción del EUR/USD al dato de inflación' });
  const P = C.panels[0];
  vline(C, 20, { color: COL.liq, dash: '4 3' });
  zone(C, P, pr(-3), pr(3), { x1: 17, x2: 23, color: COL.down, op: 0.06, stroke: false });
  drawCandles(C, P, C0);
  marker(C, P, 20, C0[20].h, { color: COL.liq, size: 5, label: 'Dato 08:30 NY', dy: -18 });
  hover(C, j => C0[j] ? [['#', (j < 20 ? '−' + (20 - j) : '+' + (j - 20)) + ' min']].concat(ohlcRows(C0[j], 5)) : null);
  const pips = Math.round((cs[cs.length - 1].c - base)), rng = Math.round(Math.max(...cs.slice(20, 26).map(c => c.h)) - Math.min(...cs.slice(20, 26).map(c => c.l)));
  const hot = sur > 0.4, cold = sur < -0.4;
  $('#ms-out').innerHTML = stats([['Sorpresa', (sur >= 0 ? '+' : '') + (real - cons).toFixed(1) + ' pp'], ['EUR/USD 15 min después', (pips >= 0 ? '+' : '') + pips + ' pips'], ['Rango de los primeros 5 min', rng + ' pips'],
    ['DXY', hot ? '↑' : cold ? '↓' : '≈'], ['Oro', hot ? '↓' : cold ? '↑' : '≈'], ['Nasdaq', hot ? '↓' : cold ? '↑' : '≈']]);
  $('#ms-explain').innerHTML = Math.abs(sur) < 0.5 ? 'Dato <strong>en línea</strong> con lo esperado: el precio da un latigazo hacia los dos lados (barre stops arriba y abajo) y no va a ningún sitio. El spread se abre justo en el dato.'
    : `Inflación ${hot ? '<strong>más alta</strong>' : '<strong>más baja</strong>'} de lo esperado → el mercado ${hot ? 'retrasa los recortes de tasas: el dólar sube y el EUR/USD cae' : 'adelanta recortes de tasas: el dólar baja y el EUR/USD sube'}. ` +
      (priced ? 'Como el mercado ya intuía el dato (rumores, otros indicadores), la reacción es más pequeña: lo que se mueve es la diferencia con lo <em>descontado</em>, no con el consenso oficial.' : 'Lo que mueve el precio no es si el dato es "bueno" o "malo", sino la diferencia con lo esperado.');
});

/* --- la cadena: tasas → dólar → resto --- */
const CHAIN = {
  cpiHot: ['IPC más alto de lo esperado', 'El mercado espera tasas más altas por más tiempo.', ['↑', '↑', '↓', '↑', '↓', '↓', '↓']],
  cpiCold: ['IPC más bajo de lo esperado', 'Se adelantan los recortes de tasas.', ['↓', '↓', '↑', '↓', '↑', '↑', '↑']],
  hawk: ['Fed "hawkish" (dura)', 'Mensaje de tasas altas o más subidas.', ['↑', '↑', '↓', '↑', '↓', '↓', '↓']],
  dove: ['Fed "dovish" (blanda)', 'Mensaje de recortes o pausa.', ['↓', '↓', '↑', '↓', '↑', '↑', '↑']],
  nfpStrong: ['Empleo muy fuerte (NFP)', 'Economía caliente: menos urgencia de recortar.', ['↑', '↑', '↓', '↑', '↓', '↕', '↕']],
  riskOff: ['Shock de riesgo (crisis, guerra)', 'Huida a refugio: se vende riesgo.', ['↓', '↑', '↓', '↓', '↑', '↓', '↓']]
};
const ASSETS = ['Rendimiento del bono a 2 años', 'Dólar (DXY)', 'EUR/USD', 'USD/JPY', 'Oro', 'Nasdaq / S&P 500', 'Bitcoin'];
let chainSel = 'cpiHot';
function renderChain() {
  const [t, why, arr] = CHAIN[chainSel], host = $('#mc-chain-t'); if (!host) return;
  const col = a => a === '↑' ? 'var(--c-up)' : a === '↓' ? 'var(--c-down)' : 'var(--muted)';
  host.innerHTML = `<p style="margin:4px 0 10px"><strong>${t}:</strong> ${why}</p><table class="t wide"><thead><tr><th>Activo</th><th>Reacción típica</th></tr></thead><tbody>` +
    ASSETS.map((a, i) => `<tr><td>${a}</td><td style="font-size:1.15rem;font-weight:700;color:${col(arr[i])}">${arr[i]}</td></tr>`).join('') + '</tbody></table>';
  $('#mc-chain-explain').innerHTML = chainSel === 'riskOff'
    ? 'En pánico, el dólar y el yen suben como refugio (USD/JPY puede bajar porque el yen sube más), el oro suele subir y los activos de riesgo caen. Las correlaciones de siempre pueden romperse durante unas horas.'
    : 'El hilo conductor son las <strong>expectativas de tasas</strong>: tasas más altas atraen capital al dólar, encarecen el dinero para empresas (índices abajo) y castigan a lo que no paga interés (oro, cripto). Es la reacción típica, no una ley: si el dato ya estaba descontado, puede pasar lo contrario.';
}

/* --- deslizamiento en la noticia --- */
const renderSlip = fig(function () {
  const host = $('#fig-mc-slip'); if (!host) return;
  const stopD = +$('#slp-d').value, gap = +$('#slp-g').value, spr = +$('#slp-s').value / 10;
  $('#slp-d-v').textContent = stopD + ' pips'; $('#slp-g-v').textContent = gap + ' pips'; $('#slp-s-v').textContent = spr.toFixed(1) + ' pips';
  const entry = 0, stop = -stopD, pre = [[0, 0.6, -0.8, 0.3], [0.3, 1.1, -0.4, 0.8], [0.8, 1.2, -0.3, 0.1], [0.1, 0.7, -0.6, 0.4], [0.4, 0.9, -0.2, 0.6]];
  const openAfter = 0.6 - gap, cs = pre.concat([[openAfter, openAfter + 2, openAfter - 6, openAfter - 3], [openAfter - 3, openAfter + 4, openAfter - 5, openAfter + 2], [openAfter + 2, openAfter + 6, openAfter, openAfter + 5]]).map(a => ({ o: a[0], h: a[1], l: a[2], c: a[3] }));
  // la orden stop de una compra se ejecuta en el bid; con el spread abierto el bid queda aún más abajo
  const hit = cs[5].o - spr <= stop || cs[5].l - spr <= stop;
  const fill = hit ? Math.min(stop, cs[5].o - spr) : null, lossR = hit ? (entry - fill) / stopD : 0;
  const [lo, hi] = extent(cs, [stop - 2, fill ?? stop]);
  const C = chart(host, { n: cs.length + 1, panels: [{ h: 260, yMin: lo, yMax: hi, dec: 0, fmt: v => (v >= 0 ? '+' : '') + v.toFixed(0) + ' p' }], aria: 'Deslizamiento de un stop en una noticia' });
  const P = C.panels[0];
  hline(C, P, entry, { color: COL.entry, width: 1.2, label: 'Entrada (compra)', side: 'left' });
  hline(C, P, stop, { color: COL.down, width: 1.4, dash: false, label: 'Stop planeado: −1R', side: 'left', below: true });
  vline(C, 5, { color: COL.liq });
  drawCandles(C, P, cs);
  if (hit) { hline(C, P, fill, { x1: 5, color: COL.down, width: 2, label: 'Ejecución real', side: 'right', below: true }); marker(C, P, 5, fill, { shape: 'down', color: COL.down, size: 6 }); }
  hover(C, j => cs[j] ? [['#', j < 5 ? 'Antes del dato' : 'Tras el dato']].concat(ohlcRows(cs[j], 1)) : null);
  $('#slp-out').innerHTML = stats([['Pérdida planeada', '−1,00R'], ['Pérdida real', hit ? '−' + lossR.toFixed(2) + 'R' : 'stop no tocado'], ['Deslizamiento', hit ? (stop - fill).toFixed(1) + ' pips' : '—']]);
  $('#slp-explain').className = 'explain ' + (lossR > 1.3 ? 'bad' : '');
  $('#slp-explain').innerHTML = !hit ? 'El precio no llegó a tu stop. Pero fíjate en cuánto se acercó en un segundo.'
    : `El precio abrió ${gap} pips más abajo y con el spread abierto a ${spr.toFixed(1)} pips. Una orden stop se convierte en orden a mercado al tocarse y se ejecuta al <strong>primer precio disponible</strong>: perdiste ${lossR.toFixed(2)}R en vez de 1R. ` +
      (stopD < gap ? 'Con un stop más corto que el salto, el stop no te protege de nada en una noticia.' : '');
});

function initMacro() {
  renderCal();
  ['#ms-c', '#ms-r', '#ms-p'].forEach(s => $(s).addEventListener('input', renderSurprise)); renderSurprise();
  segBind($('#mc-dxy'), (k, v) => { chainSel = v; renderChain(); }); renderChain();
  ['#slp-d', '#slp-g', '#slp-s'].forEach(s => $(s).addEventListener('input', renderSlip)); renderSlip();
  quiz($('#macro-quiz'), 'Práctica: macro y calendario económico', QUIZZES.macro.qs);
}

export { CAL, renderCal, renderSurprise, CHAIN, renderChain, renderSlip, initMacro };
