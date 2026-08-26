export type SnippetCategory = 'drums' | 'bass' | 'synth' | 'pads' | 'percussion';

export interface PatternSnippet {
  id: string;
  filename: string; // e.g. "drums/kick_basic.strudel"
  category: SnippetCategory;
  title: string;
  strudelCode: string; // e.g. 's("bd sd [~ bd] sd")'
  isActive: boolean;
  bpm: number;
  tags: string[];
}

export interface MasterArrangement {
  id: string;
  filename: string; // "main.strudel"
  title: string;
  strudelCode: string; // e.g. 'stack(s("bd sd"), n("c2 e2").s("sawtooth"))'
  activeSnippetIds: string[];
  bpm: number;
}

export interface StudioState {
  globalConcept: string;
  snippets: PatternSnippet[];
  master: MasterArrangement;
  isPlaying: boolean;
  bpm: number;
  isGenerating: boolean;
  activeEditingSnippetId: string | null;
}
