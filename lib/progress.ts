// Progreso del estudiante en localStorage, con suscripción para React (useSyncExternalStore).
// La misma API la usa el motor interactivo (lib/lab) a través de PROG.

export type MicroState = { stars: number; decks: number; wrong: string[] };
export type ProgressState = {
  visited: Record<string, number>;
  quiz: Record<string, { best: number; at: number }>;
  lessons: Record<string, number>;
  days: string[];
  micro: MicroState;
  exam?: { pct: number; count: number; last: number; n: number };
};

const KEY = 'lt.progress';
const empty = (): ProgressState => ({ visited: {}, quiz: {}, lessons: {}, days: [], micro: { stars: 0, decks: 0, wrong: [] } });
export const EMPTY: ProgressState = empty();

let st: ProgressState = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const base = empty();
    st = { ...base, ...raw, micro: { ...base.micro, ...(raw.micro || {}) } };
  } catch {
    st = empty();
  }
}
function save() {
  st = { ...st };
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* sin almacenamiento */ }
  subs.forEach(f => f());
}
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function streakOf(s: ProgressState): number {
  const has = new Set(s.days), d = new Date();
  if (!has.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (has.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const PROG = {
  get(): ProgressState { load(); return st; },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  paint() { save(); },
  visit(m: string) { load(); st.visited = { ...st.visited, [m]: Date.now() }; save(); },
  lesson(id: string) { load(); if (id && !st.lessons[id]) { st.lessons = { ...st.lessons, [id]: Date.now() }; this.act(true); save(); } },
  act(quiet?: boolean) {
    load();
    const d = dayKey();
    if (!st.days.includes(d)) { st.days = [...st.days, d].slice(-400); if (!quiet) save(); }
  },
  streak(): number { load(); return streakOf(st); },
  micro(fn: (m: MicroState) => void) { load(); st.micro = { ...st.micro }; fn(st.micro); this.act(true); save(); },
  quiz(m: string, right: number, total: number) {
    load();
    const p = right / total, q = st.quiz[m];
    this.act(true);
    if (!q || p > q.best) st.quiz = { ...st.quiz, [m]: { best: p, at: Date.now() } };
    save();
  },
  exam(p: number, n: number) {
    load();
    this.act(true);
    const e = st.exam || { pct: 0, count: 0, last: 0, n: 0 };
    st.exam = { pct: Math.max(e.pct, p), count: e.count + 1, last: p, n };
    save();
  },
  reset() { st = empty(); save(); }
};

export const subscribe = (f: () => void) => PROG.subscribe(f);
export const getSnapshot = () => PROG.get();
export const getServerSnapshot = () => EMPTY;
