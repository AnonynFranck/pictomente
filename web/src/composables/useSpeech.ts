import { computed, readonly, ref } from 'vue'
import manifest from '../data/voice-manifest.json'

/**
 * Voz de Pico. Cada frase del juego tiene un audio pregrabado con voz neuronal
 * (web/public/audio), así suena igual y natural en cualquier navegador. Si una frase
 * no está grabada, o el navegador bloquea el audio, usa la voz del propio navegador.
 */
const clips = manifest as Readonly<Record<string, string>>
const muted = ref(false)

const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window
const hasAudio = typeof Audio !== 'undefined'
let current: HTMLAudioElement | null = null

function spanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang.toLowerCase().startsWith('es-mx'))
    ?? voices.find((v) => v.lang.toLowerCase().startsWith('es'))
}

function speakWithBrowserVoice(text: string): void {
  if (!hasSynth) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-MX'
  utterance.rate = 0.92
  utterance.pitch = 1.25
  const voice = spanishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

function stop(): void {
  current?.pause()
  current = null
  if (hasSynth) window.speechSynthesis.cancel()
}

function speak(text: string): void {
  if (muted.value || !text) return
  stop()
  const file = clips[text]
  if (!file || !hasAudio) {
    speakWithBrowserVoice(text)
    return
  }
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${file}`)
  current = audio
  audio.play().catch(() => {
    if (current !== audio) return
    current = null
    speakWithBrowserVoice(text)
  })
}

function toggleMute(): void {
  muted.value = !muted.value
  if (muted.value) stop()
}

export function useSpeech() {
  return {
    speak,
    toggleMute,
    muted: readonly(muted),
    isSupported: computed(() => hasAudio || hasSynth),
  }
}
