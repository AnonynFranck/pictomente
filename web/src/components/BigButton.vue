<script setup lang="ts">
withDefaults(
  defineProps<{ variant?: 'go' | 'stop' | 'sun'; size?: 'md' | 'lg' }>(),
  { variant: 'go', size: 'md' },
)
</script>

<template>
  <button class="big" :class="[`big--${variant}`, `big--${size}`]" type="button">
    <span v-if="$slots.icon" class="big__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="big__label"><slot /></span>
  </button>
</template>

<style scoped>
.big {
  --fill: var(--go); --edge-color: var(--go-edge);
  display: inline-flex; align-items: center; justify-content: center; gap: 0.7rem;
  min-height: 4.5rem; padding: 0.6rem 2rem;
  font-family: var(--font-display); font-weight: 700; font-size: var(--text-lg);
  color: var(--ink); letter-spacing: 0.01em;
  background: linear-gradient(180deg, color-mix(in oklch, var(--fill), white 28%) 0%, var(--fill) 55%);
  border: 5px solid var(--ink); border-bottom-width: calc(5px + var(--edge));
  border-radius: var(--radius-sm);
  box-shadow: inset 0 -6px 0 var(--edge-color), inset 0 5px 0 oklch(100% 0 0 / 0.45);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out-expo),
              border-bottom-width var(--duration-fast) var(--ease-out-expo),
              filter var(--duration-fast);
}
.big--sun { --fill: var(--sun); --edge-color: var(--sun-edge); }
.big--stop { --fill: var(--stop); --edge-color: var(--stop-edge); }
.big--lg { min-height: 6rem; padding-inline: 3rem; font-size: var(--text-xl); }

@media (max-width: 36rem) {
  .big { padding-inline: 1rem; gap: 0.4rem; }
  .big--lg { padding-inline: 1.6rem; }
}
.big:hover { transform: translateY(-3px); filter: brightness(1.05); }
.big:active { transform: translateY(var(--edge)); border-bottom-width: 5px; }
.big__icon { display: grid; place-items: center; width: 1.5em; height: 1.5em; }
.big__icon :deep(svg) { width: 100%; height: 100%; }
.big__label { text-shadow: 0 2px 0 oklch(100% 0 0 / 0.5); }
</style>
