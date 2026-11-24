/**
 * Motor de inferencia de Pictomente (port de inference.py, rama develop).
 *
 * Sistema experto probabilístico:
 *  - Mantiene una distribución de probabilidad sobre las intenciones hoja.
 *  - Cada elección del niño la actualiza (Bayes ingenuo) con factores modulados
 *    por el peso semántico de cada intención en el grafo.
 *  - Elige los siguientes pictogramas por ganancia de información esperada
 *    (reducción de entropía de Shannon), dentro de la categoría dominante.
 *  - Si el niño rechaza la conjetura, la descarta y pide más rondas.
 *
 * Todas las funciones son puras: devuelven un estado nuevo, nunca mutan el anterior.
 */
import { INTENTION_MESSAGES, LEAF_NODES, ROOT_CATEGORIES, SEMANTIC_GRAPH } from '../data/graph'

export const CONFIDENCE_THRESHOLD = 0.65
export const MIN_ROUNDS = 2
export const MAX_ROUNDS = 4
export const EXTRA_ROUNDS_AFTER_REJECTION = 2
export const MAX_REJECTIONS = 2
export const CARDS_PER_ROUND = 6

const DOMINANT_FOR_SELECTION = 0.4
const DOMINANT_FOR_WEIGHTS = 0.35
const DEFAULT_WEIGHT = 0.5

export type Probs = Readonly<Record<string, number>>

export interface EngineState {
  readonly probs: Probs
  /** Historial de elecciones [pictograma, seleccionado]. */
  readonly history: ReadonlyArray<readonly [string, boolean]>
  /** Todo pictograma ya mostrado (incluye rondas saltadas, que no tocan las probabilidades). */
  readonly shown: ReadonlyArray<string>
  /** Ronda actual (0-indexada). */
  readonly roundNum: number
  /** Ronda a partir de la cual se fuerza una conjetura. */
  readonly roundLimit: number
  /** Conjeturas que el niño ha rechazado. */
  readonly rejections: number
}

export function createEngine(): EngineState {
  const p = 1 / LEAF_NODES.length
  return {
    probs: Object.fromEntries(LEAF_NODES.map((leaf) => [leaf, p])),
    history: [],
    shown: [],
    roundNum: 0,
    roundLimit: MAX_ROUNDS,
    rejections: 0,
  }
}

// ---------------------------------------------------------------------------
// Grafo y pesos
// ---------------------------------------------------------------------------

/** Hojas relacionadas con un pictograma: él mismo si es hoja, o todas las de su categoría. */
function relatedLeaves(key: string): ReadonlySet<string> {
  if (LEAF_NODES.includes(key)) return new Set([key])
  return new Set(Object.keys(SEMANTIC_GRAPH[key] ?? {}).filter((k) => LEAF_NODES.includes(k)))
}

/** Categoría que concentra al menos `threshold` de la probabilidad, si la hay. */
export function getDominantCategory(probs: Probs, threshold = DOMINANT_FOR_SELECTION): string | null {
  return (
    ROOT_CATEGORIES.find((cat) => {
      const mass = Object.keys(SEMANTIC_GRAPH[cat] ?? {}).reduce((acc, leaf) => acc + (probs[leaf] ?? 0), 0)
      return mass >= threshold
    }) ?? null
  )
}

function semanticWeight(leaf: string, category: string | null): number {
  if (category) return SEMANTIC_GRAPH[category]?.[leaf] ?? DEFAULT_WEIGHT
  const owner = ROOT_CATEGORIES.find((cat) => leaf in (SEMANTIC_GRAPH[cat] ?? {}))
  return owner ? (SEMANTIC_GRAPH[owner]?.[leaf] ?? DEFAULT_WEIGHT) : DEFAULT_WEIGHT
}

function normalise(raw: ReadonlyArray<readonly [string, number]>, fallback: Probs): Probs {
  const total = raw.reduce((acc, [, v]) => acc + v, 0)
  return total > 0 ? Object.fromEntries(raw.map(([k, v]) => [k, v / total])) : fallback
}

