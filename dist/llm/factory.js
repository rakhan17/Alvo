import { OllamaProvider } from './ollama.js';
import { GeminiProvider } from './gemini.js';
import { OpenAICompatibleProvider } from './openai.js';
export function createLLMProvider(config) {
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
