import { vi } from 'vitest'

/** jsdom no trae Web Speech API: la simulamos para poder probar la voz del guía. */
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

Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
