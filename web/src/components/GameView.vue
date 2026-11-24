<script setup lang="ts">
import BigButton from './BigButton.vue'
import MascotGuide from './MascotGuide.vue'
import PictoCard from './PictoCard.vue'
import SoundToggle from './SoundToggle.vue'
import StarProgress from './StarProgress.vue'

defineProps<{
  pictos: ReadonlyArray<string>
  selected: ReadonlySet<string>
  roundNumber: number
  maxRounds: number
  guideText: string
}>()
defineEmits<{ toggle: [key: string]; confirm: []; skip: []; home: [] }>()
</script>

<template>
  <section class="view game" aria-label="Elige los dibujos">
    <header class="game__bar">
      <StarProgress :current="roundNumber" :total="maxRounds" class="game__stars" />
      <MascotGuide :text="guideText" :mood="roundNumber === 1 ? 'happy' : 'think'" :size="112" class="game__guide" />
      <div class="game__tools">
        <button class="game__home" type="button" aria-label="Volver al inicio" @click="$emit('home')">
          <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true">
            <path d="M3.5 11.5L12 4l8.5 7.5M6 10v9h12v-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <SoundToggle />
      </div>
    </header>

    <div class="game__stage">
      <ul :key="roundNumber" class="game__grid">
        <li v-for="(key, i) in pictos" :key="key" :style="{ '--i': i }">
          <PictoCard :picto-key="key" :selected="selected.has(key)" @toggle="$emit('toggle', $event)" />
        </li>
      </ul>
    </div>

    <footer class="game__actions">
      <BigButton variant="sun" @click="$emit('skip')">
        <template #icon>
          <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </template>
        Otros
      </BigButton>
      <BigButton @click="$emit('confirm')">
        <template #icon>
          <svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </template>
        ¡Listo!<span v-if="selected.size" class="game__count">{{ selected.size }}</span>
      </BigButton>
    </footer>
  </section>
</template>

<style scoped>
.game__bar { flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 1rem; }
.game__stars { order: 1; }
.game__tools { order: 2; margin-left: auto; display: flex; gap: 0.6rem; }
.game__guide { order: 3; flex: 1 1 100%; }
.game__home {
  display: grid; place-items: center; width: var(--ctl); height: var(--ctl);
  background: var(--white); color: var(--ink); border: 5px solid var(--ink); border-radius: 50%;
  box-shadow: 0 5px 0 oklch(26% 0.06 270 / 0.3); cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.game__home:hover { transform: scale(1.08) rotate(4deg); }
.game__home:active { transform: translateY(4px); box-shadow: none; }

/* el escenario toma todo el alto libre y las tarjetas se reparten ese espacio */
.game__stage { flex: 1 1 0; min-height: 0; container: stage / size; display: grid; place-items: center; }
.game__grid {
  list-style: none; margin: 0; padding: 1rem 0.7rem 0.6rem;
  width: 100%; height: 100%; max-width: 64rem;
  display: grid; gap: clamp(0.6rem, 2.4cqmin, 1.6rem);
  grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr));
}
.game__grid li { min-height: 0; min-width: 0; }
/* pantalla vertical (celular): 2 columnas × 3 filas */
@container stage (aspect-ratio < 1) {
  .game__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr)); }
}

.game__actions { flex: none; display: flex; justify-content: center; gap: clamp(0.6rem, 3vw, 1.4rem); }
.game__actions :deep(.big) { flex: 1; max-width: 18rem; }
.game__count {
  display: inline-grid; place-items: center; min-width: 1.9em; height: 1.9em; margin-left: 0.3rem;
  background: var(--white); border: 4px solid var(--ink); border-radius: 50%; font-size: 0.7em;
}

/* pantallas anchas y apaisadas: estrellas, Pico y controles comparten una fila */
@media (min-aspect-ratio: 1/1) and (min-width: 30rem) {
  .game__bar { flex-wrap: nowrap; }
  .game__guide { order: 2; flex: 1 1 auto; min-width: 0; }
  .game__tools { order: 3; margin-left: 0; }
}
/* celular apaisado: los botones pasan a una columna a la derecha para darle alto a las tarjetas */
@media (min-aspect-ratio: 1/1) and (max-height: 520px) {
  .game { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto minmax(0, 1fr); column-gap: 1rem; }
  .game__bar { grid-column: 1 / -1; }
  .game__stage { grid-row: 2; }
  .game__actions { grid-row: 2; grid-column: 2; flex-direction: column; justify-content: center; }
  .game__actions :deep(.big) { flex: none; min-width: 9rem; }
}
@media (max-width: 36rem) {
  .game__actions :deep(.big) { padding-inline: 1rem; }
}

@media (prefers-reduced-motion: no-preference) {
  .game__grid li { animation: card-in 520ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 75ms); }
  @keyframes card-in { from { opacity: 0; transform: translateY(28px) scale(0.85); } }
}
</style>
