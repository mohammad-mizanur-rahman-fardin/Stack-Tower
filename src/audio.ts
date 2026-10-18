/**
 * audio.ts — Web Audio API sound effects.
 * All sounds are synthesized — no audio files needed.
 * AudioContext is created on first user gesture (mobile requirement).
 */

import {
  MASTER_VOLUME,
  DROP_SOUND_FREQ,
  PERFECT_CHIME_BASE_FREQ,
  PERFECT_CHIME_FREQ_INCREMENT,
  GAME_OVER_FREQ_START,
  GAME_OVER_FREQ_END,
  VIBRATE_DURATION,
} from './config';
import { getSoundEnabled, setSoundEnabled } from './storage';

export class Audio {
  private ctx: AudioContext | null = null;
  private _enabled: boolean;

  constructor() {
    this._enabled = getSoundEnabled();
  }

  get enabled(): boolean {
    return this._enabled;
  }

  /** Toggle sound on/off */
  toggle(): boolean {
    this._enabled = !this._enabled;
    setSoundEnabled(this._enabled);
    return this._enabled;
  }

  /** Set sound state */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    setSoundEnabled(enabled);
  }

  /** Initialize AudioContext on first user gesture */
  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
    } catch {
      // Web Audio not supported — sounds just won't play
    }
  }

  /** Resume context if suspended (mobile browsers) */
  private async ensureResumed(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignore resume errors
      }
    }
  }

  /** Play a short soft "thud" for normal drop */
  async playDrop(): Promise<void> {
    if (!this._enabled || !this.ctx) return;
    await this.ensureResumed();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Low-frequency sine thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(DROP_SOUND_FREQ, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Short noise burst for impact
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(MASTER_VOLUME * 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  /** Play a bright chime for perfect drop, pitch rises with combo */
  async playPerfect(combo: number): Promise<void> {
    if (!this._enabled || !this.ctx) return;
    await this.ensureResumed();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const freq = PERFECT_CHIME_BASE_FREQ + (combo - 1) * PERFECT_CHIME_FREQ_INCREMENT;

    // Main chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, now);
    gain2.gain.setValueAtTime(MASTER_VOLUME * 0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.3);

    // Third overtone for shimmer
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, now + 0.05);
    gain3.gain.setValueAtTime(MASTER_VOLUME * 0.1, now + 0.05);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc3.connect(gain3).connect(ctx.destination);
    osc3.start(now + 0.05);
    osc3.stop(now + 0.3);

    // Vibration feedback
    this.vibrate();
  }

  /** Play a low descending tone for game over */
  async playGameOver(): Promise<void> {
    if (!this._enabled || !this.ctx) return;
    await this.ensureResumed();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(GAME_OVER_FREQ_START, now);
    osc.frequency.exponentialRampToValueAtTime(GAME_OVER_FREQ_END, now + 0.8);
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.4, now);
    gain.gain.linearRampToValueAtTime(MASTER_VOLUME * 0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }

  /** Short vibration for phones */
  private vibrate(): void {
    if (!this._enabled) return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(VIBRATE_DURATION);
      }
    } catch {
      // Vibration not supported
    }
  }
}
