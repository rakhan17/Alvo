import React from 'react';
import { DebateMessage, ModeratorVerdict } from '../types/debate';
import { Gavel, Award, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface ModeratorCardProps {
  moderatorName: string;
  modelUsed: string;
  isActiveTurn: boolean;
  introMessage?: DebateMessage;
  verdictMessage?: DebateMessage;
  verdictData?: ModeratorVerdict | null;
}

export const ModeratorCard: React.FC<ModeratorCardProps> = ({
  moderatorName,
  modelUsed,
  isActiveTurn,
  introMessage,
  verdictMessage,
  verdictData
}) => {
  return (
    <div className={`w-full bg-[#12141c] border rounded-2xl p-5 shadow-2xl transition-all duration-300 ${
      isActiveTurn 
        ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/40' 
        : 'border-cyan-500/20'
    }`}>
      
      {/* Moderator Card Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
              {moderatorName}
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                MODERATOR & REFEREE
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">Model: {modelUsed}</p>
          </div>
        </div>

        {isActiveTurn && (
          <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400/50 text-xs font-mono font-bold animate-pulse">
            ● MODERATING ARENA
          </span>
        )}
      </div>

      {/* Intro Speech */}
      {introMessage && (
        <div className="mb-4 bg-[#171a25] p-4 rounded-xl border border-neutral-800 text-xs text-neutral-200 leading-relaxed font-sans">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
            Moderator Opening Statement:
          </span>
          <p>{introMessage.text}</p>
        </div>
      )}

      {/* Verdict Announcement Card */}
      {verdictMessage && (
        <div className="mt-4 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-emerald-950/60 p-5 rounded-xl border border-cyan-400/40 space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <Award className="w-6 h-6 text-yellow-400 animate-bounce" />
              <h4 className="font-mono font-extrabold text-sm uppercase tracking-wider text-white">
                FINAL MODERATOR VERDICT & JUDGMENT
              </h4>
            </div>
            {verdictData && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-black font-mono text-xs shadow-[0_0_15px_#10b981]">
                WINNER: {verdictData.winner}
              </span>
            )}
          </div>

          <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
            {verdictMessage.text}
          </div>

        </div>
      )}

    </div>
  );
};
