# ⚔️ Groq AI Debate Arena

A real-time, multi-model AI debate web application powered by **Groq LLM Acceleration**. Multiple AI models with distinct personas engage in structured dialectical debates over user-defined motions, moderated by a third AI Referee with live word-by-word streaming text.

---

## 🌟 Key Features

1. **Multi-Model Groq Engine**:
   - Assign different Groq LLM models (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma2-9b-it`) for Debater A, Debater B, and the Moderator.
2. **Cyber Arena Split-Screen UI**:
   - **Debater A (PRO)**: Left Panel with glowing Emerald active speaker aura.
   - **Debater B (CONTRA)**: Right Panel with glowing Rose active speaker aura.
   - **Moderator & Supreme Referee**: Top Center Panel with Opening Intro and Final Verdict Announcement.
3. **Structured Multi-Round Loop**:
   - Round 1: Moderator Opening -> Debater A Argument -> Debater B Counter.
   - Round 2..N: Alternating Rebuttals & Counter-arguments.
   - Verdict: Moderator analyzes logical clashes, fallacies, and declares the winner!
4. **Real-Time Word Streaming**:
   - Live word-by-word streaming output taking full advantage of Groq's high throughput.
5. **Interactive Controls**:
   - Full Start, Pause, Resume, Reset, and Arena Setup drawer.

---

## 📁 Recommended Directory Structure

```text
Alvo/
├── .env.example
├── .env                        # Local Groq API Key environment file
├── src/
│   ├── types/
│   │   └── debate.ts           # Type definitions for Arena, Debaters, Rounds & Messages
│   ├── services/
│   │   ├── groqClient.ts       # Groq Multi-Model API Client with streaming & retry
│   │   └── debateArenaEngine.ts# Real-time Arena Loop & Stream Event Emitter
│   ├── components/
│   │   ├── ArenaHeader.tsx     # Cyberpunk Header with status indicators
│   │   ├── SetupPanel.tsx      # Motion input, Model selector, Persona prompts
│   │   ├── ModeratorCard.tsx   # Top center Moderator card & final verdict
│   │   ├── DebaterCard.tsx     # Split-screen Debater panel (Left PRO / Right CONTRA)
│   │   └── ControlBar.tsx      # Play, Pause, Resume, Reset controls
│   ├── App.tsx                 # Main Arena App integration
│   └── index.css               # Cyber Arena Tailwind CSS styles & animations
```

---

## 🚀 Step-by-Step Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Configure Environment `.env`
Create a `.env` file in the project root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Add your Groq API Key from [console.groq.com/keys](https://console.groq.com/keys):
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Install Dependencies & Run Development Server
```bash
npm install
npm run dev
```

Open your browser at `http://127.0.0.1:3000/`.

---

## 🛠️ Production Build
To test and validate the production bundle:
```bash
npm run build
```