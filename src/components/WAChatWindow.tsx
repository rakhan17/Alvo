import React, { useState, useRef, useEffect } from 'react';
import { WAMessage } from '../services/groupEngine';
import { WAMember } from '../data/personas';
import { 
  Send, Smile, Paperclip, Mic, Phone, Video, Search, MoreVertical, 
  CheckCheck, CornerUpLeft, X, AtSign
} from 'lucide-react';

interface WAChatWindowProps {
  groupName: string;
  messages: WAMessage[];
  members: WAMember[];
  typingMemberName: string | null;
  onSendMessage: (text: string, replyTo?: { senderName: string; text: string }) => void;
}

export const WAChatWindow: React.FC<WAChatWindowProps> = ({
  groupName,
  messages,
  members,
  typingMemberName,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ senderName: string; text: string } | null>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMemberName]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
    setShowTagMenu(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val.endsWith('@')) {
      setShowTagMenu(true);
    } else if (!val.includes('@')) {
      setShowTagMenu(false);
    }
  };

  const handleSelectTag = (memberName: string) => {
    setInputText(prev => `${prev}${memberName.replace(/\s+/g, '')} `);
    setShowTagMenu(false);
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#0b141a] relative select-none overflow-hidden">
      
      {/* 1. Header Bar */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34] z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            🔥
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              {groupName}
            </h2>
            <p className="text-[11px] text-[#8696a0] font-sans truncate max-w-xs md:max-w-md">
              {typingMemberName ? (
                <span className="text-[#00a884] font-semibold animate-pulse font-mono">
                  {typingMemberName} is typing...
                </span>
              ) : (
                members.map(m => m.name.split(' ')[0]).join(', ')
              )}
            </p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button className="hover:text-white transition"><Video className="w-5 h-5" /></button>
          <button className="hover:text-white transition"><Phone className="w-5 h-5" /></button>
          <div className="w-px h-5 bg-[#374248]" />
          <button className="hover:text-white transition"><Search className="w-5 h-5" /></button>
          <button className="hover:text-white transition"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* 2. Messages Feed Area with WhatsApp Wallpaper Pattern */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar relative bg-[#0b141a]">
        
        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="bg-[#182229] text-[#8696a0] text-[11px] font-mono px-3 py-1 rounded-lg uppercase shadow-sm">
            TODAY
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} group`}
          >
            <div
              className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-lg p-2.5 shadow-md font-sans text-xs ${
                msg.isUser
                  ? 'bg-[#005c4b] text-white rounded-tr-none'
                  : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
              }`}
            >
              {/* Quote Reply Box Preview if present */}
              {msg.replyToMsg && (
                <div className="mb-2 p-2 rounded bg-black/20 border-l-4 border-[#00a884] text-[11px]">
                  <span className="font-bold text-[#00a884] block font-mono">
                    {msg.replyToMsg.senderName}
                  </span>
                  <span className="text-[#8696a0] line-clamp-1 italic">
                    {msg.replyToMsg.text}
                  </span>
                </div>
              )}

              {/* AI Sender Name */}
              {!msg.isUser && (
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="font-bold text-xs font-sans tracking-wide"
                    style={{ color: msg.senderColor }}
                  >
                    {msg.senderName}
                  </span>

                  {/* Reply Button on Hover */}
                  <button
                    onClick={() => setReplyingTo({ senderName: msg.senderName, text: msg.text })}
                    className="opacity-0 group-hover:opacity-100 text-[#8696a0] hover:text-white transition p-0.5"
                    title="Reply to this message"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Content Text */}
              <p className="leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </p>

              {/* Timestamp & Read Receipts */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] font-mono mt-1">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.isUser && (
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                )}
              </div>

            </div>
          </div>
        ))}

        {/* Typing Bubble Indicator */}
        {typingMemberName && (
          <div className="flex items-start gap-2">
            <div className="bg-[#202c33] text-[#e9edef] rounded-lg px-4 py-2 text-xs flex items-center gap-2 shadow-md">
              <span className="font-mono text-[#00a884] font-bold">{typingMemberName}</span>
              <span className="animate-pulse">is typing...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Reply Target Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#182229] border-t border-[#222d34] flex items-center justify-between text-xs">
          <div className="border-l-4 border-[#00a884] pl-3 min-w-0">
            <span className="font-bold text-[#00a884] block font-mono">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-[#8696a0] truncate block italic">
              "{replyingTo.text}"
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-[#8696a0] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Tag Autocomplete Popup Menu */}
      {showTagMenu && (
        <div className="absolute bottom-16 left-4 z-30 bg-[#202c33] border border-[#222d34] rounded-xl p-2 max-h-48 overflow-y-auto custom-scrollbar shadow-2xl w-64">
          <div className="text-[10px] text-[#8696a0] font-mono px-2 py-1 uppercase">
            Tag Group Member:
          </div>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelectTag(m.name)}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-[#111b21] flex items-center gap-2 text-xs text-white"
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: m.avatarColor }}>
                {m.name.charAt(0)}
              </span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 5. Bottom Input Bar */}
      <form onSubmit={handleSend} className="h-16 px-4 bg-[#202c33] flex items-center gap-3 border-t border-[#222d34] z-20">
        <button type="button" className="text-[#aebac1] hover:text-white transition">
          <Smile className="w-6 h-6" />
        </button>
        <button type="button" className="text-[#aebac1] hover:text-white transition">
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message or type @ to mention someone..."
            className="w-full bg-[#2a3942] text-xs md:text-sm text-[#d1d7db] placeholder-[#8696a0] rounded-lg px-4 py-2.5 focus:outline-none font-sans"
          />
        </div>

        {inputText.trim() ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f70] flex items-center justify-center text-black transition shadow-md"
          >
            <Send className="w-4 h-4 fill-black" />
          </button>
        ) : (
          <button type="button" className="text-[#aebac1] hover:text-white transition">
            <Mic className="w-6 h-6" />
          </button>
        )}
      </form>

    </main>
  );
};
