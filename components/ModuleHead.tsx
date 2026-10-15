'use client';
// Cabecera del simulador, pestañas por lección (scroll-spy) y registro de lecciones leídas.
import { useEffect, useRef, useState } from 'react';
import { BY_ID, GROUP_META, GROUP_NAME, GICONS, ICONS, ACADEMY, modProg } from '@/lib/site';
import { PROG } from '@/lib/progress';
import { setLesson } from '@/lib/ui';
import { useProgress } from './useProgress';

export default function ModuleHead({ mod }: { mod: string }) {
  const m = BY_ID[mod], st = useProgress();
  const [cur, setCur] = useState<string | null>(null);
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    PROG.visit(mod);
    const sec = document.getElementById('m-' + mod);
    if (!sec) return;
    // lecciones leídas: cuando se ve el final de cada artículo
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) PROG.lesson((e.target as HTMLElement).dataset.l!); }), { rootMargin: '0px 0px -12% 0px' });
    sec.querySelectorAll('.rd-sentinel').forEach(s => io.observe(s));
    // lección visible
    let raf = 0;
    const spy = () => {
      raf = 0;
      const items = Array.from(sec.querySelectorAll<HTMLElement>('article.lesson[id], .quiz[id]'));
      let c: string | null = null;
      items.forEach(a => { if (a.getBoundingClientRect().top < 150) c = a.id; });
      if (!c && items.length && window.scrollY > 200) c = items[0].id;
      setCur(c); setLesson(c);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(spy); };
    window.addEventListener('scroll', onScroll, { passive: true });
    spy();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); setLesson(null); };
  }, [mod]);

  useEffect(() => {
    const row = tabsRef.current, on = row?.querySelector<HTMLElement>('a.on');
    if (row && on) row.scrollTo({ left: on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' });
  }, [cur]);

  if (!m) return null;
  const meta = GROUP_META[m.group], col = meta ? meta.col : ['#5b6474', '#3d4452'], P = modProg(mod, st);
  return (
    <>
      <div className="mod-head">
        <div className="mod-title">
          <div className="mod-icon" style={{ background: `linear-gradient(135deg,${col[0]},${col[1]})` }}>{ICONS[mod] || '•'}</div>
          <div>
            {ACADEMY.includes(m.group) && <span className="gchip">{GICONS[m.group]} {GROUP_NAME[m.group]}</span>}
            <h2>{m.title}</h2>
          </div>
        </div>
        {m.lead && <p className="lead" dangerouslySetInnerHTML={{ __html: m.lead }} />}
        {P.steps > 0 && m.id !== 'glosario' && (
          <div className="sim-meter"><span>{P.done}/{P.steps} pasos</span><div className="bar"><div style={{ width: Math.round(P.p * 100) + '%' }} /></div><b>{Math.round(P.p * 100)}%</b></div>
        )}
      </div>
      {m.toc.length > 0 && (
        <nav className="toc tabs-row" ref={tabsRef}>
          {m.toc.map(t => <a key={t.id} href={'#' + t.id} className={t.id === cur ? 'on' : ''}>{t.label}</a>)}
        </nav>
      )}
    </>
  );
}
