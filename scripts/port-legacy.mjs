// Port único de legacy/index.html (sitio de un solo archivo) a la estructura Next.js:
//   app/globals.css            ← <style>
//   components/content/*.tsx   ← markup de cada módulo convertido a JSX
//   lib/generated/manifest.json← orden, grupos, lecciones, anclas y metadatos de cada módulo
//   data/glossary.json, data/quizzes.json
//   lib/lab/*.js               ← motor interactivo partido en módulos ES (imports/exports calculados)
// Uso: node scripts/port-legacy.mjs   (sobrescribe los archivos generados)
import fs from 'fs';
import path from 'path';
import { parse } from 'parse5';
import * as acorn from 'acorn';
import { analyze } from 'periscopic';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = fs.readFileSync(path.join(ROOT, 'legacy/index.html'), 'utf8');
const out = (p, s) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pascal = s => s.replace(/(^|[-_])(\w)/g, (_, a, c) => c.toUpperCase());

/* ------------------------------------------------------------------ CSS */
const css = SRC.slice(SRC.indexOf('<style>') + 7, SRC.indexOf('</style>'));
out('app/globals.css', '/* Generado a partir de legacy/index.html (scripts/port-legacy.mjs). */\n' + css.trim() + '\n');

/* ------------------------------------------------------------ módulos */
const TABS = [...SRC.matchAll(/<a href="#([^"]+)" data-mod="([^"]+)" data-group="([^"]+)"><span class="num">([^<]*)<\/span>([^<]*)<\/a>/g)]
  .map(m => ({ id: m[2], group: m[3], num: m[4], name: m[5].trim() }));
const MOD_IDS = new Set(TABS.map(t => t.id));

const doc = parse(SRC);
const kids = n => (n.childNodes || []);
const attr = (n, k) => { const a = (n.attrs || []).find(a => a.name === k); return a ? a.value : null; };
const hasClass = (n, c) => (attr(n, 'class') || '').split(/\s+/).includes(c);
function* walkNodes(n) { yield n; for (const c of kids(n)) yield* walkNodes(c); }
const find = (n, pred) => { for (const x of walkNodes(n)) if (x !== n && pred(x)) return x; return null; };
const findAll = (n, pred) => [...walkNodes(n)].filter(x => x !== n && pred(x));
const text = n => n.nodeName === '#text' ? n.value : kids(n).map(text).join('');
const isEl = (n, tag) => n.tagName === tag;
const innerHtmlOf = n => kids(n).map(serializeNode).join('');
function serializeNode(n) {
  if (n.nodeName === '#text') return n.value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (n.nodeName === '#comment') return '';
  const a = (n.attrs || []).map(x => ` ${x.name}="${x.value.replace(/"/g, '&quot;')}"`).join('');
  return `<${n.tagName}${a}>${innerHtmlOf(n)}</${n.tagName}>`;
}

const main = find(doc, n => isEl(n, 'main'));
const sections = kids(main).filter(n => isEl(n, 'section') && hasClass(n, 'module'));
const ID2MOD = {};
for (const s of sections) { const m = attr(s, 'data-mod'); for (const n of walkNodes(s)) { const id = attr(n, 'id'); if (id && n !== s) ID2MOD[id] = m; } }

