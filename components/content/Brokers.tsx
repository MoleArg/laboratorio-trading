// Contenido del módulo «Brokers, prop firms y estafas».
import Link from 'next/link';

const COST_ROWS: [string, string, string, string][] = [
  ['sp', 'Spread típico (pips)', '0.2', '1.4'],
  ['co', 'Comisión ida y vuelta ($ por lote)', '7', '0'],
  ['sw', 'Swap ($ por lote y noche)', '0.8', '1.2'],
  ['ni', 'Noches que mantienes de media', '0.3', '0.3']
];

export default function Brokers() {
  return (
    <>
      <article className="lesson" id="br-tipos">
        <h3><span className="ln">{"22.1"}</span>Quién está del otro lado de tu orden</h3>
        <div className="prose">
          <ul>
            <li><strong>Creador de mercado (market maker, &quot;dealing desk&quot;):</strong> el broker es tu contraparte. Si pierdes, gana él. Es legal y habitual en CFD y forex minorista, pero crea un conflicto de interés: importa mucho que esté bien regulado.</li>
            <li><strong>STP / ECN:</strong> el broker envía tu orden a proveedores de liquidez (bancos, otros creadores de mercado) y cobra comisión o un margen sobre el spread. Spreads más bajos, comisión aparte (ver <Link href="/mercados/#mk-tipos">tipos de mercado</Link>).</li>
            <li><strong>Broker de bolsa / ALyC:</strong> compras el activo real (acciones, ETF, futuros, bonos) en un mercado regulado. En Argentina son las ALyC registradas en la CNV.</li>
            <li><strong>Exchange de cripto:</strong> casa de cambio y custodio a la vez. Si quiebra o lo hackean, tus fondos pueden quedar atrapados: no es lo mismo que un banco.</li>
          </ul>
          <p>La mayoría de traders minoristas operan <strong>CFD</strong>: contratos con el broker que replican el precio de un activo sin comprarlo. Te dan apalancamiento y acceso a todo, a cambio de depender por completo de la solidez del broker.</p>
        </div>
        <div className="rd-sentinel" data-l="br-tipos" />
      </article>

      <article className="lesson" id="br-regul">
        <h3><span className="ln">{"22.2"}</span>¿Es confiable? Una checklist antes de depositar</h3>
        <div className="prose"><p>La regulación no garantiza que ganes, pero sí reglas mínimas: capital propio, fondos separados, auditorías y a quién reclamar. Verifica la licencia en la web <em>del regulador</em> (con el número de licencia), nunca solo en la del broker: los clones de brokers reales son una estafa común.</p></div>
        <div className="cols">
          <div className="fig"><div className="fig-title">Garantías</div><div className="checklist" id="br-check" /><div className="meter"><div id="br-meter" /></div></div>
          <div className="fig"><div className="fig-title">Señales de alarma</div><div className="checklist" id="br-flags" /></div>
        </div>
        <div className="explain" id="br-explain" />
        <div className="rd-sentinel" data-l="br-regul" />
      </article>

      <article className="lesson" id="br-costos">
        <h3><span className="ln">{"22.3"}</span>El costo real: compara dos brokers</h3>
        <div className="prose"><p>Spread, comisión y swap se pagan en <em>cada</em> operación. Expresados en R se ve cuánto de tu ventaja se queda el broker (ver <Link href="/ordenes/#ord-costos">costos</Link>). Valor del pip: 10 $ por lote estándar en pares XXX/USD.</p></div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Operaciones al mes</span><input type="number" id="bc-n" defaultValue="60" min="0" style={{ width: '80px' }} /></div>
            <div className="grp"><span className="lbl">Lotes por operación</span><input type="number" id="bc-lots" defaultValue="0.5" min="0" step="0.01" style={{ width: '80px' }} /></div>
            <div className="grp"><span className="lbl">Riesgo por operación ($)</span><input type="number" id="bc-risk" defaultValue="100" min="1" style={{ width: '90px' }} /></div>
          </div>
          <table className="t" style={{ maxWidth: '620px' }}>
            <thead><tr><th>Concepto</th><th>Broker A (ECN)</th><th>Broker B (&quot;sin comisión&quot;)</th></tr></thead>
            <tbody>
              {COST_ROWS.map(([k, l, a, b]) => (
                <tr key={k}><td>{l}</td><td><input type="number" id={'bc-a-' + k} defaultValue={a} min="0" step="0.1" style={{ width: '90px' }} /></td><td><input type="number" id={'bc-b-' + k} defaultValue={b} min="0" step="0.1" style={{ width: '90px' }} /></td></tr>
              ))}
            </tbody>
          </table>
          <div className="chart-host" id="fig-br-cost" />
          <div className="readout" id="bc-out" />
          <div className="explain" id="bc-explain" />
        </div>
        <div className="rd-sentinel" data-l="br-costos" />
      </article>

      <article className="lesson" id="br-prop">
        <h3><span className="ln">{"22.4"}</span>Prop firms: cómo funciona una evaluación</h3>
        <div className="prose">
          <p>Una <strong>prop firm</strong> (empresa de fondeo) te cobra una tarifa por una evaluación en una cuenta, casi siempre demo. Si alcanzas el objetivo de ganancia sin romper las reglas, te da una cuenta &quot;fondeada&quot; y repartes las ganancias (por ejemplo 80% para ti). Las reglas típicas:</p>
          <ul>
            <li><strong>Objetivo:</strong> ganar un 8–10% de la cuenta.</li>
            <li><strong>Pérdida máxima diaria:</strong> 4–5%, medida desde el balance al inicio del día.</li>
            <li><strong>Drawdown máximo:</strong> 8–10%. <em>Estático</em> (el suelo no se mueve) o <em>trailing</em> (el suelo sube con tu máximo).</li>
            <li>A veces: días mínimos de operación, regla de consistencia (ningún día puede ser más del X% de la ganancia total), prohibido operar noticias.</li>
          </ul>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="seg" data-key="pf-mode"><button className="on" data-v="static">Drawdown estático</button><button data-v="trail">Drawdown trailing</button></div>
            <div className="grp"><span className="lbl">Tarifa</span><input type="range" id="pf-fee" min="50" max="600" step="10" defaultValue="500" style={{ width: '120px' }} /><span className="val" id="pf-fee-v" /></div>
            <button className="btn" id="pf-new">Otra simulación</button>
          </div>
          <div className="controls">
            <div className="grp"><span className="lbl">Objetivo</span><input type="range" id="pf-tg" min="4" max="12" defaultValue="10" style={{ width: '100px' }} /><span className="val" id="pf-tg-v" /></div>
            <div className="grp"><span className="lbl">Límite diario</span><input type="range" id="pf-dd" min="2" max="6" defaultValue="5" style={{ width: '100px' }} /><span className="val" id="pf-dd-v" /></div>
            <div className="grp"><span className="lbl">Drawdown máx.</span><input type="range" id="pf-mx" min="4" max="12" defaultValue="10" style={{ width: '100px' }} /><span className="val" id="pf-mx-v" /></div>
            <div className="grp"><span className="lbl">Días</span><input type="range" id="pf-dy" min="5" max="60" defaultValue="30" style={{ width: '100px' }} /><span className="val" id="pf-dy-v" /></div>
          </div>
          <div className="controls">
            <div className="grp"><span className="lbl">Riesgo por operación</span><input type="range" id="pf-rk" min="1" max="12" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="pf-rk-v" /></div>
            <div className="grp"><span className="lbl">% de acierto</span><input type="range" id="pf-wr" min="25" max="70" defaultValue="45" style={{ width: '100px' }} /><span className="val" id="pf-wr-v" /></div>
            <div className="grp"><span className="lbl">R:B</span><input type="range" id="pf-rr" min="4" max="12" defaultValue="6" style={{ width: '100px' }} /><span className="val" id="pf-rr-v" /></div>
            <div className="grp"><span className="lbl">Operaciones por día</span><input type="range" id="pf-pd" min="1" max="6" defaultValue="2" style={{ width: '100px' }} /><span className="val" id="pf-pd-v" /></div>
          </div>
          <div className="chart-host" id="fig-br-prop" />
          <div className="readout" id="pf-out" />
          <div className="explain" id="pf-explain" />
        </div>
        <div className="rd-sentinel" data-l="br-prop" />
      </article>

      <article className="lesson" id="br-estafas">
        <h3><span className="ln">{"22.5"}</span>Estafas frecuentes</h3>
        <div className="cols">
          <div className="callout err"><h5>Las más comunes</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li><strong>Gestor de cuentas:</strong> alguien te contacta, te muestra capturas de ganancias y te pide que deposites en &quot;su&quot; plataforma. La plataforma es falsa: los números suben hasta que intentas retirar.</li>
              <li><strong>Grupos de señales y cursos &quot;milagro&quot;:</strong> el negocio es la suscripción o la comisión por traerte al broker, no operar.</li>
              <li><strong>Esquemas Ponzi de cripto:</strong> &quot;rendimiento diario garantizado&quot; pagado con el dinero de los que entran después.</li>
              <li><strong>Recuperadores de fondos:</strong> tras la primera estafa, otros te ofrecen recuperar el dinero a cambio de una tarifa. Es la segunda estafa.</li>
            </ul>
          </div>
          <div className="callout tip-c"><h5>Reglas que te protegen</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>Nadie con una ventaja real necesita tu dinero ni te escribe por mensaje privado.</li>
              <li>Rentabilidad garantizada = estafa. Siempre.</li>
              <li>Nunca des acceso remoto a tu computadora ni tus claves.</li>
              <li>Antes de depositar en serio, retira una cantidad pequeña de prueba.</li>
              <li>Si dudas, denuncia o consulta al regulador (en Argentina, la CNV tiene un listado de entidades no autorizadas).</li>
            </ul>
          </div>
        </div>
        <div className="rd-sentinel" data-l="br-estafas" />
      </article>
      <div id="brokers-quiz" />
    </>
  );
}
