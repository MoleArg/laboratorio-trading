// Motor interactivo · sesiones. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { QUIZZES } from './shared';
import { KZ, SESS, wall, zonedToUtc } from '../time';
import { $, COL, Player, argExt, bridgePath, candlesFromPath, chart, drawCandles, el, extent, fig, hline, hover, marker, mulberry32, newSeed, ohlcRows, quiz, segBind, tag, txt, vband } from './core';
import { mirrorC } from './liquidez';
/* =====================================================================
   MÓDULO 5 · SESIONES
   ===================================================================== */
const sesState = { tz: 'local', timer: null };
const localTZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } })();
const hhmm = (tz, ms) => { const w = wall(tz, ms); return String(w.h).padStart(2, '0') + ':' + String(w.mi).padStart(2, '0'); };
const renderClock = fig(function () {
  const host = $('#fig-ses-clock'); if (!host) return;
  const tz = sesState.tz === 'local' ? localTZ : sesState.tz, now = Date.now(), w0 = wall(tz, now);
  const start = zonedToUtc(tz, w0.y, w0.mo, w0.d, 0, 0), DAY = 86400000;
  const showKZ = $('#ses-kz-on').checked;
  const rows = SESS.length + 1 + (showKZ ? 1 : 0), W = 900, L = 120, R = 20, top = 30, rh = 34, H = top + rows * rh + 30;
  host.querySelectorAll('svg').forEach(s => s.remove());
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Reloj de sesiones de mercado' });
  host.insertBefore(svg, host.firstChild);
  const X = ms => L + (ms - start) / DAY * (W - L - R);
  for (let hr = 0; hr <= 24; hr += 2) {
    const x = L + hr / 24 * (W - L - R);
    el('line', { x1: x, x2: x, y1: top - 6, y2: H - 26, stroke: COL.grid }, svg);
    txt(svg, x, H - 10, String(hr).padStart(2, '0') + 'h', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 10.5 });
  }
  txt(svg, L, 16, 'Zona horaria: ' + (sesState.tz === 'local' ? 'local (' + localTZ + ')' : tz), { fill: COL.muted, 'font-size': 11 });
  const open = [];
  const seg = (row, a, b, col, label, op) => {
    const s = Math.max(a, start), e = Math.min(b, start + DAY); if (e <= s) return;
    const y = top + row * rh;
    el('rect', { x: X(s), y: y + 4, width: Math.max(2, X(e) - X(s)), height: rh - 10, rx: 4, fill: col, 'fill-opacity': op || 0.85 }, svg);
    if (X(e) - X(s) > 70 && label) txt(svg, X(s) + 6, y + rh / 2 + 3, label, { fill: '#0b0e14', 'font-size': 10.5, 'font-weight': 700 });
  };
  SESS.forEach((s, row) => {
    txt(svg, 10, top + row * rh + rh / 2 + 3, s.n, { 'font-size': 12, 'font-weight': 600 });
    const wl = wall(s.tz, now);
    for (let off = -1; off <= 1; off++) {
      const dd = new Date(Date.UTC(wl.y, wl.mo - 1, wl.d + off));
      const a = zonedToUtc(s.tz, dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate(), s.o, 0), b = zonedToUtc(s.tz, dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate(), s.c, 0);
      seg(row, a, b, s.col, hhmm(tz, a) + '–' + hhmm(tz, b));
      if (now >= a && now < b && !open.includes(s.n)) open.push(s.n);
    }
  });
  // solapamiento Londres–NY
  const ovRow = SESS.length;
  txt(svg, 10, top + ovRow * rh + rh / 2 + 3, 'Londres + NY', { 'font-size': 12, 'font-weight': 600 });
  const wn = wall('America/New_York', now);
  for (let off = -1; off <= 1; off++) {
    const dd = new Date(Date.UTC(wn.y, wn.mo - 1, wn.d + off)), Y = dd.getUTCFullYear(), M = dd.getUTCMonth() + 1, D = dd.getUTCDate();
    const lo = zonedToUtc('Europe/London', Y, M, D, 17, 0), nyo = zonedToUtc('America/New_York', Y, M, D, 8, 0);
    if (lo > nyo) seg(ovRow, nyo, lo, COL.text2, 'Solapamiento ' + hhmm(tz, nyo) + '–' + hhmm(tz, lo), 0.6);
  }
  if (showKZ) {
    const kzRow = SESS.length + 1;
    txt(svg, 10, top + kzRow * rh + rh / 2 + 3, 'Killzones ICT', { 'font-size': 12, 'font-weight': 600 });
    for (let off = -1; off <= 1; off++) {
      const dd = new Date(Date.UTC(wn.y, wn.mo - 1, wn.d + off)), Y = dd.getUTCFullYear(), M = dd.getUTCMonth() + 1, D = dd.getUTCDate();
      KZ.forEach(([nm, a, b]) => seg(kzRow, zonedToUtc('America/New_York', Y, M, D, a, 0), zonedToUtc('America/New_York', Y, M, D, b % 24, 0) + (b === 24 ? DAY : 0), COL.fvg, nm, 0.75));
    }
  }
  const xn = X(now);
  el('line', { x1: xn, x2: xn, y1: top - 4, y2: H - 26, stroke: COL.text, 'stroke-width': 2 }, svg);
  tag(svg, xn, top - 12, 'Ahora ' + hhmm(tz, now), COL.text, 'middle');
  const nyW = wall('America/New_York', now), dow = new Date(Date.UTC(nyW.y, nyW.mo - 1, nyW.d)).getUTCDay();
  const weekend = dow === 6 || (dow === 5 && nyW.h >= 17) || (dow === 0 && nyW.h < 17);
  $('#ses-now').innerHTML = weekend ? '<strong>Mercado de divisas cerrado</strong> (fin de semana: abre el domingo ~17:00 de Nueva York).'
    : `Ahora (${hhmm(tz, now)}${sesState.tz === 'local' ? ' en tu hora local' : ''}; ${hhmm('America/New_York', now)} en Nueva York) ${open.length ? 'están abiertas: <strong>' + open.join(', ') + '</strong>.' : 'no hay ninguna sesión principal abierta.'}` +
      (open.includes('Londres') && open.includes('Nueva York') ? ' Es el solapamiento Londres–Nueva York: máxima liquidez del día.' : '');
});

