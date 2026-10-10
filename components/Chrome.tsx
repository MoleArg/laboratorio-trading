'use client';
// Barra superior (migas), ficha derecha del módulo y dock inferior.
import Link from 'next/link';
import { ACADEMY, BY_ID, GROUP_META, GROUP_NAME, MODULES, modHref, modProg, nextStep, academyMods, lastVisited } from '@/lib/site';
import type { ProgressState } from '@/lib/progress';
import SessionChip from './SessionChip';
import { ThemeButton } from './Sidebar';

export function Topbar({ mod, onMenu, onSearch }: { mod: string; onMenu: () => void; onSearch: () => void }) {
  const m = BY_ID[mod], g = m?.group;
  return (
    <div className="topbar">
      <button className="hamb" type="button" aria-label="Abrir menú" onClick={onMenu}>☰</button>
      <nav className="crumbs" aria-label="Ruta">
        {mod === 'inicio' || !m ? <b>Inicio</b> : (
          <>
            <Link href="/">Inicio</Link><span className="sep s1">/</span>
            {g && ACADEMY.includes(g) && <><Link className="c-grp" href={modHref(MODULES.find(x => x.group === g)!.id)}>{GROUP_NAME[g]}</Link><span className="sep">/</span></>}
            <b>{m.name}</b>
          </>
        )}
      </nav>
      <div className="top-actions">
        <SessionChip />
        <button className="icon-btn" type="button" aria-label="Buscar" onClick={onSearch}>🔎<span className="lbl-hide">Buscar</span></button>
        <ThemeButton className="icon-btn" />
      </div>
    </div>
  );
}

export const hasRail = (mod: string) => !!BY_ID[mod] && !['inicio', 'glosario', 'examen', 'repaso'].includes(mod);

export function Rail({ mod, st, lesson }: { mod: string; st: ProgressState; lesson: string | null }) {
  const I = BY_ID[mod];
  if (!hasRail(mod) || !I) return <aside className="rail" id="rail" aria-label="Detalles del módulo" />;
  const P = modProg(mod, st), q = st.quiz[mod], g = I.group, nx = nextStep(mod, st);
  return (
    <aside className="rail" id="rail" aria-label="Detalles del módulo">
      <div className="rail-card">
        <div className="rc-title">Detalles del módulo</div>
        <dl className="kv">
          <dt>Módulo</dt><dd>{I.num}</dd><dt>Curso</dt><dd>{GROUP_NAME[g] || '—'}</dd><dt>Nivel</dt><dd>{GROUP_META[g]?.lvl || '—'}</dd>
          <dt>Lecciones</dt><dd>{I.lessons.length}</dd><dt>Lectura</dt><dd>~{I.min} min</dd><dt>Gráficos interactivos</dt><dd>{I.charts}</dd>
          {I.qn > 0 && <><dt>Preguntas</dt><dd>{I.qn}</dd></>}
        </dl>
      </div>
      <div className="rail-card">
        <div className="rc-title">Tu progreso<span className="more">{Math.round(P.p * 100)}%</span></div>
        <div className="consensus">
          {I.lessons.map(l => <span key={l.id} className={st.lessons[l.id] ? 'read' : l.id === lesson ? 'cur' : ''} title={l.t} />)}
          {I.quizId && <span className={'qz' + (P.qok ? ' ok' : '')} title="Práctica" />}
        </div>
        <div className="cons-legend"><span><b>{P.read ?? P.done}</b> de {I.lessons.length} leídas</span><span>Quiz: <b>{q ? Math.round(q.best * 100) + '%' : '—'}</b></span></div>
      </div>
      <Link className="rail-card rail-next" href={nx.href}><small>{nx.k}</small><b>{nx.t} →</b></Link>
      {I.terms.length > 0 && (
        <div className="rail-card">
          <div className="rc-title">Términos clave<Link className="more" href="/glosario/">Glosario</Link></div>
          <div className="tags">{I.terms.map(t => <Link key={t} href={`/glosario/?q=${encodeURIComponent(t.split(/ \(| \/ /)[0])}`}>{t}</Link>)}</div>
        </div>
      )}
    </aside>
  );
}

export function Dock({ mod, st, onSearch }: { mod: string; st: ProgressState; onSearch: () => void }) {
  let p: number, label: React.ReactNode, nx: { href: string; t: string; k: string };
  if (!BY_ID[mod] || mod === 'glosario') {
    const am = academyMods(), tot = am.reduce((s, m) => s + modProg(m.id, st).p, 0) / am.length, c = lastVisited(st);
    p = tot; label = <><b>{Math.round(tot * 100)}%</b> <span>de la academia</span></>; nx = { href: modHref(c), t: BY_ID[c].name, k: 'Continuar' };
  } else {
    const P = modProg(mod, st); p = P.p; label = <><b>{P.done}/{P.steps}</b> <span>pasos</span></>; nx = nextStep(mod, st);
  }
  return (
    <div className="dock" id="dock">
      <div className="dock-bar"><div style={{ width: (p * 100).toFixed(1) + '%' }} /></div>
      <div className="dock-prog"><span className="ring" style={{ '--p': Math.round(p * 100) } as React.CSSProperties} />{label}</div>
      <button className="dock-ask" type="button" aria-label="Buscar" onClick={onSearch}><i className="ic">🔎</i><span>Pregunta o busca: un término, una lección, un módulo…</span><kbd>/</kbd></button>
      <Link className="btn primary dock-next" href={nx.href}><small>{nx.k}:</small> {nx.t.length > 26 ? nx.t.slice(0, 25) + '…' : nx.t} →</Link>
    </div>
  );
}
