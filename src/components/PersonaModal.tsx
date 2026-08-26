import React, { useState } from 'react';
import { PERSONAS_150, PersonaRole } from '../data/personas';
import { X, Users, Search } from 'lucide-react';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonas: PersonaRole[];
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  selectedPersonas
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Healthcare & Medicine',
    'Governance, Law & Politics',
    'Economics, Business & Labor',
    'Science & Environment',
    'Society, Culture & Religion'
  ];

  const filtered = PERSONAS_150.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.bias.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              ALVO 150 HUMAN PERSPECTIVE COUNCIL REGISTRY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-4 border-b border-[#262626] bg-[#0a0a0a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas by name, title, or bias..."
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-2 pl-10 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  activeCategory === cat
                    ? 'bg-white text-black font-bold border border-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Persona Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto custom-scrollbar flex-1">
          {filtered.map(p => {
            const isSelected = selectedPersonas.some(sp => sp.id === p.id);
            return (
              <div
                key={p.id}
                className={`group relative p-4 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#141414] border-white shadow-md'
                    : 'bg-[#0a0a0a] border-[#262626] opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl p-2 rounded-xl bg-[#0a0a0a] border border-[#262626]">{p.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-400">{p.title}</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-snug mb-2 font-sans">
                  <strong>Unwavering Stance:</strong> {p.bias}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#262626] text-neutral-400">
                  <span className="px-2 py-0.5 rounded bg-[#171717] text-neutral-300 border border-[#262626]">
                    {p.category}
                  </span>
                  <span>{isSelected ? 'Active Council' : 'Standby'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Showing {filtered.length} of {PERSONAS_150.length} Human Personas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-neutral-200 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
