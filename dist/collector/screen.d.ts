import { ScreenContext } from '../types/index.js';
export declare class ScreenCollector {
    private tempDir;
    constructor();
    /**
     * Captures screen snapshot on macOS, downsamples for vision model and diff hashing.
     */
    captureScreen(options: {
        enableVision: boolean;
    }): Promise<ScreenContext>;
    cleanup(): void;
}
