export class OllamaProvider {
    name = 'Ollama';
    baseUrl;
    model;
    constructor(config) {
        this.baseUrl = (config.baseUrl || 'http://127.0.0.1:11434').replace(/\/$/, '');
        this.model = config.model || 'llama3.2-vision:latest';
    }
    async testConnection() {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(4000)
            });
            if (!res.ok) {
                return { ok: false, message: `Ollama returned HTTP status ${res.status}` };
            }
            const data = (await res.json());
            const models = data.models?.map(m => m.name) || [];
            const hasModel = models.some(m => m === this.model || m.startsWith(this.model.split(':')[0]));
            if (!hasModel) {
                return {
                    ok: false,
                    message: `Model '${this.model}' is NOT READY in Ollama yet. Local models available: [${models.join(', ')}]. Please wait until 'ollama run ${this.model}' finishes downloading.`
                };
            }
            return {
                ok: true,
                message: `Connected to Ollama successfully! (Model: ${this.model})`
            };
        }
        catch (error) {
            return {
                ok: false,
                message: `Could not connect to Ollama at ${this.baseUrl}: ${error.message || 'Connection refused. Is Ollama running?'}`
            };
        }
    }
    async evaluateProactive(options) {
        const payload = {
            model: this.model,
            prompt: options.userPrompt,
            system: options.systemPrompt,
            stream: false,
            format: 'json',
            options: {
                temperature: 0.7,
                num_predict: 256
            }
        };
        if (options.images && options.images.length > 0) {
            payload.images = options.images;
        }
        let res;
        try {
            res = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(30000)
            });
        }
        catch (fetchErr) {
            throw new Error(`Ollama connection failed for model '${this.model}': ${fetchErr.message}`);
        }
        // If model does not support images (vision), retry with text-only for this model
        if (!res.ok && payload.images) {
            delete payload.images;
            res = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(25000)
            });
        }
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Ollama error for '${this.model}' (${res.status}): ${errorText}`);
        }
        const json = (await res.json());
        const rawText = json.response || '{}';
        return this.parseJSONDecision(rawText);
    }
    async chat(messages) {
        const ollamaMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            images: msg.images
        }));
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                messages: ollamaMessages,
                stream: false,
                options: {
                    temperature: 0.8
                }
            }),
            signal: AbortSignal.timeout(60000)
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Ollama error using model '${this.model}' (${res.status}): ${err}`);
        }
        const json = (await res.json());
        return json.message?.content?.trim() || '...';
    }
    parseJSONDecision(raw) {
        try {
            let cleaned = raw.trim();
            // Strip markdown code fences if model enclosed JSON
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.slice(7);
            }
            else if (cleaned.startsWith('```')) {
                cleaned = cleaned.slice(3);
            }
            if (cleaned.endsWith('```')) {
                cleaned = cleaned.slice(0, -3);
            }
            cleaned = cleaned.trim();
            const parsed = JSON.parse(cleaned);
            return {
                should_speak: Boolean(parsed.should_speak),
                message: typeof parsed.message === 'string' ? parsed.message.trim() : '',
                mood: parsed.mood || 'neutral',
                detected_action: parsed.detected_action,
                reason: parsed.reason
            };
        }
        catch {
            return {
                should_speak: false,
                message: ''
            };
        }
    }
}
