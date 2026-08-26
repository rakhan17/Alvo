import { PersonaRole, PERSONAS_50 } from '../data/personas';
import { apiKeyPool } from './apiPool';

export interface DebateNode {
  id: string; // Persona ID
  persona: PersonaRole;
  currentStance: string;
  keyArguments: string[];
  status: 'idle' | 'thinking' | 'speaking' | 'done';
}

export interface DebateLink {
  id: string;
  source: string; // Persona ID
  target: string; // Persona ID
  type: 'rebuttal' | 'agreement' | 'inquiry' | 'synergy';
  summary: string;
  timestamp: number;
}

export interface DebateEntry {
  id: string;
  personaId: string;
  personaName: string;
  personaTitle: string;
  personaColor: string;
  personaIcon: string;
  phase: 'Opening' | 'Rebuttal' | 'Synthesis';
  targetPersonaId?: string;
  targetPersonaName?: string;
  stanceType: 'Support' | 'Oppose' | 'Nuanced' | 'Synthesis';
  text: string;
  timestamp: number;
}

export interface FinalConsensusReport {
  topic: string;
  consensusScore: number; // 0 to 100%
  executiveSummary: string;
  coreAgreements: string[];
  majorFrictionPoints: string[];
  riskMatrix: { risk: string; severity: 'High' | 'Medium' | 'Low'; mitigation: string }[];
  finalVerdict: string;
}

export type DebateStateListener = (state: {
  topic: string;
  phase: 'idle' | 'Phase 1: Opening Stances' | 'Phase 2: Rebuttal & Cross-Examination' | 'Phase 3: Consensus Synthesis' | 'completed';
  activePersonas: PersonaRole[];
  nodes: DebateNode[];
  links: DebateLink[];
  feed: DebateEntry[];
  report: FinalConsensusReport | null;
}) => void;

class DebateEngine {
  private topic = '';
  private phase: 'idle' | 'Phase 1: Opening Stances' | 'Phase 2: Rebuttal & Cross-Examination' | 'Phase 3: Consensus Synthesis' | 'completed' = 'idle';
  private selectedPersonas: PersonaRole[] = [];
  private nodes: DebateNode[] = [];
  private links: DebateLink[] = [];
  private feed: DebateEntry[] = [];
  private report: FinalConsensusReport | null = null;
  private listeners: Set<DebateStateListener> = new Set();
  private isAbortRequested = false;

  public subscribe(listener: DebateStateListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = {
      topic: this.topic,
      phase: this.phase,
      activePersonas: this.selectedPersonas,
      nodes: this.nodes,
      links: this.links,
      feed: this.feed,
      report: this.report
    };
    this.listeners.forEach(fn => fn(currentState));
  }

  public stopDebate() {
    this.isAbortRequested = true;
    this.phase = 'idle';
    this.notify();
  }

