<script setup lang="ts">
import ConfidenceMeter from './ConfidenceMeter.vue'
import PictoCard from './PictoCard.vue'

defineProps<{
  pictos: ReadonlyArray<string>
  selected: ReadonlySet<string>
  roundNumber: number
  maxRounds: number
  confidence: number
}>()
defineEmits<{ toggle: [key: string]; confirm: []; skip: [] }>()
</script>

<template>
  <section class="game" aria-labelledby="game-title">
    <header class="game__head">
      <div>
        <p class="game__round" aria-live="polite">Ronda {{ roundNumber }} de {{ maxRounds }}</p>
        <h2 id="game-title" class="game__title">
          {{
            roundNumber === 1
              ? '¿Qué área describe mejor lo que quieres expresar?'
              : 'Elige los pictogramas que se acercan a lo que sientes o necesitas.'
          }}
        </h2>
      </div>
      <ConfidenceMeter :value="confidence" />
    </header>

    <ul :key="roundNumber" class="game__grid" :class="{ 'game__grid--four': pictos.length <= 4 }">
      <li v-for="(key, i) in pictos" :key="key" :style="{ '--i': i }">
        <PictoCard :picto-key="key" :selected="selected.has(key)" @toggle="$emit('toggle', $event)" />
      </li>
    </ul>

    <footer class="game__actions">
      <button class="btn" type="button" @click="$emit('skip')">Saltar ronda</button>
      <button class="btn btn--primary" type="button" @click="$emit('confirm')">
        Confirmar<span v-if="selected.size"> ({{ selected.size }})</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.game { display: grid; gap: 2rem; padding-block: var(--space-section); }
.game__head { display: flex; flex-wrap: wrap; gap: 1.2rem 2rem; justify-content: space-between; align-items: end; }
.game__round {
  display: inline-block; margin-bottom: 0.6rem; padding: 0.15rem 0.7rem;
  background: var(--ink); color: var(--paper); border-radius: 99px;
  font-weight: 700; font-size: var(--text-sm);
}
.game__title { font-size: var(--text-xl); max-width: 30ch; letter-spacing: -0.015em; }

.game__grid {
  list-style: none; margin: 0; padding: 0.6rem 0.6rem 0.8rem;
  display: grid; gap: clamp(0.8rem, 0.4rem + 2vw, 1.5rem);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 7.5rem), 1fr));
}
.game__grid--four { grid-template-columns: repeat(auto-fit, minmax(min(100%, 7.5rem), 14rem)); justify-content: center; }
.game__grid li:nth-child(3n + 2) { margin-top: 0.7rem; } /* ritmo escalonado, no cuadrícula rígida */

.game__actions { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }

@media (prefers-reduced-motion: no-preference) {
  .game__grid li { animation: card-in 520ms var(--ease-out-expo) backwards; animation-delay: calc(var(--i) * 70ms); }
  @keyframes card-in { from { opacity: 0; translate: 0 18px; scale: 0.96; } }
}
@media (max-width: 30rem) {
  .game__actions .btn { flex: 1; padding-inline: 0.8rem; }
}
</style>
