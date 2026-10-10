'use client';
// Barra lateral estilo academia: árbol de cursos con el avance de cada módulo y las lecciones del módulo abierto.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ACADEMY, BY_ID, GROUP_NAME, MODULES, modHref, modProg } from '@/lib/site';
import { PROG, streakOf, type ProgressState } from '@/lib/progress';
import { setHollow, setTheme, useUI } from '@/lib/ui';

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <defs><linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2f6fd6" /><stop offset="1" stopColor="#1fa38a" /></linearGradient></defs>
    <rect width="32" height="32" rx="8" fill="url(#lg-logo)" />
    <path d="M9 8v16M16 5v20M23 9v15" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
    <rect x="6.5" y="12" width="5" height="8" rx="1" fill="#fff" fillOpacity=".55" />
    <rect x="13.5" y="9" width="5" height="11" rx="1" fill="#fff" />
    <rect x="20.5" y="12" width="5" height="8" rx="1" fill="#fff" />
  </svg>
);

export function ThemeButton({ className }: { className: string }) {
  const { theme } = useUI();
  const light = theme === 'light';
  return (
    <button className={className} type="button" aria-label={light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'} onClick={() => setTheme(light ? 'dark' : 'light')}>
      {theme === null ? '◐' : light ? '☾' : '☀'}<span className="lbl-hide">{theme === null ? '' : light ? ' Oscuro' : ' Claro'}</span>
    </button>
  );
}

export default function Sidebar({ mod, st, lesson, onSearch }: { mod: string; st: ProgressState; lesson: string | null; onSearch: () => void }) {
  const cur = BY_ID[mod];
  const [open, setOpen] = useState<Set<string>>(() => new Set(cur ? [cur.group] : []));
  useEffect(() => { if (cur && ACADEMY.includes(cur.group)) setOpen(new Set([cur.group])); }, [mod]); // eslint-disable-line react-hooks/exhaustive-deps
  const { hollow } = useUI();
  const toggle = (g: string) => setOpen(s => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const mods = MODULES.filter(m => m.id !== 'glosario'), visible = mods.filter(m => m.group !== 'home');
  const seen = visible.filter(m => st.visited[m.id]).length;
  const qmods = MODULES.filter(m => m.qn), passed = qmods.filter(m => (st.quiz[m.id]?.best ?? 0) >= 0.8).length;
  const pct = (seen + passed) / (visible.length + qmods.length);
  const streak = streakOf(st);
  const link = (id: string, ic: string, label: string, badge?: string) => (
    <Link className={'side-link' + (mod === id ? ' on' : '')} href={modHref(id)}><span className="ic">{ic}</span>{label}{badge && <span className="badge">{badge}</span>}</Link>
  );
  return (
    <aside className="side" id="side" aria-label="Navegación de la academia">
      <Link className="side-brand" href="/">{LOGO}<span><b>Laboratorio de Trading</b><small>Academia interactiva</small></span></Link>
      <button className="side-search" type="button" onClick={onSearch}>🔎 Buscar…<kbd>Ctrl K</kbd></button>
      <nav id="side-nav">
        {link('inicio', '⌂', 'Inicio')}
        {link('repaso', '⚡', 'Repaso rápido', '★ ' + (st.micro.stars || 0))}
        {link('replay', '▶', 'Simulador')}
        {link('glosario', 'Aa', 'Glosario')}
        <div className="side-label">Academia</div>
        {ACADEMY.map(g => {
          const gm = mods.filter(m => m.group === g), done = gm.filter(m => modProg(m.id, st).p >= 1).length;
          return (
            <div key={g} className={'sg' + (open.has(g) ? ' open' : '')}>
              <button className="sg-head" type="button" onClick={() => toggle(g)}><span className="chev">▶</span>{GROUP_NAME[g]}<span className="cnt">{done}/{gm.length}</span></button>
              <div className="sg-body">
                {gm.map(m => {
                  const P = modProg(m.id, st), on = m.id === mod;
                  return (
                    <div key={m.id}>
                      <Link className={'sm' + (on ? ' on' : '')} href={modHref(m.id)}>
                        <span className={'st' + (P.p >= 1 ? ' done' : '')} style={{ '--p': Math.round(P.p * 100) } as React.CSSProperties} />
                        <span>{m.name}</span><span className="no">{m.num}</span>
                      </Link>
                      {on && (m.lessons.length > 0 || m.quizId) && (
                        <div className="sl">
                          {m.lessons.map(l => (
                            <a key={l.id} href={'#' + l.id} className={l.id === lesson ? 'cur' : ''}><span className={'lst' + (st.lessons[l.id] ? ' read' : '')} />{l.t}</a>
                          ))}
                          {m.quizId && <a href={'#' + m.quizId} className={m.quizId === lesson ? 'cur' : ''}><span className={'lst' + (P.qok ? ' read' : '')} />Práctica · {m.qn} preguntas</a>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="side-foot">
        <div id="prog">
          <div className="prog-bar"><div style={{ width: (pct * 100).toFixed(1) + '%' }} /></div>
          <span>{seen}/{visible.length} módulos vistos · {passed}/{qmods.length} quizzes aprobados (≥80%){st.exam ? ` · examen: mejor ${Math.round(st.exam.pct * 100)}%` : ''}</span>
          <button className="linkish" type="button" onClick={() => { if (confirm('¿Borrar tu progreso (módulos vistos, lecciones, quizzes, racha y examen)?')) PROG.reset(); }}>Reiniciar</button>
        </div>
        <div className="side-row">
          <span className={'streak' + (streak ? '' : ' off')}>🔥 {streak} día{streak === 1 ? '' : 's'} de racha</span>
          <ThemeButton className="theme-btn" />
        </div>
        <div className="prefs"><label><input type="checkbox" checked={hollow} onChange={e => setHollow(e.target.checked)} /> Velas huecas (daltonismo)</label></div>
      </div>
    </aside>
  );
}
