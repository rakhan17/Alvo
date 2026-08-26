import React, { useState } from 'react';
import { DebateEntry } from '../services/debateEngine';
import { MessageSquare, ArrowRight, Filter, Search, Sparkles } from 'lucide-react';

interface DebateFeedProps {
  entries: DebateEntry[];
  isBusy: boolean;
}

export const DebateFeed: React.FC<DebateFeedProps> = ({ entries, isBusy }) => {
  const [filterStance, setFilterStance] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = entries.filter(e => {
    const matchesStance = filterStance === 'all' || e.stanceType.toLowerCase() === filterStance.toLowerCase();
    const matchesSearch = !searchTerm || e.text.toLowerCase().includes(searchTerm.toLowerCase()) || e.personaName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStance && matchesSearch;
  });

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col h-[580px]">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-cyber-border/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white tracking-wide font-sans">
            LIVE DEBATE STREAM <span className="text-xs text-gray-400 font-mono">({entries.length} Entries)</span>
          </h3>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-40">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search debaters..."
              className="w-full bg-[#090b10] border border-cyber-border rounded-lg px-3 py-1.5 pl-8 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex bg-[#090b10] border border-cyber-border rounded-lg p-0.5 text-xs font-mono">
            {['all', 'Support', 'Oppose', 'Nuanced'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStance(st)}
                className={`px-2 py-1 rounded transition text-[11px] ${
                  filterStance === st
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stream Feed Cards */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2 py-12">
            <Sparkles className="w-8 h-8 text-gray-600 animate-pulse" />
            <p className="text-sm font-mono">No debate messages yet.</p>
            <p className="text-xs text-gray-600 max-w-xs">
              Enter a research topic above and click Launch to start the multi-agent council debate!
            </p>
          </div>
        ) : (
          filtered.map(entry => (
            <div
              key={entry.id}
              className="group relative bg-[#090b10]/90 border border-cyber-border hover:border-cyan-500/40 rounded-xl p-3.5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
            >
              {/* Top Meta Line */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{entry.personaIcon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      {entry.personaName}
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
                        style={{ backgroundColor: `${entry.personaColor}20`, color: entry.personaColor }}
                      >
                        {entry.personaTitle}
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Stance & Target Badge */}
                <div className="flex items-center gap-1.5">
                  {entry.targetPersonaName && (
                    <span className="text-[10px] flex items-center gap-1 text-pink-400 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded font-mono">
                      Rebutting <ArrowRight className="w-3 h-3" /> {entry.targetPersonaName}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      entry.stanceType === 'Support'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : entry.stanceType === 'Oppose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {entry.stanceType}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <p className="text-xs text-gray-200 leading-relaxed font-sans pl-7">
                {entry.text}
              </p>

              {/* Time */}
              <div className="text-[10px] text-gray-500 font-mono text-right mt-1.5">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
