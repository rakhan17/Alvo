import { ProactiveDecision } from '../types/index.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // base64 strings
}

export interface LLMPromptOptions {
  systemPrompt: string;
  userPrompt: string;
  images?: string[];
  jsonMode?: boolean;
}

export interface LLMProvider {
  name: string;
  evaluateProactive(options: LLMPromptOptions): Promise<ProactiveDecision>;
  chat(messages: LLMMessage[]): Promise<string>;
  testConnection(): Promise<{ ok: boolean; message: string }>;
}
