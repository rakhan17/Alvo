export type GroqModelId = 
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it';

export interface GroqModelOption {
  id: GroqModelId;
  name: string;
  badge: string;
  description: string;
}

export interface DebaterConfig {
  name: string;
  stance: 'PRO' | 'CONTRA' | 'MODERATOR';
  model: GroqModelId;
  systemPrompt: string;
  avatarColor: string;
}

export interface DebateConfig {
  topic: string;
  rounds: number;
  debaterA: DebaterConfig;
  debaterB: DebaterConfig;
  moderator: DebaterConfig;
}

export interface DebateMessage {
  id: string;
  role: 'DEBATER_A' | 'DEBATER_B' | 'MODERATOR';
  senderName: string;
  modelUsed: string;
  text: string;
  timestamp: number;
  roundIndex: number;
  turnType: 'INTRO' | 'ARGUMENT' | 'REBUTTAL' | 'COUNTER' | 'VERDICT';
  isStreaming?: boolean;
}

export interface ModeratorVerdict {
  summary: string;
  debaterAStrengths: string[];
  debaterBStrengths: string[];
  clashAnalysis: string;
  winner: 'DEBATER_A' | 'DEBATER_B' | 'DRAW';
  winnerReasoning: string;
}

export type DebateStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
