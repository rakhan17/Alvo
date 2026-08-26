import React from 'react';
import { Play, Square, Sliders, Music, Sparkles, Volume2, Activity } from 'lucide-react';

interface StudioHeaderProps {
  concept: string;
  isPlaying: boolean;
  bpm: number;
  snippetCount: number;
  onTogglePlay: () => void;
  onBpmChange: (newBpm: number) => void;
  onOpenConceptModal: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  concept,
  isPlaying,
  bpm,
  snippetCount,
  onTogglePlay,
  onBpmChange,
  onOpenConceptModal
}) => {
  return (
    <header className="w-full bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a] px-6 py-3.5 flex items-center justify-between z-30 select-none">
      
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[#fafafa]">
          <Music className="w-4 h-4 text-[#a1a1aa]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wider text-[#fafafa] font-mono flex items-center gap-2">
            STRUDEL MODULAR LOOP STUDIO
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a] font-normal">
              v2.0 LIVE
            </span>
          </h1>
          <p className="text-[11px] text-[#71717a] font-sans truncate max-w-xs md:max-w-md">
            Concept: "{concept}"
          </p>
        </div>
      </div>

      {/* Master Transport & BPM Controls */}
      <div className="flex items-center gap-4 bg-[#141417] px-4 py-1.5 rounded-xl border border-[#27272a]">
        
        {/* Play/Stop Toggle */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition shadow ${
            isPlaying
              ? 'bg-[#fafafa] text-[#09090b]'
              : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> STOP
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> PLAY MASTER
            </>
          )}
        </button>

        <div className="w-px h-5 bg-[#27272a]" />

        {/* BPM Counter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#71717a]">BPM:</span>
          <input
            type="number"
            value={bpm}
            min={60}
            max={200}
            onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
            className="w-14 bg-[#18181b] border border-[#27272a] rounded px-2 py-0.5 text-center text-xs text-[#fafafa] font-mono focus:outline-none focus:border-[#a1a1aa]"
          />
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#71717a]">
          <Activity className="w-3.5 h-3.5 text-[#a1a1aa]" />
          <span>{snippetCount} Active Snippets</span>
        </div>
      </div>

      {/* Concept Generator Trigger */}
      <button
        onClick={onOpenConceptModal}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs font-sans text-[#fafafa] transition"
      >
        <Sparkles className="w-4 h-4 text-[#a1a1aa]" />
        <span className="hidden sm:inline">New Music Concept</span>
      </button>

    </header>
  );
};
