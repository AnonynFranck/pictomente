<script setup lang="ts">
import type { Mood } from '../lib/mood'

withDefaults(defineProps<{ mood?: Mood; size?: number }>(), { mood: 'happy', size: 180 })
</script>

<template>
  <svg
    class="pico"
    :class="[`pico--${mood}`]"
    :width="size"
    :height="size * 1.1"
    viewBox="0 0 200 220"
    role="img"
    aria-label="Pico, tu amigo guía"
  >
    <defs>
      <linearGradient id="pico-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="oklch(78% 0.15 285)" />
        <stop offset="1" stop-color="oklch(64% 0.2 285)" />
      </linearGradient>
    </defs>

    <ellipse cx="100" cy="204" rx="52" ry="8" fill="oklch(26% 0.06 270 / 0.18)" />

    <g class="pico__bob">
      <!-- antena con estrella -->
      <line x1="100" y1="40" x2="100" y2="20" stroke="oklch(26% 0.06 270)" stroke-width="5" stroke-linecap="round" />
      <polygon
        class="pico__star"
        points="100,-2 106,10 119,11 109,20 112,33 100,26 88,33 91,20 81,11 94,10"
        transform="translate(0 4)"
        fill="oklch(88% 0.17 92)"
        stroke="oklch(26% 0.06 270)"
        stroke-width="3.5"
        stroke-linejoin="round"
      />

      <!-- pies -->
      <ellipse cx="72" cy="184" rx="22" ry="12" fill="oklch(58% 0.2 285)" stroke="oklch(26% 0.06 270)" stroke-width="4.5" />
      <ellipse cx="128" cy="184" rx="22" ry="12" fill="oklch(58% 0.2 285)" stroke="oklch(26% 0.06 270)" stroke-width="4.5" />

      <!-- brazo izquierdo -->
      <path d="M36 122 Q10 128 14 152" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="20" stroke-linecap="round" />
      <path d="M36 122 Q10 128 14 152" fill="none" stroke="oklch(70% 0.17 285)" stroke-width="11" stroke-linecap="round" />

      <!-- brazo derecho (saluda) -->
      <g class="pico__arm">
        <path d="M164 122 Q192 112 188 84" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="20" stroke-linecap="round" />
        <path d="M164 122 Q192 112 188 84" fill="none" stroke="oklch(70% 0.17 285)" stroke-width="11" stroke-linecap="round" />
      </g>

      <!-- cuerpo -->
      <rect x="30" y="38" width="140" height="146" rx="58" fill="url(#pico-body)" stroke="oklch(26% 0.06 270)" stroke-width="5" />
      <ellipse cx="100" cy="148" rx="40" ry="26" fill="oklch(99% 0.01 95 / 0.3)" />
      <ellipse cx="62" cy="62" rx="14" ry="8" fill="oklch(99% 0.01 95 / 0.35)" transform="rotate(-30 62 62)" />

      <!-- mejillas -->
      <circle cx="54" cy="122" r="10" fill="oklch(80% 0.16 5 / 0.75)" />
      <circle cx="146" cy="122" r="10" fill="oklch(80% 0.16 5 / 0.75)" />

      <!-- ojos -->
      <g v-if="mood === 'cheer'" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="6" stroke-linecap="round">
        <path d="M60 98 Q76 78 92 98" />
        <path d="M108 98 Q124 78 140 98" />
      </g>
      <g v-else class="pico__eyes">
        <ellipse cx="76" cy="96" :rx="mood === 'wow' ? 20 : 17" :ry="mood === 'wow' ? 24 : 21" fill="oklch(99% 0.01 95)" stroke="oklch(26% 0.06 270)" stroke-width="4.5" />
        <ellipse cx="124" cy="96" :rx="mood === 'wow' ? 20 : 17" :ry="mood === 'wow' ? 24 : 21" fill="oklch(99% 0.01 95)" stroke="oklch(26% 0.06 270)" stroke-width="4.5" />
        <circle :cx="mood === 'think' ? 82 : 76" :cy="mood === 'think' ? 88 : 98" r="9" fill="oklch(26% 0.06 270)" />
        <circle :cx="mood === 'think' ? 130 : 124" :cy="mood === 'think' ? 88 : 98" r="9" fill="oklch(26% 0.06 270)" />
        <circle :cx="mood === 'think' ? 85 : 79" :cy="mood === 'think' ? 85 : 95" r="3" fill="white" />
        <circle :cx="mood === 'think' ? 133 : 127" :cy="mood === 'think' ? 85 : 95" r="3" fill="white" />
      </g>

      <!-- cejas -->
      <g v-if="mood === 'oops'" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="5" stroke-linecap="round">
        <path d="M60 66 L90 72" />
        <path d="M140 66 L110 72" />
      </g>
      <path v-if="mood === 'think'" d="M108 66 L140 62" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="5" stroke-linecap="round" />

      <!-- boca -->
      <path v-if="mood === 'happy'" d="M80 120 Q100 142 120 120" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="5.5" stroke-linecap="round" />
      <g v-else-if="mood === 'cheer'">
        <path d="M74 116 Q100 160 126 116 Z" fill="oklch(26% 0.06 270)" stroke="oklch(26% 0.06 270)" stroke-width="4" stroke-linejoin="round" />
        <path d="M86 138 Q100 128 114 138 Q100 150 86 138 Z" fill="oklch(72% 0.19 15)" />
      </g>
      <ellipse v-else-if="mood === 'wow'" cx="100" cy="132" rx="11" ry="14" fill="oklch(26% 0.06 270)" />
      <path v-else-if="mood === 'oops'" d="M84 134 Q100 120 116 134" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="5.5" stroke-linecap="round" />
      <path v-else d="M88 130 Q100 124 112 130" fill="none" stroke="oklch(26% 0.06 270)" stroke-width="5.5" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.pico { overflow: visible; flex: none; }
.pico__arm { transform-origin: 164px 122px; }
.pico__eyes { transform-origin: 100px 96px; }
.pico__star { transform-origin: 100px 20px; }

@media (prefers-reduced-motion: no-preference) {
  .pico__bob { animation: bob 2.6s ease-in-out infinite; transform-origin: 100px 190px; }
  .pico--happy .pico__arm, .pico--cheer .pico__arm { animation: wave 1.1s ease-in-out infinite; }
  .pico--cheer .pico__bob { animation: jump 0.7s var(--ease-bounce) infinite; }
  .pico__eyes { animation: blink 4.5s infinite; }
  .pico__star { animation: twinkle 1.8s ease-in-out infinite; }
  .pico--wow .pico__bob { animation: pop 0.5s var(--ease-bounce) 1, bob 2.6s ease-in-out 0.5s infinite; }

  @keyframes bob { 50% { transform: translateY(-6px); } }
  @keyframes wave { 50% { transform: rotate(-22deg); } }
  @keyframes jump { 50% { transform: translateY(-18px) scale(1.03, 0.97); } }
  @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
  @keyframes twinkle { 50% { transform: scale(1.18) rotate(8deg); } }
  @keyframes pop { from { transform: scale(0.85); } }
}
</style>
