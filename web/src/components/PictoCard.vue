<script setup lang="ts">
import { computed, ref } from 'vue'
import { categoryOf, getLabel } from '../data/graph'
import { pictogramUrl } from '../data/pictograms'

const props = withDefaults(
  defineProps<{
    pictoKey: string
    selected?: boolean
    /** Si es false la tarjeta es solo visual (p. ej. en el resultado). */
    interactive?: boolean
    size?: 'md' | 'sm'
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
    @click="interactive && $emit('toggle', pictoKey)"
  >
    <span class="picto__art">
      <img
        v-if="src && !failed"
        :src="src"
        :alt="interactive ? '' : label"
        width="300"
        height="300"
        loading="lazy"
        decoding="async"
        @error="failed = true"
      />
      <span v-else class="picto__fallback" aria-hidden="true">{{ label.charAt(0) }}</span>
    </span>
    <span class="picto__label">{{ label }}</span>
    <span v-if="interactive" class="picto__check" aria-hidden="true">✓</span>
  </component>
</template>

<style scoped>
.picto {
  --tint: var(--cat-none);
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 0.7rem 0.7rem 0.9rem;
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-hard);
  text-align: center;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out-expo),
              box-shadow var(--duration-fast) var(--ease-out-expo),
              background-color var(--duration-normal);
}
div.picto { cursor: default; }
.picto--alimentacion { --tint: var(--cat-alimentacion); }
.picto--actividades { --tint: var(--cat-actividades); }
.picto--emociones { --tint: var(--cat-emociones); }
.picto--entorno { --tint: var(--cat-entorno); }

button.picto:hover { transform: translate(-2px, -2px) rotate(-0.6deg); box-shadow: var(--shadow-hard-lg); }
button.picto:active { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--line); }

.picto__art {
  display: grid; place-items: center; width: 100%; aspect-ratio: 1;
  background: var(--tint);
  border-radius: calc(var(--radius) - 6px);
  overflow: hidden;
}
.picto__art img { width: 86%; height: 86%; object-fit: contain; }
.picto__fallback { font-family: var(--font-display); font-weight: 800; font-size: 3.5rem; }
.picto__label { font-weight: 700; font-size: var(--text-sm); letter-spacing: 0.01em; }

.picto__check {
  position: absolute; top: -10px; right: -10px;
  display: grid; place-items: center;
  width: 32px; height: 32px;
  background: var(--ok); color: white; font-weight: 800;
  border: 2px solid var(--line); border-radius: 50%;
  transform: scale(0); transition: transform var(--duration-normal) var(--ease-out-expo);
}
.picto--selected { background: oklch(94% 0.07 155); box-shadow: var(--shadow-hard-lg); transform: translate(-2px, -2px); }
.picto--selected .picto__check { transform: scale(1); }

.picto--sm { padding: 0.4rem 0.4rem 0.55rem; box-shadow: 3px 3px 0 var(--line); }
/* en tamaño pequeño el nombre ya aparece junto a la tarjeta; el alt de la imagen lo conserva para lectores de pantalla */
.picto--sm .picto__label { display: none; }
</style>
