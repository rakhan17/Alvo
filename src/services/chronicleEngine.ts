import { 
  GameState, GenreSetting, PlayerCharacter, StoryChapter, 
  InventoryItem, Quest, NPC, StoryMood 
} from '../types/game';
import { streamGroqNarrative, fetchGroqJSON } from './groqClient';

export type ChronicleListener = (state: GameState) => void;

interface StateUpdateJSON {
  healthDelta?: number;
  willDelta?: number;
  newInventoryItems?: InventoryItem[];
  removedItemNames?: string[];
  newQuests?: Quest[];
  updatedQuestStatus?: { id: string; status: 'active' | 'completed' | 'failed' }[];
  metNPCs?: NPC[];
  mood?: StoryMood;
  quickActions?: string[];
}

export class ChronicleEngine {
  private state: GameState;
  private listeners: Set<ChronicleListener> = new Set();

  constructor(initialSetting: GenreSetting, initialCharacter: PlayerCharacter) {
    this.state = {
      setting: initialSetting,
      character: initialCharacter,
      inventory: [
        { id: 'inv_1', name: 'Iron Pocket-Watch', category: 'Key Item', description: 'Ticks with a rhythmic metallic beat.' },
        { id: 'inv_2', name: 'Leather Journal', category: 'Document', description: 'Bound in weathered calfskin.' }
      ],
      quests: [
        { id: 'q_1', title: 'Find the Sanctuary', description: 'Locate the hidden enclave beyond the mist.', status: 'active' }
      ],
      npcs: [],
      chapters: [],
      currentMood: 'Mysterious',
      quickActions: [
        'Examine the surrounding architecture carefully',
        'Check your inventory and weapons',
        'Proceed quietly down the main corridor'
      ],
      isGenerating: false
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public subscribe(listener: ChronicleListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public async startCampaign(setting: GenreSetting, character: PlayerCharacter) {
    this.state.setting = setting;
    this.state.character = character;
    this.state.chapters = [];
    this.state.isGenerating = true;
    this.notify();

    const systemPrompt = `You are the Game Master (GM) for an immersive, high-end editorial Text RPG titled "Aethelgard: The Chronicle Engine".
Setting: ${setting}
Character Name: ${character.name}
Class: ${character.classTitle}
Origin: ${character.originStory}

STRICT NARRATIVE DIRECTIVES:
- Write in rich, atmospheric, literary prose (like a classic high fantasy or gothic novel).
- Avoid gamey HUD references or system text in the narration.
- Write Chapter 1 opening setting the atmosphere, introducing immediate choices, and grounding the character.
- Keep output around 200-300 words.`;

    const userPrompt = `Begin Chapter 1 of the story for ${character.name} in the ${setting} universe.`;

    const chapterId = `chap_1_${Date.now()}`;
    const newChapter: StoryChapter = {
      id: chapterId,
      chapterNumber: 1,
      narrativeText: '',
      timestamp: Date.now(),
      mood: 'Mysterious',
      isStreaming: true
    };

    this.state.chapters.push(newChapter);
    this.notify();

    const stream = streamGroqNarrative(systemPrompt, userPrompt);
    for await (const chunk of stream) {
      newChapter.narrativeText += chunk;
      this.notify();
    }

    newChapter.isStreaming = false;
    this.state.isGenerating = false;
    this.notify();

    // Fetch dynamic quick actions & initial state
    await this.updateDynamicStateAndSuggestions('Chapter 1 Opening');
  }

  public async takeTurn(actionText: string) {
    if (this.state.isGenerating || !actionText.trim()) return;

    this.state.isGenerating = true;
    const currentChapterNum = this.state.chapters.length + 1;

    const lastChapter = this.state.chapters[this.state.chapters.length - 1];
    if (lastChapter) {
      lastChapter.actionTaken = actionText.trim();
    }

    this.notify();

    const systemPrompt = `You are the Game Master for "Aethelgard: The Chronicle Engine".
Setting: ${this.state.setting}
Character: ${this.state.character.name} (${this.state.character.classTitle})
Current Health: ${this.state.character.health}/${this.state.character.maxHealth}
Current Will/Mana: ${this.state.character.will}/${this.state.character.maxWill}

NARRATIVE DIRECTIVES:
- Write literary, immersive novel prose continuing the story.
- Respond directly to the player's chosen action: "${actionText.trim()}".
- Describe consequences, environmental reactions, or NPC dialogues vividly.
- Keep length to 200-300 words.`;

    const historyContext = this.state.chapters
      .slice(-3)
      .map(c => `Chapter ${c.chapterNumber}:\n${c.narrativeText}\n[Player Action]: ${c.actionTaken || 'None'}`)
      .join('\n\n');

    const userPrompt = `Recent Story Context:\n${historyContext}\n\nPlayer Chosen Action: "${actionText.trim()}"\n\nWrite Chapter ${currentChapterNum}:`;

    const chapterId = `chap_${currentChapterNum}_${Date.now()}`;
    const newChapter: StoryChapter = {
      id: chapterId,
      chapterNumber: currentChapterNum,
      narrativeText: '',
      timestamp: Date.now(),
      mood: this.state.currentMood,
      isStreaming: true
    };

    this.state.chapters.push(newChapter);
    this.notify();

    const stream = streamGroqNarrative(systemPrompt, userPrompt);
    for await (const chunk of stream) {
      newChapter.narrativeText += chunk;
      this.notify();
    }

    newChapter.isStreaming = false;
    this.state.isGenerating = false;
    this.notify();

    // Parse state updates (HP, Inventory, Quests, NPCs, 3 Quick Actions)
    await this.updateDynamicStateAndSuggestions(actionText.trim());
  }

  private async updateDynamicStateAndSuggestions(lastAction: string) {
    const systemPrompt = `You are the State Extractor for an AI RPG. Analyze the latest story chapter and player action to update the game state and generate 3 smart contextual quick-action suggestions.
Return ONLY valid JSON matching this schema:
{
  "healthDelta": 0,
  "willDelta": 0,
  "newInventoryItems": [{"id": "item_1", "name": "Item Name", "category": "Weapon", "description": "Desc"}],
  "removedItemNames": [],
  "newQuests": [{"id": "q_new", "title": "Title", "description": "Desc", "status": "active"}],
  "updatedQuestStatus": [],
  "metNPCs": [{"id": "npc_1", "name": "Name", "role": "Role", "relationship": 20, "statusNote": "Friendly"}],
  "mood": "Mysterious",
  "quickActions": ["Action 1", "Action 2", "Action 3"]
}`;

    const recentChapter = this.state.chapters[this.state.chapters.length - 1];
    const userPrompt = `Story Chapter Text:\n${recentChapter?.narrativeText || ''}\n\nLast Player Action: "${lastAction}"`;

    const jsonUpdate = await fetchGroqJSON<StateUpdateJSON>(systemPrompt, userPrompt);

    if (jsonUpdate) {
      // 1. Health & Will Updates
      if (jsonUpdate.healthDelta) {
        this.state.character.health = Math.max(0, Math.min(this.state.character.maxHealth, this.state.character.health + jsonUpdate.healthDelta));
      }
      if (jsonUpdate.willDelta) {
        this.state.character.will = Math.max(0, Math.min(this.state.character.maxWill, this.state.character.will + jsonUpdate.willDelta));
      }

      // 2. Inventory Updates
      if (jsonUpdate.newInventoryItems && Array.isArray(jsonUpdate.newInventoryItems)) {
        jsonUpdate.newInventoryItems.forEach(item => {
          if (!this.state.inventory.some(i => i.name === item.name)) {
            this.state.inventory.push({ ...item, id: `inv_${Date.now()}_${Math.random()}` });
          }
        });
      }
      if (jsonUpdate.removedItemNames && Array.isArray(jsonUpdate.removedItemNames)) {
        this.state.inventory = this.state.inventory.filter(i => !jsonUpdate.removedItemNames?.includes(i.name));
      }

      // 3. Quest Updates
      if (jsonUpdate.newQuests && Array.isArray(jsonUpdate.newQuests)) {
        jsonUpdate.newQuests.forEach(q => {
          if (!this.state.quests.some(existing => existing.title === q.title)) {
            this.state.quests.push({ ...q, id: `q_${Date.now()}` });
          }
        });
      }

      // 4. NPC Updates
      if (jsonUpdate.metNPCs && Array.isArray(jsonUpdate.metNPCs)) {
        jsonUpdate.metNPCs.forEach(npc => {
          const idx = this.state.npcs.findIndex(n => n.name === npc.name);
          if (idx !== -1) {
            this.state.npcs[idx] = { ...this.state.npcs[idx], ...npc };
          } else {
            this.state.npcs.push({ ...npc, id: `npc_${Date.now()}` });
          }
        });
      }

      // 5. Mood & Quick Actions
      if (jsonUpdate.mood) {
        this.state.currentMood = jsonUpdate.mood;
      }
      if (jsonUpdate.quickActions && Array.isArray(jsonUpdate.quickActions) && jsonUpdate.quickActions.length === 3) {
        this.state.quickActions = jsonUpdate.quickActions;
      }
    }

    this.notify();
  }
}
