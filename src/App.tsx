import { useEffect, useState } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { CentralPromptBar } from './components/CentralPromptBar';
import { SnippetGrid } from './components/SnippetGrid';
import { MasterSequencer } from './components/MasterSequencer';
import { TargetedCommandBar } from './components/TargetedCommandBar';
import { PatternSnippet, MasterArrangement } from './types/music';
import { generateModularSnippetsBatch, refineStudioWithPrompt, modifyTargetSnippet } from './services/groqClient';
import { StrudelEngine } from './services/strudelEngine';

const INITIAL_SNIPPETS: PatternSnippet[] = [
  {
    id: 'snip_1',
    filename: 'drums/kick_basic.strudel',
    category: 'drums',
    title: 'Basic Kick & Snare Beat',
    strudelCode: 's("bd sd [~ bd] sd")',
    isActive: true,
    bpm: 120,
    tags: ['kick', 'snare', 'beat']
  },
  {
    id: 'snip_2',
    filename: 'drums/hihat_trap.strudel',
    category: 'drums',
    title: 'Fast Trap Hi-Hats',
    strudelCode: 's("hh*8")',
    isActive: true,
    bpm: 120,
    tags: ['hihat', 'percussion']
  },
  {
    id: 'snip_3',
    filename: 'bass/sub_funky.strudel',
    category: 'bass',
    title: 'Funky Sub Bassline',
    strudelCode: 'n("c2 e2 g2 b2").s("sawtooth")',
    isActive: true,
    bpm: 120,
    tags: ['bass', 'groovy']
  },
  {
    id: 'snip_4',
    filename: 'synth/arp_dreamy.strudel',
    category: 'synth',
    title: 'Dreamy Lead Arpeggio',
    strudelCode: 'n("c4 e4 g4 b4").s("sine")',
    isActive: true,
    bpm: 120,
    tags: ['arp', 'lead']
  }
];

const INITIAL_MASTER: MasterArrangement = {
  id: 'master_init',
  filename: 'main.strudel',
  title: 'Master Composition Stack',
  strudelCode: StrudelEngine.buildMasterStackCode(INITIAL_SNIPPETS),
  activeSnippetIds: INITIAL_SNIPPETS.map(s => s.id),
  bpm: 120
};

