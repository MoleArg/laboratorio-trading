// Contenido del módulo «Psicología y plan de trading».
import Link from 'next/link';

const SHORT = ['risk', 'dayL', 'weekL', 'maxT'];
const FIELDS: [string, string][] = [
  ['mkt', 'Mercados y activos'], ['hor', 'Horario en que opero'], ['tf', 'Temporalidades (sesgo / entrada)'], ['setup', 'Setups permitidos'],
  ['must', 'Condiciones obligatorias para entrar'], ['risk', 'Riesgo por operación (%)'], ['dayL', 'Pérdida máxima diaria (R)'], ['weekL', 'Pérdida máxima semanal (R)'],
  ['maxT', 'Máximo de operaciones por día'], ['mgmt', 'Gestión de la operación (stop, BE, parciales, salida)'], ['no', 'Cuándo NO opero'], ['rev', 'Revisión (cuándo y qué miro)']
];

export default function Psicologia() {
  return (
    <>
      <article className="lesson" id="ps-sesgos">
        <h3><span className="ln">{"26.1"}</span>Sesgos: el cerebro no está hecho para esto</h3>
        <div className="prose">
          <p>Los mismos atajos mentales que nos sirven en la vida diaria juegan en contra frente a un gráfico. Los más caros:</p>
        </div>
        <div className="fig">
          <table className="t wide">
            <thead><tr><th>Sesgo</th><th>Cómo se ve operando</th><th>Antídoto</th></tr></thead>
            <tbody>
              <tr><td>Aversión a la pérdida</td><td>No aceptar el stop; mover el stop más lejos.</td><td>Stop puesto en la plataforma al entrar, nunca &quot;mental&quot;.</td></tr>
              <tr><td>Efecto disposición</td><td>Cerrar rápido las ganadoras y dejar correr las perdedoras.</td><td>Objetivo y gestión escritos antes de entrar.</td></tr>
              <tr><td>Sesgo de confirmación</td><td>Buscar solo análisis que te den la razón.</td><td>Escribir qué invalidaría la idea.</td></tr>
              <tr><td>Recencia</td><td>Cambiar de estrategia tras tres pérdidas.</td><td>Juzgar por muestras de 100+ operaciones (ver <Link href="/backtest/#bt-muestra">muestra</Link>).</td></tr>
              <tr><td>Exceso de confianza</td><td>Subir el tamaño tras una racha buena.</td><td>Riesgo fijo por operación, decidido de antemano.</td></tr>
              <tr><td>Falacia del jugador</td><td>&quot;Ya toca una ganadora&quot;.</td><td>Recordar que cada operación es independiente.</td></tr>
            </tbody>
          </table>
        </div>
        <div className="fig">
          <div className="fig-title">Identifica el sesgo</div>
          <p className="fig-sub">Seis situaciones reales. Elige qué sesgo está detrás.</p>
          <div id="ps-bias" />
        </div>
        <div className="rd-sentinel" data-l="ps-sesgos" />
      </article>

      <article className="lesson" id="ps-tilt">
        <h3><span className="ln">{"26.2"}</span>Tilt, FOMO y revenge trading</h3>
        <div className="prose">
          <p><strong>Tilt</strong> es operar con la emoción al mando después de una racha mala. Suele empezar con <strong>revenge trading</strong> (entrar para &quot;recuperar&quot;), seguir con <strong>sobreoperar</strong> (setups que no son setups) y terminar subiendo el tamaño. El <strong>FOMO</strong> (miedo a quedarse fuera) es su primo: perseguir una vela que ya se fue.</p>
          <p>El simulador compara 800 cuentas que operan la misma estrategia ganadora. Unas son disciplinadas; otras entran en tilt después de una racha de pérdidas.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Entra en tilt tras</span><input type="range" id="pt-l" min="2" max="5" defaultValue="3" style={{ width: '110px' }} /><span className="val" id="pt-l-v" /></div>
            <div className="grp"><span className="lbl">Riesgo en tilt</span><input type="range" id="pt-m" min="2" max="8" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="pt-m-v" /></div>
            <div className="grp"><span className="lbl">Límite diario: parar tras</span><input type="range" id="pt-d" min="1" max="5" defaultValue="2" style={{ width: '110px' }} /><span className="val" id="pt-d-v" /></div>
            <button className="btn" id="pt-new">Otra simulación</button>
          </div>
          <div className="chart-host" id="fig-ps-tilt" />
          <div className="legend"><span><i style={{ background: 'var(--c-up)' }} />Disciplinado</span><span><i style={{ background: 'var(--c-down)' }} />Con tilt</span><span><i style={{ background: 'var(--c-liq)' }} />Con tilt y límite diario</span><span><i className="dash" style={{ borderColor: 'var(--text-2)' }} />Peor 5% de cada grupo</span></div>
          <div className="readout" id="pt-out" />
          <div className="explain" id="pt-explain" />
        </div>
        <div className="callout tip-c"><h5>Señales de alarma (y qué hacer)</h5>
          <ul style={{ marginLeft: '18px' }}>
            <li>Abres el gráfico de 1 minuto &quot;para encontrar algo&quot; → cierra la plataforma.</li>
            <li>Quieres recuperar la pérdida de hoy hoy → has llegado al límite diario aunque no lo hayas tocado.</li>
            <li>Entras sin poder decir el setup en una frase → esa operación no está en el plan.</li>
          </ul>
        </div>
        <div className="rd-sentinel" data-l="ps-tilt" />
      </article>

      <article className="lesson" id="ps-plan">
        <h3><span className="ln">{"26.3"}</span>Escribe tu plan de trading</h3>
        <div className="prose">
          <p>Un plan de trading es un contrato contigo mismo: qué operas, cuándo, con cuánto riesgo y cuándo paras. Si no está escrito, lo reescribes en cada operación según cómo te sientas. Rellena (o adapta) el ejemplo; se guarda en este navegador.</p>
        </div>
        <div className="fig">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '10px 16px' }}>
            {FIELDS.map(([k, l]) => (
              <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.85rem', color: 'var(--muted)', gridColumn: SHORT.includes(k) ? undefined : '1 / -1' }}>
                {l}
                {SHORT.includes(k) ? <input type="text" id={'pl-' + k} inputMode="decimal" /> : <textarea id={'pl-' + k} rows={2} style={{ fontFamily: 'inherit' }} />}
              </label>
            ))}
          </div>
          <div className="explain" id="pl-explain" />
          <div className="controls"><button className="btn primary" id="pl-copy">Copiar</button><button className="btn" id="pl-dl">Descargar .txt</button><button className="btn" id="pl-reset">Volver al ejemplo</button></div>
          <pre id="pl-out" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: '.82rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', maxHeight: '320px', overflow: 'auto' }} />
        </div>
        <div className="rd-sentinel" data-l="ps-plan" />
      </article>

      <article className="lesson" id="ps-rutina">
        <h3><span className="ln">{"26.4"}</span>Rutina: antes, durante y después</h3>
        <div className="cols">
          <div className="callout tip-c"><h5>Antes de la sesión</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>Calendario económico: ¿hay noticias de alto impacto? (ver <Link href="/macro/#mc-cal">calendario</Link>).</li>
              <li>Sesgo de temporalidad mayor y niveles marcados (PDH/PDL, rango asiático, zonas).</li>
              <li>Cómo estoy: dormí, comí, no estoy enojado. Si no, opero con medio riesgo o no opero.</li>
            </ul>
          </div>
          <div className="callout tip-c"><h5>Después de la sesión</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>Captura de cada operación con entrada, stop y salida.</li>
              <li>¿Seguí el plan? Sí/No por operación, independiente del resultado.</li>
              <li>Una frase: qué sentí y qué hice con eso.</li>
            </ul>
          </div>
        </div>
        <div className="prose">
          <p><strong>Revisión semanal:</strong> carga los resultados de la semana en la <Link href="/backtest/#bt-metricas">calculadora de métricas</Link>, separa las operaciones dentro y fuera de plan, y elige <em>una</em> mejora concreta para la semana siguiente. Una operación perdedora dentro del plan es una buena operación; una ganadora fuera del plan es un problema que todavía no te ha costado dinero.</p>
        </div>
        <div className="rd-sentinel" data-l="ps-rutina" />
      </article>
      <div id="psicologia-quiz" />
    </>
  );
}
