<template>
  <div class="scene" aria-hidden="true">
    <span class="scene__cloud scene__cloud--a" />
    <span class="scene__cloud scene__cloud--b" />
    <span class="scene__cloud scene__cloud--c" />
    <span class="scene__hill scene__hill--back" />
    <span class="scene__hill scene__hill--front" />
  </div>
</template>

<style scoped>
.scene { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }

.scene__cloud {
  position: absolute; width: 11rem; height: 3.4rem; background: var(--white);
  border-radius: 99px; opacity: 0.9;
}
.scene__cloud::before, .scene__cloud::after { content: ''; position: absolute; background: inherit; border-radius: 50%; }
.scene__cloud::before { width: 4.6rem; height: 4.6rem; left: 1.4rem; top: -2.2rem; }
.scene__cloud::after { width: 3.4rem; height: 3.4rem; right: 1.6rem; top: -1.5rem; }
.scene__cloud--a { top: 9%; left: -4rem; }
.scene__cloud--b { top: 22%; right: -3rem; scale: 0.75; }
.scene__cloud--c { top: 55%; left: 12%; scale: 0.55; opacity: 0.6; }

.scene__hill { position: absolute; left: -10%; right: -10%; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
.scene__hill--back { bottom: -9rem; height: 16rem; background: var(--hill-dark); }
.scene__hill--front { bottom: -11rem; height: 16rem; left: -30%; right: 25%; background: var(--hill); }

@media (prefers-reduced-motion: no-preference) {
  .scene__cloud--a { animation: drift 70s linear infinite alternate; }
  .scene__cloud--b { animation: drift 90s linear infinite alternate-reverse; }
  @keyframes drift { to { transform: translateX(14vw); } }
}
</style>
