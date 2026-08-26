import { useEffect, useState } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { ConceptGenerator } from './components/ConceptGenerator';
import { SnippetGrid } from './components/SnippetGrid';
import { MasterSequencer } from './components/MasterSequencer';
import { TargetedCommandBar } from './components/TargetedCommandBar';
import { PatternSnippet, MasterArrangement, StudioState } from './types/music';
import { generateModularSnippetsBatch, modifyTargetSnippet } from './services/groqClient';
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
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
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

  const handleGenerateBatch = async (newConcept: string) => {
    setIsGenerating(true);
    setConcept(newConcept);

    const result = await generateModularSnippetsBatch(newConcept);
    setIsGenerating(false);

    if (result) {
      setBpm(result.bpm);
      setSnippets(result.snippets);
      setMaster(result.master);
    }
  };

  const handleModifyTargetSnippet = async (snippet: PatternSnippet, instruction: string) => {
    setIsGenerating(true);
    const updatedCode = await modifyTargetSnippet(snippet, instruction);
    setIsGenerating(false);

    if (updatedCode) {
      handleUpdateSnippetCode(snippet.id, updatedCode);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans overflow-x-hidden selection:bg-[#fafafa] selection:text-[#09090b]">
      
      {/* 1. Header & Transport Bar */}
      <StudioHeader
        concept={concept}
        isPlaying={isPlaying}
        bpm={bpm}
        snippetCount={snippets.length}
        onTogglePlay={handleTogglePlayMaster}
        onBpmChange={(newBpm) => setBpm(newBpm)}
        onOpenConceptModal={() => setIsConceptModalOpen(true)}
      />

      {/* 2. Main Studio Workspace Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6 flex flex-col">
        
        {/* Top Master Sequencer Stack Panel */}
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

      {/* 3. Concept Generator Modal */}
      <ConceptGenerator
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        isGenerating={isGenerating}
        onGenerateBatch={handleGenerateBatch}
      />

      {/* 4. Targeted AI Snippet Modifier Bar */}
      <TargetedCommandBar
        selectedSnippet={selectedSnippetToModify}
        onCloseSelected={() => setSelectedSnippetToModify(null)}
        onModifySnippet={handleModifyTargetSnippet}
      />

    </div>
  );
}

export default App;
