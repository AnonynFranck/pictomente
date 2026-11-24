import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import { MAX_ROUNDS } from '../src/lib/engine'

const click = (w: ReturnType<typeof mount>, text: string) =>
  w.findAll('button').find((b) => b.text().startsWith(text))!.trigger('click')

describe('App flow', () => {
  it('starts on the welcome screen without a page footer', () => {
    const w = mount(App)
    expect(w.find('h1').text()).toContain('mente')
    expect(w.find('footer').exists()).toBe(false)
  })

  it('shows the four categories in round 1 after pressing Comenzar', async () => {
    const w = mount(App)
    await click(w, 'Comenzar')
    expect(w.text()).toContain(`Ronda 1 de ${MAX_ROUNDS}`)
    expect(w.findAll('.game__grid button')).toHaveLength(4)
  })

  it('counts the selected pictograms in the confirm button', async () => {
    const w = mount(App)
    await click(w, 'Comenzar')
    await w.findAll('.game__grid button')[0]!.trigger('click')
    expect(w.findAll('.game__grid button')[0]!.attributes('aria-pressed')).toBe('true')
    expect(w.text()).toContain('Confirmar (1)')
    await w.findAll('.game__grid button')[0]!.trigger('click')
    expect(w.text()).not.toContain('Confirmar (')
  })

  it('moves to six new pictograms in round 2 and never repeats them when skipping', async () => {
    const w = mount(App)
    await click(w, 'Comenzar')
    await w.findAll('.game__grid button')[2]!.trigger('click') // emociones
    await click(w, 'Confirmar')
    const round2 = w.findAll('.picto__label').map((l) => l.text())
    expect(w.text()).toContain('Ronda 2')
    expect(round2).toHaveLength(6)

    await click(w, 'Saltar')
    const round3 = w.findAll('.picto__label').map((l) => l.text())
    expect(round3.some((l) => round2.includes(l))).toBe(false)
  })

  it('reaches the result screen and can start a new session', async () => {
    const w = mount(App)
    await click(w, 'Comenzar')
    for (let i = 0; i < MAX_ROUNDS; i++) {
      if (w.find('.result').exists()) break
      await click(w, 'Saltar')
    }
    expect(w.find('.result').exists()).toBe(true)
    expect(w.find('.note__main').text()).toMatch(/^El usuario/)

    await click(w, 'Nueva sesión')
    expect(w.text()).toContain('Ronda 1')
  })

  it('shows the result after confirming every round', async () => {
    const w = mount(App)
    await click(w, 'Comenzar')
    for (let round = 0; round < MAX_ROUNDS; round++) {
      expect(w.find('.result').exists()).toBe(false)
      await w.findAll('.game__grid button')[0]!.trigger('click')
      await click(w, 'Confirmar')
    }
    expect(w.find('.result').exists()).toBe(true)
    expect(w.findAll('.dist__row')).toHaveLength(3)
  })
})
