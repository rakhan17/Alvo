import React from 'react';
import { Swords, ShieldAlert, Cpu, Sparkles, Key } from 'lucide-react';
import { DebateStatus } from '../types/debate';

interface ArenaHeaderProps {
  status: DebateStatus;
  activeRound: number;
  maxRounds: number;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  status,
  activeRound,
  maxRounds
}) => {
  return (
    <header className="w-full bg-[#0d0e12]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 md:px-8 py-3.5 flex items-center justify-between z-30 shadow-2xl">
      
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <Swords className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-white font-mono flex items-center gap-2">
            GROQ AI DEBATE ARENA
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
              v2.0 PRO
            </span>
          </h1>
          <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
            <Cpu className="w-3 h-3 text-cyan-400" /> Multi-Model Dialectic Engine
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center gap-4 bg-[#14161d] px-4 py-1.5 rounded-xl border border-neutral-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Status:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 animate-pulse' :
            status === 'PAUSED' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
            status === 'COMPLETED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' :
            'bg-neutral-900 text-neutral-400'
          }`}>
            {status}
          </span>
        </div>

        <div className="w-px h-4 bg-neutral-800" />

        <div className="flex items-center gap-2 text-neutral-300">
          <span className="text-neutral-500">Round:</span>
          <span className="font-bold text-white">{activeRound} / {maxRounds}</span>
        </div>
      </div>

      {/* Groq Key Pool Badge */}
      <div className="flex items-center gap-2 bg-[#14161d] px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300">
        <Key className="w-3.5 h-3.5 text-cyan-400" />
        <span>13 Groq API Keys Active</span>
      </div>

    </header>
  );
};
