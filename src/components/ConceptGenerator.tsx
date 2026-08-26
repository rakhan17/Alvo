import React, { useState } from 'react';
import { Sparkles, Music, X } from 'lucide-react';

interface ConceptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  onGenerateBatch: (concept: string) => void;
}

const PRESET_CONCEPTS = [
  "Cyber-funk with punchy short drum loops and bouncy basslines",
  "Lo-Fi Chill Hop with dusty kick snares and ambient rhodes chords",
  "Minimal Techno with crisp hi-hat rolls and driving sub bass",
  "Ambient Synthwave with arpeggiated lead synths and lush pads",
  "Groovy Deep House with jackin percussion and acidic bassline"
];

export const ConceptGenerator: React.FC<ConceptGeneratorProps> = ({
  isOpen,
  onClose,
  isGenerating,
  onGenerateBatch
}) => {
  const [conceptInput, setConceptInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptInput.trim() || isGenerating) return;

    onGenerateBatch(conceptInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#fafafa]">
            <Sparkles className="w-4 h-4 text-[#a1a1aa]" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wider">
              GENERATE MODULAR STRUDEL SNIPPETS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">
              Global Musical Concept / Style Idea:
            </label>
            <textarea
              value={conceptInput}
              onChange={(e) => setConceptInput(e.target.value)}
              rows={3}
              placeholder="e.g. Cyber-funk with punchy short drum loops and bouncy basslines..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-3 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#a1a1aa] font-sans leading-relaxed"
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#71717a] uppercase block">
              Quick Concept Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONCEPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConceptInput(preset)}
                  className="text-left text-xs font-sans px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!conceptInput.trim() || isGenerating}
              className="w-full py-3 rounded-xl bg-[#fafafa] hover:bg-white text-[#09090b] font-mono font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 shadow"
            >
              {isGenerating ? 'Generating Modular Snippets...' : '⚡ Generate Modular Snippet Library'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
