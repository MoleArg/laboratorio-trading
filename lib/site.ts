// Datos del sitio: módulos, grupos y progreso calculado a partir del manifiesto generado.
import manifest from '@/lib/generated/manifest.json';
import glossary from '@/data/glossary.json';
import type { ProgressState } from '@/lib/progress';

export type Lesson = { id: string; t: string };
export type ModuleInfo = {
  id: string; name: string; num: string; group: string; title: string; lead: string; leadText: string;
  toc: { id: string; label: string }[]; lessons: Lesson[]; quizId: string | null; qn: number; min: number; charts: number; terms: string[];
};

export const MODULES = manifest.modules as ModuleInfo[];
export const ID2MOD = manifest.ids as Record<string, string>;
export const GLOSSARY = glossary as { t: string; en: string; d: string }[];
export const BY_ID: Record<string, ModuleInfo> = Object.fromEntries(MODULES.map(m => [m.id, m]));

export const GROUP_NAME: Record<string, string> = { home: 'Inicio', fund: 'Fundamentos', ind: 'Indicadores', smc: 'Smart Money / ICT', ges: 'Gestión y riesgo', prac: 'Práctica' };
export const GROUP_META: Record<string, { lvl: string; col: [string, string]; d: string }> = {
  fund: { lvl: 'Básico', col: ['#2f6fd6', '#1fa38a'], d: 'Mercados, velas, soportes, estructura, líneas de tendencia, Fibonacci, sesiones y volumen: aprender a leer un gráfico.' },
  ind: { lvl: 'Intermedio', col: ['#7c5cf0', '#2f6fd6'], d: 'Medias móviles, RSI, estocástico, MACD, ATR y Bollinger: qué mide cada indicador y cuándo engaña.' },
  smc: { lvl: 'Avanzado', col: ['#d18a00', '#e5484d'], d: 'Liquidez, order blocks, FVG, CRT y SMT: cómo se mueve el precio entre zonas de stops.' },
  ges: { lvl: 'Esencial', col: ['#089981', '#2f6fd6'], d: 'Órdenes, costos, apalancamiento, expectativa y drawdown: lo que decide si sobrevives.' },
  prac: { lvl: 'Aplicado', col: ['#e5484d', '#7c5cf0'], d: 'Escenario completo, repaso rápido, simulador vela a vela y examen final.' }
};
export const ACADEMY = ['fund', 'ind', 'smc', 'ges', 'prac'];
export const academyMods = () => MODULES.filter(m => ACADEMY.includes(m.group) && m.id !== 'glosario');
export const modHref = (id: string) => (id === 'inicio' ? '/' : `/${id}/`);
export const isNumbered = (m: ModuleInfo) => /^\d+$/.test(m.num);

// Hasta que el shell se hidrata se usa un valor vacío, igual que en el HTML estático.
let HYD = false;
export const markHydrated = () => { HYD = true; };
export function replaySessions(): { exp: number }[] {
  if (!HYD || typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('lt.replay.sessions') || '[]'); } catch { return []; }
}

export type ModProg = { p: number; done: number; steps: number; read?: number; qok?: boolean; best?: number };
export function modProg(id: string, st: ProgressState): ModProg {
  const I = BY_ID[id];
  if (!I) return { p: 0, done: 0, steps: 0 };
  if (id === 'examen') return { p: st.exam ? 1 : 0, done: st.exam ? 1 : 0, steps: 1 };
  if (id === 'repaso') { const d = Math.min(3, st.micro.decks || 0); return { p: d / 3, done: d, steps: 3 }; }
  const read = I.lessons.filter(l => st.lessons[l.id]).length;
  if (id === 'replay') { const n = replaySessions().length, d = read + (n ? 1 : 0); return { p: d / (I.lessons.length + 1), done: d, steps: I.lessons.length + 1, read }; }
  const q = st.quiz[id], qok = !!(q && q.best >= 0.8), steps = I.lessons.length + (I.qn ? 1 : 0), done = read + (qok ? 1 : 0);
  return { p: steps ? done / steps : st.visited[id] ? 1 : 0, done, steps, read, qok, best: q ? q.best : undefined };
}
export function nextStep(id: string, st: ProgressState): { href: string; t: string; k: string } {
  const I = BY_ID[id];
  if (I) {
    const l = I.lessons.find(x => !st.lessons[x.id]);
    if (l) return { href: `${modHref(id)}#${l.id}`, t: l.t, k: 'Siguiente lección' };
    if (I.quizId && !modProg(id, st).qok) return { href: `${modHref(id)}#${I.quizId}`, t: 'Práctica de ' + I.name, k: 'Falta la práctica' };
  }
  const i = MODULES.findIndex(m => m.id === id), nx = MODULES.slice(i + 1).find(m => m.id !== 'glosario') || BY_ID.examen;
  return { href: modHref(nx.id), t: nx.name, k: 'Siguiente módulo' };
}
export const suggestNext = (st: ProgressState) => (academyMods().find(m => modProg(m.id, st).p < 1) || BY_ID.examen).id;
export function lastVisited(st: ProgressState) {
  let best: string | null = null;
  academyMods().forEach(m => { if (st.visited[m.id] && (!best || st.visited[m.id] > st.visited[best])) best = m.id; });
  return best && modProg(best, st).p < 1 ? best : suggestNext(st);
}
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
