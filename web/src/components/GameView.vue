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
  <section class="game" aria-label="Elige los dibujos">
    <header class="game__bar">
      <StarProgress :current="roundNumber" :total="maxRounds" class="game__stars" />
      <MascotGuide :text="guideText" :mood="roundNumber === 1 ? 'happy' : 'think'" :size="112" class="game__guide" />
      <div class="game__tools">
        <button class="game__home" type="button" aria-label="Volver al inicio" @click="$emit('home')">
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
            <path d="M3.5 11.5L12 4l8.5 7.5M6 10v9h12v-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <SoundToggle />
      </div>
    </header>

    <ul :key="roundNumber" class="game__grid">
      <li v-for="(key, i) in pictos" :key="key" :style="{ '--i': i }">
        <PictoCard :picto-key="key" :selected="selected.has(key)" @toggle="$emit('toggle', $event)" />
      </li>
    </ul>

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
.game { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.1rem; padding-bottom: 7.5rem; }
.game__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem 1rem; }
.game__stars { order: 1; }
.game__tools { order: 2; margin-left: auto; }
.game__guide { order: 3; flex: 1 1 100%; }

/* pantallas anchas: estrellas, Pico y controles comparten una fila y ganan altura las tarjetas */
@media (min-width: 52rem) {
  .game__bar { flex-wrap: nowrap; }
  .game__stars { order: 1; }
  .game__guide { order: 2; flex: 1 1 auto; min-width: 0; }
  .game__tools { order: 3; margin-left: 0; }
}
.game__tools { display: flex; gap: 0.7rem; }
.game__home {
  display: grid; place-items: center; width: 4rem; height: 4rem;
  background: var(--white); color: var(--ink); border: 5px solid var(--ink); border-radius: 50%;
  box-shadow: 0 5px 0 oklch(26% 0.06 270 / 0.3); cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.game__home:hover { transform: scale(1.08) rotate(4deg); }
.game__home:active { transform: translateY(4px); box-shadow: none; }

.game__grid {
  list-style: none; margin: 0.8rem 0 0; padding: 0 0.6rem;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(0.8rem, 0.4rem + 2vw, 1.6rem);
  width: min(100%, 52rem, max(28rem, calc(150dvh - 36rem))); justify-self: center;
}

/* barra de acciones siempre a mano, pegada abajo */
.game__actions {
  position: fixed; inset: auto 0 0 0; z-index: 4;
  display: flex; justify-content: center; gap: 1.2rem;
  padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, oklch(100% 0 0 / 0.55) 40%);
}
.game__actions :deep(.big) { flex: 1; max-width: 18rem; }
.game__count {
  display: inline-grid; place-items: center; min-width: 1.9em; height: 1.9em; margin-left: 0.3rem;
  background: var(--white); border: 4px solid var(--ink); border-radius: 50%; font-size: 0.7em;
}

@media (prefers-reduced-motion: no-preference) {
  .game__grid li { animation: card-in 520ms var(--ease-bounce) backwards; animation-delay: calc(var(--i) * 75ms); }
  @keyframes card-in { from { opacity: 0; transform: translateY(28px) scale(0.85); } }
}
@media (max-width: 36rem) {
  .game__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding-inline: 0.2rem; width: 100%; }
  .game__home { width: 3.4rem; height: 3.4rem; }
  .game__tools { gap: 0.5rem; }
}
</style>
