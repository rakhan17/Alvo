import React, { useRef, useEffect } from 'react';
import { DebaterConfig, DebateMessage } from '../types/debate';
import { Shield, Sparkles, Cpu, CheckCircle } from 'lucide-react';

interface DebaterCardProps {
  debater: DebaterConfig;
  roleKey: 'DEBATER_A' | 'DEBATER_B';
  isActiveTurn: boolean;
  messages: DebateMessage[];
}

export const DebaterCard: React.FC<DebaterCardProps> = ({
  debater,
  roleKey,
  isActiveTurn,
  messages
}) => {
  const isPro = roleKey === 'DEBATER_A';
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const debaterMessages = messages.filter(m => m.role === roleKey);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debaterMessages]);

  return (
    <div className={`flex-1 flex flex-col bg-[#10121a] border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isActiveTurn
        ? isPro
          ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50'
          : 'border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/50'
        : isPro
          ? 'border-emerald-500/20'
          : 'border-rose-500/20'
    }`}>
      
      {/* Debater Card Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isPro ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black font-mono shadow-md ${
            isPro ? 'bg-emerald-400' : 'bg-rose-400'
          }`}>
            {isPro ? 'PRO' : 'CON'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white truncate font-sans">
              {debater.name}
            </h3>
            <p className="text-[11px] font-mono text-neutral-400 truncate">
              {debater.model}
            </p>
          </div>
        </div>

        {isActiveTurn && (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold animate-pulse ${
            isPro ? 'bg-emerald-950 text-emerald-300 border border-emerald-400' : 'bg-rose-950 text-rose-300 border border-rose-400'
          }`}>
            ● SPEAKING
          </span>
        )}
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar min-h-[350px] max-h-[550px] bg-[#0c0e14]">
        {debaterMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-600 font-mono italic">
            Waiting for Round {isPro ? '1' : '1'} turn...
          </div>
        ) : (
          debaterMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border space-y-2 shadow-md font-sans text-xs ${
                isPro
                  ? 'bg-[#121c17] border-emerald-500/30 text-emerald-50'
                  : 'bg-[#1c1216] border-rose-500/30 text-rose-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/10 pb-1.5">
                <span className={isPro ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  ROUND {msg.roundIndex} • {msg.turnType}
                </span>
                <span className="text-neutral-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="leading-relaxed whitespace-pre-wrap">
                {msg.text}
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />
                )}
              </p>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

    </div>
  );
};
