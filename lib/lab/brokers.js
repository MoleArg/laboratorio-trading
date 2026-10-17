// Motor interactivo · brokers, prop firms y estafas (checklist, costos y simulador de evaluación).
import { QUIZZES } from './shared';
import { $, $$, COL, el, fig, mulberry32, newSeed, quiz, segBind, segVal, txt } from './core';
import { money, pctS, stats, svgIn } from './kit';

/* --- checklist de confiabilidad --- */
const BR_CHECK = [
  [3, 'Regulado por una autoridad exigente (FCA, ASIC, NFA/CFTC, BaFin, CySEC…) y lo verifiqué en el registro del regulador, no en su web'],
  [2, 'Fondos de clientes en cuentas segregadas'],
  [2, 'Protección de saldo negativo (no puedo deber más de lo que deposité)'],
  [2, 'Retiros por el mismo medio del depósito, en plazos razonables, con opiniones verificables'],
  [1, 'Costos publicados: spread típico, comisiones, swap y tarifas de inactividad'],
  [1, 'Años operando y empresa con dirección física identificable'],
  [1, 'Permite cuenta demo y tamaños mínimos para probar']
];
const BR_FLAGS = [
  'Promete rentabilidades fijas o "sin riesgo"',
  'Un "gestor" te escribe por WhatsApp/Telegram para operar por ti',
  'Te presiona para depositar más o para no retirar',
  'Bono de depósito que bloquea los retiros hasta mover X lotes',
  'Solo regulación en una isla offshore (o ninguna)',
  'Para retirar te piden pagar primero un "impuesto" o "comisión de liberación"'
];
function renderBrCheck() {
  const ok = $$('#br-check input'), fl = $$('#br-flags input');
  const score = BR_CHECK.reduce((s, [w], i) => s + (ok[i].checked ? w : 0), 0), max = BR_CHECK.reduce((s, [w]) => s + w, 0), flags = fl.filter(c => c.checked).length;
  $('#br-meter').style.width = (score / max * 100) + '%';
  const ex = $('#br-explain');
  if (flags) { ex.className = 'explain bad'; ex.innerHTML = `<strong>${flags} señal(es) de alarma.</strong> Cualquiera de ellas basta para no depositar, sin importar cuántas casillas verdes tenga. Las dos últimas son típicas de estafas: nadie legítimo cobra para devolverte tu dinero.`; }
  else if (!ok[0].checked) { ex.className = 'explain bad'; ex.innerHTML = 'Sin regulación verificada en el registro oficial, el resto de casillas es la palabra del broker contra la tuya.'; }
  else { ex.className = 'explain ' + (score >= max - 2 ? 'good' : ''); ex.innerHTML = `Puntuación ${score} de ${max}. ${score >= max - 2 ? 'Perfil razonable. Aun así, empieza con un depósito pequeño y haz un retiro de prueba.' : 'Faltan garantías importantes: revisa segregación, saldo negativo y retiros.'}`; }
}

