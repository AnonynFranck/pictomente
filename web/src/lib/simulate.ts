/**
 * Simulación de sesiones (port de tools/simulate.py).
 * Un "niño simulado" tiene una intención objetivo, elige con alta probabilidad lo
 * relacionado con ella y confirma o rechaza las conjeturas del agente.
 * Sirve para medir la tasa de éxito y el promedio de rondas del motor.
 */
import { LEAF_NODES, categoryOf } from '../data/graph'
import {
  MAX_REJECTIONS,
  advanceRound,
  applySelection,
  createEngine,
  getPictogramsForRound,
  getTopPrediction,
  rejectGuess,
  shouldFinish,
} from './engine'

export type Rng = () => number

const P_SELECT_RELATED = 0.85
const P_SELECT_UNRELATED = 0.05
const MAX_STEPS = 30

/** PRNG determinista (mulberry32) para simulaciones reproducibles. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SessionResult {
  readonly target: string
  readonly success: boolean
  /** ¿Acertó a la primera, sin que el niño tuviera que rechazar nada? */
  readonly firstGuess: boolean
  readonly rounds: number
  readonly rejections: number
}

export function simulateSession(target: string, rng: Rng): SessionResult {
  const targetCategory = categoryOf(target)
  let state = createEngine()

  for (let step = 0; step < MAX_STEPS; step++) {
    state = getPictogramsForRound(state).reduce((acc, picto) => {
      const related = picto === target || picto === targetCategory
      return applySelection(acc, picto, rng() < (related ? P_SELECT_RELATED : P_SELECT_UNRELATED))
    }, state)
    state = advanceRound(state)

    if (!shouldFinish(state)) continue
    const [guess] = getTopPrediction(state)
    if (guess === target) {
      return { target, success: true, firstGuess: state.rejections === 0, rounds: state.roundNum, rejections: state.rejections }
    }
    if (state.rejections >= MAX_REJECTIONS) break
    state = rejectGuess(state, guess)
  }
  return { target, success: false, firstGuess: false, rounds: state.roundNum, rejections: state.rejections }
}

export interface SimulationReport {
  readonly sessions: number
  /** Fracción de sesiones que terminan con la intención correcta. */
  readonly successRate: number
  /** Fracción en la que la primera conjetura ya era correcta. */
  readonly firstGuessRate: number
  readonly avgRounds: number
  readonly byCategory: Readonly<Record<string, { successRate: number; avgRounds: number; sessions: number }>>
}

export function runSimulation(sessions: number, rng: Rng): SimulationReport {
  const results = Array.from({ length: sessions }, () =>
    simulateSession(LEAF_NODES[Math.floor(rng() * LEAF_NODES.length)] as string, rng),
  )
  const mean = (xs: ReadonlyArray<number>) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  const groups = results.reduce<Record<string, SessionResult[]>>((acc, r) => {
    const cat = categoryOf(r.target) ?? 'desconocido'
    return { ...acc, [cat]: [...(acc[cat] ?? []), r] }
  }, {})

  return {
    sessions,
    successRate: mean(results.map((r) => Number(r.success))),
    firstGuessRate: mean(results.map((r) => Number(r.firstGuess))),
    avgRounds: mean(results.map((r) => r.rounds)),
    byCategory: Object.fromEntries(
      Object.entries(groups).map(([cat, rs]) => [
        cat,
        { successRate: mean(rs.map((r) => Number(r.success))), avgRounds: mean(rs.map((r) => r.rounds)), sessions: rs.length },
      ]),
    ),
  }
}
