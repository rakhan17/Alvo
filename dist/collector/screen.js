import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import sharp from 'sharp';
const execAsync = promisify(exec);
export class ScreenCollector {
    tempDir;
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'alvo-captures');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    /**
     * Captures screen snapshot on macOS, downsamples for vision model and diff hashing.
     */
    async captureScreen(options) {
        const timestamp = Date.now();
        if (process.platform !== 'darwin') {
            return {
                timestamp,
                summaryText: 'Screen capture unsupported on non-macOS platforms'
            };
        }
        const rawCapturePath = path.join(this.tempDir, `raw_${timestamp}.jpg`);
        try {
            // -x: do not play sound
            // -t jpg: capture as JPEG for speed and smaller size
            await execAsync(`screencapture -x -t jpg "${rawCapturePath}"`, { timeout: 4000 });
            if (!fs.existsSync(rawCapturePath)) {
                return { timestamp };
            }
            // 1. Generate small 32x32 perceptual hash for rapid diffing without high CPU
            const tinyBuffer = await sharp(rawCapturePath)
                .resize(32, 32, { fit: 'fill' })
                .grayscale()
                .raw()
                .toBuffer();
            const imageHash = crypto.createHash('md5').update(tinyBuffer).digest('hex');
            let base64Image;
            // 2. If vision is enabled, generate downscaled optimized image (e.g. 1024px width, JPEG q75)
            if (options.enableVision) {
                const optimizedBuffer = await sharp(rawCapturePath)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .jpeg({ quality: 75 })
                    .toBuffer();
                base64Image = optimizedBuffer.toString('base64');
            }
            // Cleanup raw capture file
            try {
                fs.unlinkSync(rawCapturePath);
            }
            catch { }
            return {
                timestamp,
                imageHash,
                base64Image
            };
        }
        catch (error) {
            // If user denied screen recording permission or command timed out
            if (fs.existsSync(rawCapturePath)) {
                try {
                    fs.unlinkSync(rawCapturePath);
                }
                catch { }
            }
            return {
                timestamp,
                summaryText: `Screen capture skipped: ${error?.message || 'Permission or timeout'}`
            };
        }
    }
    cleanup() {
        try {
            if (fs.existsSync(this.tempDir)) {
                const files = fs.readdirSync(this.tempDir);
                for (const file of files) {
                    try {
                        fs.unlinkSync(path.join(this.tempDir, file));
                    }
                    catch { }
                }
            }
        }
        catch { }
    }
}
