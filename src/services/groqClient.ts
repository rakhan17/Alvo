import { GroqModelId, GroqModelOption } from '../types/debate';
import { apiKeyPool } from './apiPool';

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    badge: 'FLAGSHIP 70B',
    description: 'State-of-the-art reasoning, deep logic, and philosophical debate depth.'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    badge: 'ULTRA FAST',
    description: 'Lighting-speed responses for rapid rebuttals and punchy arguments.'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7b MoE',
    badge: 'MOE ARCHITECTURE',
    description: 'Mixture-of-Experts model excel at multi-perspective dialectics.'
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B Instruct',
    badge: 'GOOGLE GEMMA',
    description: 'High precision instruct tuning for strict logical coherence.'
  }
];

export async function* streamGroqChatCompletion(
  model: GroqModelId,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string, void, unknown> {
  const keyItem = apiKeyPool.getNextKey();
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keyItem.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Groq API error (${response.status}): ${errText}`);
      yield* fallbackWordStream(model, userPrompt);
      return;
    }

    const data = await response.json();
    apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);

    const fullContent = data.choices?.[0]?.message?.content || 'No argument provided.';
    const words = fullContent.split(' ');

    // Stream word-by-word to simulate high-speed Groq real-time text output
    for (let i = 0; i < words.length; i++) {
      yield (i === 0 ? '' : ' ') + words[i];
      await new Promise(r => setTimeout(r, 18 + Math.random() * 15));
    }
  } catch (error) {
    console.error('Groq fetch error:', error);
    yield* fallbackWordStream(model, userPrompt);
  }
}

async function* fallbackWordStream(model: string, userPrompt: string): AsyncGenerator<string, void, unknown> {
  const fallbackText = `[${model} Analysis]: In addressing this motion regarding "${userPrompt.slice(0, 60)}...", we must carefully examine the foundational premises, empirical trade-offs, and systemic outcomes. Grounding our thesis in pragmatic realism, the logical imperative leans decisively towards our position.`;
  const words = fallbackText.split(' ');

  for (let i = 0; i < words.length; i++) {
    yield (i === 0 ? '' : ' ') + words[i];
    await new Promise(r => setTimeout(r, 20));
  }
}
