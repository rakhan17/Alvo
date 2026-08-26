export type AlvoStatus = 'idle' | 'watching' | 'thinking' | 'speaking' | 'error';
export type PersonaRelationship = 'friend' | 'mentor' | 'tsundere_partner' | 'casual_coder' | 'custom' | (string & {});
export type LLMProviderType = 'ollama' | 'gemini' | 'openai';
export interface PersonaConfig {
    name: string;
    relationship: PersonaRelationship;
    tone: string;
    language: string;
    scanIntervalSeconds: number;
    provider: LLMProviderType;
    model: string;
    baseUrl?: string;
    apiKey?: string;
    enableVision: boolean;
    enableActiveWindow: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    customInstructions?: string;
}
export interface WindowContext {
    appName: string;
    windowTitle: string;
    timestamp: number;
    bundleId?: string;
}
export interface ScreenContext {
    timestamp: number;
    base64Image?: string;
    imageHash?: string;
    summaryText?: string;
    width?: number;
    height?: number;
}
export interface SystemSnapshot {
    timestamp: number;
    window: WindowContext;
    screen?: ScreenContext;
    contextHash: string;
    isDiffFromLast: boolean;
}
export interface ProactiveDecision {
    should_speak: boolean;
    message: string;
    mood?: string;
    reason?: string;
    detected_action?: string;
}
export interface ChatMessage {
    id: string;
    sender: 'alvo' | 'user' | 'system';
    text: string;
    timestamp: number;
    isProactive?: boolean;
    mood?: string;
    contextPreview?: string;
}
