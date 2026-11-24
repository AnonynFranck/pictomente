import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PictoCard from '../src/components/PictoCard.vue'
import ConfidenceMeter from '../src/components/ConfidenceMeter.vue'
import ResultView from '../src/components/ResultView.vue'
import { pictogramUrl } from '../src/data/pictograms'
import { categoryOf, getLabel } from '../src/data/graph'

describe('PictoCard', () => {
  it('renders a pressable button that reflects its selected state', () => {
    const w = mount(PictoCard, { props: { pictoKey: 'dormir', selected: true } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('aria-pressed')).toBe('true')
    expect(w.text()).toContain('Dormir')
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

  it('falls back to the label initial when the image fails to load', async () => {
    const w = mount(PictoCard, { props: { pictoKey: 'dormir' } })
    await w.find('img').trigger('error')
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('.picto__fallback').text()).toBe('D')
  })

  it('falls back when the key has no known pictogram id', () => {
    const w = mount(PictoCard, { props: { pictoKey: 'desconocido' } })
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('.picto__fallback').text()).toBe('D')
  })
})

describe('ConfidenceMeter', () => {
  it('exposes the percentage to assistive tech', () => {
    const w = mount(ConfidenceMeter, { props: { value: 0.426 } })
    expect(w.attributes('role')).toBe('progressbar')
    expect(w.attributes('aria-valuenow')).toBe('43')
    expect(w.text()).toContain('43%')
  })
})

describe('ResultView', () => {
  const message = { main: 'El usuario tiene sueño.', alternative: 'El usuario está cansado.', confidence: 72 }
  const topN = [['dormir', 0.72], ['cansado', 0.21], ['descansar', 0.04]] as const

  it('shows the message, alternative and distribution', () => {
    const w = mount(ResultView, { props: { message, topN } })
    expect(w.text()).toContain('El usuario tiene sueño.')
    expect(w.text()).toContain('Posiblemente también')
    expect(w.findAll('.dist__row')).toHaveLength(3)
    expect(w.text()).toContain('72%')
  })

  it('hides the alternative when there is none and emits restart', async () => {
    const w = mount(ResultView, { props: { message: { ...message, alternative: null }, topN } })
    expect(w.text()).not.toContain('Posiblemente también')
    await w.find('.result__restart').trigger('click')
    expect(w.emitted('restart')).toHaveLength(1)
  })
})

describe('data helpers', () => {
  it('maps pictograms to their category', () => {
    expect(categoryOf('triste')).toBe('emociones')
    expect(categoryOf('entorno')).toBe('entorno')
    expect(categoryOf('nada')).toBeNull()
  })

  it('has an ARASAAC id for every pictogram', () => {
    expect(pictogramUrl('emociones')).toContain('/11476/')
    expect(pictogramUrl('nada')).toBeNull()
  })

  it('capitalises unknown labels', () => {
    expect(getLabel('nada')).toBe('Nada')
  })
})
