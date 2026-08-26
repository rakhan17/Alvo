import { apiKeyPool } from './apiPool';

export async function* streamGroqNarrative(
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
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 700,
        stream: false
      })
    });

    if (!response.ok) {
      yield* fallbackNarrativeStream();
      return;
    }

    const data = await response.json();
    apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);

    const fullText = data.choices?.[0]?.message?.content || 'The story continues...';
    const words = fullText.split(' ');

    for (let i = 0; i < words.length; i++) {
      yield (i === 0 ? '' : ' ') + words[i];
      await new Promise(r => setTimeout(r, 16 + Math.random() * 12));
    }
  } catch {
    yield* fallbackNarrativeStream();
  }
}

async function* fallbackNarrativeStream(): AsyncGenerator<string, void, unknown> {
  const fallback = `The shadows lengthen across the ancient stone archways. A cold wind rustles through the courtyard, carrying whispers of forgotten oaths. Ahead, a heavy ironbound door stands slightly ajar, casting a silver gleam onto the wet cobblestones below. What path will you take next?`;
  const words = fallback.split(' ');

  for (let i = 0; i < words.length; i++) {
    yield (i === 0 ? '' : ' ') + words[i];
    await new Promise(r => setTimeout(r, 20));
  }
}

export async function fetchGroqJSON<T>(systemPrompt: string, userPrompt: string): Promise<T | null> {
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
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt + '\nIMPORTANT: Respond strictly in valid JSON format.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 450,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
