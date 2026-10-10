'use client';
// Portada: continuar, métricas, cursos por grupo, camino de módulos y accesos de práctica.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ACADEMY, BY_ID, GROUP_META, GROUP_NAME, MODULES, academyMods, lastVisited, modHref, modProg, nextStep, replaySessions, suggestNext } from '@/lib/site';
import { streakOf } from '@/lib/progress';
import quizzes from '@/data/quizzes.json';
import SessionChip from './SessionChip';
import { useProgress } from './useProgress';

const QUIZ_COUNT = Object.values(quizzes).reduce((s, q) => s + q.qs.length, 0);

function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/* ilustración de cada curso (SVG generado, determinista) */
function artSVG(g: string, seed: number) {
  const c = (GROUP_META[g] || GROUP_META.prac).col, r = mulberry32(seed), id = 'ga' + g + seed;
  let s = `<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="300" height="120" fill="url(#${id})"/>`;
  s += '<g opacity=".18" stroke="#fff">' + [30, 60, 90].map(y => `<line x1="0" x2="300" y1="${y}" y2="${y}"/>`).join('') + '</g>';
  if (g === 'fund' || g === 'prac') {
    let p = 70;
    for (let i = 0; i < 16; i++) {
      const o = p, cl = p + (r() - 0.45) * 22, hi = Math.min(o, cl) - r() * 10, lo = Math.max(o, cl) + r() * 10, x = 22 + i * 17, up = cl < o;
      s += `<line x1="${x}" x2="${x}" y1="${hi.toFixed(1)}" y2="${lo.toFixed(1)}" stroke="#fff" stroke-width="1.5" opacity=".85"/><rect x="${x - 5}" y="${Math.min(o, cl).toFixed(1)}" width="10" height="${Math.max(2, Math.abs(cl - o)).toFixed(1)}" rx="1.5" fill="${up ? '#fff' : 'none'}" stroke="#fff" stroke-width="1.5"/>`;
      p = Math.max(25, Math.min(95, cl));
    }
    if (g === 'prac') s += '<circle cx="250" cy="60" r="26" fill="rgba(255,255,255,.22)"/><path d="M242 46 L264 60 L242 74 Z" fill="#fff"/>';
  } else if (g === 'ind') {
    let d = 'M0 70', d2 = 'M0 100';
    for (let x = 0; x <= 300; x += 10) { d += ` L${x} ${(55 + Math.sin(x / 28) * 18 + Math.sin(x / 9) * 5).toFixed(1)}`; d2 += ` L${x} ${(100 + Math.sin(x / 28 + 1) * 10).toFixed(1)}`; }
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="${d2}" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><line x1="0" x2="300" y1="92" y2="92" stroke="#fff" stroke-dasharray="4 4" opacity=".6"/>`;
  } else if (g === 'smc') {
    s += '<line x1="20" x2="280" y1="38" y2="38" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/><rect x="150" y="62" width="110" height="22" fill="rgba(255,255,255,.25)" stroke="#fff"/>';
    s += '<path d="M20 90 L60 52 L90 70 L130 40 L150 30 L165 70 L200 95 L240 60 L280 20" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
    for (let i = 0; i < 6; i++) s += `<path d="M${40 + i * 16} 32 l5 -7 l5 7z" fill="#fff" opacity=".8"/>`;
  } else {
    let d = 'M10 95', v = 95;
    for (let x = 10; x <= 290; x += 14) { v = Math.max(18, Math.min(105, v - 4 + (r() - 0.5) * 16)); d += ` L${x} ${v.toFixed(1)}`; }
    s += `<path d="${d} L290 120 L10 120 Z" fill="rgba(255,255,255,.18)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    s += '<path d="M245 22 l20 7 v14 c0 12 -9 20 -20 24 c-11 -4 -20 -12 -20 -24 v-14z" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="2"/>';
  }
  return s + '</svg>';
}
const Art = ({ g, seed }: { g: string; seed: number }) => <div className="art" dangerouslySetInnerHTML={{ __html: artSVG(g, seed) }} />;

