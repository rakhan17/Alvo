import { useEffect, useState } from 'react';
import { WASidebar } from './components/WASidebar';
import { WAChatWindow } from './components/WAChatWindow';
import { WAMemberModal } from './components/WAMemberModal';
import { WAEditMemberModal } from './components/WAEditMemberModal';
import { waEngine, WAMessage } from './services/groupEngine';
import { WAMember } from './data/personas';

export function App() {
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [members, setMembers] = useState<WAMember[]>([]);
  const [typingMemberName, setTypingMemberName] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('ALVO Chaos Squad 🔥');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<WAMember | null>(null);

  useEffect(() => {
    const unsubscribe = waEngine.subscribe((state) => {
      setMessages(state.messages);
      setMembers(state.members);
      setTypingMemberName(state.typingMemberName);
      setGroupName(state.activeGroupName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendMessage = (text: string, replyTo?: { senderName: string; text: string }) => {
    waEngine.sendUserMessage(text, replyTo);
  };

  const handleAddMember = (newMember: WAMember) => {
    waEngine.addMember(newMember);
  };

  const handleRemoveMember = (id: string) => {
    waEngine.removeMember(id);
  };

  const handleSaveMember = (updatedMember: WAMember) => {
    waEngine.updateMember(updatedMember);
  };

  const handleAutoGenerate = () => {
    waEngine.autoGenerateMembers();
  };

  return (
    <div className="h-screen w-screen bg-[#0c1317] flex items-center justify-center p-0 md:p-3 overflow-hidden select-none font-sans">
      
      {/* WhatsApp Web Container */}
      <div className="w-full h-full max-w-[1600px] max-h-[1000px] bg-[#111b21] md:rounded-2xl overflow-hidden shadow-2xl flex border border-[#222d34]">
        
        {/* Left Sidebar */}
        <WASidebar
          groupName={groupName}
          members={members}
          onOpenMemberModal={() => setIsMemberModalOpen(true)}
          onAutoGenerate={handleAutoGenerate}
          onSelectMemberToEdit={(m) => setSelectedMemberToEdit(m)}
        />

        {/* Main Chat Window */}
        <WAChatWindow
          groupName={groupName}
          messages={messages}
          members={members}
          typingMemberName={typingMemberName}
          onSendMessage={handleSendMessage}
        />

      </div>

      {/* Member Management Modal */}
      <WAMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onAutoGenerate={handleAutoGenerate}
        onSelectMemberToEdit={(m) => setSelectedMemberToEdit(m)}
      />

      {/* Edit Character Modal */}
      <WAEditMemberModal
        member={selectedMemberToEdit}
        onClose={() => setSelectedMemberToEdit(null)}
        onSaveMember={handleSaveMember}
      />

    </div>
  );
}

export default App;
