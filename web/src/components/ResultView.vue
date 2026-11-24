<script setup lang="ts">
import { getLabel } from '../data/graph'
import type { TherapistMessage } from '../lib/engine'
import PictoCard from './PictoCard.vue'

defineProps<{
  message: TherapistMessage
  topN: ReadonlyArray<readonly [string, number]>
}>()
defineEmits<{ restart: [] }>()
const pct = (p: number) => Math.round(p * 100)
</script>

<template>
  <section class="result" aria-labelledby="result-title">
    <p class="result__kicker">Resultado para el terapeuta</p>

    <div class="result__layout">
      <article class="note">
        <h2 id="result-title" class="note__main">{{ message.main }}</h2>
        <p v-if="message.alternative" class="note__alt">
          <strong>Posiblemente también:</strong> {{ message.alternative }}
        </p>
        <p class="note__conf">Confianza de la inferencia: <strong>{{ message.confidence }}%</strong></p>
      </article>

      <div class="dist">
        <h3 class="dist__title">Distribución de intenciones</h3>
        <ul class="dist__list">
          <li v-for="([key, prob], i) in topN" :key="key" class="dist__row" :style="{ '--i': i }">
            <PictoCard :picto-key="key" :interactive="false" size="sm" class="dist__picto" />
            <div class="dist__bar">
              <span class="dist__name">{{ getLabel(key) }}</span>
              <span class="dist__track"><span class="dist__fill" :style="{ transform: `scaleX(${prob})` }" /></span>
            </div>
            <span class="dist__pct">{{ pct(prob) }}%</span>
          </li>
        </ul>
      </div>
    </div>

    <button class="btn btn--primary result__restart" type="button" @click="$emit('restart')">
      Nueva sesión
    </button>
  </section>
</template>

<style scoped>
.result { display: grid; gap: 1.8rem; padding-block: var(--space-section); }
.result__kicker {
  justify-self: start; padding: 0.25rem 0.8rem;
  background: var(--cat-entorno); border: 2px solid var(--line); border-radius: 99px;
  font-weight: 700; font-size: var(--text-sm);
}
.result__layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: var(--space-section); align-items: start; }

.note {
  position: relative; display: grid; gap: 1.2rem; padding: clamp(1.4rem, 1rem + 2vw, 2.6rem);
  background: oklch(97% 0.06 95); border: 2px solid var(--line); border-radius: var(--radius);
  box-shadow: var(--shadow-hard-lg); transform: rotate(-0.8deg);
}
.note::before { /* cinta adhesiva */
  content: ''; position: absolute; top: -14px; left: 50%; width: 110px; height: 28px;
  background: oklch(85% 0.1 85 / 0.8); border: 1px solid oklch(24% 0.045 265 / 0.25);
  translate: -50% 0; rotate: 2deg;
}
.note__main { font-size: var(--text-xl); letter-spacing: -0.015em; }
.note__alt { font-size: var(--text-lg); color: var(--ink-soft); padding-top: 1rem; border-top: 2px dashed var(--ink-soft); }
.note__conf { font-size: var(--text-sm); color: var(--ink-soft); }

.dist__title { font-size: var(--text-lg); margin-bottom: 1rem; }
.dist__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.dist__row { display: grid; grid-template-columns: 4.6rem 1fr auto; gap: 0.9rem; align-items: center; }
.dist__bar { display: grid; gap: 0.3rem; }
.dist__name { font-weight: 700; }
.dist__track { height: 16px; border: 2px solid var(--line); border-radius: 99px; background: var(--surface); overflow: hidden; }
.dist__fill { display: block; width: 100%; height: 100%; background: var(--action); transform-origin: left; }
.dist__pct { font-family: var(--font-display); font-weight: 800; font-size: var(--text-lg); min-width: 3.2ch; text-align: right; }

.result__restart { justify-self: start; font-size: var(--text-lg); padding-inline: 2rem; }

@media (prefers-reduced-motion: no-preference) {
  .note { animation: note-in 700ms var(--ease-out-expo) backwards; }
  .dist__fill { animation: grow 900ms var(--ease-out-expo) backwards; animation-delay: calc(var(--i) * 120ms + 300ms); }
  @keyframes note-in { from { opacity: 0; translate: 0 30px; rotate: 3deg; } }
  @keyframes grow { from { transform: scaleX(0); } }
}
@media (max-width: 52rem) {
  .result__layout { grid-template-columns: 1fr; }
  .result__restart { justify-self: stretch; }
}
</style>
