import { PERSONAS_150, PersonaRole } from '../data/personas';
import { apiKeyPool } from './apiPool';

export interface DebateMessage {
  id: string;
  personaId: string;
  personaName: string;
  personaTitle: string;
  personaIcon: string;
  personaCategory: string;
  personaColor: string; // Monochrome shade
  text: string;
  timestamp: number;
  phase: 'Opening Stances' | 'Coalition Debates & Rebuttals' | 'Master Synthesis';
  targetPersonaId?: string;
  targetPersonaName?: string;
  stanceType: 'Support' | 'Oppose' | 'Nuanced';
}

export interface RiskItem {
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface ConsensusReport {
  topic: string;
  consensusScore: number; // 0 - 100
  executiveSummary: string;
  coreAgreements: string[];
  majorFrictionPoints: string[];
  riskMatrix: RiskItem[];
  finalVerdict: string;
  participatingCount: number;
}

export type DebateStateListener = (state: {
  isDebating: boolean;
  currentPhase: string;
  topic: string;
  messages: DebateMessage[];
  activePersonas: PersonaRole[];
  report: ConsensusReport | null;
  progressPercent: number;
}) => void;

class PacedDebateEngine {
  private isDebating = false;
  private currentPhase = '';
  private topic = '';
  private messages: DebateMessage[] = [];
  private activePersonas: PersonaRole[] = [];
  private report: ConsensusReport | null = null;
  private progressPercent = 0;
  private listeners: Set<DebateStateListener> = new Set();

  public subscribe(listener: DebateStateListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({
        isDebating: this.isDebating,
        currentPhase: this.currentPhase,
        topic: this.topic,
        messages: [...this.messages],
        activePersonas: [...this.activePersonas],
        report: this.report,
        progressPercent: this.progressPercent
      });
    }
  }

  public async startDebate(promptTopic: string, councilSize = 50) {
    if (this.isDebating) return;

    this.isDebating = true;
    this.topic = promptTopic;
    this.messages = [];
    this.report = null;
    this.progressPercent = 5;

    // Pick council size from PERSONAS_150 (up to 150)
    this.activePersonas = PERSONAS_150.slice(0, Math.min(councilSize, PERSONAS_150.length));
    this.notify();

    try {
      // -------------------------------------------------------------------
      // PHASE 1: OPENING STANCES (Paced 100% Active Participation)
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 1: Opening Stances (100% Active Persona Debates)';
      this.notify();

      const stanceEntries: DebateMessage[] = [];

      for (let i = 0; i < this.activePersonas.length; i++) {
        const persona = this.activePersonas[i];
        
        // Paced delay so user can visually follow the debate stream
        await new Promise(r => setTimeout(r, 600));

        const responseText = await this.callGroqPersonaStance(persona, promptTopic);
        
        const stanceType: 'Support' | 'Oppose' | 'Nuanced' = 
          i % 3 === 0 ? 'Support' : i % 3 === 1 ? 'Oppose' : 'Nuanced';

        const msg: DebateMessage = {
          id: `msg_1_${i}_${Date.now()}`,
          personaId: persona.id,
          personaName: persona.name,
          personaTitle: persona.title,
          personaIcon: persona.icon,
          personaCategory: persona.category,
          personaColor: '#ffffff',
          text: responseText,
          timestamp: Date.now(),
          phase: 'Opening Stances',
          stanceType
        };

        stanceEntries.push(msg);
        this.messages.unshift(msg);
        this.progressPercent = Math.min(45, Math.round(5 + ((i + 1) / this.activePersonas.length) * 40));
        this.notify();
      }

      // -------------------------------------------------------------------
      // PHASE 2: COALITION DEBATES & REBUTTALS (Fierce Unyielding Clashes)
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 2: Coalition Debates & Cross-Examination';
      this.notify();

      // Pair up opposing personas for direct cross-examination
      const rebuttalCount = Math.min(25, Math.floor(this.activePersonas.length / 2));

      for (let r = 0; r < rebuttalCount; r++) {
        await new Promise(res => setTimeout(res, 800));

        const speaker = this.activePersonas[r];
        const opponent = this.activePersonas[this.activePersonas.length - 1 - r];
        const prevMsg = stanceEntries.find(m => m.personaId === opponent.id);

        const rebuttalText = await this.callGroqRebuttal(speaker, opponent, prevMsg?.text || promptTopic, promptTopic);

        const rebuttalMsg: DebateMessage = {
          id: `msg_2_${r}_${Date.now()}`,
          personaId: speaker.id,
          personaName: speaker.name,
          personaTitle: speaker.title,
          personaIcon: speaker.icon,
          personaCategory: speaker.category,
          personaColor: '#ffffff',
          text: rebuttalText,
          timestamp: Date.now(),
          phase: 'Coalition Debates & Rebuttals',
          targetPersonaId: opponent.id,
          targetPersonaName: opponent.name,
          stanceType: 'Oppose'
        };

        this.messages.unshift(rebuttalMsg);
        this.progressPercent = Math.min(80, Math.round(45 + ((r + 1) / rebuttalCount) * 35));
        this.notify();
      }

      // -------------------------------------------------------------------
      // PHASE 3: MASTER CONSENSUS SYNTHESIS & REPORT GENERATION
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 3: Master Synthesis AI (Nova Coordinator)';
      this.progressPercent = 85;
      this.notify();

      await new Promise(r => setTimeout(r, 1000));
      this.report = await this.generateMasterReport(promptTopic, this.messages, this.activePersonas.length);

      this.currentPhase = 'Debate Completed';
      this.progressPercent = 100;
      this.isDebating = false;
      this.notify();

    } catch (error) {
      console.error('Debate Engine Error:', error);
      this.isDebating = false;
      this.currentPhase = 'Debate Stopped (API Error)';
      this.notify();
    }
  }

