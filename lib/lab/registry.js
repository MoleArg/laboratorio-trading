// Generado: init de cada módulo.
import { initMercados } from './mercados';
import { initVelas } from './velas';
import { initPatrones } from './patrones';
import { initSR } from './sr';
import { initEstructura } from './estructura';
import { initTrendlines } from './trendlines';
import { initFibo } from './fibo';
import { initSesiones } from './sesiones';
import { initVolumen } from './volumen';
import { initEMAs } from './emas';
import { initRSI } from './rsi';
import { initEstocastico } from './estocastico';
import { initMomentum } from './momentum';
import { initVolat } from './volat';
import { initLiq } from './liquidez';
import { initSMC } from './smc';
import { initCRT } from './crt';
import { initSMT } from './smt';
import { initOrdenes } from './ordenes';
import { initRiesgo } from './riesgo';
import { initTodo } from './glosario';
import { initGlosario } from './glosario';
import { initReplay } from './replay';
import { initExamen } from './examen';
import { initRepaso } from './repaso';
import { initPivotes } from './pivotes';
import { initMTF } from './mtf';
import { initOrderflow } from './orderflow';
import { initDerivados } from './derivados';
import { initICT } from './ict';
import { initTodoBear } from './escenario';
import { initBrokers } from './brokers';
import { initWyckoff } from './wyckoff';
import { initADX } from './adx';
import { initMacro } from './macro';
import { initPsicologia } from './psicologia';
import { initBacktest } from './backtest';
import { initGestion } from './gestion';

export const INITS = {
  "mercados": () => { initMercados(); initDerivados(); },
  "velas": initVelas,
  "patrones": initPatrones,
  "sr": () => { initSR(); initPivotes(); },
  "estructura": () => { initEstructura(); initMTF(); },
  "trendlines": initTrendlines,
  "fibo": initFibo,
  "sesiones": initSesiones,
  "volumen": () => { initVolumen(); initOrderflow(); },
  "emas": initEMAs,
  "rsi": initRSI,
  "estocastico": initEstocastico,
  "momentum": initMomentum,
  "volat": initVolat,
  "liquidez": initLiq,
  "smc": () => { initSMC(); initICT(); },
  "crt": initCRT,
  "smt": initSMT,
  "ordenes": initOrdenes,
  "riesgo": initRiesgo,
  "todo": () => { initTodo(); initTodoBear(); },
  "glosario": initGlosario,
  "replay": initReplay,
  "examen": initExamen,
  "repaso": initRepaso,
  "gestion": initGestion,
  "backtest": initBacktest,
  "psicologia": initPsicologia,
  "macro": initMacro,
  "adx": initADX,
  "wyckoff": initWyckoff,
  "brokers": initBrokers
};
