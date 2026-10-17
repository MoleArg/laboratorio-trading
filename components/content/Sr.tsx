// Contenido del módulo «Soportes, resistencias y figuras». Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
// @ts-nocheck

export default function Sr() {
  return (
    <>
      <article className="lesson" id="sr-que">{" "}<h3><span className="ln">{"3.1"}</span>{"Qué son y por qué funcionan"}</h3>{" "}<div className="prose">{" "}<ul><li><strong>{"Son zonas, no líneas exactas:"}</strong>{" el precio reacciona en un área, con mechas que la atraviesan un poco."}</li><li><strong>{"Memoria del mercado:"}</strong>{" en esos precios quedaron órdenes pendientes, traders atrapados que quieren salir \"en cero\" y participantes que esperan volver a comprar o vender ahí."}</li><li><strong>{"Más toques = nivel más visible…"}</strong>{" y también más stops acumulados detrás (liquidez). Por eso un nivel muy obvio puede frenar el precio o ser barrido."}</li><li><strong>{"Números redondos"}</strong>{" (1.1000, 100, 50 000) y máximos/mínimos de días y semanas anteriores son niveles naturales."}</li></ul>{" "}</div>{" "}<div className="rd-sentinel" data-l="sr-que" /></article>
      <article className="lesson" id="sr-zonas">{" "}<h3><span className="ln">{"3.2"}</span>{"Detector de zonas"}</h3>{" "}<div className="prose"><p>{"El detector agrupa los puntos de giro (swings) que quedan a precios parecidos y dibuja una zona cuando hay suficientes toques. Ajusta la sensibilidad y el ancho de zona para ver cómo cambia el mapa."}</p></div>{" "}<div className="fig">{" "}<div className="controls">{" "}<div className="grp"><span className="lbl">{"Sensibilidad de swings"}</span><input type="range" id="sr-n" min="2" max="6" defaultValue="3" style={{"width":"100px"}} /><span className="val" id="sr-n-v">{"3"}</span></div>{" "}<div className="grp"><span className="lbl">{"Ancho de zona"}</span><input type="range" id="sr-tol" min="2" max="12" defaultValue="6" style={{"width":"100px"}} /><span className="val" id="sr-tol-v" /></div>{" "}<div className="grp"><span className="lbl">{"Toques mínimos"}</span><input type="range" id="sr-min" min="2" max="4" defaultValue="2" style={{"width":"80px"}} /><span className="val" id="sr-min-v">{"2"}</span></div>{" "}<button className="btn" id="sr-new">{"Nuevo ejemplo"}</button>{" "}</div>{" "}<div className="chart-host" id="fig-sr" />{" "}<div className="legend"><span><i className="box" style={{"background":"var(--c-up)"}} />{"Soporte (bajo el precio actual)"}</span><span><i className="box" style={{"background":"var(--c-down)"}} />{"Resistencia (sobre el precio actual)"}</span><span>{"S↔R = la zona cambió de papel"}</span></div>{" "}<div className="readout" id="sr-stats" />{" "}<div className="explain" id="sr-explain" />{" "}</div>{" "}<div className="rd-sentinel" data-l="sr-zonas" /></article>
      <article className="lesson" id="sr-polaridad">{" "}<h3><span className="ln">{"3.3"}</span>{"Cambio de polaridad: la resistencia rota se vuelve soporte"}</h3>{" "}<div className="prose">{" "}<p>{"Cuando el precio rompe una resistencia con un cierre claro, quienes vendieron ahí quedan atrapados y quienes se perdieron la ruptura esperan un retroceso para comprar. Por eso, al volver al nivel, este suele actuar como "}<strong>{"soporte"}</strong>{" (y al revés con los soportes rotos). En el detector, las zonas marcadas con "}<strong>{"S↔R"}</strong>{" funcionaron de las dos formas."}</p>{" "}<p>{"Es la misma idea del "}<strong>{"retesteo"}</strong>{" de las líneas de tendencia y del cambio de papel de los breaker blocks en Smart Money."}</p>{" "}</div>{" "}<div className="rd-sentinel" data-l="sr-polaridad" /></article>
      <article className="lesson" id="sr-figuras">{" "}<h3><span className="ln">{"3.4"}</span>{"Figuras chartistas"}</h3>{" "}<div className="prose"><p>{"Elige una figura para ver cómo se forma, dónde se confirma (ruptura), cómo se calcula el objetivo por proyección y dónde queda invalidada. Los objetivos por proyección son "}<strong>{"orientativos"}</strong>{", no promesas."}</p></div>{" "}<div className="fig">{" "}<div className="controls" id="cp-list" />{" "}<div className="chart-host" id="fig-cp" />{" "}<div className="cols" style={{"marginTop":"10px"}}>{" "}<div className="explain" id="cp-info" />{" "}<div className="explain" id="cp-rules" />{" "}</div>{" "}</div>{" "}<div className="rd-sentinel" data-l="sr-figuras" /></article>
      <article className="lesson" id="sr-pivot">
        <h3><span className="ln">{"3.5"}</span>Puntos pivote: niveles calculados</h3>
        <div className="prose">
          <p>Los <strong>puntos pivote</strong> son soportes y resistencias que se calculan con el máximo, el mínimo y el cierre del día anterior. Nacieron en el parqué de futuros y siguen muy usados en intradía porque todo el mundo los calcula igual: muchas órdenes acaban en los mismos precios. Escribe los datos de ayer y elige la variante.</p>
        </div>
        <div className="fig">
          <div className="controls">
            <div className="grp"><span className="lbl">Máximo de ayer</span><input type="number" id="pv-h" defaultValue="1.0950" step="0.0005" style={{ width: '100px' }} /></div>
            <div className="grp"><span className="lbl">Mínimo</span><input type="number" id="pv-l" defaultValue="1.0860" step="0.0005" style={{ width: '100px' }} /></div>
            <div className="grp"><span className="lbl">Cierre</span><input type="number" id="pv-c" defaultValue="1.0920" step="0.0005" style={{ width: '100px' }} /></div>
            <div className="seg" data-key="pv-kind"><button className="on" data-v="classic">Clásico</button><button data-v="fib">Fibonacci</button><button data-v="cam">Camarilla</button></div>
            <button className="btn" id="pv-new">Otro día</button>
          </div>
          <div className="cols" style={{ gridTemplateColumns: '3fr 1fr' }}>
            <div className="chart-host" id="fig-sr-pivot" />
            <div id="pv-t" />
          </div>
          <div className="explain" id="pv-explain" />
        </div>
        <div className="callout warn"><h5>Cómo se usan</h5><p>Como el resto de niveles: zonas donde esperar una reacción, no órdenes automáticas. Funcionan mejor en confluencia (pivote + máximo del día anterior + FVG) y en mercados con un cierre diario claro (futuros, índices, forex a las 17:00 de Nueva York).</p></div>
        <div className="rd-sentinel" data-l="sr-pivot" />
      </article>
      <article className="lesson" id="sr-errores">{" "}<h3><span className="ln">{"3.6"}</span>{"Errores comunes"}</h3>{" "}<div className="callout err"><h5>{"Dibujar líneas exactas"}</h5>{"Los niveles son zonas. Si exiges que el precio toque al pip, verás \"rupturas\" que solo son mechas."}</div>{" "}<div className="callout err"><h5>{"Llenar el gráfico de niveles"}</h5>{"Quédate con los más claros y recientes, y con los de temporalidad mayor."}</div>{" "}<div className="callout err"><h5>{"Anticipar la ruptura de la figura"}</h5>{"Un doble techo no existe hasta que se rompe la línea de cuello. Antes es solo un rango."}</div>{" "}<div className="callout warn"><h5>{"Piensa en la liquidez"}</h5>{"Un doble techo son máximos iguales: encima hay stops (BSL). A menudo el precio barre ese nivel antes de caer… o lo rompe de verdad."}</div>{" "}<div className="rd-sentinel" data-l="sr-errores" /></article>
      <div id="sr-quiz" />
    </>
  );
}
