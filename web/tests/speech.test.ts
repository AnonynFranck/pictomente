import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useSpeech } from '../src/composables/useSpeech'
import { synth } from './setup'

describe('useSpeech', () => {
  beforeEach(() => {
    synth.speak.mockClear()
    synth.cancel.mockClear()
  })
  afterEach(() => {
    if (useSpeech().muted.value) useSpeech().toggleMute()
  })

  it('speaks the text in a Spanish (Mexico) voice, gently and a bit high-pitched', () => {
    useSpeech().speak('Hola')
    const utterance = synth.speak.mock.calls[0]![0] as { text: string; lang: string; voice: { name: string }; rate: number; pitch: number }
    expect(utterance.text).toBe('Hola')
    expect(utterance.lang).toBe('es-MX')
    expect(utterance.voice.name).toBe('Español MX')
    expect(utterance.rate).toBeLessThan(1)
    expect(utterance.pitch).toBeGreaterThan(1)
  })

  it('cancels whatever was being said before speaking again', () => {
    useSpeech().speak('Uno')
    expect(synth.cancel).toHaveBeenCalledTimes(1)
  })

  it('says nothing for empty text', () => {
    useSpeech().speak('')
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('stays silent while muted and cuts the current speech when muting', () => {
    const { toggleMute, speak, muted } = useSpeech()
    toggleMute()
    expect(muted.value).toBe(true)
    expect(synth.cancel).toHaveBeenCalled()
    speak('Hola')
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('reports that speech is supported when the browser provides it', () => {
    expect(useSpeech().isSupported.value).toBe(true)
  })
})
