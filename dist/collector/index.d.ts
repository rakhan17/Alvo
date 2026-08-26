import { SystemSnapshot } from '../types/index.js';
import { ValidatedPersonaConfig } from '../config/schema.js';
export declare class ContextCollector {
    private screenCollector;
    private lastSnapshot;
    constructor();
    /**
     * Collects current window and screen snapshot, and checks if context has changed.
     */
    collectSnapshot(config: ValidatedPersonaConfig): Promise<SystemSnapshot>;
    getLastSnapshot(): SystemSnapshot | null;
    cleanup(): void;
}
