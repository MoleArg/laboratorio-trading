// Contenido del módulo «Wyckoff».
import Link from 'next/link';

export default function Wyckoff() {
  return (
    <>
      <article className="lesson" id="wy-leyes">
        <h3><span className="ln">{"16.1"}</span>Las tres leyes y el &quot;operador compuesto&quot;</h3>
        <div className="prose">
          <p>Richard Wyckoff estudió a principios del siglo XX cómo operaban los grandes especuladores de Wall Street. Su método no usa indicadores: lee <strong>precio y volumen</strong> para deducir qué están haciendo los participantes grandes. Gran parte de lo que hoy se llama Smart Money viene de aquí.</p>
          <ul>
            <li><strong>Oferta y demanda:</strong> si la demanda supera a la oferta, el precio sube; si la oferta supera a la demanda, baja. Todo lo demás es cómo detectarlo.</li>
            <li><strong>Causa y efecto:</strong> un rango largo de acumulación (la causa) prepara una tendencia proporcional (el efecto).</li>
            <li><strong>Esfuerzo y resultado:</strong> el volumen es el esfuerzo; el desplazamiento del precio es el resultado. Cuando no coinciden, algo está cambiando.</li>
          </ul>
          <p>Wyckoff proponía imaginar que todo el mercado lo maneja un único <strong>operador compuesto</strong> (composite man) que compra barato sin que se note, empuja el precio y luego vende caro al público. No es literal: es una forma de preguntarse <em>quién gana con este movimiento</em>.</p>
        </div>
        <div className="rd-sentinel" data-l="wy-leyes" />
      </article>

      <article className="lesson" id="wy-acum">
        <h3><span className="ln">{"16.2"}</span>El esquema de acumulación, paso a paso</h3>
        <div className="prose"><p>Un ciclo completo tiene cuatro etapas: acumulación, tendencia alcista (markup), distribución y tendencia bajista (markdown). Dentro del rango, Wyckoff distingue cinco fases (A–E) y una secuencia de eventos con nombre propio. Avanza paso a paso y cambia a distribución para ver el espejo.</p></div>
        <div className="fig">
          <div className="controls"><div className="seg" data-key="wy-mode"><button className="on" data-v="acc">Acumulación</button><button data-v="dist">Distribución</button></div></div>
          <div className="steps-nav"><button className="btn" id="wy-prev">◀ Anterior</button><div className="dots" id="wy-dots" /><button className="btn primary" id="wy-next">Siguiente ▶</button></div>
          <div className="chart-host" id="fig-wy" />
          <div className="step-box" id="wy-step" />
        </div>
        <div className="callout warn"><h5>El esquema es un ideal</h5><p>En gráficos reales faltan eventos, el spring a veces no existe (la fase C se resuelve con un simple test) y los rangos tienen formas raras. Úsalo para ordenar lo que ves, no como una plantilla que el precio está obligado a cumplir.</p></div>
        <div className="rd-sentinel" data-l="wy-acum" />
      </article>

      <article className="lesson" id="wy-er">
        <h3><span className="ln">{"16.3"}</span>Esfuerzo contra resultado</h3>
        <div className="prose"><p>La tercera ley es la más práctica. Compara cada vela con su volumen: un esfuerzo grande debería producir un resultado grande. Cuando no lo hace, alguien está absorbiendo del otro lado.</p></div>
        <div className="fig">
          <div className="controls"><div className="seg" data-key="er"><button className="on" data-v="climax">Clímax</button><button data-v="nodemand">Sin demanda</button><button data-v="absorb">Absorción</button></div></div>
          <div className="chart-host" id="fig-wy-er" />
          <div className="explain" id="wy-er-explain" />
        </div>
        <div className="rd-sentinel" data-l="wy-er" />
      </article>

      <article className="lesson" id="wy-smc">
        <h3><span className="ln">{"16.4"}</span>Wyckoff y Smart Money: el mismo mapa con otros nombres</h3>
        <div className="fig">
          <table className="t wide">
            <thead><tr><th>Wyckoff</th><th>SMC / ICT</th><th>Qué pasa</th></tr></thead>
            <tbody>
              <tr><td>Spring / UTAD</td><td>Barrido de SSL / BSL, Judas swing</td><td>Se toman los stops de un extremo del rango y el precio vuelve a entrar (ver <Link href="/liquidez/#liq-barrido">barrido</Link>).</td></tr>
              <tr><td>SOS / SOW</td><td>Desplazamiento, BOS / MSS</td><td>Ruptura con intención, velas amplias, suele dejar FVG.</td></tr>
              <tr><td>LPS / LPSY</td><td>Retesteo de order block o FVG</td><td>Entrada en el retroceso a la zona que inició el desplazamiento.</td></tr>
              <tr><td>Acumulación → markup</td><td>Power of 3 (AMD)</td><td>Acumulación, manipulación y distribución, en cualquier temporalidad (ver <Link href="/smc/#smc-po3">Power of 3</Link>).</td></tr>
              <tr><td>Rango de trading</td><td>Rango CRT, dealing range</td><td>El precio oscila entre dos bolsas de liquidez hasta que una se toma.</td></tr>
            </tbody>
          </table>
        </div>
        <div className="prose"><p>Lo que Wyckoff aporta y SMC a veces olvida es el <strong>volumen</strong> y el <strong>contexto de tiempo</strong>: un spring dentro de un rango que lleva semanas formándose, con volumen que se seca, vale mucho más que un barrido aislado en un gráfico de 1 minuto.</p></div>
        <div className="rd-sentinel" data-l="wy-smc" />
      </article>

      <article className="lesson" id="wy-errores">
        <h3><span className="ln">{"16.5"}</span>Errores comunes</h3>
        <div className="callout err"><ul style={{ marginLeft: '18px' }}>
          <li>Etiquetar el esquema <strong>mientras se forma</strong> y entrar en cada &quot;spring&quot;: muchos son simples rupturas que siguen.</li>
          <li>Ignorar el volumen, que es la mitad del método.</li>
          <li>Ver acumulación en cualquier rango de 20 velas en 1 minuto. La causa tiene que ser proporcional al efecto que esperas.</li>
          <li>Confundir acumulación y re-distribución: el mismo rango puede resolverse hacia cualquier lado hasta la fase C.</li>
        </ul></div>
        <div className="rd-sentinel" data-l="wy-errores" />
      </article>
      <div id="wyckoff-quiz" />
    </>
  );
}
