import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// base relativa: funciona igual en https://<usuario>.github.io/<repo>/ y en local.
export default defineConfig({
  base: './',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/env.d.ts'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
})
