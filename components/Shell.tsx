'use client';
// Armazón de la academia: barra lateral, barra superior, ficha derecha, dock y buscador.
// También traduce los enlaces heredados "#modulo" / "#ancla-de-otro-modulo" a rutas de Next.
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BY_ID, ID2MOD, markHydrated, modHref } from '@/lib/site';
import { initPrefs, useUI } from '@/lib/ui';
import { Dock, Rail, Topbar, hasRail } from './Chrome';
import Palette from './Palette';
import Sidebar from './Sidebar';
import { useProgress } from './useProgress';

export const modFromPath = (p: string | null) => { const seg = (p || '/').split('/').filter(Boolean)[0]; return seg && BY_ID[seg] ? seg : 'inicio'; };

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(), router = useRouter(), mod = modFromPath(pathname);
  const st = useProgress(), { lesson } = useUI();
  const [navOpen, setNavOpen] = useState(false), [search, setSearch] = useState(false), [, setHyd] = useState(false);

  useEffect(() => { initPrefs(); markHydrated(); setHyd(true); }, []);
  useEffect(() => { setNavOpen(false); }, [pathname]);

  // atajos: Ctrl/Cmd+K y "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null, tn = t?.tagName;
      const typing = (tn === 'INPUT' && !['checkbox', 'range'].includes((t as HTMLInputElement).type)) || tn === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(s => !s); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setSearch(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // enlaces heredados con hash
  useEffect(() => {
    const target = (id: string) => {
      if (!id || document.getElementById(id)) return null;
      if (id === 'inicio') return '/';
      if (BY_ID[id]) return modHref(id);
      if (ID2MOD[id]) return `${modHref(ID2MOD[id])}#${id}`;
      return null;
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a) return;
      const to = target(decodeURIComponent(a.getAttribute('href')!.slice(1)));
      if (to) { e.preventDefault(); router.push(to); }
    };
    const onHash = () => {
      const to = target(decodeURIComponent(location.hash.slice(1)));
      if (to) { history.replaceState(null, '', location.pathname + location.search); router.push(to); }
    };
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('hashchange', onHash); };
  }, [router]);

  return (
    <>
      <div className={'app' + (navOpen ? ' nav-open' : '')} id="app">
        <Sidebar mod={mod} st={st} lesson={lesson} onSearch={() => setSearch(true)} />
        <div className="scrim" onClick={() => setNavOpen(false)} />
        <div className="page">
          <Topbar mod={mod} onMenu={() => setNavOpen(o => !o)} onSearch={() => setSearch(true)} />
          <div className={'layout' + (hasRail(mod) ? '' : ' no-rail')} id="layout">
            <main className="wrap">{children}</main>
            <Rail mod={mod} st={st} lesson={lesson} />
          </div>
          <footer>
            <div className="wrap">
              <p><strong>Aviso:</strong> contenido educativo, no es asesoramiento financiero. Los gráficos usan datos simulados. Ningún indicador ni modelo garantiza resultados: practica en demo, haz backtesting y gestiona el riesgo.</p>
            </div>
          </footer>
        </div>
      </div>
      <Dock mod={mod} st={st} onSearch={() => setSearch(true)} />
      {search && <Palette onClose={() => setSearch(false)} />}
    </>
  );
}