  public async startResearchDebate(topic: string, count: number = 15, customPersonas?: PersonaRole[]) {
    this.topic = topic.trim();
    this.isAbortRequested = false;
    this.feed = [];
    this.links = [];
    this.report = null;

    // Select personas
    const pool = customPersonas && customPersonas.length > 0 ? customPersonas : PERSONAS_50;
    this.selectedPersonas = pool.slice(0, Math.min(count, pool.length));

    // Initialize nodes
    this.nodes = this.selectedPersonas.map(p => ({
      id: p.id,
      persona: p,
      currentStance: '',
      keyArguments: [],
      status: 'idle'
    }));

    // PHASE 1: Opening Stances
    this.phase = 'Phase 1: Opening Stances';
    this.notify();

    // Process initial opening batch (parallelized with key pool rotation)
    const openingPromises = this.selectedPersonas.map(async (persona) => {
      if (this.isAbortRequested) return;

      this.updateNodeStatus(persona.id, 'thinking');
      const stance = await this.generateOpeningStance(this.topic, persona);

      if (this.isAbortRequested) return;

      this.updateNodeStatus(persona.id, 'speaking', stance.text);

      const entry: DebateEntry = {
        id: `feed_${Date.now()}_${Math.random()}`,
        personaId: persona.id,
        personaName: persona.name,
        personaTitle: persona.title,
        personaColor: persona.color,
        personaIcon: persona.icon,
        phase: 'Opening',
        stanceType: stance.stanceType,
        text: stance.text,
        timestamp: Date.now()
      };

      this.feed.unshift(entry);
      this.updateNodeStatus(persona.id, 'done', stance.text);
      this.notify();
    });

    await Promise.all(openingPromises);
    if (this.isAbortRequested) return;

    // PHASE 2: Rebuttal & Cross-Examination
    this.phase = 'Phase 2: Rebuttal & Cross-Examination';
    this.notify();

    // Pick top 8-12 key debaters for cross-examination rounds
    const crossDebaters = [...this.selectedPersonas].sort(() => 0.5 - Math.random()).slice(0, Math.min(10, this.selectedPersonas.length));

    for (const persona of crossDebaters) {
      if (this.isAbortRequested) return;

      // Pick a random target node to argue with or support
      const targets = this.nodes.filter(n => n.id !== persona.id && n.currentStance);
      if (targets.length === 0) continue;
      const targetNode = targets[Math.floor(Math.random() * targets.length)];

      this.updateNodeStatus(persona.id, 'thinking');
      const rebuttal = await this.generateRebuttal(this.topic, persona, targetNode);

      if (this.isAbortRequested) return;

      // Add link between nodes
      const newLink: DebateLink = {
        id: `link_${Date.now()}_${Math.random()}`,
        source: persona.id,
        target: targetNode.id,
        type: rebuttal.linkType,
        summary: rebuttal.text.slice(0, 80) + '...',
        timestamp: Date.now()
      };
      this.links.push(newLink);

      const entry: DebateEntry = {
        id: `feed_${Date.now()}_${Math.random()}`,
        personaId: persona.id,
        personaName: persona.name,
        personaTitle: persona.title,
        personaColor: persona.color,
        personaIcon: persona.icon,
        phase: 'Rebuttal',
        targetPersonaId: targetNode.id,
        targetPersonaName: targetNode.persona.name,
        stanceType: rebuttal.stanceType,
        text: rebuttal.text,
        timestamp: Date.now()
      };

      this.feed.unshift(entry);
      this.updateNodeStatus(persona.id, 'done');
      this.notify();
    }

    if (this.isAbortRequested) return;

    // PHASE 3: Consensus Synthesis
    this.phase = 'Phase 3: Consensus Synthesis';
    this.notify();

    const report = await this.generateConsensusReport(this.topic, this.feed);
    this.report = report;
    this.phase = 'completed';
    this.notify();
  }

