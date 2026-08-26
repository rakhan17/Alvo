import { ValidatedPersonaConfig } from './schema.js';
export declare class ConfigManager {
    private static instance;
    private currentConfig;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): ValidatedPersonaConfig;
    loadConfig(): ValidatedPersonaConfig;
    saveConfig(newConfig: Partial<ValidatedPersonaConfig>, isGlobal?: boolean): ValidatedPersonaConfig;
    applyPreset(presetName: string): ValidatedPersonaConfig;
}
