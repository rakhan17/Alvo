import { PatternSnippet, MasterArrangement } from '../types/music';
import { webAudioSynth } from './webAudioSynth';

export class StrudelEngine {
  public static buildMasterStackCode(snippets: PatternSnippet[]): string {
    const activeCodes = snippets
      .filter(s => s.isActive)
      .map(s => s.strudelCode.trim());

    if (activeCodes.length === 0) return 's("bd sd")';
    if (activeCodes.length === 1) return activeCodes[0];

    return `stack(\n  ${activeCodes.join(',\n  ')}\n)`;
  }

  public static playSnippetSolo(snippet: PatternSnippet, bpm: number) {
    webAudioSynth.startPlayback(snippet.strudelCode, bpm);
  }

  public static playMasterComposition(masterCode: string, bpm: number) {
    webAudioSynth.startPlayback(masterCode, bpm);
  }

  public static stopPlayback() {
    webAudioSynth.stopPlayback();
  }
}
