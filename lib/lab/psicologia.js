// Motor interactivo · psicología y plan de trading (sesgos, tilt, plan escrito y rutina).
import { QUIZZES } from './shared';
import { $, $$, COL, chart, el, fig, hline, hover, mulberry32, newSeed, quiz } from './core';
import { pctS, stats } from './kit';

/* --- identifica el sesgo --- */
const BIASES = ['Aversión a la pérdida', 'Efecto disposición', 'Sesgo de confirmación', 'Sesgo de recencia', 'Exceso de confianza', 'Falacia del jugador'];
const CASES = [
  ['Llevas +0,4R y cierras "para no perderlo", pero cuando una operación va −0,9R la dejas abierta esperando que vuelva.', 1, 'Cortar rápido las ganancias y dejar correr las pérdidas es el efecto disposición: el resultado medio se vuelve negativo aunque aciertes mucho.'],
  ['Ya decidiste que el EUR/USD va a subir; buscas en redes análisis alcistas y descartas los bajistas.', 2, 'Buscar solo lo que confirma tu idea. Antídoto: escribir antes de entrar qué te haría cambiar de opinión.'],
  ['Tras cinco ganadoras seguidas duplicas el tamaño: "estoy leyendo el mercado perfecto".', 4, 'Exceso de confianza. Cinco ganadoras seguidas son normales en cualquier sistema con más del 50% de acierto; no cambian la ventaja.'],
  ['Llevas seis pérdidas seguidas y piensas que "ya toca" una ganadora, así que entras sin setup.', 5, 'Falacia del jugador: cada operación es independiente. Una racha no hace más probable la siguiente ganadora.'],
  ['Dejas de usar una estrategia que ganó todo el año porque perdió las tres últimas semanas.', 3, 'Sesgo de recencia: dar más peso a lo último que pasó que a toda la muestra.'],
  ['Mueves el stop más lejos porque aceptar −1R "duele demasiado".', 0, 'Aversión a la pérdida: una pérdida pesa psicológicamente casi el doble que una ganancia igual, y la evitamos aunque cueste más.']
];
const bz = { i: 0, right: 0, done: 0 };
function renderBias() {
  const host = $('#ps-bias'); if (!host) return;
  if (bz.i >= CASES.length) {
    host.innerHTML = `<p><strong>${bz.right} de ${CASES.length}</strong> bien. Los sesgos no desaparecen por conocerlos: se controlan con reglas escritas y con el diario.</p><button class="btn" id="ps-bias-again">Repetir</button>`;
    $('#ps-bias-again').addEventListener('click', () => { bz.i = 0; bz.right = 0; renderBias(); });
    return;
  }
  const [t, a, why] = CASES[bz.i];
  host.innerHTML = `<div class="q"><p>${bz.i + 1}/${CASES.length} · ${t}</p><div class="opts">${BIASES.map((b, k) => `<button class="opt" data-k="${k}">${b}</button>`).join('')}</div><div class="fb"></div></div>`;
  $$('.opt', host).forEach(b => b.addEventListener('click', () => {
    const box = host.querySelector('.q'); if (box.dataset.done) return; box.dataset.done = '1';
    const k = +b.dataset.k, fb = host.querySelector('.fb');
    if (k === a) { bz.right++; b.classList.add('right'); fb.textContent = '✔ ' + why; } else { b.classList.add('wrong'); host.querySelectorAll('.opt')[a].classList.add('right'); fb.textContent = '✘ Era «' + BIASES[a] + '». ' + why; }
    fb.style.display = 'block';
    const nx = document.createElement('button'); nx.className = 'btn primary'; nx.textContent = 'Siguiente ▶'; nx.style.marginTop = '8px';
    nx.addEventListener('click', () => { bz.i++; renderBias(); }); box.appendChild(nx);
  }));
}

