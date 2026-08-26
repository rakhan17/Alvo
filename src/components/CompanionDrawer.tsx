import React from 'react';
import { PlayerCharacter, InventoryItem, Quest, NPC } from '../types/game';
import { X, Heart, Shield, Package, Scroll, Users, CheckCircle, Flame } from 'lucide-react';

interface CompanionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  character: PlayerCharacter;
  inventory: InventoryItem[];
  quests: Quest[];
  npcs: NPC[];
}

export const CompanionDrawer: React.FC<CompanionDrawerProps> = ({
  isOpen,
  onClose,
  character,
  inventory,
  quests,
  npcs
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-[#111114] border-l border-[#242429] flex flex-col h-full z-40 select-none shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="h-16 px-6 bg-[#161619] border-b border-[#242429] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#c9b897]">
          <Package className="w-4 h-4" />
          <h3 className="font-serif font-bold text-sm text-[#e6e1d5] tracking-wider uppercase">
            COMPANION STATE
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#202026] text-[#8e8d99] hover:text-[#e6e1d5] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 font-sans text-xs">
        
        {/* 1. Character Status Vitals */}
        <div className="space-y-3 bg-[#161619] p-4 rounded-xl border border-[#242429]">
          <div className="flex items-center justify-between border-b border-[#242429] pb-2">
            <span className="font-serif font-bold text-[#e6e1d5] text-sm">{character.name}</span>
            <span className="text-[10px] font-mono text-[#c9b897] uppercase px-2 py-0.5 rounded bg-[#1f1f26]">
              {character.classTitle}
            </span>
          </div>

          {/* Health Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#8e8d99]">
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <Heart className="w-3 h-3" /> Health Vitals:
              </span>
              <span className="font-mono text-[#e6e1d5]">{character.health} / {character.maxHealth}</span>
            </div>
            <div className="w-full h-2 bg-[#202026] rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* Will / Mana Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#8e8d99]">
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <Flame className="w-3 h-3" /> Will / Resolve:
              </span>
              <span className="font-mono text-[#e6e1d5]">{character.will} / {character.maxWill}</span>
            </div>
            <div className="w-full h-2 bg-[#202026] rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${(character.will / character.maxWill) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Inventory Items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[#8e8d99] font-mono text-[10px] uppercase tracking-wider">
            <span>Inventory Bag ({inventory.length})</span>
            <span className="text-[#c9b897]">Dynamic AI</span>
          </div>

          <div className="space-y-2">
            {inventory.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#161619] border border-[#242429] flex items-start gap-3"
              >
                <div className="p-2 rounded bg-[#202026] text-[#c9b897] shrink-0 mt-0.5">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-[#e6e1d5] text-xs truncate">{item.name}</h5>
                    <span className="text-[9px] font-mono text-[#8e8d99] uppercase px-1.5 py-0.2 rounded bg-[#202026]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e8d99] line-clamp-2 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Active Quests */}
        <div className="space-y-2.5">
          <div className="text-[#8e8d99] font-mono text-[10px] uppercase tracking-wider">
            Chronicle Quests
          </div>

          <div className="space-y-2">
            {quests.map(quest => (
              <div
                key={quest.id}
                className="p-3 rounded-xl bg-[#161619] border border-[#242429] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-[#e6e1d5] text-xs flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-[#c9b897]" />
                    {quest.title}
                  </h5>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                    quest.status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {quest.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#8e8d99] leading-relaxed">{quest.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Met NPCs & Relationships */}
        {npcs.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-[#8e8d99] font-mono text-[10px] uppercase tracking-wider">
              Met NPCs & Relationships
            </div>

            <div className="space-y-2">
              {npcs.map(npc => (
                <div
                  key={npc.id}
                  className="p-3 rounded-xl bg-[#161619] border border-[#242429] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-[#e6e1d5] text-xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#c9b897]" />
                      {npc.name}
                    </h5>
                    <span className="text-[10px] font-mono text-[#8e8d99]">{npc.role}</span>
                  </div>

                  {/* Relationship Meter */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-[#8e8d99] font-mono">
                      <span>Affinity:</span>
                      <span className={npc.relationship >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {npc.relationship > 0 ? `+${npc.relationship}` : npc.relationship}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#202026] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          npc.relationship >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, Math.abs(npc.relationship)))}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#8e8d99] italic">{npc.statusNote}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
