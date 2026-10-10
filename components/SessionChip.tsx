'use client';
// Chip "sesión en vivo": qué sesión de forex está abierta, killzone ICT y cuenta regresiva al próximo cambio.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KZ, SESS, wall, zonedToUtc } from '@/lib/time';

type Info = { closed: boolean; label: string; next?: { t: number; l: string }; kz?: string | null; open: string[] };

function sessInfo(now: number): Info {
  const nyW = wall('America/New_York', now), dow = new Date(Date.UTC(nyW.y, nyW.mo - 1, nyW.d)).getUTCDay();
  const weekend = dow === 6 || (dow === 5 && nyW.h >= 17) || (dow === 0 && nyW.h < 17);
  if (weekend) {
    const add = dow === 5 ? 2 : dow === 6 ? 1 : 0, dd = new Date(Date.UTC(nyW.y, nyW.mo - 1, nyW.d + add));
    return { closed: true, open: [], label: 'Mercado cerrado', next: { t: zonedToUtc('America/New_York', dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate(), 17, 0), l: 'abre' } };
  }
  const open: string[] = [], ev: { t: number; l: string }[] = [];
  for (const s of SESS) {
    const w = wall(s.tz, now);
    for (let k = -1; k <= 4; k++) {
      const dd = new Date(Date.UTC(w.y, w.mo - 1, w.d + k)), wd = dd.getUTCDay();
      if (wd === 0 || wd === 6) continue;
      const Y = dd.getUTCFullYear(), M = dd.getUTCMonth() + 1, D = dd.getUTCDate();
      const o = zonedToUtc(s.tz, Y, M, D, s.o, 0), c = zonedToUtc(s.tz, Y, M, D, s.c, 0);
      if (now >= o && now < c && !open.includes(s.n)) open.push(s.n);
      if (o > now) ev.push({ t: o, l: 'abre ' + s.n });
      if (c > now) ev.push({ t: c, l: 'cierra ' + s.n });
    }
  }
  ev.sort((a, b) => a.t - b.t);
  const h = nyW.h + nyW.mi / 60, kz = (KZ as [string, number, number][]).find(([, a, b]) => h >= a && h < b);
  return { closed: false, open, label: open.length ? open.join(' + ') : 'Entre sesiones', next: ev[0], kz: kz ? kz[0] : null };
}
const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
};

export default function SessionChip({ style }: { style?: React.CSSProperties }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const S = now ? sessInfo(now) : null;
  return (
    <Link className={'sess-chip sess-live' + (!S || S.closed || !S.open.length ? ' closed' : '')} href="/sesiones/#ses-reloj" style={style}
      title="Sesión de mercado en este momento (forex). Clic para ver el reloj de sesiones.">
      <span className="dot" />
      {S && <span className="sn">{S.label}{S.kz ? ' · KZ ' + S.kz : ''}</span>}
      {S && S.next && now && <span className="cd">{S.next.l} en {fmtDur(S.next.t - now)}</span>}
    </Link>
  );
}
