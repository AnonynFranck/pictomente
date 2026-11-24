/** Frases del guía Pico. Cortas, cálidas y en lenguaje de niños. */
import { getCheer, getLabel } from './graph'

export const PHRASES = {
  start: '¡Hola! Soy Pico. Toca los dibujos y yo adivino lo que quieres decir. ¿Jugamos?',
  rejected: '¡Uy! Probemos otra vez.',
  accepted: '¡Lo logramos! Le aviso a tu profe.',
  unresolved: '¡Gracias por jugar! Un adulto te va a ayudar.',
} as const

export const ROUND_PROMPTS = [
  '¿De qué quieres hablar hoy? ¡Toca un dibujo!',
  'Toca los dibujos que se parezcan a lo que quieres.',
  '¡Casi lo tengo! Toca otra vez lo que se parezca.',
  'Una más y lo descubro. ¡Tú puedes!',
] as const

/** Indicación del guía para la ronda (0-indexada). */
export function roundPrompt(roundNum: number): string {
  return ROUND_PROMPTS[Math.min(roundNum, ROUND_PROMPTS.length - 1)] as string
}

/** Reacción al elegir un dibujo. */
export function pickReaction(key: string): string {
  return getCheer(key) ?? getLabel(key)
}

export function guessQuestion(key: string): string {
  return `¿Querías decir ${getLabel(key)}?`
}
