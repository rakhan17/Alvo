import React, { useState } from 'react';
import { GenreSetting, CharacterClass, PlayerCharacter } from '../types/game';
import { BookOpen, Compass, Shield, Feather, Sparkles } from 'lucide-react';

interface WorldSetupModalProps {
  isOpen: boolean;
  onStartCampaign: (setting: GenreSetting, character: PlayerCharacter) => void;
}

const GENRES: { id: GenreSetting; name: string; desc: string }[] = [
  { id: 'Dark Fantasy', name: 'Dark Fantasy', desc: 'A grim world of ruined kingdoms, ancient magic, and forgotten oaths.' },
  { id: 'Cyber-Noir', name: 'Cyber-Noir', desc: 'Rain-slicked megacities, neon shadows, corporate conspiracies, and chrome.' },
  { id: 'Victorian Gothic', name: 'Victorian Gothic', desc: 'Gaslit cobblestones, occult societies, bloodlines, and eldritch horrors.' },
  { id: 'Cosmic Mystery', name: 'Cosmic Mystery', desc: 'Deep space derelicts, strange signals, lost colonies, and cosmic dread.' }
];

const CLASSES: { id: CharacterClass; title: string; desc: string }[] = [
  { id: 'Wanderer', title: 'Wanderer', desc: 'A solitary traveler skilled in survival and ancient trails.' },
  { id: 'Scholar', title: 'Scholar', desc: 'A keeper of forbidden lore, arcana, and deciphered languages.' },
  { id: 'Inquisitor', title: 'Inquisitor', desc: 'A relentless seeker of truth, armed with iron will and zeal.' },
  { id: 'Mercenary', title: 'Mercenary', desc: 'A hardened veteran of steel, firearms, and tactical instinct.' },
  { id: 'Alchemist', title: 'Alchemist', desc: 'A master of strange elixirs, transmutations, and volatile compounds.' },
  { id: 'Detective', title: 'Detective', desc: 'An observant investigator skilled in deduction and interrogation.' }
];

export const WorldSetupModal: React.FC<WorldSetupModalProps> = ({
  isOpen,
  onStartCampaign
}) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreSetting>('Dark Fantasy');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Wanderer');
  const [characterName, setCharacterName] = useState('Corvus');
  const [originStory, setOriginStory] = useState('Exiled from the High Citadel after uncovering a forbidden seal.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) return;

    onStartCampaign(selectedGenre, {
      name: characterName.trim(),
      classTitle: selectedClass,
      health: 100,
      maxHealth: 100,
      will: 80,
      maxWill: 80,
      originStory: originStory.trim() || 'A mysterious figure with a forgotten past.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-[#242429] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#242429] bg-[#161619] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#202026] text-[#c9b897]">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#e6e1d5] tracking-wide">
                BEGIN A NEW CHRONICLE
              </h2>
              <p className="text-xs text-[#8e8d99] font-sans">
                Select your setting, define your identity, and forge your narrative.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* 1. Genre Setting */}
          <div className="space-y-3">
            <label className="block text-xs font-sans font-semibold text-[#c9b897] uppercase tracking-wider">
              1. Select World Setting:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGenre(g.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedGenre === g.id
                      ? 'bg-[#1c1c22] border-[#c9b897] shadow-[0_0_15px_rgba(201,184,151,0.15)]'
                      : 'bg-[#161619] border-[#242429] hover:border-[#383842]'
                  }`}
                >
                  <h4 className="text-xs font-serif font-bold text-[#e6e1d5] mb-1">{g.name}</h4>
                  <p className="text-[11px] text-[#8e8d99] font-sans leading-relaxed">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Character Class */}
          <div className="space-y-3">
            <label className="block text-xs font-sans font-semibold text-[#c9b897] uppercase tracking-wider">
              2. Select Character Archetype:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClass(c.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedClass === c.id
                      ? 'bg-[#1c1c22] border-[#c9b897]'
                      : 'bg-[#161619] border-[#242429] hover:border-[#383842]'
                  }`}
                >
                  <h5 className="text-xs font-serif font-semibold text-[#e6e1d5]">{c.title}</h5>
                  <p className="text-[10px] text-[#8e8d99] font-sans line-clamp-2 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Character Name & Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-[#8e8d99] mb-1">Character Name:</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full bg-[#161619] border border-[#242429] rounded-xl px-4 py-2.5 text-xs text-[#e6e1d5] focus:outline-none focus:border-[#c9b897] font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-sans text-[#8e8d99] mb-1">Backstory Origin (Optional):</label>
              <input
                type="text"
                value={originStory}
                onChange={(e) => setOriginStory(e.target.value)}
                placeholder="Exiled from the High Citadel..."
                className="w-full bg-[#161619] border border-[#242429] rounded-xl px-4 py-2.5 text-xs text-[#e6e1d5] focus:outline-none focus:border-[#c9b897] font-sans"
              />
            </div>
          </div>

          {/* Start Campaign Button */}
          <div className="pt-4 border-t border-[#242429]">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#c9b897] hover:bg-[#d8c8a8] text-black font-semibold font-serif text-xs tracking-widest uppercase transition shadow-lg"
            >
              Begin Chronicle Journey
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
