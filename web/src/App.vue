<script setup lang="ts">
import { computed } from 'vue'
import { useSession } from './composables/useSession'
import DoneView from './components/DoneView.vue'
import GameView from './components/GameView.vue'
import GuessView from './components/GuessView.vue'
import SceneBackdrop from './components/SceneBackdrop.vue'
import StartView from './components/StartView.vue'
import { useSpeech } from './composables/useSpeech'

const session = useSession()
const { speak } = useSpeech()
const phase = computed(() => session.phase.value)

function goHome() {
  session.phase.value = 'start'
  speak('')
}
</script>

<template>
  <SceneBackdrop />
  <a class="skip-link sr-only" href="#main">Saltar al contenido</a>

  <main id="main" class="shell" :class="{ 'shell--wide': phase === 'start' }">
    <Transition name="view" mode="out-in">
      <StartView v-if="phase === 'start'" key="start" @start="session.start" />
      <GameView
        v-else-if="phase === 'playing'"
        key="game"
        :pictos="session.pictos.value"
        :selected="session.selected.value"
        :round-number="session.roundNumber.value"
        :max-rounds="session.maxRounds"
        :guide-text="session.guideText.value"
        @toggle="session.toggle"
        @confirm="session.confirm"
        @skip="session.skip"
        @home="goHome"
      />
      <GuessView
        v-else-if="phase === 'guess'"
        key="guess"
        :guess="session.guess.value"
        :guide-text="session.guideText.value"
        @yes="session.acceptGuess"
        @no="session.rejectCurrentGuess"
      />
      <DoneView
        v-else
        key="done"
        :resolved="session.resolved.value"
        :guess="session.guess.value"
        :message="session.message.value"
        :guide-text="session.guideText.value"
        @again="session.start"
      />
    </Transition>
  </main>
</template>

<style scoped>
.shell {
  position: relative; z-index: 1; height: 100dvh; overflow: hidden;
  display: flex; flex-direction: column;
  width: min(100% - clamp(1rem, 4vw, 3rem), 62rem); margin-inline: auto;
  padding-block: clamp(0.5rem, 1.8dvh, 1.2rem);
}
.shell--wide { width: min(100% - clamp(1rem, 4vw, 3rem), 76rem); }
.skip-link:focus { position: fixed; top: 0.5rem; left: 0.5rem; width: auto; height: auto; clip: auto; padding: 0.8rem 1.2rem; background: var(--ink); color: var(--white); z-index: 10; border-radius: 12px; }

.view-enter-active, .view-leave-active { transition: opacity var(--duration-normal) var(--ease-out-expo), transform var(--duration-normal) var(--ease-out-expo); }
.view-enter-from { opacity: 0; transform: translateY(24px) scale(0.98); }
.view-leave-to { opacity: 0; transform: translateY(-16px); }
</style>
