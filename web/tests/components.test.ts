import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BigButton from '../src/components/BigButton.vue'
import ConfettiBurst from '../src/components/ConfettiBurst.vue'
import DoneView from '../src/components/DoneView.vue'
import GuessView from '../src/components/GuessView.vue'
import MascotGuide from '../src/components/MascotGuide.vue'
import PicoMascot from '../src/components/PicoMascot.vue'
import PictoCard from '../src/components/PictoCard.vue'
import SoundToggle from '../src/components/SoundToggle.vue'
import StarProgress from '../src/components/StarProgress.vue'
import { categoryOf, getCheer, getLabel } from '../src/data/graph'
import { PHRASES, guessQuestion, pickReaction, roundPrompt } from '../src/data/phrases'
import { pictogramUrl } from '../src/data/pictograms'
import { LEAF_NODES, ROOT_CATEGORIES } from '../src/data/graph'
import { useSpeech } from '../src/composables/useSpeech'
import { audio, synth } from './setup'

afterEach(() => {
  if (useSpeech().muted.value) useSpeech().toggleMute()
  synth.speak.mockClear()
  audio.reset()
})

describe('PictoCard', () => {
  it('renders a pressable button named after its label that reflects the selected state', () => {
    const w = mount(PictoCard, { props: { pictoKey: 'dormir', selected: true } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('aria-pressed')).toBe('true')
    expect(w.attributes('aria-label')).toBe('Dormir')
    expect(w.classes()).toContain('picto--actividades')
  })

  it('emits toggle with its key when clicked', async () => {
    const w = mount(PictoCard, { props: { pictoKey: 'dormir' } })
    await w.trigger('click')
    expect(w.emitted('toggle')).toEqual([['dormir']])
  })

  it('is a plain, non-clickable element with alt text when not interactive', async () => {
    const w = mount(PictoCard, { props: { pictoKey: 'casa', interactive: false } })
    expect(w.element.tagName).toBe('DIV')
    expect(w.attributes('aria-pressed')).toBeUndefined()
    expect(w.find('img').attributes('alt')).toBe('Casa')
    await w.trigger('click')
    expect(w.emitted('toggle')).toBeUndefined()
  })

  it('points to the ARASAAC CDN with explicit dimensions', () => {
    const img = mount(PictoCard, { props: { pictoKey: 'dormir' } }).find('img')
    expect(img.attributes('src')).toMatch(/^https:\/\/static\.arasaac\.org\/pictograms\/\d+\/\d+_300\.png$/)
    expect(img.attributes('width')).toBe('300')
    expect(img.attributes('height')).toBe('300')
  })

  it('falls back to the label initial when the image fails or the key is unknown', async () => {
    const failing = mount(PictoCard, { props: { pictoKey: 'dormir' } })
    await failing.find('img').trigger('error')
    expect(failing.find('img').exists()).toBe(false)
    expect(failing.find('.picto__fallback').text()).toBe('D')

    const unknown = mount(PictoCard, { props: { pictoKey: 'desconocido' } })
    expect(unknown.find('.picto__fallback').text()).toBe('D')
    expect(unknown.classes()).toContain('picto--none')
  })
})

describe('catalog data', () => {
  it('has an ARASAAC pictogram for every category and every intention', () => {
    for (const key of [...ROOT_CATEGORIES, ...LEAF_NODES]) expect(pictogramUrl(key), key).toMatch(/pictograms\/\d+\//)
  })

  it('maps pictograms to their category and labels them', () => {
    expect(categoryOf('triste')).toBe('emociones')
    expect(categoryOf('mama')).toBe('personas')
    expect(categoryOf('entorno')).toBe('entorno')
    expect(categoryOf('nada')).toBeNull()
    expect(getLabel('nada')).toBe('Nada')
    expect(getCheer('juguetes')).toContain('juguetes')
    expect(getCheer('nada')).toBeNull()
    expect(pictogramUrl('nada')).toBeNull()
  })

  it('builds the guide phrases', () => {
    expect(roundPrompt(0)).toContain('hoy')
    expect(roundPrompt(99)).toBe(roundPrompt(3))
    expect(pickReaction('alimentacion')).toBe(getCheer('alimentacion'))
    expect(pickReaction('hambre')).toBe('Hambre')
    expect(guessQuestion('hambre')).toBe('¿Querías decir Hambre?')
  })
})

describe('StarProgress', () => {
  it('describes the current round and marks finished ones', () => {
    const w = mount(StarProgress, { props: { current: 3, total: 4 } })
    expect(w.attributes('aria-label')).toBe('Ronda 3 de 4')
    expect(w.findAll('.stars__star')).toHaveLength(4)
    expect(w.findAll('.stars__star--done')).toHaveLength(2)
    expect(w.findAll('.stars__star--now')).toHaveLength(1)
  })
})

describe('BigButton', () => {
  it('renders its label and icon and is clickable', async () => {
    const w = mount(BigButton, { props: { variant: 'stop' }, slots: { default: 'No', icon: '<svg />' } })
    expect(w.text()).toBe('No')
    expect(w.classes()).toContain('big--stop')
    expect(w.find('.big__icon').exists()).toBe(true)
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })
})

describe('PicoMascot', () => {
  it('is announced to assistive tech and changes expression with the mood', () => {
    const moods = ['happy', 'wow', 'think', 'oops', 'cheer'] as const
    const markup = moods.map((mood) => mount(PicoMascot, { props: { mood } }).html())
    expect(new Set(markup).size).toBe(moods.length)
    expect(mount(PicoMascot).attributes('aria-label')).toContain('Pico')
  })
})

describe('MascotGuide', () => {
  it('shows what Pico says and lets the child hear it again', async () => {
    const w = mount(MascotGuide, { props: { text: PHRASES.start } })
    expect(w.text()).toContain('Soy Pico')
    await w.find('.guide__listen').trigger('click')
    expect(audio.played).toHaveLength(1)
  })

  it('hides the listen button while the sound is off', () => {
    useSpeech().toggleMute()
    expect(mount(MascotGuide, { props: { text: 'x' } }).find('.guide__listen').exists()).toBe(false)
  })
})

describe('SoundToggle', () => {
  it('toggles the sound and reflects it for assistive tech', async () => {
    const w = mount(SoundToggle)
    expect(w.attributes('aria-pressed')).toBe('true')
    expect(w.attributes('aria-label')).toBe('Apagar el sonido')
    await w.trigger('click')
    expect(w.attributes('aria-pressed')).toBe('false')
    expect(w.attributes('aria-label')).toBe('Encender el sonido')
  })
})

describe('GuessView', () => {
  it('shows the guessed pictogram big and emits yes / no', async () => {
    const w = mount(GuessView, { props: { guess: 'hambre', guideText: '¿Querías decir Hambre?' } })
    expect(w.find('img').attributes('alt')).toBe('Hambre')
    const [yes, no] = w.findAll('button.big')
    await yes!.trigger('click')
    await no!.trigger('click')
    expect(w.emitted('yes')).toHaveLength(1)
    expect(w.emitted('no')).toHaveLength(1)
  })
})

describe('DoneView', () => {
  it('celebrates and shows the message for the adult when resolved', async () => {
    const w = mount(DoneView, { props: { resolved: true, guess: 'banio', message: 'Necesita ir al baño.', guideText: '¡Lo logramos!' } })
    expect(w.findComponent(ConfettiBurst).exists()).toBe(true)
    expect(w.find('.adult__text').text()).toBe('Necesita ir al baño.')
    expect(w.find('img').exists()).toBe(true)
    await w.find('button.big').trigger('click')
    expect(w.emitted('again')).toHaveLength(1)
  })

  it('does not celebrate nor claim an answer when unresolved', () => {
    const w = mount(DoneView, { props: { resolved: false, guess: 'banio', message: 'Necesita ir al baño.', guideText: 'Gracias' } })
    expect(w.findComponent(ConfettiBurst).exists()).toBe(false)
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('.adult__text').text()).toContain('preguntarle directamente')
    expect(w.text()).not.toContain('Necesita ir al baño.')
  })
})
