// Contenido del módulo «Smart Money Concepts». Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
// @ts-nocheck

export default function Smc() {
  return (
    <>
      <article className="lesson" id="smc-que">{" "}<h3><span className="ln">{"18.1"}</span>{"Qué es SMC (y qué no es)"}</h3>{" "}<div className="prose">{" "}<ul><li><strong>{"Estructura:"}</strong>{" swings, BOS y CHoCH (módulo Estructura)."}</li><li><strong>{"Liquidez:"}</strong>{" BSL, SSL, barridos, inducement (módulo Liquidez y abajo)."}</li><li><strong>{"Zonas de interés (POI):"}</strong>{" order blocks, FVG, breakers, mitigation blocks."}</li><li><strong>{"Ubicación:"}</strong>{" premium / descuento y OTE."}</li><li><strong>{"Tiempo:"}</strong>{" sesiones y killzones (módulo Sesiones), Power of 3."}</li></ul>{" "}<p>{"Ventajas: da una narrativa coherente (¿de dónde viene el precio y a qué liquidez va?). Límites: muchas de sus explicaciones (\"el institucional hace X\") son "}<strong>{"interpretaciones, no hechos comprobados"}</strong>{", y la terminología varía entre autores. Úsalo como un mapa que hay que validar con tu propio backtest."}</p>{" "}</div>{" "}<div className="rd-sentinel" data-l="smc-que" /></article>
      <article className="lesson" id="smc-flujo">{" "}<h3><span className="ln">{"18.2"}</span>{"El flujo de análisis (de arriba hacia abajo)"}</h3>{" "}<div className="prose"><p>{"Haz clic en cada paso para ir al módulo que lo explica."}</p></div>{" "}<div className="fig"><div className="chart-host" id="fig-smc-flow" /></div>{" "}<div className="rd-sentinel" data-l="smc-flujo" /></article>
      <article className="lesson" id="smc-ind">{" "}<h3><span className="ln">{"18.3"}</span>{"Inducement: el cebo antes de la zona real"}</h3>{" "}<div className="prose"><p>{"Un "}<strong>{"inducement"}</strong>{" es un mínimo (o máximo) menor y muy evidente que aparece "}<em>{"antes"}</em>{" de la zona de interés real. Muchos traders entran ahí y dejan sus stops justo detrás: esa liquidez es lo que el precio va a buscar antes de llegar al POI verdadero. Regla práctica: "}<strong>{"espera a que el inducement sea barrido"}</strong>{" antes de confiar en el POI."}</p></div>{" "}<div className="fig">{" "}<div className="steps-nav"><button className="btn" id="ind-prev">{"◀ Anterior"}</button><div className="dots" id="ind-dots" /><button className="btn primary" id="ind-next">{"Siguiente ▶"}</button></div>{" "}<div className="chart-host" id="fig-smc-ind" />{" "}<div className="step-box" id="ind-step" />{" "}</div>{" "}<div className="rd-sentinel" data-l="smc-ind" /></article>
      <article className="lesson" id="smc-bk">{" "}<h3><span className="ln">{"18.4"}</span>{"Breaker block y mitigation block"}</h3>{" "}<div className="prose">{" "}<ul><li><strong>{"Breaker block (alcista):"}</strong>{" el precio hace un mínimo, rebota (las últimas velas alcistas de ese rebote forman una zona), cae a un "}<strong>{"mínimo más bajo que barre la liquidez"}</strong>{" y luego sube con fuerza rompiendo por encima de esa zona. La zona \"fallida\" cambia de papel y se convierte en soporte: el retesteo es la entrada."}</li><li><strong>{"Mitigation block:"}</strong>{" lo mismo pero "}<strong>{"sin barrido"}</strong>{": el segundo mínimo queda por encima del primero (falla en hacer un mínimo más bajo). Suele leerse como continuación."}</li><li>{"Las definiciones varían entre autores; la diferencia clave que casi todos comparten es si hubo o no barrido de liquidez."}</li></ul>{" "}</div>{" "}<div className="fig">{" "}<div className="controls"><div className="seg" data-key="bk"><button className="on" data-v="breaker">{"Breaker block"}</button><button data-v="mitigation">{"Mitigation block"}</button></div></div>{" "}<div className="chart-host" id="fig-smc-bk" />{" "}<div className="explain" id="bk-explain" />{" "}</div>{" "}<div className="rd-sentinel" data-l="smc-bk" /></article>
      <article className="lesson" id="smc-ote">{" "}<h3><span className="ln">{"18.5"}</span>{"OTE: la entrada óptima con Fibonacci"}</h3>{" "}<div className="prose"><p>{"Tras un desplazamiento que rompe estructura, se traza Fibonacci del inicio al final del impulso. La "}<strong>{"OTE"}</strong>{" (optimal trade entry) es la zona de retroceso entre el "}<strong>{"62% y el 79%"}</strong>{", con el 70,5% como punto medio. Está en descuento (bajo el 50%), ofrece buen riesgo/beneficio con el stop bajo el inicio del impulso, y el objetivo es la liquidez sobre el máximo (algunos usan extensiones como −0,27)."}</p></div>{" "}<div className="fig">{" "}<div className="controls">{" "}<div className="grp"><span className="lbl">{"Profundidad del retroceso"}</span><input type="range" id="ote-r" min="10" max="95" defaultValue="70" style={{"width":"240px"}} /><span className="val" id="ote-r-v">{"70%"}</span></div>{" "}<label className="grp"><input type="checkbox" id="ote-cont" defaultChecked />{" Ver continuación"}</label>{" "}</div>{" "}<div className="chart-host" id="fig-smc-ote" />{" "}<div className="readout" id="ote-stats" />{" "}<div className="explain" id="ote-explain" />{" "}</div>{" "}<div className="rd-sentinel" data-l="smc-ote" /></article>
      <article className="lesson" id="smc-po3">{" "}<h3><span className="ln">{"18.6"}</span>{"Power of 3 (AMD) en la vela diaria"}</h3>{" "}<div className="prose"><p>{"La vela del día se construye en tres actos: "}<strong>{"Acumulación"}</strong>{" (Asia, rango cerca de la apertura), "}<strong>{"Manipulación"}</strong>{" (Londres mueve el precio "}<em>{"en contra"}</em>{" de la dirección del día, barriendo liquidez: la mecha) y "}<strong>{"Distribución"}</strong>{" (Nueva York expande en la dirección real: el cuerpo). Es la base de la CRT."}</p></div>{" "}<div className="fig">{" "}<div className="controls">{" "}<div className="seg" data-key="po3"><button className="on" data-v="bull">{"Día alcista"}</button><button data-v="bear">{"Día bajista"}</button></div>{" "}<button className="btn primary" id="po3-play">{"▶ Construir la vela del día"}</button>{" "}</div>{" "}<div className="chart-host" id="fig-smc-po3" />{" "}<div className="explain" id="po3-explain" />{" "}</div>{" "}<div className="rd-sentinel" data-l="smc-po3" /></article>
      <article className="lesson" id="smc-pd">
        <h3><span className="ln">{"18.7"}</span>Más PD arrays: IFVG, volume imbalance y liquidity void</h3>
        <div className="prose"><p>ICT llama <strong>PD arrays</strong> (premium / discount arrays) a todas las zonas donde el precio puede reaccionar: order blocks, FVG, breakers… Estos tres completan la lista. Todos nacen de lo mismo: tramos donde el precio se movió tan rápido que la negociación quedó desequilibrada.</p></div>
        <div className="fig">
          <div className="controls"><div className="seg" data-key="pd"><button className="on" data-v="ifvg">IFVG</button><button data-v="vi">Volume imbalance</button><button data-v="void">Liquidity void</button></div></div>
          <div className="chart-host" id="fig-smc-pd" />
          <div className="explain" id="pda-explain" />
        </div>
        <div className="rd-sentinel" data-l="smc-pd" />
      </article>
      <article className="lesson" id="smc-gaps">
        <h3><span className="ln">{"18.8"}</span>Gaps de apertura: NWOG y NDOG</h3>
        <div className="prose">
          <p>En los futuros de índices el mercado cierra el viernes y reabre el domingo por la noche, a menudo con un salto. ICT llama <strong>NWOG</strong> (new week opening gap) al hueco entre el cierre del viernes y la apertura de la semana, y <strong>NDOG</strong> (new day opening gap) al hueco diario entre el cierre de las 17:00 y la reapertura de las 18:00 de Nueva York.</p>
          <p>Se tratan como zonas de referencia durante días o semanas: el precio tiende a volver a ellas, y su punto medio, el <strong>CE</strong> (consequent encroachment), suele dar la reacción más limpia.</p>
        </div>
        <div className="fig"><div className="chart-host" id="fig-smc-gap" /></div>
        <div className="rd-sentinel" data-l="smc-gaps" />
      </article>
      <article className="lesson" id="smc-sb">
        <h3><span className="ln">{"18.9"}</span>Silver Bullet: una ventana de una hora</h3>
        <div className="prose">
          <p>El <strong>Silver Bullet</strong> es un modelo de ICT acotado en el tiempo. Dentro de una ventana fija de una hora se busca: 1) un barrido de la liquidez cercana, 2) un desplazamiento que deje un <strong>FVG</strong> y 3) una entrada en ese FVG con objetivo en la liquidez opuesta. Si en la ventana no aparece, no hay operación.</p>
        </div>
        <div className="fig">
          <div className="readout" id="sb-times" />
          <div className="chart-host" id="fig-smc-sb" />
          <div className="explain">El mínimo de la apertura (9:30) acumula stops de venta. A las 10:05 se barre, a las 10:15 un desplazamiento deja un FVG, a las 10:25 el retroceso lo toca (entrada) y a las 10:40 el precio llega a los máximos iguales de las 9:45–9:50. Todo ocurre dentro de la ventana.</div>
        </div>
        <div className="rd-sentinel" data-l="smc-sb" />
      </article>
      <article className="lesson" id="smc-mmm">
        <h3><span className="ln">{"18.10"}</span>Market Maker Model: la curva completa</h3>
        <div className="prose">
          <p>El <strong>Market Maker Buy Model</strong> describe un ciclo entero: desde una consolidación original el precio baja en escalones (el lado vendedor de la curva), llega a una zona de descuento de temporalidad mayor, gira con un <strong>smart money reversal</strong> (SMR: barrido + cambio de estructura) y sube por el lado comprador <strong>visitando los mismos niveles</strong> en los que se había detenido al bajar. El Sell Model es el espejo.</p>
          <p>Su utilidad práctica: tras el SMR, las consolidaciones del camino de ida son los objetivos parciales del camino de vuelta.</p>
        </div>
        <div className="fig">
          <div className="controls"><div className="seg" data-key="mmm"><button className="on" data-v="buy">Buy model</button><button data-v="sell">Sell model</button></div></div>
          <div className="chart-host" id="fig-smc-mmm" />
        </div>
        <div className="callout warn"><h5>Con cuidado</h5><p>Estos modelos son descripciones a posteriori muy útiles para ordenar el gráfico, pero cuantos más nombres tiene un patrón, más fácil es encontrarlo en cualquier sitio. Valídalos con tu propio <a href="#bt-que">backtest</a> antes de operarlos.</p></div>
        <div className="rd-sentinel" data-l="smc-mmm" />
      </article>
      <article className="lesson" id="smc-errores">{" "}<h3><span className="ln">{"18.11"}</span>{"Errores comunes"}</h3>{" "}<div className="callout err"><h5>{"Ver order blocks en cada vela"}</h5>{"Un POI válido nace de un desplazamiento que rompe estructura, idealmente tras un barrido. Sin eso, es solo una vela."}</div>{" "}<div className="callout err"><h5>{"Ignorar premium y descuento"}</h5>{"Comprar un \"order block\" en premium dentro de un rango alcista suele salir caro."}</div>{" "}<div className="callout err"><h5>{"Entrar en el inducement"}</h5>{"El primer retroceso obvio suele ser el cebo. Espera el barrido y la zona real."}</div>{" "}<div className="callout err"><h5>{"Creer que es infalible"}</h5>{"SMC organiza el análisis; no elimina las pérdidas. Riesgo fijo por operación y backtesting."}</div>{" "}<div className="rd-sentinel" data-l="smc-errores" /></article>
      <div id="smc-quiz" />
    </>
  );
}
