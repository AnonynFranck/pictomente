import { describe, expect, it } from 'vitest'
import {
  CONFIDENCE_THRESHOLD,
  advanceRound,
  applySelection,
  createEngine,
  getMessage,
  getPictogramsForRound,
  getTopN,
  getTopPrediction,
  isConfident,
  markShown,
  shouldFinish,
  MAX_ROUNDS,
} from '../src/lib/engine'
import { LEAF_NODES, ROOT_CATEGORIES, INTENTION_MESSAGES } from '../src/data/graph'

const sum = (probs: Record<string, number>) => Object.values(probs).reduce((a, b) => a + b, 0)

describe('createEngine', () => {
  it('starts with a uniform distribution over every leaf intention', () => {
    const s = createEngine()
    expect(Object.keys(s.probs)).toHaveLength(LEAF_NODES.length)
    expect(sum(s.probs)).toBeCloseTo(1)
    expect(new Set(Object.values(s.probs)).size).toBe(1)
    expect(s.roundNum).toBe(0)
  })
})

describe('getPictogramsForRound', () => {
  it('returns the four root categories in round 0', () => {
    expect(getPictogramsForRound(createEngine())).toEqual(ROOT_CATEGORIES)
  })

  it('returns n distinct leaf pictograms after round 0', () => {
    const s = advanceRound(createEngine())
    const pictos = getPictogramsForRound(s, 6)
    expect(pictos).toHaveLength(6)
    expect(new Set(pictos).size).toBe(6)
    expect(pictos.every((p) => LEAF_NODES.includes(p))).toBe(true)
  })

  it('never repeats pictograms that were already shown', () => {
    let s = advanceRound(createEngine())
    const first = getPictogramsForRound(s, 6)
    s = advanceRound(markShown(s, first))
    const second = getPictogramsForRound(s, 6)
    expect(second.some((p) => first.includes(p))).toBe(false)
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

  it('treats a leaf as related only to itself', () => {
    const s = applySelection(createEngine(), 'dormir', true)
    const top = getTopPrediction(s)
    expect(top[0]).toBe('dormir')
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
  it('is not confident at the start', () => {
    expect(isConfident(createEngine())).toBe(false)
  })

  it('becomes confident after repeatedly selecting one intention', () => {
    let s = createEngine()
    for (let i = 0; i < 4; i++) s = applySelection(s, 'dormir', true)
    expect(getTopPrediction(s)[1]).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD)
    expect(isConfident(s)).toBe(true)
  })

  it('finishes when confident or when the round limit is reached', () => {
    expect(shouldFinish(createEngine())).toBe(false)
    let s = createEngine()
    for (let i = 0; i < MAX_ROUNDS; i++) s = advanceRound(s)
    expect(shouldFinish(s)).toBe(true)
  })
})

describe('getTopN and getMessage', () => {
  it('sorts intentions by descending probability', () => {
    const s = applySelection(createEngine(), 'dormir', true)
    const top = getTopN(s, 3)
    expect(top).toHaveLength(3)
    expect(top[0]![1]).toBeGreaterThanOrEqual(top[1]![1])
    expect(top[1]![1]).toBeGreaterThanOrEqual(top[2]![1])
  })

  it('builds the therapist message with the confidence percentage', () => {
    let s = createEngine()
    for (let i = 0; i < 4; i++) s = applySelection(s, 'banio', true)
    const msg = getMessage(s)
    expect(msg.main).toBe(INTENTION_MESSAGES['banio'])
    expect(msg.confidence).toBeGreaterThan(50)
    expect(msg.alternative).toBeNull()
  })

  it('mentions the runner-up when it is above 20%', () => {
    const base = createEngine()
    const probs = Object.fromEntries(Object.keys(base.probs).map((k) => [k, 0]))
    const s = { ...base, probs: { ...probs, dormir: 0.5, cansado: 0.3, sed: 0.2 } }
    const msg = getMessage(s)
    expect(msg.alternative).toBe(INTENTION_MESSAGES['cansado'])
    expect(msg.confidence).toBe(50)
  })
})

describe('data consistency', () => {
  it('has a message for every leaf and a label for every leaf', async () => {
    const { LABELS } = await import('../src/data/graph')
    for (const leaf of LEAF_NODES) {
      expect(INTENTION_MESSAGES[leaf]).toBeTruthy()
      expect(LABELS[leaf]).toBeTruthy()
    }
  })
})
