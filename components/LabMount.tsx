'use client';
// Carga el motor interactivo (solo en el navegador) e inicializa los gráficos del módulo; limpia al salir.
import { useEffect } from 'react';

export default function LabMount({ mod }: { mod: string }) {
  useEffect(() => {
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
