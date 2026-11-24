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
  <section class="done" aria-label="Resultado">
    <ConfettiBurst v-if="resolved" />
    <div class="done__top"><SoundToggle /></div>

    <MascotGuide :text="guideText" :mood="resolved ? 'cheer' : 'happy'" :size="130" stack />

    <div v-if="resolved" class="done__card">
      <PictoCard :picto-key="guess" :interactive="false" size="lg" />
    </div>

    <aside class="adult" aria-label="Mensaje para el adulto">
      <p class="adult__title">Mensaje para el adulto</p>
      <p class="adult__text">{{ resolved ? message : 'No se pudo identificar lo que quería decir. Conviene preguntarle directamente.' }}</p>
    </aside>

    <BigButton size="lg" @click="$emit('again')">
      <template #icon>
        <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </template>
      ¡Otra vez!
    </BigButton>
  </section>
</template>

<style scoped>
.done { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 1.4rem; padding-bottom: 3rem; }
.done__top { justify-self: end; }
.done__card { width: min(60vw, 17rem); }

/* el texto para el adulto usa una tipografía de lectura, más sobria */
.adult {
  width: min(100%, 36rem); padding: 1rem 1.4rem;
  background: var(--white); border: 4px dashed var(--ink-soft); border-radius: var(--radius-sm);
  font-family: var(--font-body);
}
.adult__title { font-size: var(--text-sm); font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.06em; }
.adult__text { margin-top: 0.3rem; font-size: var(--text-md); font-weight: 700; }

@media (prefers-reduced-motion: no-preference) {
  .done__card { animation: reveal 800ms var(--ease-bounce); }
  @keyframes reveal { from { opacity: 0; transform: scale(0.3) rotate(10deg); } }
}
</style>