/* -------------------------------------------------------------- JS */
const scripts = [...SRC.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const JS = scripts.sort((a, b) => b.length - a.length)[0];
const HEAD_RE = /\/\* =====================================================================\n   ([^\n]+)\n/g;
const heads = [...JS.matchAll(HEAD_RE)];
const CHUNK_OF = [
  ['NÚCLEO', 'core'], ['MÓDULO 0 · VELAS', 'velas'], ['MÓDULO 1 · RSI', 'rsi'], ['LIQUIDEZ', 'liquidez'], ['MÓDULO 3 · CRT', 'crt'], ['MÓDULO 4 · SMT', 'smt'],
  ['TODO JUNTO', 'todo'], ['GLOSARIO', 'glosario'], ['PATRONES', 'patrones'], ['ESTRUCTURA', 'estructura'], ['LÍNEAS DE TENDENCIA', 'trendlines'],
  ['SESIONES', 'sesiones'], ['VOLUMEN', 'volumen'], ['MEDIAS MÓVILES', 'emas'], ['ESTOCÁSTICO', 'estocastico'], ['MOMENTUM', 'momentum'],
  ['SMART MONEY CONCEPTS', 'smc'], ['SOPORTES', 'sr'], ['VOLATILIDAD', 'volat'], ['ÓRDENES', 'ordenes'], ['GESTIÓN DEL RIESGO', 'riesgo'],
  ['LOS MERCADOS', 'mercados'], ['FIBONACCI', 'fibo'], ['SIMULADOR', 'replay'], ['EXAMEN', 'examen'], ['PROGRESO', '-progreso'],
  ['BUSCADOR', '-buscador'], ['REPASO', 'repaso'], ['SHELL', '-shell'], ['NAVEGACIÓN', '-nav']
];
const chunks = {};
heads.forEach((h, i) => {
  const title = h[1], hit = CHUNK_OF.find(([k]) => title.includes(k));
  if (!hit) throw new Error('Cabecera sin asignar: ' + title);
  const end = i + 1 < heads.length ? heads[i + 1].index : JS.length;
  chunks[hit[1]] = (chunks[hit[1]] || '') + JS.slice(h.index, end);
});
chunks.core = chunks.core.replace(/^\s*'use strict';\s*/m, '');

/* --- datos: glosario --- */
const evalLit = src => new Function('return (' + src + ')')();
function takeBalanced(src, start) { // devuelve el índice de cierre del [ ( { que empieza en start
  const open = src[start], close = { '[': ']', '(': ')', '{': '}' }[open]; let d = 0, q = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) d++; else if (c === close && --d === 0) return i;
  }
  throw new Error('sin cierre');
}
let gl = chunks.glosario, gi = gl.indexOf('const GLOSS = ['), ge = takeBalanced(gl, gi + 14);
const GLOSS = evalLit(gl.slice(gi + 14, ge + 1));
chunks.glosario = gl.slice(0, gi) + gl.slice(ge + 2);
const bs = chunks['-buscador'], bi = bs.indexOf('GLOSS.push(');
if (bi >= 0) GLOSS.push(...evalLit('[' + bs.slice(bi + 11, takeBalanced(bs, bi + 10)) + ']'));
out('data/glossary.json', JSON.stringify(GLOSS.map(([t, en, d]) => ({ t, en, d })), null, 1) + '\n');

/* --- datos: quizzes (se reemplazan por referencias a QUIZZES) --- */
const QUIZZES = {};
for (const name of Object.keys(chunks)) {
  if (name.startsWith('-')) continue;
  let src = chunks[name];
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' }), reps = [];
  (function visit(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'quiz' && n.arguments.length === 3 && n.arguments[2].type === 'ArrayExpression') {
      const hostSrc = src.slice(n.arguments[0].start, n.arguments[0].end), idm = hostSrc.match(/#([\w-]+)/);
      const mod = idm && ID2MOD[idm[1]];
      if (!mod) throw new Error('quiz sin módulo: ' + hostSrc);
      QUIZZES[mod] = { title: evalLit(src.slice(n.arguments[1].start, n.arguments[1].end)), qs: evalLit(src.slice(n.arguments[2].start, n.arguments[2].end)) };
      reps.push([n.arguments[2].start, n.arguments[2].end, `QUIZZES[${JSON.stringify(mod)}].qs`]);
    }
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v.type === 'string') visit(v); }
  })(ast);
  reps.sort((a, b) => b[0] - a[0]).forEach(([a, b, r]) => { src = src.slice(0, a) + r + src.slice(b); });
  chunks[name] = src;
}
out('data/quizzes.json', JSON.stringify(QUIZZES, null, 1) + '\n');

/* --- init de cada módulo (de la lista de NAVEGACIÓN) --- */
const INITS = [...chunks['-nav'].matchAll(/\['(\w+)', '(init\w+)'\]/g)].map(m => [m[1], m[2]]).filter(([m]) => MOD_IDS.has(m));

