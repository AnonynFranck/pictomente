/**
 * Todas las frases que Pico puede decir en voz alta. Cada una tiene un audio
 * pregrabado (web/public/audio) para que la voz suene igual en cualquier navegador.
 * Si se agrega o cambia una frase, hay que regenerar los audios (ver README).
 */
import { CATALOG } from './catalog'
import { PHRASES, ROUND_PROMPTS, guessQuestion } from './phrases'

export function allVoiceLines(): string[] {
  const lines = [
    ...Object.values(PHRASES),
    ...ROUND_PROMPTS,
    // "¡Uy! Probemos otra vez." + indicación de la ronda que sigue
    ...ROUND_PROMPTS.map((prompt) => `${PHRASES.rejected} ${prompt}`),
    ...CATALOG.map((c) => c.cheer),
    ...CATALOG.flatMap((c) => c.leaves.flatMap((l) => [l.label, guessQuestion(l.id)])),
  ]
  return [...new Set(lines)]
}
