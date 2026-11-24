import { describe, expect, it } from 'vitest'
import manifest from '../src/data/voice-manifest.json'
import { allVoiceLines } from '../src/data/voiceLines'
import { LEAF_NODES, getLabel } from '../src/data/graph'
import { guessQuestion, pickReaction, roundPrompt, PHRASES } from '../src/data/phrases'

/** Archivos mp3 que existen de verdad en public/audio (solo sus nombres). */
const audioFiles = new Set(
  Object.keys(import.meta.glob('../public/audio/*.mp3', { query: '?url' })).map((path) => path.split('/').pop() as string),
)
const clips = manifest as Record<string, string>

describe('voice lines', () => {
  it('has a pre-recorded audio file for every phrase Pico can say', () => {
    const missing = allVoiceLines().filter((line) => !clips[line] || !audioFiles.has(clips[line] as string))
    expect(missing, `Frases sin audio: regenera con tools/generate_voices.py`).toEqual([])
  })

  it('has no orphan audio files', () => {
    const used = new Set(allVoiceLines().map((l) => clips[l]))
    const orphans = [...audioFiles].filter((f) => !used.has(f))
    expect(orphans).toEqual([])
  })

  it('covers what the game actually says at runtime', () => {
    const lines = new Set(allVoiceLines())
    for (const leaf of LEAF_NODES) {
      expect(lines.has(pickReaction(leaf)), leaf).toBe(true)
      expect(lines.has(getLabel(leaf))).toBe(true)
      expect(lines.has(guessQuestion(leaf))).toBe(true)
    }
    for (let round = 0; round < 6; round++) {
      expect(lines.has(roundPrompt(round))).toBe(true)
      expect(lines.has(`${PHRASES.rejected} ${roundPrompt(round)}`)).toBe(true)
    }
    for (const phrase of Object.values(PHRASES)) expect(lines.has(phrase)).toBe(true)
  })
})
