<script setup lang="ts">
defineProps<{ current: number; total: number }>()
</script>

<template>
  <div class="stars" role="img" :aria-label="`Ronda ${current} de ${total}`">
    <svg
      v-for="n in total"
      :key="n"
      class="stars__star"
      :class="{ 'stars__star--done': n < current, 'stars__star--now': n === current }"
      viewBox="0 0 40 40"
      width="46"
      height="46"
      aria-hidden="true"
    >
      <polygon
        points="20,3 25,14 37,15 28,23 31,35 20,29 9,35 12,23 3,15 15,14"
        stroke-width="3.5"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.stars { display: flex; gap: 0.1rem; }
.stars__star { width: clamp(24px, min(9.5vw, 5dvh), 46px); height: auto; }
.stars__star { stroke: var(--ink); fill: oklch(99% 0.01 95 / 0.7); }
.stars__star--done { fill: var(--sun); }
.stars__star--now { fill: var(--white); transform-origin: center; }

@media (prefers-reduced-motion: no-preference) {
  .stars__star--now { animation: pulse 1.2s ease-in-out infinite; }
  .stars__star--done { animation: earn 600ms var(--ease-bounce); }
  @keyframes pulse { 50% { transform: scale(1.18); } }
  @keyframes earn { from { transform: scale(0.4) rotate(-40deg); } }
}
</style>
