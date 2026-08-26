export type GenreSetting = 
  | 'Dark Fantasy'
  | 'Cyber-Noir'
  | 'Victorian Gothic'
  | 'Cosmic Mystery'
  | 'Post-Apocalyptic';

export type CharacterClass = 
  | 'Wanderer'
  | 'Scholar'
  | 'Inquisitor'
  | 'Mercenary'
  | 'Alchemist'
  | 'Detective';

export interface PlayerCharacter {
  name: string;
  classTitle: CharacterClass;
  health: number;
  maxHealth: number;
  will: number;
  maxWill: number;
  originStory: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Weapon' | 'Relic' | 'Consumable' | 'Document' | 'Key Item';
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  relationship: number; // -100 (Hostile) to +100 (Devoted)
  statusNote: string;
}

export type StoryMood = 'Serene' | 'Tense' | 'Mysterious' | 'Combative' | 'Melancholic';

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  narrativeText: string;
  actionTaken?: string;
  timestamp: number;
  mood: StoryMood;
  isStreaming?: boolean;
}

export interface GameState {
  setting: GenreSetting;
  character: PlayerCharacter;
  inventory: InventoryItem[];
  quests: Quest[];
  npcs: NPC[];
  chapters: StoryChapter[];
  currentMood: StoryMood;
  quickActions: string[];
  isGenerating: boolean;
}
