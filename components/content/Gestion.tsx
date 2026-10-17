// Contenido del módulo «Gestión del trade abierto».
import Link from 'next/link';

export default function Gestion() {
  return (
    <>
      <article className="lesson" id="gt-plan">
        <h3><span className="ln">{"24.1"}</span>La salida se decide antes de entrar</h3>
        <div className="prose">
          <p>Con la operación abierta todo se ve distinto: cada vela en contra parece el principio del desastre y cada vela a favor invita a cerrar &quot;por si acaso&quot;. Por eso las reglas de gestión se escriben <strong>antes</strong> de pulsar el botón, cuando todavía piensas con calma.</p>
          <p>Antes de entrar deberías poder contestar cuatro preguntas:</p>
          <ol>
            <li><strong>¿Dónde está equivocada la idea?</strong> Ese es el stop: más allá del barrido, del order block o del último swing. No donde &quot;duele poco&quot;.</li>
            <li><strong>¿A qué liquidez va el precio?</strong> El objetivo es un nivel concreto (BSL, máximo previo, FVG opuesto), no un número redondo de R.</li>
            <li><strong>¿Qué haré en el camino?</strong> Si muevo el stop, cuándo y adónde. Si cierro parte, a qué precio.</li>
            <li><strong>¿Qué me hace salir antes?</strong> Una noticia, el fin de la sesión, un cambio de estructura en contra o que pase demasiado tiempo sin moverse.</li>
          </ol>
        </div>
        <div className="fig">
          <div className="fig-title">Plan escrito de una operación</div>
          <table className="t wide">
            <thead><tr><th>Si pasa…</th><th>Hago…</th></tr></thead>
            <tbody>
              <tr><td>El precio toca el stop</td><td>Salgo. Sin mover el stop &quot;para darle aire&quot;.</td></tr>
              <tr><td>Llega a +1R y deja un nuevo mínimo más alto en 15m</td><td>Subo el stop debajo de ese mínimo.</td></tr>
              <tr><td>Llega al 50% del rango (primer objetivo)</td><td>Cierro el 50% y paso el resto a break-even.</td></tr>
              <tr><td>Faltan 10 minutos para el CPI</td><td>Cierro o reduzco: no mantengo riesgo completo en la noticia.</td></tr>
              <tr><td>Termina la sesión de Nueva York sin llegar al objetivo</td><td>Cierro a mercado (salida por tiempo).</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rd-sentinel" data-l="gt-plan" />
      </article>

      <article className="lesson" id="gt-lab">
        <h3><span className="ln">{"24.2"}</span>Laboratorio de reglas de salida</h3>
        <div className="prose">
          <p>Cada regla de gestión cambia <strong>la forma</strong> de los resultados. El break-even convierte perdedoras en operaciones a cero, pero también saca trades que habrían ganado. El parcial sube el porcentaje de acierto y recorta las ganadoras grandes. El trailing stop deja correr las tendencias y devuelve parte de la ganancia al final.</p>
          <p>El simulador lanza <strong>1 500 operaciones</strong> sobre los mismos caminos de precio y aplica las cuatro reglas a la vez, con un riesgo de 1R. Empieza sin ventaja y luego súbela.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Ventaja del sistema</span><input type="range" id="gt-mu" min="-4" max="12" defaultValue="0" style={{ width: '130px' }} /><span className="val" id="gt-mu-v" /></div>
            <div className="seg" data-key="gt-reg"><button className="on" data-v="rnd">Aleatorio</button><button data-v="trend">Tendencial</button><button data-v="chop">Con retrocesos</button></div>
            <button className="btn" id="gt-new">Otra muestra</button>
          </div>
          <div className="controls">
            <div className="grp"><span className="lbl">Objetivo</span><input type="range" id="gt-t" min="2" max="10" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="gt-t-v" /></div>
            <div className="grp"><span className="lbl">Break-even al llegar a</span><input type="range" id="gt-b" min="1" max="8" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="gt-b-v" /></div>
            <div className="grp"><span className="lbl">Distancia del trailing</span><input type="range" id="gt-k" min="2" max="8" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="gt-k-v" /></div>
          </div>
          <div className="chart-host" id="fig-gt-rules" />
          <div id="gt-table" style={{ overflowX: 'auto', marginTop: '10px' }} />
          <div className="explain" id="gt-explain" />
        </div>
        <div className="callout warn"><h5>Lo que enseña el simulador</h5><p>Con el precio aleatorio todas las reglas terminan cerca de 0R. La gestión no crea ventaja: la ventaja está en <em>dónde</em> entras. La gestión decide cómo se reparte el resultado y cuánto aguantas las rachas.</p></div>
        <div className="rd-sentinel" data-l="gt-lab" />
      </article>

      <article className="lesson" id="gt-parcial">
        <h3><span className="ln">{"24.3"}</span>Cierres parciales: cuándo suman</h3>
        <div className="prose">
          <p>Cerrar una parte en el primer objetivo da tranquilidad y asegura algo. El precio es que la parte cerrada ya no llega al objetivo final. Que convenga o no depende de una sola cosa: <strong>cuántas operaciones llegan al primer objetivo y luego se dan la vuelta</strong>.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Cierro</span><input type="range" id="gp-p" min="10" max="90" step="10" defaultValue="50" style={{ width: '110px' }} /><span className="val" id="gp-p-v" /></div>
            <div className="grp"><span className="lbl">en</span><input type="range" id="gp-t1" min="2" max="12" defaultValue="4" style={{ width: '110px' }} /><span className="val" id="gp-t1-v" /></div>
            <div className="grp"><span className="lbl">Objetivo final</span><input type="range" id="gp-t2" min="2" max="12" defaultValue="6" style={{ width: '110px' }} /><span className="val" id="gp-t2-v" /></div>
            <div className="seg" data-key="gp-rest"><button className="on" data-v="be">Resto a break-even</button><button data-v="orig">Resto con stop original</button></div>
          </div>
          <div className="controls">
            <div className="grp"><span className="lbl">Operaciones que llegan al primer objetivo</span><input type="range" id="gp-a" min="10" max="90" defaultValue="55" style={{ width: '130px' }} /><span className="val" id="gp-a-v" /></div>
            <div className="grp"><span className="lbl">De esas, las que siguen hasta el final</span><input type="range" id="gp-q" min="5" max="95" defaultValue="45" style={{ width: '130px' }} /><span className="val" id="gp-q-v" /></div>
          </div>
          <div className="chart-host" id="fig-gt-parcial" />
          <div className="readout" id="gp-out" />
          <div className="explain" id="gp-explain" />
        </div>
        <div className="rd-sentinel" data-l="gt-parcial" />
      </article>

      <article className="lesson" id="gt-trail">
        <h3><span className="ln">{"24.4"}</span>Trailing stop: por ATR o por estructura</h3>
        <div className="prose">
          <p>Un trailing stop sube detrás del precio y nunca baja. Las dos formas más usadas:</p>
          <ul>
            <li><strong>Por volatilidad (chandelier):</strong> el stop queda a <span className="mono">k × ATR</span> del máximo alcanzado. Se adapta solo a lo que se mueve el mercado (ver <Link href="/volat/#vo-atr">ATR</Link>).</li>
            <li><strong>Por estructura:</strong> el stop se mueve debajo de cada nuevo mínimo más alto confirmado. Sale cuando la tendencia rompe estructura (ver <Link href="/estructura/">estructura de mercado</Link>).</li>
          </ul>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="seg" data-key="gtr-mode"><button className="on" data-v="both">Ambos</button><button data-v="atr">ATR</button><button data-v="est">Estructura</button></div>
            <div className="grp"><span className="lbl">Multiplicador</span><input type="range" id="gtr-k" min="4" max="16" defaultValue="12" style={{ width: '150px' }} /><span className="val" id="gtr-k-v" /></div>
            <button className="btn" id="gtr-new">Nuevo gráfico</button>
          </div>
          <div className="chart-host" id="fig-gt-trail" />
          <div className="legend"><span><i className="dash" style={{ borderColor: 'var(--c-liq)' }} />Trailing por ATR</span><span><i className="dash" style={{ borderColor: 'var(--c-ob)' }} />Trailing por estructura</span><span><i className="dash" style={{ borderColor: 'var(--c-entry)' }} />Entrada</span></div>
          <div className="readout" id="gtr-out" />
          <div className="explain" id="gtr-explain" />
        </div>
        <div className="rd-sentinel" data-l="gt-trail" />
      </article>

      <article className="lesson" id="gt-cerrar">
        <h3><span className="ln">{"24.5"}</span>Cuándo cerrar antes (y cuándo no)</h3>
        <div className="cols">
          <div className="callout tip-c"><h5>Razones válidas</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li><strong>La idea se invalidó</strong> antes del stop: cambio de estructura en contra en tu temporalidad de entrada.</li>
              <li><strong>Viene una noticia</strong> de alto impacto y tu plan dice no mantener riesgo completo (ver <Link href="/macro/">macro</Link>).</li>
              <li><strong>Salida por tiempo:</strong> el setup tenía que funcionar en la sesión y no lo hizo. El capital quieto también cuesta.</li>
              <li>Viernes por la noche con swap o riesgo de hueco el lunes.</li>
            </ul>
          </div>
          <div className="callout err"><h5>Razones que no lo son</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>&quot;Ya gano algo, mejor lo aseguro&quot; sin que nada haya cambiado: es el <strong>efecto disposición</strong> (ver <Link href="/psicologia/#ps-sesgos">psicología</Link>).</li>
              <li>Mover el stop lejos porque el precio se acerca.</li>
              <li>Mover a break-even en cuanto la operación respira: con retrocesos normales te saca justo antes de que funcione.</li>
              <li>Cerrar porque las dos operaciones anteriores perdieron.</li>
            </ul>
          </div>
        </div>
        <div className="prose"><p>Una prueba útil: si hubieras visto el gráfico actual <em>sin estar dentro</em>, ¿abrirías esta operación ahora? Si la respuesta es no por razones del gráfico (no por miedo), cerrar es coherente.</p></div>
        <div className="rd-sentinel" data-l="gt-cerrar" />
      </article>
      <div id="gestion-quiz" />
    </>
  );
}
