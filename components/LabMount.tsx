'use client';
// Carga el motor interactivo (solo en el navegador) e inicializa los gráficos del módulo; limpia al salir.
import { useEffect } from 'react';

// Simulador primero: las instrucciones cortas van arriba del gráfico y la teoría queda en un desplegable "Cómo funciona".
const HINT = /arrastra|mueve|pasa el cursor|elige|haz clic|pulsa|reproduce|activa|cambia|prueba|usa los/i;
function simFirst(sec: HTMLElement) {
  sec.querySelectorAll<HTMLElement>('article.lesson:not([data-sim])').forEach(ls => {
    ls.dataset.sim = '1';
    const figs = Array.from(ls.querySelectorAll<HTMLElement>(':scope > .fig'));
    if (!figs.length) return;
    const theory = Array.from(ls.querySelectorAll<HTMLElement>(':scope > .prose, :scope > .callout, :scope > .cols, :scope > .table-wrap'));
    const isHint = (p: HTMLElement) => p.classList.contains('prose') && p.textContent!.trim().length < 330 && HINT.test(p.textContent!);
    theory.filter(isHint).forEach(h => { h.classList.add('hint'); figs[0].before(h); });
    const rest = theory.filter(p => !p.classList.contains('hint'));
    if (!rest.length) return;
    const d = document.createElement('details'), s = document.createElement('summary');
    d.className = 'howto'; s.textContent = 'Cómo funciona · teoría y claves';
    d.append(s, ...rest);
    figs[figs.length - 1].after(d);
  });
}

export default function LabMount({ mod }: { mod: string }) {
  useEffect(() => {
    const sec = document.getElementById('m-' + mod);
    if (sec) simFirst(sec);
    let cleanup: (() => void) | undefined, dead = false;
    let rerender: (() => void) | undefined;
    import('@/lib/lab').then(lab => {
      if (dead) return;
      try { document.body.classList.toggle('hollow', localStorage.getItem('lt.hollow') === '1'); } catch { /* sin almacenamiento */ }
      cleanup = lab.mount(mod);
      rerender = () => lab.rerenderAll();
      window.addEventListener('lt:rerender', rerender);
      // si se llegó con un ancla, volver a ubicarla una vez dibujados los gráficos
      if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' });
    });
    return () => { dead = true; cleanup?.(); if (rerender) window.removeEventListener('lt:rerender', rerender); };
  }, [mod]);
  return null;
}
