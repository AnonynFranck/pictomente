<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number }>()
const percent = computed(() => Math.round(props.value * 100))
</script>

<template>
  <div
    class="meter"
    role="progressbar"
    aria-label="Confianza de la inferencia"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
  >
    <span class="meter__text">Confianza <strong>{{ percent }}%</strong></span>
    <span class="meter__track"><span class="meter__fill" :style="{ transform: `scaleX(${value})` }" /></span>
  </div>
</template>

<style scoped>
.meter { display: grid; gap: 0.35rem; min-width: 11rem; }
.meter__text { font-size: var(--text-sm); }
.meter__track {
  height: 14px; border: 2px solid var(--line); border-radius: 99px;
  background: var(--surface); overflow: hidden;
}
.meter__fill {
  display: block; height: 100%; width: 100%; background: var(--ok);
  transform-origin: left; transition: transform 600ms var(--ease-out-expo);
}
</style>
