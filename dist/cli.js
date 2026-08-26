#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from './config/manager.js';
import { PERSONA_PRESETS } from './config/defaults.js';
import { startTUI } from './ui/index.js';
import { getActiveWindowContext } from './collector/window.js';
import { ScreenCollector } from './collector/screen.js';
import { createLLMProvider } from './llm/factory.js';
const program = new Command();
program
    .name('alvo')
    .description('⚡ ALVO - Autonomous Proactive Terminal Companion AI')
    .version('1.0.0');
// Command: alvo start (or default)
program
    .command('start')
    .description('Start the Alvo autonomous companion interactive TUI')
    .option('-p, --preset <name>', 'Use a specific persona preset (friend, mentor, tsundere_partner, casual_coder)')
    .option('-m, --model <model>', 'Override LLM model name')
    .option('--provider <provider>', 'Override provider (ollama, gemini, openai)')
    .action(async (options) => {
    const configManager = ConfigManager.getInstance();
    if (options.preset) {
        if (PERSONA_PRESETS[options.preset]) {
            configManager.applyPreset(options.preset);
        }
        else {
            console.log(chalk.red(`Unknown preset: ${options.preset}`));
            process.exit(1);
        }
    }
    if (options.model || options.provider) {
        configManager.saveConfig({
            ...(options.model ? { model: options.model } : {}),
            ...(options.provider ? { provider: options.provider } : {})
        });
    }
    try {
        await startTUI();
    }
    catch (err) {
        console.error(chalk.red(`Fatal error running Alvo: ${err.message}`));
        process.exit(1);
    }
});
// Command: alvo config
program
    .command('config')
    .description('View or update Alvo configuration')
    .option('--preset <name>', 'Set persona preset')
    .option('--provider <provider>', 'Set LLM provider (ollama, gemini, openai)')
    .option('--model <model>', 'Set model name')
    .option('--interval <seconds>', 'Set scan interval in seconds', parseInt)
    .option('--api-key <key>', 'Set API key for cloud providers')
    .option('--base-url <url>', 'Set custom base URL')
    .option('--global', 'Save configuration globally to ~/.config/alvo/config.json')
    .action((options) => {
    const configManager = ConfigManager.getInstance();
    if (Object.keys(options).length > 0 && !(Object.keys(options).length === 1 && options.global)) {
        const updates = {};
        if (options.preset) {
            if (PERSONA_PRESETS[options.preset]) {
                Object.assign(updates, PERSONA_PRESETS[options.preset], { relationship: options.preset });
            }
            else {
                console.log(chalk.red(`Unknown preset: ${options.preset}`));
                return;
            }
        }
        if (options.provider)
            updates.provider = options.provider;
        if (options.model)
            updates.model = options.model;
        if (options.interval)
            updates.scanIntervalSeconds = options.interval;
        if (options.apiKey)
            updates.apiKey = options.apiKey;
        if (options.baseUrl)
            updates.baseUrl = options.baseUrl;
        const saved = configManager.saveConfig(updates, Boolean(options.global));
        console.log(chalk.green(`\n✔ Configuration updated successfully! (${options.global ? 'Global' : 'Local'})\n`));
        console.log(JSON.stringify(saved, null, 2));
    }
    else {
        console.log(chalk.cyan('\n📋 Current Alvo Configuration:\n'));
        console.log(JSON.stringify(configManager.getConfig(), null, 2));
        console.log(chalk.dim('\nTo modify: alvo config --preset mentor --provider ollama --model llama3.2-vision:latest\n'));
    }
});
// Command: alvo presets
program
    .command('presets')
    .description('List all available persona presets')
    .action(() => {
    console.log(chalk.cyan.bold('\n🎭 Available Persona Presets in ALVO:\n'));
    for (const [key, val] of Object.entries(PERSONA_PRESETS)) {
        console.log(chalk.yellow.bold(`• ${key}`) + chalk.gray(` (Name: ${val.name})`));
        console.log(`  Tone: ${chalk.white(val.tone)}`);
        console.log(`  Language: ${chalk.white(val.language)}`);
        console.log(`  Directives: ${chalk.dim(val.customInstructions)}`);
        console.log();
    }
    console.log(chalk.dim('Activate a preset using: alvo start --preset <name> or alvo config --preset <name>\n'));
});
// Command: alvo doctor
program
    .command('doctor')
    .description('Diagnose system environment, permissions, and LLM connectivity')
    .action(async () => {
    console.log(chalk.cyan.bold('\n🩺 Running ALVO System Doctor...\n'));
    // 1. OS Check
    const isMac = process.platform === 'darwin';
    console.log(`1. OS Platform: ${isMac ? chalk.green('✔ macOS (' + process.arch + ')') : chalk.yellow('⚠ ' + process.platform + ' (Full window tracking is best on macOS)')}`);
    // 2. Active Window Detection Test
    process.stdout.write('2. Active Window Inspector: ');
    try {
        const windowContext = await getActiveWindowContext();
        console.log(chalk.green(`✔ Success! Detected App: "${windowContext.appName}" | Title: "${windowContext.windowTitle}"`));
    }
    catch (e) {
        console.log(chalk.red(`✖ Failed: ${e.message}`));
    }
    // 3. Screen Capture & Diff Hash Test
    process.stdout.write('3. Screen Snapshot & Sharp Processing: ');
    try {
        const screenCollector = new ScreenCollector();
        const screenContext = await screenCollector.captureScreen({ enableVision: true });
        if (screenContext.base64Image) {
            console.log(chalk.green(`✔ Success! Captured & downscaled thumbnail (Diff Hash: ${screenContext.imageHash?.slice(0, 8)}...)`));
        }
        else {
            console.log(chalk.yellow(`⚠ Captured with warning: ${screenContext.summaryText || 'No image'}`));
        }
        screenCollector.cleanup();
    }
    catch (e) {
        console.log(chalk.red(`✖ Screen capture error: ${e.message}`));
    }
    // 4. LLM Provider Connection Test
    const config = ConfigManager.getInstance().getConfig();
    process.stdout.write(`4. LLM Provider (${config.provider} -> ${config.model}): `);
    try {
        const provider = createLLMProvider(config);
        const testResult = await provider.testConnection();
        if (testResult.ok) {
            console.log(chalk.green(`✔ ${testResult.message}`));
        }
        else {
            console.log(chalk.yellow(`⚠ ${testResult.message}`));
        }
    }
    catch (e) {
        console.log(chalk.red(`✖ Connection error: ${e.message}`));
    }
    console.log(chalk.cyan('\nDiagnostic complete! Ready to run `alvo start`.\n'));
});
// Default action when running `alvo` without args
if (process.argv.length === 2) {
    process.argv.push('start');
}
program.parse(process.argv);
