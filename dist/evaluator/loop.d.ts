import { EventEmitter } from 'events';
import { ContextCollector } from '../collector/index.js';
import { LLMProvider } from '../llm/types.js';
import { ValidatedPersonaConfig } from '../config/schema.js';
import { SystemSnapshot, AlvoStatus, ChatMessage } from '../types/index.js';
export interface EvaluatorEvents {
    statusChange: (status: AlvoStatus, detail?: string) => void;
    proactiveMessage: (message: ChatMessage) => void;
    snapshotCaptured: (snapshot: SystemSnapshot) => void;
    error: (err: Error) => void;
}
export declare class EvaluatorLoop extends EventEmitter {
    private collector;
    private provider;
    private config;
    private isRunning;
    private intervalTimer;
    private lastSpokenTimestamp;
    private currentStatus;
    private conversationHistory;
    constructor(collector: ContextCollector, provider: LLMProvider, config: ValidatedPersonaConfig);
    getStatus(): AlvoStatus;
    private setStatus;
    start(): void;
    stop(): void;
    addMessageToHistory(msg: ChatMessage): void;
    runCycle(): Promise<void>;
    /**
     * Handle user-initiated interactive chat from input bar
     */
    handleUserChat(userText: string): Promise<string>;
}
