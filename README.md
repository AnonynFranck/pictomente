# Pictomente · Kallpa-Play AI

Juego de comunicación con pictogramas (ARASAAC) para niños, guiado por una mascota (**Pico**) y un
agente inteligente que deduce lo que el niño quiere decir a partir de sus elecciones.

Hay dos versiones con la misma lógica:

| Carpeta | Qué es | Cómo se ejecuta |
|---|---|---|
| [`web/`](web) | Versión web infantil (Vue 3 + Vite + TypeScript), la que se despliega | `cd web && pnpm install && pnpm dev` |
| raíz (`main.py`, `inference.py`, `arasaac.py`, `tts.py`) | Demo de escritorio original (Python 3.14 + pygame-ce) | `uv sync && uv run main.py` |

## Versión web

```bash
cd web
pnpm install
pnpm dev            # http://localhost:5173
pnpm test           # tests (Vitest), incluye una simulación de 300 sesiones
pnpm test:coverage  # con cobertura
pnpm build          # typecheck + build en web/dist
```

Requiere Node 22+ y [pnpm](https://pnpm.io).

**Cómo se juega:** Pico propone dibujos; el niño toca los que se parecen a lo que quiere y pulsa
*¡Listo!* (o *Otros*). Tras 2–4 rondas Pico pregunta *«¿Querías decir …?»*. Con *¡Sí!* celebra y deja
un mensaje breve para el adulto; con *No* descarta esa opción y sigue, y tras 2 rechazos pide ayuda a un adulto.
Pico habla con audios pregrabados de voz neuronal (`web/public/audio`); el sonido se apaga con el botón del altavoz.
La pantalla nunca hace scroll: las tarjetas se adaptan al tamaño del dispositivo (celular, tablet, laptop, TV).

**Catálogo:** 6 categorías y 69 intenciones (comida, actividades, emociones, lugares, personas y juguetes),
definidas en [`web/src/data/catalog.ts`](web/src/data/catalog.ts). Los IDs de ARASAAC están fijados en
`web/src/data/pictogram-ids.json`.

**Motor** ([`web/src/lib/engine.ts`](web/src/lib/engine.ts)): sistema experto probabilístico. Mantiene una
distribución sobre las intenciones, la actualiza con cada elección ponderando por el peso semántico del grafo
y elige los siguientes pictogramas por ganancia de información (entropía de Shannon) dentro de la categoría
dominante. [`web/src/lib/simulate.ts`](web/src/lib/simulate.ts) simula niños para medir tasa de éxito y rondas.

### Voz de Pico

Hay un audio `.mp3` por cada frase que Pico puede decir (156 en total, voz `es-MX-DaliaNeural`).
Si se agrega o cambia una frase hay que regenerarlos (el test `voice-lines` avisa si falta alguno):

```bash
cd web && pnpm -s voices:lines > /tmp/lines.json && cd ..
uv run --no-project --with edge-tts python tools/generate_voices.py /tmp/lines.json
```

Usa `edge-tts`, que accede de forma no oficial al servicio de lectura de Microsoft Edge: apto para un
proyecto académico. Si un audio falta o el navegador lo bloquea, Pico usa la voz del propio navegador.

### Despliegue en Vercel

1. Importar el repositorio en [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** `web` (Vite se detecta solo; build `pnpm build`, salida `dist`).
3. **Settings → Environments → Production → Branch Tracking:** `deployUI`.

## Créditos

Pictogramas: [ARASAAC](https://arasaac.org) (Gobierno de Aragón), autor Sergio Palao — licencia CC BY-NC-SA.
