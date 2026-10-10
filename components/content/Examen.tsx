// Contenido del módulo «Examen final». Generado por scripts/port-legacy.mjs a partir de legacy/index.html.
// @ts-nocheck

export default function Examen() {
  return (
    <>
      <article className="lesson" id="ex-config">{" "}<h3>{"Configura el examen"}</h3>{" "}<div className="controls">{" "}<div className="grp"><span className="lbl">{"Preguntas"}</span><div className="seg" data-key="exn"><button data-v="10">{"10"}</button><button className="on" data-v="20">{"20"}</button><button data-v="40">{"40"}</button><button data-v="999">{"Todas"}</button></div></div>{" "}<div className="grp" id="ex-groups" />{" "}<label className="grp"><input type="checkbox" id="ex-timer" />{" ⏱ Contra reloj (20 s por pregunta)"}</label>{" "}<button className="btn primary" id="ex-start">{"Empezar examen"}</button>{" "}</div>{" "}<div className="readout" id="ex-best" />{" "}</article>
      <article className="lesson" id="ex-run" hidden>{" "}<div className="ex-top"><span id="ex-count" className="mono" /><span id="ex-mod" className="ex-tag" /><span id="ex-combo" className="ex-combo" /><span id="ex-score" className="mono" /></div>{" "}<div className="meter"><div id="ex-meter" /></div>{" "}<div className="ex-timer" id="ex-tbar" hidden><div /></div>{" "}<div className="q" id="ex-q" style={{"borderTop":"0"}} />{" "}<div className="controls" style={{"justifyContent":"flex-end"}}><button className="btn" id="ex-quit">{"Abandonar"}</button><button className="btn primary" id="ex-next" disabled>{"Siguiente ▶"}</button></div>{" "}</article>
      <article className="lesson" id="ex-res" hidden>{" "}<h3>{"Resultado"}</h3>{" "}<div className="readout" id="ex-res-stats" />{" "}<div className="explain" id="ex-res-explain" />{" "}<div id="ex-res-table" style={{"overflowX":"auto","marginTop":"12px"}} />{" "}<div className="controls" style={{"marginTop":"12px"}}><button className="btn primary" id="ex-again">{"Otro examen"}</button><button className="btn" id="ex-wrong">{"Repetir solo las falladas"}</button></div>{" "}</article>
    </>
  );
}
