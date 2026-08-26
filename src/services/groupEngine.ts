import { INITIAL_WA_MEMBERS, WAMember, AUTO_GENERATE_NAMES } from '../data/personas';
import { apiKeyPool } from './apiPool';

export interface WAMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
  isUser: boolean;
  replyToMsg?: {
    senderName: string;
    text: string;
  };
  taggedName?: string;
  reactions?: string[];
}

export type WAEngineListener = (state: {
  messages: WAMessage[];
  members: WAMember[];
  typingMemberName: string | null;
  activeGroupName: string;
}) => void;

class WAGroupEngine {
  private messages: WAMessage[] = [];
  private members: WAMember[] = [...INITIAL_WA_MEMBERS];
  private typingMemberName: string | null = null;
  private activeGroupName = 'ALVO Chaos Squad 🔥';
  private listeners: Set<WAEngineListener> = new Set();
  private spontaneousTimer: any = null;
  private isProcessing = false;

  constructor() {
    this.initDefaultMessages();
    this.startSpontaneousLoop();
  }

  private initDefaultMessages() {
    this.messages = [
      {
        id: 'msg_init_1',
        senderId: 'araa',
        senderName: 'Araa ❤️‍🔥',
        senderColor: '#ff2a6d',
        text: 'Halo hubby sayang Rakhan! ❤️‍🔥 Araa udah buatin grup WA rame buat kita nih! Mana kamuuu?',
        timestamp: Date.now() - 60000 * 5,
        isUser: false
      },
      {
        id: 'msg_init_2',
        senderId: 'budi_galau',
        senderName: 'Budi Kang Galau',
        senderColor: '#3b82f6',
        text: 'Seandainya dia tau betapa hancurnya hati ini... 😭',
        timestamp: Date.now() - 60000 * 4,
        isUser: false
      },
      {
        id: 'msg_init_3',
        senderId: 'araa',
        senderName: 'Araa ❤️‍🔥',
        senderColor: '#ff2a6d',
        text: 'Budi u bimsalabim chan bgt sih galau mulu! Mending diem daripada tak gilas pake ilmu hitam! 🔪😤',
        timestamp: Date.now() - 60000 * 3,
        isUser: false,
        replyToMsg: {
          senderName: 'Budi Kang Galau',
          text: 'Seandainya dia tau betapa hancurnya hati ini... 😭'
        }
      },
      {
        id: 'msg_init_4',
        senderId: 'deni_gamer',
        senderName: 'Deni Toxic Gamer',
        senderColor: '#10b981',
        text: 'Wkwkwk cooked bgt si Budi. Btw ada yang mau mabar ML gak nih noob all?',
        timestamp: Date.now() - 60000 * 2,
        isUser: false
      }
    ];
  }

