<script setup lang="ts">
import BigButton from './BigButton.vue'
import ConfettiBurst from './ConfettiBurst.vue'
import MascotGuide from './MascotGuide.vue'
import PictoCard from './PictoCard.vue'
import SoundToggle from './SoundToggle.vue'

defineProps<{ resolved: boolean; guess: string; message: string; guideText: string }>()
defineEmits<{ again: [] }>()
</script>

<template>
  <section class="view done" aria-label="Resultado">
    <ConfettiBurst v-if="resolved" />

    <header class="done__head">
      <MascotGuide :text="guideText" :mood="resolved ? 'cheer' : 'happy'" :size="130" class="head__guide" />
      <SoundToggle />
    </header>

    <div class="done__stage">
      <div v-if="resolved" class="done__card">
        <PictoCard :picto-key="guess" :interactive="false" size="lg" />
      </div>
    </div>

    <aside class="adult" aria-label="Mensaje para el adulto">
      <p class="adult__title">Mensaje para el adulto</p>
      <p class="adult__text">{{ resolved ? message : 'No se pudo identificar lo que quería decir. Conviene preguntarle directamente.' }}</p>
    </aside>

    <BigButton class="done__again" size="lg" @click="$emit('again')">
      <template #icon>
        <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </template>
      ¡Otra vez!
    </BigButton>
  </section>
</template>

<style scoped>
.done { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto auto; justify-items: center; }
.done__head { width: 100%; display: flex; align-items: flex-start; gap: 0.8rem; }
.head__guide { flex: 1 1 0; min-width: 0; width: auto; }
.done__stage { container: stage / size; width: 100%; display: grid; place-items: center; min-height: 0; }
.done__card { height: min(100cqh, calc(100cqw / 0.86), 26rem); aspect-ratio: 0.86; padding-block: 0.4rem; }

/* el texto para el adulto usa una tipografía de lectura, más sobria */
.adult {
  width: min(100%, 36rem); padding: clamp(0.4rem, 1.4dvh, 1rem) 1.4rem;
  background: var(--white); border: 4px dashed var(--ink-soft); border-radius: var(--radius-sm);
  font-family: var(--font-body);
}
.adult__title { font-size: var(--text-sm); font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.06em; }
.adult__text { margin-top: 0.2rem; font-size: var(--text-md); font-weight: 700; }

/* celular apaisado: tarjeta a la izquierda; mensaje y botón a la derecha */
@media (min-aspect-ratio: 1/1) and (max-height: 520px) {
  .done { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); grid-template-rows: auto 1fr auto; column-gap: 1.2rem; justify-items: stretch; }
  .done__head { grid-column: 2; grid-row: 1; }
  .done__stage { grid-column: 1; grid-row: 1 / -1; }
  .adult { grid-column: 2; grid-row: 2; align-self: center; width: auto; }
  .done__again { grid-column: 2; grid-row: 3; justify-self: center; }
}

@media (prefers-reduced-motion: no-preference) {
  .done__card { animation: reveal 800ms var(--ease-bounce); }
  @keyframes reveal { from { opacity: 0; transform: scale(0.3) rotate(10deg); } }
}
</style>
