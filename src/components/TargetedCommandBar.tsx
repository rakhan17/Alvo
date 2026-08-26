import React, { useState } from 'react';
import { PatternSnippet } from '../types/music';
import { Sparkles, Send, X } from 'lucide-react';

interface TargetedCommandBarProps {
  selectedSnippet: PatternSnippet | null;
  onCloseSelected: () => void;
  onModifySnippet: (snippet: PatternSnippet, instruction: string) => void;
}

export const TargetedCommandBar: React.FC<TargetedCommandBarProps> = ({
  selectedSnippet,
  onCloseSelected,
  onModifySnippet
}) => {
  const [instruction, setInstruction] = useState('');

  if (!selectedSnippet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    onModifySnippet(selectedSnippet, instruction.trim());
    setInstruction('');
    onCloseSelected();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-lg z-40 bg-[#121215]/95 backdrop-blur-xl border border-cyan-500/40 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
      
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span className="font-mono text-xs font-bold uppercase">
            TARGETED AI MODIFIER: {selectedSnippet.filename}
          </span>
        </div>
        <button
          onClick={onCloseSelected}
          className="p-1 text-[#71717a] hover:text-[#fafafa]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={`e.g. Make ${selectedSnippet.filename} faster and more syncopated...`}
          className="flex-1 bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-cyan-400 font-sans"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl shadow transition shrink-0"
        >
          Modify
        </button>
      </form>

    </div>
  );
};
