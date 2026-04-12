import { createReverbBuffer } from './createReverb';
import { createNoiseBuffer } from './createNoiseBuffer';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  async initialize(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.ctx.destination);

    // Shared reverb
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = createReverbBuffer(this.ctx, 3, 2.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.3;
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    // Pre-generate noise buffer
    this.noiseBuffer = createNoiseBuffer(this.ctx, 2);
  }

  getContext(): AudioContext {
    if (!this.ctx) throw new Error('AudioEngine not initialized');
    return this.ctx;
  }

  getMasterGain(): GainNode {
    if (!this.masterGain) throw new Error('AudioEngine not initialized');
    return this.masterGain;
  }

  getReverb(): ConvolverNode {
    if (!this.reverbNode) throw new Error('AudioEngine not initialized');
    return this.reverbNode;
  }

  getNoiseBuffer(): AudioBuffer {
    if (!this.noiseBuffer) throw new Error('AudioEngine not initialized');
    return this.noiseBuffer;
  }

  /** Play a short noise burst (for pops, clicks) */
  playNoiseBurst(options: {
    duration?: number;
    filterFreq?: number;
    filterQ?: number;
    gain?: number;
    attack?: number;
    decay?: number;
  } = {}): void {
    const ctx = this.getContext();
    const {
      duration = 0.05,
      filterFreq = 2000,
      filterQ = 1,
      gain = 0.5,
      attack = 0.001,
      decay = 0.02,
    } = options;

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer!;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    const envelope = ctx.createGain();
    const now = ctx.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + attack);
    envelope.gain.setTargetAtTime(0, now + attack, decay);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain!);
    envelope.connect(this.reverbNode!);

    source.start(now);
    source.stop(now + duration + 0.1);
  }

  /** Play a click transient (short sine burst) */
  playClick(frequency = 3000, gain = 0.3): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    osc.type = 'sine';

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(gain, now);
    envelope.gain.setTargetAtTime(0, now, 0.005);

    osc.connect(envelope);
    envelope.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Play a singing bowl tone with harmonics and decay */
  playBowlTone(options: {
    fundamental: number;
    partials?: number[];
    partialGains?: number[];
    decayConstants?: number[];
    gain?: number;
  }): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const {
      fundamental,
      partials = [fundamental * 3, fundamental * 5],
      partialGains = [0.4, 0.15],
      decayConstants = [3.0, 1.5, 0.8],
      gain = 0.35,
    } = options;

    const allFreqs = [fundamental, ...partials];
    const allGains = [gain, ...partialGains.map(g => g * gain)];
    const allDecays = decayConstants;

    allFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sine';
      // Slight pitch drift
      osc.frequency.setTargetAtTime(freq * 0.998, now, 4.0);

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(allGains[i] || 0.1, now);
      envelope.gain.setTargetAtTime(0, now, allDecays[i] || 1.0);

      osc.connect(envelope);
      envelope.connect(this.masterGain!);
      envelope.connect(this.reverbNode!);

      osc.start(now);
      osc.stop(now + 10);
    });
  }

  /** Create a continuous drone oscillator (returns controls to stop it) */
  createDrone(options: {
    frequency: number;
    type?: OscillatorType;
    gain?: number;
    fadeIn?: number;
  }): { stop: (fadeOut?: number) => void } {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const { frequency, type = 'sine', gain = 0.15, fadeIn = 2 } = options;

    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    osc.type = type;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + fadeIn);

    osc.connect(envelope);
    envelope.connect(this.masterGain!);
    envelope.connect(this.reverbNode!);
    osc.start(now);

    return {
      stop: (fadeOut = 2) => {
        const stopTime = ctx.currentTime;
        envelope.gain.cancelScheduledValues(stopTime);
        envelope.gain.setValueAtTime(envelope.gain.value, stopTime);
        envelope.gain.linearRampToValueAtTime(0, stopTime + fadeOut);
        osc.stop(stopTime + fadeOut + 0.1);
      },
    };
  }

  /** Play filtered noise (for rain, ambient textures) */
  playFilteredNoise(options: {
    filterType?: BiquadFilterType;
    frequency?: number;
    Q?: number;
    gain?: number;
    duration?: number;
    fadeIn?: number;
  }): { stop: (fadeOut?: number) => void } {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const {
      filterType = 'bandpass',
      frequency = 500,
      Q = 1,
      gain = 0.1,
      duration = 60,
      fadeIn = 2,
    } = options;

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer!;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = Q;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + fadeIn);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain!);
    envelope.connect(this.reverbNode!);

    source.start(now);
    source.stop(now + duration);

    return {
      stop: (fadeOut = 2) => {
        const stopTime = ctx.currentTime;
        envelope.gain.cancelScheduledValues(stopTime);
        envelope.gain.setValueAtTime(envelope.gain.value, stopTime);
        envelope.gain.linearRampToValueAtTime(0, stopTime + fadeOut);
        try { source.stop(stopTime + fadeOut + 0.1); } catch {}
      },
    };
  }

  /** Play a crinkle sound (for bubble wrap reset) */
  playCrinkle(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer!;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.linearRampToValueAtTime(500, now + 0.3);
    filter.Q.value = 2;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.3, now);
    envelope.gain.setTargetAtTime(0, now + 0.05, 0.08);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain!);

    source.start(now);
    source.stop(now + 0.4);
  }

  setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx!.currentTime, 0.1);
    }
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  dispose(): void {
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.noiseBuffer = null;
  }
}

// Singleton
export const audioEngine = new AudioEngine();
