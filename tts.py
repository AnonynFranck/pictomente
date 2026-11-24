"""
Módulo de texto a voz (TTS) usando gTTS + pygame.mixer.
Genera el audio online y lo reproduce sin bloquear el hilo principal.
"""

import io
import threading

import pygame

try:
    from gtts import gTTS
    _GTTS_AVAILABLE = True
except ImportError:
    _GTTS_AVAILABLE = False


def _speak_thread(text: str):
    """Genera y reproduce el audio en un hilo separado para no bloquear la UI."""
    if not _GTTS_AVAILABLE:
        return
    try:
        tts = gTTS(text=text, lang="es", slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)

        pygame.mixer.init()
        sound = pygame.mixer.Sound(buf)
        sound.play()
    except Exception:
        pass  # Sin conexión o error: silencio, nunca crashea


def speak(text: str):
    """Narra el texto en español de forma asíncrona (no bloquea)."""
    t = threading.Thread(target=_speak_thread, args=(text,), daemon=True)
    t.start()


# Frases predefinidas del juego
PHRASES = {
    "start":    "¡Hola! Selecciona una imagen para decirme cómo te sientes.",
    "round_0":  "¿Qué área describe mejor lo que quieres expresar?",
    "round_n":  "Selecciona los pictogramas que se acercan a lo que sientes o necesitas.",
    "confirm":  "¡Muy bien!",
    "skip":     "De acuerdo, pasamos a la siguiente.",
    "result":   "Listo. Aquí está el resultado.",
}
