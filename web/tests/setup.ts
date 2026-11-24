import { vi } from 'vitest'

/** jsdom no trae Web Speech API ni reproduce audio: simulamos ambos. */
export const synth = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [
    { lang: 'en-US', name: 'English' },
    { lang: 'es-ES', name: 'Español' },
    { lang: 'es-MX', name: 'Español MX' },
  ]),
}

class FakeUtterance {
  lang = ''
  rate = 1
  pitch = 1
  voice: unknown = null
  constructor(public text: string) {}
}

/** Audio simulado: registra cada reproducción y permite probar el rechazo por autoplay. */
export const audio = {
  played: [] as FakeAudio[],
  rejectNextPlay: false,
  reset() {
    this.played = []
    this.rejectNextPlay = false
  },
}

export class FakeAudio {
  paused = true
  constructor(public src: string) {}
  play() {
    this.paused = false
    audio.played.push(this)
    if (audio.rejectNextPlay) {
      audio.rejectNextPlay = false
      return Promise.reject(new DOMException('blocked', 'NotAllowedError'))
    }
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
}

Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
vi.stubGlobal('Audio', FakeAudio)
