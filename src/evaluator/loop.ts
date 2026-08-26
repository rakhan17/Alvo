import { EventEmitter } from 'events';
import { ContextCollector } from '../collector/index.js';
import { LLMProvider } from '../llm/types.js';
import { ValidatedPersonaConfig } from '../config/schema.js';
import { SystemSnapshot, ProactiveDecision, AlvoStatus, ChatMessage } from '../types/index.js';
import { buildProactiveSystemPrompt, buildProactiveUserPrompt, buildChatSystemPrompt } from './prompts.js';

export interface EvaluatorEvents {
  statusChange: (status: AlvoStatus, detail?: string) => void;
  proactiveMessage: (message: ChatMessage) => void;
  snapshotCaptured: (snapshot: SystemSnapshot) => void;
  error: (err: Error) => void;
}

export class EvaluatorLoop extends EventEmitter {
  private collector: ContextCollector;
  private provider: LLMProvider;
  private config: ValidatedPersonaConfig;
  private isRunning: boolean = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private lastSpokenTimestamp: number = 0;
  private currentStatus: AlvoStatus = 'idle';
  private conversationHistory: ChatMessage[] = [];

  constructor(collector: ContextCollector, provider: LLMProvider, config: ValidatedPersonaConfig) {
    super();
    this.collector = collector;
    this.provider = provider;
    this.config = config;
  }

  public getStatus(): AlvoStatus {
    return this.currentStatus;
  }

  private setStatus(status: AlvoStatus, detail?: string) {
    this.currentStatus = status;
    this.emit('statusChange', status, detail);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('watching', `Autonomous watcher active (${this.config.scanIntervalSeconds}s interval)`);

    // Run first evaluation after short initial delay (2s)
    setTimeout(() => {
      if (this.isRunning) {
        this.runCycle();
      }
    }, 2000);

    // Fast autonomous loop
    const intervalMs = Math.max(3000, (this.config.scanIntervalSeconds || 10) * 1000);
    this.intervalTimer = setInterval(() => {
      if (this.isRunning) {
        this.runCycle();
      }
    }, intervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.setStatus('idle');
  }

  public addMessageToHistory(msg: ChatMessage) {
    this.conversationHistory.push(msg);
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }
  }

  public async runCycle(): Promise<void> {
    try {
      // 1. Capture snapshot and test for diff
      const snapshot = await this.collector.collectSnapshot(this.config);
      this.emit('snapshotCaptured', snapshot);

      // 2. Diff throttle: If context hasn't changed at all, skip evaluation
      if (!snapshot.isDiffFromLast) {
        this.setStatus('watching', `Active: ${snapshot.window.appName} (idle/no change)`);
        return;
      }

      // 3. Rate limiting / cooldown check:
      // Minimum cool-down between unsolicited remarks
      const now = Date.now();
      const cooldownMs = this.config.sensitivity === 'high' ? 15000 : this.config.sensitivity === 'low' ? 60000 : 30000;

      if (now - this.lastSpokenTimestamp < cooldownMs) {
        this.setStatus('watching', `Active: ${snapshot.window.appName} (observing)`);
        return;
      }

      // 4. Send to LLM
      this.setStatus('thinking', `Araa is observing ${snapshot.window.appName}...`);

      const recentSummary = this.conversationHistory
        .slice(-4)
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const systemPrompt = buildProactiveSystemPrompt(this.config);
      const userPrompt = buildProactiveUserPrompt(snapshot, recentSummary);
      const images = snapshot.screen?.base64Image ? [snapshot.screen.base64Image] : undefined;

      const decision: ProactiveDecision = await this.provider.evaluateProactive({
        systemPrompt,
        userPrompt,
        images,
        jsonMode: true
      });

      if (decision.should_speak && decision.message) {
        this.lastSpokenTimestamp = Date.now();
        this.setStatus('speaking', decision.mood || 'speaking');

        const messageObj: ChatMessage = {
          id: `proactive_${Date.now()}`,
          sender: 'alvo',
          text: decision.message,
          timestamp: Date.now(),
          isProactive: true,
          mood: decision.mood,
          contextPreview: `${snapshot.window.appName} · ${snapshot.window.windowTitle || ''}`
        };

        this.addMessageToHistory(messageObj);
        this.emit('proactiveMessage', messageObj);

        // Reset status back to watching after a short reading window
        setTimeout(() => {
          if (this.isRunning && this.currentStatus === 'speaking') {
            this.setStatus('watching', `Active: ${snapshot.window.appName}`);
          }
        }, 6000);
      } else {
        this.setStatus('watching', `Active: ${snapshot.window.appName}`);
      }
    } catch (error: any) {
      this.setStatus('watching', 'Waiting for next cycle');
      this.emit('error', error);
    }
  }

  /**
   * Handle user-initiated interactive chat from input bar
   */
  public async handleUserChat(userText: string): Promise<string> {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: Date.now()
    };
    this.addMessageToHistory(userMsg);

    this.setStatus('thinking', 'Formulating reply...');

    try {
      const currentSnapshot = this.collector.getLastSnapshot();
      const systemPrompt = buildChatSystemPrompt(this.config, currentSnapshot);

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...this.conversationHistory.slice(-6).map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text
        }))
      ];

      const replyText = await this.provider.chat(messages);

      const alvoMsg: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: 'alvo',
        text: replyText,
        timestamp: Date.now(),
        isProactive: false
      };

      this.addMessageToHistory(alvoMsg);
      this.setStatus('speaking', 'Replied');

      setTimeout(() => {
        if (this.isRunning) {
          const snapshot = this.collector.getLastSnapshot();
          this.setStatus('watching', snapshot ? `Active: ${snapshot.window.appName}` : 'Watching');
        }
      }, 3000);

      return replyText;
    } catch (err: any) {
      this.setStatus('error', err.message);
      throw err;
    }
  }
}
