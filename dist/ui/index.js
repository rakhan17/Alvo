import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import { App } from './components/App.js';
import { EvaluatorLoop } from '../evaluator/loop.js';
import { ContextCollector } from '../collector/index.js';
import { createLLMProvider } from '../llm/factory.js';
import { ConfigManager } from '../config/manager.js';
export function startTUI() {
    const config = ConfigManager.getInstance().getConfig();
    const collector = new ContextCollector();
    const provider = createLLMProvider(config);
    const evaluator = new EvaluatorLoop(collector, provider, config);
    // Clear screen for clean immersive TUI experience
    console.clear();
    const { waitUntilExit } = render(_jsx(App, { evaluator: evaluator, initialConfig: config }), {
        exitOnCtrlC: false // handled inside App
    });
    return waitUntilExit();
}
