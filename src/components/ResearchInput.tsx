import React, { useState } from 'react';
import { Search, Zap, Sliders, Sparkles } from 'lucide-react';

interface ResearchInputProps {
  onStartDebate: (topic: string, councilSize: number) => void;
  isBusy: boolean;
}

const PRESET_TOPICS = [
  { label: '🤖 Global AI Governance vs Sovereign Freedom', query: 'Should global society mandate strict international AI controls over national sovereignty?' },
  { label: '⚖️ Universal Basic Income vs Job Guarantees', query: 'Should nations implement Universal Basic Income or state job guarantees for displaced workers?' },
  { label: '🌾 Genetically Modified Farming & Food Supply', query: 'Is large-scale GMO farming necessary to feed 10 billion people amidst climate shifts?' },
  { label: '🏥 Private Healthcare Markets vs Single-Payer', query: 'What is the most ethical and efficient healthcare system model for modern society?' }
];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onStartDebate, isBusy }) => {
  const [topic, setTopic] = useState('');
  const [councilSize, setCouncilSize] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isBusy) {
      onStartDebate(topic.trim(), councilSize);
    }
  };

  const handleSelectPreset = (presetQuery: string) => {
    setTopic(presetQuery);
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 md:p-6 shadow-xl transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Label & Council Size Selector */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            ENTER HYPOTHESIS OR QUESTION FOR HUMAN PERSPECTIVE COUNCIL:
          </label>

          {/* Council Size Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400 font-mono hidden sm:inline">Council Size:</span>
            <div className="flex bg-[#0a0a0a] border border-[#262626] rounded-lg p-0.5 font-mono">
              {[15, 50, 100, 150].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCouncilSize(size)}
                  className={`px-2.5 py-0.5 rounded text-xs transition ${
                    councilSize === size
                      ? 'bg-white text-black font-bold border border-white'
                      : 'text-neutral-400 hover:text-white'
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
              placeholder="e.g. Should human society regulate artificial intelligence as a public utility?"
              disabled={isBusy}
              className="w-full bg-[#0a0a0a] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 pl-11 text-xs md:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all font-sans"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isBusy}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
              !topic.trim() || isBusy
                ? 'bg-[#1f1f1f] text-neutral-600 border border-[#262626] cursor-not-allowed'
                : 'bg-white hover:bg-neutral-200 text-black border border-white font-bold shadow-md hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isBusy ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-black" />
                <span>Debating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-black" />
                <span>Launch {councilSize}-AI Debate</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-neutral-400 font-mono">Preset Research Topics:</span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.query)}
              disabled={isBusy}
              className="text-[11px] px-2.5 py-1 rounded-md bg-[#0a0a0a] hover:bg-[#1a1a1a] border border-[#262626] hover:border-neutral-400 text-neutral-300 hover:text-white transition text-left"
            >
              {preset.label}
            </button>
          ))}
        </div>

      </form>
    </div>
  );
};
