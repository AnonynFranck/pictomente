import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import App from '../src/App.vue'
import { useSpeech } from '../src/composables/useSpeech'
import { MAX_REJECTIONS, MAX_ROUNDS } from '../src/lib/engine'
import { ROOT_CATEGORIES } from '../src/data/graph'
import manifest from '../src/data/voice-manifest.json'
import { roundPrompt } from '../src/data/phrases'
import { audio, synth } from './setup'

const clip = (text: string) => `${import.meta.env.BASE_URL}audio/${(manifest as Record<string, string>)[text]}`

type W = VueWrapper

const click = async (w: W, text: string) => {
  await w.findAll('button').find((b) => b.text().startsWith(text))!.trigger('click')
  await flushPromises()
}
const cards = (w: W) => w.findAll('.game__grid button')
const labels = (w: W) => cards(w).map((c) => c.attributes('aria-label'))

/** Juega rondas eligiendo siempre la primera propuesta hasta que Pico pregunta "¿era esto?". */
async function playUntilGuess(w: W) {
  for (let i = 0; i < 12 && !w.find('.guess').exists(); i++) {
    await cards(w)[0]!.trigger('click')
    await click(w, '¡Listo!')
  }
  expect(w.find('.guess').exists()).toBe(true)
}

const startedApp = async () => {
  const w = mount(App)
  await click(w, '¡Jugar!')
  return w
}

afterEach(() => {
  if (useSpeech().muted.value) useSpeech().toggleMute()
  synth.speak.mockClear()
  audio.reset()
})

describe('welcome screen', () => {
  it('greets with the logo, Pico and a big play button, with no page footer', () => {
    const w = mount(App)
    expect(w.find('h1').attributes('aria-label')).toBe('Pictomente')
    expect(w.text()).toContain('Soy Pico')
    expect(w.find('footer').exists()).toBe(false)
    expect(w.findAll('.start__tiles li')).toHaveLength(ROOT_CATEGORIES.length)
  })
})

describe('playing', () => {
  it('shows every category in round 1 and Pico speaks the prompt', async () => {
    const w = await startedApp()
    expect(cards(w)).toHaveLength(ROOT_CATEGORIES.length)
    expect(w.find('.stars').attributes('aria-label')).toBe(`Ronda 1 de ${MAX_ROUNDS}`)
    expect(audio.played.at(-1)!.src).toBe(clip(roundPrompt(0)))
  })

  it('selects a card, says its reaction and counts it on the ready button', async () => {
    const w = await startedApp()
    audio.reset()
    await cards(w)[0]!.trigger('click')
    expect(cards(w)[0]!.attributes('aria-pressed')).toBe('true')
    expect(w.find('.game__count').text()).toBe('1')
    expect(w.find('.guide__text').text()).toContain('comida')
    expect(audio.played).toHaveLength(1)

    await cards(w)[0]!.trigger('click')
    expect(cards(w)[0]!.attributes('aria-pressed')).toBe('false')
    expect(w.find('.game__count').exists()).toBe(false)
  })

  it('moves on to six new pictograms and never repeats them when skipping', async () => {
    const w = await startedApp()
    await cards(w)[2]!.trigger('click')
    await click(w, '¡Listo!')
    const round2 = labels(w)
    expect(round2).toHaveLength(6)
    expect(w.find('.stars').attributes('aria-label')).toContain('Ronda 2')

    await click(w, 'Otros')
    expect(labels(w).some((l) => round2.includes(l))).toBe(false)
  })

  it('can go back home from the game', async () => {
    const w = await startedApp()
    await w.find('.game__home').trigger('click')
    await flushPromises()
    expect(w.find('.start').exists()).toBe(true)
  })

  it('stays quiet when the child turns the sound off', async () => {
    const w = mount(App)
    await w.find('.sound').trigger('click')
    audio.reset()
    await click(w, '¡Jugar!')
    expect(audio.played).toHaveLength(0)
    expect(synth.speak).not.toHaveBeenCalled()
  })
})

describe('guessing', () => {
  it('asks "¿Querías decir …?" after the rounds and celebrates a yes', async () => {
    const w = await startedApp()
    await playUntilGuess(w)
    expect(w.find('.guide__text').text()).toMatch(/^¿Querías decir/)

    await click(w, '¡Sí!')
    expect(w.find('.done').exists()).toBe(true)
    expect(w.find('.adult__text').text()).toMatch(/^(Quiere|Necesita|Se siente|Siente|Está|Tiene)/)
    expect(w.find('.confetti').exists()).toBe(true)

    await click(w, '¡Otra vez!')
    expect(w.find('.stars').attributes('aria-label')).toBe(`Ronda 1 de ${MAX_ROUNDS}`)
  })

  it('goes back to play after a "No" and never proposes the rejected pictogram again', async () => {
    const w = await startedApp()
    await playUntilGuess(w)
    const rejected = w.find('img').attributes('alt')!
    await click(w, 'No')

    expect(w.find('.game__grid').exists()).toBe(true)
    expect(w.find('.guide__text').text()).toContain('Probemos otra vez')
    expect(labels(w)).not.toContain(rejected)
    await playUntilGuess(w)
    expect(w.find('img').attributes('alt')).not.toBe(rejected)
  })

  it('asks for adult help after too many rejections instead of insisting', async () => {
    const w = await startedApp()
    for (let i = 0; i < MAX_REJECTIONS; i++) {
      await playUntilGuess(w)
      await click(w, 'No')
    }
    await playUntilGuess(w)
    await click(w, 'No')

    expect(w.find('.done').exists()).toBe(true)
    expect(w.find('.confetti').exists()).toBe(false)
    expect(w.find('.adult__text').text()).toContain('preguntarle directamente')
    expect(w.find('.guide__text').text()).toContain('Un adulto')
  })
})