  private async callGroqPersonaStance(persona: PersonaRole, topic: string): Promise<string> {
    const keyItem = apiKeyPool.getNextKey();
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyItem.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `${persona.systemPrompt} STUBBORN CONVICTION RULE: Stand your ground firmly based on your professional duties as ${persona.title}. Do NOT be easily swayed by others. Provide a sharp, concise 2-3 sentence argument on the topic.`
            },
            {
              role: 'user',
              content: `Topic: "${topic}". What is your unwavering stance?`
            }
          ],
          temperature: 0.65,
          max_tokens: 150
        })
      });

      if (response.status === 429) {
        apiKeyPool.reportRateLimit(keyItem.id, 20);
        return this.getFallbackStance(persona, topic);
      }

      if (!response.ok) {
        return this.getFallbackStance(persona, topic);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getFallbackStance(persona, topic);
    } catch {
      return this.getFallbackStance(persona, topic);
    }
  }

  private async callGroqRebuttal(
    speaker: PersonaRole, 
    opponent: PersonaRole, 
    opponentText: string, 
    topic: string
  ): Promise<string> {
    const keyItem = apiKeyPool.getNextKey();
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyItem.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `${speaker.systemPrompt} REBUTTAL RULE: Directly counter-argument ${opponent.name} (${opponent.title}). Refuse to back down! Defend your worldview stubbornly in 2-3 concise sentences.`
            },
            {
              role: 'user',
              content: `Topic: "${topic}".\nOpponent ${opponent.name} said: "${opponentText}".\nProvide your unyielding rebuttal:`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        return this.getFallbackRebuttal(speaker, opponent);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getFallbackRebuttal(speaker, opponent);
    } catch {
      return this.getFallbackRebuttal(speaker, opponent);
    }
  }

  private async generateMasterReport(topic: string, msgs: DebateMessage[], councilSize: number): Promise<ConsensusReport> {
    const keyItem = apiKeyPool.getNextKey();
    const sampleMsgs = msgs.slice(0, 30).map(m => `[${m.personaTitle} ${m.personaName}]: ${m.text}`).join('\n');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyItem.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are Nova, Master Consensus AI Coordinator. Synthesize a comprehensive research verdict from the ${councilSize}-AI council debate. Output strict valid JSON only with keys: consensusScore (number 0-100), executiveSummary (string), coreAgreements (array of strings), majorFrictionPoints (array of strings), riskMatrix (array of objects {risk, severity, mitigation}), finalVerdict (string).`
            },
            {
              role: 'user',
              content: `Research Topic: "${topic}"\nDebate Excerpts:\n${sampleMsgs}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          topic,
          consensusScore: parsed.consensusScore ?? 74,
          executiveSummary: parsed.executiveSummary ?? `Synthesized analysis from ${councilSize} diverse human perspectives across medicine, governance, economics, science, and culture.`,
          coreAgreements: parsed.coreAgreements ?? [
            'Baseline agreement on preserving public health and human safety infrastructure.',
            'Need for transparent regulatory frameworks and democratic accountability.'
          ],
          majorFrictionPoints: parsed.majorFrictionPoints ?? [
            'Clash between economic growth initiatives vs long-term environmental protection.',
            'Divergence on state security enforcement vs civil liberties.'
          ],
          riskMatrix: parsed.riskMatrix ?? [
            { risk: 'Systemic Economic Disruption', severity: 'High', mitigation: 'Phase-in regulatory policies with small business subsidies.' },
            { risk: 'Public Health Overreach', severity: 'Medium', mitigation: 'Enforce judicial review and sunset clauses on emergency powers.' }
          ],
          finalVerdict: parsed.finalVerdict ?? `A balanced strategy must prioritize life safety while creating sustainable market frameworks.`,
          participatingCount: councilSize
        };
      }
    } catch (e) {
      console.error('Report Generation Error:', e);
    }

    return {
      topic,
      consensusScore: 68,
      executiveSummary: `Synthesized research findings across ${councilSize} active human debaters representing healthcare, legal governance, economics, environmental science, and social philosophy.`,
      coreAgreements: [
        'Universal agreement on safeguarding basic human life and safety baseline.',
        'Necessity of structured regulatory oversight before widespread deployment.'
      ],
      majorFrictionPoints: [
        'Tension between rapid technological progress vs traditional ethical boundaries.',
        'Economic capital allocation vs social safety net investments.'
      ],
      riskMatrix: [
        { risk: 'Unintended Societal Externalities', severity: 'High', mitigation: 'Establish multi-stakeholder monitoring committees.' },
        { risk: 'Regulatory Bottlenecks', severity: 'Medium', mitigation: 'Implement sandbox testing with clear expiration metrics.' }
      ],
      finalVerdict: `The council recommends a phased approach balancing innovation with strict moral safeguards.`,
      participatingCount: councilSize
    };
  }

  private getFallbackStance(persona: PersonaRole, topic: string): string {
    return `As ${persona.title}, I stand firmly on my professional principles regarding "${topic}". My duty to ${persona.category.toLowerCase()} principles requires that we do not compromise core safety and ethics for short-term gain.`;
  }

  private getFallbackRebuttal(speaker: PersonaRole, opponent: PersonaRole): string {
    return `I must strongly challenge ${opponent.name}'s perspective. From my position as ${speaker.title}, their view underestimates critical risks in ${speaker.category.toLowerCase()}. We cannot abandon our principles.`;
  }
}

export const debateEngine = new PacedDebateEngine();
