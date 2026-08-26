import { LLMProvider, LLMMessage, LLMPromptOptions } from './types.js';
import { ProactiveDecision } from '../types/index.js';
import { ValidatedPersonaConfig } from '../config/schema.js';

export class GeminiProvider implements LLMProvider {
  public name = 'Gemini';
  private apiKey: string;
  private model: string;

  constructor(config: ValidatedPersonaConfig) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model && config.model.startsWith('gemini') ? config.model : 'gemini-1.5-flash';
  }

  public async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'GEMINI_API_KEY is not set.' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}?key=${this.apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        return { ok: false, message: `Gemini API returned status ${res.status}` };
      }
      return { ok: true, message: `Connected to Gemini API (${this.model})` };
    } catch (err: any) {
      return { ok: false, message: `Gemini connection failed: ${err.message}` };
    }
  }

  public async evaluateProactive(options: LLMPromptOptions): Promise<ProactiveDecision> {
    if (!this.apiKey) {
      return { should_speak: false, message: '', reason: 'No Gemini API key' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const contents: any[] = [];
      const parts: any[] = [{ text: `${options.systemPrompt}\n\n${options.userPrompt}` }];

      if (options.images && options.images.length > 0) {
        for (const img of options.images) {
          parts.push({
            inline_data: {
              mime_type: 'image/jpeg',
              data: img
            }
          });
        }
      }

      contents.push({ role: 'user', parts });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
      }

      const data = (await res.json()) as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return this.parseJSONDecision(text);
    } catch (err: any) {
      return { should_speak: false, message: '', reason: err.message };
    }
  }

  public async chat(messages: LLMMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: AbortSignal.timeout(20000)
    });

    if (!res.ok) {
      throw new Error(`Gemini error: ${await res.text()}`);
    }

    const data = (await res.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '...';
  }

  private parseJSONDecision(raw: string): ProactiveDecision {
    try {
      const parsed = JSON.parse(raw);
      return {
        should_speak: Boolean(parsed.should_speak),
        message: typeof parsed.message === 'string' ? parsed.message.trim() : '',
        mood: parsed.mood || 'neutral',
        detected_action: parsed.detected_action,
        reason: parsed.reason
      };
    } catch {
      return { should_speak: false, message: '' };
    }
  }
}
