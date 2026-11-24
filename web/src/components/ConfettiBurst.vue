<script setup lang="ts">
const COLORS = ['--c-alimentacion', '--c-actividades', '--c-emociones', '--c-entorno', '--c-personas', '--c-juguetes']
const PIECES = 36

/** Posiciones deterministas (sin Math.random) para que el render sea estable. */
const pieces = Array.from({ length: PIECES }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${((i * 53) % 90) / 100}s`,
  duration: `${2.4 + ((i * 29) % 16) / 10}s`,
  drift: `${((i * 17) % 120) - 60}px`,
  spin: `${((i * 71) % 720) - 360}deg`,
  color: `var(${COLORS[i % COLORS.length]})`,
  round: i % 3 === 0,
}))
</script>

<template>
  <div class="confetti" aria-hidden="true">
    <span
      v-for="(p, i) in pieces"
      :key="i"
      class="confetti__piece"
      :class="{ 'confetti__piece--round': p.round }"
      :style="{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, background: p.color, '--drift': p.drift, '--spin': p.spin }"
    />
  </div>
</template>

<style scoped>
.confetti { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 5; }
.confetti__piece {
  position: absolute; top: -24px; width: 16px; height: 24px;
  border: 3px solid var(--ink); border-radius: 4px; opacity: 0;
}
.confetti__piece--round { width: 18px; height: 18px; border-radius: 50%; }

@media (prefers-reduced-motion: no-preference) {
  .confetti__piece { animation-name: fall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
  @keyframes fall {
    0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
    100% { opacity: 1; transform: translate3d(var(--drift), 108vh, 0) rotate(var(--spin)); }
  }
}
</style>
