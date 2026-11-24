# Pictomente · Kallpa-Play AI

Sistema de comunicación por pictogramas con inferencia adaptativa (estilo Akinator). La persona
elige pictogramas ([ARASAAC](https://arasaac.org)) y un motor bayesiano deduce qué quiere expresar,
generando un mensaje para el terapeuta.

Hay dos versiones con la misma lógica:

| Carpeta | Qué es | Cómo se ejecuta |
|---|---|---|
| [`web/`](web) | Versión web (Vue 3 + Vite + TypeScript), publicada en GitHub Pages | `cd web && pnpm install && pnpm dev` |
| raíz (`main.py`, `inference.py`, `arasaac.py`) | Demo original de escritorio (Python 3.14 + pygame-ce) | `uv sync && uv run main.py` |

## Versión web

```bash
cd web
pnpm install
pnpm dev            # servidor local en http://localhost:5173
pnpm test           # tests (Vitest)
pnpm test:coverage  # con cobertura
pnpm build          # genera web/dist (typecheck + build)
```

Requiere Node 22+ y [pnpm](https://pnpm.io).

### Publicación (GitHub Pages)

El workflow [`deploy-web.yml`](.github/workflows/deploy-web.yml) ejecuta los tests, compila y publica
`web/dist` en cada push a `main` que toque `web/`.

Activación única: en el repositorio, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
La URL queda en `https://<usuario>.github.io/<repo>/`.
