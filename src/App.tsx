import { useEffect, useState, useRef } from 'react';
import { ChronicleHeader } from './components/ChronicleHeader';
import { WorldSetupModal } from './components/WorldSetupModal';
import { NarrativeCanvas } from './components/NarrativeCanvas';
import { ActionBar } from './components/ActionBar';
import { CompanionDrawer } from './components/CompanionDrawer';
import { ChronicleEngine } from './services/chronicleEngine';
import { GameState, GenreSetting, PlayerCharacter } from './types/game';

const INITIAL_CHARACTER: PlayerCharacter = {
  name: 'Corvus',
  classTitle: 'Wanderer',
  health: 100,
  maxHealth: 100,
  will: 80,
  maxWill: 80,
  originStory: 'Exiled from the High Citadel after uncovering a forbidden seal.'
};

export function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const engineRef = useRef<ChronicleEngine | null>(null);

  useEffect(() => {
    engineRef.current = new ChronicleEngine('Dark Fantasy', INITIAL_CHARACTER);

    const unsubscribe = engineRef.current.subscribe((state) => {
      setGameState(state);
    });

    // Start Chapter 1 automatically
    engineRef.current.startCampaign('Dark Fantasy', INITIAL_CHARACTER);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartCampaign = (setting: GenreSetting, character: PlayerCharacter) => {
    setIsSetupOpen(false);
    if (engineRef.current) {
      engineRef.current.startCampaign(setting, character);
    }
  };

  const handleTakeAction = (actionText: string) => {
    if (engineRef.current) {
      engineRef.current.takeTurn(actionText);
    }
  };

  if (!gameState) return null;

  return (
    <div className="h-screen w-screen bg-[#0d0d0f] text-[#e6e1d5] flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. High-End Editorial Top Header */}
      <ChronicleHeader
        settingName={gameState.setting}
        characterName={gameState.character.name}
        chapterCount={gameState.chapters.length}
        mood={gameState.currentMood}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        onNewCampaign={() => setIsSetupOpen(true)}
      />

      {/* 2. Main Game Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Centered Digital Novel Reading Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <NarrativeCanvas
            chapters={gameState.chapters}
            isGenerating={gameState.isGenerating}
          />

          {/* Bottom Action Bar (Free-form input + 3 Quick Action Chips) */}
          <ActionBar
            quickActions={gameState.quickActions}
            isGenerating={gameState.isGenerating}
            onTakeAction={handleTakeAction}
          />
        </div>

        {/* 3. Collapsible Companion Drawer */}
        <CompanionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          character={gameState.character}
          inventory={gameState.inventory}
          quests={gameState.quests}
          npcs={gameState.npcs}
        />

      </div>

      {/* 4. World Setup Modal */}
      <WorldSetupModal
        isOpen={isSetupOpen}
        onStartCampaign={handleStartCampaign}
      />

    </div>
  );
}

export default App;
