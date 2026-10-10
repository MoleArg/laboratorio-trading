// Sesiones de mercado y conversión de zonas horarias. Generado por scripts/port-legacy.mjs.
const SESS = [
  { n: 'Sídney', tz: 'Australia/Sydney', o: 7, c: 16, col: '#3987e5' },
  { n: 'Tokio', tz: 'Asia/Tokyo', o: 9, c: 18, col: '#d95926' },
  { n: 'Londres', tz: 'Europe/London', o: 8, c: 17, col: '#199e70' },
  { n: 'Nueva York', tz: 'America/New_York', o: 8, c: 17, col: '#c98500' }
];
const KZ = [['Asia', 20, 24], ['Londres', 2, 5], ['Nueva York', 7, 10], ['Cierre LDN', 10, 12]];
const dtfCache = {};
function wall(tz, ms) {
  const f = dtfCache[tz] || (dtfCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const o = {}; f.formatToParts(new Date(ms)).forEach(p => { if (p.type !== 'literal') o[p.type] = +p.value; });
  return { y: o.year, mo: o.month, d: o.day, h: o.hour === 24 ? 0 : o.hour, mi: o.minute, s: o.second };
}
function tzOffset(tz, ms) { const w = wall(tz, ms); return Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) - Math.floor(ms / 1000) * 1000; }
function zonedToUtc(tz, y, mo, d, h, mi) {
  const g = Date.UTC(y, mo - 1, d, h, mi || 0);
  let r = g - tzOffset(tz, g); const o2 = tzOffset(tz, r);
  if (g - o2 !== r) r = g - o2;
  return r;
}

export { SESS, KZ, wall, tzOffset, zonedToUtc };
