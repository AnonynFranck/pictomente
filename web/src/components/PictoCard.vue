<script setup lang="ts">
import { computed, ref } from 'vue'
import { categoryOf, getLabel } from '../data/graph'
import { pictogramUrl } from '../data/pictograms'

const props = withDefaults(
  defineProps<{
    pictoKey: string
    selected?: boolean
    /** Si es false la tarjeta es solo visual (p. ej. en la pantalla de inicio). */
    interactive?: boolean
    size?: 'md' | 'lg'
  }>(),
  { selected: false, interactive: true, size: 'md' },
)
defineEmits<{ toggle: [key: string] }>()

const failed = ref(false)
const src = computed(() => pictogramUrl(props.pictoKey))
const label = computed(() => getLabel(props.pictoKey))
const category = computed(() => categoryOf(props.pictoKey) ?? 'none')
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    class="picto"
    :class="[`picto--${category}`, `picto--${size}`, { 'picto--selected': selected }]"
    :type="interactive ? 'button' : undefined"
    :aria-pressed="interactive ? selected : undefined"
    :aria-label="interactive ? label : undefined"
    @click="interactive && $emit('toggle', pictoKey)"
  >
    <span class="picto__art">
      <img
        v-if="src && !failed"
        :src="src"
        :alt="interactive ? '' : label"
        width="300"
        height="300"
        decoding="async"
        @error="failed = true"
      />
      <span v-else class="picto__fallback" aria-hidden="true">{{ label.charAt(0) }}</span>
    </span>
    <span class="picto__label">{{ label }}</span>
    <span v-if="interactive" class="picto__badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
  </component>
</template>

<style scoped>
.picto {
  --fill: var(--c-none); --edge-color: var(--c-none-edge);
  position: relative; display: flex; flex-direction: column; align-items: center; gap: clamp(0.2rem, 0.8dvh, 0.5rem); min-width: 0; min-height: 0;
  width: 100%; height: 100%;
  padding: 0.6rem 0.6rem 0.8rem;
  background: var(--fill);
  border: 5px solid var(--ink); border-bottom-width: calc(5px + 8px);
  border-radius: var(--radius);
  box-shadow: inset 0 -6px 0 var(--edge-color), inset 0 4px 0 oklch(100% 0 0 / 0.4);
  text-align: center; cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out-expo),
              border-bottom-width var(--duration-fast) var(--ease-out-expo),
              filter var(--duration-fast);
}
div.picto { cursor: default; }
.picto--alimentacion { --fill: var(--c-alimentacion); --edge-color: var(--c-alimentacion-edge); }
.picto--actividades { --fill: var(--c-actividades); --edge-color: var(--c-actividades-edge); }
.picto--emociones { --fill: var(--c-emociones); --edge-color: var(--c-emociones-edge); }
.picto--entorno { --fill: var(--c-entorno); --edge-color: var(--c-entorno-edge); }
.picto--personas { --fill: var(--c-personas); --edge-color: var(--c-personas-edge); }
.picto--juguetes { --fill: var(--c-juguetes); --edge-color: var(--c-juguetes-edge); }

button.picto:hover { transform: translateY(-4px) rotate(-1deg); filter: brightness(1.05); }
button.picto:active { transform: translateY(8px); border-bottom-width: 5px; }

.picto__art {
  display: grid; place-items: center; width: 100%; flex: 1 1 0; min-height: 0;
  background: var(--white); border: 4px solid var(--ink); border-radius: calc(var(--radius) - 8px);
  overflow: hidden;
}
.picto__art img { width: 90%; height: 90%; object-fit: contain; min-height: 0; }
.picto__fallback { font-weight: 700; font-size: clamp(2rem, 8vmin, 4.5rem); color: var(--ink-soft); }
.picto__label {
  flex: none; max-width: 100%; overflow-wrap: anywhere; font-weight: 700; font-size: clamp(0.85rem, 0.5rem + 1.9vmin, 1.5rem); line-height: 1.1;
  text-shadow: 0 2px 0 oklch(100% 0 0 / 0.5);
}

.picto__badge {
  position: absolute; top: -16px; right: -12px;
  display: grid; place-items: center; width: 3.2rem; height: 3.2rem;
  background: var(--go); color: var(--ink); border: 5px solid var(--ink); border-radius: 50%;
  box-shadow: 0 4px 0 var(--go-edge);
  scale: 0; transition: scale var(--duration-normal) var(--ease-bounce);
}
.picto--selected { filter: brightness(1.04) saturate(1.15); outline: 6px solid var(--white); outline-offset: 2px; box-shadow: 0 0 0 12px oklch(100% 0 0 / 0.5), inset 0 -6px 0 var(--edge-color), inset 0 4px 0 oklch(100% 0 0 / 0.4); }
.picto--selected .picto__badge { scale: 1; }

@media (max-width: 36rem) {
  .picto { padding: 0.4rem 0.4rem 0.6rem; }
}
/* pantallas bajas: menos marco, más dibujo */
@media (max-height: 700px) {
  .picto { padding: 0.25rem 0.25rem 0.35rem; border-width: 4px; border-bottom-width: 9px; gap: 0.1rem; }
  .picto__art { border-width: 3px; }
  .picto__badge { width: 2.4rem; height: 2.4rem; border-width: 4px; top: -10px; right: -8px; }
}

.picto--lg { padding: 0.9rem 0.9rem 1.1rem; }
.picto--lg .picto__label { font-size: clamp(1.1rem, 0.6rem + 3vmin, 2.3rem); }

@media (prefers-reduced-motion: no-preference) {
  .picto--selected { animation: pop 460ms var(--ease-bounce); }
  @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.14) rotate(-2deg); } 100% { transform: scale(1); } }
}
</style>
