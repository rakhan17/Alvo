import { DebateConfig, DebateMessage, DebateStatus, ModeratorVerdict } from '../types/debate';
import { streamGroqChatCompletion } from './groqClient';

export type ArenaEngineListener = (state: {
  status: DebateStatus;
  currentTurn: 'DEBATER_A' | 'DEBATER_B' | 'MODERATOR' | null;
  activeRound: number;
  messages: DebateMessage[];
  verdict: ModeratorVerdict | null;
}) => void;

export class DebateArenaEngine {
  private config: DebateConfig;
  private status: DebateStatus = 'IDLE';
  private currentTurn: 'DEBATER_A' | 'DEBATER_B' | 'MODERATOR' | null = null;
  private activeRound = 1;
  private messages: DebateMessage[] = [];
  private verdict: ModeratorVerdict | null = null;
  private listeners: Set<ArenaEngineListener> = new Set();
  private isPaused = false;

  constructor(config: DebateConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: DebateConfig) {
    this.config = newConfig;
  }

  public subscribe(listener: ArenaEngineListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({
        status: this.status,
        currentTurn: this.currentTurn,
        activeRound: this.activeRound,
        messages: [...this.messages],
        verdict: this.verdict
      });
    }
  }

  public async startDebate() {
    if (this.status === 'RUNNING') return;

    this.status = 'RUNNING';
    this.isPaused = false;
    this.messages = [];
    this.verdict = null;
    this.activeRound = 1;
    this.notify();

    // 1. Moderator Intro Statement
    await this.executeModeratorIntro();

    // 2. Execute Round Loop (Round 1 to N)
    for (let round = 1; round <= this.config.rounds; round++) {
      if (this.status !== 'RUNNING') break;
      this.activeRound = round;

      // Debater A (Pro) Turn
      await this.executeDebaterTurn('DEBATER_A', round, round === 1 ? 'ARGUMENT' : 'REBUTTAL');
      if (this.checkPausedOrStopped()) await this.waitIfPaused();

      // Debater B (Contra) Turn
      await this.executeDebaterTurn('DEBATER_B', round, round === 1 ? 'ARGUMENT' : 'COUNTER');
      if (this.checkPausedOrStopped()) await this.waitIfPaused();
    }

    // 3. Moderator Final Verdict
    if (this.status === 'RUNNING') {
      await this.executeModeratorVerdict();
      this.status = 'COMPLETED';
      this.currentTurn = null;
      this.notify();
    }
  }

  public pauseDebate() {
    if (this.status === 'RUNNING') {
      this.isPaused = true;
      this.status = 'PAUSED';
      this.notify();
    }
  }

  public resumeDebate() {
    if (this.status === 'PAUSED') {
      this.isPaused = false;
      this.status = 'RUNNING';
      this.notify();
    }
  }

  public resetDebate() {
    this.status = 'IDLE';
    this.isPaused = false;
    this.currentTurn = null;
    this.activeRound = 1;
    this.messages = [];
    this.verdict = null;
    this.notify();
  }

  private checkPausedOrStopped() {
    return this.isPaused || this.status !== 'RUNNING';
  }

  private async waitIfPaused() {
    while (this.isPaused && this.status === 'PAUSED') {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  private async executeModeratorIntro() {
    this.currentTurn = 'MODERATOR';
    const modConfig = this.config.moderator;

    const msgId = `msg_mod_intro_${Date.now()}`;
    const newMsg: DebateMessage = {
      id: msgId,
      role: 'MODERATOR',
      senderName: modConfig.name,
      modelUsed: modConfig.model,
      text: '',
      timestamp: Date.now(),
      roundIndex: 0,
      turnType: 'INTRO',
      isStreaming: true
    };

    this.messages.push(newMsg);
    this.notify();

    const userPrompt = `You are the Moderator. Introduce the debate topic motion: "${this.config.topic}". Introduce Debater A (${this.config.debaterA.name} - PRO stance) and Debater B (${this.config.debaterB.name} - CONTRA stance). State the floor rules and give the floor to Debater A for Round 1!`;

    const stream = streamGroqChatCompletion(modConfig.model, modConfig.systemPrompt, userPrompt);
    for await (const chunk of stream) {
      newMsg.text += chunk;
      this.notify();
    }

    newMsg.isStreaming = false;
    this.notify();
  }

  private async executeDebaterTurn(
    role: 'DEBATER_A' | 'DEBATER_B', 
    round: number, 
    turnType: 'ARGUMENT' | 'REBUTTAL' | 'COUNTER'
  ) {
    this.currentTurn = role;
    const debater = role === 'DEBATER_A' ? this.config.debaterA : this.config.debaterB;
    const opponent = role === 'DEBATER_A' ? this.config.debaterB : this.config.debaterA;

    const historyStr = this.messages.map(m => `[${m.senderName} (${m.role})]: ${m.text}`).join('\n\n');

    const userPrompt = `Debate Topic Motion: "${this.config.topic}"
Round: ${round} of ${this.config.rounds}
Your Stance: ${debater.stance} (${debater.name})
Opponent Stance: ${opponent.stance} (${opponent.name})

Transcript of Debate So Far:
${historyStr}

Instruction for your Turn (${turnType}):
Present your sharpest argument, counter your opponent's points directly with evidence and logic, and reinforce why your stance is correct! Keep it punchy and persuasive (150-250 words).`;

    const msgId = `msg_${role}_r${round}_${Date.now()}`;
    const newMsg: DebateMessage = {
      id: msgId,
      role,
      senderName: debater.name,
      modelUsed: debater.model,
      text: '',
      timestamp: Date.now(),
      roundIndex: round,
      turnType,
      isStreaming: true
    };

    this.messages.push(newMsg);
    this.notify();

    const stream = streamGroqChatCompletion(debater.model, debater.systemPrompt, userPrompt);
    for await (const chunk of stream) {
      newMsg.text += chunk;
      this.notify();
    }

    newMsg.isStreaming = false;
    this.notify();
  }

  private async executeModeratorVerdict() {
    this.currentTurn = 'MODERATOR';
    const modConfig = this.config.moderator;

    const historyStr = this.messages.map(m => `[${m.senderName} (${m.role})]: ${m.text}`).join('\n\n');

    const userPrompt = `Debate Topic Motion: "${this.config.topic}"

Full Transcript of Debate:
${historyStr}

Instruction:
As the Moderator and Chief Judge:
1. Summarize the major clashes and pivotal arguments.
2. Evaluate Debater A (${this.config.debaterA.name}) and Debater B (${this.config.debaterB.name}).
3. Point out any logical fallacies or weak premises.
4. Declare the WINNING stance (DEBATER_A or DEBATER_B) based strictly on logical coherence and argumentation quality.

Provide your final summary statement:`;

    const msgId = `msg_mod_verdict_${Date.now()}`;
    const newMsg: DebateMessage = {
      id: msgId,
      role: 'MODERATOR',
      senderName: modConfig.name,
      modelUsed: modConfig.model,
      text: '',
      timestamp: Date.now(),
      roundIndex: this.config.rounds + 1,
      turnType: 'VERDICT',
      isStreaming: true
    };

    this.messages.push(newMsg);
    this.notify();

    const stream = streamGroqChatCompletion(modConfig.model, modConfig.systemPrompt, userPrompt);
    for await (const chunk of stream) {
      newMsg.text += chunk;
      this.notify();
    }

    newMsg.isStreaming = false;

    // Determine winner based on text contents
    const textLower = newMsg.text.toLowerCase();
    const isAWinner = textLower.includes(this.config.debaterA.name.toLowerCase()) || textLower.includes('debater a') || textLower.includes('pro');
    
    this.verdict = {
      summary: newMsg.text.slice(0, 200) + '...',
      debaterAStrengths: ['Structured logical framework', 'Direct empirical evidence', 'Clear thesis retention'],
      debaterBStrengths: ['Pragmatic counter-examples', 'Targeted rebuttal of edge cases', 'Rhetorical clarity'],
      clashAnalysis: 'Primary tension centered on systemic risks versus economic acceleration.',
      winner: isAWinner ? 'DEBATER_A' : 'DEBATER_B',
      winnerReasoning: newMsg.text
    };

    this.notify();
  }
}
