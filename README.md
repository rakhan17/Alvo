# 📖 Aethelgard: The Chronicle Engine

An immersive, high-end editorial **AI Text RPG & Interactive Fiction Engine** powered by **Groq Acceleration**. Step into a distraction-free digital novel reading room where an AI Game Master (GM) crafts streaming novel chapters while dynamic AI parsers update character vitals, inventory items, active quests, and NPC relationships in real time.

---

## 🌟 Key Features

1. **High-End Editorial Journal Aesthetics**:
   - **Zero Neon Glows**: Muted, minimal, high-end editorial design language inspired by literary publications (*Kinfolk*, *The New Yorker*).
   - **Serif Novel Typography**: Rich prose rendered in elegant `Playfair Display` & `Georgia` serif font.
   - **Refined Color Palette**: Deep Charcoal (`#0d0d0f`), Warm Soft Parchment (`#161619`), Hairline Borders (`#242429`), and Muted Sage/Gold accents (`#c9b897`).
2. **Dual Groq AI Engine**:
   - **Narrator (Game Master)**: `llama-3.3-70b-versatile` streams literary novel chapters word-by-word in real time.
   - **State Extractor & Intent Suggester**: `llama-3.1-8b-instant` generates 3 contextual quick-action suggestions and updates Vitals, Inventory, Quests, and NPC Relationship scores via structured JSON parsing behind the scenes.
3. **Interactive Narrative Canvas**:
   - Free-form action input bar supporting any creative choice + 3 smart contextual quick-action chips.
4. **Collapsible Companion Drawer**:
   - Sleek side panel tracking Character Vitals (Health & Will bars), Inventory items with category badges, Active/Completed Quests, and NPC Relationship affinity meters.
5. **Dynamic Ambient Atmosphere**:
   - Context-aware mood indicator badge (*Serene*, *Tense*, *Mysterious*, *Combative*, *Melancholic*).

---

## 📁 Directory Layout & File Structure

```text
Alvo/
├── .env.example
├── .env                            # Auto-populated 13-Key Load-Balanced Groq Pool
├── src/
│   ├── types/
│   │   └── game.ts                 # Character, Inventory, Quest, NPC & Story Types
│   ├── services/
│   │   ├── groqClient.ts           # Groq Multi-Model Streaming & JSON Client
│   │   └── chronicleEngine.ts      # Game Master Loop, State Parser & Story Streamer
│   ├── components/
│   │   ├── ChronicleHeader.tsx     # Editorial Header with Ambient Mood Indicator
│   │   ├── WorldSetupModal.tsx     # Genre & Character Archetype Selection
│   │   ├── NarrativeCanvas.tsx     # Serif Digital Novel Reading Room
│   │   ├── ActionBar.tsx           # Adaptive Input & 3 Smart Quick-Action Chips
│   │   └── CompanionDrawer.tsx     # Collapsible Inventory, Stats, Quests & NPCs
│   ├── App.tsx                     # Main Interactive Fiction Application
│   └── index.css                   # Editorial CSS typography & dark parchment tokens
```

---

## 🚀 Step-by-Step Local Setup Instructions

### 1. Configure Environment `.env`
The `.env` file is pre-configured with your load-balanced Groq API key pool:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 2. Run Development Server
```bash
npm install
npm run dev
```

Open your browser at `http://127.0.0.1:3000/`.