/** Actualización bayesiana de una elección: sube/baja las hojas relacionadas. */
function reweight(probs: Probs, key: string, selected: boolean): Probs {
  const related = relatedLeaves(key)
  const dominant = getDominantCategory(probs, DOMINANT_FOR_WEIGHTS)
  const raw = Object.entries(probs).map(([leaf, p]) => {
    if (related.has(leaf)) {
      return [leaf, p * (selected ? 2 + semanticWeight(leaf, dominant) * 2 : 0.3)] as const
    }
    return [leaf, p * (selected ? 0.5 : 1.2)] as const
  })
  return normalise(raw, probs)
}

// ---------------------------------------------------------------------------
// Ganancia de información (entropía)
// ---------------------------------------------------------------------------

function entropy(probs: Probs): number {
  return -Object.values(probs).reduce((acc, p) => (p > 0 ? acc + p * Math.log2(p) : acc), 0)
}

/** Probabilidad de que el niño elija este pictograma = masa de las hojas que cubre. */
function relevance(probs: Probs, key: string): number {
  return [...relatedLeaves(key)].reduce((acc, leaf) => acc + (probs[leaf] ?? 0), 0)
}

function expectedInfoGain(probs: Probs, key: string): number {
  const pSelect = relevance(probs, key)
  const expected =
    pSelect * entropy(reweight(probs, key, true)) + (1 - pSelect) * entropy(reweight(probs, key, false))
  return Math.max(0, entropy(probs) - expected)
}

function rankByGain(probs: Probs, leaves: ReadonlyArray<string>): string[] {
  return leaves
    .map((leaf) => [leaf, expectedInfoGain(probs, leaf)] as const)
    .sort((a, b) => b[1] - a[1])
    .map(([leaf]) => leaf)
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Ronda 0: las categorías raíz. Después: las hojas de mayor ganancia de información,
 * priorizando la categoría dominante y completando con otras si se agota.
 */
export function getPictogramsForRound(state: EngineState, n: number = CARDS_PER_ROUND): string[] {
  if (state.roundNum === 0) return [...ROOT_CATEGORIES]

  const shown = new Set(state.shown)
  const unseen = LEAF_NODES.filter((leaf) => !shown.has(leaf))
  const dominant = getDominantCategory(state.probs)
  const preferred = dominant ? unseen.filter((leaf) => leaf in (SEMANTIC_GRAPH[dominant] ?? {})) : unseen
  const rest = unseen.filter((leaf) => !preferred.includes(leaf))

  return [...rankByGain(state.probs, preferred), ...rankByGain(state.probs, rest)].slice(0, n)
}

/** Registra la elección del niño y actualiza las probabilidades. */
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

/** El niño dijo "no" a la conjetura: se descarta y se conceden más rondas. */
export function rejectGuess(state: EngineState, key: string): EngineState {
  const raw = Object.entries(state.probs).map(([leaf, p]) => [leaf, leaf === key ? 0 : p] as const)
  return {
    ...state,
    probs: normalise(raw, state.probs),
    shown: state.shown.includes(key) ? state.shown : [...state.shown, key],
    rejections: state.rejections + 1,
    roundLimit: state.roundNum + EXTRA_ROUNDS_AFTER_REJECTION,
  }
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
  return state.roundNum >= MIN_ROUNDS && getTopPrediction(state)[1] >= CONFIDENCE_THRESHOLD
}

export function shouldFinish(state: EngineState): boolean {
  if (isConfident(state) || state.roundNum >= state.roundLimit) return true
  return state.roundNum > 0 && getPictogramsForRound(state).length === 0
}

/** Mensaje breve y accionable para el adulto. */
export function getMessage(state: EngineState): string {
  const [best] = getTopPrediction(state)
  return INTENTION_MESSAGES[best] ?? best
}
