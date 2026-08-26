import { ValidatedPersonaConfig } from '../config/schema.js';
import { SystemSnapshot } from '../types/index.js';
export declare function buildProactiveSystemPrompt(config: ValidatedPersonaConfig): string;
export declare function buildProactiveUserPrompt(snapshot: SystemSnapshot, recentMessagesSummary?: string): string;
export declare function buildChatSystemPrompt(config: ValidatedPersonaConfig, currentSnapshot?: SystemSnapshot | null): string;
