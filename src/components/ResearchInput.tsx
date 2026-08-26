import React, { useState } from 'react';
import { Search, Sparkles, Sliders, Zap, Shield, Globe, Terminal } from 'lucide-react';

interface ResearchInputProps {
  onStart: (topic: string, councilSize: number) => void;
  isBusy: boolean;
}

const PRESET_TOPICS = [
  {
    label: "🌐 Open-Source AGI Governance",
    query: "Should AGI weights and foundational frontier models be open-sourced globally, or restricted by international regulatory treaties?"
  },
  {
    label: "💰 UBI & Labor Disruption",
    query: "Is Universal Basic Income (UBI) economically sustainable and sufficient when 40%+ of knowledge work becomes automated?"
  },
  {
    label: "🛡️ Decentralized vs Centralized AI",
    query: "Will decentralized peer-to-peer AI compute networks defeat centralized tech monopolies in technical performance and privacy?"
  },
  {
    label: "🤖 Autonomous Arms Control",
    query: "Should lethal autonomous weapon systems (LAWS) be completely banned under international humanitarian laws?"
  }
];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onStart, isBusy }) => {
  const [topic, setTopic] = useState('');
  const [councilSize, setCouncilSize] = useState<number>(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isBusy) return;
    onStart(topic, councilSize);
  };

  const handleSelectPreset = (presetQuery: string) => {
    setTopic(presetQuery);
  };

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Label */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-300 font-mono tracking-wide">
            <Terminal className="w-4 h-4 text-cyan-400" />
            ENTER RESEARCH TOPIC OR HYPOTHESIS FOR 50-AI DEBATERS:
          </label>

          {/* Council Size Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-mono hidden sm:inline">Council Size:</span>
            <div className="flex bg-[#090b10] border border-cyber-border rounded-lg p-0.5 font-mono">
              {[5, 15, 30, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCouncilSize(size)}
                  className={`px-2 py-0.5 rounded text-xs transition ${
                    councilSize === size
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {size} AI
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar & Launch Button */}
        <div className="relative flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Should humanity enforce strict carbon caps on AI data centers?"
              disabled={isBusy}
              className="w-full bg-[#090b10] border border-cyber-border focus:border-cyan-400 rounded-xl px-4 py-3.5 pl-11 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-sans"
            />
            <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isBusy}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${
              !topic.trim() || isBusy
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border border-cyan-300/40 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isBusy ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Debating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Launch {councilSize}-AI Debate</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-400 font-mono">Suggested Research Topics:</span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.query)}
              disabled={isBusy}
              className="text-xs px-2.5 py-1 rounded-md bg-[#090b10] hover:bg-cyber-border/40 border border-cyber-border hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 transition text-left"
            >
              {preset.label}
            </button>
          ))}
        </div>

      </form>
    </div>
  );
};
