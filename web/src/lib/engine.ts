/**
 * Motor de inferencia estilo Akinator (port de inference.py).
 * - Mantiene una distribución de probabilidad sobre las intenciones hoja.
 * - Cada elección del usuario la actualiza con un modelo bayesiano simple.
 * - Elige los siguientes pictogramas por ganancia de información esperada.
 *
 * Todas las funciones son puras: devuelven un estado nuevo, nunca mutan el anterior.
 */
import { INTENTION_MESSAGES, LEAF_NODES, ROOT_CATEGORIES, SEMANTIC_GRAPH } from '../data/graph'

export const CONFIDENCE_THRESHOLD = 0.55
export const MAX_ROUNDS = 4
export const CARDS_PER_ROUND = 6
const SECOND_OPTION_MIN = 0.2

const FACTORS = {
  selected: { related: 3.5, other: 0.4 },
  skipped: { related: 0.3, other: 1.8 },
} as const

export type Probs = Readonly<Record<string, number>>

export interface EngineState {
  readonly probs: Probs
  /** Historial de elecciones [pictograma, seleccionado]. */
  readonly history: ReadonlyArray<readonly [string, boolean]>
  /** Todo pictograma ya mostrado (incluye rondas saltadas, que no tocan las probabilidades). */
  readonly shown: ReadonlyArray<string>
  /** Ronda actual (0-indexada). */
  readonly roundNum: number
}

export interface TherapistMessage {
  readonly main: string
  readonly alternative: string | null
  /** Porcentaje entero 0-100. */
  readonly confidence: number
}

export function createEngine(): EngineState {
  const p = 1 / LEAF_NODES.length
  return {
    probs: Object.fromEntries(LEAF_NODES.map((leaf) => [leaf, p])),
    history: [],
    shown: [],
    roundNum: 0,
  }
}

/** Hojas relacionadas con un pictograma: él mismo si es hoja, o todas las de su categoría. */
function relatedLeaves(key: string): ReadonlySet<string> {
  if (LEAF_NODES.includes(key)) return new Set([key])
  return new Set(Object.keys(SEMANTIC_GRAPH[key] ?? {}).filter((k) => LEAF_NODES.includes(k)))
}

function reweight(probs: Probs, key: string, selected: boolean): Probs {
  const related = relatedLeaves(key)
  const f = selected ? FACTORS.selected : FACTORS.skipped
  const raw = Object.entries(probs).map(([leaf, p]) => [leaf, p * (related.has(leaf) ? f.related : f.other)] as const)
  const total = raw.reduce((acc, [, v]) => acc + v, 0)
  return total > 0 ? Object.fromEntries(raw.map(([k, v]) => [k, v / total])) : probs
}

function entropy(probs: Probs): number {
  return -Object.values(probs).reduce((acc, p) => (p > 0 ? acc + p * Math.log2(p) : acc), 0)
}

/** Probabilidad de que el usuario elija este pictograma = masa de las hojas que cubre. */
function relevance(probs: Probs, key: string): number {
  return [...relatedLeaves(key)].reduce((acc, leaf) => acc + (probs[leaf] ?? 0), 0)
}

function expectedInfoGain(probs: Probs, key: string): number {
  const pSelect = relevance(probs, key)
  const expected =
    pSelect * entropy(reweight(probs, key, true)) + (1 - pSelect) * entropy(reweight(probs, key, false))
  return Math.max(0, entropy(probs) - expected)
}

/** Ronda 0: las categorías raíz. Después: las hojas con mayor ganancia de información. */
export function getPictogramsForRound(state: EngineState, n: number = CARDS_PER_ROUND): string[] {
  if (state.roundNum === 0) return [...ROOT_CATEGORIES]
  const shown = new Set(state.shown)
  return LEAF_NODES.filter((leaf) => !shown.has(leaf))
    .map((leaf) => [leaf, expectedInfoGain(state.probs, leaf)] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([leaf]) => leaf)
}

/** Registra la elección del usuario y actualiza las probabilidades. */
export function applySelection(state: EngineState, key: string, selected: boolean): EngineState {
  return {
    ...state,
    probs: reweight(state.probs, key, selected),
    history: [...state.history, [key, selected] as const],
    shown: state.shown.includes(key) ? state.shown : [...state.shown, key],
  }
}

/** Marca pictogramas como vistos sin tocar las probabilidades (ronda saltada). */
export function markShown(state: EngineState, keys: ReadonlyArray<string>): EngineState {
  return { ...state, shown: [...new Set([...state.shown, ...keys])] }
}

export function advanceRound(state: EngineState): EngineState {
  return { ...state, roundNum: state.roundNum + 1 }
}

export function getTopN(state: EngineState, n = 3): Array<[string, number]> {
  return Object.entries(state.probs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

export function getTopPrediction(state: EngineState): [string, number] {
  return getTopN(state, 1)[0] as [string, number]
}

export function isConfident(state: EngineState): boolean {
  return getTopPrediction(state)[1] >= CONFIDENCE_THRESHOLD
}

export function shouldFinish(state: EngineState): boolean {
  return isConfident(state) || state.roundNum >= MAX_ROUNDS
}

export function getMessage(state: EngineState): TherapistMessage {
  const [first, second] = getTopN(state, 2) as [[string, number], [string, number]]
  const [bestKey, bestProb] = first
  const [secondKey, secondProb] = second
  return {
    main: INTENTION_MESSAGES[bestKey] ?? `El usuario quiere expresar: ${bestKey}.`,
    alternative: secondProb > SECOND_OPTION_MIN ? (INTENTION_MESSAGES[secondKey] ?? secondKey) : null,
    confidence: Math.floor(bestProb * 100),
  }
}
