import React, { useState } from 'react';
import { PERSONAS_50, PersonaRole } from '../data/personas';
import { X, Users, Search, Shield, Filter } from 'lucide-react';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonas: PersonaRole[];
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose, selectedPersonas }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', 'Tech & Architecture', 'Risk & Economics', 'Ethics & Law', 'Strategy & Philosophy', 'Science & Security'];

  const filtered = PERSONAS_50.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()) || p.bias.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#090b10] border border-cyber-border rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.2)] flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border bg-cyber-card/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white font-sans">
              ALVO 50-AI PERSONA COUNCIL REGISTRY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-cyber-border/40 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-4 border-b border-cyber-border/60 bg-cyber-card/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas by name, title, or bias..."
              className="w-full bg-[#0f1420] border border-cyber-border rounded-xl px-4 py-2 pl-10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap gap-1 font-mono text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  activeCategory === cat
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-[0_0_10px_rgba(157,0,255,0.3)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Persona Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar flex-1">
          {filtered.map(p => {
            const isSelected = selectedPersonas.some(sp => sp.id === p.id);
            return (
              <div
                key={p.id}
                className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyber-card border-purple-500/40 shadow-[0_0_15px_rgba(157,0,255,0.15)]'
                    : 'bg-[#0f1420]/60 border-cyber-border/80 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl p-2 rounded-xl bg-[#090b10] border border-cyber-border">{p.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-mono text-purple-300">{p.title}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-snug mb-2 font-sans">
                  <strong>Bias:</strong> {p.bias}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-cyber-border/40 text-gray-400">
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/20">
                    {p.category}
                  </span>
                  <span>{isSelected ? 'Active Council' : 'Standby'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-cyber-card/60 border-t border-cyber-border flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Showing {filtered.length} of {PERSONAS_50.length} Personas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-gray-200 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
