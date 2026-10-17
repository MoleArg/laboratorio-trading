// Contenido del módulo «Macro y calendario económico».
import Link from 'next/link';

export default function Macro() {
  return (
    <>
      <article className="lesson" id="mc-que">
        <h3><span className="ln">{"9.1"}</span>Qué mueve un mercado a largo plazo</h3>
        <div className="prose">
          <p>El análisis técnico dice <em>dónde</em> y <em>cuándo</em>; la macro explica buena parte del <em>por qué</em> de las tendencias grandes. No hace falta ser economista, pero sí entender cuatro fuerzas:</p>
          <ul>
            <li><strong>Tasas de interés:</strong> el precio del dinero. Una moneda con tasas más altas (o que se espera que suban) atrae capital. Es la fuerza número uno en divisas.</li>
            <li><strong>Inflación:</strong> decide lo que harán los bancos centrales con las tasas. Por eso el dato de inflación (IPC / CPI) mueve tanto.</li>
            <li><strong>Crecimiento y empleo:</strong> una economía fuerte permite tasas altas; una débil empuja a bajarlas.</li>
            <li><strong>Apetito de riesgo:</strong> en calma el dinero busca rentabilidad (índices, cripto, monedas de tasas altas); en pánico busca refugio (dólar, yen, franco suizo, oro, bonos). Es el <em>risk-on / risk-off</em>.</li>
          </ul>
          <p>La clave: el mercado opera <strong>expectativas</strong>. Un banco central que sube las tasas puede hundir su moneda si el mercado esperaba una subida mayor.</p>
        </div>
        <div className="rd-sentinel" data-l="mc-que" />
      </article>

      <article className="lesson" id="mc-cal">
        <h3><span className="ln">{"9.2"}</span>El calendario económico: qué datos importan</h3>
        <div className="prose"><p>Los datos se publican a horas fijas y cualquier calendario económico (Forex Factory, Investing, el de tu broker) los marca por impacto. Estos son los que más mueven. La columna <strong>Tu hora</strong> está convertida a tu zona horaria (<span className="mono" id="mc-cal-tz" />) para el día de hoy, con los cambios de horario de verano incluidos.</p></div>
        <div className="fig"><div id="mc-cal-t" style={{ overflowX: 'auto' }} /></div>
        <div className="callout warn"><h5>Ojo con el horario de verano</h5><p>EE. UU. y Europa cambian la hora en fechas distintas, y Argentina no cambia. Durante unas semanas al año la diferencia con Nueva York o Londres se mueve una hora. Comprueba siempre la hora del calendario en tu zona.</p></div>
        <div className="rd-sentinel" data-l="mc-cal" />
      </article>

      <article className="lesson" id="mc-sorpresa">
        <h3><span className="ln">{"9.3"}</span>Lo que mueve el precio es la sorpresa</h3>
        <div className="prose"><p>Cada dato tiene un <strong>consenso</strong>: la mediana de lo que esperan los analistas. El precio ya incorpora ese consenso antes de la publicación. Cuando sale el dato, el mercado reacciona a la <strong>diferencia</strong> entre lo publicado y lo esperado. Prueba con la inflación de EE. UU.:</p></div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Consenso (IPC interanual)</span><input type="range" id="ms-c" min="20" max="40" defaultValue="30" style={{ width: '140px' }} /><span className="val" id="ms-c-v" /></div>
            <div className="grp"><span className="lbl">Dato publicado</span><input type="range" id="ms-r" min="20" max="40" defaultValue="33" style={{ width: '140px' }} /><span className="val" id="ms-r-v" /></div>
            <label className="grp"><input type="checkbox" id="ms-p" /> El mercado ya lo intuía</label>
          </div>
          <div className="chart-host" id="fig-mc-sur" />
          <div className="readout" id="ms-out" />
          <div className="explain" id="ms-explain" />
        </div>
        <div className="rd-sentinel" data-l="mc-sorpresa" />
      </article>

      <article className="lesson" id="mc-dxy">
        <h3><span className="ln">{"9.4"}</span>La cadena: tasas → dólar → todo lo demás</h3>
        <div className="prose"><p>Casi todo cotiza contra el dólar, así que una noticia de EE. UU. se contagia a divisas, índices, oro y cripto. Elige un escenario y mira la reacción típica (ver también <Link href="/mercados/#mk-relacion">cómo se relacionan los mercados</Link>).</p></div>
        <div className="fig">
          <div className="controls"><div className="seg" data-key="chain">
            <button className="on" data-v="cpiHot">IPC alto</button><button data-v="cpiCold">IPC bajo</button><button data-v="hawk">Fed dura</button><button data-v="dove">Fed blanda</button><button data-v="nfpStrong">Empleo fuerte</button><button data-v="riskOff">Pánico</button>
          </div></div>
          <div id="mc-chain-t" />
          <div className="explain" id="mc-chain-explain" />
        </div>
        <div className="rd-sentinel" data-l="mc-dxy" />
      </article>

      <article className="lesson" id="mc-evento">
        <h3><span className="ln">{"9.5"}</span>Operar alrededor de una noticia (o no operar)</h3>
        <div className="prose">
          <p>En el segundo del dato la liquidez desaparece: los creadores de mercado retiran sus órdenes, el <strong>spread se abre</strong> y el precio puede saltar varios niveles sin cotizar en medio. Tu stop no es un precio garantizado: es una orden que se ejecuta al siguiente precio disponible.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Distancia al stop</span><input type="range" id="slp-d" min="3" max="40" defaultValue="10" style={{ width: '140px' }} /><span className="val" id="slp-d-v" /></div>
            <div className="grp"><span className="lbl">Salto del precio en el dato</span><input type="range" id="slp-g" min="0" max="40" defaultValue="18" style={{ width: '140px' }} /><span className="val" id="slp-g-v" /></div>
            <div className="grp"><span className="lbl">Spread en el dato</span><input type="range" id="slp-s" min="1" max="60" defaultValue="25" style={{ width: '120px' }} /><span className="val" id="slp-s-v" /></div>
          </div>
          <div className="chart-host" id="fig-mc-slip" />
          <div className="readout" id="slp-out" />
          <div className="explain" id="slp-explain" />
        </div>
        <div className="cols">
          <div className="callout tip-c"><h5>Opciones razonables</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li><strong>Estar fuera</strong> desde unos minutos antes hasta 10–15 minutos después.</li>
              <li>Si mantienes una posición: stop ya en break-even o tamaño reducido.</li>
              <li>Esperar a que el primer latigazo termine y operar el barrido que suele dejar (ver <Link href="/liquidez/#liq-barrido">barrido</Link>).</li>
            </ul>
          </div>
          <div className="callout err"><h5>Lo que sale caro</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>Entrar justo antes &quot;apostando&quot; al dato.</li>
              <li>Órdenes pendientes a ambos lados (straddle): el latigazo puede activar las dos.</li>
              <li>Creer que una cuenta con stop no puede perder más de 1R.</li>
            </ul>
          </div>
        </div>
        <div className="rd-sentinel" data-l="mc-evento" />
      </article>
      <div id="macro-quiz" />
    </>
  );
}
