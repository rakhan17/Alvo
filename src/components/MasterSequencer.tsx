import React from 'react';
import { MasterArrangement, PatternSnippet } from '../types/music';
import { Layers, Play, Code, CheckCircle, Sparkles } from 'lucide-react';

interface MasterSequencerProps {
  master: MasterArrangement;
  snippets: PatternSnippet[];
  isPlaying: boolean;
  onPlayMaster: () => void;
}

export const MasterSequencer: React.FC<MasterSequencerProps> = ({
  master,
  snippets,
  isPlaying,
  onPlayMaster
}) => {
  const activeSnippets = snippets.filter(s => s.isActive);

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-[#fafafa] uppercase tracking-wider">
            MASTER SEQUENCER ARRANGEMENT ({master.filename})
          </h3>
        </div>

        <button
          onClick={onPlayMaster}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition shadow"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>Play Master Stack</span>
        </button>
      </div>

      {/* Active Layers Stack */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#71717a] uppercase block">
          Active Layers ({activeSnippets.length} stacked):
        </span>
        <div className="flex flex-wrap gap-2">
          {activeSnippets.map((s) => (
            <span
              key={s.id}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#18181b] border border-[#27272a] text-[#a1a1aa] flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              {s.filename}
            </span>
          ))}
        </div>
      </div>

      {/* Generated main.strudel Code Box */}
      <div className="space-y-1">
        <span className="text-[11px] font-mono text-[#71717a] uppercase block">
          Generated main.strudel Code:
        </span>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <code className="text-xs font-mono text-cyan-300 block whitespace-pre-wrap leading-relaxed">
            {master.strudelCode}
          </code>
        </div>
      </div>

    </div>
  );
};
