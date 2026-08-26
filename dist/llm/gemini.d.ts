import { LLMProvider, LLMMessage, LLMPromptOptions } from './types.js';
import { ProactiveDecision } from '../types/index.js';
import { ValidatedPersonaConfig } from '../config/schema.js';
export declare class GeminiProvider implements LLMProvider {
    name: string;
    private apiKey;
    private model;
    constructor(config: ValidatedPersonaConfig);
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
    evaluateProactive(options: LLMPromptOptions): Promise<ProactiveDecision>;
    chat(messages: LLMMessage[]): Promise<string>;
    private parseJSONDecision;
}
