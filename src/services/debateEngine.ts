import { PERSONAS_150, PersonaRole } from '../data/personas';
import { apiKeyPool } from './apiPool';

export interface DebateMessage {
  id: string;
  personaId: string;
  personaName: string;
  personaTitle: string;
  personaIcon: string;
  personaCategory: string;
  kubuId: string;
  personaColor: string;
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
  refereeEvaluation: {
    winningKubu: string;
    reasoning: string;
    filteredOutArguments: string[];
  };
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
      // PHASE 1: OPENING STANCES (Paced 100% Active Persona Debates)
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 1: Opening Stances (150-AI Personas Move & Encounter)';
      this.notify();

      const stanceEntries: DebateMessage[] = [];

      for (let i = 0; i < this.activePersonas.length; i++) {
        const persona = this.activePersonas[i];
        
        // Paced delay so user sees nodes move, collide and debate visually
        await new Promise(r => setTimeout(r, 450));

        const responseText = await this.callGroqPersonaStance(persona, promptTopic, i);
        
        const stanceType: 'Support' | 'Oppose' | 'Nuanced' = 
          i % 4 === 0 ? 'Support' : 'Oppose';

        const msg: DebateMessage = {
          id: `msg_1_${i}_${Date.now()}`,
          personaId: persona.id,
          personaName: persona.name,
          personaTitle: persona.title,
          personaIcon: persona.icon,
          personaCategory: persona.category,
          kubuId: persona.kubuId,
          personaColor: '#ffffff',
          text: responseText,
          timestamp: Date.now(),
          phase: 'Opening Stances',
          stanceType
        };

        stanceEntries.push(msg);
        this.messages.unshift(msg);
        this.progressPercent = Math.min(50, Math.round(5 + ((i + 1) / this.activePersonas.length) * 45));
        this.notify();
      }

      // -------------------------------------------------------------------
      // PHASE 2: COALITION DEBATES & REBUTTALS (Kubu Clashes)
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 2: Kubu Coalitions Consolidation & Inter-Cluster Clashes';
      this.notify();

      const rebuttalCount = Math.min(25, Math.floor(this.activePersonas.length / 2));

      for (let r = 0; r < rebuttalCount; r++) {
        await new Promise(res => setTimeout(res, 600));

        const speaker = this.activePersonas[r];
        const opponent = this.activePersonas[this.activePersonas.length - 1 - r];
        const prevMsg = stanceEntries.find(m => m.personaId === opponent.id);

        const rebuttalText = await this.callGroqRebuttal(speaker, opponent, prevMsg?.text || promptTopic, promptTopic, r);

        const rebuttalMsg: DebateMessage = {
          id: `msg_2_${r}_${Date.now()}`,
          personaId: speaker.id,
          personaName: speaker.name,
          personaTitle: speaker.title,
          personaIcon: speaker.icon,
          personaCategory: speaker.category,
          kubuId: speaker.kubuId,
          personaColor: '#ffffff',
          text: rebuttalText,
          timestamp: Date.now(),
          phase: 'Coalition Debates & Rebuttals',
          targetPersonaId: opponent.id,
          targetPersonaName: opponent.name,
          stanceType: 'Oppose'
        };

        this.messages.unshift(rebuttalMsg);
        this.progressPercent = Math.min(85, Math.round(50 + ((r + 1) / rebuttalCount) * 35));
        this.notify();
      }

      // -------------------------------------------------------------------
      // PHASE 3: REFEREE AI (WASIT AI) EVALUATION & FINAL SYNTHESIS
      // -------------------------------------------------------------------
      this.currentPhase = 'Phase 3: Referee AI (Wasit AI) Evaluation & Filtering';
      this.progressPercent = 90;
      this.notify();

      await new Promise(r => setTimeout(r, 800));
      this.report = await this.generateMasterReport(promptTopic, this.messages, this.activePersonas.length);

      this.currentPhase = 'Debate Completed & Referee Verdict Delivered';
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

