import { describe, expect, it } from 'vitest'
import {
  CONFIDENCE_THRESHOLD,
  EXTRA_ROUNDS_AFTER_REJECTION,
  MAX_ROUNDS,
  MIN_ROUNDS,
  advanceRound,
  applySelection,
  createEngine,
  getDominantCategory,
  getMessage,
  getPictogramsForRound,
  getTopN,
  getTopPrediction,
  isConfident,
  markShown,
  rejectGuess,
  shouldFinish,
  type EngineState,
} from '../src/lib/engine'
import { CATALOG } from '../src/data/catalog'
import { INTENTION_MESSAGES, LEAF_NODES, ROOT_CATEGORIES, SEMANTIC_GRAPH } from '../src/data/graph'

const sum = (probs: Record<string, number>) => Object.values(probs).reduce((a, b) => a + b, 0)
const rounds = (s: EngineState, n: number) => Array.from({ length: n }).reduce<EngineState>((acc) => advanceRound(acc), s)

describe('createEngine', () => {
  it('starts with a uniform distribution over every leaf intention', () => {
    const s = createEngine()
    expect(Object.keys(s.probs)).toHaveLength(LEAF_NODES.length)
    expect(sum(s.probs)).toBeCloseTo(1)
    expect(new Set(Object.values(s.probs)).size).toBe(1)
    expect(s.roundNum).toBe(0)
    expect(s.rejections).toBe(0)
    expect(s.roundLimit).toBe(MAX_ROUNDS)
  })
})

describe('getPictogramsForRound', () => {
  it('returns every root category in round 0', () => {
    expect(getPictogramsForRound(createEngine())).toEqual(ROOT_CATEGORIES)
  })

  it('only offers leaves of the dominant category once one stands out', () => {
    let s = createEngine()
    s = applySelection(s, 'emociones', true)
    for (const other of ROOT_CATEGORIES.filter((c) => c !== 'emociones')) s = applySelection(s, other, false)
    s = advanceRound(s)
    expect(getDominantCategory(s.probs)).toBe('emociones')
    const pictos = getPictogramsForRound(s, 6)
    expect(pictos).toHaveLength(6)
    expect(pictos.every((p) => p in SEMANTIC_GRAPH['emociones']!)).toBe(true)
  })

  it('never repeats pictograms that were already shown', () => {
    let s = advanceRound(createEngine())
    const first = getPictogramsForRound(s, 6)
    s = advanceRound(markShown(s, first))
    expect(getPictogramsForRound(s, 6).some((p) => first.includes(p))).toBe(false)
  })

  it('tops up from other categories when the dominant one runs out', () => {
    let s = createEngine()
    s = applySelection(s, 'juguetes', true)
    for (const other of ROOT_CATEGORIES.filter((c) => c !== 'juguetes')) s = applySelection(s, other, false)
    s = advanceRound(markShown(s, ['pelota', 'muneca', 'carro', 'tableta', 'bloques']))
    const pictos = getPictogramsForRound(s, 6)
    expect(pictos).toHaveLength(6)
    expect(pictos).toContain('peluche')
  })

  it('returns nothing when every leaf was already shown', () => {
    const s = advanceRound(markShown(createEngine(), [...LEAF_NODES]))
    expect(getPictogramsForRound(s)).toEqual([])
  })
})

describe('applySelection', () => {
  it('raises the leaves of a selected category and keeps probabilities normalised', () => {
    const s = applySelection(createEngine(), 'emociones', true)
    expect(sum(s.probs)).toBeCloseTo(1)
    expect(s.probs['triste']!).toBeGreaterThan(s.probs['hambre']!)
  })

  it('lowers the leaves of a category that was shown but not selected', () => {
    const base = createEngine()
    const s = applySelection(base, 'emociones', false)
    expect(s.probs['triste']!).toBeLessThan(base.probs['triste']!)
    expect(sum(s.probs)).toBeCloseTo(1)
  })

  it('weights more relevant leaves higher than less relevant ones of the same category', () => {
    const s = applySelection(createEngine(), 'alimentacion', true)
    expect(s.probs['hambre']!).toBeGreaterThan(s.probs['queso']!) // peso 1.0 vs 0.7
  })

  it('treats a leaf as related only to itself', () => {
    expect(getTopPrediction(applySelection(createEngine(), 'dormir', true))[0]).toBe('dormir')
  })

  it('does not mutate the previous state', () => {
    const before = createEngine()
    const snapshot = JSON.stringify(before)
    applySelection(before, 'dormir', true)
    expect(JSON.stringify(before)).toBe(snapshot)
  })

  it('records the choice in the history and marks the picto as shown', () => {
    const s = applySelection(createEngine(), 'dormir', true)
    expect(s.history).toEqual([['dormir', true]])
    expect(s.shown).toContain('dormir')
  })
})

