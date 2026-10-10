# Laboratorio de Trading

Academia interactiva de **price action**, **indicadores técnicos** y **Smart Money**: 24 módulos más un glosario, con portada de cursos, repaso rápido con tarjetas, un simulador de trading vela a vela y un examen final. Tema claro y oscuro.

Hecho con **Next.js 16** (App Router) y exportado como sitio estático.

**En vivo:** https://molearg.github.io/laboratorio-trading/

## Desarrollo

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # genera out/ (sitio estático)
pnpm preview      # sirve out/
pnpm typecheck
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Portada: continuar, métricas, cursos, camino de módulos |
| `/<modulo>/` | Un módulo (`/velas/`, `/fibo/`, `/rsi/`, `/smc/`, `/riesgo/`…) |
| `/<modulo>/#<leccion>` | Una lección (`/fibo/#fb-lab`, `/smc/#smc-ote`) |
| `/repaso/`, `/replay/`, `/examen/` | Repaso rápido, simulador y examen |
| `/glosario/?q=termino` | Glosario filtrado |

Los enlaces del sitio anterior (`…/#velas`, `…/#smc-ote`) se redirigen solos a la ruta nueva.

| Grupo | Módulos |
|---|---|
| Fundamentos | `mercados` · `velas` · `patrones` · `sr` · `estructura` · `trendlines` · `fibo` · `sesiones` · `volumen` |
| Indicadores | `emas` · `rsi` · `estocastico` · `momentum` · `volat` |
| Smart Money / ICT | `liquidez` · `smc` · `crt` · `smt` |
| Gestión y riesgo | `ordenes` · `riesgo` |
| Práctica | `todo` · `repaso` · `replay` · `examen` · `glosario` |

## Estructura

```
app/
  layout.tsx            Layout raíz: tema antes del primer pintado + <Shell>
  page.tsx              Portada
  [mod]/page.tsx        Página de cada módulo (generateStaticParams + metadata)
  globals.css           Estilos (heredados del sitio de un solo archivo)
  next.css              Ajustes del shell en React
components/
  Shell.tsx             Armazón: barra lateral, barra superior, ficha, dock, buscador, atajos y enlaces "#…"
  Sidebar.tsx · Chrome.tsx · Palette.tsx · SessionChip.tsx · HomePage.tsx
  ModuleHead.tsx        Cabecera del módulo, pestañas con scroll-spy y lecciones leídas
  LabMount.tsx          Carga el motor interactivo en el navegador y lo limpia al salir
  content/*.tsx         Contenido de cada módulo (JSX generado)
lib/
  site.ts               Módulos, grupos y cálculo de progreso
  progress.ts           Progreso en localStorage (useSyncExternalStore)
  ui.ts                 Lección visible, tema y velas huecas
  time.js               Sesiones de mercado y zonas horarias
  lab/                  Motor de gráficos e interacciones (módulos ES, uno por módulo)
  generated/manifest.json  Orden, lecciones, anclas y metadatos de cada módulo
data/
  quizzes.json · glossary.json
legacy/index.html       Versión anterior de un solo archivo (fuente del port)
scripts/port-legacy.mjs Conversor usado para el port
```

### Cómo funciona el motor interactivo

Los gráficos son SVG dibujados por el motor de `lib/lab/` (sin librerías de gráficos). Cada página de módulo se renderiza como HTML estático y, al montarse, `LabMount` importa el motor solo en el navegador y llama a `mount(modulo)`. Esa función inicializa los gráficos y controles, y devuelve una limpieza que quita los listeners globales, detiene intervalos y animaciones (simulador, examen contra reloj, reproducciones). El progreso se comparte entre React y el motor a través de `lib/progress.ts`.

### Sobre los archivos generados

`components/content/*`, `lib/lab/*` (salvo `index.js` y `shared.js`), `lib/time.js`, `lib/generated/manifest.json` y `data/*.json` salieron de `scripts/port-legacy.mjs` a partir de `legacy/index.html`. Desde el port se editan a mano: si se vuelve a ejecutar el conversor, sobrescribe esos archivos.

## Publicación

El workflow `.github/workflows/pages.yml` construye el sitio con `NEXT_PUBLIC_BASE_PATH=/laboratorio-trading` y lo publica en GitHub Pages en cada push a `main`. Requiere que en **Settings → Pages** la fuente sea **GitHub Actions** (antes era *Deploy from a branch*).
