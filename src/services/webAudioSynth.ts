class WebAudioSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private bpm = 120;
  private currentStep = 0;
  private activeCodeSnippet: string = '';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setBPM(newBpm: number) {
    this.bpm = Math.max(60, Math.min(200, newBpm));
  }

  public startPlayback(codeSnippet: string, bpm: number) {
    this.activeCodeSnippet = codeSnippet;
    this.bpm = bpm;
    this.stopPlayback();

    const ctx = this.getContext();
    this.isPlaying = true;
    this.currentStep = 0;

    const stepDurationMs = (60 / this.bpm / 4) * 1000;

    this.timerId = setInterval(() => {
      if (!this.isPlaying) return;
      this.playStep(ctx, this.currentStep, this.activeCodeSnippet);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepDurationMs);
  }

  public stopPlayback() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private playStep(ctx: AudioContext, step: number, code: string) {
    const now = ctx.currentTime;
    const codeLower = code.toLowerCase();

    // 1. Kick Synth Trigger (Step 0, 4, 8, 12 or bd notation)
    if (codeLower.includes('bd') || codeLower.includes('kick') || step % 4 === 0) {
      this.triggerKick(ctx, now);
    }

    // 2. Snare Synth Trigger (Step 4, 12 or sd notation)
    if (codeLower.includes('sd') || codeLower.includes('snare') || step % 8 === 4) {
      this.triggerSnare(ctx, now);
    }

    // 3. Hi-Hat Synth Trigger (Every 2 steps or hh notation)
    if (codeLower.includes('hh') || codeLower.includes('hihat') || step % 2 === 0) {
      this.triggerHiHat(ctx, now);
    }

    // 4. Bassline Synth Trigger
    if (codeLower.includes('bass') || codeLower.includes('sawtooth') || codeLower.includes('square')) {
      const frequencies = [65.41, 73.42, 82.41, 98.00, 110.00]; // C2, D2, E2, G2, A2
      const freq = frequencies[step % frequencies.length];
      this.triggerBassNote(ctx, now, freq);
    }

    // 5. Arp / Synth Lead Trigger
    if (codeLower.includes('synth') || codeLower.includes('arp') || codeLower.includes('pad')) {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
      const freq = scale[(step * 2) % scale.length];
      this.triggerLeadNote(ctx, now, freq);
    }
  }

  private triggerKick(ctx: AudioContext, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.18);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private triggerSnare(ctx: AudioContext, time: number) {
    // Noise buffer for snare snap
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private triggerHiHat(ctx: AudioContext, time: number) {
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private triggerBassNote(ctx: AudioContext, time: number, freq: number) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  private triggerLeadNote(ctx: AudioContext, time: number, freq: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }
}

export const webAudioSynth = new WebAudioSynthEngine();
