import { computed, readonly, ref } from 'vue'

/**
 * Voz del guía con la Web Speech API del navegador (sin servidor ni claves).
 * Si el navegador no tiene voz en español o el niño la apaga, simplemente calla.
 */
const muted = ref(false)
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

function spanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang.toLowerCase().startsWith('es-mx'))
    ?? voices.find((v) => v.lang.toLowerCase().startsWith('es'))
}

function speak(text: string): void {
  if (!supported || muted.value || !text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-MX'
  utterance.rate = 0.92
  utterance.pitch = 1.25
  const voice = spanishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

function toggleMute(): void {
  muted.value = !muted.value
  if (muted.value && supported) window.speechSynthesis.cancel()
}

export function useSpeech() {
  return {
    speak,
    toggleMute,
    muted: readonly(muted),
    isSupported: computed(() => supported),
  }
}
