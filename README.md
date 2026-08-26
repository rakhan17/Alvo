# ⚡ ALVO - Autonomous Proactive Terminal Companion AI

> An intelligent, autonomous CLI AI companion that lives inside your terminal, observes your desktop context in real-time, and proactively offers advice, mentoring, wit, or encouragement.

---

## 🌟 Key Features

1. **Autonomous Proactive Evaluator Loop**:
   - Runs in the background at configurable intervals (default: 20s).
   - Monitors active macOS applications and window titles via `osascript`.
   - Captures screen snapshots and downscales them with perceptual diff hashing to prevent unnecessary CPU/token consumption.
   - Decides autonomously when a situation warrants a remark (e.g. noticing build errors, long debugging sessions, interesting tools, or slacking off).

2. **Interactive React-Based Terminal UI (`ink`)**:
   - **Live Status Header**: Real-time indicators (`WATCHING`, `THINKING`, `SPEAKING`, `IDLE`).
   - **Main Chat Stream**: Highlights proactive remarks with timestamps and contextual previews.
   - **Non-blocking Interactive Input Bar**: Chat with Alvo at any time while the background observer continues watching.

3. **Modular LLM Providers**:
   - **Local Ollama** (Default: `llama3.2:3b`, `llama3.2-vision:latest`, `qwen2.5-coder`, `mistral`, etc.).
   - **Gemini API** (`gemini-1.5-flash`, `gemini-2.0-flash`).
   - **OpenAI-Compatible API** (OpenAI, Groq, DeepSeek, LocalAI, LM Studio).

4. **Rich Persona Presets**:
   - `friend`: Chill, witty, supportive dev buddy (Indonesian / English mix).
   - `mentor`: Principal Engineer / Tech Lead giving architectural guidance.
   - `tsundere_partner`: Feisty, teasing, secretly caring partner.
   - `casual_coder`: Minimalist, quiet, only alerts on critical terminal errors.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **macOS** (for active window and screen snapshot inspection)
- **Ollama** installed locally (`ollama run llama3.2:3b` or `ollama run llama3.2-vision:latest`)

### 2. Installation & Build

```bash
cd /Applications/Mind/Alvo
npm install
npm run build
```

### 3. Verify Your System (`doctor`)

```bash
npm run doctor
# or
node dist/cli.js doctor
```

Output:
```
🩺 Running ALVO System Doctor...

1. OS Platform: ✔ macOS (arm64)
2. Active Window Inspector: ✔ Success! Detected App: "Code" | Title: "Alvo — App.tsx"
3. Screen Snapshot & Sharp Processing: ✔ Success! Captured & downscaled thumbnail
4. LLM Provider (ollama -> llama3.2:3b): ✔ Connected to Ollama successfully!
```

### 4. Start Alvo

```bash
npm run start
# or with a specific preset:
node dist/cli.js start --preset mentor
```

---

## ⌨️ Interactive TUI Commands

Inside the Alvo terminal session, you can type anytime or run slash commands:

- `/scan` : Trigger an immediate screen & context evaluation cycle.
- `/preset <name>` : Switch persona in real-time (`friend`, `mentor`, `tsundere_partner`, `casual_coder`).
- `/clear` : Clear the chat feed history.
- `/help` : Display help menu.
- `/quit` (or `Ctrl+C`) : Exit cleanly.

---

## ⚙️ Configuration

### View & Update Config

```bash
# View current config
node dist/cli.js config

# Switch persona preset
node dist/cli.js config --preset tsundere_partner

# Switch model or provider
node dist/cli.js config --provider ollama --model llama3.2:3b --interval 15

# Use Gemini API
node dist/cli.js config --provider gemini --model gemini-1.5-flash --api-key YOUR_GEMINI_API_KEY
```

### List Persona Presets

```bash
node dist/cli.js presets
```

---

## 📁 Architecture Overview

```
src/
├── types/          # Universal data types & interfaces
├── config/         # Zod schemas, defaults, and ConfigManager
├── collector/      # macOS active window inspector & screen capturer
│   ├── window.ts   # osascript active app and title detector
│   ├── screen.ts   # screencapture + sharp downsampling & diff hash
│   └── index.ts    # Composite snapshot orchestrator
├── llm/            # Modular LLM Provider engine
│   ├── ollama.ts   # Local Ollama client (JSON mode & vision)
│   ├── gemini.ts   # Google GenAI REST client
│   ├── openai.ts   # OpenAI-compatible API client
│   └── factory.ts  # Provider factory
├── evaluator/      # Proactive loop & prompt engine
│   ├── prompts.ts  # System & user prompt builders
│   └── loop.ts     # Anti-spam cooldown & event emitter loop
├── ui/             # Interactive React Ink Terminal UI
│   ├── components/
│   │   ├── Header.tsx    # Live state badge & active window indicator
│   │   ├── ChatFeed.tsx  # Formatted proactive remarks & conversation
│   │   └── InputBar.tsx  # Non-blocking async input
│   ├── App.tsx           # Ink root component
│   └── index.tsx         # Terminal renderer lifecycle
└── cli.ts          # Commander CLI entrypoint (start, config, doctor, presets)
```

---

## 🛡️ License
MIT License