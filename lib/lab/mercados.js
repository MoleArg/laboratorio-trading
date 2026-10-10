// Motor interactivo · mercados. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { wall, zonedToUtc } from '../time';
import { $, COL, chart, el, fig, gauss, hline, hover, lineSeries, mulberry32, newSeed, quiz, segBind, tag, txt } from './core';
import { hhmm, localTZ } from './sesiones';
/* =====================================================================
   MÓDULO 0 · LOS MERCADOS FINANCIEROS
   ===================================================================== */
const MK = [
  { n: 'Forex', s: 'Divisas · el mercado más grande', d: { 'Qué se negocia': 'Pares de divisas: compras una moneda vendiendo otra (EUR/USD = cuántos dólares vale 1 euro).', 'Dónde': 'OTC: red de bancos, ECN y brokers. Mueve unos 9,6 billones de dólares al día (encuesta trienal del BIS, abril de 2025).', 'Horario': '24 h, de domingo ~17:00 a viernes 17:00 (Nueva York).', 'Ejemplos': 'Principales: EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD, NZD/USD. Cruces: EUR/JPY, GBP/JPY…', 'Apalancamiento': 'Alto. Minoristas: 30:1 en pares principales en la UE, 50:1 en EE. UU.; otros brokers ofrecen mucho más (y es más peligroso).', 'Volumen': 'De ticks (no hay volumen centralizado).', 'A favor': 'Liquidez enorme, spreads bajos en los principales, abierto casi todo el día.', 'En contra': 'Apalancamiento fácil de abusar, saltos en noticias, calidad del broker variable.', 'Con esta guía': 'Sesiones y killzones, CRT y SMT (EUR/USD–GBP/USD, DXY): es el mercado "natural" de ICT.' } },
  { n: 'Acciones', s: 'Partes de empresas', d: { 'Qué se negocia': 'Participaciones en empresas (Apple, Tesla, YPF…); pueden pagar dividendos.', 'Dónde': 'Bolsas centralizadas (NYSE, Nasdaq, BYMA…) con libro de órdenes y volumen real.', 'Horario': 'EE. UU.: 9:30–16:00 (NY), con pre-mercado (4:00–9:30) y post-mercado (16:00–20:00).', 'Ejemplos': 'AAPL, MSFT, NVDA, AMZN; ETFs como SPY o QQQ (canastas de acciones).', 'Apalancamiento': 'Bajo: cuentas de margen en EE. UU. típicamente 2:1; CFD sobre acciones en la UE, 5:1.', 'Volumen': 'Real y público.', 'A favor': 'Información pública (resultados, noticias), volumen real, sirve también para invertir a largo plazo.', 'En contra': 'Huecos (gaps) en la apertura por resultados o noticias; horario limitado; riesgo de cada empresa.', 'Con esta guía': 'Volumen, VWAP y perfil de volumen brillan aquí; estructura y liquidez funcionan igual.' } },
  { n: 'Índices', s: 'Cestas de acciones', d: { 'Qué se negocia': 'Un número que resume una cesta de acciones (S&P 500, Nasdaq 100, Dow Jones, DAX…).', 'Dónde': 'No se compran directamente: se operan con futuros (ES, NQ, YM), ETFs (SPY, QQQ) o CFD.', 'Horario': 'Futuros casi 24 h (domingo 18:00 – viernes 17:00 NY, pausa diaria 17–18); el contado, 9:30–16:00 NY.', 'Ejemplos': 'S&P 500 (US500), Nasdaq 100 (NAS100), Dow Jones (US30), DAX (GER40).', 'Apalancamiento': 'Medio: futuros con margen; CFD en la UE, 20:1 en índices principales.', 'Volumen': 'Real en futuros y ETFs.', 'A favor': 'Muy líquidos, diversificados, con movimientos claros en la sesión de NY.', 'En contra': 'Movimientos violentos en la apertura de NY (9:30) y en datos macro.', 'Con esta guía': 'SMT ES–NQ–YM, killzone de NY y CRT en 1H/4H: combinación muy popular.' } },
  { n: 'Futuros', s: 'Contratos de bolsa', d: { 'Qué se negocia': 'Contratos estandarizados para comprar o vender algo en una fecha futura a un precio pactado hoy.', 'Dónde': 'Bolsas como CME: precio y volumen únicos para todos.', 'Horario': 'CME Globex: domingo 18:00 – viernes 17:00 (NY), con pausa diaria de 17:00 a 18:00.', 'Ejemplos': 'ES, NQ, CL (petróleo), GC (oro), 6E (euro), ZN (bono a 10 años).', 'Apalancamiento': 'Integrado: depositas un margen y controlas el contrato completo.', 'Volumen': 'Real y centralizado.', 'A favor': 'Transparencia, volumen real, costos bajos; los micros permiten empezar con poco.', 'En contra': 'Vencimientos y rollover; valor por tick alto en los contratos grandes.', 'Con esta guía': 'Volumen y perfil de volumen fiables; muchas cuentas de fondeo (prop firms) operan futuros.' } },
  { n: 'Materias primas', s: 'Energía, metales y agro', d: { 'Qué se negocia': 'Energía (petróleo, gas), metales (oro, plata, cobre) y agrícolas (trigo, maíz, soja).', 'Dónde': 'Sobre todo futuros (CME, NYMEX, COMEX, ICE); también CFD, ETFs y oro al contado (XAU/USD).', 'Horario': 'Similar a los futuros; el oro al contado sigue al forex.', 'Ejemplos': 'Oro (XAU/USD, GC), plata (XAG/USD), petróleo WTI (CL) y Brent.', 'Apalancamiento': 'CFD minoristas en la UE: oro 20:1, otras materias primas 10:1.', 'Volumen': 'Real en futuros.', 'A favor': 'Movimientos amplios; relación con el dólar y la inflación; el oro como refugio.', 'En contra': 'Muy sensibles a inventarios, geopolítica y clima; el petróleo puede ser muy volátil.', 'Con esta guía': 'SMT oro–plata; las sesiones de Londres y Nueva York importan.' } },
  { n: 'Criptomonedas', s: '24/7 y muy volátil', d: { 'Qué se negocia': 'Activos digitales: bitcoin, ether, stablecoins (atadas al dólar)…', 'Dónde': 'Exchanges centralizados (cada uno con su libro) y descentralizados. Al contado y con derivados como los perpetuos, que no vencen y usan un pago periódico ("funding") entre largos y cortos para seguir al contado.', 'Horario': '24/7, incluidos fines de semana.', 'Ejemplos': 'BTC, ETH, SOL; perpetuos BTCUSDT.', 'Apalancamiento': 'Muy variable: CFD cripto en la UE 2:1 para minoristas; algunos exchanges ofrecen 50x–100x (extremadamente arriesgado).', 'Volumen': 'Fragmentado: cada exchange tiene el suyo.', 'A favor': 'Siempre abierto, mucha volatilidad (oportunidades), barrera de entrada baja.', 'En contra': 'Volatilidad muy alta, riesgo de exchange y custodia, regulación desigual, mechas extremas y liquidaciones en cascada.', 'Con esta guía': 'La liquidez (barridos de stops y liquidaciones de posiciones apalancadas) se ve con mucha claridad; SMT BTC–ETH.' } },
  { n: 'Bonos y tasas', s: 'El precio del dinero', d: { 'Qué se negocia': 'Deuda de gobiernos y empresas. El rendimiento (yield) se mueve al revés que el precio del bono.', 'Dónde': 'Mayormente OTC; futuros de bonos en CME (ZN, ZB).', 'Horario': 'Los futuros, como en CME.', 'Ejemplos': 'Bono del Tesoro de EE. UU. a 10 años (US10Y), Bund alemán.', 'Apalancamiento': 'Futuros con margen.', 'Volumen': 'Real en futuros.', 'A favor': 'Marcan el costo del dinero: ayudan a entender divisas e índices.', 'En contra': 'Conceptos más técnicos (duración, curva de tipos).', 'Con esta guía': 'Úsalos como contexto: rendimientos al alza suelen fortalecer al dólar.' } },
  { n: 'Opciones', s: 'Derechos, no obligaciones', d: { 'Qué se negocia': 'El derecho (no la obligación) de comprar (call) o vender (put) un activo a un precio (strike) hasta una fecha, pagando una prima.', 'Dónde': 'Bolsas (CBOE, CME) a través de brokers.', 'Horario': 'El de su subyacente.', 'Ejemplos': 'Calls y puts sobre acciones, índices (SPX) y futuros.', 'Apalancamiento': 'Implícito: la prima es pequeña frente al tamaño que controla.', 'Volumen': 'Real; su precio depende además de la volatilidad implícita.', 'A favor': 'Al comprar, la pérdida máxima es la prima; estrategias muy flexibles.', 'En contra': 'El paso del tiempo erosiona su valor; más complejas; vender opciones puede implicar riesgos enormes.', 'Con esta guía': 'Es un mundo aparte: esta guía no cubre su valoración.' } },
  { n: 'CFD', s: 'Contratos por diferencias', d: { 'Qué se negocia': 'Un contrato con tu broker por la diferencia de precio: ganas o pierdes la variación sin poseer el activo.', 'Dónde': 'OTC: tu contraparte es el broker. No están permitidos para minoristas en EE. UU.', 'Horario': 'El del subyacente (con pausas propias del broker).', 'Ejemplos': 'US500, NAS100, XAUUSD, acciones, cripto y forex vía CFD.', 'Apalancamiento': 'UE (minoristas): 30:1 divisas principales; 20:1 otros pares, oro e índices principales; 10:1 otras materias primas e índices; 5:1 acciones; 2:1 cripto.', 'Volumen': 'El del broker (de ticks).', 'A favor': 'Acceso fácil a muchos mercados con poco capital y tamaños pequeños.', 'En contra': 'Costo de financiación nocturna, riesgo de contraparte, precios propios del broker.', 'Con esta guía': 'Todo aplica al gráfico, pero el volumen no es el del mercado real.' } }
];
let mkSel = 0;
function renderMK() {
  const host = $('#mk-cards'); if (!host) return;
  host.innerHTML = '';
  MK.forEach((m, i) => {
    const b = document.createElement('button'); b.className = 'g-item'; b.style.cssText = 'cursor:pointer;color:inherit;font:inherit;text-align:left' + (i === mkSel ? ';border-color:var(--accent);background:var(--surface-2)' : '');
    const t = document.createElement('b'); t.textContent = m.n; b.appendChild(t);
    const s = document.createElement('small'); s.textContent = m.s; b.appendChild(s);
    b.addEventListener('click', () => { mkSel = i; renderMK(); });
    host.appendChild(b);
  });
  const m = MK[mkSel], det = $('#mk-detail');
  det.innerHTML = `<h4 style="margin-bottom:6px">${m.n}</h4>` + Object.entries(m.d).map(([k, v]) => `<div style="margin:4px 0"><strong>${k}:</strong> ${v}</div>`).join('');
}

