import { PatternSnippet, MasterArrangement, SnippetCategory } from '../types/music';
import { apiKeyPool } from './apiPool';

interface GeneratedBatchJSON {
  bpm: number;
  snippets: {
    filename: string;
    category: SnippetCategory;
    title: string;
    strudelCode: string;
    tags: string[];
  }[];
  mainArrangementCode: string;
}

export async function generateModularSnippetsBatch(globalConcept: string): Promise<{
  bpm: number;
  snippets: PatternSnippet[];
  master: MasterArrangement;
} | null> {
  const keyItem = apiKeyPool.getNextKey();
  const startTime = Date.now();

  const systemPrompt = `You are an expert Live-Coding Music Producer and Strudel Syntax Master.
The user will give a global musical concept. Your task is to generate a modular library of SHORT, REUSABLE Strudel pattern snippets (micro-loops) categorized by instrument function, plus a master 'main.strudel' arrangement that stacks them.

STRUDEL SYNTAX RULES:
- Drums: Use s("bd sd hh*4"), s("bd [~ bd] sd hh*8"), s("cp [~ cp]"), etc.
- Basslines: Use n("c2 e2 g2 b2").s("sawtooth") or n("0 3 7 10").s("square")
- Synths / Arps: Use n("c4 e4 g4 b4").s("sine") or n("0 2 4 7 9").s("triangle")
- Pads / Chords: Use n("<c3 e3 g3>").s("sine")

RETURN ONLY VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "bpm": 120,
  "snippets": [
    {
      "filename": "drums/kick_basic.strudel",
      "category": "drums",
      "title": "Basic Kick & Snare",
      "strudelCode": "s(\"bd sd [~ bd] sd\")",
      "tags": ["kick", "snare", "beat"]
    },
    {
      "filename": "drums/hihat_fast.strudel",
      "category": "drums",
      "title": "Fast Trap Hi-Hats",
      "strudelCode": "s(\"hh*8\")",
      "tags": ["hihat", "percussion"]
    },
    {
      "filename": "bass/sub_funky.strudel",
      "category": "bass",
      "title": "Funky Sub Bass",
      "strudelCode": "n(\"c2 e2 g2 b2\").s(\"sawtooth\")",
      "tags": ["bass", "groovy"]
    },
    {
      "filename": "synth/dreamy_arp.strudel",
      "category": "synth",
      "title": "Dreamy Arpeggio",
      "strudelCode": "n(\"c4 e4 g4 b4\").s(\"sine\")",
      "tags": ["arp", "lead"]
    }
  ],
  "mainArrangementCode": "stack(s(\"bd sd [~ bd] sd\"), s(\"hh*8\"), n(\"c2 e2 g2 b2\").s(\"sawtooth\"), n(\"c4 e4 g4 b4\").s(\"sine\"))"
}`;

  const userPrompt = `Global Musical Concept: "${globalConcept.trim()}"`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.75,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed: GeneratedBatchJSON = JSON.parse(content);

    const bpm = parsed.bpm || 120;
    const snippets: PatternSnippet[] = parsed.snippets.map((s, idx) => ({
      id: `snip_${Date.now()}_${idx}`,
      filename: s.filename,
      category: s.category || 'drums',
      title: s.title,
      strudelCode: s.strudelCode,
      isActive: true,
      bpm,
      tags: s.tags || []
    }));

    const master: MasterArrangement = {
      id: `master_${Date.now()}`,
      filename: 'main.strudel',
      title: 'Master Composition Stack',
      strudelCode: parsed.mainArrangementCode || 'stack(s("bd sd"), s("hh*4"))',
      activeSnippetIds: snippets.map(s => s.id),
      bpm
    };

    return { bpm, snippets, master };
  } catch {
    return null;
  }
}

export async function modifyTargetSnippet(
  targetSnippet: PatternSnippet,
  userInstruction: string
): Promise<string | null> {
  const keyItem = apiKeyPool.getNextKey();
  const startTime = Date.now();

  const systemPrompt = `You are a Strudel live-coding syntax expert.
The user wants to modify ONLY this specific short Strudel pattern snippet (${targetSnippet.filename}).
Current Strudel Code: "${targetSnippet.strudelCode}"

Instruction: "${userInstruction.trim()}"

RETURN ONLY VALID JSON MATCHING SCHEMA:
{
  "updatedStrudelCode": "s(\"bd sd [~ bd] sd hh*16\")"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keyItem.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Modify snippet code according to instruction.` }
        ],
        temperature: 0.5,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    apiKeyPool.reportSuccess(keyItem.id, Date.now() - startTime);

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed.updatedStrudelCode || null;
  } catch {
    return null;
  }
}
