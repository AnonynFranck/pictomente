<script setup lang="ts">
import { useSession } from './composables/useSession'
import GameView from './components/GameView.vue'
import ResultView from './components/ResultView.vue'
import StartView from './components/StartView.vue'

const session = useSession()
</script>

<template>
  <div class="shell">
    <a class="skip-link sr-only" href="#main">Saltar al contenido</a>

    <header class="topbar">
      <span class="brand" aria-label="Pictomente · Kallpa-Play AI">
        <span class="brand__dot" aria-hidden="true" />Pictomente
      </span>
      <span class="topbar__tag">Kallpa-Play AI</span>
    </header>

    <main id="main" class="main">
      <StartView v-if="session.phase.value === 'start'" @start="session.start" />
      <GameView
        v-else-if="session.phase.value === 'playing'"
        :pictos="session.pictos.value"
        :selected="session.selected.value"
        :round-number="session.roundNumber.value"
        :max-rounds="session.maxRounds"
        :confidence="session.topPrediction.value[1]"
        @toggle="session.toggle"
        @confirm="session.confirm"
        @skip="session.skip"
      />
      <ResultView
        v-else
        :message="session.message.value"
        :top-n="session.topN.value"
        @restart="session.start"
      />
    </main>

    <footer class="credits">
      Pictogramas: <a href="https://arasaac.org" target="_blank" rel="noopener noreferrer">ARASAAC</a>
      — Gobierno de Aragón (CC BY-NC-SA). Autor: Sergio Palao.
    </footer>
  </div>
</template>

<style scoped>
.shell { min-height: 100dvh; display: flex; flex-direction: column; width: min(100% - 2rem, 70rem); margin-inline: auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding-block: 1.2rem; border-bottom: 2px solid var(--line); }
.brand { display: inline-flex; align-items: center; gap: 0.6rem; font-family: var(--font-display); font-weight: 800; font-size: var(--text-lg); }
.brand__dot { width: 0.9rem; height: 0.9rem; border: 2px solid var(--line); border-radius: 50%; background: var(--cat-emociones); box-shadow: 0.55rem 0 0 -2px var(--cat-actividades); margin-right: 0.5rem; }
.topbar__tag { font-size: var(--text-sm); color: var(--ink-soft); }
.main { flex: 1; }
.credits { padding-block: 1.2rem; font-size: var(--text-sm); color: var(--ink-soft); border-top: 2px solid var(--line); }
.credits a { color: var(--action); font-weight: 700; }
.skip-link:focus { position: fixed; top: 0.5rem; left: 0.5rem; width: auto; height: auto; clip: auto; padding: 0.6rem 1rem; background: var(--ink); color: var(--paper); z-index: 10; }
</style>
