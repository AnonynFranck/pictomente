// Imprime en JSON todas las frases que necesitan audio. Lo usa tools/generate_voices.py.
import { allVoiceLines } from '../src/data/voiceLines'

console.log(JSON.stringify(allVoiceLines()))
