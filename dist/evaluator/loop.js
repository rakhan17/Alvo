import { EventEmitter } from 'events';
import { buildProactiveSystemPrompt, buildProactiveUserPrompt, buildChatSystemPrompt } from './prompts.js';
export class EvaluatorLoop extends EventEmitter {
    collector;
    provider;
    config;
    isRunning = false;
    intervalTimer = null;
    lastSpokenTimestamp = 0;
    currentStatus = 'idle';
    conversationHistory = [];
    constructor(collector, provider, config) {
        super();
        this.collector = collector;
        this.provider = provider;
        this.config = config;
    }
    getStatus() {
        return this.currentStatus;
    }
    setStatus(status, detail) {
        this.currentStatus = status;
        this.emit('statusChange', status, detail);
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.setStatus('watching', `Autonomous watcher active (${this.config.scanIntervalSeconds}s interval)`);
        // Run first evaluation after short initial delay (2s)
        setTimeout(() => {
            if (this.isRunning) {
                this.runCycle();
            }
        }, 2000);
        // Fast autonomous loop
        const intervalMs = Math.max(3000, (this.config.scanIntervalSeconds || 10) * 1000);
        this.intervalTimer = setInterval(() => {
            if (this.isRunning) {
                this.runCycle();
            }
        }, intervalMs);
    }
    stop() {
        this.isRunning = false;
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
        this.setStatus('idle');
    }
    addMessageToHistory(msg) {
        this.conversationHistory.push(msg);
        if (this.conversationHistory.length > 20) {
            this.conversationHistory.shift();
        }
    }
    async runCycle() {
        try {
            // 1. Capture snapshot and test for diff
            const snapshot = await this.collector.collectSnapshot(this.config);
            this.emit('snapshotCaptured', snapshot);
            // 2. Diff throttle: If context hasn't changed at all, skip evaluation
            if (!snapshot.isDiffFromLast) {
                this.setStatus('watching', `Active: ${snapshot.window.appName} (idle/no change)`);
                return;
            }
            // 3. Rate limiting / cooldown check:
            // Minimum cool-down between unsolicited remarks
            const now = Date.now();
            const cooldownMs = this.config.sensitivity === 'high' ? 15000 : this.config.sensitivity === 'low' ? 60000 : 30000;
            if (now - this.lastSpokenTimestamp < cooldownMs) {
                this.setStatus('watching', `Active: ${snapshot.window.appName} (observing)`);
                return;
            }
            // 4. Send to LLM
            this.setStatus('thinking', `Araa is observing ${snapshot.window.appName}...`);
            const recentSummary = this.conversationHistory
                .slice(-4)
                .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
                .join('\n');
            const systemPrompt = buildProactiveSystemPrompt(this.config);
            const userPrompt = buildProactiveUserPrompt(snapshot, recentSummary);
            const images = snapshot.screen?.base64Image ? [snapshot.screen.base64Image] : undefined;
            const decision = await this.provider.evaluateProactive({
                systemPrompt,
                userPrompt,
                images,
                jsonMode: true
            });
            if (decision.should_speak && decision.message) {
                this.lastSpokenTimestamp = Date.now();
                this.setStatus('speaking', decision.mood || 'speaking');
                const messageObj = {
                    id: `proactive_${Date.now()}`,
                    sender: 'alvo',
                    text: decision.message,
                    timestamp: Date.now(),
                    isProactive: true,
                    mood: decision.mood,
                    contextPreview: `${snapshot.window.appName} · ${snapshot.window.windowTitle || ''}`
                };
                this.addMessageToHistory(messageObj);
                this.emit('proactiveMessage', messageObj);
                // Reset status back to watching after a short reading window
                setTimeout(() => {
                    if (this.isRunning && this.currentStatus === 'speaking') {
                        this.setStatus('watching', `Active: ${snapshot.window.appName}`);
                    }
                }, 6000);
            }
            else {
                this.setStatus('watching', `Active: ${snapshot.window.appName}`);
            }
        }
        catch (error) {
            this.setStatus('watching', 'Waiting for next cycle');
            this.emit('error', error);
        }
    }
    /**
     * Handle user-initiated interactive chat from input bar
     */
    async handleUserChat(userText) {
        const userMsg = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: userText,
            timestamp: Date.now()
        };
        this.addMessageToHistory(userMsg);
        this.setStatus('thinking', 'Formulating reply...');
        try {
            const currentSnapshot = this.collector.getLastSnapshot();
            const systemPrompt = buildChatSystemPrompt(this.config, currentSnapshot);
            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.conversationHistory.slice(-6).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            ];
            const replyText = await this.provider.chat(messages);
            const alvoMsg = {
                id: `reply_${Date.now()}`,
                sender: 'alvo',
                text: replyText,
                timestamp: Date.now(),
                isProactive: false
            };
            this.addMessageToHistory(alvoMsg);
            this.setStatus('speaking', 'Replied');
            setTimeout(() => {
                if (this.isRunning) {
                    const snapshot = this.collector.getLastSnapshot();
                    this.setStatus('watching', snapshot ? `Active: ${snapshot.window.appName}` : 'Watching');
                }
            }, 3000);
            return replyText;
        }
        catch (err) {
            this.setStatus('error', err.message);
            throw err;
        }
    }
}
