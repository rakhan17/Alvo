import { z } from 'zod';

export const PersonaConfigSchema = z.object({
  name: z.string().default('Alvo'),
  relationship: z.string().default('friend'),
  tone: z.string().default('playful, slightly sarcastic, observant, supportive'),
  language: z.string().default('Indonesian / English mix (Bahasa gaul / santai Jaksel/tech)'),
  scanIntervalSeconds: z.number().min(5).max(300).default(20),
  provider: z.enum(['ollama', 'gemini', 'openai']).default('ollama'),
  model: z.string().default('llama3.2-vision:latest'),
  baseUrl: z.string().optional().default('http://127.0.0.1:11434'),
  apiKey: z.string().optional(),
  enableVision: z.boolean().default(true),
  enableActiveWindow: z.boolean().default(true),
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
  customInstructions: z.string().optional()
});

export type ValidatedPersonaConfig = z.infer<typeof PersonaConfigSchema>;