/* --- simulador de tilt --- */
const tl = { seed: 77 };
function simTilt(o) {
  const S = 800, n = 250, r = mulberry32(o.seed), mk = () => ({ p5: [], p50: [], p95: [], all: Array.from({ length: n + 1 }, () => new Float64Array(S)), ruin: 0, finals: [] });
  const res = { calm: mk(), tilt: mk(), limit: mk() };
  for (let s = 0; s < S; s++) {
    const draws = Array.from({ length: n * 3 }, () => r());
    for (const kind of ['calm', 'tilt', 'limit']) {
      let eq = 1, streak = 0, k = 0, day = 0, dayLoss = 0, mn = 1; const A = res[kind].all;
      A[0][s] = 1;
      for (let t = 1; t <= n; t++) {
        // cada 5 operaciones planificadas empieza un día nuevo
        if ((t - 1) % 5 === 0) { day++; dayLoss = 0; }
        const blocked = kind === 'limit' && dayLoss >= o.dayMax;
        if (!blocked) {
          const tilted = kind !== 'calm' && streak >= o.L;
          const risk = o.risk * (tilted ? o.mult : 1), wr = tilted ? 0.35 : 0.45, rr = tilted ? 1 : 1.5;
          const win = draws[k++] < wr;
          eq *= win ? 1 + risk * rr : 1 - risk;
          if (win) streak = 0; else { streak++; dayLoss++; }
          // operación impulsiva extra tras perder estando en tilt
          if (tilted && !win && kind !== 'calm') { const w2 = draws[k++] < 0.35; eq *= w2 ? 1 + risk : 1 - risk; if (!w2) dayLoss++; }
        }
        A[t][s] = eq; if (eq < mn) mn = eq;
      }
      if (mn <= 0.6) res[kind].ruin++;
      res[kind].finals.push(eq);
    }
  }
  const q = (a, p) => a[Math.round(p * (a.length - 1))];
  for (const kind in res) {
    const R0 = res[kind];
    R0.all.forEach(col => { const so = Array.from(col).sort((a, b) => a - b); R0.p5.push(q(so, 0.05)); R0.p50.push(q(so, 0.5)); R0.p95.push(q(so, 0.95)); });
    R0.finals.sort((a, b) => a - b); R0.ruin /= S; delete R0.all;
  }
  return res;
}
const TCOL = () => ({ calm: COL.up, tilt: COL.down, limit: COL.liq });
const renderTilt = fig(function () {
  const host = $('#fig-ps-tilt'); if (!host) return;
  const L = +$('#pt-l').value, mult = +$('#pt-m').value / 2, dayMax = +$('#pt-d').value;
  $('#pt-l-v').textContent = L + ' pérdidas'; $('#pt-m-v').textContent = '×' + mult.toFixed(1); $('#pt-d-v').textContent = dayMax + ' pérdidas';
  const res = simTilt({ seed: tl.seed, L, mult, dayMax, risk: 0.01 }), col = TCOL(), n = res.calm.p50.length;
  const yMax = Math.max(...res.calm.p95, ...res.limit.p95) * 1.05, yMin = Math.min(...res.tilt.p5) * 0.95;
  const C = chart(host, { n, panels: [{ h: 300, yMin: Math.min(0.5, yMin), yMax: Math.max(1.6, yMax), fmt: v => '$' + (v * 10).toFixed(1) + 'k', ticks: 5 }], aria: 'Capital con y sin tilt' });
  const P = C.panels[0], d = a => a.map((v, t) => (t ? 'L' : 'M') + C.x(t).toFixed(1) + ' ' + P.y(v).toFixed(1)).join('');
  hline(C, P, 1, { color: COL.muted, width: 1, dash: '2 4', label: 'Capital inicial', side: 'left' });
  for (const kind of ['tilt', 'limit', 'calm']) {
    el('path', { d: d(res[kind].p5), fill: 'none', stroke: col[kind], 'stroke-width': 1.2, 'stroke-dasharray': '4 4', 'stroke-opacity': 0.8 }, P.g.data);
    el('path', { d: d(res[kind].p50), fill: 'none', stroke: col[kind], 'stroke-width': 2.6 }, P.g.data);
  }
  const $k = v => '$' + Math.round(v * 10000).toLocaleString('es');
  hover(C, t => [['#', 'Operación ' + t], ['Disciplinado', $k(res.calm.p50[t])], ['Con tilt', $k(res.tilt.p50[t])], ['Tilt + límite diario', $k(res.limit.p50[t])]]);
  const med = k => res[k].finals[Math.floor(res[k].finals.length / 2)];
  $('#pt-out').innerHTML = stats([['Cuenta típica disciplinada', $k(med('calm'))], ['Cuenta típica con tilt', $k(med('tilt'))], ['Con tilt pero límite diario', $k(med('limit'))],
    ['Caen un 40% (disciplinado)', pctS(res.calm.ruin, 1)], ['Caen un 40% (tilt)', pctS(res.tilt.ruin, 1)], ['Caen un 40% (con límite)', pctS(res.limit.ruin, 1)]]);
  $('#pt-explain').innerHTML = `La estrategia es la misma (+0,13R por operación). Solo cambia el comportamiento: tras ${L} pérdidas seguidas, el trader en tilt multiplica el riesgo ×${mult.toFixed(1)} y mete operaciones impulsivas fuera de plan. ` +
    `El <strong>límite diario</strong> (parar tras ${dayMax} pérdidas en el día) no evita el tilt, pero le pone techo al daño.`;
});

