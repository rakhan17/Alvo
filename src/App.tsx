import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ResearchInput } from './components/ResearchInput';
import { SpiderWebGraph } from './components/SpiderWebGraph';
import { DebateFeed } from './components/DebateFeed';
import { KeyPoolModal } from './components/KeyPoolModal';
import { PersonaModal } from './components/PersonaModal';
import { ConsensusReportView } from './components/ConsensusReportView';
import { debateEngine, DebateNode, DebateLink, DebateEntry, FinalConsensusReport } from './services/debateEngine';
import { PersonaRole, PERSONAS_50 } from './data/personas';
import { Sparkles, Layers, ShieldCheck, Cpu, X, FileText } from 'lucide-react';

export function App() {
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState<string>('idle');
  const [activePersonas, setActivePersonas] = useState<PersonaRole[]>(PERSONAS_50.slice(0, 15));
  const [nodes, setNodes] = useState<DebateNode[]>([]);
  const [links, setLinks] = useState<DebateLink[]>([]);
  const [feed, setFeed] = useState<DebateEntry[]>([]);
  const [report, setReport] = useState<FinalConsensusReport | null>(null);

  // Modals state
  const [isKeysOpen, setIsKeysOpen] = useState(false);
  const [isPersonasOpen, setIsPersonasOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<DebateNode | null>(null);

  // Subscribe to debate engine
  useEffect(() => {
    const unsubscribe = debateEngine.subscribe((state) => {
      setTopic(state.topic);
      setPhase(state.phase);
      setActivePersonas(state.activePersonas);
      setNodes(state.nodes);
      setLinks(state.links);
      setFeed(state.feed);
      setReport(state.report);
    });
    return unsubscribe;
  }, []);

  const handleStartResearch = (researchTopic: string, councilSize: number) => {
    debateEngine.startResearchDebate(researchTopic, councilSize);
  };

  const handleStopDebate = () => {
    debateEngine.stopDebate();
  };

  return (
    <div className="min-h-screen bg-[#090b10] bg-cyber-grid text-gray-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        phase={phase}
        onOpenKeys={() => setIsKeysOpen(true)}
        onOpenPersonas={() => setIsPersonasOpen(true)}
        onStop={handleStopDebate}
        activeCount={activePersonas.length}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Research Input Bar */}
        <ResearchInput
          onStart={handleStartResearch}
          isBusy={phase !== 'idle' && phase !== 'completed'}
        />

        {/* Dynamic Multi-Agent Visualizer & Debate Stream Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Top: Interactive Spider-Web Graph (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-extrabold text-sm text-cyan-400 font-mono tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                INTERACTIVE 50-AI SPIDER-WEB GRAPH VISUALIZER
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                Nodes: {nodes.length} | Connections: {links.length}
              </span>
            </div>

            <SpiderWebGraph
              nodes={nodes}
              links={links}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </div>

          {/* Right / Bottom: Live Debate Stream Feed (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <DebateFeed
              entries={feed}
              isBusy={phase !== 'idle' && phase !== 'completed'}
            />
          </div>

        </div>

        {/* Synthesized Consensus Report Section */}
        {report && (
          <div id="consensus-report" className="pt-4 animate-in fade-in duration-500">
            <ConsensusReportView report={report} />
          </div>
        )}

      </main>

      {/* Modals */}
      <KeyPoolModal
        isOpen={isKeysOpen}
        onClose={() => setIsKeysOpen(false)}
      />

      <PersonaModal
        isOpen={isPersonasOpen}
        onClose={() => setIsPersonasOpen(false)}
        selectedPersonas={activePersonas}
      />

      {/* Persona Node Inspector Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#090b10] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-border bg-cyber-card/60">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedNode.persona.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedNode.persona.name}</h4>
                  <p className="text-xs text-cyan-300 font-mono">{selectedNode.persona.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-cyber-border/40 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="text-xs text-gray-300 bg-cyber-card/70 p-3 rounded-xl border border-cyber-border">
                <strong className="text-cyan-400 font-mono">Domain Bias:</strong> {selectedNode.persona.bias}
              </div>

              <div className="text-xs text-gray-300 bg-cyber-card/70 p-3 rounded-xl border border-cyber-border">
                <strong className="text-purple-400 font-mono">Debate Style:</strong> {selectedNode.persona.debateStyle}
              </div>

              {selectedNode.keyArguments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-mono font-bold text-gray-400 uppercase">Debate Contributions:</h5>
                  {selectedNode.keyArguments.map((arg, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#0f1420] border border-cyber-border/80 text-xs text-gray-200 leading-relaxed font-sans">
                      "{arg}"
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-cyber-card/60 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-1.5 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-xs font-semibold text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-cyber-border/60 bg-[#090b10]/90 py-4 px-4 text-center text-xs text-gray-500 font-mono">
        ALVO 2.0 • Powered by 50-AI Autonomous Council & Groq API Key Load Balancer
      </footer>

    </div>
  );
}
export default App;
