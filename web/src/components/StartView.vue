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
  <section class="view start" aria-labelledby="start-title">
    <div class="start__top"><SoundToggle /></div>

    <h1 id="start-title" class="logo" aria-label="Pictomente">
      <span
        v-for="(letter, i) in LOGO"
        :key="i"
        class="logo__letter"
        :style="{ '--c': `var(${LOGO_COLORS[i % LOGO_COLORS.length]})`, '--i': i }"
        aria-hidden="true"
      ><span class="logo__wave">{{ letter }}</span></span>
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
.start { align-items: center; position: relative; }
.start__top { align-self: flex-end; flex: none; }

.logo {
  display: flex; flex: none; margin: 0;
  font-size: clamp(2.4rem, min(12vw, 11dvh), 6.4rem); letter-spacing: -0.02em; line-height: 1;
}
.logo__letter {
  display: inline-block; color: var(--c);
  -webkit-text-stroke: 0.09em var(--ink); paint-order: stroke fill;
  text-shadow: 0 0.06em 0 var(--ink);
}

.start__guide { flex: none; max-width: 44rem; }

.start__tiles {
  flex: 1 1 0; min-height: 0; width: min(100%, 40rem);
  list-style: none; margin: 0; padding: 0.4rem 0.3rem;
  display: grid; gap: clamp(0.5rem, 1.6vmin, 1rem);
  grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr));
}
.start__tiles li { min-height: 0; min-width: 0; }
.start__tiles li:nth-child(odd) { rotate: -1.5deg; }
.start__tiles li:nth-child(even) { rotate: 1.5deg; }
.start__play { flex: none; }

/* apaisado (laptop, tablet, celular de lado): título y guía a la izquierda, fichas a la derecha */
@media (min-aspect-ratio: 1/1) and (min-width: 30rem) {
  .start {
    display: grid; gap: 0 clamp(1rem, 4vw, 3rem);
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    grid-template-rows: 1fr auto auto auto 1fr;
    grid-template-areas: '. tiles' 'logo tiles' 'guide tiles' 'play tiles' '. tiles';
    align-items: center; justify-items: start;
  }
  .start__top { position: absolute; top: 0; right: 0; z-index: 2; }
  .logo { grid-area: logo; font-size: clamp(2.6rem, min(6.4vw, 14dvh), 6.4rem); margin-bottom: clamp(0.4rem, 2dvh, 1.4rem); }
  .start__guide { grid-area: guide; max-width: none; }
  .start__tiles { grid-area: tiles; width: 100%; height: 100%; max-height: 40rem; align-self: center; }
  .start__play { grid-area: play; margin-top: clamp(0.5rem, 2.5dvh, 1.6rem); }
}

@media (prefers-reduced-motion: no-preference) {
  .logo__letter { animation: letter-in 700ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 70ms); }
  /* ola al pasar el cursor: la entrada y la ola viven en elementos distintos para no reiniciarse */
  .logo__wave { display: inline-block; }
  .logo:hover .logo__wave { animation: letter-wave 700ms ease-in-out calc(var(--i, 0) * 55ms); }
  .start__tiles li { animation: tile-in 600ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 80ms + 400ms); }
  .start__play { animation: beat 1.6s ease-in-out 1.2s infinite; }

  @keyframes letter-in { from { opacity: 0; transform: translateY(-1.2em) rotate(-20deg); } }
  @keyframes letter-wave { 40% { transform: translateY(-0.14em) rotate(-3deg); } 70% { transform: translateY(0.03em); } }
  @keyframes tile-in { from { opacity: 0; transform: scale(0.5); } }
  @keyframes beat { 50% { transform: scale(1.06); } }
}
@media (max-width: 36rem) {
  .start__tiles :deep(.picto__label) { display: none; }
}
</style>
