'use client';
// Buscador global (Ctrl K o /): módulos, lecciones y términos del glosario.
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY, GROUP_NAME, MODULES, modHref, norm } from '@/lib/site';

type Item = { k: 'Módulo' | 'Lección' | 'Glosario'; t: string; s: string; body: string; href: string; nt: string; ns: string; nb: string };

function buildIndex(): Item[] {
  const raw: Omit<Item, 'nt' | 'ns' | 'nb'>[] = [];
  MODULES.forEach(m => raw.push({ k: 'Módulo', t: m.name, s: GROUP_NAME[m.group] || '', body: m.leadText, href: modHref(m.id) }));
  MODULES.forEach(m => { if (m.id !== 'examen') m.lessons.forEach(l => raw.push({ k: 'Lección', t: l.t, s: m.name, body: '', href: `${modHref(m.id)}#${l.id}` })); });
  GLOSSARY.forEach(g => raw.push({ k: 'Glosario', t: g.t, s: g.en, body: g.d, href: `/glosario/?q=${encodeURIComponent(g.t.split(/[ (/]/)[0])}` }));
  return raw.map(x => ({ ...x, nt: norm(x.t), ns: norm(x.s), nb: norm(x.body) }));
}

export default function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const idx = useMemo(buildIndex, []);
  const [q, setQ] = useState(''), [sel, setSel] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const res = useMemo(() => {
    const words = norm(q.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return idx.filter(x => x.k === 'Módulo');
    return idx.map(x => {
      let sc = 0;
      for (const w of words) {
        const a = x.nt.indexOf(w);
        if (a === 0) sc += 10; else if (a > 0) sc += 6; else if (x.ns.includes(w)) sc += 3; else if (x.nb.includes(w)) sc += 1; else return null;
      }
      return { x, sc: sc + (x.k === 'Módulo' ? 2 : x.k === 'Glosario' ? 1 : 0) };
    }).filter((r): r is { x: Item; sc: number } => !!r).sort((a, b) => b.sc - a.sc).slice(0, 40).map(r => r.x);
  }, [q, idx]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { listRef.current?.children[sel]?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  const go = (r?: Item) => { if (!r) return; onClose(); router.push(r.href); };
  return (
    <div id="palette" role="dialog" aria-modal="true" aria-label="Buscador" onClick={e => { if ((e.target as HTMLElement).id === 'palette') onClose(); }}>
      <div className="pal-box">
        <input id="pal-q" type="text" autoFocus autoComplete="off" aria-label="Buscar" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Busca un módulo, una lección o un término (ej. fibonacci, FVG, drawdown)…"
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(res.length - 1, s + 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
            else if (e.key === 'Enter') { e.preventDefault(); go(res[sel]); }
            else if (e.key === 'Escape') onClose();
          }} />
        <ul id="pal-list" role="listbox" ref={listRef}>
          {!res.length && <li className="pal-empty">Sin resultados</li>}
          {res.map((r, i) => (
            <li key={r.k + r.href + r.t} role="option" aria-selected={i === sel} className={'pal-item' + (i === sel ? ' on' : '')} onMouseMove={() => setSel(i)} onClick={() => go(r)}>
              <span className={'pal-k pal-' + (r.k === 'Módulo' ? 'm' : r.k === 'Lección' ? 'l' : 'g')}>{r.k}</span><span className="pal-t">{r.t}</span><span className="pal-s">{r.s}</span>
            </li>
          ))}
        </ul>
        <div className="pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> moverse</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span><span><kbd>/</kbd> o <kbd>Ctrl K</kbd> desde cualquier lugar</span></div>
      </div>
    </div>
  );
}
