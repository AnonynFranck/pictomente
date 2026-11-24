<script setup lang="ts">
import { useSpeech } from '../composables/useSpeech'
import type { Mood } from '../lib/mood'
import PicoMascot from './PicoMascot.vue'

withDefaults(defineProps<{ text: string; mood?: Mood; size?: number; stack?: boolean }>(), {
  mood: 'happy',
  size: 120,
  stack: false,
})

const { speak, isSupported, muted } = useSpeech()
</script>

<template>
  <div class="guide" :class="{ 'guide--stack': stack }" :style="{ '--pico': `${size}px` }">
    <PicoMascot class="guide__pico" :mood="mood" :size="size" />
    <div class="guide__bubble">
      <p :key="text" class="guide__text" aria-live="polite">{{ text }}</p>
      <button
        v-if="isSupported && !muted"
        class="guide__listen"
        type="button"
        aria-label="Escuchar otra vez"
        @click="speak(text)"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.guide { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
/* la mascota nunca ocupa más de una cuarta parte del ancho en fila */
.guide__pico { width: min(var(--pico), 26vw); height: auto; }

.guide__bubble {
  position: relative; flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.8rem;
  padding: 1rem 1.2rem; min-height: 4.5rem;
  background: var(--white); border: 5px solid var(--ink); border-radius: var(--radius);
  box-shadow: 0 6px 0 oklch(26% 0.06 270 / 0.25);
}
/* cola del globo apuntando a Pico */
.guide__bubble::before, .guide__bubble::after {
  content: ''; position: absolute; top: 50%; left: -22px; translate: 0 -50%;
  border: 14px solid transparent; border-right-color: var(--ink); border-left: 0;
}
.guide__bubble::after { left: -14px; border-right-color: var(--white); border-width: 10px 12px 10px 0; }

.guide__text { flex: 1; font-size: var(--text-md); font-weight: 600; text-wrap: balance; }
.guide__listen {
  flex: none; display: grid; place-items: center; width: 3.2rem; height: 3.2rem;
  background: var(--sun); color: var(--ink); border: 4px solid var(--ink); border-radius: 50%;
  box-shadow: 0 4px 0 var(--sun-edge); cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.guide__listen:hover { transform: scale(1.08); }
.guide__listen:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--sun-edge); }

/* apilado: Pico arriba, globo debajo con la cola hacia arriba */
@media (max-width: 40rem) {
  .guide--stack { flex-direction: column; gap: 1rem; }
  .guide--stack .guide__pico { width: var(--pico); max-width: 60vw; }
  .guide--stack .guide__bubble::before, .guide--stack .guide__bubble::after {
    top: -22px; left: 50%; translate: -50% 0;
    border: 14px solid transparent; border-bottom-color: var(--ink); border-top: 0;
  }
  .guide--stack .guide__bubble::after { top: -14px; border-bottom-color: var(--white); border-width: 0 10px 12px 10px; }
}

@media (prefers-reduced-motion: no-preference) {
  .guide__text { animation: say 380ms var(--ease-out-expo); }
  @keyframes say { from { opacity: 0; translate: 0 8px; } }
}
</style>
