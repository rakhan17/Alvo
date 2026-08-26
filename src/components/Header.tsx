import React from 'react';
import { Key, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { apiKeyPool } from '../services/apiPool';

interface HeaderProps {
  onOpenKeyPool: () => void;
  onOpenPersonas: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenKeyPool,
  onOpenPersonas,
  activeCount
}) => {
  const activeKeysCount = apiKeyPool.getPoolStats().filter(k => k.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#171717] border border-[#333333] flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-widest font-mono">ALVO</h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#262626] text-neutral-300 border border-[#333333]">
                150-HUMAN COUNCIL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans hidden sm:block">
              Multi-Perspective Human Society Research & Consensus Engine
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Personas Button */}
          <button
            onClick={onOpenPersonas}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-xs font-medium text-neutral-200 transition"
          >
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline font-mono">150 Roles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#262626] text-white font-mono">
              {activeCount}
            </span>
          </button>

          {/* Groq Key Pool Button */}
          <button
            onClick={onOpenKeyPool}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-xs font-medium text-neutral-200 transition"
          >
            <Key className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline font-mono">13 Groq Keys</span>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 border border-[#333333] font-mono">
              <ShieldCheck className="w-3 h-3 text-white" /> {activeKeysCount} Active
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
