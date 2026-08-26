import React, { useState } from 'react';
import { DebateConfig, GroqModelId } from '../types/debate';
import { GROQ_MODELS } from '../services/groqClient';
import { Sliders, Sparkles, Cpu, Check, HelpCircle } from 'lucide-react';

interface SetupPanelProps {
  config: DebateConfig;
  onUpdateConfig: (newConfig: DebateConfig) => void;
  onStartDebate: () => void;
}

const PRESET_MOTIONS = [
  "Is Artificial Intelligence a threat to human creativity?",
  "Should Universal Basic Income (UBI) be implemented globally?",
  "Is Space Exploration worth the massive financial cost?",
  "Will autonomous AI agents make traditional software coding obsolete by 2030?"
];

export const SetupPanel: React.FC<SetupPanelProps> = ({
  config,
  onUpdateConfig,
  onStartDebate
}) => {
  const [topic, setTopic] = useState(config.topic);
  const [rounds, setRounds] = useState(config.rounds);

  const [debaterAModel, setDebaterAModel] = useState<GroqModelId>(config.debaterA.model);
  const [debaterAName, setDebaterAName] = useState(config.debaterA.name);
  const [debaterAPrompt, setDebaterAPrompt] = useState(config.debaterA.systemPrompt);

  const [debaterBModel, setDebaterBModel] = useState<GroqModelId>(config.debaterB.model);
  const [debaterBName, setDebaterBName] = useState(config.debaterB.name);
  const [debaterBPrompt, setDebaterBPrompt] = useState(config.debaterB.systemPrompt);

  const [moderatorModel, setModeratorModel] = useState<GroqModelId>(config.moderator.model);
  const [moderatorName, setModeratorName] = useState(config.moderator.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onUpdateConfig({
      topic: topic.trim(),
      rounds,
      debaterA: {
        ...config.debaterA,
        name: debaterAName.trim(),
        model: debaterAModel,
        systemPrompt: debaterAPrompt.trim()
      },
      debaterB: {
        ...config.debaterB,
        name: debaterBName.trim(),
        model: debaterBModel,
        systemPrompt: debaterBPrompt.trim()
      },
      moderator: {
        ...config.moderator,
        name: moderatorName.trim(),
        model: moderatorModel
      }
    });

    onStartDebate();
  };

  return (
    <div className="bg-[#101217] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-6">
      
      {/* Panel Title Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sliders className="w-5 h-5" />
          <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
            ARENA SETUP & ARENA CONFIGURATION
          </h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">
          Configure Models, Roles & Motion
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Motion / Topic Input */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-cyan-400 uppercase">
            Debate Motion / Topic Statement:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Is Artificial Intelligence a threat to human creativity?"
            className="w-full bg-[#181a22] border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 font-sans shadow-inner"
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-mono text-neutral-500 self-center">Presets:</span>
            {PRESET_MOTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(preset)}
                className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-[#181a22] hover:bg-cyan-950/60 border border-neutral-800 hover:border-cyan-500/40 text-neutral-300 transition"
              >
                {preset.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* 2. Debater Roles Configuration (Split 2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Debater A (PRO) */}
          <div className="bg-[#14161f] border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                Debater A (PRO Stance)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">Name / Title:</label>
              <input
                type="text"
                value={debaterAName}
                onChange={(e) => setDebaterAName(e.target.value)}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">Groq Model Assignment:</label>
              <select
                value={debaterAModel}
                onChange={(e) => setDebaterAModel(e.target.value as GroqModelId)}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">System Instructions / Persona:</label>
              <textarea
                value={debaterAPrompt}
                onChange={(e) => setDebaterAPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-400 font-sans"
              />
            </div>
          </div>

          {/* Debater B (CONTRA) */}
          <div className="bg-[#14161f] border border-rose-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                Debater B (CONTRA Stance)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">Name / Title:</label>
              <input
                type="text"
                value={debaterBName}
                onChange={(e) => setDebaterBName(e.target.value)}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">Groq Model Assignment:</label>
              <select
                value={debaterBModel}
                onChange={(e) => setDebaterBModel(e.target.value as GroqModelId)}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-rose-300 focus:outline-none focus:border-rose-400 font-mono"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">System Instructions / Persona:</label>
              <textarea
                value={debaterBPrompt}
                onChange={(e) => setDebaterBPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-rose-400 font-sans"
              />
            </div>
          </div>

        </div>

        {/* 3. Moderator & Rounds Selector */}
        <div className="bg-[#14161f] border border-cyan-500/20 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-cyan-400 uppercase mb-1">
              Moderator Groq Model:
            </label>
            <select
              value={moderatorModel}
              onChange={(e) => setModeratorModel(e.target.value as GroqModelId)}
              className="w-full bg-[#1b1e2b] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
            >
              {GROQ_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-cyan-400 uppercase mb-1">
              Number of Debate Rounds: {rounds}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black font-mono text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.4)] transition transform hover:scale-[1.01]"
        >
          🚀 START ARENA DEBATE NOW
        </button>

      </form>
    </div>
  );
};
