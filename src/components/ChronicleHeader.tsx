import React from 'react';
import { BookOpen, Compass, PanelRight, Sparkles, ShieldAlert, Heart, Moon } from 'lucide-react';
import { StoryMood } from '../types/game';

interface ChronicleHeaderProps {
  settingName: string;
  characterName: string;
  chapterCount: number;
  mood: StoryMood;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onNewCampaign: () => void;
}

export const ChronicleHeader: React.FC<ChronicleHeaderProps> = ({
  settingName,
  characterName,
  chapterCount,
  mood,
  isDrawerOpen,
  onToggleDrawer,
  onNewCampaign
}) => {
  const getMoodBadge = (m: StoryMood) => {
    switch (m) {
      case 'Combative':
        return { text: 'Combative', bg: 'bg-rose-950/60 text-rose-300 border-rose-500/30' };
      case 'Tense':
        return { text: 'Tense', bg: 'bg-amber-950/60 text-amber-300 border-amber-500/30' };
      case 'Serene':
        return { text: 'Serene', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };
      case 'Melancholic':
        return { text: 'Melancholic', bg: 'bg-purple-950/60 text-purple-300 border-purple-500/30' };
      case 'Mysterious':
      default:
        return { text: 'Mysterious', bg: 'bg-[#1e1e24] text-[#c9b897] border-[#383842]' };
    }
  };

  const moodStyle = getMoodBadge(mood);

  return (
    <header className="w-full bg-[#0d0d0f]/95 backdrop-blur-md border-b border-[#242429] px-6 py-4 flex items-center justify-between z-30 select-none">
      
      {/* Brand & Editorial Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#161619] border border-[#2d2d35] text-[#c9b897]">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-widest text-[#e6e1d5] font-serif uppercase flex items-center gap-2">
            AETHELGARD
            <span className="text-[10px] font-sans font-normal tracking-normal px-2 py-0.5 rounded bg-[#1c1c22] text-[#c9b897] border border-[#2d2d35]">
              Chronicle Engine
            </span>
          </h1>
          <p className="text-[11px] text-[#8e8d99] font-sans">
            {settingName} • {characterName}
          </p>
        </div>
      </div>

      {/* Mood & Status Indicators */}
      <div className="hidden md:flex items-center gap-4 text-xs font-sans">
        
        {/* Chapter Counter */}
        <div className="flex items-center gap-1.5 text-[#8e8d99]">
          <span>Chapter</span>
          <span className="font-serif font-bold text-[#e6e1d5]">{chapterCount}</span>
        </div>

        <div className="w-px h-4 bg-[#242429]" />

        {/* Ambient Mood Badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8e8d99]">Atmosphere:</span>
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${moodStyle.bg}`}>
            ● {moodStyle.text}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewCampaign}
          className="text-xs font-sans px-3 py-1.5 rounded-lg bg-[#161619] hover:bg-[#202026] text-[#8e8d99] hover:text-[#e6e1d5] border border-[#242429] transition"
        >
          New Chronicle
        </button>

        <button
          onClick={onToggleDrawer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans transition border ${
            isDrawerOpen 
              ? 'bg-[#c9b897] text-black font-semibold border-[#c9b897]' 
              : 'bg-[#161619] text-[#e6e1d5] border-[#242429] hover:border-[#383842]'
          }`}
          title="Toggle Character State & Companion Drawer"
        >
          <PanelRight className="w-4 h-4" />
          <span className="hidden sm:inline">Companion Drawer</span>
        </button>
      </div>

    </header>
  );
};