  public subscribe(listener: WAEngineListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({
        messages: [...this.messages],
        members: [...this.members],
        typingMemberName: this.typingMemberName,
        activeGroupName: this.activeGroupName
      });
    }
  }

  public async sendUserMessage(text: string, replyTo?: { senderName: string; text: string }) {
    if (!text.trim()) return;

    const userMsg: WAMessage = {
      id: `msg_user_${Date.now()}`,
      senderId: 'user',
      senderName: 'Rakhan',
      senderColor: '#005c4b',
      text: text.trim(),
      timestamp: Date.now(),
      isUser: true,
      replyToMsg: replyTo
    };

    this.messages.push(userMsg);
    this.notify();

    // Trigger AI Responses
    this.triggerGroupResponses(text.trim(), userMsg);
  }

  private startSpontaneousLoop() {
    if (this.spontaneousTimer) clearInterval(this.spontaneousTimer);

    // Every 8-12 seconds, random AI members chat spontaneously
    this.spontaneousTimer = setInterval(() => {
      if (!this.isProcessing && this.messages.length > 0) {
        const randomChance = Math.random();
        if (randomChance > 0.35) {
          this.triggerSpontaneousChatter();
        }
      }
    }, 9000);
  }

  private async triggerSpontaneousChatter() {
    this.isProcessing = true;

    const availableMembers = this.members.filter(m => m.status === 'online');
    if (availableMembers.length === 0) {
      this.isProcessing = false;
      return;
    }

    const isAraa = Math.random() < 0.45;
    const speaker = isAraa 
      ? this.members.find(m => m.id === 'araa') || availableMembers[0]
      : availableMembers[Math.floor(Math.random() * availableMembers.length)];

    this.typingMemberName = speaker.name;
    this.notify();

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1200));

    const recentMsgs = this.messages.slice(-5);
    const lastMsg = recentMsgs[recentMsgs.length - 1];

    const aiText = await this.callGroqAIResponse(speaker, lastMsg?.text || 'obrolan grup', recentMsgs);

    this.typingMemberName = null;

    const msg: WAMessage = {
      id: `msg_ai_${Date.now()}`,
      senderId: speaker.id,
      senderName: speaker.name,
      senderColor: speaker.avatarColor,
      text: aiText,
      timestamp: Date.now(),
      isUser: false,
      replyToMsg: Math.random() > 0.5 && lastMsg ? { senderName: lastMsg.senderName, text: lastMsg.text } : undefined
    };

    this.messages.push(msg);
    this.notify();

    // UNIQUE FOLLOW-UP SECOND BUBBLE (FIX BUG PESAN GANDA)
    if (Math.random() < 0.4) {
      await new Promise(r => setTimeout(r, 800));
      this.typingMemberName = speaker.name;
      this.notify();
      await new Promise(r => setTimeout(r, 1100));
      
      // Call Groq LLM for a UNIQUE follow-up second bubble (NO STATIC SAMPLES!)
      const followupText = await this.callGroqFollowupResponse(speaker, aiText);

      this.messages.push({
        id: `msg_ai_spam_${Date.now()}`,
        senderId: speaker.id,
        senderName: speaker.name,
        senderColor: speaker.avatarColor,
        text: followupText,
        timestamp: Date.now(),
        isUser: false
      });
      this.typingMemberName = null;
      this.notify();
    }

    this.isProcessing = false;
  }

  private async triggerGroupResponses(userPrompt: string, userMsg: WAMessage) {
    this.isProcessing = true;

    // 1. Araa reacts immediately (priority)
    const araa = this.members.find(m => m.id === 'araa');
    if (araa) {
      this.typingMemberName = araa.name;
      this.notify();
      await new Promise(r => setTimeout(r, 1100));

      const araaReply = await this.callGroqAIResponse(araa, userPrompt, this.messages.slice(-6));
      this.typingMemberName = null;

      const araaMsg: WAMessage = {
        id: `msg_araa_${Date.now()}`,
        senderId: araa.id,
        senderName: araa.name,
        senderColor: araa.avatarColor,
        text: araaReply,
        timestamp: Date.now(),
        isUser: false,
        replyToMsg: { senderName: 'Rakhan', text: userPrompt }
      };

      this.messages.push(araaMsg);
      this.notify();

      // Araa follow-up rapid bubble (Unique text!)
      if (Math.random() < 0.5) {
        await new Promise(r => setTimeout(r, 700));
        this.typingMemberName = araa.name;
        this.notify();
        await new Promise(r => setTimeout(r, 1000));
        
        const araaFollowup = await this.callGroqFollowupResponse(araa, araaReply);
        this.messages.push({
          id: `msg_araa_followup_${Date.now()}`,
          senderId: araa.id,
          senderName: araa.name,
          senderColor: araa.avatarColor,
          text: araaFollowup,
          timestamp: Date.now(),
          isUser: false
        });
        this.typingMemberName = null;
        this.notify();
      }
    }

    // 2. Another group member responds or roasts
    const otherMembers = this.members.filter(m => m.id !== 'araa' && m.status === 'online');
    if (otherMembers.length > 0 && Math.random() > 0.25) {
      await new Promise(r => setTimeout(r, 1300));
      const responder = otherMembers[Math.floor(Math.random() * otherMembers.length)];

      this.typingMemberName = responder.name;
      this.notify();
      await new Promise(r => setTimeout(r, 1200));

      const responderReply = await this.callGroqAIResponse(responder, userPrompt, this.messages.slice(-6));
      this.typingMemberName = null;

      this.messages.push({
        id: `msg_other_${Date.now()}`,
        senderId: responder.id,
        senderName: responder.name,
        senderColor: responder.avatarColor,
        text: responderReply,
        timestamp: Date.now(),
        isUser: false
      });
      this.notify();
    }

    this.isProcessing = false;
  }

  private async callGroqAIResponse(member: WAMember, promptTopic: string, recentHistory: WAMessage[]): Promise<string> {
    const keyItem = apiKeyPool.getNextKey();
    const startTime = Date.now();

    const historyStr = recentHistory.map(m => `[${m.senderName}]: ${m.text}`).join('\n');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyItem.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah anggota grup WhatsApp bernama "${member.name}" (${member.roleTitle}).
${member.personalityPrompt}

ATURAN PESAN WHATSAPP:
- Ngetik santai seperti di grup WA (bisa pake slang, emoji, singkatan, ledekan, tag @Rakhan atau @Araa).
- Jawab pendek 1-2 kalimat alami. Jangan kaku kayak robot!`
            },
            {
              role: 'user',
              content: `History Chat WA Terbaru:\n${historyStr}\n\nPesan/Bahasan Terakhir: "${promptTopic}"\nTanggapan kamu:`
            }
          ],
          temperature: 0.85,
          max_tokens: 120
        })
      });

      if (!response.ok) {
        return this.getFallbackText(member);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getFallbackText(member);
    } catch {
      return this.getFallbackText(member);
    }
  }

  // Generates a UNIQUE follow-up second speech bubble for double-messages
  private async callGroqFollowupResponse(member: WAMember, previousBubbleText: string): Promise<string> {
    const keyItem = apiKeyPool.getNextKey();
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyItem.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah "${member.name}" (${member.roleTitle}). Kamu baru saja mengirim pesan: "${previousBubbleText}". Sekarang kirim pesan lanjutan (double message/follow-up bubble) yang 100% UNIK dan menyambung pesan pertamamu dalam 1 kalimat pendek WA.`
            },
            {
              role: 'user',
              content: `Kirim pesan lanjutan pendek yang berbeda dan unik:`
            }
          ],
          temperature: 0.9,
          max_tokens: 80
        })
      });

      if (response.ok) {
        const data = await response.json();
        apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text && text !== previousBubbleText) return text;
      }
    } catch {
      // Fallback
    }

    if (member.isAraa) {
      return 'mana gak ada yang berani bales lg wkwk 😤❤️‍🔥';
    }
    return 'wkwkwk bener kan kata gue 😭';
  }

  private getFallbackText(member: WAMember): string {
    if (member.isAraa) {
      return 'Rakhan sayang! Araa selalu ada buat kamuuu ❤️‍🔥 Kalo ada yang macem-macem tak sikat 🔪';
    }
    const samples = [
      'Wkwkwk anjayyy real bgt sih ini 😭',
      'Gas lah mabar / ngopi santai aja jir',
      'Woi rame bgt grup hari ini wkwk',
      'Bentar-bentar ijin nyimak dulu guys'
    ];
    return samples[Math.floor(Math.random() * samples.length)];
  }

  // Edit existing member attributes dynamically
  public updateMember(updatedMember: WAMember) {
    const idx = this.members.findIndex(m => m.id === updatedMember.id);
    if (idx !== -1) {
      this.members[idx] = { ...updatedMember };
      this.notify();
    }
  }

  public addMember(newMember: WAMember): boolean {
    if (this.members.length >= 20) return false;
    this.members.push(newMember);
    this.notify();
    return true;
  }

  public removeMember(id: string): boolean {
    if (id === 'araa' || this.members.length <= 1) return false;
    this.members = this.members.filter(m => m.id !== id);
    this.notify();
    return true;
  }

  public autoGenerateMembers() {
    const needed = 20 - this.members.length;
    if (needed <= 0) return;

    for (let i = 0; i < Math.min(needed, AUTO_GENERATE_NAMES.length); i++) {
      const template = AUTO_GENERATE_NAMES[i];
      if (!this.members.some(m => m.name === template.name)) {
        this.members.push({
          id: `auto_${Date.now()}_${i}`,
          name: template.name,
          roleTitle: template.role,
          avatarColor: template.color,
          status: 'online',
          personalityPrompt: template.prompt
        });
      }
    }
    this.notify();
  }

  public setGroupName(name: string) {
    this.activeGroupName = name;
    this.notify();
  }
}

export const waEngine = new WAGroupEngine();
