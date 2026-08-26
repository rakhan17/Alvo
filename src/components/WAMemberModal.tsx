import React, { useState } from 'react';
import { WAMember } from '../data/personas';
import { X, Users, Plus, Trash2, UserPlus, Edit3 } from 'lucide-react';

interface WAMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: WAMember[];
  onAddMember: (newMember: WAMember) => void;
  onRemoveMember: (id: string) => void;
  onAutoGenerate: () => void;
  onSelectMemberToEdit: (member: WAMember) => void;
}

export const WAMemberModal: React.FC<WAMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onRemoveMember,
  onAutoGenerate,
  onSelectMemberToEdit
}) => {
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim() || !prompt.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (members.length >= 20) {
      setErrorMsg('Maximum 20 group members allowed.');
      return;
    }

    const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddMember({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      avatarColor: randomColor,
      status: 'online',
      personalityPrompt: prompt.trim()
    });

    setName('');
    setRoleTitle('');
    setPrompt('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111b21] border border-[#222d34] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222d34] bg-[#202c33]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              MANAGE WHATSAPP GROUP MEMBERS ({members.length}/20 AI)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Quick Auto-Generate Button */}
          <div className="bg-[#202c33] p-4 rounded-xl border border-[#222d34] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white font-mono">1-Click Auto Fill Group Squad</h4>
              <p className="text-[11px] text-[#8696a0] font-sans">
                Instantly populate your WhatsApp group with 20 diverse AI personalities!
              </p>
            </div>
            <button
              onClick={onAutoGenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-black font-bold text-xs transition shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Fill 20 Squad
            </button>
          </div>

          {/* Add New Member Form */}
          <form onSubmit={handleAdd} className="space-y-3 bg-[#182229] p-4 rounded-xl border border-[#222d34]">
            <h4 className="text-xs font-mono font-bold text-[#00a884] uppercase">
              Add Custom AI Group Member
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (e.g. Budi Skena)"
                className="bg-[#202c33] border border-[#222d34] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Role / Profession (e.g. Tukang Spam)"
                className="bg-[#202c33] border border-[#222d34] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="Personality & Style instructions (e.g. Suka galau, suka ledek temen, pake bahasa slang...)"
              className="w-full bg-[#202c33] border border-[#222d34] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />

            {errorMsg && <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>}

            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </form>

          {/* Existing Roster Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-[#8696a0] uppercase">
              Current Group Roster (Click Card to Edit Prompt)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {members.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMemberToEdit(m)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#202c33] border border-[#222d34] hover:border-[#00a884]/40 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate font-sans flex items-center gap-1">
                        {m.name} <Edit3 className="w-3 h-3 text-[#8696a0] group-hover:text-[#00a884] transition inline" />
                      </h5>
                      <p className="text-[10px] text-[#8696a0] truncate font-sans">{m.roleTitle}</p>
                    </div>
                  </div>

                  {!m.isAraa && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMember(m.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#8696a0] hover:text-rose-400 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#202c33] border-t border-[#222d34] flex items-center justify-between text-xs text-[#8696a0] font-mono">
          <span>Active Squad: {members.length} Members</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#374248] hover:bg-[#4a5860] text-white transition font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