describe('confidence and finishing', () => {
  const sure = () => {
    let s = createEngine()
    for (let i = 0; i < 4; i++) s = applySelection(s, 'dormir', true)
    return s
  }

  it('is never confident before MIN_ROUNDS, however sure the data looks', () => {
    expect(getTopPrediction(sure())[1]).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD)
    expect(isConfident(sure())).toBe(false)
    expect(isConfident(rounds(sure(), MIN_ROUNDS))).toBe(true)
  })

  it('is not confident at the start', () => {
    expect(isConfident(rounds(createEngine(), MIN_ROUNDS))).toBe(false)
  })

  it('finishes when confident, at the round limit, or when nothing is left to show', () => {
    expect(shouldFinish(createEngine())).toBe(false)
    expect(shouldFinish(rounds(sure(), MIN_ROUNDS))).toBe(true)
    expect(shouldFinish(rounds(createEngine(), MAX_ROUNDS))).toBe(true)
    expect(shouldFinish(advanceRound(markShown(createEngine(), [...LEAF_NODES])))).toBe(true)
  })
})

describe('rejectGuess', () => {
  const guessed = () => rounds(applySelection(applySelection(createEngine(), 'dormir', true), 'dormir', true), 2)

  it('removes the rejected intention and renormalises', () => {
    const s = rejectGuess(guessed(), 'dormir')
    expect(s.probs['dormir']).toBe(0)
    expect(sum(s.probs)).toBeCloseTo(1)
    expect(getTopPrediction(s)[0]).not.toBe('dormir')
  })

  it('counts the rejection and grants extra rounds from the current one', () => {
    const before = guessed()
    const s = rejectGuess(before, 'dormir')
    expect(s.rejections).toBe(1)
    expect(s.roundLimit).toBe(before.roundNum + EXTRA_ROUNDS_AFTER_REJECTION)
    expect(s.shown).toContain('dormir')
  })

  it('does not mutate the previous state', () => {
    const before = guessed()
    const snapshot = JSON.stringify(before)
    rejectGuess(before, 'dormir')
    expect(JSON.stringify(before)).toBe(snapshot)
  })
})

describe('getTopN and getMessage', () => {
  it('sorts intentions by descending probability', () => {
    const top = getTopN(applySelection(createEngine(), 'dormir', true), 3)
    expect(top).toHaveLength(3)
    expect(top[0]![1]).toBeGreaterThanOrEqual(top[1]![1])
    expect(top[1]![1]).toBeGreaterThanOrEqual(top[2]![1])
  })

  it('returns the short message of the most probable intention', () => {
    let s = createEngine()
    for (let i = 0; i < 3; i++) s = applySelection(s, 'banio', true)
    expect(getMessage(s)).toBe(INTENTION_MESSAGES['banio'])
  })
})

describe('catalog consistency', () => {
  it('has a message, label and weight for every leaf, with unique ids', () => {
    const ids = CATALOG.flatMap((c) => c.leaves.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of CATALOG) {
      expect(c.leaves.length).toBeGreaterThanOrEqual(6)
      for (const l of c.leaves) {
        expect(l.message.length).toBeGreaterThan(0)
        expect(l.weight).toBeGreaterThan(0)
        expect(l.weight).toBeLessThanOrEqual(1)
      }
    }
  })

  it('offers a rich catalog of pictograms', () => {
    expect(ROOT_CATEGORIES).toHaveLength(6)
    expect(LEAF_NODES.length).toBeGreaterThanOrEqual(60)
  })
})
