// Recalcula los datos derivados de lib/generated/manifest.json a partir de components/content/*.tsx:
// número de cada módulo (según el orden del manifiesto), numeración de las lecciones (N.1, N.2…),
// lecciones, anclas, gráficos, términos del glosario, preguntas del quiz y minutos de lectura.
// Lo editorial (name, group, title, lead, leadText, toc) se edita a mano en el manifiesto.
// Uso: node scripts/sync-manifest.mjs   (pnpm sync)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const MAN = join(ROOT, 'lib/generated/manifest.json');
const manifest = JSON.parse(readFileSync(MAN, 'utf8'));
const GLOSS = JSON.parse(readFileSync(join(ROOT, 'data/glossary.json'), 'utf8'));
const QUIZZES = JSON.parse(readFileSync(join(ROOT, 'data/quizzes.json'), 'utf8'));
const index = readFileSync(join(ROOT, 'components/content/index.ts'), 'utf8');

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const imports = Object.fromEntries([...index.matchAll(/import (\w+) from '\.\/(\w+)'/g)].map(m => [m[1], m[2]]));
const FILE = Object.fromEntries([...index.matchAll(/"(\w+)": (\w+)/g)].map(m => [m[1], imports[m[2]]]));
const GLOSS_KEYS = GLOSS.map(g => [g.t, norm(g.t.split(/ \(| \/ |, /)[0]).trim()]).filter(([, k]) => k.length >= 3);

// Texto visible aproximado de un fragmento JSX: literales {"…"}, texto entre etiquetas, sin atributos.
const jsxText = s => s
  .replace(/\{"((?:[^"\\]|\\.)*)"\}/g, (_, t) => JSON.parse('"' + t + '"'))
  .replace(/<[^>]*>/g, ' ')
  .replace(/\{[^{}]*\}/g, ' ')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

const ids = Object.fromEntries(Object.entries(manifest.ids).filter(([, m]) => m === 'inicio'));
const errors = [];
let n = 0;
for (const m of manifest.modules) {
  const file = FILE[m.id];
  if (!file) { errors.push(`${m.id}: no está en components/content/index.ts`); continue; }
  const path = join(ROOT, 'components/content', file + '.tsx');
  let src = readFileSync(path, 'utf8');
  if (m.num !== '?') m.num = String(n++);

  // numeración de lecciones
  let k = 0;
  src = src.replace(/(<span className="ln">)(\{"[\d.]+"\}|[\d.]+)(<\/span>)/g, (_, a, _v, b) => `${a}{"${m.num}.${++k}"}${b}`);
  writeFileSync(path, src);

  const lessons = [];
  for (const a of src.matchAll(/<article className="lesson" id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
    const h3 = a[2].match(/<h3>([\s\S]*?)<\/h3>/);
    const t = h3 ? jsxText(h3[1].replace(/<span className="ln">[\s\S]*?<\/span>/, '')) : a[1];
    lessons.push({ id: a[1], t });
    if (m.id !== 'examen' && !a[2].includes(`data-l="${a[1]}"`)) errors.push(`${m.id}: la lección ${a[1]} no tiene rd-sentinel`);
  }
  if (m.id !== 'examen') m.lessons = lessons;
  for (const x of src.matchAll(/\bid="([^"]+)"/g)) {
    if (ids[x[1]] && ids[x[1]] !== m.id) errors.push(`id duplicado "${x[1]}" en ${ids[x[1]]} y ${m.id}`);
    ids[x[1]] = m.id;
  }
  const qz = QUIZZES[m.id];
  const qhost = (src.match(/<div id="([\w-]*quiz)" \/>/) || [])[1] || null;
  m.quizId = qz ? qhost : null;
  m.qn = qz ? qz.qs.length : 0;
  if (qz && !qhost) errors.push(`${m.id}: hay quiz pero falta <div id="${m.id}-quiz" />`);
  m.charts = (src.match(/chart-host/g) || []).length;
  const text = jsxText(src.replace(/^[\s\S]*?return \(/, ''));
  const stext = norm(text + ' ' + m.leadText);
  m.terms = GLOSS_KEYS.filter(([, key]) => new RegExp('(^|[^a-z0-9])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(stext)).map(([t]) => t).slice(0, 12);
  if (!['repaso', 'examen', 'glosario', 'replay'].includes(m.id)) m.min = Math.max(2, Math.round(text.split(' ').length / 215 + lessons.length * 1.5));
  for (const t of m.toc) if (!src.includes(`id="${t.id}"`)) errors.push(`${m.id}: el toc apunta a #${t.id}, que no existe`);
}
manifest.ids = ids;

// enlaces internos: /modulo/, /modulo/#ancla y #ancla (que el shell resuelve con manifest.ids)
const MODS = new Set(manifest.modules.map(m => m.id));
for (const m of manifest.modules) {
  const src = readFileSync(join(ROOT, 'components/content', FILE[m.id] + '.tsx'), 'utf8');
  for (const [, mod, anchor] of src.matchAll(/href="\/([\w-]+)\/(?:#([\w-]+))?"/g)) {
    if (!MODS.has(mod)) errors.push(`${m.id}: enlace a /${mod}/, que no existe`);
    else if (anchor && ids[anchor] !== mod) errors.push(`${m.id}: enlace a /${mod}/#${anchor}, pero #${anchor} ${ids[anchor] ? 'está en ' + ids[anchor] : 'no existe'}`);
  }
  for (const [, anchor] of src.matchAll(/href="#([\w-]+)"/g)) if (!ids[anchor]) errors.push(`${m.id}: enlace a #${anchor}, que no existe`);
}
writeFileSync(MAN, JSON.stringify(manifest, null, 1) + '\n');
for (const mod of Object.keys(QUIZZES)) if (!manifest.modules.some(m => m.id === mod)) errors.push(`quiz "${mod}" sin módulo`);
console.log(manifest.modules.map(m => `${m.num.padStart(2)} ${m.id.padEnd(12)} ${String(m.lessons.length).padStart(2)} lecciones · ${m.qn} preguntas · ${m.charts} gráficos · ~${m.min} min`).join('\n'));
if (errors.length) { console.error('\n' + errors.join('\n')); process.exit(1); }
