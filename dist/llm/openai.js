export class OpenAICompatibleProvider {
    name = 'OpenAI-Compatible';
    baseUrl;
    apiKey;
    model;
    constructor(config) {
        this.baseUrl = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
        this.model = config.model || 'gpt-4o-mini';
    }
    async testConnection() {
        if (!this.apiKey && this.baseUrl.includes('api.openai.com')) {
            return { ok: false, message: 'OPENAI_API_KEY is not set.' };
        }
        try {
            const res = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                },
                signal: AbortSignal.timeout(5000)
            });
            if (!res.ok) {
                return { ok: false, message: `OpenAI API returned status ${res.status}` };
            }
            return { ok: true, message: `Connected to OpenAI-compatible endpoint at ${this.baseUrl}` };
        }
        catch (err) {
            return { ok: false, message: `OpenAI connection failed: ${err.message}` };
        }
    }
    async evaluateProactive(options) {
        try {
            const messages = [
                { role: 'system', content: options.systemPrompt }
            ];
            const userContent = [{ type: 'text', text: options.userPrompt }];
            if (options.images && options.images.length > 0) {
                for (const img of options.images) {
                    userContent.push({
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${img}`
                        }
                    });
                }
            }
            messages.push({ role: 'user', content: userContent });
            const res = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    response_format: { type: 'json_object' },
                    temperature: 0.7
                }),
                signal: AbortSignal.timeout(15000)
            });
            if (!res.ok) {
                throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
            }
            const data = (await res.json());
            const text = data.choices?.[0]?.message?.content || '{}';
            return this.parseJSONDecision(text);
        }
        catch (err) {
            return { should_speak: false, message: '', reason: err.message };
        }
    }
    async chat(messages) {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: 0.8
            }),
            signal: AbortSignal.timeout(20000)
        });
        if (!res.ok) {
            throw new Error(`OpenAI chat error: ${await res.text()}`);
        }
        const data = (await res.json());
        return data.choices?.[0]?.message?.content || '...';
    }
    parseJSONDecision(raw) {
        try {
            const parsed = JSON.parse(raw);
            return {
                should_speak: Boolean(parsed.should_speak),
                message: typeof parsed.message === 'string' ? parsed.message.trim() : '',
                mood: parsed.mood || 'neutral',
                detected_action: parsed.detected_action,
                reason: parsed.reason
            };
        }
        catch {
            return { should_speak: false, message: '' };
        }
    }
}
