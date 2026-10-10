# Laboratorio de Trading

Laboratorio interactivo de **price action**, **indicadores técnicos** y **Smart Money**: 23 módulos navegables por pestañas más un glosario, con un simulador de trading vela a vela y un examen final.

Sitio estático autocontenido (HTML + CSS + JS inline, sin dependencias externas ni build).

**En vivo:** https://molearg.github.io/laboratorio-trading/

## Módulos

| Grupo | Módulos |
|---|---|
| Fundamentos | `mercados` · `velas` · `patrones` · `sr` · `estructura` · `trendlines` · `fibo` · `sesiones` · `volumen` |
| Indicadores | `emas` · `rsi` · `estocastico` · `momentum` · `volat` |
| Smart Money / ICT | `liquidez` · `smc` · `crt` · `smt` |
| Gestión y riesgo | `ordenes` · `riesgo` |
| Práctica | `todo` · `replay` · `examen` · `glosario` |

Cada módulo se abre directo por hash: `…/#mercados`, `…/#fibo`, `…/#replay`, `…/#examen`, etc. También funcionan los anclajes de cada lección (`…/#fb-lab`, `…/#rp-sim`).

## Funciones

- **Simulador (`#replay`)**: mercado generado con tendencias, rangos y cambios de volatilidad que se revela vela a vela. Compra y venta con stop en ATR y objetivo en R, spread, deslizamiento, stop a la entrada, diario con MFE/MAE, análisis de la sesión, exportación a CSV e historial de sesiones. Atajos: `→` vela, `Espacio` reproducir, `B` comprar, `S` vender, `X` cerrar, `E` stop a entrada.
- **Fibonacci (`#fibo`)**: retrocesos y extensiones con puntos arrastrables (imantados a las mechas), futuro oculto y calculadora de R:B por objetivo.
- **Examen final (`#examen`)**: preguntas al azar de todos los quizzes, con las opciones mezcladas, el resultado por módulo y la opción de repetir solo las falladas.
- **Progreso**: módulos vistos, quizzes aprobados (≥ 80%) y mejor nota del examen, guardados en `localStorage` y marcados en las pestañas.
- **Buscador**: `Ctrl K` o `/` busca módulos, lecciones y términos del glosario.

## Publicación

Archivo único `index.html` en la rama `main`. GitHub Pages sirve el sitio desde *Deploy from a branch* → `main` / `/ (root)`, con `.nojekyll` para saltear el build de Jekyll. Cada push a `main` re-deploya automáticamente.
