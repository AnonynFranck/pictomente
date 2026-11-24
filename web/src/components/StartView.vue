<script setup lang="ts">
import { ROOT_CATEGORIES } from '../data/graph'
import { PHRASES } from '../data/phrases'
import BigButton from './BigButton.vue'
import MascotGuide from './MascotGuide.vue'
import PictoCard from './PictoCard.vue'
import SoundToggle from './SoundToggle.vue'

defineEmits<{ start: [] }>()

const LOGO = 'Pictomente'.split('')
const LOGO_COLORS = ['--c-emociones-edge', '--c-actividades-edge', '--c-alimentacion-edge', '--c-entorno-edge', '--c-personas-edge']
</script>

<template>
  <section class="start" aria-labelledby="start-title">
    <div class="start__top"><SoundToggle /></div>

    <h1 id="start-title" class="logo" aria-label="Pictomente">
      <span
        v-for="(letter, i) in LOGO"
        :key="i"
        class="logo__letter"
        :style="{ '--c': `var(${LOGO_COLORS[i % LOGO_COLORS.length]})`, '--i': i }"
        aria-hidden="true"
      >{{ letter }}</span>
    </h1>

    <MascotGuide :text="PHRASES.start" mood="happy" :size="170" stack class="start__guide" />

    <ul class="start__tiles" aria-hidden="true">
      <li v-for="(key, i) in ROOT_CATEGORIES" :key="key" :style="{ '--i': i }">
        <PictoCard :picto-key="key" :interactive="false" />
      </li>
    </ul>

    <BigButton class="start__play" size="lg" @click="$emit('start')">
      <template #icon>
        <svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
      </template>
      ¡Jugar!
    </BigButton>
  </section>
</template>

<style scoped>
.start { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 1.4rem; padding-block: 1rem 3rem; }
.start__top { justify-self: end; }

.logo { display: flex; font-size: var(--text-logo); letter-spacing: -0.02em; line-height: 1; margin-top: -2rem; }
.logo__letter {
  display: inline-block; color: var(--c);
  -webkit-text-stroke: 0.09em var(--ink); paint-order: stroke fill;
  text-shadow: 0 0.06em 0 var(--ink);
}

.start__guide { max-width: 44rem; }

.start__tiles {
  list-style: none; margin: 0.4rem 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; width: min(100%, 40rem);
}
.start__tiles :deep(.picto__label) { font-size: var(--text-sm); }
.start__tiles li:nth-child(3n + 2) { translate: 0 0.8rem; }
.start__tiles li:nth-child(odd) { rotate: -1.5deg; }
.start__tiles li:nth-child(even) { rotate: 1.5deg; }

.start__play { margin-top: 1rem; }

/* pantallas anchas: título y guía a la izquierda, fichas a la derecha */
@media (min-width: 62rem) {
  .start {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    grid-template-areas: 'logo tiles' 'guide tiles' 'play tiles';
    align-content: center; align-items: center; column-gap: 3rem; row-gap: 1.6rem;
    min-height: calc(100dvh - 3rem); position: relative;
  }
  .start__top { position: absolute; top: 0; right: 0; }
  .logo { grid-area: logo; font-size: clamp(4rem, 6.4vw, 6.4rem); margin: 0; justify-self: start; }
  .start__guide { grid-area: guide; max-width: none; }
  .start__tiles { grid-area: tiles; width: 100%; margin: 0; }
  .start__play { grid-area: play; justify-self: start; margin: 0; }
}

@media (prefers-reduced-motion: no-preference) {
  .logo__letter { animation: letter-in 700ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 70ms); }
  .logo__letter:hover { animation: letter-jump 500ms var(--ease-bounce); }
  .start__tiles li { animation: tile-in 600ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 80ms + 400ms); }
  .start__play { animation: beat 1.6s ease-in-out 1.2s infinite; }

  @keyframes letter-in { from { opacity: 0; transform: translateY(-1.2em) rotate(-20deg); } }
  @keyframes letter-jump { 40% { transform: translateY(-0.25em) rotate(-6deg); } }
  @keyframes tile-in { from { opacity: 0; transform: scale(0.5); } }
  @keyframes beat { 50% { transform: scale(1.06); } }
}
@media (max-width: 36rem) {
  .start__tiles { gap: 0.7rem; }
  .start__tiles :deep(.picto__label) { display: none; }
  .logo { margin-top: -1rem; }
}
</style>
