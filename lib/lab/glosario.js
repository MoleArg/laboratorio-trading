// Motor interactivo · glosario. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
/* eslint-disable */
import { GLOSS } from './shared';
import { $, newSeed } from './core';
import { CHECK, TODO_STEPS, buildTodo, renderCheck, renderRisk, renderTodo, todo } from './todo';
/* =====================================================================
   GLOSARIO
   ===================================================================== */

function renderGloss() {
  const q = ($('#gloss-q').value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const host = $('#gloss'); host.innerHTML = '';
  GLOSS.filter(g => g.join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).forEach(([t, en, d]) => {
    const div = document.createElement('div'); div.className = 'term';
    const b = document.createElement('b'); b.textContent = t; div.appendChild(b);
    if (en) { const s = document.createElement('small'); s.textContent = en; div.appendChild(s); }
    const p = document.createElement('p'); p.textContent = d; div.appendChild(p);
    host.appendChild(div);
  });
}

function initTodo() {
  $('#todo-prev').addEventListener('click', () => { todo.step = Math.max(0, todo.step - 1); renderTodo(); });
  $('#todo-next').addEventListener('click', () => { todo.step = Math.min(TODO_STEPS - 1, todo.step + 1); renderTodo(); });
  $('#todo-new').addEventListener('click', () => { todo.seed = newSeed(); buildTodo(); todo.step = 0; renderTodo(); });
  buildTodo(); renderTodo();
  const cl = $('#checklist');
  CHECK.forEach(([req, s]) => {
    const lab = document.createElement('label'); const cb = document.createElement('input'); cb.type = 'checkbox';
    cb.addEventListener('change', renderCheck); lab.appendChild(cb);
    const sp = document.createElement('span'); sp.textContent = (req ? '★ ' : '') + s; lab.appendChild(sp); cl.appendChild(lab);
  });
  renderCheck();
  ['#rk-cap', '#rk-pct', '#rk-entry', '#rk-stop', '#rk-tp'].forEach(s => $(s).addEventListener('input', renderRisk));
  renderRisk();
}
function initGlosario() { $('#gloss-q').addEventListener('input', renderGloss); renderGloss(); }

export { renderGloss, initTodo, initGlosario };