/* --- libro de órdenes --- */
const book = { mode: 'deep' };
function bookLevels(mode) {
  const r = mulberry32(mode === 'deep' ? 11 : 12), deep = mode === 'deep', tick = deep ? 0.01 : 0.03, asks = [], bids = [];
  for (let k = 0; k < 12; k++) {
    asks.push({ p: 100.01 + k * tick + (deep ? 0 : 0.02), q: deep ? Math.round(6 + r() * 9) : Math.round(1 + r() * 3) });
    bids.push({ p: 100.00 - k * tick - (deep ? 0 : 0.02), q: deep ? Math.round(6 + r() * 9) : Math.round(1 + r() * 3) });
  }
  return { asks, bids };
}
const renderBook = fig(function () {
  const host = $('#fig-book'); if (!host) return;
  const { asks, bids } = bookLevels(book.mode), q = +$('#lb-q').value;
  $('#lb-q-v').textContent = q + ' lotes';
  let rem = q, cost = 0, used = 0, last = asks[0].p; const take = [];
  for (const a of asks) { if (rem <= 0) break; const x = Math.min(rem, a.q); take.push(x); cost += x * a.p; rem -= x; used++; last = a.p; }
  const filled = q - rem, avg = filled ? cost / filled : asks[0].p;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const rows = 24, rh = 15, W = 900, H = rows * rh + 30, cx = 450, maxQ = Math.max(...asks.concat(bids).map(x => x.q)), sc = 300 / Math.max(15, maxQ);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Libro de órdenes' });
  host.insertBefore(svg, host.firstChild);
  txt(svg, cx - 60, 14, 'Compras en espera (bids)', { 'text-anchor': 'end', fill: COL.muted, 'font-size': 11 });
  txt(svg, cx + 60, 14, 'Ventas en espera (asks)', { fill: COL.muted, 'font-size': 11 });
  asks.slice().reverse().forEach((a, j) => {
    const idx = asks.length - 1 - j, y = 22 + j * rh, t = take[idx] || 0;
    el('rect', { x: cx + 40, y, width: a.q * sc, height: rh - 3, rx: 2, fill: COL.down, 'fill-opacity': 0.35 }, svg);
    if (t) el('rect', { x: cx + 40, y, width: t * sc, height: rh - 3, rx: 2, fill: COL.liq, 'fill-opacity': 0.9 }, svg);
    txt(svg, cx, y + 10, a.p.toFixed(2), { 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': 'Consolas, monospace', fill: t ? COL.text : COL.text2 });
    txt(svg, cx + 46 + a.q * sc, y + 10, String(a.q), { fill: COL.muted, 'font-size': 10 });
  });
  bids.forEach((b, j) => {
    const y = 22 + (12 + j) * rh;
    el('rect', { x: cx - 40 - b.q * sc, y, width: b.q * sc, height: rh - 3, rx: 2, fill: COL.up, 'fill-opacity': 0.35 }, svg);
    txt(svg, cx, y + 10, b.p.toFixed(2), { 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': 'Consolas, monospace', fill: COL.text2 });
    txt(svg, cx - 46 - b.q * sc, y + 10, String(b.q), { 'text-anchor': 'end', fill: COL.muted, 'font-size': 10 });
  });
  el('line', { x1: cx - 380, x2: cx + 380, y1: 22 + 12 * rh - 2, y2: 22 + 12 * rh - 2, stroke: COL.axis }, svg);
  const slipT = Math.round((avg - asks[0].p) / 0.01);
  $('#lb-out').innerHTML = [['Mejor ask', asks[0].p.toFixed(2)], ['Precio medio de tu compra', avg.toFixed(4)], ['Peor precio pagado', last.toFixed(2)], ['Niveles consumidos', used], ['Deslizamiento medio', slipT + ' ticks de 0,01']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  $('#lb-explain').innerHTML = (rem > 0 ? `<strong>No hay suficiente oferta visible:</strong> quedan ${rem} lotes sin ejecutar. ` : '') +
    (book.mode === 'deep' ? `Con mucha profundidad, comprar ${q} lotes apenas mueve el precio: pagas de media ${avg.toFixed(4)}, muy cerca del mejor ask.` : `Con poca profundidad, la misma orden "barre" varios niveles: pagas de media ${avg.toFixed(4)}, ${slipT} ticks peor que el mejor ask. Así se ven los mercados poco líquidos y las noticias: el precio salta.`) +
    ' Fíjate en el paralelo con la liquidez de los stops: quien necesita ejecutar mucho va a buscar zonas con muchas órdenes.';
});

/* --- horario semanal --- */
const mkW = { tz: 'local' };
const NYH = { forex: d => d >= 1 && d <= 4 ? [[0, 24]] : d === 5 ? [[0, 17]] : d === 0 ? [[17, 24]] : [], cme: d => d >= 1 && d <= 4 ? [[0, 17], [18, 24]] : d === 5 ? [[0, 17]] : d === 0 ? [[18, 24]] : [],
  stocks: d => d >= 1 && d <= 5 ? [[9.5, 16]] : [], ext: d => d >= 1 && d <= 5 ? [[4, 9.5], [16, 20]] : [], crypto: () => [[0, 24]] };
function nyIntervals(rule, fromMs, toMs) {
  const out = [], w0 = wall('America/New_York', fromMs - 86400000);
  for (let k = 0; k < 10; k++) {
    const dd = new Date(Date.UTC(w0.y, w0.mo - 1, w0.d + k)), Y = dd.getUTCFullYear(), M = dd.getUTCMonth() + 1, D = dd.getUTCDate(), dow = dd.getUTCDay();
    rule(dow).forEach(([a, b]) => {
      const s = zonedToUtc('America/New_York', Y, M, D, Math.floor(a), Math.round((a % 1) * 60));
      const e = b >= 24 ? zonedToUtc('America/New_York', ...(() => { const n = new Date(Date.UTC(Y, M - 1, D + 1)); return [n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate(), 0, 0]; })()) : zonedToUtc('America/New_York', Y, M, D, Math.floor(b), Math.round((b % 1) * 60));
      if (e > fromMs && s < toMs) out.push([Math.max(s, fromMs), Math.min(e, toMs)]);
    });
  }
  return out;
}
const renderWeek = fig(function () {
  const host = $('#fig-mk-week'); if (!host) return;
  const tz = mkW.tz === 'local' ? localTZ : mkW.tz, now = Date.now(), w = wall(tz, now);
  const dow = new Date(Date.UTC(w.y, w.mo - 1, w.d)).getUTCDay(), back = (dow + 6) % 7, m0 = new Date(Date.UTC(w.y, w.mo - 1, w.d - back));
  const start = zonedToUtc(tz, m0.getUTCFullYear(), m0.getUTCMonth() + 1, m0.getUTCDate(), 0, 0), WEEK = 7 * 86400000, end = start + WEEK;
  const rowsDef = [['Forex', [['forex', 0.85]], '#3987e5'], ['Futuros CME', [['cme', 0.85]], '#d95926'], ['Acciones EE. UU.', [['ext', 0.3], ['stocks', 0.9]], '#199e70'], ['Cripto', [['crypto', 0.85]], '#c98500']];
  host.querySelectorAll('svg').forEach(s => s.remove());
  const W = 900, L = 130, R = 10, T = 30, rh = 36, H = T + rowsDef.length * rh + 34;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Horario semanal de los mercados' });
  host.insertBefore(svg, host.firstChild);
  const X = ms => L + (ms - start) / WEEK * (W - L - R), days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  for (let k = 0; k <= 7; k++) {
    const x = L + k / 7 * (W - L - R);
    el('line', { x1: x, x2: x, y1: T - 8, y2: H - 28, stroke: COL.axis }, svg);
    if (k < 7) { const dd = new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth(), m0.getUTCDate() + k)); txt(svg, x + (W - L - R) / 14, H - 12, days[k] + ' ' + dd.getUTCDate(), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11 }); }
  }
  const status = [];
  rowsDef.forEach(([name, parts, col], ri) => {
    const y = T + ri * rh;
    txt(svg, 10, y + rh / 2 + 3, name, { 'font-size': 12, 'font-weight': 600 });
    let openNow = false;
    parts.forEach(([key, op]) => nyIntervals(NYH[key], start, end).forEach(([a, b]) => {
      el('rect', { x: X(a), y: y + 6, width: Math.max(1.5, X(b) - X(a)), height: rh - 12, rx: 3, fill: col, 'fill-opacity': op }, svg);
      if (key !== 'ext' && now >= a && now < b) openNow = true;
    }));
    status.push([name, openNow]);
  });
  const xn = X(now);
  el('line', { x1: xn, x2: xn, y1: T - 10, y2: H - 28, stroke: COL.text, 'stroke-width': 2 }, svg);
  tag(svg, xn, T - 16, 'Ahora ' + hhmm(tz, now), COL.text, 'middle');
  $('#mk-week-now').innerHTML = `Ahora (${hhmm(tz, now)}${mkW.tz === 'local' ? ', tu hora local' : ' NY'}): ` + status.map(([n, o]) => `${n} <strong>${o ? 'abierto' : 'cerrado'}</strong>`).join(' · ') + '. Zona horaria: ' + (mkW.tz === 'local' ? localTZ : 'America/New_York') + '.';
});

/* --- volatilidad comparada --- */
const MKV = [['EUR/USD', 7, '#3987e5'], ['S&P 500', 17, '#d95926'], ['Nasdaq 100', 22, '#199e70'], ['Oro', 15, '#c98500'], ['Petróleo WTI', 35, '#d55181'], ['Bitcoin', 55, '#9085e9']];
const mkv = { seed: 3, on: [true, true, true, true, true, true] };
const renderMKV = fig(function () {
  const host = $('#fig-mk-vol'); if (!host) return;
  const r = mulberry32(mkv.seed), N = 252, series = MKV.map(([, va]) => {
    const sd = va / 100 / Math.sqrt(252); let lp = 0; const out = [0];
    for (let t = 1; t <= N; t++) { lp += sd * gauss(r) - 0.5 * sd * sd; out.push((Math.exp(lp) - 1) * 100); }
    return out;
  });
  const vis = series.filter((_, i) => mkv.on[i]), all = [].concat(...vis);
  const lo = Math.min(-5, ...all), hi = Math.max(5, ...all), pd = (hi - lo) * 0.06;
  const C = chart(host, { n: N + 1, panels: [{ h: 300, yMin: lo - pd, yMax: hi + pd, fmt: v => (v > 0 ? '+' : '') + v.toFixed(0) + '%', ticks: 6 }], aria: 'Volatilidad comparada de mercados' });
  const P = C.panels[0];
  hline(C, P, 0, { color: COL.muted, width: 1, dash: '2 4' });
  series.forEach((s, i) => { if (mkv.on[i]) lineSeries(C, P, s, { color: MKV[i][2], width: 2 }); });
  hover(C, t => [['#', 'Día ' + t]].concat(MKV.map(([nm], i) => mkv.on[i] ? [nm, (series[i][t] >= 0 ? '+' : '') + series[i][t].toFixed(1) + '%'] : null).filter(Boolean)));
  $('#mk-vol-legend').innerHTML = MKV.map(([nm, , c], i) => mkv.on[i] ? `<span><i style="background:${c}"></i>${nm}</span>` : '').join('');
  const t = document.createElement('table'); t.className = 't wide';
  const hr = t.createTHead().insertRow(); ['Mercado', 'Volatilidad anual aprox.', 'Movimiento diario típico', 'Posición para arriesgar $100 con stop = 1 día típico'].forEach(h => { const th = document.createElement('th'); th.textContent = h; hr.appendChild(th); });
  const tb = t.createTBody();
  const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  MKV.forEach(([nm, va]) => { const dm = va / Math.sqrt(252), tr = tb.insertRow(); [nm, va + '%', '±' + dm.toFixed(2).replace('.', ',') + '%', '$' + miles(100 / (dm / 100))].forEach(v => { const td = tr.insertCell(); td.textContent = v; }); });
  $('#mk-vol-table').replaceChildren(t);
});

/* --- calculadora de futuros --- */
const FUT = [['ES', 'S&P 500 E-mini', 0.25, 12.5, 10], ['MES', 'S&P 500 Micro', 0.25, 1.25, 10], ['NQ', 'Nasdaq 100 E-mini', 0.25, 5, 40], ['MNQ', 'Nasdaq 100 Micro', 0.25, 0.5, 40], ['YM', 'Dow E-mini', 1, 5, 100], ['6E', 'Euro FX', 0.00005, 6.25, 0.005], ['GC', 'Oro', 0.1, 10, 10], ['MGC', 'Oro Micro', 0.1, 1, 10], ['CL', 'Petróleo WTI', 0.01, 10, 1]];
function renderFut() {
  const c = FUT[+$('#fu-c').value], mv = +$('#fu-mv').value, n = Math.max(1, +$('#fu-n').value || 1);
  const ticks = mv / c[2], usd = ticks * c[3] * n, perPoint = c[3] / c[2];
  $('#fu-out').innerHTML = [['Ticks', ticks.toFixed(0)], ['Valor de 1 tick', '$' + c[3].toFixed(2)], ['Valor de 1 unidad de precio', '$' + perPoint.toLocaleString('es')], ['Resultado', (usd >= 0 ? '+$' : '−$') + Math.abs(usd).toLocaleString('es', { maximumFractionDigits: 2 })]]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
}

function initMercados() {
  renderMK();
  segBind($('#mk-libro'), (k, v) => { book.mode = v; renderBook(); });
  $('#lb-q').addEventListener('input', renderBook); renderBook();
  segBind($('#mk-horarios'), (k, v) => { mkW.tz = v; renderWeek(); });
  renderWeek(); setInterval(() => { if ($('#m-mercados').classList.contains('active')) renderWeek(); }, 60000);
  const ctrl = $('#mk-vol-ctrl');
  MKV.forEach(([nm], i) => { const l = document.createElement('label'); l.className = 'grp'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = true; cb.addEventListener('change', () => { mkv.on[i] = cb.checked; renderMKV(); }); l.appendChild(cb); l.appendChild(document.createTextNode(' ' + nm)); ctrl.appendChild(l); });
  $('#mk-vol-new').addEventListener('click', () => { mkv.seed = newSeed(); renderMKV(); });
  renderMKV();
  const sel = $('#fu-c'); FUT.forEach(([s, d], i) => { const o = document.createElement('option'); o.value = i; o.textContent = s + ' · ' + d; sel.appendChild(o); });
  sel.addEventListener('change', () => { $('#fu-mv').value = FUT[+sel.value][4]; $('#fu-mv').step = FUT[+sel.value][2]; renderFut(); });
  ['#fu-mv', '#fu-n'].forEach(s => $(s).addEventListener('input', renderFut)); renderFut();
  quiz($('#mercados-quiz'), 'Práctica: los mercados', QUIZZES["mercados"].qs);
}

export { MK, mkSel, renderMK, book, bookLevels, renderBook, mkW, NYH, nyIntervals, renderWeek, MKV, mkv, renderMKV, FUT, renderFut, initMercados };
