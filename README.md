# 🎹 Strudel Modular Loop Studio

An AI-powered live-coding music studio web application that uses **Groq LLMs** to generate, manage, and orchestrate modular, short-form musical patterns (micro-loops and pattern snippets) using **Strudel** live-coding syntax.

---

## 🌟 Key Features

1. **Modular Short-Pattern Snippet Library**:
   - Instead of a monolithic track, manage independent, reusable `.strudel` snippet files categorized by function:
     - `drums/kick_basic.strudel`, `drums/hihat_trap.strudel`
     - `bass/sub_funky.strudel`
     - `synth/arp_dreamy.strudel`
     - `pads/ambient_chord.strudel`
2. **Global Concept to Modular Batch Generation**:
   - Type a global music concept (e.g., *"Cyber-funk with punchy short drum loops and bouncy basslines"*).
   - Groq LLMs (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) generate a batch of short, independent pattern snippets across categories + `main.strudel`.
3. **Web Audio Sound Synthesis Engine (`webAudioSynth.ts`)**:
   - In-browser Web Audio API synthesizer synthesizing kick, snare, hi-hat, bass synth, and lead arp notes live in real time when Play is pressed!
4. **Master Arrangement Sequencer (`MasterSequencer.tsx`)**:
   - Displays live stacked active layers and the master composition code (`main.strudel`) using Strudel `stack(...)` combinators.
5. **Targeted Iterative AI Modification (`TargetedCommandBar.tsx`)**:
   - Request targeted changes to specific micro-loops (e.g., *"Make the hi-hat snippet more complex"*). AI updates *only* that target snippet file without breaking the rest of the arrangement.
6. **Modern Minimalist Studio Workspace**:
   - Studio dark design language (`#09090b` background, `#121215` cards, `#27272a` hairline borders, `#fafafa` text, `#3f3f46` accents).

---

## 📁 Directory Layout & File Structure

```text
Alvo/
├── .env.example
├── .env                            # Auto-populated 13-Key Load-Balanced Groq Pool
├── src/
│   ├── types/
│   │   └── music.ts                # PatternSnippet, MasterArrangement & Studio Types
│   ├── services/
│   │   ├── groqClient.ts           # Groq Multi-Snippet Batch & Targeted Edit Client
│   │   ├── strudelEngine.ts        # Modular Strudel Stack Combinator & Playback Logic
│   │   └── webAudioSynth.ts        # Live Web Audio API Synthesizer Engine
│   ├── components/
│   │   ├── StudioHeader.tsx        # Studio Header with Master Transport & BPM
│   │   ├── ConceptGenerator.tsx    # Prompt Input for Multi-Snippet Generation
│   │   ├── SnippetGrid.tsx         # Lego-like Modular Snippet Library & Inspector
│   │   ├── MasterSequencer.tsx     # Master Stack Arrangement View
│   │   └── TargetedCommandBar.tsx  # Command Box for Targeted AI Snippet Edits
│   ├── App.tsx                     # Main Studio Workspace Application
│   └── index.css                   # Studio Workspace CSS tokens
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