/* --- costos reales --- */
const COST_IN = ['sp', 'co', 'sw', 'ni'];
function brokerCost(side, common) {
  const g = k => +$(`#bc-${side}-${k}`).value || 0;
  const perTrade = common.lots * (g('sp') * 10 + g('co') + g('sw') * g('ni'));
  return { perTrade, month: perTrade * common.n, year: perTrade * common.n * 12, inR: perTrade / common.risk, sp: g('sp') * 10 * common.lots, co: g('co') * common.lots, sw: g('sw') * g('ni') * common.lots };
}
const renderCost = fig(function () {
  const host = $('#fig-br-cost'); if (!host) return;
  const common = { n: +$('#bc-n').value || 0, lots: +$('#bc-lots').value || 0, risk: +$('#bc-risk').value || 1 };
  const A = brokerCost('a', common), B = brokerCost('b', common), W = 900, H = 170, svg = svgIn(host, W, H, 'Costo anual por broker');
  const mx = Math.max(A.year, B.year, 1), L = 110;
  [['Broker A', A, 30], ['Broker B', B, 95]].forEach(([n, c, y]) => {
    txt(svg, L - 10, y + 22, n, { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700 });
    let x = L; [['sp', COL.range, 'spread'], ['co', COL.liq, 'comisión'], ['sw', COL.ob, 'swap']].forEach(([k, col, lab]) => {
      const w = c[k] * common.n * 12 / mx * (W - L - 150);
      if (w > 0) { el('rect', { x, y, width: w, height: 34, fill: col, 'fill-opacity': 0.8 }, svg); if (w > 60) txt(svg, x + 6, y + 21, lab, { fill: '#fff', 'font-size': 10.5, 'font-weight': 600 }); }
      x += w;
    });
    txt(svg, x + 8, y + 22, money(c.year) + ' / año', { 'font-size': 12, 'font-weight': 700 });
  });
  $('#bc-out').innerHTML = stats([['Costo por operación A', money(A.perTrade, 2)], ['Costo por operación B', money(B.perTrade, 2)], ['En R (A / B)', A.inR.toFixed(2) + 'R / ' + B.inR.toFixed(2) + 'R'], ['Diferencia anual', money(Math.abs(A.year - B.year))]]);
  const worst = Math.max(A.inR, B.inR);
  $('#bc-explain').innerHTML = `Con ${common.n} operaciones al mes, el broker más caro se lleva <strong>${worst.toFixed(2)}R por operación</strong>. ` +
    (worst > 0.1 ? 'Si tu sistema gana +0,2R de media, eso es más de la mitad de tu ventaja. Los costos importan más cuanto más corto es tu stop y más operas.' : 'Es un costo bajo para tu tamaño de stop.') +
    ' "Sin comisiones" suele significar spread más ancho: compara siempre el costo total.';
});

/* --- simulador de evaluación de prop firm --- */
const pf = { seed: 9 };
function simChallenge(o) {
  const r = mulberry32(o.seed), S = 3000, res = { pass: 0, daily: 0, max: 0, time: 0, days: [] };
  for (let s = 0; s < S; s++) {
    let eq = 100, peak = 100, floor = 100 - o.maxDD, out = null;
    for (let d = 1; d <= o.days && !out; d++) {
      const start = eq;
      for (let t = 0; t < o.perDay; t++) {
        eq += (r() < o.wr ? o.rr : -1) * o.risk;
        if (o.trailing) { if (eq > peak) { peak = eq; floor = Math.min(100, peak - o.maxDD); } }
        if (eq <= floor) { out = 'max'; break; }
        if (start - eq >= o.dayDD) { out = 'daily'; break; }
        if (eq >= 100 + o.target) { out = 'pass'; res.days.push(d); break; }
      }
    }
    res[out || 'time']++;
  }
  ['pass', 'daily', 'max', 'time'].forEach(k => { res[k] /= S; });
  res.days.sort((a, b) => a - b);
  return res;
}
const PF_IN = ['#pf-tg', '#pf-dd', '#pf-mx', '#pf-rk', '#pf-wr', '#pf-rr', '#pf-pd', '#pf-dy', '#pf-fee'];
const renderProp = fig(function () {
  const host = $('#fig-br-prop'); if (!host) return;
  const o = { target: +$('#pf-tg').value, dayDD: +$('#pf-dd').value, maxDD: +$('#pf-mx').value, risk: +$('#pf-rk').value / 4, wr: +$('#pf-wr').value / 100, rr: +$('#pf-rr').value / 4,
    perDay: +$('#pf-pd').value, days: +$('#pf-dy').value, trailing: (segVal($('#br-prop'), 'pf-mode') || 'static') === 'trail', seed: pf.seed };
  const fee = +$('#pf-fee').value;
  $('#pf-tg-v').textContent = o.target + '%'; $('#pf-dd-v').textContent = o.dayDD + '%'; $('#pf-mx-v').textContent = o.maxDD + '%'; $('#pf-rk-v').textContent = o.risk.toFixed(2) + '%';
  $('#pf-wr-v').textContent = Math.round(o.wr * 100) + '%'; $('#pf-rr-v').textContent = '1 : ' + o.rr.toFixed(2); $('#pf-pd-v').textContent = o.perDay; $('#pf-dy-v').textContent = o.days + ' días'; $('#pf-fee-v').textContent = '$' + fee;
  const res = simChallenge(o), W = 900, H = 90, svg = svgIn(host, W, H, 'Resultado de 3 000 evaluaciones simuladas');
  let x = 10; const segs = [['pass', COL.up, 'Aprueba'], ['daily', COL.ob, 'Pierde por límite diario'], ['max', COL.down, 'Pierde por drawdown máximo'], ['time', COL.muted, 'Se acaba el tiempo']];
  segs.forEach(([k, col, lab]) => {
    const w = res[k] * (W - 20); if (w <= 0) return;
    el('rect', { x, y: 20, width: w, height: 40, fill: col, 'fill-opacity': 0.85 }, svg);
    if (w > 110) txt(svg, x + 8, 45, lab + ' ' + pctS(res[k]), { fill: '#fff', 'font-size': 11.5, 'font-weight': 700 });
    else if (w > 36) txt(svg, x + 4, 45, pctS(res[k]), { fill: '#fff', 'font-size': 11, 'font-weight': 700 });
    x += w;
  });
  txt(svg, 10, 80, 'Verde: aprueba · naranja: límite diario · rojo: drawdown máximo · gris: tiempo agotado', { fill: COL.muted, 'font-size': 10.5 });
  const E = o.wr * o.rr - (1 - o.wr), med = res.days.length ? res.days[Math.floor(res.days.length / 2)] : null;
  $('#pf-out').innerHTML = stats([['Aprueba', pctS(res.pass, 1)], ['Días típicos hasta aprobar', med ?? '—'], ['Expectativa del sistema', (E >= 0 ? '+' : '') + E.toFixed(2) + 'R'], ['Costo esperado por aprobación', res.pass ? money(fee / res.pass) : '∞']]);
  const ex = $('#pf-explain');
  ex.className = 'explain ' + (res.pass > 0.4 ? 'good' : 'bad');
  ex.innerHTML = (E <= 0 ? 'Con expectativa negativa solo aprueba quien tiene suerte: la evaluación es una lotería que pagas tú. '
    : `Aun con un sistema ganador (${(E >= 0 ? '+' : '') + E.toFixed(2)}R), ${pctS(1 - res.pass)} de los intentos fallan. `) +
    (o.risk >= 1.5 ? 'Arriesgar mucho por operación acerca el objetivo, pero el límite diario y el drawdown máximo te eliminan antes. ' : 'Con riesgo bajo casi nadie toca los límites, pero muchos no llegan al objetivo a tiempo. ') +
    (o.trailing ? 'El drawdown <strong>trailing</strong> sube con tu máximo: las ganancias iniciales no te dan colchón.' : 'Con drawdown estático el suelo no se mueve: cada ganancia te aleja de él.') +
    ' El negocio de muchas prop firms son las tarifas de evaluación de quienes no aprueban.';
});

