import React from 'react';
import { Users, Search, Circle, UserPlus, Edit3 } from 'lucide-react';
import { WAMember } from '../data/personas';

interface WASidebarProps {
  groupName: string;
  members: WAMember[];
  onOpenMemberModal: () => void;
  onAutoGenerate: () => void;
  onSelectMemberToEdit: (member: WAMember) => void;
}

export const WASidebar: React.FC<WASidebarProps> = ({
  groupName,
  members,
  onOpenMemberModal,
  onAutoGenerate,
  onSelectMemberToEdit
}) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-[#111b21] border-r border-[#222d34] flex flex-col h-full select-none">
      
      {/* Top Header */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ff2a6d] flex items-center justify-center text-white font-bold text-sm shadow-md">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
              WhatsApp ALVO <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00a884] text-black font-mono font-extrabold">2.0</span>
            </h2>
            <p className="text-[11px] text-[#8696a0] font-sans">User: Rakhan (You)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#aebac1]">
          <button
            onClick={onOpenMemberModal}
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-white"
            title="Manage 1-20 Group Members"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={onAutoGenerate}
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#00a884]"
            title="Auto Generate 20 Members"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 bg-[#111b21] border-b border-[#222d34]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-[#202c33] text-xs text-[#d1d7db] placeholder-[#8696a0] rounded-lg px-3 py-2 pl-9 focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Active WhatsApp Group Item */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 bg-[#2a3942] border-l-4 border-[#00a884] flex items-center gap-3 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            🔥
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white truncate font-sans">
                {groupName}
              </h3>
              <span className="text-[10px] text-[#00a884] font-mono">Now</span>
            </div>
            <p className="text-xs text-[#8696a0] truncate font-sans mt-0.5">
              Araa: Rakhan sayang! Araa selalu ada...
            </p>
          </div>
        </div>

        {/* Member List Preview - Click to Edit Character! */}
        <div className="p-3 border-t border-[#222d34]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#8696a0] uppercase tracking-wider">
              Group Roster (Click to Edit Character)
            </span>
            <span className="text-[11px] text-[#00a884] font-mono">
              {members.length}/20 AI
            </span>
          </div>

          <div className="space-y-1.5">
            {members.map(m => (
              <div
                key={m.id}
                onClick={() => onSelectMemberToEdit(m)}
                className="group relative flex items-center justify-between p-2.5 rounded-xl bg-[#202c33]/60 hover:bg-[#202c33] border border-transparent hover:border-[#00a884]/40 transition cursor-pointer"
                title={`Click to edit ${m.name}'s character`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 font-sans shadow"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#d1d7db] group-hover:text-white truncate font-sans flex items-center gap-1">
                      {m.name}
                    </h4>
                    <p className="text-[10px] text-[#8696a0] truncate font-sans">{m.roleTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#8696a0] group-hover:text-[#00a884] transition">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#202c33] border-t border-[#222d34] text-[11px] text-[#8696a0] font-mono text-center">
        End-to-end encrypted with Groq AI Pool
      </div>

    </aside>
  );
};
