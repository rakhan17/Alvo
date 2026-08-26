import React, { useState } from 'react';
import { PatternSnippet, SnippetCategory } from '../types/music';
import { Play, Square, Code, Trash2, Check, Sparkles, Layers, Sliders } from 'lucide-react';

interface SnippetGridProps {
  snippets: PatternSnippet[];
  onToggleActive: (id: string) => void;
  onPlaySolo: (snippet: PatternSnippet) => void;
  onUpdateCode: (id: string, newCode: string) => void;
  onDeleteSnippet: (id: string) => void;
  onSelectForEdit: (snippet: PatternSnippet) => void;
}

const CATEGORY_COLORS: Record<SnippetCategory, { bg: string; text: string; border: string }> = {
  drums: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  bass: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30' },
  synth: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  pads: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30' },
  percussion: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/30' }
};

export const SnippetGrid: React.FC<SnippetGridProps> = ({
  snippets,
  onToggleActive,
  onPlaySolo,
  onUpdateCode,
  onDeleteSnippet,
  onSelectForEdit
}) => {
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [tempCode, setTempCode] = useState('');

  const categories: SnippetCategory[] = ['drums', 'bass', 'synth', 'pads', 'percussion'];

  const handleStartEditCode = (s: PatternSnippet) => {
    setEditingCodeId(s.id);
    setTempCode(s.strudelCode);
  };

  const handleSaveCode = (id: string) => {
    if (tempCode.trim()) {
      onUpdateCode(id, tempCode.trim());
    }
    setEditingCodeId(null);
  };

  return (
    <div className="space-y-6">
      
      {categories.map((cat) => {
        const catSnippets = snippets.filter(s => s.category === cat);
        if (catSnippets.length === 0) return null;

        const catStyle = CATEGORY_COLORS[cat];

        return (
          <div key={cat} className="space-y-3">
            
            {/* Category Header */}
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
              <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                {cat} ({catSnippets.length})
              </span>
              <div className="flex-1 h-px bg-[#27272a]" />
            </div>

            {/* Snippets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className={`p-4 rounded-xl border transition-all duration-200 bg-[#121215] ${
                    snippet.isActive ? 'border-[#3f3f46] shadow-md' : 'border-[#27272a] opacity-60'
                  }`}
                >
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex items-center gap-2">
                      <button
                        onClick={() => onToggleActive(snippet.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                          snippet.isActive
                            ? 'bg-[#fafafa] border-[#fafafa] text-black'
                            : 'bg-[#18181b] border-[#27272a] text-transparent'
                        }`}
                        title="Include in Master Stack"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#fafafa] truncate">
                          {snippet.filename}
                        </h4>
                        <p className="text-[11px] font-sans text-[#71717a]">{snippet.title}</p>
                      </div>
                    </div>

                    {/* Quick Control Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPlaySolo(snippet)}
                        className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition"
                        title="Solo Play Snippet"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => onSelectForEdit(snippet)}
                        className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-cyan-400 transition"
                        title="Target AI Modify Snippet"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSnippet(snippet.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-[#71717a] hover:text-rose-400 transition"
                        title="Delete Snippet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Strudel Code Snippet Area */}
                  {editingCodeId === snippet.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={tempCode}
                        onChange={(e) => setTempCode(e.target.value)}
                        rows={2}
                        className="w-full bg-[#18181b] border border-cyan-500/40 rounded-lg p-2 text-xs font-mono text-[#fafafa] focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingCodeId(null)}
                          className="px-2.5 py-1 rounded bg-[#18181b] text-xs font-mono text-[#71717a]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveCode(snippet.id)}
                          className="px-2.5 py-1 rounded bg-[#fafafa] text-black text-xs font-mono font-bold"
                        >
                          Save Code
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditCode(snippet)}
                      className="mt-2 bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 cursor-pointer hover:border-[#3f3f46] transition group"
                      title="Click to edit Strudel code"
                    >
                      <code className="text-xs font-mono text-emerald-400 group-hover:text-emerald-300 block font-bold truncate">
                        {snippet.strudelCode}
                      </code>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        );
      })}

    </div>
  );
};
