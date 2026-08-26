import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ResearchInput } from './components/ResearchInput';
import { SpiderWebGraph } from './components/SpiderWebGraph';
import { DebateFeed } from './components/DebateFeed';
import { KeyPoolModal } from './components/KeyPoolModal';
import { PersonaModal } from './components/PersonaModal';
import { ConsensusReportView } from './components/ConsensusReportView';

import { debateEngine, DebateMessage, ConsensusReport } from './services/debateEngine';
import { PERSONAS_150, PersonaRole } from './data/personas';

export function App() {
  const [isDebating, setIsDebating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [activePersonas, setActivePersonas] = useState<PersonaRole[]>(PERSONAS_150.slice(0, 50));
  const [report, setReport] = useState<ConsensusReport | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const [isKeyPoolOpen, setIsKeyPoolOpen] = useState(false);
  const [isPersonasOpen, setIsPersonasOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = debateEngine.subscribe((state) => {
      setIsDebating(state.isDebating);
      setCurrentPhase(state.currentPhase);
      setTopic(state.topic);
      setMessages(state.messages);
      setActivePersonas(state.activePersonas);
      setReport(state.report);
      setProgressPercent(state.progressPercent);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartDebate = (topicInput: string, councilSize: number) => {
    debateEngine.startDebate(topicInput, councilSize);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenKeyPool={() => setIsKeyPoolOpen(true)}
        onOpenPersonas={() => setIsPersonasOpen(true)}
        activeCount={activePersonas.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Research Input Bar */}
        <ResearchInput
          onStartDebate={handleStartDebate}
          isBusy={isDebating}
        />

        {/* Debate Progress Indicator Bar */}
        {isDebating && (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3.5 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold uppercase tracking-wider">{currentPhase}</span>
              <span className="text-neutral-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#262626]">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Dashboard Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Spider-Web Graph Visualizer */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider pl-1">
              Active Network Topology ({activePersonas.length} Roles)
            </h3>
            <SpiderWebGraph
              activePersonas={activePersonas}
              messages={messages}
            />
          </div>

          {/* Right Column: Live Debate Feed */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider pl-1">
              Live Stream & Cross-Examination Log
            </h3>
            <DebateFeed entries={messages} />
          </div>
        </div>

        {/* Master Consensus Report View */}
        {report && (
          <div className="pt-4">
            <ConsensusReportView report={report} />
          </div>
        )}

      </main>

      {/* Modals */}
      <KeyPoolModal
        isOpen={isKeyPoolOpen}
        onClose={() => setIsKeyPoolOpen(false)}
      />

      <PersonaModal
        isOpen={isPersonasOpen}
        onClose={() => setIsPersonasOpen(false)}
        selectedPersonas={activePersonas}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-[#262626] bg-[#0a0a0a] py-4 text-center text-xs text-neutral-500 font-mono">
        ALVO 2.0 • 150 Human Perspectives Edition • Powered by 13-Key Groq Engine
      </footer>

    </div>
  );
}

export default App;
