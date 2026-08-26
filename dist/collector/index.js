import crypto from 'crypto';
import { getActiveWindowContext } from './window.js';
import { ScreenCollector } from './screen.js';
export class ContextCollector {
    screenCollector;
    lastSnapshot = null;
    constructor() {
        this.screenCollector = new ScreenCollector();
    }
    /**
     * Collects current window and screen snapshot, and checks if context has changed.
     */
    async collectSnapshot(config) {
        const timestamp = Date.now();
        // 1. Collect Active Window Info
        let windowContext = {
            appName: 'Unknown',
            windowTitle: '',
            timestamp
        };
        if (config.enableActiveWindow) {
            windowContext = await getActiveWindowContext();
        }
        // 2. Collect Screen snapshot if vision is enabled
        let screenContext;
        if (config.enableVision) {
            screenContext = await this.screenCollector.captureScreen({ enableVision: true });
        }
        // 3. Compute Composite Hash for context comparison
        const hashData = `${windowContext.appName}::${windowContext.windowTitle}::${screenContext?.imageHash || 'no_screen'}`;
        const contextHash = crypto.createHash('sha256').update(hashData).digest('hex');
        // 4. Compare with last snapshot to detect diff
        let isDiffFromLast = true;
        if (this.lastSnapshot) {
            // If the app and window title and screen hash are identical, no change occurred
            if (this.lastSnapshot.contextHash === contextHash) {
                isDiffFromLast = false;
            }
        }
        const snapshot = {
            timestamp,
            window: windowContext,
            screen: screenContext,
            contextHash,
            isDiffFromLast
        };
        this.lastSnapshot = snapshot;
        return snapshot;
    }
    getLastSnapshot() {
        return this.lastSnapshot;
    }
    cleanup() {
        this.screenCollector.cleanup();
    }
}
