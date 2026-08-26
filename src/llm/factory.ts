import { LLMProvider } from './types.js';
import { OllamaProvider } from './ollama.js';
import { GeminiProvider } from './gemini.js';
import { OpenAICompatibleProvider } from './openai.js';
import { ValidatedPersonaConfig } from '../config/schema.js';

export function createLLMProvider(config: ValidatedPersonaConfig): LLMProvider {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAICompatibleProvider(config);
    case 'ollama':
    default:
      return new OllamaProvider(config);
  }
}
