import { computed, ref, shallowRef } from 'vue'
import { PHRASES, guessQuestion, pickReaction, roundPrompt } from '../data/phrases'
import {
  MAX_REJECTIONS,
  MAX_ROUNDS,
  advanceRound,
  applySelection,
  createEngine,
  getMessage,
  getPictogramsForRound,
  getTopPrediction,
  markShown,
  rejectGuess,
  shouldFinish,
  type EngineState,
} from '../lib/engine'
import { useSpeech } from './useSpeech'

/** start → playing ⇄ guess → done. */
export type Phase = 'start' | 'playing' | 'guess' | 'done'

/** Estado de una sesión: conecta el motor de inferencia (puro) con la interfaz y la voz. */
export function useSession() {
  const { speak } = useSpeech()
  const engine = shallowRef<EngineState>(createEngine())
  const phase = ref<Phase>('start')
  const selected = ref<ReadonlySet<string>>(new Set())
  /** Texto que dice Pico en pantalla (y en voz alta). */
  const guideText = ref<string>(PHRASES.start)
  const resolved = ref(true)

  const pictos = computed(() => getPictogramsForRound(engine.value))
  const roundNumber = computed(() => Math.min(engine.value.roundNum + 1, MAX_ROUNDS))
  const guess = computed(() => getTopPrediction(engine.value)[0])
  const message = computed(() => getMessage(engine.value))

  function say(text: string) {
    guideText.value = text
    speak(text)
  }

  function startRound() {
    phase.value = 'playing'
    selected.value = new Set()
    say(roundPrompt(engine.value.roundNum))
  }

  function closeRound(next: EngineState) {
    engine.value = advanceRound(next)
    if (shouldFinish(engine.value)) {
      phase.value = 'guess'
      selected.value = new Set()
      say(guessQuestion(guess.value))
    } else {
      startRound()
    }
  }

  function start() {
    engine.value = createEngine()
    resolved.value = true
    startRound()
  }

  function toggle(key: string) {
    const next = new Set(selected.value)
    if (next.delete(key)) {
      selected.value = next
      return
    }
    next.add(key)
    selected.value = next
    say(pickReaction(key))
  }

  /** Confirma la ronda: lo marcado sube, lo no marcado baja. */
  function confirm() {
    const updated = pictos.value.reduce(
      (state, key) => applySelection(state, key, selected.value.has(key)),
      engine.value,
    )
    closeRound(updated)
  }

  /** Salta la ronda sin cambiar probabilidades; los pictogramas no se repiten. */
  function skip() {
    closeRound(markShown(engine.value, pictos.value))
  }

  function acceptGuess() {
    phase.value = 'done'
    say(PHRASES.accepted)
  }

  /** "No era eso": se descarta la conjetura y se juega otra vez, hasta MAX_REJECTIONS. */
  function rejectCurrentGuess() {
    if (engine.value.rejections >= MAX_REJECTIONS) {
      resolved.value = false
      phase.value = 'done'
      say(PHRASES.unresolved)
      return
    }
    engine.value = rejectGuess(engine.value, guess.value)
    startRound()
    say(`${PHRASES.rejected} ${roundPrompt(engine.value.roundNum)}`)
  }

  return {
    phase, selected, pictos, roundNumber, guess, message, guideText, resolved,
    maxRounds: MAX_ROUNDS, start, toggle, confirm, skip, acceptGuess, rejectCurrentGuess,
  }
}
