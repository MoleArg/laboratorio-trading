// Contenido del módulo «ADX e Ichimoku».
import Link from 'next/link';

export default function Adx() {
  return (
    <>
      <article className="lesson" id="adx-que">
        <h3><span className="ln">{"14.1"}</span>ADX y DMI: ¿hay tendencia o no?</h3>
        <div className="prose">
          <p>Casi todas las estrategias funcionan solo en un tipo de mercado: las de seguir tendencia mueren en los rangos y las de comprar soportes mueren en las tendencias. J. Welles Wilder (el del <Link href="/rsi/">RSI</Link> y el <Link href="/volat/#vo-atr">ATR</Link>) creó en 1978 el <strong>sistema de movimiento direccional</strong> para responder esa pregunta antes de elegir estrategia:</p>
          <ul>
            <li><strong>+DI</strong> mide cuánto empuja el precio hacia arriba (máximos que superan al anterior).</li>
            <li><strong>−DI</strong> mide cuánto empuja hacia abajo (mínimos que perforan al anterior).</li>
            <li><strong>ADX</strong> mide la <strong>fuerza</strong> de la tendencia sin importar la dirección: cuánto se separan +DI y −DI, suavizado.</li>
          </ul>
          <p>Lecturas clásicas: ADX <strong>bajo 20</strong> = sin tendencia; <strong>sobre 25</strong> = tendencia; ADX <strong>subiendo</strong> = la tendencia gana fuerza, sea alcista o bajista.</p>
        </div>
        <div className="rd-sentinel" data-l="adx-que" />
      </article>

      <article className="lesson" id="adx-lab">
        <h3><span className="ln">{"14.2"}</span>Laboratorio de ADX</h3>
        <div className="fig">
          <div className="controls">
            <div className="seg" data-key="sc"><button className="on" data-v="trend">Rango → tendencia</button><button data-v="range">Lateral</button><button data-v="reversal">Giro</button></div>
            <div className="grp"><span className="lbl">Periodo</span><input type="range" id="adx-n" min="5" max="30" defaultValue="14" style={{ width: '140px' }} /><span className="val" id="adx-n-v" /></div>
            <button className="btn" id="adx-new">Otro gráfico</button>
          </div>
          <div className="chart-host" id="fig-adx" />
          <div className="legend"><span><i style={{ background: 'var(--c-up)' }} />+DI</span><span><i style={{ background: 'var(--c-down)' }} />−DI</span><span><i style={{ background: 'var(--strong)' }} />ADX</span></div>
          <div className="explain" id="adx-explain" />
        </div>
        <div className="fig">
          <div className="fig-title">El cálculo, vela a vela (periodo 14)</div>
          <div className="controls"><div className="grp"><span className="lbl">Vela</span><input type="range" id="adx-i" min="30" max="120" defaultValue="60" style={{ width: '260px' }} /><span className="val" id="adx-i-v" /></div></div>
          <div id="adx-step-t" style={{ overflowX: 'auto' }} />
        </div>
        <div className="rd-sentinel" data-l="adx-lab" />
      </article>

      <article className="lesson" id="adx-uso">
        <h3><span className="ln">{"14.3"}</span>Cómo se usa el ADX</h3>
        <div className="cols">
          <div className="callout tip-c"><h5>Como filtro</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>ADX &gt; 25 y subiendo: opera a favor de la tendencia (retrocesos, rupturas) y no busques techos.</li>
              <li>ADX &lt; 20: opera el rango (soportes y resistencias, osciladores en extremos) y desconfía de las rupturas.</li>
              <li>ADX muy alto (&gt; 45) que empieza a girar: la tendencia se está cansando. No es señal de giro, es señal de no perseguir.</li>
            </ul>
          </div>
          <div className="callout err"><h5>Errores comunes</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li>Leer ADX alto como &quot;alcista&quot;: también sube en caídas fuertes.</li>
              <li>Operar cada cruce de +DI y −DI: en rango dan una señal falsa tras otra.</li>
              <li>Olvidar que llega tarde: con periodo 14 necesita varias velas para confirmar.</li>
            </ul>
          </div>
        </div>
        <div className="rd-sentinel" data-l="adx-uso" />
      </article>

      <article className="lesson" id="ichi-que">
        <h3><span className="ln">{"14.4"}</span>Ichimoku: el gráfico &quot;de un vistazo&quot;</h3>
        <div className="prose">
          <p><strong>Ichimoku Kinko Hyo</strong> (&quot;gráfico de equilibrio de un vistazo&quot;) lo desarrolló Goichi Hosoda en Japón antes de la Segunda Guerra Mundial. Combina tendencia, soportes y momentum en cinco líneas, casi todas puntos medios de máximos y mínimos:</p>
          <ul>
            <li><strong>Tenkan-sen</strong> (línea de giro): punto medio de las últimas 9 velas. Rápida.</li>
            <li><strong>Kijun-sen</strong> (línea base): punto medio de las últimas 26 velas. El &quot;equilibrio&quot; de medio plazo.</li>
            <li><strong>Senkou span A</strong>: media de Tenkan y Kijun, <strong>proyectada 26 velas hacia adelante</strong>.</li>
            <li><strong>Senkou span B</strong>: punto medio de 52 velas, también proyectado 26 hacia adelante. Entre A y B se forma la <strong>nube (kumo)</strong>.</li>
            <li><strong>Chikou span</strong>: el cierre actual dibujado 26 velas hacia atrás.</li>
          </ul>
        </div>
        <div className="fig">
          <div className="controls">
            <label className="grp"><input type="checkbox" className="ichi-c" value="kumo" defaultChecked /> Nube</label>
            <label className="grp"><input type="checkbox" className="ichi-c" value="tenkan" defaultChecked /> Tenkan</label>
            <label className="grp"><input type="checkbox" className="ichi-c" value="kijun" defaultChecked /> Kijun</label>
            <label className="grp"><input type="checkbox" className="ichi-c" value="chikou" /> Chikou</label>
            <button className="btn" id="ichi-new">Otro gráfico</button>
          </div>
          <div className="chart-host" id="fig-ichi" />
          <div className="legend"><span><i style={{ background: 'var(--c-rsi)' }} />Tenkan (9)</span><span><i style={{ background: 'var(--c-liq)' }} />Kijun (26)</span><span><i className="box" style={{ background: 'var(--c-up)' }} />Nube alcista (A &gt; B)</span><span><i className="box" style={{ background: 'var(--c-down)' }} />Nube bajista (B &gt; A)</span><span><i style={{ background: 'var(--text-2)' }} />Chikou</span></div>
          <div className="explain" id="ichi-explain" />
        </div>
        <div className="rd-sentinel" data-l="ichi-que" />
      </article>

      <article className="lesson" id="ichi-uso">
        <h3><span className="ln">{"14.5"}</span>Señales de Ichimoku (y sus límites)</h3>
        <div className="prose">
          <ul>
            <li><strong>Precio frente a la nube:</strong> encima = sesgo alcista, debajo = bajista, dentro = indecisión. La nube funciona como zona de soporte o resistencia; cuanto más gruesa, más fuerte.</li>
            <li><strong>Cruce Tenkan / Kijun (TK cross):</strong> Tenkan cruza por encima de Kijun = señal alcista, más fiable si ocurre por encima de la nube.</li>
            <li><strong>Kijun como stop o trailing:</strong> en tendencia, el precio suele respetar la Kijun en los retrocesos.</li>
            <li><strong>Chikou libre:</strong> la confirmación es que la Chikou esté por encima del precio de hace 26 velas (alcista) sin chocar con él.</li>
            <li><strong>Giro de la nube (kumo twist):</strong> cuando A y B se cruzan en la nube futura, cambia el equilibrio de medio plazo.</li>
          </ul>
        </div>
        <div className="callout warn"><h5>Límites</h5><p>Los periodos 9/26/52 vienen de la semana laboral japonesa de seis días. Funcionan razonablemente en diario y 4H; en temporalidades muy bajas y en rangos la nube se vuelve fina y las señales se multiplican. Como el ADX, Ichimoku es un sistema de tendencia: en lateral, se equivoca.</p></div>
        <div className="rd-sentinel" data-l="ichi-uso" />
      </article>
      <div id="adx-quiz" />
    </>
  );
}
