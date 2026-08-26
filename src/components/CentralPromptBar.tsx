import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Music, Command } from 'lucide-react';

interface CentralPromptBarProps {
  isGenerating: boolean;
  onPromptSubmit: (promptText: string) => void;
}

const PROMPT_SUGGESTIONS = [
  "Cyber-funk with punchy short drum loops and bouncy basslines",
  "Tambahkan melodi synth lead arpeggio yang santai",
  "Make the bass deeper with a lowpass sub filter",
  "Add a fast trap hi-hat roll pattern snippet"
];

export const CentralPromptBar: React.FC<CentralPromptBarProps> = ({
  isGenerating,
  onPromptSubmit
}) => {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isGenerating) return;

    onPromptSubmit(promptText.trim());
    setPromptText('');
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (isGenerating) return;
    onPromptSubmit(suggestion);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#121215] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
      
      {/* Background Subtle Accent Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Bar Title Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-white">
            AI PROMPT COMMAND STUDIO (GENERATE & ITERATIVE EDIT)
          </span>
        </div>
        <span className="text-[#71717a] hidden sm:inline">
          Type prompt to generate or edit music loops
        </span>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          disabled={isGenerating}
          placeholder={
            isGenerating 
              ? "Groq AI is processing your prompt instructions..." 
              : "Describe music concept or request changes (e.g. 'Buatkan cyber-funk', 'Tambahkan synth lead', 'Perbesar bass')..."
          }
          className="w-full bg-[#18181b] border border-[#27272a] focus:border-cyan-400 rounded-xl pl-4 pr-24 py-3.5 text-xs sm:text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none font-sans shadow-inner transition"
        />

        <button
          type="submit"
          disabled={!promptText.trim() || isGenerating}
          className="absolute right-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition disabled:opacity-30 shadow"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5 fill-black" />
              <span>Submit</span>
            </>
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-[#71717a] shrink-0">Try Prompt:</span>
        {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            disabled={isGenerating}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition disabled:opacity-50"
          >
            {suggestion.length > 45 ? `${suggestion.slice(0, 45)}...` : suggestion}
          </button>
        ))}
      </div>

    </div>
  );
};
