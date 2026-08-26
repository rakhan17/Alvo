import React, { useState } from 'react';
import { DebateMessage } from '../services/debateEngine';
import { MessageSquare, Search, Sparkles, ArrowRight } from 'lucide-react';

interface DebateFeedProps {
  entries: DebateMessage[];
}

export const DebateFeed: React.FC<DebateFeedProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStance, setFilterStance] = useState<string>('all');

  const filtered = entries.filter(e => {
    const matchesSearch =
      e.personaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.personaTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStance = filterStance === 'all' || e.stanceType === filterStance;

    return matchesSearch && matchesStance;
  });

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col h-[550px]">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white" />
          <h3 className="font-bold text-sm text-white tracking-wider font-mono uppercase">
            LIVE DEBATE STREAM <span className="text-xs text-neutral-500 font-mono">({entries.length} Entries)</span>
          </h3>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search debaters..."
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-1.5 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white font-sans"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex bg-[#0a0a0a] border border-[#262626] rounded-lg p-0.5 text-xs font-mono">
            {['all', 'Support', 'Oppose'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStance(st)}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  filterStance === st
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stream Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-2 py-12 font-mono">
            <Sparkles className="w-6 h-6 text-neutral-600 animate-pulse" />
            <p className="text-xs">No debate messages yet.</p>
            <p className="text-[11px] text-neutral-600 max-w-xs font-sans">
              Enter a research topic above and click Launch to start the 150-AI debate council!
            </p>
          </div>
        ) : (
          filtered.map(entry => (
            <div
              key={entry.id}
              className="group relative bg-[#0a0a0a] border border-[#262626] hover:border-[#404040] rounded-xl p-4 transition-all duration-150"
            >
              {/* Top Meta Line */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base p-1 rounded bg-[#171717] border border-[#262626]">{entry.personaIcon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      {entry.personaName}
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-normal bg-[#1a1a1a] text-neutral-400 border border-[#262626]">
                        {entry.personaTitle}
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Stance & Target */}
                <div className="flex items-center gap-2">
                  {entry.targetPersonaName && (
                    <span className="text-[10px] flex items-center gap-1 text-neutral-400 bg-[#171717] border border-[#262626] px-2 py-0.5 rounded font-mono">
                      Rebutting <ArrowRight className="w-3 h-3 text-neutral-500" /> {entry.targetPersonaName}
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1f1f1f] text-neutral-200 border border-[#333333]">
                    {entry.stanceType}
                  </span>
                </div>
              </div>

              {/* Text */}
              <p className="text-xs text-neutral-200 leading-relaxed font-sans pl-8">
                {entry.text}
              </p>

              {/* Time */}
              <div className="text-[10px] text-neutral-500 font-mono text-right mt-2">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
