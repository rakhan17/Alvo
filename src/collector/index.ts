import crypto from 'crypto';
import { getActiveWindowContext } from './window.js';
import { ScreenCollector } from './screen.js';
import { SystemSnapshot, WindowContext, ScreenContext } from '../types/index.js';
import { ValidatedPersonaConfig } from '../config/schema.js';

export class ContextCollector {
  private screenCollector: ScreenCollector;
  private lastSnapshot: SystemSnapshot | null = null;

  constructor() {
    this.screenCollector = new ScreenCollector();
  }

  /**
   * Collects current window and screen snapshot, and checks if context has changed.
   */
  public async collectSnapshot(config: ValidatedPersonaConfig): Promise<SystemSnapshot> {
    const timestamp = Date.now();

    // 1. Collect Active Window Info
    let windowContext: WindowContext = {
      appName: 'Unknown',
      windowTitle: '',
      timestamp
    };

    if (config.enableActiveWindow) {
      windowContext = await getActiveWindowContext();
    }

    // 2. Collect Screen snapshot if vision is enabled
    let screenContext: ScreenContext | undefined;
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

    const snapshot: SystemSnapshot = {
      timestamp,
      window: windowContext,
      screen: screenContext,
      contextHash,
      isDiffFromLast
    };

    this.lastSnapshot = snapshot;
    return snapshot;
  }

  public getLastSnapshot(): SystemSnapshot | null {
    return this.lastSnapshot;
  }

  public cleanup() {
    this.screenCollector.cleanup();
  }
}
