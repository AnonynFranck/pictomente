"""
tools/generate_voices.py
Genera los audios de la voz de Pico (web/public/audio/*.mp3) con voces neuronales
de Microsoft vía `edge-tts`, y el manifiesto web/src/data/voice-manifest.json.

Uso (desde la raíz del repositorio):
    cd web && pnpm voices:lines > /tmp/lines.json && cd ..
    uv run --no-project --with edge-tts python tools/generate_voices.py /tmp/lines.json
    uv run --no-project --with edge-tts python tools/generate_voices.py /tmp/lines.json --force   # regenerar todo

Es idempotente: solo genera lo que falta. `edge-tts` usa el servicio de lectura de Edge de forma
no oficial: es adecuado para un proyecto académico, no para producción.
"""

import argparse
import asyncio
import hashlib
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "web" / "public" / "audio"
MANIFEST = ROOT / "web" / "src" / "data" / "voice-manifest.json"

VOICE = "es-MX-DaliaNeural"
RATE = "-4%"      # un poco más pausada para niños
PITCH = "+6Hz"    # un poco más aguda y amable
CONCURRENCY = 4
RETRIES = 3


def filename_for(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12] + ".mp3"


async def synthesize(text: str, path: Path, gate: asyncio.Semaphore) -> None:
    async with gate:
        for attempt in range(1, RETRIES + 1):
            try:
                await edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH).save(str(path))
                return
            except Exception as error:  # red o servicio: reintentar
                if attempt == RETRIES:
                    raise RuntimeError(f"No se pudo generar {text!r}: {error}") from error
                await asyncio.sleep(attempt)


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("lines_json", help="JSON con la lista de frases (pnpm voices:lines)")
    parser.add_argument("--force", action="store_true", help="regenerar aunque el audio ya exista")
    args = parser.parse_args()

    lines: list[str] = json.loads(Path(args.lines_json).read_text(encoding="utf-8"))
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {text: filename_for(text) for text in lines}
    pending = [
        (text, AUDIO_DIR / name)
        for text, name in manifest.items()
        if args.force or not (AUDIO_DIR / name).exists()
    ]
    print(f"{len(lines)} frases, {len(pending)} por generar con {VOICE}")

    gate = asyncio.Semaphore(CONCURRENCY)
    await asyncio.gather(*(synthesize(text, path, gate) for text, path in pending))

    # borra audios que ya no corresponden a ninguna frase
    keep = set(manifest.values())
    for stale in AUDIO_DIR.glob("*.mp3"):
        if stale.name not in keep:
            stale.unlink()

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total_kb = sum(p.stat().st_size for p in AUDIO_DIR.glob("*.mp3")) / 1024
    print(f"Listo: {len(manifest)} audios, {total_kb:.0f} KB en total")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
