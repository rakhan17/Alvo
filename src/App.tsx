import { useEffect, useState, useRef } from 'react';
import { ArenaHeader } from './components/ArenaHeader';
import { SetupPanel } from './components/SetupPanel';
import { ModeratorCard } from './components/ModeratorCard';
import { DebaterCard } from './components/DebaterCard';
import { ControlBar } from './components/ControlBar';
import { DebateArenaEngine } from './services/debateArenaEngine';
import { DebateConfig, DebateMessage, DebateStatus, ModeratorVerdict } from './types/debate';

const INITIAL_CONFIG: DebateConfig = {
  topic: "Is Artificial Intelligence a threat to human creativity?",
  rounds: 3,
  debaterA: {
    name: "Dr. Evelyn Vance (PRO)",
    stance: "PRO",
    model: "llama-3.3-70b-versatile",
    systemPrompt: "You are Dr. Evelyn Vance, a rationalist philosopher arguing PRO (Affirmative). You argue that AI democratizes toolmaking, amplifies human expression, and elevates creativity to unprecedented heights.",
    avatarColor: "#10b981"
  },
  debaterB: {
    name: "Marcus Thorne (CONTRA)",
    stance: "CONTRA",
    model: "mixtral-8x7b-32768",
    systemPrompt: "You are Marcus Thorne, a critical ethicist arguing CONTRA (Negative). You argue that AI devalues human craftsmanship, causes homogenization of art, and exploits human creative work.",
    avatarColor: "#f43f5e"
  },
  moderator: {
    name: "Justice Vanguard (REFEREE)",
    stance: "MODERATOR",
    model: "llama-3.3-70b-versatile",
    systemPrompt: "You are Justice Vanguard, an impartial AI Debate Moderator & Supreme Referee. Maintain an analytical, rigorous tone, identify logical fallacies, and judge arguments purely on coherence and evidence.",
    avatarColor: "#06b6d4"
  }
};

export function App() {
  const [config, setConfig] = useState<DebateConfig>(INITIAL_CONFIG);
  const [status, setStatus] = useState<DebateStatus>('IDLE');
  const [currentTurn, setCurrentTurn] = useState<'DEBATER_A' | 'DEBATER_B' | 'MODERATOR' | null>(null);
  const [activeRound, setActiveRound] = useState(1);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [verdict, setVerdict] = useState<ModeratorVerdict | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const engineRef = useRef<DebateArenaEngine | null>(null);

  useEffect(() => {
    engineRef.current = new DebateArenaEngine(config);

    const unsubscribe = engineRef.current.subscribe((state) => {
      setStatus(state.status);
      setCurrentTurn(state.currentTurn);
      setActiveRound(state.activeRound);
      setMessages(state.messages);
      setVerdict(state.verdict);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateConfig = (newConfig: DebateConfig) => {
    setConfig(newConfig);
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  };

  const handleStart = () => {
    setShowSetup(false);
    if (engineRef.current) {
      engineRef.current.startDebate();
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseDebate();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeDebate();
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.resetDebate();
    }
  };

  const introMsg = messages.find(m => m.turnType === 'INTRO');
  const verdictMsg = messages.find(m => m.turnType === 'VERDICT');

  return (
    <div className="min-h-screen w-screen bg-[#07080b] text-white flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Header */}
      <ArenaHeader
        status={status}
        activeRound={activeRound}
        maxRounds={config.rounds}
      />

      {/* 2. Main Arena View */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6 flex flex-col">
        
        {/* Setup Drawer Panel */}
        {showSetup && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-200">
            <SetupPanel
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onStartDebate={handleStart}
            />
          </div>
        )}

        {/* Topic Motion Banner */}
        <div className="bg-[#0f1118] border border-cyan-500/20 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              CURRENT ARENA DEBATE MOTION:
            </span>
            <h2 className="text-sm md:text-base font-extrabold text-white font-mono">
              "{config.topic}"
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1a1d28] hover:bg-[#232838] border border-cyan-500/30 text-xs font-mono text-cyan-300 transition"
            >
              {showSetup ? 'Hide Config' : 'Edit Motion & Models'}
            </button>
          </div>
        </div>

        {/* Top Center Moderator Card */}
        <ModeratorCard
          moderatorName={config.moderator.name}
          modelUsed={config.moderator.model}
          isActiveTurn={currentTurn === 'MODERATOR'}
          introMessage={introMsg}
          verdictMessage={verdictMsg}
          verdictData={verdict}
        />

        {/* Split-Screen Debaters Arena */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[450px]">
          {/* Debater A (PRO) */}
          <DebaterCard
            debater={config.debaterA}
            roleKey="DEBATER_A"
            isActiveTurn={currentTurn === 'DEBATER_A'}
            messages={messages}
          />

          {/* Debater B (CONTRA) */}
          <DebaterCard
            debater={config.debaterB}
            roleKey="DEBATER_B"
            isActiveTurn={currentTurn === 'DEBATER_B'}
            messages={messages}
          />
        </div>

      </main>

      {/* 3. Bottom Control Bar */}
      <ControlBar
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onToggleSetup={() => setShowSetup(!showSetup)}
        showSetup={showSetup}
      />

    </div>
  );
}

export default App;
