// Datos compartidos que el motor interactivo tomaba del ámbito global del sitio de un solo archivo.
import { MODULES, GROUP_NAME as GN, GLOSSARY } from '../site';
import QZ from '../../data/quizzes.json';
import { PROG as P } from '../progress';

export const MODS = MODULES.map(m => m.id);
export const MOD_NAME = Object.fromEntries(MODULES.map(m => [m.id, m.name]));
export const GROUP_NAME = GN;
export const GROUP_OF = Object.fromEntries(MODULES.map(m => [m.id, m.group]));
export const QUIZZES = QZ;
export const QUIZ_BANK = Object.entries(QZ).flatMap(([mod, q]) => q.qs.map(x => Object.assign({ mod }, x)));
export const GLOSS = GLOSSARY.map(g => [g.t, g.en, g.d]);
export const PROG = P;
