import { computed, ref, shallowRef } from 'vue'
import {
  MAX_ROUNDS,
  advanceRound,
  applySelection,
  createEngine,
  getMessage,
  getPictogramsForRound,
  getTopN,
  getTopPrediction,
  markShown,
  shouldFinish,
  type EngineState,
} from '../lib/engine'

export type Phase = 'start' | 'playing' | 'result'

/** Estado de una sesión: conecta el motor de inferencia (puro) con la interfaz. */
export function useSession() {
  const engine = shallowRef<EngineState>(createEngine())
  const phase = ref<Phase>('start')
  const selected = ref<ReadonlySet<string>>(new Set())

  const pictos = computed(() => getPictogramsForRound(engine.value))
  const roundNumber = computed(() => Math.min(engine.value.roundNum + 1, MAX_ROUNDS))
  const topPrediction = computed(() => getTopPrediction(engine.value))
  const topN = computed(() => getTopN(engine.value, 3))
  const message = computed(() => getMessage(engine.value))

  function closeRound(next: EngineState) {
    engine.value = advanceRound(next)
    selected.value = new Set()
    if (shouldFinish(engine.value)) phase.value = 'result'
  }

  function start() {
    engine.value = createEngine()
    selected.value = new Set()
    phase.value = 'playing'
  }

  function toggle(key: string) {
    const next = new Set(selected.value)
    if (!next.delete(key)) next.add(key)
    selected.value = next
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

  return {
    phase, selected, pictos, roundNumber, topPrediction, topN, message,
    maxRounds: MAX_ROUNDS, start, toggle, confirm, skip,
  }
}
