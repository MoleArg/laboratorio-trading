# Laboratorio de Trading

Academia interactiva de **price action**, **indicadores técnicos** y **Smart Money**: 24 módulos más un glosario, con portada de cursos, repaso rápido con tarjetas, un simulador de trading vela a vela y un examen final. Tema claro y oscuro.

Sitio estático autocontenido (HTML + CSS + JS inline, sin dependencias externas ni build).

**En vivo:** https://molearg.github.io/laboratorio-trading/

## Módulos

| Grupo | Módulos |
|---|---|
| Fundamentos | `mercados` · `velas` · `patrones` · `sr` · `estructura` · `trendlines` · `fibo` · `sesiones` · `volumen` |
| Indicadores | `emas` · `rsi` · `estocastico` · `momentum` · `volat` |
| Smart Money / ICT | `liquidez` · `smc` · `crt` · `smt` |
| Gestión y riesgo | `ordenes` · `riesgo` |
| Práctica | `todo` · `repaso` · `replay` · `examen` · `glosario` |

La portada es `…/#inicio`. Cada módulo se abre directo por hash: `…/#mercados`, `…/#fibo`, `…/#repaso`, `…/#replay`, `…/#examen`, etc. También funcionan los anclajes de cada lección (`…/#fb-lab`, `…/#rp-sim`).

## Funciones

- **Interfaz de academia**: barra lateral con el árbol de cursos y el estado de cada lección, migas, pestañas por lección con scroll-spy, ficha del módulo (nivel, lecciones, lectura, progreso, términos clave), dock inferior con buscador y "siguiente paso", y tema claro/oscuro.
- **Portada (`#inicio`)**: continuar donde lo dejaste, métricas de avance, cursos por grupo con progreso y un camino de módulos.
- **Repaso rápido (`#repaso`)**: 24 tarjetas con mini gráfico y pregunta; mazo del día, mazos por grupo y "mis fallos", estrellas, combos y racha diaria.
- **Sesión en vivo**: chip con la sesión de forex abierta ahora, killzone y cuenta regresiva al próximo cambio.
- **Simulador (`#replay`)**: mercado generado con tendencias, rangos y cambios de volatilidad que se revela vela a vela, con controles de reproducción (⏮ ▶ ⏭, 1x–10x) y futuro sombreado. Vista previa de la orden al pasar por Comprar/Vender; stop y objetivo arrastrables en el gráfico. Compra y venta con stop en ATR y objetivo en R, spread, deslizamiento, stop a la entrada, diario con MFE/MAE, análisis de la sesión, exportación a CSV e historial de sesiones. Atajos: `→` vela, `Espacio` reproducir, `B` comprar, `S` vender, `X` cerrar, `E` stop a entrada.
- **Fibonacci (`#fibo`)**: retrocesos y extensiones con puntos arrastrables (imantados a las mechas), futuro oculto y calculadora de R:B por objetivo.
- **Examen final (`#examen`)**: preguntas al azar de todos los quizzes, con las opciones mezcladas, modo contra reloj (20 s), racha de aciertos, el resultado por módulo y la opción de repetir solo las falladas.
- **Progreso**: lecciones leídas, módulos vistos, quizzes aprobados (≥ 80%), estrellas, racha diaria y mejor nota del examen, guardados en `localStorage`.
- **Buscador**: `Ctrl K` o `/` busca módulos, lecciones y términos del glosario.

## Publicación

Archivo único `index.html` en la rama `main`. GitHub Pages sirve el sitio desde *Deploy from a branch* → `main` / `/ (root)`, con `.nojekyll` para saltear el build de Jekyll. Cada push a `main` re-deploya automáticamente.
