<script setup lang="ts">
import BigButton from './BigButton.vue'
import MascotGuide from './MascotGuide.vue'
import PictoCard from './PictoCard.vue'
import SoundToggle from './SoundToggle.vue'

defineProps<{ guess: string; guideText: string }>()
defineEmits<{ yes: []; no: [] }>()
</script>

<template>
  <section class="guess" aria-label="¿Es esto lo que querías decir?">
    <div class="guess__top"><SoundToggle /></div>

    <MascotGuide :text="guideText" mood="wow" :size="112" />

    <div class="guess__card">
      <PictoCard :key="guess" :picto-key="guess" :interactive="false" size="lg" />
    </div>

    <div class="guess__actions">
      <BigButton size="lg" @click="$emit('yes')">
        <template #icon>
          <svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </template>
        ¡Sí!
      </BigButton>
      <BigButton variant="stop" size="lg" @click="$emit('no')">
        <template #icon>
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" /></svg>
        </template>
        No
      </BigButton>
    </div>
  </section>
</template>

<style scoped>
.guess { display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 1.4rem; padding-bottom: 3rem; }
.guess__top { justify-self: end; }
.guess__card { width: min(70vw, 20rem); }
.guess__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.4rem; width: 100%; }
.guess__actions :deep(.big) { min-width: min(100%, 14rem); }

@media (prefers-reduced-motion: no-preference) {
  .guess__card { animation: reveal 700ms var(--ease-bounce); }
  @keyframes reveal { from { opacity: 0; transform: scale(0.4) rotate(-12deg); } }
}
</style>