/* --- parches de adaptación --- */
function patch(name, a, b) { if (!chunks[name].includes(a)) throw new Error(`parche ${name}: no encontrado: ${a.slice(0, 70)}`); chunks[name] = chunks[name].replace(a, () => b); }
patch('core', 'const QUIZ_BANK = [];\n', '');
patch('core', "  qs.forEach(q => QUIZ_BANK.push(Object.assign({ mod: qmod }, q)));\n", '');
patch('core', 'class Player {\n  constructor(onFrame, ms) {', 'const PLAYERS = new Set();\nfunction stopPlayers() { PLAYERS.forEach(p => p.stop()); }\nclass Player {\n  constructor(onFrame, ms) {\n    PLAYERS.add(this);');
chunks.examen = chunks.examen.replace(/^const GROUP_NAME = \{[^\n]*\n/m, '');
patch('examen', "function exGroupsOf() { return Object.fromEntries($$('.tabs .mods a').map(a => [a.dataset.mod, a.dataset.group])); }", 'function exGroupsOf() { return GROUP_OF; }');

/* --- utilidades de hora → lib/time.js (las usa también el chip de sesión del shell) --- */
{
  const ses = chunks.sesiones, a = ses.indexOf('const SESS = ['), b = ses.indexOf('const sesState');
  if (a < 0 || b < a) throw new Error('no se encontró el bloque de hora en sesiones');
  out('lib/time.js', '// Sesiones de mercado y conversión de zonas horarias. Generado por scripts/port-legacy.mjs.\n' + ses.slice(a, b).trim() + '\n\nexport { SESS, KZ, wall, tzOffset, zonedToUtc };\n');
  chunks.sesiones = ses.slice(0, a) + ses.slice(b);
}
/* --- partición en módulos ES --- */
const SHARED = ['MODS', 'MOD_NAME', 'GROUP_NAME', 'GROUP_OF', 'QUIZ_BANK', 'QUIZZES', 'GLOSS', 'PROG'];
const KEEP = Object.keys(chunks).filter(n => !n.startsWith('-'));
const decls = {}, owner = Object.create(null);
for (const n of KEEP) {
  const ast = acorn.parse(chunks[n], { ecmaVersion: 'latest', sourceType: 'module' }), names = [];
  for (const st of ast.body) {
    if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') names.push(st.id.name);
    else if (st.type === 'VariableDeclaration') st.declarations.forEach(d => { if (d.id.type !== 'Identifier') throw new Error('patrón no soportado en ' + n); names.push(d.id.name); });
  }
  decls[n] = names;
  names.forEach(x => { if (owner[x]) throw new Error(`duplicado ${x} en ${n} y ${owner[x]}`); owner[x] = n; });
}
SHARED.forEach(x => { if (!owner[x]) owner[x] = '@shared'; });
['SESS', 'KZ', 'wall', 'tzOffset', 'zonedToUtc'].forEach(x => { owner[x] = '@time'; });
const dropped = Object.keys(chunks).filter(n => n.startsWith('-')).flatMap(n => { try { return acorn.parse(chunks[n], { ecmaVersion: 'latest', sourceType: 'module' }).body.flatMap(s => s.id ? [s.id.name] : s.declarations ? s.declarations.map(d => d.id.name) : []); } catch (e) { return []; } });
const report = [];
for (const n of KEEP) {
  const used = analyze(acorn.parse(chunks[n], { ecmaVersion: 'latest', sourceType: 'module' })).globals.keys();
  const own = new Set(decls[n]), byFrom = Object.create(null);
  for (const u of used) {
    if (own.has(u)) continue;
    if (owner[u]) (byFrom[owner[u]] = byFrom[owner[u]] || []).push(u);
    else if (dropped.includes(u)) report.push(`${n} usa ${u} (de un bloque eliminado)`);
  }
  const imports = Object.entries(byFrom).sort().map(([from, xs]) => `import { ${xs.sort().join(', ')} } from '${from === '@shared' ? './shared' : from === '@time' ? '../time' : './' + from}';`).join('\n');
  out(`lib/lab/${n}.js`, `// Motor interactivo · ${n}. Generado por scripts/port-legacy.mjs a partir de legacy/index.html.\n/* eslint-disable */\n${imports}\n${chunks[n].trim()}\n\nexport { ${decls[n].join(', ')} };\n`);
}
out('lib/lab/registry.js', '// Generado: init de cada módulo.\n' + INITS.map(([m, f]) => `import { ${f} } from './${owner[f]}';`).join('\n') +
  '\n\nexport const INITS = {\n' + INITS.map(([m, f]) => `  ${JSON.stringify(m)}: ${f}`).join(',\n') + '\n};\n');
if (report.length) console.warn('AVISOS:\n' + report.join('\n'));

/* ------------------------------------------------------------ JSX */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const DROP_WS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'select', 'ul', 'ol', 'dl', 'svg', 'g', 'defs', 'linearGradient', 'radialGradient', 'pattern', 'clipPath', 'mask', 'section', 'nav']);
const ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete', autofocus: 'autoFocus', contenteditable: 'contentEditable', spellcheck: 'spellCheck', inputmode: 'inputMode', 'xlink:href': 'xlinkHref' };
const BOOL = new Set(['checked', 'disabled', 'hidden', 'selected', 'open', 'multiple', 'readonly', 'required', 'autofocus']);
const camel = s => s.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase());
const attrName = n => ATTR[n] || (n.startsWith('data-') || n.startsWith('aria-') ? n : (/[-:]/.test(n) ? camel(n) : n));
function styleObj(s) {
  const o = {};
  s.split(';').map(x => x.trim()).filter(Boolean).forEach(d => { const i = d.indexOf(':'); if (i < 0) return; const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim(); o[k.startsWith('--') ? k : k.replace(/^-(\w)/, (_, c) => c.toUpperCase()).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v; });
  return JSON.stringify(o);
}
function hrefFor(href, mod, st) {
  if (!href.startsWith('#') || href === '#') return null;
  const id = decodeURIComponent(href.slice(1));
  if (MOD_IDS.has(id) && id !== mod) { st.link = true; return id === 'inicio' ? '/' : `/${id}/`; }
  const m = ID2MOD[id];
  if (m && m !== mod) { st.link = true; return `/${m}/#${id}`; }
  return null;
}
function jsx(n, mod, st, pre, parentTag) {
  if (n.nodeName === '#comment') return '';
  if (n.nodeName === '#text') {
    let v = n.value;
    if (!pre) { if (!v.trim()) return DROP_WS.has(parentTag) ? '' : '{" "}'; v = v.replace(/\s+/g, ' '); }
    return '{' + JSON.stringify(v) + '}';
  }
  const tag = n.tagName, isPre = pre || tag === 'pre' || tag === 'textarea';
  let props = [], children = kids(n), linkHref = null;
  if (tag === 'select') { const sel = children.find(c => c.tagName === 'option' && attr(c, 'selected') !== null); if (sel) props.push(`defaultValue=${JSON.stringify(attr(sel, 'value') ?? text(sel))}`); }
  for (const a of n.attrs || []) {
    let k = a.name, v = a.value;
    if (tag === 'option' && k === 'selected') continue;
    if (tag === 'a' && k === 'href') { const h = hrefFor(v, mod, st); if (h) { linkHref = h; continue; } }
    if ((tag === 'input' || tag === 'textarea') && k === 'value') { props.push(`defaultValue=${JSON.stringify(v)}`); continue; }
    if (tag === 'input' && k === 'checked') { props.push('defaultChecked'); continue; }
    if (k === 'style') { props.push(`style={${styleObj(v)}}`); continue; }
    const nk = attrName(k);
    if (BOOL.has(k)) props.push(nk);
    else if (nk === 'tabIndex') props.push(`tabIndex={${+v || 0}}`);
    else props.push(`${nk}=${JSON.stringify(v)}`);
  }
  if (tag === 'textarea') { props.push(`defaultValue=${JSON.stringify(text(n))}`); children = []; }
  const name = linkHref ? 'Link' : tag;
  if (linkHref) props.unshift(`href=${JSON.stringify(linkHref)}`);
  const p = props.length ? ' ' + props.join(' ') : '';
  if (VOID.has(tag) || !children.length) return `<${name}${p} />`;
  return `<${name}${p}>${children.map(c => jsx(c, mod, st, isPre, tag)).join('')}</${name}>`;
}

/* ------------------------------------------------------- manifiesto */
const GLOSS_KEYS = GLOSS.map(([t]) => [t, norm(t.split(/ \(| \/ |, /)[0]).trim()]).filter(([, k]) => k.length >= 3);
const manifest = { modules: [], ids: ID2MOD };
const registry = [];
for (const s of sections) {
  const mod = attr(s, 'data-mod'); if (mod === 'inicio') continue;
  const tab = TABS.find(t => t.id === mod);
  const head = kids(s).find(n => isEl(n, 'div') && hasClass(n, 'mod-head'));
  const h2 = head && find(head, n => isEl(n, 'h2')), lead = head && find(head, n => hasClass(n, 'lead'));
  const toc = head ? findAll(head, n => isEl(n, 'a') && n.parentNode && hasClass(n.parentNode, 'toc')).map(a => ({ id: attr(a, 'href').slice(1), label: text(a).trim() })) : [];
  const lessons = mod === 'examen' ? [] : findAll(s, n => isEl(n, 'article') && hasClass(n, 'lesson') && attr(n, 'id')).map(a => {
    const h3 = find(a, x => isEl(x, 'h3'));
    a.childNodes.push({ nodeName: 'div', tagName: 'div', attrs: [{ name: 'class', value: 'rd-sentinel' }, { name: 'data-l', value: attr(a, 'id') }], childNodes: [], parentNode: a });
    return { id: attr(a, 'id'), t: h3 ? text(h3).replace(/^\s*[\d.]+\s*/, '').trim() : attr(a, 'id') };
  });
  const words = findAll(s, n => ['prose', 'lead', 'callout', 'step-box'].some(c => hasClass(n, c))).reduce((a, n) => a + text(n).split(/\s+/).length, 0);
  const stext = norm(text(s));
  const terms = GLOSS_KEYS.filter(([, k]) => new RegExp('(^|[^a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(stext)).map(([t]) => t).slice(0, 12);
  const qz = QUIZZES[mod];
  manifest.modules.push({
    id: mod, name: tab.name, num: tab.num, group: tab.group, title: h2 ? text(h2).trim() : tab.name,
    lead: lead ? innerHtmlOf(lead).trim() : '', leadText: lead ? text(lead).replace(/\s+/g, ' ').trim() : '', toc, lessons,
    quizId: qz ? mod + '-quiz' : null, qn: qz ? qz.qs.length : 0, min: Math.max(2, Math.round(words / 190 + lessons.length * 1.5)),
    charts: findAll(s, n => hasClass(n, 'chart-host')).length, terms
  });
  const body = kids(s).filter(n => !(isEl(n, 'div') && (hasClass(n, 'mod-head') || hasClass(n, 'next'))));
  const st = {}, code = body.map(n => jsx(n, mod, st, false, 'section')).filter(Boolean).join('\n      ');
  const comp = pascal(mod);
  out(`components/content/${comp}.tsx`, `// Contenido del módulo «${tab.name}». Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
// @ts-nocheck
${st.link ? "import Link from 'next/link';\n" : ''}
export default function ${comp}() {
  return (
    <>
      ${code}
    </>
  );
}
`);
  registry.push([mod, comp]);
}
manifest.modules.sort((a, b) => TABS.findIndex(t => t.id === a.id) - TABS.findIndex(t => t.id === b.id));
out('lib/generated/manifest.json', JSON.stringify(manifest, null, 1) + '\n');
out('components/content/index.ts', '// Generado: componente de contenido de cada módulo.\nimport type { ComponentType } from \'react\';\n' + registry.map(([, c]) => `import ${c} from './${c}';`).join('\n') +
  '\n\nexport const CONTENT: Record<string, ComponentType> = {\n' + registry.map(([m, c]) => `  ${JSON.stringify(m)}: ${c}`).join(',\n') + '\n};\n');
console.log(`módulos: ${manifest.modules.length} · quizzes: ${Object.keys(QUIZZES).length} · glosario: ${GLOSS.length} · chunks JS: ${KEEP.length} · inits: ${INITS.length}`);