/* --- plan de trading --- */
const PLAN_KEY = 'lt.plan';
const PLAN_FIELDS = [
  ['mkt', 'Mercados y activos'], ['hor', 'Horario en que opero'], ['tf', 'Temporalidades (sesgo / entrada)'], ['setup', 'Setups permitidos'],
  ['must', 'Condiciones obligatorias para entrar'], ['risk', 'Riesgo por operación (%)'], ['dayL', 'Pérdida máxima diaria (R)'], ['weekL', 'Pérdida máxima semanal (R)'],
  ['maxT', 'Máximo de operaciones por día'], ['mgmt', 'Gestión de la operación (stop, BE, parciales, salida)'], ['no', 'Cuándo NO opero'], ['rev', 'Revisión (cuándo y qué miro)']
];
const PLAN_DEF = { mkt: 'EUR/USD y GBP/USD', hor: 'Londres y apertura de Nueva York (04:00–12:00 hora de Buenos Aires)', tf: 'Sesgo en 4H, entrada en 15m', setup: 'CRT con barrido de un extremo del rango 4H y confirmación CISD en 15m',
  must: 'Sesgo 4H a favor · barrido y cierre dentro del rango · CISD o MSS · R:B ≥ 1:1,5', risk: '1', dayL: '2', weekL: '5', maxT: '3', mgmt: 'Stop más allá del barrido. 50% al 50% del rango y resto a break-even. Objetivo final: extremo opuesto. Cierro todo al final de la sesión de Nueva York.',
  no: 'Noticias de alto impacto (±15 min) · después de alcanzar el límite diario · cansado o enojado · viernes después de las 14:00', rev: 'Cada día: capturas y notas de cada operación. Cada domingo: métricas de la semana y una sola mejora concreta.' };
function planLoad() { try { return Object.assign({}, PLAN_DEF, JSON.parse(localStorage.getItem(PLAN_KEY) || '{}')); } catch (e) { return Object.assign({}, PLAN_DEF); } }
function planText(p) { return 'PLAN DE TRADING\n\n' + PLAN_FIELDS.map(([k, l]) => `${l}:\n  ${(p[k] || '—').trim()}`).join('\n\n') + '\n'; }
function renderPlan() {
  const p = {}; PLAN_FIELDS.forEach(([k]) => { p[k] = $('#pl-' + k).value; });
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch (e) { /* sin almacenamiento */ }
  $('#pl-out').textContent = planText(p);
  const warn = [], risk = parseFloat((p.risk || '').replace(',', '.')), dl = parseFloat((p.dayL || '').replace(',', '.')), wl = parseFloat((p.weekL || '').replace(',', '.'));
  if (!(risk > 0)) warn.push('Falta el riesgo por operación.'); else if (risk > 2) warn.push(`Arriesgar ${risk}% por operación es mucho: una racha normal de 8 pérdidas te deja un ${((1 - Math.pow(1 - risk / 100, 8)) * 100).toFixed(0)}% abajo.`);
  if (!(dl > 0)) warn.push('Falta la pérdida máxima diaria: es la regla que frena el tilt.');
  if (dl > 0 && wl > 0 && wl < dl) warn.push('El límite semanal es menor que el diario.');
  if (!(p.must || '').trim()) warn.push('Sin condiciones obligatorias, cualquier operación "vale".');
  if (!(p.no || '').trim()) warn.push('Escribe cuándo no operas: noticias, cansancio, límite alcanzado.');
  $('#pl-explain').className = 'explain ' + (warn.length ? 'bad' : 'good');
  $('#pl-explain').innerHTML = warn.length ? warn.join(' ') : 'Plan completo. Imprímelo o déjalo a la vista: sirve precisamente cuando no tienes ganas de leerlo.';
}

function initPsicologia() {
  renderBias();
  ['#pt-l', '#pt-m', '#pt-d'].forEach(s => $(s).addEventListener('change', renderTilt));
  ['#pt-l', '#pt-m', '#pt-d'].forEach(s => $(s).addEventListener('input', () => { $('#pt-l-v').textContent = $('#pt-l').value + ' pérdidas'; $('#pt-m-v').textContent = '×' + (+$('#pt-m').value / 2).toFixed(1); $('#pt-d-v').textContent = $('#pt-d').value + ' pérdidas'; }));
  $('#pt-new').addEventListener('click', () => { tl.seed = newSeed(); renderTilt(); });
  renderTilt();
  const p = planLoad();
  PLAN_FIELDS.forEach(([k]) => { const inp = $('#pl-' + k); inp.value = p[k] || ''; inp.addEventListener('input', renderPlan); });
  $('#pl-copy').addEventListener('click', () => { navigator.clipboard?.writeText($('#pl-out').textContent).then(() => { $('#pl-copy').textContent = 'Copiado ✔'; setTimeout(() => { $('#pl-copy').textContent = 'Copiar'; }, 1500); }); });
  $('#pl-dl').addEventListener('click', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([$('#pl-out').textContent], { type: 'text/plain' })); a.download = 'plan-de-trading.txt'; a.click(); URL.revokeObjectURL(a.href); });
  $('#pl-reset').addEventListener('click', () => { if (!confirm('¿Volver al plan de ejemplo? Se borra lo que escribiste.')) return; try { localStorage.removeItem(PLAN_KEY); } catch (e) { /* sin almacenamiento */ } const d = planLoad(); PLAN_FIELDS.forEach(([k]) => { $('#pl-' + k).value = d[k]; }); renderPlan(); });
  renderPlan();
  quiz($('#psicologia-quiz'), 'Práctica: psicología y plan de trading', QUIZZES.psicologia.qs);
}

export { BIASES, CASES, renderBias, simTilt, renderTilt, PLAN_FIELDS, renderPlan, initPsicologia };