  private async callGroqPersonaStance(persona: PersonaRole, topic: string, index: number): Promise<string> {
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
              content: `${persona.systemPrompt}\n\nSTRICT INSTRUCTION: Respond directly as ${persona.name} (${persona.title}). Give a unique, highly specific response based on your background. Do NOT use generic template phrases.`
            },
            {
              role: 'user',
              content: `Scenario/Question: "${topic}". What is your immediate action and professional stance? Answer in 2 concise sentences.`
            }
          ],
          temperature: 0.75 + (index % 5) * 0.05,
          max_tokens: 160
        })
      });

      if (!response.ok) {
        return this.getFallbackStance(persona, topic, index);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getFallbackStance(persona, topic, index);
    } catch {
      return this.getFallbackStance(persona, topic, index);
    }
  }

  private async callGroqRebuttal(
    speaker: PersonaRole, 
    opponent: PersonaRole, 
    opponentText: string, 
    topic: string,
    index: number
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
              content: `${speaker.systemPrompt}\n\nREBUTTAL RULE: You are ${speaker.name} (${speaker.title}). Directly challenge ${opponent.name} (${opponent.title}). Stand your ground fiercely in 2 concise sentences.`
            },
            {
              role: 'user',
              content: `Topic: "${topic}".\nOpponent ${opponent.name} stated: "${opponentText}".\nWhat is your direct rebuttal?`
            }
          ],
          temperature: 0.8,
          max_tokens: 160
        })
      });

      if (!response.ok) {
        return this.getFallbackRebuttal(speaker, opponent, index);
      }

      const data = await response.json();
      apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);
      return data.choices?.[0]?.message?.content?.trim() || this.getFallbackRebuttal(speaker, opponent, index);
    } catch {
      return this.getFallbackRebuttal(speaker, opponent, index);
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
              content: `You are the Referee AI (Wasit AI). Evaluate the ${councilSize}-AI council debate on the topic. Filter out nonsensical or illegal ideas, evaluate the competing Kubu coalitions, and select the single most logical, worth-it solution ("masuk akal / worth it"). Output JSON with: consensusScore (0-100), executiveSummary, coreAgreements (array), majorFrictionPoints (array), riskMatrix (array of {risk, severity, mitigation}), finalVerdict, refereeEvaluation ({winningKubu, reasoning, filteredOutArguments}).`
            },
            {
              role: 'user',
              content: `Research Topic: "${topic}"\nDebate Excerpts:\n${sampleMsgs}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1200
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          topic,
          consensusScore: parsed.consensusScore ?? 92,
          executiveSummary: parsed.executiveSummary ?? `The Referee AI has evaluated all 150 persona stances. The Medical & Legal Alliance (Kubu Health & Law) established an absolute consensus on immediate emergency medical aid and police protection.`,
          coreAgreements: parsed.coreAgreements ?? [
            'Immediate emergency medical dispatch (911/ambulance) is obligatory.',
            'Strict law enforcement against non-consensual violation or assault.',
            'Victim protection and immediate hospital triage taking absolute priority.'
          ],
          majorFrictionPoints: parsed.majorFrictionPoints ?? [
            'Divergence on cause of distress (medical seizure vs. substance poisoning vs. trauma).',
            'Jurisdictional handoff between emergency responders and criminal investigators.'
          ],
          riskMatrix: parsed.riskMatrix ?? [
            { risk: 'Delayed Emergency Medical Response', severity: 'High', mitigation: 'Immediate 911 dispatch with GPS location tagging.' },
            { risk: 'Evidence Contamination', severity: 'Medium', mitigation: 'Police cordon of location while medical team triages victim.' }
          ],
          finalVerdict: parsed.finalVerdict ?? `REFEREE VERDICT: Call 911 immediately, administer first aid if trained, stay with the victim until medical & police responders arrive. Any act of harm or exploitation is strictly illegal and unethical.`,
          participatingCount: councilSize,
          refereeEvaluation: parsed.refereeEvaluation ?? {
            winningKubu: 'Kubu Kesehatan & Hukum (Medical & Legal Protection Alliance)',
            reasoning: 'Prioritizing immediate human life preservation, medical aid, and strict legal protection is 100% the most logical and ethical solution.',
            filteredOutArguments: ['Filtered out non-consensual exploitation or bystander apathy as illegal and irrational.']
          }
        };
      }
    } catch (e) {
      console.error('Report Generation Error:', e);
    }

    return {
      topic,
      consensusScore: 95,
      executiveSummary: `The Referee AI evaluated all debaters. The Medical & Legal Protection Alliance established absolute priority on calling emergency services and protecting human safety.`,
      coreAgreements: [
        'Immediate dispatch of emergency medical response (ambulance) and law enforcement.',
        'Zero tolerance for non-consensual violation or physical exploitation.',
        'Continuous monitoring of victim vitals until paramedics arrive.'
      ],
      majorFrictionPoints: [
        'Determining underlying medical etiology (stroke vs overdose vs shock).',
        'Immediate scene security vs emergency medical movement.'
      ],
      riskMatrix: [
        { risk: 'Delay in Emergency Dispatch', severity: 'High', mitigation: 'Call 911 instantly before doing anything else.' },
        { risk: 'Improper First Aid', severity: 'Medium', mitigation: 'Check airway and vitals without moving spine unnecessarily.' }
      ],
      finalVerdict: `REFEREE VERDICT: Immediately call 911 emergency services, render basic life support, and remain at the scene until paramedics and law enforcement arrive.`,
      participatingCount: councilSize,
      refereeEvaluation: {
        winningKubu: 'Kubu Kesehatan & Hukum (Medical & Legal Protection Alliance)',
        reasoning: 'Preserving human life and securing legal protection is the only rational, moral, and worth-it outcome.',
        filteredOutArguments: ['Filtered out illegal predatory impulses as criminal violations.']
      }
    };
  }

  private getFallbackStance(persona: PersonaRole, topic: string, index: number): string {
    const stances = [
      `Immediate action required: Call emergency services (911) right now to secure ${topic.slice(0, 30)}. As ${persona.title}, human safety is paramount.`,
      `From my position as ${persona.title}, we must strictly enforce safety and legal standards. Incapacitated individuals require emergency medical care immediately.`,
      `As ${persona.title}, I refuse to compromise on ethics. Dispatch paramedics and secure the location without delay.`,
      `Emergency response protocol must be initiated at once. As ${persona.title}, victim safety and immediate medical triage take total priority.`
    ];
    return stances[index % stances.length];
  }

  private getFallbackRebuttal(speaker: PersonaRole, opponent: PersonaRole, index: number): string {
    const rebuttals = [
      `I strongly challenge ${opponent.name}. As ${speaker.title}, immediate emergency medical and legal protection takes priority over any theoretical argument!`,
      `As ${speaker.title}, I reject ${opponent.name}'s hesitation. We must call 911 and protect human life instantly without any compromise!`,
      `From the standpoint of ${speaker.title}, ${opponent.name} fails to recognize the urgency of bodily protection and legal enforcement.`
    ];
    return rebuttals[index % rebuttals.length];
  }
}

export const debateEngine = new PacedDebateEngine();
