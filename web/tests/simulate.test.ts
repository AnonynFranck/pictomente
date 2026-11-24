import { describe, expect, it } from 'vitest'
import { createRng, runSimulation, simulateSession } from '../src/lib/simulate'

describe('simulation', () => {
  it('is reproducible for the same seed', () => {
    const a = runSimulation(50, createRng(7))
    const b = runSimulation(50, createRng(7))
    expect(a).toEqual(b)
  })

  it('guides most simulated children to the right intention', () => {
    const report = runSimulation(300, createRng(2026))
    console.info(
      `[métricas] éxito=${(report.successRate * 100).toFixed(1)}% ` +
        `1ª conjetura=${(report.firstGuessRate * 100).toFixed(1)}% rondas=${report.avgRounds.toFixed(2)}`,
    )
    expect(report.successRate).toBeGreaterThanOrEqual(0.75)
    expect(report.firstGuessRate).toBeGreaterThanOrEqual(0.4)
    expect(report.avgRounds).toBeLessThanOrEqual(6.5)
    expect(Object.keys(report.byCategory)).toHaveLength(6)
  }, 60_000)

  it('reports whether a single session succeeded and how many rounds it took', () => {
    const r = simulateSession('dormir', createRng(1))
    expect(r.target).toBe('dormir')
    expect(r.rounds).toBeGreaterThanOrEqual(2)
    expect(r.rejections).toBeGreaterThanOrEqual(0)
  })
})
