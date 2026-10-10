'use client';
// Estado de interfaz compartido entre el shell y las páginas: lección visible, tema y velas huecas.
import { useSyncExternalStore } from 'react';

type UI = { lesson: string | null; theme: 'dark' | 'light' | null; hollow: boolean };
let ui: UI = { lesson: null, theme: null, hollow: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const SERVER: UI = { lesson: null, theme: null, hollow: false };

export function useUI() { return useSyncExternalStore(subscribe, () => ui, () => SERVER); }
export function setLesson(lesson: string | null) { if (ui.lesson !== lesson) { ui = { ...ui, lesson }; emit(); } }

export function initPrefs() {
  const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  let hollow = false;
  try { hollow = localStorage.getItem('lt.hollow') === '1'; } catch { /* sin almacenamiento */ }
  document.body.classList.toggle('hollow', hollow);
  ui = { ...ui, theme, hollow }; emit();
}
export function setTheme(t: 'dark' | 'light') {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('lt.theme', t); } catch { /* sin almacenamiento */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#f5f6f7' : '#0b0e14');
  ui = { ...ui, theme: t }; emit();
  window.dispatchEvent(new Event('lt:rerender'));
}
export function setHollow(on: boolean) {
  document.body.classList.toggle('hollow', on);
  try { localStorage.setItem('lt.hollow', on ? '1' : '0'); } catch { /* sin almacenamiento */ }
  ui = { ...ui, hollow: on }; emit();
  window.dispatchEvent(new Event('lt:rerender'));
}
