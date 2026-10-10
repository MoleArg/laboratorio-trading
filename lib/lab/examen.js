// Motor interactivo · examen. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { GROUP_NAME, GROUP_OF, MOD_NAME, PROG, QUIZ_BANK } from './shared';
import { $, $$, segBind, segVal } from './core';
/* =====================================================================
   MÓDULO · EXAMEN FINAL
   ===================================================================== */
const shuffle = (a, r) => { r = r || Math.random; a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const exm = { qs: [], i: 0, ans: [], lastWrong: [], timerOn: false, tick: null, combo: 0, best: 0 };
const EX_T = 20000;
const exClear = () => { if (exm.tick) clearInterval(exm.tick); exm.tick = null; };
function exGroupsOf() { return GROUP_OF; }
function exBest() {
  const b = PROG.get().exam;
  $('#ex-best').innerHTML = `<div class="stat"><div class="k">Preguntas disponibles</div><div class="v">${QUIZ_BANK.length}</div></div>` +
    (b ? `<div class="stat"><div class="k">Tu mejor nota</div><div class="v">${Math.round(b.pct * 100)}%</div></div><div class="stat"><div class="k">Exámenes hechos</div><div class="v">${b.count}</div></div>` : '');
}
function exStart(pool) {
  const n = +(segVal($('#m-examen'), 'exn') || 20), gm = exGroupsOf();
  if (!pool) {
    const on = new Set($$('#ex-groups input:checked').map(c => c.value));
    pool = QUIZ_BANK.filter(q => on.has(gm[q.mod]));
    if (!pool.length) { alert('Elige al menos un grupo de módulos.'); return; }
    // reparto equilibrado: una ronda por módulo antes de repetir módulo
    const byMod = {}; shuffle(pool).forEach(q => (byMod[q.mod] = byMod[q.mod] || []).push(q));
    const mods = shuffle(Object.keys(byMod)), out = [];
    while (out.length < Math.min(n, pool.length)) mods.forEach(m => { if (byMod[m].length && out.length < n) out.push(byMod[m].pop()); });
    pool = shuffle(out);
  }
  exm.qs = pool.map(q => { const ord = shuffle(q.o.map((_, i) => i)); return Object.assign({}, q, { o: ord.map(i => q.o[i]), a: ord.indexOf(q.a), src: q }); });
  exm.i = 0; exm.ans = []; exm.combo = 0; exm.best = 0; exm.timerOn = $('#ex-timer').checked;
  $('#ex-config').hidden = true; $('#ex-res').hidden = true; $('#ex-run').hidden = false;
  exShow();
  $('#ex-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function exShow() {
  const q = exm.qs[exm.i], N = exm.qs.length, right = exm.ans.filter(Boolean).length;
  $('#ex-count').textContent = `Pregunta ${exm.i + 1} de ${N}`;
  $('#ex-mod').textContent = MOD_NAME[q.mod] || q.mod;
  $('#ex-score').textContent = `${right} / ${exm.ans.length} correctas`;
  $('#ex-meter').style.width = (100 * exm.i / N) + '%';
  $('#ex-next').disabled = true; $('#ex-next').textContent = exm.i === N - 1 ? 'Ver resultado ▶' : 'Siguiente ▶';
  const box = $('#ex-q'); box.innerHTML = '';
  const p = document.createElement('p'); p.textContent = q.q; box.appendChild(p);
  const opts = document.createElement('div'); opts.className = 'opts'; box.appendChild(opts);
  const fb = document.createElement('div'); fb.className = 'fb';
  q.o.forEach((t, oi) => {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = `${'ABCDE'[oi]}. ${t}`;
    b.addEventListener('click', () => {
      if (exm.ans.length > exm.i) return;
      const ok = oi === q.a; exm.ans.push(ok); exClear();
      exm.combo = ok ? exm.combo + 1 : 0; exm.best = Math.max(exm.best, exm.combo);
      $('#ex-combo').textContent = exm.combo >= 2 ? '🔥 ' + exm.combo + ' seguidas' : '';
      b.classList.add(ok ? 'right' : 'wrong'); if (!ok) opts.children[q.a].classList.add('right');
      fb.innerHTML = (ok ? '✔ Correcto. ' : '✘ No. ') + q.why + ` <a href="#${q.mod}-quiz">Repasar ${MOD_NAME[q.mod] || q.mod} →</a>`;
      fb.style.display = 'block';
      $('#ex-score').textContent = `${exm.ans.filter(Boolean).length} / ${exm.ans.length} correctas`;
      $('#ex-next').disabled = false; $('#ex-next').focus();
    });
    opts.appendChild(b);
  });
  box.appendChild(fb);
  exClear(); $('#ex-combo').textContent = exm.combo >= 2 ? '🔥 ' + exm.combo + ' seguidas' : '';
  const tb = $('#ex-tbar'); tb.hidden = !exm.timerOn;
  if (exm.timerOn) {
    const t0 = Date.now(), bar = $('div', tb);
    exm.tick = setInterval(() => {
      const rem = EX_T - (Date.now() - t0); bar.style.width = Math.max(0, rem / EX_T * 100) + '%'; tb.classList.toggle('low', rem < 5000);
      if (rem > 0) return;
      exClear(); if (exm.ans.length > exm.i) return;
      exm.ans.push(false); exm.combo = 0; $('#ex-combo').textContent = '';
      opts.children[q.a].classList.add('right'); fb.innerHTML = '⏱ Se acabó el tiempo. ' + q.why; fb.style.display = 'block';
      $('#ex-score').textContent = `${exm.ans.filter(Boolean).length} / ${exm.ans.length} correctas`;
      $('#ex-next').disabled = false; $('#ex-next').focus();
    }, 100);
  }
}
function exFinish() {
  exClear();
  const N = exm.qs.length, right = exm.ans.filter(Boolean).length, pct = right / N;
  $('#ex-run').hidden = true; $('#ex-res').hidden = false; $('#ex-config').hidden = false;
  PROG.exam(pct, N);
  exm.lastWrong = exm.qs.filter((q, i) => !exm.ans[i]).map(q => q.src);
  const per = {};
  exm.qs.forEach((q, i) => { const m = per[q.mod] = per[q.mod] || { r: 0, n: 0 }; m.n++; if (exm.ans[i]) m.r++; });
  const grade = pct >= 0.9 ? 'Excelente' : pct >= 0.75 ? 'Muy bien' : pct >= 0.6 ? 'Aprobado' : 'A repasar';
  $('#ex-res-stats').innerHTML = [['Nota', Math.round(pct * 100) + '%'], ['Correctas', `${right} / ${N}`], ['Calificación', grade], ['Mejor racha', '🔥 ' + exm.best], ['Mejor nota', Math.round(PROG.get().exam.pct * 100) + '%']]
    .map(([a, b]) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('');
  const weak = Object.entries(per).filter(([, v]) => v.r / v.n < 0.6).map(([m]) => `<a href="#${m}">${MOD_NAME[m] || m}</a>`);
  $('#ex-res-explain').className = 'explain ' + (pct >= 0.75 ? 'good' : pct < 0.6 ? 'bad' : '');
  $('#ex-res-explain').innerHTML = (pct >= 0.9 ? '<strong>Dominas el material.</strong> El siguiente paso no es más teoría: es el simulador y luego demo.' : pct >= 0.6 ? '<strong>Buena base.</strong>' : '<strong>Toca repasar.</strong>') +
    (weak.length ? ` Módulos a reforzar: ${weak.join(', ')}.` : ' Sin módulos flojos en esta muestra.');
  const t = document.createElement('table'); t.className = 't'; t.style.maxWidth = '640px';
  t.innerHTML = '<thead><tr><th>Módulo</th><th>Correctas</th><th>%</th></tr></thead><tbody>' +
    Object.entries(per).sort((a, b) => a[1].r / a[1].n - b[1].r / b[1].n).map(([m, v]) => `<tr${v.r / v.n < 0.6 ? ' class="hl"' : ''}><td><a href="#${m}">${MOD_NAME[m] || m}</a></td><td>${v.r} / ${v.n}</td><td>${Math.round(100 * v.r / v.n)}%</td></tr>`).join('') + '</tbody>';
  $('#ex-res-table').replaceChildren(t);
  $('#ex-wrong').disabled = !exm.lastWrong.length;
  exBest();
  $('#ex-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function initExamen() {
  const gm = exGroupsOf(), counts = {};
  QUIZ_BANK.forEach(q => { const g = gm[q.mod]; counts[g] = (counts[g] || 0) + 1; });
  $('#ex-groups').innerHTML = Object.keys(GROUP_NAME).filter(g => counts[g]).map(g => `<label class="grp"><input type="checkbox" value="${g}" checked> ${GROUP_NAME[g]} <span class="lbl">(${counts[g]})</span></label>`).join('');
  segBind($('#m-examen'), () => {});
  $('#ex-start').addEventListener('click', () => exStart());
  $('#ex-again').addEventListener('click', () => exStart());
  $('#ex-wrong').addEventListener('click', () => { if (exm.lastWrong.length) exStart(shuffle(exm.lastWrong)); });
  $('#ex-next').addEventListener('click', () => { if (exm.i < exm.qs.length - 1) { exm.i++; exShow(); } else exFinish(); });
  $('#ex-quit').addEventListener('click', () => { exClear(); $('#ex-run').hidden = true; $('#ex-config').hidden = false; });
  document.addEventListener('keydown', e => {
    if ($('#ex-run').hidden || !$('#m-examen').classList.contains('active') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase(), idx = 'abcde'.indexOf(k) >= 0 ? 'abcde'.indexOf(k) : '12345'.indexOf(k);
    if (idx >= 0) { const b = $$('#ex-q .opt')[idx]; if (b) { e.preventDefault(); b.click(); } }
    else if (k === 'enter' && !$('#ex-next').disabled && document.activeElement !== $('#ex-next')) { e.preventDefault(); $('#ex-next').click(); }
  });
  exBest();
}

export { shuffle, exm, EX_T, exClear, exGroupsOf, exBest, exStart, exShow, exFinish, initExamen };
