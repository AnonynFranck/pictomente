<script setup lang="ts">
import { useSpeech } from '../composables/useSpeech'

const { muted, toggleMute, isSupported } = useSpeech()
</script>

<template>
  <button
    v-if="isSupported"
    class="sound"
    type="button"
    :aria-pressed="!muted"
    :aria-label="muted ? 'Encender el sonido' : 'Apagar el sonido'"
    @click="toggleMute"
  >
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <template v-if="!muted">
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </template>
      <path v-else d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
    </svg>
  </button>
</template>

<style scoped>
.sound {
  display: grid; place-items: center; width: var(--ctl); height: var(--ctl);
  background: var(--white); color: var(--ink);
  border: 5px solid var(--ink); border-radius: 50%;
  box-shadow: 0 5px 0 oklch(26% 0.06 270 / 0.3);
  cursor: pointer; transition: transform var(--duration-fast) var(--ease-bounce);
}
.sound[aria-pressed='false'] { background: var(--stop); }
.sound:hover { transform: scale(1.08) rotate(-4deg); }
.sound:active { transform: translateY(4px); box-shadow: none; }
</style>
