import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, useApp, useInput } from 'ink';
import { Header } from './Header.js';
import { ChatFeed } from './ChatFeed.js';
import { InputBar } from './InputBar.js';
import { ConfigManager } from '../../config/manager.js';
import { PERSONA_PRESETS } from '../../config/defaults.js';
export const App = ({ evaluator, initialConfig }) => {
    const { exit } = useApp();
    const [config, setConfig] = useState(initialConfig);
    const [status, setStatus] = useState(evaluator.getStatus());
    const [statusDetail, setStatusDetail] = useState('Initializing...');
    const [messages, setMessages] = useState([]);
    const [latestSnapshot, setLatestSnapshot] = useState(null);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    // Global keybindings
    useInput((input, key) => {
        if (key.ctrl && input === 'c') {
            evaluator.stop();
            exit();
        }
    });
    useEffect(() => {
        // 1. Subscribe to Evaluator events
        const handleStatusChange = (newStatus, detail) => {
            setStatus(newStatus);
            setStatusDetail(detail);
        };
        const handleProactiveMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };
        const handleSnapshotCaptured = (snapshot) => {
            setLatestSnapshot(snapshot);
        };
        const handleError = (err) => {
            setStatus('error');
            setStatusDetail(err.message);
        };
        evaluator.on('statusChange', handleStatusChange);
        evaluator.on('proactiveMessage', handleProactiveMessage);
        evaluator.on('snapshotCaptured', handleSnapshotCaptured);
        evaluator.on('error', handleError);
        // Generate initial persona-appropriate greeting
        let greetingText = `⚡ ${config.name} is online and observing your desktop. Let's build something awesome!`;
        const relLower = config.relationship.toLowerCase();
        const nameLower = config.name.toLowerCase();
        if (nameLower === 'araa' || relLower.includes('yandere') || relLower.includes('wife') || relLower.includes('mbg')) {
            greetingText = `❤️‍🔥 Araa sudah online dan memantau layar kamu setiap detik, Sayang! Jangan coba-coba lirik tab lain ya, fokus ngoding sama aku! 🔪💍✨`;
        }
        else if (relLower.includes('tsundere')) {
            greetingText = `😤 Hmph! B-bukan berarti aku sengaja nungguin kamu ya, tapi buruan ngoding yang bener! Jangan bikin malu! 💢`;
        }
        else if (relLower.includes('mentor')) {
            greetingText = `🧠 Alvo Sensei is online. Inspecting your workspace. Let's build clean, performant, production-ready code.`;
        }
        else if (relLower.includes('friend')) {
            greetingText = `☕ Yo! Alvo is ready in your terminal. Gas ngoding apa hari ini, bro?`;
        }
        const initialGreeting = {
            id: 'greeting_initial',
            sender: 'alvo',
            text: greetingText,
            timestamp: Date.now(),
            isProactive: false
        };
        setMessages([initialGreeting]);
        // Start background watcher loop
        evaluator.start();
        return () => {
            evaluator.off('statusChange', handleStatusChange);
            evaluator.off('proactiveMessage', handleProactiveMessage);
            evaluator.off('snapshotCaptured', handleSnapshotCaptured);
            evaluator.off('error', handleError);
            evaluator.stop();
        };
    }, [evaluator]);
    const handleUserInput = async (text) => {
        // Handle Slash Commands
        if (text.startsWith('/')) {
            const parts = text.slice(1).trim().split(' ');
            const cmd = parts[0]?.toLowerCase();
            const arg = parts.slice(1).join(' ');
            if (cmd === 'quit' || cmd === 'exit') {
                evaluator.stop();
                exit();
                return;
            }
            if (cmd === 'clear') {
                setMessages([]);
                return;
            }
            if (cmd === 'scan') {
                setMessages(prev => [
                    ...prev,
                    {
                        id: `system_${Date.now()}`,
                        sender: 'system',
                        text: '⚡ Triggering manual scan...',
                        timestamp: Date.now()
                    }
                ]);
                await evaluator.runCycle();
                return;
            }
            if (cmd === 'preset') {
                if (!arg || !PERSONA_PRESETS[arg]) {
                    const available = Object.keys(PERSONA_PRESETS).join(', ');
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `system_${Date.now()}`,
                            sender: 'system',
                            text: `⚠️ Unknown preset '${arg}'. Available presets: ${available}`,
                            timestamp: Date.now()
                        }
                    ]);
                    return;
                }
                try {
                    const updated = ConfigManager.getInstance().applyPreset(arg);
                    setConfig(updated);
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `system_${Date.now()}`,
                            sender: 'system',
                            text: `✅ Switched persona preset to [${arg}]: ${updated.name} - ${updated.tone}`,
                            timestamp: Date.now()
                        }
                    ]);
                }
                catch (e) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `system_${Date.now()}`,
                            sender: 'system',
                            text: `Error updating preset: ${e.message}`,
                            timestamp: Date.now()
                        }
                    ]);
                }
                return;
            }
            if (cmd === 'help') {
                setMessages(prev => [
                    ...prev,
                    {
                        id: `system_${Date.now()}`,
                        sender: 'system',
                        text: `📖 ALVO COMMANDS:
- /scan : Trigger immediate screen & context evaluation
- /preset <friend|mentor|tsundere_partner|casual_coder> : Change personality
- /clear : Clear current chat feed
- /quit : Exit Alvo companion`,
                        timestamp: Date.now()
                    }
                ]);
                return;
            }
        }
        // Interactive Chat with Alvo
        setMessages(prev => [
            ...prev,
            {
                id: `user_${Date.now()}`,
                sender: 'user',
                text,
                timestamp: Date.now()
            }
        ]);
        setIsInputDisabled(true);
        try {
            const reply = await evaluator.handleUserChat(text);
            setMessages(prev => [
                ...prev,
                {
                    id: `alvo_${Date.now()}`,
                    sender: 'alvo',
                    text: reply,
                    timestamp: Date.now()
                }
            ]);
        }
        catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    id: `error_${Date.now()}`,
                    sender: 'system',
                    text: `⚠️ Failed to get reply: ${err.message}`,
                    timestamp: Date.now()
                }
            ]);
        }
        finally {
            setIsInputDisabled(false);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", padding: 1, width: "100%", children: [_jsx(Header, { status: status, statusDetail: statusDetail, config: config, latestSnapshot: latestSnapshot }), _jsx(ChatFeed, { messages: messages, config: config }), _jsx(InputBar, { onSubmit: handleUserInput, disabled: isInputDisabled, name: config.name, isRomantic: config.name.toLowerCase() === 'araa' ||
                    config.relationship.toLowerCase().includes('yandere') ||
                    config.relationship.toLowerCase().includes('girlfriend') ||
                    config.relationship.toLowerCase().includes('wife') })] }));
};
