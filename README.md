# Laboratorio de Trading

Laboratorio interactivo de **price action**, **indicadores técnicos** y **Smart Money**: 21 módulos navegables por pestañas.

Sitio estático autocontenido (HTML + CSS + JS inline, sin dependencias externas ni build).

**En vivo:** https://molearg.github.io/laboratorio-trading/

## Módulos

| Grupo | Módulos |
|---|---|
| Mercados y estructura | `mercados` · `velas` · `patrones` · `sr` · `estructura` · `trendlines` |
| Sesiones y volumen | `sesiones` · `volumen` |
| Indicadores | `emas` · `rsi` · `estocastico` · `momentum` · `volat` |
| Liquidez y Smart Money | `liquidez` · `smc` · `crt` · `smt` · `ordenes` |
| Gestión y utilidades | `riesgo` · `todo` · `glosario` |

Cada módulo se abre directo por hash: `…/#mercados`, `…/#velas`, `…/#rsi`, `…/#smc`, `…/#riesgo`, etc.

## Publicación

Archivo único `index.html` en la rama `main`. GitHub Pages sirve el sitio desde *Deploy from a branch* → `main` / `/ (root)`, con `.nojekyll` para saltear el build de Jekyll. Cada push a `main` re-deploya automáticamente.
