// Puente entre las páginas de Next.js y el motor interactivo heredado.
// mount(mod) inicializa los gráficos y controles de un módulo ya renderizado y devuelve la limpieza:
// listeners de document/window, intervalos creados al iniciar y animaciones en curso.
import { INITS } from './registry';
import { FIGS, refreshColors, safe, stopPlayers } from './core';
import { rpStop } from './replay';
import { exClear } from './examen';
import { renderGloss } from './glosario';
import { MV, mc } from './repaso';

export function rerenderAll() {
  refreshColors();
  FIGS.forEach(f => safe('render', f));
  const host = document.getElementById('mc-viz');
  if (host && mc.cards[mc.i]) safe('mc-viz', () => MV[mc.cards[mc.i].id](host));
}

export function mount(mod) {
  const init = INITS[mod];
  const cleanups = [];
  const docAdd = document.addEventListener, winAdd = window.addEventListener, setInt = window.setInterval;
  document.addEventListener = function (t, f, o) { cleanups.push(() => document.removeEventListener(t, f, o)); return docAdd.call(document, t, f, o); };
  window.addEventListener = function (t, f, o) { cleanups.push(() => window.removeEventListener(t, f, o)); return winAdd.call(window, t, f, o); };
  window.setInterval = function (...a) { const id = setInt.apply(window, a); cleanups.push(() => clearInterval(id)); return id; };
  try {
    refreshColors();
    if (init) safe(mod, init);
    if (mod === 'glosario') {
      const q = new URLSearchParams(location.search).get('q');
      const inp = document.getElementById('gloss-q');
      if (q && inp) { inp.value = q; renderGloss(); }
    }
  } finally {
    document.addEventListener = docAdd; window.addEventListener = winAdd; window.setInterval = setInt;
  }
  return () => {
    cleanups.forEach(c => { try { c(); } catch (e) { /* ya eliminado */ } });
    stopPlayers();
    if (mod === 'replay') rpStop();
    if (mod === 'examen') exClear();
  };
}