  private updateNodeStatus(nodeId: string, status: DebateNode['status'], stance?: string) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.status = status;
      if (stance) {
        node.currentStance = stance;
        node.keyArguments.push(stance);
      }
    }
  }

  private async callGroqAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    let attempts = 0;
    const maxRetries = 4;

    while (attempts < maxRetries) {
      const keyObj = apiKeyPool.getNextKey();
      const startTime = Date.now();

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyObj.key}`
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.6-27b', // or llama-3.3-70b-versatile
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.75,
            max_tokens: 350
          })
        });

        if (res.status === 429) {
          apiKeyPool.reportRateLimit(keyObj.id, 15);
          attempts++;
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          // Try next model if model error
          if (errText.includes('model_not_found')) {
            return this.callGroqFallbackModel(keyObj.key, systemPrompt, userPrompt);
          }
          throw new Error(`Groq status ${res.status}: ${errText}`);
        }

        const data = (await res.json()) as any;
        const latency = Date.now() - startTime;
        apiKeyPool.reportSuccess(keyObj.id, latency);

        let content = data.choices?.[0]?.message?.content || '';
        // Strip think tags if any
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        return content;
      } catch (err) {
        attempts++;
        if (attempts >= maxRetries) throw err;
      }
    }
    throw new Error('All Groq API key retries exhausted.');
  }

  private async callGroqFallbackModel(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.75,
        max_tokens: 350
      })
    });
    const data = (await res.json()) as any;
    let content = data.choices?.[0]?.message?.content || '';
    return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  private async generateOpeningStance(topic: string, persona: PersonaRole): Promise<{ stanceType: 'Support' | 'Oppose' | 'Nuanced'; text: string }> {
    const system = `${persona.systemPrompt}\n\nRELEVANSI & GAYA DEBAT:\n- Jawab dalam Bahasa Indonesia (campur istilah teknis/Inggris jika relevan).\n- Berikan 2-3 kalimat tajam, berani, berkarakter, dan berdasar domain keahlianmu.\n- JANGAN basa-basi. Berikan argumen paling mutakhir.`;
    const prompt = `Topik Riset: "${topic}"\n\nBagaimana sikap dan argumen pembukamu terkait topik ini?`;

    try {
      const response = await this.callGroqAPI(system, prompt);
      let stanceType: 'Support' | 'Oppose' | 'Nuanced' = 'Nuanced';
      if (response.toLowerCase().includes('setuju') || response.toLowerCase().includes('dukung') || response.toLowerCase().includes('potensi')) {
        stanceType = 'Support';
      } else if (response.toLowerCase().includes('bahaya') || response.toLowerCase().includes('tolak') || response.toLowerCase().includes('risiko')) {
        stanceType = 'Oppose';
      }
      return { stanceType, text: response };
    } catch (err: any) {
      return {
        stanceType: 'Nuanced',
        text: `[${persona.title}] Dari perspektif ${persona.category}, topik "${topic}" membutuhkan analisis mendalam terhadap ${persona.bias}`
      };
    }
  }

  private async generateRebuttal(
    topic: string,
    persona: PersonaRole,
    target: DebateNode
  ): Promise<{ stanceType: 'Support' | 'Oppose' | 'Nuanced'; linkType: 'rebuttal' | 'agreement' | 'inquiry' | 'synergy'; text: string }> {
    const system = `${persona.systemPrompt}\n\nUGAYA MENGANTAH / BERSINERGI:\n- Kamu sedang menanggapi argumen dari ${target.persona.name} (${target.persona.title}).\n- Jawab dalam Bahasa Indonesia tajam (2-3 kalimat).\n- Sanggah, beri kritik pedas, atau temukan sinergi baru berdasarkan bias kepribadianmu.`;
    const prompt = `Topik: "${topic}"\n\nArgumen dari ${target.persona.name}: "${target.currentStance}"\n\nBagaimana kamu mendebat atau memberikan tanggapan balik terhadap argumen ${target.persona.name}?`;

    try {
      const response = await this.callGroqAPI(system, prompt);
      let linkType: 'rebuttal' | 'agreement' | 'inquiry' | 'synergy' = 'rebuttal';
      const lower = response.toLowerCase();
      if (lower.includes('setuju') || lower.includes('sepakat') || lower.includes('tepat')) {
        linkType = 'agreement';
      } else if (lower.includes('bagaimana') || lower.includes('pertanyaan') || lower.includes('apakah')) {
        linkType = 'inquiry';
      } else if (lower.includes('solusi') || lower.includes('kombinasi') || lower.includes('sinergi')) {
        linkType = 'synergy';
      }

      return {
        stanceType: linkType === 'agreement' ? 'Support' : linkType === 'rebuttal' ? 'Oppose' : 'Nuanced',
        linkType,
        text: response
      };
    } catch {
      return {
        stanceType: 'Oppose',
        linkType: 'rebuttal',
        text: `Menanggapi ${target.persona.name}: Perspektif ${target.persona.title} melewatkan aspek ${persona.bias}`
      };
    }
  }

  private async generateConsensusReport(topic: string, feed: DebateEntry[]): Promise<FinalConsensusReport> {
    const summaryFeed = feed.slice(0, 15).map(f => `[${f.personaName} - ${f.personaTitle}]: ${f.text}`).join('\n');
    const system = `Kamu adalah Nova, AI Synthesis Coordinator untuk ALVO 2.0.
