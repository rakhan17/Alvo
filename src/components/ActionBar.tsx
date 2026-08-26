import React, { useState } from 'react';
import { Send, Sparkles, Compass, Feather } from 'lucide-react';

interface ActionBarProps {
  quickActions: string[];
  isGenerating: boolean;
  onTakeAction: (actionText: string) => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  quickActions,
  isGenerating,
  onTakeAction
}) => {
  const [inputAction, setInputAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAction.trim() || isGenerating) return;

    onTakeAction(inputAction.trim());
    setInputAction('');
  };

  const handleSelectQuickAction = (action: string) => {
    if (isGenerating) return;
    onTakeAction(action);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 z-20">
      
      {/* 3 Smart Contextual Quick Actions */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8e8d99] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#c9b897]" />
          <span>Contextual Intent Suggestions:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              disabled={isGenerating}
              onClick={() => handleSelectQuickAction(action)}
              className="flex-1 text-left p-2.5 rounded-xl bg-[#141417] hover:bg-[#1c1c22] border border-[#242429] hover:border-[#c9b897]/50 text-xs font-sans text-[#d4cfc3] transition disabled:opacity-50 group"
            >
              <span className="text-[#c9b897] font-mono mr-1.5">{idx + 1}.</span>
              <span className="group-hover:text-white transition">{action}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Free-form Custom Action Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={inputAction}
          onChange={(e) => setInputAction(e.target.value)}
          disabled={isGenerating}
          placeholder={isGenerating ? "The Game Master is chronicling the next chapter..." : "What will you do next? Type your creative action freely..."}
          className="w-full bg-[#161619] border border-[#2d2d35] focus:border-[#c9b897] rounded-xl pl-4 pr-12 py-3.5 text-xs md:text-sm text-[#e6e1d5] placeholder-[#8e8d99] focus:outline-none font-sans shadow-lg transition"
        />

        <button
          type="submit"
          disabled={!inputAction.trim() || isGenerating}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#c9b897] hover:bg-[#d8c8a8] text-black transition disabled:opacity-30 shadow"
        >
          <Send className="w-4 h-4 fill-black" />
        </button>
      </form>

    </div>
  );
};
