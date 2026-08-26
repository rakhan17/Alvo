import React from 'react';
import { Cpu, Key, Users, Sparkles, StopCircle, RefreshCw } from 'lucide-react';
import { apiKeyPool } from '../services/apiPool';

interface HeaderProps {
  phase: string;
  onOpenKeys: () => void;
  onOpenPersonas: () => void;
  onStop: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  phase,
  onOpenKeys,
  onOpenPersonas,
  onStop,
  activeCount
}) => {
  const poolStats = apiKeyPool.getPoolStats();
  const activeKeysCount = poolStats.filter(k => k.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 bg-[#090b10]/80 backdrop-blur-xl border-b border-cyber-border/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 p-[1px] shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <div className="w-full h-full bg-[#090b10] rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 font-sans">
                ALVO <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">2.0 WEB</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden sm:block">
              Autonomous 50-AI Research & Debate Engine
            </p>
          </div>
        </div>

        {/* Center Live Execution Status */}
        {phase !== 'idle' && (
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyber-card border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="text-xs font-mono font-semibold text-cyan-300">
              {phase}
            </span>
            <button
              onClick={onStop}
              className="ml-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition border border-rose-500/40"
            >
              <StopCircle className="w-3 h-3" /> Stop
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Persona Matrix Modal Button */}
          <button
            onClick={onOpenPersonas}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-card/80 border border-cyber-border text-gray-300 hover:text-white transition text-xs font-medium"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Council: <strong className="text-purple-300 font-mono">{activeCount}/50</strong></span>
          </button>

          {/* API Key Pool Indicator Button */}
          <button
            onClick={onOpenKeys}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-card/80 border border-cyber-border text-gray-300 hover:text-white transition text-xs font-medium"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">API Keys:</span>
            <span className="font-mono text-emerald-300 font-bold">{activeKeysCount}/{poolStats.length} Active</span>
          </button>
        </div>

      </div>
    </header>
  );
};
