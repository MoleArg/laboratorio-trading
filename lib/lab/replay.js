// Motor interactivo · replay. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { PROG } from './shared';
import { $, COL, candlesFromPath, chart, clamp, drawCandles, el, extent, fig, fmt, gauss, hline, hover, lineSeries, marker, mulberry32, newSeed, niceStep, ohlcRows, rsiCalc, seg, segBind, segVal, tag, txt, vband, vline, zone } from './core';
import { emaArr } from './emas';
import { atrArr, bollinger } from './volat';
/* =====================================================================
   MÓDULO · SIMULADOR DE TRADING (REPLAY)
   ===================================================================== */
const RP_N = 420, RP_START = 80, RP_WIN = 100, RP_BAL = 10000, RP_KEY = 'lt.replay.sessions';
const RP_SPEEDS = [['1x', 500], ['2x', 250], ['5x', 100], ['10x', 45]];
const rp = { speed: 0, preview: 0, lastPrev: 1, drag: null, dragExt: null, C: null, P: null, seed: 101, kind: 'mix', cs: null, vol: null, regs: null, k: RP_START - 1, pos: null, trades: [], bal: RP_BAL, timer: null, ended: false, saved: false, ind: null, msg: null };
function genMarket(seed, kind) {
  const r = mulberry32(seed), per = 8, path = [100], regs = [];
  let p = 100, sig = 0.06, sigT = 0.06, left = 0, reg = null, mu = 0, center = 100, band = 1;
  const pTrend = kind === 'trend' ? 0.85 : kind === 'range' ? 0.15 : 0.5;
  for (let b = 0; b < RP_N; b++) {
    if (left <= 0) {
      const trend = r() < pTrend;
      left = Math.round(trend ? 35 + r() * 70 : 30 + r() * 60);
      if (trend) { const dir = r() < 0.5 ? 1 : -1; mu = dir * (0.003 + r() * 0.01); reg = dir > 0 ? 'Tendencia alcista' : 'Tendencia bajista'; }
      else { mu = 0; center = p; band = 1.2 + r() * 2.2; reg = 'Rango'; }
      sigT = 0.035 + r() * 0.075;
    }
    if (r() < 0.04) sigT = 0.035 + r() * 0.075;
    sig += (sigT - sig) * 0.15;
    for (let s = 0; s < per; s++) {
      const jump = r() < 0.004 ? gauss(r) * sig * 7 : 0;
      const drift = reg === 'Rango' ? (center - p) * 0.012 * (Math.abs(center - p) > band ? 2.5 : 1) : mu * (0.6 + 0.8 * r());
      p += drift + gauss(r) * sig + jump;
      if (p < 20) p = 20 + Math.abs(gauss(r)) * sig;
      path.push(p);
    }
    regs.push(reg); left--;
  }
  const cs = candlesFromPath(path, per);
  const rng = cs.map(c => c.h - c.l), avg = rng.reduce((a, b) => a + b, 0) / rng.length;
  const vol = cs.map((c, i) => Math.round(1000 * (0.45 + 0.9 * rng[i] / avg) * Math.exp(gauss(r) * 0.25)));
  return { cs, vol, regs };
}
function rpBuild() {
  rpStop();
  const m = genMarket(rp.seed, rp.kind);
  rp.cs = m.cs; rp.vol = m.vol; rp.regs = m.regs;
  const cl = m.cs.map(c => c.c);
  rp.ind = { e20: emaArr(cl, 20), e50: emaArr(cl, 50), atr: atrArr(m.cs, 14), bb: bollinger(cl, 20, 2), rsi: rsiCalc(cl, 14).rsi };
  rp.k = RP_START - 1; rp.pos = null; rp.trades = []; rp.bal = RP_BAL; rp.ended = false; rp.saved = false;
  rp.msg = { cls: '', html: 'Mercado nuevo. Lee el contexto (tendencia, rango, volatilidad) antes de operar. Avanza con <kbd>→</kbd> o <kbd>Espacio</kbd>.' };
}
const rpSpread = () => +(segVal($('#rp-fig'), 'spr') || 0.05) * rp.ind.atr[rp.k];
const rpTrendDir = k => { const e = rp.ind.e50; return e[k] == null || e[k - 5] == null ? 0 : Math.sign(e[k] - e[k - 5]); };
function rpOpen(side) {
  if (rp.ended || rp.pos) return;
  const k = rp.k, c = rp.cs[k].c, atr = rp.ind.atr[k], spr = rpSpread();
  const slA = +$('#rp-sl').value / 10, tpR = +$('#rp-tp').value / 10, riskPct = clamp(+$('#rp-risk').value || 1, 0.1, 10);
  const entry = c + side * spr / 2, dist = slA * atr, sl = entry - side * dist, tp = entry + side * tpR * dist;
  PROG.act(); rp.preview = 0;
  rp.pos = { side, entry, sl, sl0: sl, tp, i0: k, risk$: rp.bal * riskPct / 100, riskPct, mfe: 0, mae: 0, with: rpTrendDir(k) === side, spr, be: false };
  rp.msg = { cls: '', html: `${side > 0 ? 'Compra' : 'Venta'} abierta en <b>${entry.toFixed(2)}</b>. Stop en ${sl.toFixed(2)} (${slA.toFixed(1)} ATR), objetivo en ${tp.toFixed(2)} (${tpR.toFixed(1)}R). Arriesgas $${rp.pos.risk$.toFixed(0)} (${riskPct}%).` +
    (rpTrendDir(k) === -side ? ' <span style="color:var(--warn)">Ojo: vas en contra de la pendiente de la EMA 50.</span>' : '') };
  rpRender();
}
function rpClose(price, reason) {
  const P = rp.pos; if (!P) return;
  const R = (price - P.entry) * P.side / Math.abs(P.entry - P.sl0), pnl = R * P.risk$;
  rp.bal += pnl;
  const t = { n: rp.trades.length + 1, side: P.side, i0: P.i0, i1: rp.k, entry: P.entry, exit: price, sl0: P.sl0, tp: P.tp, R, pnl, bal: rp.bal, mfe: P.mfe, mae: P.mae, reason, with: P.with, riskPct: P.riskPct };
  rp.trades.push(t); rp.pos = null;
  let h = `Operación #${t.n} cerrada por <b>${reason.toLowerCase()}</b>: <b>${R >= 0 ? '+' : ''}${R.toFixed(2)}R</b> (${pnl >= 0 ? '+' : '−'}$${Math.abs(pnl).toFixed(0)}).`;
  if (reason === 'Stop' && t.mfe >= 1) h += ` Llegó a ir <b>+${t.mfe.toFixed(1)}R</b> a favor antes de girar: un stop a la entrada o una toma parcial habría ayudado.`;
  else if (reason === 'Manual' && R > 0 && t.mfe > R + 1) h += ` Cerraste en +${R.toFixed(1)}R, pero llegó a +${t.mfe.toFixed(1)}R. ¿Seguiste tu plan o fue miedo?`;
  else if (reason === 'Manual' && R < -0.6) h += ' Cerrar a mano cerca del stop no cambia mucho; define si tu plan permite salidas anticipadas.';
  else if (reason === 'Objetivo') h += ` El precio fue como mucho ${t.mae.toFixed(2)}R en contra antes de llegar.`;
  if (!t.with) h += ' (Fue en contra de la tendencia de la EMA 50.)';
  rp.msg = { cls: R > 0 ? 'good' : R < -0.05 ? 'bad' : '', html: h };
}
function rpStep() {
  if (rp.ended) return;
  if (rp.k >= RP_N - 1) return rpEnd();
  rp.k++;
  const P = rp.pos;
  if (P) {
    const c = rp.cs[rp.k], s = P.spr / 2, sd = P.side;
    const o = c.o - sd * s, h = c.h - sd * s, l = c.l - sd * s, risk = Math.abs(P.entry - P.sl0);
    const fav = sd > 0 ? h : l, adv = sd > 0 ? l : h;
    P.mfe = Math.max(P.mfe, (fav - P.entry) * sd / risk); P.mae = Math.max(P.mae, (P.entry - adv) * sd / risk);
    const hitSL = x => sd > 0 ? x <= P.sl : x >= P.sl, hitTP = x => sd > 0 ? x >= P.tp : x <= P.tp;
    const slName = P.be ? 'Break-even' : 'Stop';
    if (hitSL(o)) rpClose(o, slName + ' (con deslizamiento)');
    else if (hitTP(o)) rpClose(o, 'Objetivo');
    else if (hitSL(adv)) rpClose(P.sl, slName);
    else if (hitTP(fav)) rpClose(P.tp, 'Objetivo');
  }
  if (rp.k >= RP_N - 1) rpEnd(); else rpRender();
}
function rpEnd() {
  rpStop();
  if (rp.pos) rpClose(rp.cs[rp.k].c - rp.pos.side * rp.pos.spr / 2, 'Fin del mercado');
  rp.ended = true;
  rpSaveSession();
  rp.msg = { cls: '', html: '<strong>Fin del mercado.</strong> Ahora ves el gráfico completo con los regímenes reales (tendencia o rango) sombreados. Compara dónde operaste con lo que el mercado estaba haciendo, y revisa el análisis de abajo.' };
  rpRender();
}
function rpPlay() {
  if (rp.timer) return rpStop();
  if (rp.ended) return;
  rp.timer = setInterval(rpStep, RP_SPEEDS[rp.speed][1]);
  $('#rp-play').textContent = '❚❚';
}
function rpStop() { if (rp.timer) clearInterval(rp.timer); rp.timer = null; const b = $('#rp-play'); if (b) b.textContent = '▶'; }
function rpStats() {
  const T = rp.trades, n = T.length, wins = T.filter(t => t.R > 0), loss = T.filter(t => t.R <= 0);
  const sumW = wins.reduce((s, t) => s + t.R, 0), sumL = -loss.reduce((s, t) => s + t.R, 0);
  let peak = RP_BAL, dd = 0; [RP_BAL, ...T.map(t => t.bal)].forEach(b => { peak = Math.max(peak, b); dd = Math.max(dd, (peak - b) / peak); });
  return { n, wr: n ? wins.length / n : null, exp: n ? T.reduce((s, t) => s + t.R, 0) / n : null, pf: sumL > 0 ? sumW / sumL : (sumW > 0 ? Infinity : null), dd, ret: (rp.bal / RP_BAL - 1), totR: T.reduce((s, t) => s + t.R, 0) };
}
function rpRender() {
  renderRp(); rpUI(); renderRpEq(); renderRpDist(); rpLog(); rpAnalysis();
}
const renderRp = fig(function () {
  const host = $('#fig-rp'); if (!host || !rp.cs) return;
  const k = rp.k, from = rp.ended ? 0 : Math.max(0, k - (innerWidth < 640 ? 55 : RP_WIN) + 1), last = k, cs = rp.cs.slice(from, last + 1), I = rp.ind;
  const showE = $('#rp-ema').checked, showB = $('#rp-bb').checked, showR = $('#rp-rsi').checked, showV = $('#rp-vol').checked;
  const extra = [];
  if (showE) for (let i = from; i <= last; i++) extra.push(I.e20[i], I.e50[i]);
  if (showB) for (let i = from; i <= last; i++) extra.push(I.bb.up[i], I.bb.lo[i]);
  if (rp.pos) extra.push(rp.pos.sl, rp.pos.tp);
  const pv = !rp.pos && rp.preview && !rp.ended ? rpPreview(rp.preview) : null;
  if (pv) extra.push(pv.sl, pv.tp);
  let [lo, hi] = extent(cs, extra);
  if (rp.drag && rp.dragExt) [lo, hi] = rp.dragExt;
  const panels = [{ h: rp.ended ? 380 : 340, yMin: lo, yMax: hi, dec: 1 }];
  if (showV) panels.push({ h: 56, yMin: 0, yMax: Math.max(...rp.vol.slice(from, last + 1)) * 1.1, grid: false, title: 'Volumen' });
  if (showR) panels.push({ h: 90, yMin: 0, yMax: 100, step: 30, dec: 0, title: 'RSI 14' });
  const pad = rp.ended ? 2 : 12, n = cs.length + pad;
  const C = chart(host, { n, panels, padB: 20, aria: 'Simulador de trading vela a vela' });
  const P = C.panels[0], X = i => i - from;
  if (rp.ended) {
    let s = 0;
    for (let i = 1; i <= rp.regs.length; i++) if (i === rp.regs.length || rp.regs[i] !== rp.regs[s]) {
      const g = rp.regs[s]; vband(C, X(s), X(i - 1), { color: g === 'Rango' ? '#8a93a6' : g === 'Tendencia alcista' ? COL.up : COL.down, op: 0.07, label: i - s > 25 ? g : null }); s = i;
    }
    vline(C, X(RP_START - 1), { dash: '2 3' });
  }
  if (showB) {
    const sl = a => a.slice(from, last + 1).map(v => v);
    const up = sl(I.bb.up), lw = sl(I.bb.lo);
    let d = ''; up.forEach((v, j) => { if (v != null) d += (d ? 'L' : 'M') + C.x(j).toFixed(1) + ' ' + P.y(v).toFixed(1) + ' '; });
    for (let j = lw.length - 1; j >= 0; j--) if (lw[j] != null) d += 'L' + C.x(j).toFixed(1) + ' ' + P.y(lw[j]).toFixed(1) + ' ';
    if (d) el('path', { d: d + 'Z', fill: COL.range, 'fill-opacity': 0.06, stroke: 'none' }, P.g.zone);
    lineSeries(C, P, up, { color: COL.range, width: 1, opacity: 0.6 }); lineSeries(C, P, lw, { color: COL.range, width: 1 }); lineSeries(C, P, sl(I.bb.mid), { color: COL.range, width: 1 }).setAttribute('stroke-dasharray', '3 3');
  }
  if (showE) { lineSeries(C, P, I.e20.slice(from, last + 1), { color: COL.liq, width: 1.5 }); lineSeries(C, P, I.e50.slice(from, last + 1), { color: COL.fvg, width: 1.8 }); }
  drawCandles(C, P, cs);
  if (!rp.ended) {
    const x0 = C.x(X(k)) + C.step / 2, pat = el('pattern', { id: 'rp-hatch', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, el('defs', {}, C.svg));
    el('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: COL.muted, 'stroke-width': 1, 'stroke-opacity': 0.28 }, pat);
    el('rect', { x: x0, y: C.padT, width: C.padL + C.iw - x0, height: C.h - C.padT - C.padB, fill: 'url(#rp-hatch)' }, C.bg);
    txt(C.bg, (x0 + C.padL + C.iw) / 2, C.padT + 14, 'Futuro', { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 11, 'font-weight': 600 });
  }
  if (pv) {
    const x1 = X(k), x2 = n - 1, nm = rp.preview > 0 ? 'compra' : 'venta';
    zone(C, P, pv.entry, pv.tp, { x1, x2, color: COL.up, op: 0.08, stroke: false }); zone(C, P, pv.entry, pv.sl, { x1, x2, color: COL.down, op: 0.08, stroke: false });
    hline(C, P, pv.entry, { x1, x2, color: COL.entry, width: 1.2, dash: '3 3' });
    hline(C, P, pv.sl, { x1, x2, color: COL.down, width: 1.2, dash: '3 3', label: 'Stop ' + pv.sl.toFixed(2), side: 'right', below: rp.preview > 0 });
    hline(C, P, pv.tp, { x1, x2, color: COL.up, width: 1.2, dash: '3 3', label: 'Objetivo ' + pv.tp.toFixed(2), side: 'right', below: rp.preview < 0 });
    tag(P.g.lab, C.x(x1) - 8, P.y(pv.entry), 'Vista previa: ' + nm, COL.text2, 'end');
  }
  if (showV) { const V = C.panels[1]; for (let i = from; i <= last; i++) { const c = rp.cs[i]; el('rect', { x: C.x(X(i)) - C.bw / 2, y: V.y(rp.vol[i]), width: C.bw, height: V.bottom - V.y(rp.vol[i]), fill: c.c >= c.o ? COL.up : COL.down, opacity: 0.5 }, V.g.data); } }
  if (showR) {
    const Rp = C.panels[showV ? 2 : 1];
    zone(C, Rp, 70, 100, { color: COL.down, op: 0.06, stroke: false }); zone(C, Rp, 0, 30, { color: COL.up, op: 0.06, stroke: false });
    lineSeries(C, Rp, I.rsi.slice(from, last + 1), { color: COL.rsi, width: 1.6 });
  }
  rp.trades.forEach(t => {
    if (t.i1 < from) return;
    const col = t.R > 0 ? COL.up : COL.down;
    seg(C, P, X(t.i0), t.entry, X(t.i1), t.exit, { color: col, width: 1.4, dash: '4 3' });
    marker(C, P, X(t.i0), t.entry, { shape: t.side > 0 ? 'up' : 'down', color: t.side > 0 ? COL.up : COL.down, size: 5 });
    marker(C, P, X(t.i1), t.exit, { color: col, size: 5, label: (t.R >= 0 ? '+' : '') + t.R.toFixed(1) + 'R', dy: t.side > 0 === t.R > 0 ? -16 : 18 });
  });
  const pos = rp.pos;
  if (pos) {
    const x1 = X(pos.i0), x2 = n - 1;
    zone(C, P, pos.entry, pos.tp, { x1, x2, color: COL.up, op: 0.12, stroke: false });
    zone(C, P, pos.entry, pos.sl, { x1, x2, color: COL.down, op: 0.14, stroke: false });
    const openR = (rp.cs[k].c - pos.side * pos.spr / 2 - pos.entry) * pos.side / Math.abs(pos.entry - pos.sl0);
    const tpAbove = (pos.tp > pos.entry) === true;
    hline(C, P, pos.entry, { x1, x2, color: COL.entry, width: 1.4, dash: false });
    hline(C, P, pos.sl, { x1, x2, color: COL.down, width: 1.4, label: pos.be ? 'Stop (BE)' : 'Stop', side: 'right', below: tpAbove });
    hline(C, P, pos.tp, { x1, x2, color: COL.up, width: 1.4, label: 'Objetivo', side: 'right', below: !tpAbove });
    tag(P.g.lab, C.x(x1) - 8, P.y(pos.entry), `${pos.side > 0 ? 'Compra' : 'Venta'} ${openR >= 0 ? '+' : ''}${openR.toFixed(2)}R`, openR >= 0 ? COL.up : COL.down, 'end');
    marker(C, P, x1, pos.entry, { shape: pos.side > 0 ? 'up' : 'down', color: pos.side > 0 ? COL.up : COL.down, size: 6 });
    if (!rp.ended) ['sl', 'tp'].forEach(key => {
      const col = key === 'sl' ? COL.down : COL.up, hg = el('g', { transform: `translate(${C.x(x2) - 4},${P.y(pos[key])})`, style: 'cursor:ns-resize;touch-action:none', tabindex: 0, role: 'slider', 'aria-label': key === 'sl' ? 'Arrastra para mover el stop' : 'Arrastra para mover el objetivo' }, C.svg);
      el('circle', { r: 8, fill: COL.surface, stroke: col, 'stroke-width': 2.5 }, hg);
      el('path', { d: 'M-3 -1.5 L0 -4.5 L3 -1.5 M-3 1.5 L0 4.5 L3 1.5', fill: 'none', stroke: col, 'stroke-width': 1.5 }, hg);
      hg.addEventListener('pointerdown', e => { e.preventDefault(); rpStop(); rp.drag = key; rp.dragExt = [P.yMin, P.yMax]; });
      hg.addEventListener('keydown', e => { const d = { ArrowUp: 1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault(); rpMoveLevel(key, pos[key] + d * 0.1 * rp.ind.atr[rp.k]); rpDragEnd(key); });
    });
  }
  rp.C = C; rp.P = P;
  if (!rp.ended) hline(C, P, rp.cs[k].c, { x1: X(k), x2: n - 1, color: COL.text2, width: 1, dash: '2 3' });
  hover(C, j => {
    const i = j + from; if (i > last) return null;
    const rows = [['#', 'Vela ' + (i + 1)]].concat(ohlcRows(rp.cs[i], 2));
    if (showE) rows.push(['EMA 20', fmt(I.e20[i])], ['EMA 50', fmt(I.e50[i])]);
    if (showR) rows.push(['RSI', fmt(I.rsi[i], 1)]);
    rows.push(['ATR 14', fmt(I.atr[i], 3)]);
    return rows;
  });
  host.scrollLeft = host.scrollWidth;
});
function rpPreview(side) {
  const k = rp.k, c = rp.cs[k].c, atr = rp.ind.atr[k], spr = rpSpread(), slA = +$('#rp-sl').value / 10, tpR = +$('#rp-tp').value / 10;
  const entry = c + side * spr / 2, dist = slA * atr;
  return { entry, sl: entry - side * dist, tp: entry + side * tpR * dist };
}
function rpMoveLevel(key, price) {
  const p = rp.pos; if (!p) return;
  const c = rp.cs[rp.k].c, gap = 0.05 * rp.ind.atr[rp.k], sd = p.side;
  if (rp.dragExt) price = clamp(price, rp.dragExt[0], rp.dragExt[1]);
  if (key === 'sl') price = sd > 0 ? Math.min(price, c - gap) : Math.max(price, c + gap);
  else price = sd > 0 ? Math.max(price, c + gap) : Math.min(price, c - gap);
  p[key] = price; if (key === 'sl') p.be = Math.abs(price - p.entry) < gap;
  renderRp(); rpUI();
}
function rpDragEnd(key) {
  const p = rp.pos; rp.drag = null; rp.dragExt = null; if (!p) return;
  const risk = Math.abs(p.entry - p.sl0), sd = p.side;
  if (key === 'sl') {
    const r = (p.sl - p.entry) * sd / risk;
    rp.msg = (p.sl - p.sl0) * sd < -1e-9 ? { cls: 'bad', html: `<strong>Alejaste el stop</strong>: si salta, ahora pierdes <b>${(-r).toFixed(2)}R</b> en vez de 1R. "Darle aire" a una operación perdedora es uno de los errores del módulo de riesgo.` }
      : r >= -0.02 ? { cls: 'good', html: `Stop en ${r > 0.02 ? 'beneficio: aseguras <b>+' + r.toFixed(2) + 'R</b>' : 'la entrada (break-even)'} pase lo que pase.` }
        : { cls: '', html: `Stop acercado: el riesgo baja a <b>${(-r).toFixed(2)}R</b>. Ojo: demasiado cerca, el ruido normal lo puede saltar.` };
  } else {
    const r = (p.tp - p.entry) * sd / risk;
    rp.msg = { cls: '', html: `Objetivo movido a <b>+${r.toFixed(2)}R</b>.` + (r < 1 ? ' Con un objetivo menor que el riesgo necesitas acertar mucho para ganar.' : '') };
  }
  renderRp(); rpUI();
}
function rpUI() {
  const s = rpStats(), pos = rp.pos, k = rp.k;
  $('#rp-sl-v').textContent = (+$('#rp-sl').value / 10).toFixed(1) + ' ATR';
  $('#rp-tp-v').textContent = (+$('#rp-tp').value / 10).toFixed(1) + 'R';
  $('#rp-clock').textContent = `Vela ${k + 1} / ${RP_N}`;
  ['#rp-buy', '#rp-sell'].forEach(q => $(q).disabled = !!pos || rp.ended);
  $('#rp-close').disabled = !pos; $('#rp-be').disabled = !pos || pos.be;
  ['#rp-play', '#rp-step', '#rp-skip'].forEach(q => $(q).disabled = rp.ended);
  const openR = pos ? (rp.cs[k].c - pos.side * pos.spr / 2 - pos.entry) * pos.side / Math.abs(pos.entry - pos.sl0) : null;
  const st = [['Balance', '$' + rp.bal.toLocaleString('es-AR', { maximumFractionDigits: 0 })], ['Rentabilidad', (s.ret >= 0 ? '+' : '') + (s.ret * 100).toFixed(1) + '%'], ['Operaciones', s.n],
    ['Acierto', s.wr == null ? '—' : Math.round(s.wr * 100) + '%'], ['Expectativa', s.exp == null ? '—' : (s.exp >= 0 ? '+' : '') + s.exp.toFixed(2) + 'R'],
    ['Profit factor', s.pf == null ? '—' : s.pf === Infinity ? '∞' : s.pf.toFixed(2)], ['Drawdown máx.', (s.dd * 100).toFixed(1) + '%'], ['Posición', pos ? `${pos.side > 0 ? 'Larga' : 'Corta'} ${openR >= 0 ? '+' : ''}${openR.toFixed(2)}R` : 'Sin posición'],
    ['ATR 14', fmt(rp.ind.atr[k], 3)]];
  $('#rp-stats').innerHTML = st.map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const ex = $('#rp-explain'); ex.className = 'explain ' + (rp.msg.cls || ''); ex.innerHTML = rp.msg.html;
}
const renderRpEq = fig(function () {
  const host = $('#fig-rp-eq'); if (!host) return;
  const eq = [RP_BAL, ...rp.trades.map(t => t.bal)], [lo, hi] = extent([], eq.concat([RP_BAL * 0.97, RP_BAL * 1.03]));
  const C = chart(host, { n: Math.max(eq.length, 12), w: 520, padR: 60, panels: [{ h: 200, yMin: lo, yMax: hi, dec: 0, fmt: v => '$' + Math.round(v / 100) / 10 + 'k' }], aria: 'Curva de capital' });
  const P = C.panels[0];
  hline(C, P, RP_BAL, { color: COL.muted, width: 1 });
  lineSeries(C, P, eq, { color: eq[eq.length - 1] >= RP_BAL ? COL.up : COL.down, width: 2 });
  eq.forEach((v, i) => el('circle', { cx: C.x(i), cy: P.y(v), r: 2.6, fill: i ? (rp.trades[i - 1].R > 0 ? COL.up : COL.down) : COL.muted }, P.g.ann));
  hover(C, i => i < eq.length ? [['#', i ? 'Tras la operación #' + i : 'Inicio'], ['Balance', '$' + eq[i].toFixed(0)]].concat(i ? [['Resultado', rp.trades[i - 1].R.toFixed(2) + 'R']] : []) : null);
});
const renderRpDist = fig(function () {
  const host = $('#fig-rp-dist'); if (!host) return;
  const edges = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 6], cnt = Array(edges.length - 1).fill(0);
  rp.trades.forEach(t => { let b = edges.findIndex((e, i) => i < edges.length - 1 && t.R < edges[i + 1]); if (b < 0) b = cnt.length - 1; cnt[b]++; });
  const C = chart(host, { n: cnt.length, w: 520, padR: 40, padB: 22, panels: [{ h: 178, yMin: 0, yMax: Math.max(4, ...cnt) + 1, dec: 0, step: Math.max(1, Math.round(niceStep(Math.max(4, ...cnt) + 1, 4))) }], aria: 'Histograma de resultados en R' });
  const P = C.panels[0];
  cnt.forEach((v, i) => {
    el('rect', { x: C.x(i) - C.step * 0.4, y: P.y(v), width: C.step * 0.8, height: P.bottom - P.y(v), fill: edges[i] < 0 ? COL.down : COL.up, opacity: 0.8, rx: 2 }, P.g.data);
    txt(C.bg, C.x(i), C.h - 6, edges[i] === -2 ? '<−1,5' : String(edges[i]).replace('.', ','), { 'text-anchor': 'middle', fill: COL.muted, 'font-size': 9.5 });
  });
  hover(C, i => [['#', `${edges[i]}R a ${edges[i + 1]}R`], ['Operaciones', cnt[i]]]);
});
function rpLog() {
  const T = rp.trades;
  if (!T.length) { $('#rp-log').innerHTML = '<p style="padding:10px;color:var(--muted)">Todavía no hay operaciones.</p>'; return; }
  const t = document.createElement('table'); t.className = 't';
  t.innerHTML = '<thead><tr><th>#</th><th>Lado</th><th>Velas</th><th>Entrada</th><th>Salida</th><th>Motivo</th><th>R</th><th>MFE</th><th>MAE</th><th>Tendencia</th><th>Balance</th></tr></thead><tbody>' +
    T.slice().reverse().map(x => `<tr><td>${x.n}</td><td>${x.side > 0 ? 'Compra' : 'Venta'}</td><td>${x.i0 + 1}→${x.i1 + 1}</td><td>${x.entry.toFixed(2)}</td><td>${x.exit.toFixed(2)}</td><td>${x.reason}</td>` +
      `<td style="color:${x.R > 0 ? 'var(--c-up)' : 'var(--c-down)'}">${x.R >= 0 ? '+' : ''}${x.R.toFixed(2)}</td><td>${x.mfe.toFixed(2)}</td><td>${x.mae.toFixed(2)}</td><td>${x.with ? 'A favor' : 'En contra'}</td><td>$${x.bal.toFixed(0)}</td></tr>`).join('') + '</tbody>';
  $('#rp-log').replaceChildren(t);
}
function rpAnalysis() {
  const T = rp.trades, n = T.length, box = $('#rp-analysis');
  if (!n) { box.className = 'explain'; box.innerHTML = 'Haz algunas operaciones y aquí aparecerá el análisis: qué te funciona, qué no y dónde se te escapa el dinero.'; return; }
  const avg = a => a.length ? a.reduce((s, t) => s + t.R, 0) / a.length : null, s = rpStats(), out = [];
  out.push(`<strong>${n} operación${n > 1 ? 'es' : ''}</strong>, ${s.totR >= 0 ? '+' : ''}${s.totR.toFixed(2)}R en total, expectativa ${s.exp >= 0 ? '+' : ''}${s.exp.toFixed(2)}R por operación.` + (n < 20 ? ' <span style="color:var(--muted)">Con menos de 20 operaciones el resultado es casi todo varianza: no saques conclusiones todavía.</span>' : ''));
  const W = T.filter(t => t.with), A = T.filter(t => !t.with);
  if (W.length && A.length) out.push(`A favor de la EMA 50: ${W.length} op., media <b>${avg(W).toFixed(2)}R</b>. En contra: ${A.length} op., media <b>${avg(A).toFixed(2)}R</b>.` + (avg(A) < avg(W) ? ' Operar con la tendencia te está rindiendo más.' : ' Curioso: las contratendencia te van mejor; vigila que no sea suerte de muestra pequeña.'));
  const gave = T.filter(t => t.R < 0 && t.mfe >= 1);
  if (gave.length) out.push(`<b>${gave.length}</b> operación${gave.length > 1 ? 'es llegaron' : ' llegó'} a +1R o más y ${gave.length > 1 ? 'terminaron' : 'terminó'} en pérdida. Un stop a la entrada (<kbd>E</kbd>) al alcanzar +1R las habría salvado.`);
  const man = T.filter(t => t.reason === 'Manual' && t.R > 0);
  if (man.length) { const left = man.reduce((x, t) => x + (t.mfe - t.R), 0) / man.length; if (left > 0.8) out.push(`En tus cierres manuales en ganancia dejaste de media <b>${left.toFixed(1)}R</b> sobre la mesa (diferencia con el MFE).`); }
  const ws = T.filter(t => t.R > 0), ls = T.filter(t => t.R <= 0);
  if (ws.length && ls.length) out.push(`Ganancia media <b>+${avg(ws).toFixed(2)}R</b> vs pérdida media <b>${avg(ls).toFixed(2)}R</b>. Con tu ratio de ganancia/pérdida, el acierto mínimo para no perder es <b>${Math.round(100 * Math.abs(avg(ls)) / (avg(ws) + Math.abs(avg(ls))))}%</b> (tienes ${Math.round(s.wr * 100)}%).`);
  const risks = new Set(T.map(t => t.riskPct)); if (risks.size > 1) out.push('Cambiaste el % de riesgo durante la sesión. Mantenerlo fijo hace que tus resultados sean comparables y evita "recuperar" con tamaño.');
  box.className = 'explain ' + (s.exp > 0.1 ? 'good' : s.exp < -0.1 ? 'bad' : '');
  box.innerHTML = out.map(x => `<p style="margin:4px 0">${x}</p>`).join('');
}
function rpCSV() {
  if (!rp.trades.length) return;
  const head = ['n', 'lado', 'vela_entrada', 'vela_salida', 'entrada', 'salida', 'stop_inicial', 'objetivo', 'motivo', 'R', 'pnl_usd', 'mfe_R', 'mae_R', 'a_favor_tendencia', 'riesgo_pct', 'balance'];
  const rows = rp.trades.map(t => [t.n, t.side > 0 ? 'compra' : 'venta', t.i0 + 1, t.i1 + 1, t.entry.toFixed(4), t.exit.toFixed(4), t.sl0.toFixed(4), t.tp.toFixed(4), t.reason, t.R.toFixed(3), t.pnl.toFixed(2), t.mfe.toFixed(3), t.mae.toFixed(3), t.with ? 'si' : 'no', t.riskPct, t.bal.toFixed(2)]);
  const csv = [head, ...rows].map(r => r.map(v => /[",;\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `diario-replay-${rp.seed}.csv`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function rpLoadHist() { try { return JSON.parse(localStorage.getItem(RP_KEY)) || []; } catch (e) { return []; } }
function rpSaveSession() {
  if (rp.saved || !rp.trades.length) return;
  const s = rpStats(), h = rpLoadHist();
  h.unshift({ d: new Date().toISOString(), kind: rp.kind, n: s.n, wr: s.wr, exp: s.exp, ret: s.ret, dd: s.dd, done: rp.ended });
  try { localStorage.setItem(RP_KEY, JSON.stringify(h.slice(0, 30))); } catch (e) { /* almacenamiento no disponible */ }
  rp.saved = true; rpHist();
}
function rpHist() {
  const h = rpLoadHist(), host = $('#rp-hist'); if (!host) return;
  if (!h.length) { host.innerHTML = '<p style="color:var(--muted)">Aún no hay sesiones guardadas.</p>'; return; }
  const kinds = { mix: 'Mixto', trend: 'Tendencial', range: 'Lateral' };
  const tot = h.reduce((a, x) => a + x.n, 0), expAll = h.reduce((a, x) => a + x.exp * x.n, 0) / tot;
  const t = document.createElement('table'); t.className = 't';
  t.innerHTML = '<thead><tr><th>Fecha</th><th>Mercado</th><th>Ops.</th><th>Acierto</th><th>Expectativa</th><th>Rentab.</th><th>DD máx.</th></tr></thead><tbody>' +
    h.map(x => `<tr><td>${new Date(x.d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}${x.done ? '' : ' <small style="color:var(--muted)">(incompleta)</small>'}</td><td>${kinds[x.kind] || x.kind}</td><td>${x.n}</td><td>${Math.round(x.wr * 100)}%</td>` +
      `<td style="color:${x.exp > 0 ? 'var(--c-up)' : 'var(--c-down)'}">${x.exp >= 0 ? '+' : ''}${x.exp.toFixed(2)}R</td><td>${(x.ret * 100).toFixed(1)}%</td><td>${(x.dd * 100).toFixed(1)}%</td></tr>`).join('') +
    `</tbody><tfoot><tr><td><b>Total</b></td><td>${h.length} sesiones</td><td>${tot}</td><td></td><td><b>${expAll >= 0 ? '+' : ''}${expAll.toFixed(2)}R</b></td><td></td><td></td></tr></tfoot>`;
  host.replaceChildren(t);
}
function initReplay() {
  rpBuild();
  segBind($('#rp-fig'), (key, v) => {
    if (key === 'mk') { rpSaveSession(); rp.kind = v; rp.seed = newSeed(); rpBuild(); rpRender(); }
    else if (key === 'sp' && rp.timer) { rpStop(); rpPlay(); }
  });
  $('#rp-new').addEventListener('click', () => { rpSaveSession(); rp.seed = newSeed(); rpBuild(); rpRender(); });
  $('#rp-play').addEventListener('click', rpPlay);
  $('#rp-reset').addEventListener('click', () => { rpSaveSession(); rpBuild(); rpRender(); });
  $('#rp-speed').addEventListener('click', () => { rp.speed = (rp.speed + 1) % RP_SPEEDS.length; $('#rp-speed').textContent = RP_SPEEDS[rp.speed][0]; if (rp.timer) { rpStop(); rpPlay(); } });
  [['#rp-buy', 1], ['#rp-sell', -1]].forEach(([q, sd]) => {
    const b = $(q), on = () => { if (rp.pos || rp.ended) return; rp.preview = sd; rp.lastPrev = sd; renderRp(); }, off = () => { if (!rp.preview) return; rp.preview = 0; renderRp(); };
    b.addEventListener('pointerenter', on); b.addEventListener('focus', on); b.addEventListener('pointerleave', off); b.addEventListener('blur', off);
  });
  ['#rp-sl', '#rp-tp'].forEach(q => $(q).addEventListener('input', () => { if (!rp.pos && !rp.ended) { rp.preview = rp.lastPrev; renderRp(); } }));
  $('.rp-ticket').addEventListener('pointerleave', () => { if (rp.preview) { rp.preview = 0; renderRp(); } });
  window.addEventListener('pointermove', e => {
    if (!rp.drag || !rp.C) return;
    const svg = $('#fig-rp svg'); if (!svg) return;
    const r = svg.getBoundingClientRect(), C = rp.C, P = rp.P, sy = (e.clientY - r.top) * C.h / r.height;
    rpMoveLevel(rp.drag, P.yMax - (sy - P.top) / P.h * (P.yMax - P.yMin));
  });
  window.addEventListener('pointerup', () => { if (rp.drag) rpDragEnd(rp.drag); });
  $('#rp-step').addEventListener('click', () => { rpStop(); rpStep(); });
  $('#rp-skip').addEventListener('click', () => { rpStop(); for (let q = 0; q < 10 && !rp.ended; q++) rpStep(); });
  $('#rp-buy').addEventListener('click', () => rpOpen(1));
  $('#rp-sell').addEventListener('click', () => rpOpen(-1));
  $('#rp-close').addEventListener('click', () => { if (rp.pos) { rpClose(rp.cs[rp.k].c - rp.pos.side * rp.pos.spr / 2, 'Manual'); rpRender(); } });
  $('#rp-be').addEventListener('click', () => { const p = rp.pos; if (!p || p.be) return; p.sl = p.entry; p.be = true; rp.msg = { cls: '', html: 'Stop movido a la entrada: lo peor que puede pasar ahora es salir sin pérdida (más el spread de salida).' }; rpRender(); });
  ['#rp-ema', '#rp-bb', '#rp-rsi', '#rp-vol'].forEach(s => $(s).addEventListener('change', renderRp));
  ['#rp-sl', '#rp-tp'].forEach(s => $(s).addEventListener('input', rpUI));
  $('#rp-csv').addEventListener('click', rpCSV);
  $('#rp-hist-clear').addEventListener('click', () => { if (confirm('¿Borrar todas las sesiones guardadas?')) { try { localStorage.removeItem(RP_KEY); } catch (e) { /* sin almacenamiento */ } rpHist(); } });
  document.addEventListener('keydown', e => {
    if (!$('#m-replay').classList.contains('active') || e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target, tn = tg && tg.tagName;
    if (tn === 'TEXTAREA' || tn === 'SELECT' || (tn === 'INPUT' && tg.type !== 'checkbox') || (tn === 'BUTTON' && (e.key === ' ' || e.key === 'Enter'))) return;
    const key = e.key.toLowerCase(), act = { arrowright: () => { rpStop(); rpStep(); }, ' ': rpPlay, b: () => rpOpen(1), s: () => rpOpen(-1), x: () => $('#rp-close').click(), e: () => $('#rp-be').click() }[key];
    if (act) { e.preventDefault(); act(); }
  });
  window.addEventListener('hashchange', () => { if (!$('#m-replay').classList.contains('active')) rpStop(); });
  rpRender(); rpHist();
}

export { RP_N, RP_START, RP_WIN, RP_BAL, RP_KEY, RP_SPEEDS, rp, genMarket, rpBuild, rpSpread, rpTrendDir, rpOpen, rpClose, rpStep, rpEnd, rpPlay, rpStop, rpStats, rpRender, renderRp, rpPreview, rpMoveLevel, rpDragEnd, rpUI, renderRpEq, renderRpDist, rpLog, rpAnalysis, rpCSV, rpLoadHist, rpSaveSession, rpHist, initReplay };
