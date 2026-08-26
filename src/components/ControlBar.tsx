import React from 'react';
import { DebateStatus } from '../types/debate';
import { Play, Pause, RotateCcw, Sliders, Sparkles } from 'lucide-react';

interface ControlBarProps {
  status: DebateStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onToggleSetup: () => void;
  showSetup: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onToggleSetup,
  showSetup
}) => {
  return (
    <div className="w-full bg-[#101218]/90 backdrop-blur-xl border-t border-cyan-500/20 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 z-30 shadow-2xl">
      
      {/* Setup Toggle */}
      <button
        onClick={onToggleSetup}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
          showSetup 
            ? 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]' 
            : 'bg-[#1a1d28] text-cyan-300 border border-cyan-500/30 hover:bg-[#222736]'
        }`}
      >
        <Sliders className="w-4 h-4" />
        {showSetup ? 'Hide Setup Panel' : 'Arena Setup & Motion'}
      </button>

      {/* Primary Execution Controls */}
      <div className="flex items-center gap-3">
        {status === 'IDLE' && (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black font-mono text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] transition"
          >
            <Play className="w-4 h-4 fill-black" /> Start Debate
          </button>
        )}

        {status === 'RUNNING' && (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black font-mono text-xs tracking-wider uppercase shadow-[0_0_15px_#f59e0b] transition"
          >
            <Pause className="w-4 h-4 fill-black" /> Pause Debate
          </button>
        )}

        {status === 'PAUSED' && (
          <button
            onClick={onResume}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black font-mono text-xs tracking-wider uppercase shadow-[0_0_15px_#10b981] transition"
          >
            <Play className="w-4 h-4 fill-black" /> Resume Debate
          </button>
        )}

        {(status === 'RUNNING' || status === 'PAUSED' || status === 'COMPLETED') && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1d28] hover:bg-[#222736] border border-neutral-700 text-neutral-300 font-mono text-xs transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset Arena
          </button>
        )}
      </div>

    </div>
  );
};