/* --- un día típico --- */
const sday = { dir: 'bull', seed: 23, cs: null, k: 47 };
function buildSDay() {
  const r = mulberry32(sday.seed), per = 6;
  const W = [[0, 100], [4, 100.2], [6, 100.5], [8, 99.9], [10, 100.45], [12, 100.1], [15, 100.2], [17, 99.4], [19, 100.3], [21, 100.8], [24, 100.5], [27, 101.6], [30, 101.3], [33, 102.1], [38, 101.8], [44, 102.0], [48, 101.9]];
  sday.cs = candlesFromPath(bridgePath(W.map(([b, p]) => ({ t: b * per, p })), r, 0.045), per);
}
const sTime = k => { const m = (18 * 60 + 30 * k) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const renderSDay = fig(function () {
  const host = $('#fig-ses-day'); if (!host) return;
  if (!sday.cs) buildSDay();
  const bull = sday.dir === 'bull', cs = bull ? sday.cs : sday.cs.map(c => mirrorC(c, 100.5)), k = sday.k, n = cs.length;
  const asia = cs.slice(4, 12), AH = Math.max(...asia.map(c => c.h)), AL = Math.min(...asia.map(c => c.l));
  const [lo, hi] = extent(cs);
  const C = chart(host, { n, panels: [{ h: 300, yMin: lo, yMax: hi, dec: 1 }], padB: 22, aria: 'Un día típico por sesiones' });
  const P = C.panels[0];
  vband(C, 4, 11, { color: '#d95926', op: 0.08, label: 'Asia' }); vband(C, 16, 21, { color: '#199e70', op: 0.08, label: 'Londres' }); vband(C, 26, 33, { color: '#c98500', op: 0.08, label: 'Nueva York' });
  if (k >= 11) { hline(C, P, AH, { x1: 4, color: COL.liq, label: 'Máximo de Asia', side: 'left' }); hline(C, P, AL, { x1: 4, color: COL.liq, label: 'Mínimo de Asia', side: 'left', below: true }); }
  drawCandles(C, P, cs.map((c, j) => j <= k ? c : null));
  const sw = argExt(cs.map(c => bull ? c.l : c.h), 14, 20, bull ? 'min' : 'max');
  if (k >= sw) marker(C, P, sw, bull ? cs[sw].l : cs[sw].h, { shape: bull ? 'up' : 'down', color: COL.liq, size: 6, label: 'Judas swing: barre ' + (bull ? 'el mínimo' : 'el máximo') + ' de Asia', dy: bull ? 22 : -22 });
  hover(C, j => j > k ? null : [['#', sTime(j) + ' (NY)']].concat(ohlcRows(cs[j], 2)));
  let t;
  if (k < 12) t = '<strong>Asia (acumulación):</strong> el precio se mueve en un rango estrecho. Encima y debajo se acumula liquidez.';
  else if (k < sw + 1) t = '<strong>Apertura de Londres:</strong> llega el volumen europeo…';
  else if (k < 26) t = `<strong>Londres (manipulación):</strong> barre el ${bull ? 'mínimo' : 'máximo'} de Asia (activa stops) y gira. Quien vendió/compró la "ruptura" queda atrapado.`;
  else t = `<strong>Nueva York (distribución):</strong> la expansión continúa hacia la liquidez opuesta, por encima del ${bull ? 'máximo' : 'mínimo'} de Asia. Por la tarde el ritmo baja.`;
  $('#ses-day-explain').innerHTML = t;
});

function initSesiones() {
  segBind($('#ses-reloj'), (k, v) => { sesState.tz = v; renderClock(); });
  $('#ses-kz-on').addEventListener('change', renderClock);
  renderClock();
  sesState.timer = setInterval(() => { if ($('#m-sesiones').classList.contains('active')) renderClock(); }, 30000);
  const pl = new Player(k => { sday.k = k; renderSDay(); }, 140);
  segBind($('#ses-dia'), (k, v) => { sday.dir = v; pl.play(47, 0); });
  $('#ses-play').addEventListener('click', () => pl.play(47, 0));
  $('#ses-new').addEventListener('click', () => { sday.seed = newSeed(); buildSDay(); pl.play(47, 0); });
  renderSDay();
  quiz($('#sesiones-quiz'), 'Práctica: sesiones', QUIZZES["sesiones"].qs);
}

export { sesState, localTZ, hhmm, renderClock, sday, buildSDay, sTime, renderSDay, initSesiones };