function initBrokers() {
  const host = $('#br-check'), fh = $('#br-flags');
  BR_CHECK.forEach(([w, s]) => { const l = document.createElement('label'); const c = document.createElement('input'); c.type = 'checkbox'; c.addEventListener('change', renderBrCheck); l.appendChild(c); const sp = document.createElement('span'); sp.textContent = (w >= 3 ? '★ ' : '') + s; l.appendChild(sp); host.appendChild(l); });
  BR_FLAGS.forEach(s => { const l = document.createElement('label'); const c = document.createElement('input'); c.type = 'checkbox'; c.addEventListener('change', renderBrCheck); l.appendChild(c); const sp = document.createElement('span'); sp.textContent = '⚠ ' + s; l.appendChild(sp); fh.appendChild(l); });
  renderBrCheck();
  ['#bc-n', '#bc-lots', '#bc-risk'].concat(['a', 'b'].flatMap(s => COST_IN.map(k => `#bc-${s}-${k}`))).forEach(s => $(s).addEventListener('input', renderCost));
  renderCost();
  PF_IN.forEach(s => $(s).addEventListener('input', renderProp));
  segBind($('#br-prop'), () => renderProp());
  $('#pf-new').addEventListener('click', () => { pf.seed = newSeed(); renderProp(); });
  renderProp();
  quiz($('#brokers-quiz'), 'Práctica: brokers, prop firms y estafas', QUIZZES.brokers.qs);
}

export { BR_CHECK, BR_FLAGS, renderBrCheck, brokerCost, renderCost, simChallenge, renderProp, initBrokers };
