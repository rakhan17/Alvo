import fs from 'fs';
import path from 'path';
import os from 'os';
import { PersonaConfigSchema } from './schema.js';
import { DEFAULT_CONFIG, PERSONA_PRESETS } from './defaults.js';
import dotenv from 'dotenv';
dotenv.config();
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.config', 'alvo');
const GLOBAL_CONFIG_PATH = path.join(GLOBAL_CONFIG_DIR, 'config.json');
const LOCAL_CONFIG_PATH = path.join(process.cwd(), 'alvo.config.json');
export class ConfigManager {
    static instance;
    currentConfig;
    constructor() {
        this.currentConfig = this.loadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.currentConfig;
    }
    loadConfig() {
        let merged = { ...DEFAULT_CONFIG };
        // 1. Try global config
        if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
            try {
                const globalData = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf8'));
                merged = { ...merged, ...globalData };
            }
            catch (err) {
                // ignore invalid json in global file
            }
        }
        // 2. Try local project config
        if (fs.existsSync(LOCAL_CONFIG_PATH)) {
            try {
                const localData = JSON.parse(fs.readFileSync(LOCAL_CONFIG_PATH, 'utf8'));
                merged = { ...merged, ...localData };
            }
            catch (err) {
                // ignore invalid json in local file
            }
        }
        // 3. Apply Environment Variable overrides
        if (process.env.ALVO_PROVIDER) {
            merged.provider = process.env.ALVO_PROVIDER;
        }
        if (process.env.ALVO_MODEL) {
            merged.model = process.env.ALVO_MODEL;
        }
        const envBaseUrl = process.env.OLLAMA_HOST || process.env.ALVO_BASE_URL;
        if (envBaseUrl) {
            merged.baseUrl = envBaseUrl;
        }
        const envApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
        if (envApiKey) {
            merged.apiKey = envApiKey;
        }
        if (process.env.ALVO_RELATIONSHIP && PERSONA_PRESETS[process.env.ALVO_RELATIONSHIP]) {
            const preset = PERSONA_PRESETS[process.env.ALVO_RELATIONSHIP];
            merged = { ...merged, ...preset };
        }
        const parsed = PersonaConfigSchema.safeParse(merged);
        if (!parsed.success) {
            return DEFAULT_CONFIG;
        }
        return parsed.data;
    }
    saveConfig(newConfig, isGlobal = false) {
        const merged = { ...this.currentConfig, ...newConfig };
        const validated = PersonaConfigSchema.parse(merged);
        const targetPath = isGlobal ? GLOBAL_CONFIG_PATH : LOCAL_CONFIG_PATH;
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(targetPath, JSON.stringify(validated, null, 2), 'utf8');
        this.currentConfig = validated;
        return validated;
    }
    applyPreset(presetName) {
        const preset = PERSONA_PRESETS[presetName];
        if (!preset) {
            throw new Error(`Unknown preset: ${presetName}. Available presets: ${Object.keys(PERSONA_PRESETS).join(', ')}`);
        }
        return this.saveConfig({ ...preset, relationship: presetName });
    }
}
