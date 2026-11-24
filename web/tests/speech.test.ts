import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useSpeech } from '../src/composables/useSpeech'
import manifest from '../src/data/voice-manifest.json'
import { PHRASES } from '../src/data/phrases'
import { audio, synth } from './setup'

const clip = (text: string) => `${import.meta.env.BASE_URL}audio/${(manifest as Record<string, string>)[text]}`

describe('useSpeech', () => {
  beforeEach(() => {
    audio.reset()
    synth.speak.mockClear()
    synth.cancel.mockClear()
  })
  afterEach(() => {
    if (useSpeech().muted.value) useSpeech().toggleMute()
  })

  it('plays the pre-recorded neural voice clip for known phrases', () => {
    useSpeech().speak(PHRASES.start)
    expect(audio.played).toHaveLength(1)
    expect(audio.played[0]!.src).toBe(clip(PHRASES.start))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('cuts the previous phrase before playing the next one', () => {
    useSpeech().speak(PHRASES.start)
    useSpeech().speak(PHRASES.accepted)
    expect(audio.played[0]!.paused).toBe(true)
    expect(audio.played[1]!.paused).toBe(false)
    expect(synth.cancel).toHaveBeenCalled()
  })

  it('falls back to the browser voice (Spanish, gentle, a bit high-pitched) for unknown text', () => {
    useSpeech().speak('Una frase sin grabar')
    expect(audio.played).toHaveLength(0)
    const utterance = synth.speak.mock.calls[0]![0] as { text: string; lang: string; voice: { name: string }; rate: number; pitch: number }
    expect(utterance.text).toBe('Una frase sin grabar')
    expect(utterance.lang).toBe('es-MX')
    expect(utterance.voice.name).toBe('Español MX')
    expect(utterance.rate).toBeLessThan(1)
    expect(utterance.pitch).toBeGreaterThan(1)
  })

  it('falls back to the browser voice when the browser blocks the audio', async () => {
    audio.rejectNextPlay = true
    useSpeech().speak(PHRASES.start)
    await Promise.resolve()
    await Promise.resolve()
    expect(synth.speak).toHaveBeenCalledTimes(1)
  })

  it('says nothing for empty text', () => {
    useSpeech().speak('')
    expect(audio.played).toHaveLength(0)
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('stays silent while muted and cuts the current speech when muting', () => {
    const { toggleMute, speak, muted } = useSpeech()
    speak(PHRASES.start)
    toggleMute()
    expect(muted.value).toBe(true)
    expect(audio.played[0]!.paused).toBe(true)
    expect(synth.cancel).toHaveBeenCalled()
    speak(PHRASES.accepted)
    expect(audio.played).toHaveLength(1)
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('reports that speech is supported', () => {
    expect(useSpeech().isSupported.value).toBe(true)
  })
})
