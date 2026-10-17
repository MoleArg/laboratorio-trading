// Contenido del módulo «Backtesting y validación».
import Link from 'next/link';

export default function Backtest() {
  return (
    <>
      <article className="lesson" id="bt-que">
        <h3><span className="ln">{"25.1"}</span>Tres formas de probar una estrategia</h3>
        <div className="prose">
          <ul>
            <li><strong>Backtest manual:</strong> recorres el histórico vela a vela (como en el <Link href="/replay/">simulador</Link>) y anotas cada operación que tus reglas habrían tomado. Lento, pero entrena el ojo.</li>
            <li><strong>Backtest automático:</strong> las reglas se programan y se ejecutan sobre años de datos en segundos. Exige reglas 100% objetivas y es donde más fácil es engañarse (ver sobreajuste, abajo).</li>
            <li><strong>Forward test:</strong> operas las mismas reglas en tiempo real, en demo o con tamaño mínimo. Es la única prueba en la que no puedes ver el futuro.</li>
          </ul>
          <p>En cada operación registra como mínimo: fecha y hora, activo, dirección, setup, entrada, stop, objetivo, resultado <strong>en R</strong>, MAE/MFE (cuánto fue en contra y a favor) y una captura. Sin registro no hay estadística: hay recuerdos, y los recuerdos eligen las operaciones buenas.</p>
        </div>
        <div className="rd-sentinel" data-l="bt-que" />
      </article>

      <article className="lesson" id="bt-muestra">
        <h3><span className="ln">{"25.2"}</span>¿Cuántas operaciones necesitas?</h3>
        <div className="prose">
          <p>Un backtest es una muestra. Aunque las reglas tengan una ventaja real fija, cada muestra de N operaciones mide un valor distinto. El gráfico repite el mismo backtest 3 000 veces para que veas cuánto se mueve el número que obtendrías.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">% de acierto real</span><input type="range" id="bn-wr" min="20" max="70" defaultValue="40" style={{ width: '120px' }} /><span className="val" id="bn-wr-v" /></div>
            <div className="grp"><span className="lbl">R:B</span><input type="range" id="bn-rr" min="4" max="16" defaultValue="8" style={{ width: '110px' }} /><span className="val" id="bn-rr-v" /></div>
            <div className="grp"><span className="lbl">Operaciones del backtest</span><input type="range" id="bn-n" min="10" max="500" step="10" defaultValue="30" style={{ width: '160px' }} /><span className="val" id="bn-n-v" /></div>
            <button className="btn" id="bn-new">Repetir</button>
          </div>
          <div className="chart-host" id="fig-bt-n" />
          <div className="readout" id="bn-out" />
          <div className="explain" id="bn-explain" />
        </div>
        <div className="rd-sentinel" data-l="bt-muestra" />
      </article>

      <article className="lesson" id="bt-overfit">
        <h3><span className="ln">{"25.3"}</span>Sobreajuste: cuando el backtest se aprende el pasado</h3>
        <div className="prose">
          <p>Si pruebas muchas combinaciones (EMA de 9, 10, 11… con stop de 1, 1,5, 2 ATR…) y te quedas con la que mejor salió, casi siempre eliges <strong>la que tuvo más suerte</strong> en ese tramo de datos. Eso es el <strong>sobreajuste</strong> (overfitting). La prueba de fuego es mirar la combinación elegida en datos que no usaste para elegirla: <em>fuera de muestra</em>.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Combinaciones probadas</span><input type="range" id="bo-k" min="1" max="300" defaultValue="60" style={{ width: '180px' }} /><span className="val" id="bo-k-v" /></div>
            <div className="grp"><span className="lbl">Ventaja real de las reglas</span><input type="range" id="bo-e" min="0" max="20" defaultValue="0" style={{ width: '120px' }} /><span className="val" id="bo-e-v" /></div>
            <button className="btn" id="bo-new">Nuevos datos</button>
          </div>
          <div className="chart-host" id="fig-bt-of" />
          <div className="readout" id="bo-out" />
          <div className="explain" id="bo-explain" />
        </div>
        <div className="callout tip-c"><h5>Cómo protegerte</h5>
          <ul style={{ marginLeft: '18px' }}>
            <li>Pocas reglas y pocos parámetros. Si la estrategia necesita siete filtros, sospecha.</li>
            <li>Busca <strong>mesetas</strong>, no picos: si EMA 20 funciona pero 18 y 22 no, es casualidad.</li>
            <li>Reserva datos que no mirarás hasta el final (fuera de muestra) y úsalos una sola vez.</li>
            <li>Cuenta cuántas variantes probaste. Cuantas más, más exigente tiene que ser el resultado.</li>
          </ul>
        </div>
        <div className="rd-sentinel" data-l="bt-overfit" />
      </article>

      <article className="lesson" id="bt-wf">
        <h3><span className="ln">{"25.4"}</span>Walk-forward: optimizar y probar por tramos</h3>
        <div className="prose">
          <p>El análisis <strong>walk-forward</strong> repite el proceso honesto varias veces: ajusta los parámetros en una ventana de datos, los congela y los prueba en el tramo siguiente, que no vio. Después desplaza la ventana y repite. El resultado final se calcula solo con los tramos de prueba encadenados.</p>
        </div>
        <div className="fig"><div className="chart-host" id="fig-bt-wf" /></div>
        <div className="prose"><p>Si los tramos de prueba rinden parecido a los de optimización, la estrategia es robusta. Si se desploman, estabas ajustando ruido.</p></div>
        <div className="rd-sentinel" data-l="bt-wf" />
      </article>

      <article className="lesson" id="bt-sesgos">
        <h3><span className="ln">{"25.5"}</span>Sesgos que inflan un backtest</h3>
        <div className="cols">
          <div className="callout err"><h5>Errores de datos</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li><strong>Mirar el futuro (look-ahead):</strong> usar el cierre de la vela para decidir una entrada a mitad de esa vela, o un indicador que se recalcula después.</li>
              <li><strong>Sesgo de supervivencia:</strong> probar en las acciones que hoy existen ignora las que quebraron y desaparecieron del índice.</li>
              <li><strong>Sin costos:</strong> spread, comisión, swap y deslizamiento pueden convertir +0,1R en −0,1R (ver <Link href="/ordenes/#ord-costos">costos</Link>).</li>
            </ul>
          </div>
          <div className="callout err"><h5>Errores de criterio</h5>
            <ul style={{ marginLeft: '18px' }}>
              <li><strong>Sesgo retrospectivo:</strong> en un gráfico terminado el barrido &quot;obvio&quot; siempre se ve. En vivo no sabías que era el mínimo.</li>
              <li><strong>Elegir el periodo:</strong> probar solo en el año en que todo subió.</li>
              <li><strong>Saltarse operaciones</strong> &quot;porque esa no la habría tomado&quot;. Si la regla la marcaba, cuenta.</li>
            </ul>
          </div>
        </div>
        <div className="rd-sentinel" data-l="bt-sesgos" />
      </article>

      <article className="lesson" id="bt-metricas">
        <h3><span className="ln">{"25.6"}</span>Lee tus resultados</h3>
        <div className="prose">
          <p>El % de acierto solo no dice nada: un 35% con R:B 1:3 gana y un 70% con R:B 1:0,3 pierde. Pega aquí los resultados de tu diario <strong>en R</strong> (por ejemplo <span className="mono">2, -1, -1, 1.5</span>) y mira las métricas juntas.</p>
        </div>
        <div className="fig">
          <textarea id="bt-rs" rows={3} spellCheck={false} aria-label="Resultados en R" />
          <div className="controls"><button className="btn" id="bt-sample">Cargar ejemplo</button></div>
          <div className="chart-host" id="fig-bt-eq" />
          <div className="readout" id="bt-out" />
          <div className="explain" id="bt-explain" />
        </div>
        <div className="prose">
          <ul>
            <li><strong>Expectativa:</strong> lo que ganas de media por operación, en R. Es la métrica principal.</li>
            <li><strong>Profit factor:</strong> ganancias brutas / pérdidas brutas. Por debajo de 1 pierdes; entre 1 y 1,3 los costos mandan.</li>
            <li><strong>Drawdown máximo y peor racha:</strong> lo que vas a tener que aguantar. Compara con la <Link href="/riesgo/#rg-rachas">tabla de rachas</Link>.</li>
          </ul>
        </div>
        <div className="rd-sentinel" data-l="bt-metricas" />
      </article>
      <div id="backtest-quiz" />
    </>
  );
}
