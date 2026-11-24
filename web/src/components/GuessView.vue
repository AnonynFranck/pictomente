<script setup lang="ts">
import BigButton from './BigButton.vue'
import MascotGuide from './MascotGuide.vue'
import PictoCard from './PictoCard.vue'
import SoundToggle from './SoundToggle.vue'

defineProps<{ guess: string; guideText: string }>()
defineEmits<{ yes: []; no: [] }>()
</script>

<template>
  <section class="view guess" aria-label="¿Es esto lo que querías decir?">
    <header class="guess__head">
      <MascotGuide :text="guideText" mood="wow" :size="112" class="head__guide" />
      <SoundToggle />
    </header>

    <div class="guess__stage">
      <div class="guess__card">
        <PictoCard :key="guess" :picto-key="guess" :interactive="false" size="lg" />
      </div>
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
.guess { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto; }
.guess__head { display: flex; align-items: flex-start; gap: 0.8rem; }
.head__guide { flex: 1 1 0; min-width: 0; width: auto; }
.guess__stage { container: stage / size; display: grid; place-items: center; min-height: 0; }
/* la tarjeta crece hasta ocupar el espacio libre, sin pasarse */
.guess__card { height: min(100cqh, calc(100cqw / 0.86), 30rem); aspect-ratio: 0.86; padding-block: 0.4rem; }
.guess__actions { display: flex; justify-content: center; gap: clamp(0.8rem, 3vw, 1.4rem); }
.guess__actions :deep(.big) { flex: 1; max-width: 14rem; }

/* celular apaisado: tarjeta a la izquierda; Pico y botones a la derecha */
@media (min-aspect-ratio: 1/1) and (max-height: 520px) {
  .guess { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); grid-template-rows: 1fr auto auto 1fr; column-gap: 1.2rem; row-gap: 0.8rem; }
  .guess__head { grid-column: 2; grid-row: 2; }
  .guess__stage { grid-column: 1; grid-row: 1 / -1; }
  .guess__actions { grid-column: 2; grid-row: 3; }
  .guess__actions :deep(.big) { padding-inline: 0.8rem; font-size: var(--text-lg); }
}

@media (prefers-reduced-motion: no-preference) {
  .guess__card { animation: reveal 700ms var(--ease-bounce); }
  @keyframes reveal { from { opacity: 0; transform: scale(0.4) rotate(-12deg); } }
}
</style>
