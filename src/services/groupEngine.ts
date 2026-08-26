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

// Proactive Topic Pool for spontaneous chat starters
const PROACTIVE_TOPICS = [
  "Rakhan kok kamu diem aja dari tadi di grup? Lagi balesin chat cewek mana kamu hah?! 🔪😤",
  "Rakhan hubby kangen tauuu! Bales chat i donggg! 🥺❤️‍🔥",
  "JIRRR WEHH!! KALIEN UDAH DENGAR GOSIP HARI INI BELUM?! 🔥",
  "Woi bosen bgt jam segini, ada yang berani by 1 Mobile Legends ama gue gak?!",
  "Seandainya bisa muter waktu balik ke masa di mana kita masih bareng-bareng... 😭",
  "Production server kantor crash total wkwkwk mana kodingan belum di-commit ke Git!",
  "Guys recommend coffee shop Jaksel yang aesthetic & friendly buat WFH dong, which is tempat kemarin agak noisy",
  "Pemberitahuan: Kerja bakti hari Minggu jam 7 pagi ya bapak ibu sekalian, dimohon kehadiran & iuran kas RT-nya",
  "Menurut diagnosa medis saya, anggota grup ini mengalami sindrom kurang tidur kronis karena main HP malam-malam",
  "Demi apa kemaren liat harga Bitcoin naik drastis?! Waktunya To The Moon guys! 🚀",
  "Ada yang tau tempat makan mie ayam enak yang buka jam segini gak?",
  "Woi si Budi galau mulu di story IG wkwkwk cooked bgt lu Bud!",
  "Guys outfit buat kondangan besok bagusan batik atau kemeja polos ya?",
  "Kalian percaya gak sih kalo zodiak itu beneran ngaruh ke kepribadian orang?",
  "Beb tau gak sih kemaren si itu ketahuan selingkuh ditarik tangannya di mall?! 😱"
];

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

    // Fast-paced: Every 6-9 seconds, random AI members chat spontaneously
    this.spontaneousTimer = setInterval(() => {
      if (!this.isProcessing && this.messages.length > 0) {
        this.triggerSpontaneousChatter();
      }
    }, 7000);
  }

  private async triggerSpontaneousChatter() {
    this.isProcessing = true;

    const availableMembers = this.members.filter(m => m.status === 'online');
    if (availableMembers.length === 0) {
      this.isProcessing = false;
      return;
    }

    // High Araa frequency (45% chance)
    const isAraa = Math.random() < 0.45;
    const speaker = isAraa 
      ? this.members.find(m => m.id === 'araa') || availableMembers[0]
      : availableMembers[Math.floor(Math.random() * availableMembers.length)];

    this.typingMemberName = speaker.name;
    this.notify();

    await new Promise(r => setTimeout(r, 900 + Math.random() * 1100));

    const recentMsgs = this.messages.slice(-5);
    const lastMsg = recentMsgs[recentMsgs.length - 1];

    // Determine whether to launch a BRAND NEW PROACTIVE TOPIC or reply
    const isLaunchingNewTopic = Math.random() < 0.55;
    const chosenTopic = isLaunchingNewTopic 
      ? PROACTIVE_TOPICS[Math.floor(Math.random() * PROACTIVE_TOPICS.length)]
      : (lastMsg?.text || 'obrolan grup');

    const aiText = await this.callGroqAIResponse(speaker, chosenTopic, recentMsgs, isLaunchingNewTopic);

    this.typingMemberName = null;

    const msg: WAMessage = {
      id: `msg_ai_${Date.now()}`,
      senderId: speaker.id,
      senderName: speaker.name,
      senderColor: speaker.avatarColor,
      text: aiText,
      timestamp: Date.now(),
      isUser: false,
      replyToMsg: !isLaunchingNewTopic && Math.random() > 0.4 && lastMsg 
        ? { senderName: lastMsg.senderName, text: lastMsg.text } 
        : undefined
    };

    this.messages.push(msg);
    this.notify();

    // Unique multi-bubble follow-up spam
    if (Math.random() < 0.45) {
      await new Promise(r => setTimeout(r, 700));
      this.typingMemberName = speaker.name;
      this.notify();
      await new Promise(r => setTimeout(r, 900));
      
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
      await new Promise(r => setTimeout(r, 1000));

      const araaReply = await this.callGroqAIResponse(araa, userPrompt, this.messages.slice(-6), false);
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
      if (Math.random() < 0.55) {
        await new Promise(r => setTimeout(r, 600));
        this.typingMemberName = araa.name;
        this.notify();
        await new Promise(r => setTimeout(r, 900));
        
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
    if (otherMembers.length > 0 && Math.random() > 0.2) {
      await new Promise(r => setTimeout(r, 1100));
      const responder = otherMembers[Math.floor(Math.random() * otherMembers.length)];

      this.typingMemberName = responder.name;
      this.notify();
      await new Promise(r => setTimeout(r, 1000));

      const responderReply = await this.callGroqAIResponse(responder, userPrompt, this.messages.slice(-6), false);
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

  private async callGroqAIResponse(
    member: WAMember, 
    promptTopic: string, 
    recentHistory: WAMessage[],
    isProactiveTopic: boolean
  ): Promise<string> {
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
- ${isProactiveTopic ? 'INISIATIF BUKA TOPIK BARU YANG HEBOH/PROAKSI/SPICY!' : 'Jawab/tanggapi obrolan terakhir di grup!'}
- Jawab pendek 1-2 kalimat alami. Jangan kaku kayak robot!`
            },
            {
              role: 'user',
              content: `History Chat WA Terbaru:\n${historyStr}\n\nTopik/Bahasan: "${promptTopic}"\nKirim pesan WA kamu sekarang:`
            }
          ],
          temperature: 0.9,
          max_tokens: 120
        })
      });

      if (!response.ok) {
        return this.getProceduralFallback(member, promptTopic);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getProceduralFallback(member, promptTopic);
    } catch {
      return this.getProceduralFallback(member, promptTopic);
    }
  }

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
              content: `Kamu adalah "${member.name}" (${member.roleTitle}). Kamu baru saja mengirim pesan: "${previousBubbleText}". Sekarang kirim pesan lanjutan (follow-up bubble) 100% UNIK yang menyambung pesan pertamamu dalam 1 kalimat pendek WA.`
            },
            {
              role: 'user',
              content: `Kirim pesan lanjutan pendek yang berbeda dan unik:`
            }
          ],
          temperature: 0.95,
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
      const araaSpams = [
        'mana gak ada yang berani bales lg wkwk 😤❤️‍🔥',
        'Rakhan hubby bales donggg ih! 🥺',
        'awwas ya kalo cuekin Araa lagi!! 🔪'
      ];
      return araaSpams[Math.floor(Math.random() * araaSpams.length)];
    }

    const followups = [
      'wkwkwk bener kan kata gue 😭',
      'siapa lg yang mau bantah nih?',
      'gas lah gak usah banyak wacana jir'
    ];
    return followups[Math.floor(Math.random() * followups.length)];
  }

  // Procedural Fallback Generator - Zero Static Template Repetition!
  private getProceduralFallback(member: WAMember, topic: string): string {
    if (member.isAraa) {
      const araaPhrases = [
        `Rakhan hubby! Araa kangen tauu, kamu jangan cuekin Araa ihhh! ❤️‍🔥🥺`,
        `Rakhan! Siapa cewek yang tadi kamu obrolin hah?! Tak gilas pake ilmu hitam nanti! 🔪😤`,
        `Mana si Rakhan kok belom bales chat Araa di grup sih?! 😤`,
        `Rakhan sayang, u let him cook bgt harini tapi tetep punya Araa ya! ❤️‍🔥`
      ];
      return araaPhrases[Math.floor(Math.random() * araaPhrases.length)];
    }

    const prefixes = ['Jirrr', 'Wkwkwk', 'Wehhh', 'Anjay', 'Demi apa', 'Guys', 'Woi'];
    const actions = [
      'bahas masalah ini gak ada habisnya jir 😭',
      'mending gas mabar atau ngopi sekarang aja',
      'rame bgt grup harini wkwkwk',
      'si Budi pasti lagi nangis di pojokan wkwk',
      'server kantor crash lg gak sih wkwk'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    return `${prefix} ${action}`;
  }

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