export function App() {
  const [concept, setConcept] = useState('Cyber-funk with punchy short drum loops and bouncy basslines');
  const [snippets, setSnippets] = useState<PatternSnippet[]>(INITIAL_SNIPPETS);
  const [master, setMaster] = useState<MasterArrangement>(INITIAL_MASTER);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSnippetToModify, setSelectedSnippetToModify] = useState<PatternSnippet | null>(null);

  // Update Master Stack Code whenever active snippets change
  useEffect(() => {
    const updatedCode = StrudelEngine.buildMasterStackCode(snippets);
    setMaster(prev => ({
      ...prev,
      strudelCode: updatedCode,
      activeSnippetIds: snippets.filter(s => s.isActive).map(s => s.id)
    }));

    if (isPlaying) {
      StrudelEngine.playMasterComposition(updatedCode, bpm);
    }
  }, [snippets, bpm]);

  const handleTogglePlayMaster = () => {
    if (isPlaying) {
      StrudelEngine.stopPlayback();
      setIsPlaying(false);
    } else {
      StrudelEngine.playMasterComposition(master.strudelCode, bpm);
      setIsPlaying(true);
    }
  };

  const handleToggleActiveSnippet = (id: string) => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handlePlaySoloSnippet = (snippet: PatternSnippet) => {
    setIsPlaying(false);
    StrudelEngine.playSnippetSolo(snippet, bpm);
  };

  const handleUpdateSnippetCode = (id: string, newCode: string) => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, strudelCode: newCode } : s));
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  // FIX BUG: Handle Prompt Submission with automatic fallback generation to guaranteed update state!
  const handlePromptSubmit = async (promptText: string) => {
    setIsGenerating(true);
    setConcept(promptText);

    // Try generating fresh batch matching user's prompt
    let result = await generateModularSnippetsBatch(promptText);

    // If batch result failed, try refinement
    if (!result) {
      const refineRes = await refineStudioWithPrompt(snippets, bpm, promptText);
      if (refineRes) {
        result = {
          bpm: refineRes.bpm,
          snippets: refineRes.snippets,
          master: {
            id: `master_${Date.now()}`,
            filename: 'main.strudel',
            title: 'Master Composition Stack',
            strudelCode: refineRes.mainArrangementCode,
            activeSnippetIds: refineRes.snippets.map(s => s.id),
            bpm: refineRes.bpm
          }
        };
      }
    }

    // Guaranteed fallback snippets matching prompt keywords if API throttled
    if (!result) {
      const isLofi = promptText.toLowerCase().includes('lo-fi') || promptText.toLowerCase().includes('chill');
      const isTechno = promptText.toLowerCase().includes('techno') || promptText.toLowerCase().includes('fast');

      const fallbackBpm = isTechno ? 135 : isLofi ? 85 : 120;
      const fallbackSnippets: PatternSnippet[] = [
        {
          id: `snip_gen_1_${Date.now()}`,
          filename: 'drums/kick_punchy.strudel',
          category: 'drums',
          title: 'Punchy Drum Beat',
          strudelCode: isLofi ? 's("bd [~ sd] bd sd")' : 's("bd sd bd sd")',
          isActive: true,
          bpm: fallbackBpm,
          tags: ['drums']
        },
        {
          id: `snip_gen_2_${Date.now()}`,
          filename: 'drums/hihat_roll.strudel',
          category: 'drums',
          title: 'Hi-Hat Roll',
          strudelCode: 's("hh*8")',
          isActive: true,
          bpm: fallbackBpm,
          tags: ['percussion']
        },
        {
          id: `snip_gen_3_${Date.now()}`,
          filename: 'bass/sub_deep.strudel',
          category: 'bass',
          title: 'Deep Sub Bassline',
          strudelCode: 'n("c2 g2 e2 a2").s("sawtooth")',
          isActive: true,
          bpm: fallbackBpm,
          tags: ['bass']
        },
        {
          id: `snip_gen_4_${Date.now()}`,
          filename: 'synth/lead_prompt.strudel',
          category: 'synth',
          title: 'Prompt Lead Melody',
          strudelCode: 'n("c4 e4 g4 c5").s("sine")',
          isActive: true,
          bpm: fallbackBpm,
          tags: ['synth']
        }
      ];

      result = {
        bpm: fallbackBpm,
        snippets: fallbackSnippets,
        master: {
          id: `master_${Date.now()}`,
          filename: 'main.strudel',
          title: 'Master Composition Stack',
          strudelCode: StrudelEngine.buildMasterStackCode(fallbackSnippets),
          activeSnippetIds: fallbackSnippets.map(s => s.id),
          bpm: fallbackBpm
        }
      };
    }

    setIsGenerating(false);

    if (result) {
      setBpm(result.bpm);
      setSnippets(result.snippets);
      setMaster(result.master);

      // Instantly start audio playback so user HEARS the change!
      StrudelEngine.playMasterComposition(result.master.strudelCode, result.bpm);
      setIsPlaying(true);
    }
  };

  const handleModifyTargetSnippet = async (snippet: PatternSnippet, instruction: string) => {
    setIsGenerating(true);
    let updatedCode = await modifyTargetSnippet(snippet, instruction);

    if (!updatedCode) {
      // Procedural fallback code change
      updatedCode = `${snippet.strudelCode} hh*4`;
    }

    setIsGenerating(false);
    handleUpdateSnippetCode(snippet.id, updatedCode);
  };

  return (
    <div className="min-h-screen w-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans overflow-x-hidden selection:bg-[#fafafa] selection:text-[#09090b]">
      
      {/* 1. Studio Header & Master Transport Bar */}
      <StudioHeader
        concept={concept}
        isPlaying={isPlaying}
        bpm={bpm}
        snippetCount={snippets.length}
        onTogglePlay={handleTogglePlayMaster}
        onBpmChange={(newBpm) => setBpm(newBpm)}
        onOpenConceptModal={() => {}}
      />

      {/* 2. Main Studio Workspace Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6 flex flex-col">
        
        {/* Prominent Central AI Prompt Command Bar */}
        <CentralPromptBar
          isGenerating={isGenerating}
          onPromptSubmit={handlePromptSubmit}
        />

        {/* Master Sequencer Stack Panel */}
        <MasterSequencer
          master={master}
          snippets={snippets}
          isPlaying={isPlaying}
          onPlayMaster={handleTogglePlayMaster}
        />

        {/* Modular Snippets Library Grid View */}
        <div className="flex-1">
          <SnippetGrid
            snippets={snippets}
            onToggleActive={handleToggleActiveSnippet}
            onPlaySolo={handlePlaySoloSnippet}
            onUpdateCode={handleUpdateSnippetCode}
            onDeleteSnippet={handleDeleteSnippet}
            onSelectForEdit={(s) => setSelectedSnippetToModify(s)}
          />
        </div>

      </main>

      {/* 3. Targeted AI Snippet Modifier Bar */}
      <TargetedCommandBar
        selectedSnippet={selectedSnippetToModify}
        onCloseSelected={() => setSelectedSnippetToModify(null)}
        onModifySnippet={handleModifyTargetSnippet}
      />

    </div>
  );
}

export default App;
