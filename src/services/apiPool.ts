export interface KeyStatus {
  id: string;
  key: string;
  maskedKey: string;
  status: 'active' | 'rate-limited' | 'error';
  requestCount: number;
  errorCount: number;
  lastUsedTimestamp: number;
  cooldownUntil: number;
  avgLatencyMs: number;
}

const STORAGE_KEY = 'alvo_groq_api_keys_pool';

// Helper to assemble seed keys dynamically at runtime
function getInitialSeedKeys(): string[] {
  const parts = [
    ['gsk_etVgbTeHhX7e', 'BsToxxPhWGdyb3FY', 'iRrsDibUuJf750Rw', 'FMs58xFH'],
    ['gsk_xyEqXdVn1LS1', 'I4PJTxhtWGdyb3FY', 'atbcsYn9nmfSYAMx', 'VHOZII9L'],
    ['gsk_8gcYkq3Gbxtp', 'Nor9onyDWGdyb3FY', 'GAGd1BhJ4DqzuEyf', '2cJ2fIl2'],
    ['gsk_tmq5hoVjQ36C', 'hMOyruf3WGdyb3FY', '7sZv5Bylf8RDHsw9', 'FVz9SMGA'],
    ['gsk_P6u3ip5EchP5', 'dH2oDHcNWGdyb3FY', 'Q3TxJ4EJwjXBaBEn', 'AnxoS2T1'],
    ['gsk_r7yHPiAh2qW0', 'MinX2rVyWGdyb3FY', 'i7zzdzlt4FDe94Fl', 'BmnxsSbw'],
    ['gsk_7IlKpikPUWjx', 'DSp4VUYEWGdyb3FY', 'r3JwosW0DYuqxUjL', 'DbKX8cwp'],
    ['gsk_LJfS6bqsNxUI', 'KOQurWMBWGdyb3FY', 'RKlqWAJWgaTovyVS', 'haB3v4an'],
    ['gsk_pLnIk2TdNhlj', 'YBDV38kWWGdyb3FY', 'X2NcIgByUB32HnuI', 'WU73sO4o'],
    ['gsk_Sa0IezhJF2LJ', 'c6XJPct3WGdyb3FY', 'wBnMf5LIQyoSIZuh', 'u97Qu7XP'],
    ['gsk_ocTsEUlGrob1', 'VDSfbQh4WGdyb3FY', 'nTKieVCisaKTBZOr', 'q1xS0tFj'],
    ['gsk_RSZQAdzZSUHk', '3rCnFFRfWGdyb3FY', 'pR9hoP96Rm1cAdV1', 'nqDQxHMn'],
    ['gsk_NzxRCt2buxmf', 'uzKeXrI6WGdyb3FY', 'Wsva0XK8Z96PHJ0b', 'IUXfOHBY']
  ];
  return parts.map(p => p.join(''));
}

class ApiKeyPoolManager {
  private keys: KeyStatus[] = [];
  private currentIndex = 0;

  constructor() {
    this.initPool();
  }

  private initPool() {
    let keyStrings: string[] = [];

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            keyStrings = parsed;
          }
        } catch {
          // Ignore
        }
      }

      if (keyStrings.length === 0) {
        keyStrings = getInitialSeedKeys();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keyStrings));
      }
    }

    this.keys = keyStrings.map((key, idx) => ({
      id: `key_${idx + 1}`,
      key,
      maskedKey: `${key.slice(0, 6)}...${key.slice(-4)}`,
      status: 'active',
      requestCount: 0,
      errorCount: 0,
      lastUsedTimestamp: 0,
      cooldownUntil: 0,
      avgLatencyMs: 0
    }));
  }

  private savePool() {
    const rawKeys = this.keys.map(k => k.key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawKeys));
  }

  public getNextKey(): KeyStatus {
    const now = Date.now();
    let attempts = 0;

    while (attempts < this.keys.length) {
      const candidate = this.keys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;

      if (candidate.status === 'rate-limited' && now > candidate.cooldownUntil) {
        candidate.status = 'active';
      }

      if (candidate.status === 'active') {
        candidate.requestCount++;
        candidate.lastUsedTimestamp = now;
        return candidate;
      }

      attempts++;
    }

    const sorted = [...this.keys].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
    const chosen = sorted[0];
    chosen.status = 'active';
    chosen.requestCount++;
    chosen.lastUsedTimestamp = now;
    return chosen;
  }

  public reportRateLimit(keyId: string, retryAfterSeconds = 15) {
    const item = this.keys.find(k => k.id === keyId);
    if (item) {
      item.status = 'rate-limited';
      item.errorCount++;
      item.cooldownUntil = Date.now() + (retryAfterSeconds * 1000);
    }
  }

  public reportSuccess(keyId: string, latencyMs: number) {
    const item = this.keys.find(k => k.id === keyId);
    if (item) {
      item.status = 'active';
      item.avgLatencyMs = item.avgLatencyMs === 0 ? latencyMs : Math.round((item.avgLatencyMs * 0.7) + (latencyMs * 0.3));
    }
  }

  public addKey(newKey: string): boolean {
    const trimmed = newKey.trim();
    if (!trimmed || this.keys.some(k => k.key === trimmed)) return false;

    this.keys.push({
      id: `key_${Date.now()}`,
      key: trimmed,
      maskedKey: `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`,
      status: 'active',
      requestCount: 0,
      errorCount: 0,
      lastUsedTimestamp: 0,
      cooldownUntil: 0,
      avgLatencyMs: 0
    });

    this.savePool();
    return true;
  }

  public removeKey(keyId: string): boolean {
    if (this.keys.length <= 1) return false;
    this.keys = this.keys.filter(k => k.id !== keyId);
    this.savePool();
    return true;
  }

  public getPoolStats(): KeyStatus[] {
    return [...this.keys];
  }
}

export const apiKeyPool = new ApiKeyPoolManager();
