import { getHamoTrack, getNextHamoTrackIndex } from './musicCatalog';
import { RadioStationId } from './types';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  private radioTimer: number | null = null;
  private radioStation: RadioStationId = 'hamo_morshedy';
  private radioStep = 0;
  private hamoTrackIndex = 0;
  private hamoTrackStepCount = 0;
  private isPlayingPhase = false;
  private musicPaused = false;
  private externalStreamActive = false;
  private onAutoAdvanceTrack: ((nextIdx: number) => void) | null = null;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(mute ? 0 : 0.03, this.ctx.currentTime, 0.1);
    }
    this.refreshRadioPlayback();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playFootstep(isSprint = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pitchJitter = 0.92 + Math.random() * 0.16;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isSprint ? 115 : 92) * pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.06);

    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playPickup(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const jitter = 0.94 + Math.random() * 0.12;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(640 * jitter, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playCashRegister(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [987.77, 1318.51, 1760];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      gain.gain.setValueAtTime(0.09, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.19);
    });
  }

  public playDoor(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(210, now + 0.14);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playCarDoor(closing = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(closing ? 135 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(closing ? 46 : 82, now + 0.11);
    gain.gain.setValueAtTime(closing ? 0.14 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playTurnSignal(highClick = true): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(highClick ? 920 : 680, now);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.026);
  }

  public playWrenchRepair(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [520, 740, 620].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.075);
      gain.gain.setValueAtTime(0.055, now + i * 0.075);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.075 + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.075);
      osc.stop(now + i * 0.075 + 0.065);
    });
  }

  public playCarHorn(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [340, 425].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    });
  }

  public playSizzle(isGolden = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.22);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.65));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isGolden ? 2600 : 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    if (isGolden) {
      const osc = ctx.createOscillator();
      const cg = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now + 0.04);
      osc.frequency.setValueAtTime(1180, now + 0.12);
      cg.gain.setValueAtTime(0.055, now + 0.04);
      cg.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(cg);
      cg.connect(ctx.destination);
      osc.start(now + 0.04);
      osc.stop(now + 0.25);
    }
  }

  public playBump(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(105, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playFineWhistle(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [2450, 2720, 2400].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.05, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.075);
    });
  }

  public playError(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.14);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public setContinuousMusic(params: {
    station: RadioStationId;
    isPlaying: boolean;
    paused: boolean;
    externalStreamActive: boolean;
    trackIndex: number;
    onAutoAdvanceTrack?: (nextIdx: number) => void;
  }): void {
    const stationChanged = this.radioStation !== params.station;
    const trackChanged = this.hamoTrackIndex !== params.trackIndex;
    this.radioStation = params.station;
    this.isPlayingPhase = params.isPlaying;
    this.musicPaused = params.paused;
    this.externalStreamActive = params.externalStreamActive;
    this.hamoTrackIndex = params.trackIndex;
    this.onAutoAdvanceTrack = params.onAutoAdvanceTrack ?? null;
    if (stationChanged || trackChanged) {
      this.hamoTrackStepCount = 0;
    }
    this.refreshRadioPlayback();
  }

  public setCarRadio(station: RadioStationId, _activeInCar: boolean): void {
    this.radioStation = station;
    this.refreshRadioPlayback();
  }

  private refreshRadioPlayback(): void {
    this.stopRadioLoop();
    if (
      this.muted ||
      !this.isPlayingPhase ||
      this.musicPaused ||
      this.externalStreamActive ||
      this.radioStation === 'off'
    ) {
      return;
    }
    this.startRadioLoop(this.radioStation);
  }

  private stopRadioLoop(): void {
    if (this.radioTimer !== null) {
      window.clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  }

  private playMahraganatStep(ctx: AudioContext): void {
    const track = getHamoTrack(this.hamoTrackIndex);
    const now = ctx.currentTime;
    const step = this.radioStep;

    // Lead Oriental Mahraganat synth (Hijaz / Bayati motif)
    const leadFreq = track.motifNotes[step % track.motifNotes.length];
    const leadOsc = ctx.createOscillator();
    const leadFilter = ctx.createBiquadFilter();
    const leadGain = ctx.createGain();
    leadOsc.type = step % 4 === 0 ? 'sawtooth' : 'triangle';
    leadOsc.frequency.setValueAtTime(leadFreq, now);
    leadFilter.type = 'lowpass';
    leadFilter.frequency.setValueAtTime(1650, now);
    leadGain.gain.setValueAtTime(0.024, now);
    leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    leadOsc.connect(leadFilter);
    leadFilter.connect(leadGain);
    leadGain.connect(ctx.destination);
    leadOsc.start(now);
    leadOsc.stop(now + 0.22);

    // 808 Sub-bass + Mahraganat kick on beats 0 and 4
    if (step % 2 === 0) {
      const bassFreq = track.bassNotes[Math.floor(step / 2) % track.bassNotes.length];
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(step % 4 === 0 ? bassFreq : bassFreq * 0.96, now);
      bassOsc.frequency.exponentialRampToValueAtTime(48, now + 0.16);
      bassGain.gain.setValueAtTime(step % 4 === 0 ? 0.042 : 0.025, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.19);
    }

    // Crisp Darbuka / Sagat rim-click on off-beats
    if (step % 2 === 1) {
      const percOsc = ctx.createOscillator();
      const percGain = ctx.createGain();
      percOsc.type = 'square';
      percOsc.frequency.setValueAtTime(step % 4 === 3 ? 1320 : 880, now);
      percOsc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      percGain.gain.setValueAtTime(0.014, now);
      percGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      percOsc.connect(percGain);
      percGain.connect(ctx.destination);
      percOsc.start(now);
      percOsc.stop(now + 0.06);
    }

    this.radioStep++;
    this.hamoTrackStepCount++;
    if (this.hamoTrackStepCount >= 96) {
      this.hamoTrackStepCount = 0;
      const nextIdx = getNextHamoTrackIndex(this.hamoTrackIndex);
      this.hamoTrackIndex = nextIdx;
      this.onAutoAdvanceTrack?.(nextIdx);
    }
  }

  private startRadioLoop(station: RadioStationId): void {
    this.stopRadioLoop();
    if (station === 'off') return;

    if (station === 'hamo_morshedy') {
      const track = getHamoTrack(this.hamoTrackIndex);
      const stepMs = Math.max(190, Math.round((60_000 / track.bpm) / 2));
      this.radioTimer = window.setInterval(() => {
        if (
          this.muted ||
          !this.isPlayingPhase ||
          this.musicPaused ||
          this.externalStreamActive ||
          this.radioStation !== 'hamo_morshedy'
        ) {
          return;
        }
        const ctx = this.ensureContext();
        if (!ctx) return;
        this.playMahraganatStep(ctx);
      }, stepMs);
      return;
    }

    // Hijaz & Bayati inspired gentle Egyptian Maqam motifs
    const patterns: Record<Exclude<RadioStationId, 'off' | 'hamo_morshedy'>, number[]> = {
      shaabi: [293.66, 311.13, 392.0, 349.23, 311.13, 293.66, 349.23, 392.0],
      cairo_fm: [261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 246.94],
      oud: [220.0, 277.18, 293.66, 329.63, 293.66, 277.18, 220.0, 196.0],
    };
    const notes = patterns[station];
    const intervalMs = station === 'shaabi' ? 280 : station === 'oud' ? 420 : 350;
    this.radioTimer = window.setInterval(() => {
      if (
        this.muted ||
        !this.isPlayingPhase ||
        this.musicPaused ||
        this.externalStreamActive ||
        this.radioStation === 'off'
      ) {
        return;
      }
      const ctx = this.ensureContext();
      if (!ctx) return;
      const freq = notes[this.radioStep % notes.length];
      this.radioStep++;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = station === 'oud' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.022, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + intervalMs * 0.00085);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + intervalMs * 0.0009);
    }, intervalMs);
  }

  public setRainAmbience(active: boolean): void {
    if (!active) {
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      }
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.rainSource) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        ch[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1100;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      this.rainSource = src;
      this.rainGain = gain;
    }
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(
        this.muted ? 0 : 0.035,
        ctx.currentTime,
        0.3,
      );
    }
  }

  public dispose(): void {
    this.stopRadioLoop();
    if (this.rainSource) {
      try {
        this.rainSource.stop();
      } catch {
        // ignore
      }
      this.rainSource = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
