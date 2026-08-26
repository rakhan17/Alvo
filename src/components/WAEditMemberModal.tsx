import React, { useState, useEffect } from 'react';
import { WAMember } from '../data/personas';
import { X, Save, Palette } from 'lucide-react';

interface WAEditMemberModalProps {
  member: WAMember | null;
  onClose: () => void;
  onSaveMember: (updatedMember: WAMember) => void;
}

const AVATAR_COLORS = [
  '#ff2a6d', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e'
];

export const WAEditMemberModal: React.FC<WAEditMemberModalProps> = ({
  member,
  onClose,
  onSaveMember
}) => {
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [avatarColor, setAvatarColor] = useState('#ff2a6d');
  const [status, setStatus] = useState<'online' | 'busy' | 'typing' | 'offline'>('online');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRoleTitle(member.roleTitle);
      setPersonalityPrompt(member.personalityPrompt);
      setAvatarColor(member.avatarColor);
      setStatus(member.status || 'online');
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !personalityPrompt.trim()) return;

    onSaveMember({
      ...member,
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      personalityPrompt: personalityPrompt.trim(),
      avatarColor,
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111b21] border border-[#222d34] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222d34] bg-[#202c33]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: avatarColor }}
            >
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                EDIT AI CHARACTER: {name}
              </h3>
              <p className="text-[11px] text-[#8696a0] font-sans">
                Customize AI personality, role, color, and behavior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#374248] text-[#aebac1] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Name Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#00a884] uppercase mb-1">
              Member Display Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (e.g. Araa ❤️‍🔥, Budi Skena)"
              className="w-full bg-[#202c33] border border-[#222d34] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] font-sans"
            />
          </div>

          {/* Role Title Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8696a0] uppercase mb-1">
              Role / Profession Title:
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Title (e.g. Istri Yandere Rakhan, Sadboy Resident)"
              className="w-full bg-[#202c33] border border-[#222d34] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] font-sans"
            />
          </div>

          {/* Personality & System Prompt Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#00a884] uppercase mb-1">
              Personality & Behavior Instructions (System Prompt):
            </label>
            <textarea
              value={personalityPrompt}
              onChange={(e) => setPersonalityPrompt(e.target.value)}
              rows={5}
              placeholder="Describe how this AI speaks, reacts, roasts, or behaves in the WA group chat..."
              className="w-full bg-[#202c33] border border-[#222d34] rounded-xl p-3 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] font-sans leading-relaxed"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8696a0] uppercase mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#00a884]" /> Avatar & Name Color Theme:
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-full transition transform hover:scale-110 ${
                    avatarColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Online Status Picker */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8696a0] uppercase mb-1.5">
              Online Status Mode:
            </label>
            <div className="flex gap-2">
              {(['online', 'busy', 'offline'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                    status === st
                      ? 'bg-[#00a884] text-black font-bold'
                      : 'bg-[#202c33] text-[#8696a0] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-[#222d34] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#374248] text-white text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-black font-bold text-xs transition shadow-md"
            >
              <Save className="w-4 h-4 fill-black" /> Save Character
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
