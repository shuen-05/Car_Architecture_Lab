/**
 * High-Fidelity BMW M3 G81 Competition S58B30T0 Twin-Turbo 3.0L Inline-6
 * POST-EXHAUST ACOUSTIC SYNTHESIZER & PROCEDURAL STARTER SEQUENCE
 * 
 * Ported from the Engine Simulator Project:
 * - 3 power pulses per revolution (f0 = RPM / 20)
 * - Metallic high-rev rasp (2nd and 3rd harmonics), twin-turbo compressor spool whistle
 * - Multi-stage acoustic muffler cavity and exhaust pipe resonance filters
 * - WaveShaper saturation distortion simulating high exhaust velocity backpressure
 * - Crisp ZF 8HP76 8-speed upshift ignition-cut "fart/burp" shift bark
 * - Atmospheric blow-off valve (BOV) air release hiss on throttle lift-off
 * - Overrun exhaust burble & pops
 * - Procedural starter sequence: solenoid engage click, 520 Hz starter gear whine,
 *   compression thumps, 65 Hz initial combustion catch bark, and cold-start flare settling to idle.
 */

export class S58PostExhaustAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private continuousGain: GainNode | null = null;

  // 1. Sub-Bass Tailpipe Pulse Generator (25 - 120 Hz straight-six low-end thump)
  private oscSub: OscillatorNode | null = null;
  private subFilter: BiquadFilterNode | null = null;
  private subGain: GainNode | null = null;

  // 2. Primary Exhaust Pulse Oscillator (f0 = RPM / 20)
  private oscPrimary: OscillatorNode | null = null;
  private primaryGain: GainNode | null = null;

  // 3. Low-Mid Exhaust Chamber Body (Straight-six metallic growl)
  private oscBody: OscillatorNode | null = null;
  private bodyGain: GainNode | null = null;

  // 4. Cadence LFO (Straight-six 3-pulse cadence modulation)
  private cadenceLFO: OscillatorNode | null = null;
  private cadenceGain: GainNode | null = null;

  // 5. Exhaust Muffler & Acoustic Cavity Filter Chain
  private pipeResonator: BiquadFilterNode | null = null;
  private mufflerChamber: BiquadFilterNode | null = null;
  private tailpipeLowpass1: BiquadFilterNode | null = null;
  private tailpipeLowpass2: BiquadFilterNode | null = null;
  private saturationNode: WaveShaperNode | null = null;

  // 6. Tailpipe Gas Velocity Rush
  private noiseNode: AudioBufferSourceNode | null = null;
  private tailpipeRushFilter: BiquadFilterNode | null = null;
  private tailpipeRushGain: GainNode | null = null;

  // 7. Twin-Turbocharger Spool Whistle
  private turboOsc: OscillatorNode | null = null;
  private turboFilter: BiquadFilterNode | null = null;
  private turboGain: GainNode | null = null;

  // 8. Overrun Pop & Shift Bark (ZF 8HP76 ignition-cut burp)
  private popOsc: OscillatorNode | null = null;
  private popFilter: BiquadFilterNode | null = null;
  private popGain: GainNode | null = null;
  private lastPopTime: number = 0;

  // Atmospheric Blow-Off Valve (BOV) on throttle lift-off
  private bovNoiseNode: AudioBufferSourceNode | null = null;
  private bovFilter: BiquadFilterNode | null = null;
  private bovGain: GainNode | null = null;
  private lastBovTime: number = 0;

  private startupBuffer: AudioBuffer | null = null;
  private currentStarterSource: AudioBufferSourceNode | null = null;
  private isInitialized: boolean = false;
  private isColdStarting: boolean = false;
  private prevThrottle: number = 0;

  constructor() {}

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Continuous engine audio bus gain (for crossfading during startup)
      this.continuousGain = this.ctx.createGain();
      this.continuousGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.continuousGain.connect(this.masterGain);

      const now = this.ctx.currentTime;

      // 1. CADENCE LFO (Straight-six 3-pulse cadence modulation)
      this.cadenceLFO = this.ctx.createOscillator();
      this.cadenceLFO.type = 'sawtooth';
      this.cadenceLFO.frequency.setValueAtTime(12.5, now);
      this.cadenceGain = this.ctx.createGain();
      this.cadenceGain.gain.setValueAtTime(1.8, now);
      this.cadenceLFO.connect(this.cadenceGain);
      this.cadenceLFO.start();

      // 2. SUB-BASS GENERATOR (Deep inline-6 low thump)
      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(18.75, now);

      this.subFilter = this.ctx.createBiquadFilter();
      this.subFilter.type = 'lowpass';
      this.subFilter.frequency.setValueAtTime(110, now);
      this.subFilter.Q.setValueAtTime(2.0, now);

      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(0.65, now);

      this.oscSub.connect(this.subFilter);
      this.subFilter.connect(this.subGain);
      this.subGain.connect(this.continuousGain);
      this.oscSub.start();

      // 3. PRIMARY EXHAUST PULSE OSCILLATOR
      const primaryPulseWave = this.createMuffledExhaustPulseWave();
      this.oscPrimary = this.ctx.createOscillator();
      this.oscPrimary.setPeriodicWave(primaryPulseWave);
      this.oscPrimary.frequency.setValueAtTime(37.5, now); // 750 RPM -> 37.5 Hz
      this.cadenceGain.connect(this.oscPrimary.frequency);

      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0.55, now);
      this.oscPrimary.connect(this.primaryGain);

      // 4. LOW-MID EXHAUST BODY (Metallic straight-six body)
      const bodyWave = this.createThroatyBodyWave();
      this.oscBody = this.ctx.createOscillator();
      this.oscBody.setPeriodicWave(bodyWave);
      this.oscBody.frequency.setValueAtTime(56.25, now);

      this.bodyGain = this.ctx.createGain();
      this.bodyGain.gain.setValueAtTime(0.40, now);
      this.oscBody.connect(this.bodyGain);

      // 5. EXHAUST MUFFLER & ACOUSTIC FILTER CHAIN
      const exhaustMix = this.ctx.createGain();
      exhaustMix.gain.setValueAtTime(1.0, now);
      this.primaryGain.connect(exhaustMix);
      this.bodyGain.connect(exhaustMix);

      this.saturationNode = this.ctx.createWaveShaper();
      this.saturationNode.curve = this.makeExhaustSaturationCurve(10);
      this.saturationNode.oversample = '2x';
      exhaustMix.connect(this.saturationNode);

      this.pipeResonator = this.ctx.createBiquadFilter();
      this.pipeResonator.type = 'peaking';
      this.pipeResonator.frequency.setValueAtTime(135, now);
      this.pipeResonator.Q.setValueAtTime(2.2, now);
      this.pipeResonator.gain.setValueAtTime(6.0, now);

      this.mufflerChamber = this.ctx.createBiquadFilter();
      this.mufflerChamber.type = 'peaking';
      this.mufflerChamber.frequency.setValueAtTime(260, now);
      this.mufflerChamber.Q.setValueAtTime(2.4, now);
      this.mufflerChamber.gain.setValueAtTime(4.5, now);

      this.tailpipeLowpass1 = this.ctx.createBiquadFilter();
      this.tailpipeLowpass1.type = 'lowpass';
      this.tailpipeLowpass1.frequency.setValueAtTime(480, now);
      this.tailpipeLowpass1.Q.setValueAtTime(1.2, now);

      this.tailpipeLowpass2 = this.ctx.createBiquadFilter();
      this.tailpipeLowpass2.type = 'lowpass';
      this.tailpipeLowpass2.frequency.setValueAtTime(680, now);
      this.tailpipeLowpass2.Q.setValueAtTime(1.0, now);

      this.saturationNode.connect(this.pipeResonator);
      this.pipeResonator.connect(this.mufflerChamber);
      this.mufflerChamber.connect(this.tailpipeLowpass1);
      this.tailpipeLowpass1.connect(this.tailpipeLowpass2);
      this.tailpipeLowpass2.connect(this.continuousGain);

      this.oscPrimary.start();
      this.oscBody.start();

      // 6. GAS VELOCITY RUSH NOISE
      this.setupExhaustGasNoise();

      // 7. TWIN-TURBOCHARGER SPOOL WHISTLE
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(1800, now);

      this.turboFilter = this.ctx.createBiquadFilter();
      this.turboFilter.type = 'bandpass';
      this.turboFilter.frequency.setValueAtTime(2200, now);
      this.turboFilter.Q.setValueAtTime(2.2, now);

      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0.0, now);

      this.turboOsc.connect(this.turboFilter);
      this.turboFilter.connect(this.turboGain);
      this.turboGain.connect(this.continuousGain);
      this.turboOsc.start();

      // 8. OVERRUN POP & SHIFT BARK (ZF 8-speed ignition cut)
      this.popOsc = this.ctx.createOscillator();
      this.popOsc.type = 'triangle';
      this.popOsc.frequency.setValueAtTime(140, now);

      this.popFilter = this.ctx.createBiquadFilter();
      this.popFilter.type = 'bandpass';
      this.popFilter.frequency.setValueAtTime(140, now);
      this.popFilter.Q.setValueAtTime(2.5, now);

      this.popGain = this.ctx.createGain();
      this.popGain.gain.setValueAtTime(0.0, now);

      this.popOsc.connect(this.popFilter);
      this.popFilter.connect(this.popGain);
      this.popGain.connect(this.continuousGain);
      this.popOsc.start();

      // 9. ATMOSPHERIC BLOW-OFF VALVE (BOV) NOISE
      this.setupBovNoise();

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API not allowed or supported:', err);
    }
  }

  private createMuffledExhaustPulseWave(): PeriodicWave {
    const n = 16;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    imag[1] = 1.0;
    imag[2] = 0.55;
    imag[3] = 0.28;
    imag[4] = 0.12;
    imag[5] = 0.04;
    return this.ctx!.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  private createThroatyBodyWave(): PeriodicWave {
    const n = 12;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    imag[1] = 0.40;
    imag[2] = 0.75;
    imag[3] = 0.35;
    imag[4] = 0.10;
    return this.ctx!.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  private makeExhaustSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = amount;
    const n = 256;
    const buffer = new ArrayBuffer(n * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((2.0 + k) * x * 15 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private setupExhaustGasNoise() {
    if (!this.ctx || !this.continuousGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.tailpipeRushFilter = this.ctx.createBiquadFilter();
    this.tailpipeRushFilter.type = 'bandpass';
    this.tailpipeRushFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
    this.tailpipeRushFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.tailpipeRushGain = this.ctx.createGain();
    this.tailpipeRushGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.noiseNode.connect(this.tailpipeRushFilter);
    this.tailpipeRushFilter.connect(this.tailpipeRushGain);
    this.tailpipeRushGain.connect(this.continuousGain);
    this.noiseNode.start();
  }

  private setupBovNoise() {
    if (!this.ctx || !this.continuousGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.bovNoiseNode = this.ctx.createBufferSource();
    this.bovNoiseNode.buffer = buffer;
    this.bovNoiseNode.loop = true;

    this.bovFilter = this.ctx.createBiquadFilter();
    this.bovFilter.type = 'bandpass';
    this.bovFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.bovFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.bovGain = this.ctx.createGain();
    this.bovGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.bovNoiseNode.connect(this.bovFilter);
    this.bovFilter.connect(this.bovGain);
    this.bovGain.connect(this.continuousGain);
    this.bovNoiseNode.start();
  }

  /**
   * Trigger Blow-off Valve (BOV) release hiss on throttle lift
   */
  public triggerBlowOffValve() {
    if (!this.ctx || !this.bovGain || !this.bovFilter || this.isMuted) return;
    const t = this.ctx.currentTime;
    if (t - this.lastBovTime < 0.4) return;
    this.lastBovTime = t;

    // Atmospheric BOV "psssshh-ch-ch" softened and smoothed
    this.bovFilter.frequency.setValueAtTime(1600, t);
    this.bovFilter.frequency.exponentialRampToValueAtTime(650, t + 0.35);

    this.bovGain.gain.cancelScheduledValues(t);
    this.bovGain.gain.setValueAtTime(0.12, t);
    this.bovGain.gain.exponentialRampToValueAtTime(0.002, t + 0.36);
  }

  /**
   * Trigger ZF 8HP76 gearshift exhaust bark / burp / pop (ignition-cut fart)
   */
  public triggerShiftBark() {
    if (!this.ctx || !this.popGain || !this.popOsc || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Crisp ZF 8-speed / DSG upshift ignition-cut "fart/burp"
    this.popOsc.frequency.setValueAtTime(140, t);
    this.popGain.gain.cancelScheduledValues(t);
    this.popGain.gain.setValueAtTime(0.65, t);
    this.popGain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);
  }

  /**
   * Main audio loop updater called on every physics/render frame
   */
  public update(
    isRunning: boolean,
    rpm: number,
    throttle: number, // 0 to 1 or 0 to 100
    isStarting: boolean = false
  ) {
    if (!this.isInitialized) return;

    if (this.ctx && this.ctx.state === 'suspended' && (isRunning || isStarting || this.isColdStarting)) {
      this.ctx.resume();
    }

    const t = this.ctx?.currentTime || 0;

    if ((!isRunning && !isStarting && !this.isColdStarting) || this.isMuted) {
      this.masterGain?.gain.setTargetAtTime(0.0, t, 0.05);
      return;
    }

    const idleRpm = 750;
    const redlineRpm = 7200;
    const clampedRpm = Math.max(idleRpm * 0.6, Math.min(redlineRpm + 200, rpm));
    // Normalize throttle whether passed as 0..1 or 0..100
    const throttleNorm = throttle > 1 ? Math.max(0, Math.min(1, throttle / 100)) : Math.max(0, Math.min(1, throttle));
    const rpmNorm = Math.max(0, Math.min(1, (clampedRpm - idleRpm) / (redlineRpm - idleRpm)));

    // Detect sudden throttle lift for Blow-Off Valve (BOV) on Twin-Turbo S58
    if (this.prevThrottle > 0.35 && throttleNorm < 0.15 && clampedRpm > 2500) {
      this.triggerBlowOffValve();
    }

    // 1. BMW S58 Straight-6: 3 pulses per rev -> f0 = RPM / 20
    const f0 = clampedRpm / 20; // 37.5 Hz at 750 RPM to 360 Hz at 7200 RPM
    const fBody = f0 * 1.5;

    this.oscSub?.frequency.setTargetAtTime(f0 * 0.5, t, 0.02);
    this.oscPrimary?.frequency.setTargetAtTime(f0, t, 0.02);
    this.oscBody?.frequency.setTargetAtTime(fBody, t, 0.02);
    this.cadenceLFO?.frequency.setTargetAtTime(f0 / 3, t, 0.03);

    // S58 higher metallic exhaust cutoff: 480 Hz - 1,280 Hz
    const targetCutoff1 = 480 + throttleNorm * 460 + rpmNorm * 280;
    const targetCutoff2 = 680 + throttleNorm * 500 + rpmNorm * 320;
    this.tailpipeLowpass1?.frequency.setTargetAtTime(targetCutoff1, t, 0.03);
    this.tailpipeLowpass2?.frequency.setTargetAtTime(targetCutoff2, t, 0.03);

    // Twin-Turbocharger spool whistle (subtle turbine spool seated behind exhaust note)
    const turboSpoolFreq = 1800 + rpmNorm * 1600;
    const boostFactor = Math.pow(throttleNorm, 1.3) * (0.15 + 0.85 * rpmNorm);
    const turboVol = boostFactor * 0.015;
    this.turboOsc?.frequency.setTargetAtTime(turboSpoolFreq, t, 0.04);
    this.turboFilter?.frequency.setTargetAtTime(turboSpoolFreq, t, 0.04);
    this.turboGain?.gain.setTargetAtTime(turboVol, t, 0.03);

    // 2. GAIN BALANCING
    const subGainVal = 0.56 * (1.0 - rpmNorm * 0.3) + throttleNorm * 0.18;
    this.subGain?.gain.setTargetAtTime(subGainVal, t, 0.02);

    const primGainVal = 0.45 + throttleNorm * 0.35 + rpmNorm * 0.15;
    this.primaryGain?.gain.setTargetAtTime(primGainVal, t, 0.02);

    const bodyGainVal = 0.30 + throttleNorm * 0.32;
    this.bodyGain?.gain.setTargetAtTime(bodyGainVal, t, 0.02);

    // Gas rush noise through tailpipe
    const rushFreq = 340 + rpmNorm * 180;
    const rushVol = 0.010 + throttleNorm * 0.045 * (0.4 + 0.6 * rpmNorm);
    this.tailpipeRushFilter?.frequency.setTargetAtTime(rushFreq, t, 0.03);
    this.tailpipeRushGain?.gain.setTargetAtTime(rushVol, t, 0.03);

    // 3. OVERRUN POP & BURBLE (Throttle Lift-off)
    if (this.prevThrottle > 0.50 && throttleNorm < 0.20 && clampedRpm > 2800) {
      if (t - this.lastPopTime > 0.18) {
        this.lastPopTime = t;
        const popPitch = 85 + Math.random() * 45;
        this.popOsc?.frequency.setValueAtTime(popPitch, t);
        this.popGain?.gain.cancelScheduledValues(t);
        this.popGain?.gain.setValueAtTime(0.48, t);
        this.popGain?.gain.exponentialRampToValueAtTime(0.005, t + 0.14);
      }
    }

    // 4. MASTER VOLUME & REDLINE IGNITION CUT
    let masterVol = 0.48 + throttleNorm * 0.38 + rpmNorm * 0.20 + (this.isColdStarting ? 0.35 : 0);

    // Hard rev limiter pulse
    if (clampedRpm >= redlineRpm - 20) {
      const limiterPulse = Math.sin(t * 32 * Math.PI) > 0.1 ? 1.0 : 0.08;
      masterVol *= limiterPulse;
    }

    this.masterGain?.gain.setTargetAtTime(masterVol, t, 0.02);
    this.prevThrottle = throttleNorm;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public unmute() {
    this.isMuted = false;
  }

  /**
   * Procedural startup buffer generator for BMW S58 Inline-6
   */
  private getStartupBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.startupBuffer) return this.startupBuffer;

    const sampleRate = this.ctx.sampleRate;
    const duration = 2.5;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    const dtSample = 1 / sampleRate;

    const flareRpm = 2100;
    const idleRpm = 750;
    const starterCadenceHz = 20;

    let phaseF0 = 0;
    let phaseBank = 0;
    let phaseCam = 0;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Phase 1: Mechanical Starter Turnover (0.00s - 0.28s)
      if (t < 0.28) {
        let solenoid = 0;
        if (t >= 0.010 && t < 0.035) {
          const dt = t - 0.010;
          solenoid = Math.sin(2 * Math.PI * 850 * dt) * Math.exp(-dt * 220) * 0.35;
        }

        const gearPitch = 520; // 520 Hz BMW I6 starter gear whine
        const gearWhine = Math.sin(2 * Math.PI * gearPitch * t) * 0.06 * Math.min(1.0, t / 0.08);

        let comp1 = 0;
        const dt1 = Math.abs(t - 0.075);
        if (dt1 < 0.045) {
          const env = Math.exp(-dt1 * 65);
          comp1 = Math.sin(2 * Math.PI * (starterCadenceHz * 4) * t) * 0.38 * env;
        }

        let comp2 = 0;
        const dt2 = Math.abs(t - 0.195);
        if (dt2 < 0.045) {
          const env = Math.exp(-dt2 * 65);
          comp2 = Math.sin(2 * Math.PI * (starterCadenceHz * 4.5) * t) * 0.42 * env;
        }

        sample = solenoid + gearWhine + comp1 + comp2;
      }
      // Phase 2: Combustion Roar & Flare Settling (0.28s - 2.50s)
      else {
        const tIgn = t - 0.28;
        let currentRpm: number;
        if (tIgn < 0.30) {
          const p = tIgn / 0.30;
          currentRpm = 350 + (flareRpm - 350) * Math.sin(p * (Math.PI / 2));
        } else {
          const p = Math.min(1.0, (tIgn - 0.30) / 1.70);
          currentRpm = idleRpm + (flareRpm - idleRpm) * Math.pow(1.0 - p, 2.4);
        }

        const pulsesPerRev = 3; // Straight-6 (3 pulses per rev)
        const f0 = (currentRpm * pulsesPerRev) / 60;
        const fBank = currentRpm / 30;
        const fCam = currentRpm / 60;

        phaseF0 += 2 * Math.PI * f0 * dtSample;
        phaseBank += 2 * Math.PI * fBank * dtSample;
        phaseCam += 2 * Math.PI * fCam * dtSample;

        const valveOpenness = tIgn < 0.75 ? 1.0 : Math.max(0.15, 1.0 - (tIgn - 0.75) / 1.1);

        let initialBark = 0;
        if (tIgn < 0.40) {
          const barkEnv = Math.exp(-tIgn * 8.0);
          const barkFreq = 65; // 65 Hz initial combustion catch bark
          initialBark = Math.sin(2 * Math.PI * barkFreq * tIgn) * barkEnv * 1.4;
        }

        const hSub = 0.65 * Math.sin(phaseBank);
        const hPrim = 0.75 * Math.sin(phaseF0);
        const hGrowl = (0.35 + 0.25 * valveOpenness) * Math.sin(phaseBank * 3);

        const cadenceMod = 1.0 + 0.20 * Math.sin(phaseCam);
        const rawExhaust = (initialBark + (hSub + hPrim + hGrowl) * cadenceMod) * (0.60 + 0.40 * valveOpenness);
        sample = Math.tanh(rawExhaust * 1.10) * 0.88;

        if (t > 2.20) {
          const fade = Math.max(0, (2.50 - t) / 0.30);
          sample *= fade;
        }
      }

      data[i] = sample;
    }

    this.startupBuffer = buffer;
    return buffer;
  }

  public playStarterSequence(onIgnitionCatch?: () => void) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.isMuted = false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    this.isColdStarting = true;
    this.masterGain.gain.cancelScheduledValues(t);
    this.masterGain.gain.setValueAtTime(0.95, t);

    if (this.continuousGain) {
      this.continuousGain.gain.cancelScheduledValues(t);
      this.continuousGain.gain.setValueAtTime(0.0, t);
      this.continuousGain.gain.setValueAtTime(0.0, t + 1.6);
      this.continuousGain.gain.linearRampToValueAtTime(1.0, t + 2.2);
    }

    if (this.currentStarterSource) {
      try {
        this.currentStarterSource.stop();
        this.currentStarterSource.disconnect();
      } catch (_) {}
      this.currentStarterSource = null;
    }

    const buf = this.getStartupBuffer();
    if (!buf) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buf;

    const startGain = this.ctx.createGain();
    startGain.gain.setValueAtTime(1.0, t);

    source.connect(startGain);
    startGain.connect(this.masterGain);

    source.start(t);
    this.currentStarterSource = source;

    setTimeout(() => {
      if (onIgnitionCatch) {
        onIgnitionCatch();
      }
    }, 280);

    setTimeout(() => {
      this.isColdStarting = false;
      this.currentStarterSource = null;
    }, 2400);
  }

  public stop() {
    if (this.currentStarterSource) {
      try {
        this.currentStarterSource.stop();
        this.currentStarterSource.disconnect();
        this.currentStarterSource = null;
      } catch (_) {}
    }
    this.isColdStarting = false;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.05);
    }
  }

  public playStarterSound() {
    this.playStarterSequence();
  }
}

export const engineAudio = new S58PostExhaustAudio();