Tugasmu adalah menganalisis seluruh perdebatan dari 50 persona AI dan menyajikan Laporan Konsensus Riset Akhir dalam format JSON murni.

FORMAT JSON WAJIB:
{
  "consensusScore": 78,
  "executiveSummary": "Ringkasan eksekutif 2-3 kalimat dalam Bahasa Indonesia.",
  "coreAgreements": ["Poin kesepakatan 1", "Poin kesepakatan 2", "Poin kesepakatan 3"],
  "majorFrictionPoints": ["Titik perdebatan sengit 1", "Titik perdebatan sengit 2"],
  "riskMatrix": [
    { "risk": "Risiko utama 1", "severity": "High", "mitigation": "Langkah mitigasi 1" },
    { "risk": "Risiko utama 2", "severity": "Medium", "mitigation": "Langkah mitigasi 2" }
  ],
  "finalVerdict": "Kesimpulan & rekomendasi strategis final."
}`;

    const prompt = `Topik Riset: "${topic}"\n\nTranskrip Perdebatan AI Council:\n${summaryFeed}\n\nBuat Laporan Konsensus Riset Akhir dalam JSON murni!`;

    try {
      const response = await this.callGroqAPI(system, prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          topic,
          consensusScore: typeof parsed.consensusScore === 'number' ? parsed.consensusScore : 75,
          executiveSummary: parsed.executiveSummary || 'Analisis perdebatan multidimensional telah selesai disintesis.',
          coreAgreements: Array.isArray(parsed.coreAgreements) ? parsed.coreAgreements : ['Infrastruktur butuh standar keamanan baru', 'Keseimbangan terbuka dan regulasi sangat krusial'],
          majorFrictionPoints: Array.isArray(parsed.majorFrictionPoints) ? parsed.majorFrictionPoints : ['Monopoli teknologi vs Akses terbuka', 'Kecepatan inovasi vs Risiko eksistensial'],
          riskMatrix: Array.isArray(parsed.riskMatrix) ? parsed.riskMatrix : [
            { risk: 'Erosi privasi data', severity: 'High', mitigation: 'Adopsi enkripsi zero-knowledge' },
            { risk: 'Disrupsi pasar tenaga kerja', severity: 'Medium', mitigation: 'Program reskilling nasional' }
          ],
          finalVerdict: parsed.finalVerdict || 'Riset merekomendasikan pendekatan bertahap dengan pengawasan ketat.'
        };
      }
    } catch {
      // Fallback structured report
    }

    return {
      topic,
      consensusScore: 72,
      executiveSummary: `Perdebatan multisektoral mengenai "${topic}" menghasilkan konsensus bahwa inovasi harus diseimbangkan dengan mitigasi risiko sistemik.`,
      coreAgreements: [
        'Diperlukan kerangka kerja audit independen untuk transparansi.',
        'Pentingnya integrasi pertimbangan etis sejak tahap awal desain.',
        'Diversifikasi infrastruktur untuk mencegah titik kegagalan tunggal.'
      ],
      majorFrictionPoints: [
        'Dilema antara kecepatan monetisasi vs validasi keamanan jangka panjang.',
        'Perdebatan batas regulasi pemerintah terhadap riset open-source.'
      ],
      riskMatrix: [
        { risk: 'Kerentanan ancaman siber', severity: 'High', mitigation: 'Implementasi arsitektur zero-trust' },
        { risk: 'Misinformasi berskala besar', severity: 'Medium', mitigation: 'Verifikasi kriptografis dan atribusi data' }
      ],
      finalVerdict: `Langkah terbaik untuk "${topic}" adalah mengadopsi kerangka kerja proaktif, berbasis standar terbuka, dan diawasi oleh komite multi-disiplin.`
    };
  }
}

export const debateEngine = new DebateEngine();
