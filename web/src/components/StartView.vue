<script setup lang="ts">
import { ROOT_CATEGORIES } from '../data/graph'
import PictoCard from './PictoCard.vue'

defineEmits<{ start: [] }>()
</script>

<template>
  <section class="start" aria-labelledby="start-title">
    <div class="start__copy">
      <p class="start__kicker">Comunicación aumentativa · Demo</p>
      <h1 id="start-title" class="start__title">Picto<span>mente</span></h1>
      <p class="start__lead">
        Elige imágenes para expresar lo que sientes o necesitas. En pocas rondas, la IA
        deduce la intención y le explica al terapeuta qué quiere decir la persona.
      </p>
      <ol class="start__steps">
        <li>Marca los pictogramas que se acercan a lo que quieres.</li>
        <li>La IA aprende de cada elección y afina las siguientes opciones.</li>
        <li>Al llegar a suficiente confianza, aparece un mensaje claro.</li>
      </ol>
      <button class="btn btn--primary start__cta" type="button" @click="$emit('start')">
        Comenzar →
      </button>
    </div>

    <div class="start__board" aria-hidden="true">
      <PictoCard
        v-for="(key, i) in ROOT_CATEGORIES"
        :key="key"
        :picto-key="key"
        :interactive="false"
        class="start__tile"
        :style="{ '--i': i }"
      />
    </div>
  </section>
</template>

<style scoped>
.start {
  display: grid; gap: var(--space-section);
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  align-items: center;
  padding-block: var(--space-section);
}
.start__kicker {
  display: inline-block; padding: 0.25rem 0.8rem; margin-bottom: 1.2rem;
  background: var(--cat-alimentacion); border: 2px solid var(--line); border-radius: 99px;
  font-weight: 700; font-size: var(--text-sm);
}
.start__title { font-size: var(--text-hero); letter-spacing: -0.03em; }
.start__title span { font-style: italic; font-weight: 400; color: var(--action); }
.start__lead { margin-top: 1.2rem; max-width: 34rem; font-size: var(--text-lg); color: var(--ink-soft); }
.start__steps {
  margin: 1.6rem 0 2rem; padding: 0; list-style: none; counter-reset: step;
  display: grid; gap: 0.7rem; max-width: 34rem;
}
.start__steps li { counter-increment: step; display: flex; gap: 0.8rem; align-items: baseline; }
.start__steps li::before {
  content: counter(step);
  flex: none; display: grid; place-items: center; width: 1.9rem; height: 1.9rem;
  font-family: var(--font-display); font-weight: 800;
  background: var(--surface); border: 2px solid var(--line); border-radius: 50%;
}
.start__cta { font-size: var(--text-lg); padding-inline: 2.2rem; }

.start__board {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem;
  padding: 1.4rem; background: var(--paper-deep);
  border: 2px solid var(--line); border-radius: 28px; box-shadow: var(--shadow-hard-lg);
  transform: rotate(2deg);
}
.start__tile:nth-child(even) { transform: translateY(1.2rem) rotate(-2.5deg); }
.start__tile:nth-child(odd) { transform: rotate(1.5deg); }

@media (prefers-reduced-motion: no-preference) {
  .start__tile { animation: tile-in 700ms var(--ease-out-expo) backwards; animation-delay: calc(var(--i) * 90ms + 150ms); }
  @keyframes tile-in { from { opacity: 0; translate: 0 24px; } }
}

@media (max-width: 52rem) {
  .start { grid-template-columns: 1fr; }
  .start__board { order: -1; transform: none; max-width: 24rem; padding: 1rem; gap: 0.8rem; }
}
</style>