export default function HomePage() {
  const st = useProgress();
  const [sessions, setSessions] = useState<{ exp: number }[]>([]);
  useEffect(() => { setSessions(replaySessions()); }, [st]);
  const am = academyMods(), tot = am.reduce((s, m) => s + modProg(m.id, st).p, 0) / am.length;
  const c = lastVisited(st), cm = BY_ID[c], cp = modProg(c, st), nx = nextStep(c, st), visited = !!st.visited[c];
  const lessonsRead = Object.keys(st.lessons).length, lessonsTot = am.reduce((s, m) => s + m.lessons.length, 0);
  const qmods = am.filter(m => m.qn), qok = qmods.filter(m => modProg(m.id, st).qok).length;
  const sug = suggestNext(st);
  const nMods = MODULES.filter(m => m.id !== 'glosario').length;
  let k = 0;
  return (
    <section className="module active" id="m-inicio" data-mod="inicio">
      <div className="home-hero">
        <div>
          <div className="kicker">Academia · Laboratorio de Trading</div>
          <h2>Aprende a leer el mercado con gráficos que puedes tocar.</h2>
          <p className="lead">{nMods} módulos interactivos: mercados, velas, soportes, estructura, Fibonacci, sesiones, volumen, medias móviles, RSI, estocástico, MACD, ATR y Bollinger, liquidez, Smart Money, CRT, SMT, órdenes, costos y gestión del riesgo. Practica con tarjetas de repaso, un simulador vela a vela y un examen final. Todos los datos son simulados con fines educativos.</p>
          <div className="home-stats">
            {[['Academia', Math.round(tot * 100) + '%'], ['Lecciones leídas', `${lessonsRead}/${lessonsTot}`], ['Quizzes aprobados', `${qok}/${qmods.length}`],
              ['Racha', '🔥 ' + streakOf(st) + ' d'], ['Estrellas', '★ ' + (st.micro.stars || 0)], ['Examen', st.exam ? Math.round(st.exam.pct * 100) + '%' : '—']]
              .map(([a, b]) => <div key={a}><small>{a}</small><b>{b}</b></div>)}
          </div>
        </div>
        <div className="cont-card">
          <Art g={cm.group} seed={5} />
          <small>{visited ? 'Continúa donde lo dejaste' : 'Empieza por aquí'} · {GROUP_NAME[cm.group]}</small>
          <b>{cm.name}</b>
          <div className="bar"><div style={{ width: Math.round(cp.p * 100) + '%' }} /></div>
          <small>{Math.round(cp.p * 100)}% completado · {nx.k}: {nx.t}</small>
          <Link className="btn primary" href={visited ? nx.href : modHref(c)}>▶ {visited ? 'Continuar' : 'Empezar'}</Link>
        </div>
      </div>

      <h3 className="home-h">Cursos <small>cinco recorridos, de lo básico a la práctica</small></h3>
      <div className="courses">
        {ACADEMY.map((g, i) => {
          const mods = am.filter(m => m.group === g), p = mods.reduce((s, m) => s + modProg(m.id, st).p, 0) / mods.length, first = mods.find(m => modProg(m.id, st).p < 1) || mods[0];
          return (
            <Link key={g} className="course" href={modHref(first.id)}>
              <div style={{ position: 'relative' }}><Art g={g} seed={i + 11} /><span className="lvl">{GROUP_META[g].lvl}</span></div>
              <div className="body">
                <b>{GROUP_NAME[g]}</b><p>{GROUP_META[g].d}</p>
                <div className="bar"><div style={{ width: Math.round(p * 100) + '%' }} /></div>
                <div className="meta"><span>{mods.length} módulos · {mods.reduce((s, m) => s + m.lessons.length, 0)} lecciones</span><span>{Math.round(p * 100)}%</span></div>
              </div>
            </Link>
          );
        })}
      </div>

      <h3 className="home-h">Tu camino <small>el orden recomendado; el anillo muestra tu avance en cada módulo</small></h3>
      <div className="path">
        {ACADEMY.map(g => {
          const mods = am.filter(m => m.group === g), dn = mods.filter(m => modProg(m.id, st).p >= 1).length;
          return (
            <div key={g}>
              <div className="path-sec"><span>{GROUP_NAME[g]}<small>{dn}/{mods.length}</small></span></div>
              {mods.map(m => {
                const P = modProg(m.id, st), off = Math.round(Math.sin(k++ * 0.9) * 110), cls = P.p >= 1 ? 'done' : m.id === sug ? 'next' : '';
                return (
                  <Link key={m.id} className={`pnode ${cls}${off < 0 ? ' left' : ''}`} href={modHref(m.id)} style={{ transform: `translateX(${off}px)` }}>
                    <span className="disc" style={{ '--p': Math.round(P.p * 100) } as React.CSSProperties}><i>{P.p >= 1 ? '✓' : m.num}</i></span>
                    <span className="lab"><b>{m.name}</b>{P.steps ? `${P.done}/${P.steps} pasos` : ''}</span>
                    {m.id === sug && <span className="pop">Empieza aquí</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      <h3 className="home-h">Practica</h3>
      <div className="quick">
        <Link className="qcard" href="/repaso/"><span className="ic">⚡</span><b>Repaso rápido</b><small>Tarjetas de 1 minuto · ★ {st.micro.stars || 0} estrellas</small></Link>
        <Link className="qcard" href="/replay/"><span className="ic">▶</span><b>Simulador</b><small>{sessions.length ? `${sessions.length} sesiones · última ${sessions[0].exp >= 0 ? '+' : ''}${sessions[0].exp.toFixed(2)}R` : 'Opera un mercado vela a vela'}</small></Link>
        <Link className="qcard" href="/examen/"><span className="ic">✎</span><b>Examen final</b><small>{st.exam ? `Mejor nota ${Math.round(st.exam.pct * 100)}%` : `${QUIZ_COUNT} preguntas de todos los módulos`}</small></Link>
        <div className="qcard"><span className="ic">◷</span><b>Sesiones en vivo</b><small><SessionChip style={{ marginTop: 4 }} /></small></div>
      </div>
      <div className="callout warn" style={{ marginTop: 24 }}><h5>Aviso</h5>Contenido educativo, no es asesoramiento financiero. Ningún indicador ni modelo garantiza resultados: practica en demo, haz backtesting y gestiona el riesgo.</div>
    </section>
  );
}
