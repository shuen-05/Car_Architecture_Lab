import { useState, useEffect, useRef, useCallback } from 'react';
import { PowertrainState, GearMode, MXDriveMode, DrivelogicMode } from '../types/powertrain';
import {
  ZF_8HP76_GEAR_RATIOS,
  FINAL_DRIVE_RATIO,
  TIRE_CIRCUMFERENCE_METERS,
  TIRE_RADIUS_METERS,
  ENGINE_IDLE_RPM,
  ENGINE_REDLINE_RPM,
  calculateEngineTorque,
  calculateEnginePowerHp,
  calculateTurboBoost,
  calculateMXDriveDynamics,
  calculateDifferentialWheelSpeeds,
  calculateAutomaticShiftSchedule,
} from '../utils/math';
import { engineAudio } from '../services/audioSynthesizer';

const STARTER_RPM = 310;
const STARTER_CADENCE_HZ = 20;
const COLD_START_ROAR_RPM = 2100;

export function usePowertrainSimulation() {
  const [state, setState] = useState<PowertrainState>({
    isEngineRunning: false,
    isStarting: false,
    throttle: 0,
    brake: 0,
    steeringAngle: 0,
    gearMode: 'P',
    currentGear: 0,
    drivelogicMode: 'D2',
    mXDriveMode: '4wd',
    engineRpm: 0,
    targetRpm: 0,
    boostPressureBar: 0,
    boostPressurePsi: 0,
    turbo1BoostBar: 0,
    turbo2BoostBar: 0,
    wastegateDutyPercent: 0,
    torqueConverterLockup: 'Unlocked',
    engineTorqueNm: 0,
    enginePowerHp: 0,
    transmissionInputRpm: 0,
    transmissionOutputRpm: 0,
    propShaftRpm: 0,
    frontPropShaftRpm: 0,
    frontTorqueSplitPercent: 40,
    activeMDiffLockPercent: 0,
    differentialRatio: FINAL_DRIVE_RATIO,
    leftWheelRpm: 0,
    rightWheelRpm: 0,
    frontLeftWheelRpm: 0,
    frontRightWheelRpm: 0,
    vehicleSpeedKmh: 0,
    fuelFlowRateLph: 0,
    coolantTempC: 85,
    oilTempC: 80,
    crankshaftAngleRad: 0,
    turboShaftSpeedRpm: 0,
    soundEnabled: true,
  });

  // Keep internal mutable state for 60fps physics integration loop
  const stateRef = useRef(state);
  stateRef.current = state;

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timeSinceLastShiftRef = useRef<number>(1.0);
  const isStartingRef = useRef<boolean>(false);
  const startStartTimeRef = useRef<number>(0);

  // Keyboard keys pressed tracking for smooth drive-by-wire ramps
  const keysPressedRef = useRef<{
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
    space: boolean;
  }>({ w: false, s: false, a: false, d: false, space: false });

  // Input actions
  const setThrottle = useCallback((val: number) => {
    setState((prev) => ({ ...prev, throttle: Math.max(0, Math.min(1, val)) }));
  }, []);

  const setBrake = useCallback((val: number) => {
    setState((prev) => ({ ...prev, brake: Math.max(0, Math.min(1, val)) }));
  }, []);

  const setSteeringAngle = useCallback((angle: number) => {
    setState((prev) => ({ ...prev, steeringAngle: Math.max(-35, Math.min(35, angle)) }));
  }, []);

  const toggleEngine = useCallback(() => {
    if (isStartingRef.current) return;

    if (!stateRef.current.isEngineRunning) {
      // Start the engine with authentic starter sequence
      isStartingRef.current = true;
      startStartTimeRef.current = performance.now();
      setState((prev) => ({ ...prev, isStarting: true }));
      engineAudio.unmute();
      engineAudio.playStarterSequence(() => {
        // Ignition catches at 0.28s
        setState((prev) => ({ ...prev, isEngineRunning: true }));
      });
    } else {
      // Stop the engine
      isStartingRef.current = false;
      engineAudio.stop();
      setState((prev) => ({
        ...prev,
        isEngineRunning: false,
        isStarting: false,
      }));
    }
  }, []);

  const setGearMode = useCallback((mode: GearMode) => {
    setState((prev) => {
      let gear = prev.currentGear;
      if (mode === 'P' || mode === 'N') gear = 0;
      else if (mode === 'R') gear = -1;
      else if (mode === 'D' || mode === 'M') gear = prev.currentGear > 0 ? prev.currentGear : 1;
      if (gear !== prev.currentGear && prev.isEngineRunning) {
        engineAudio.triggerShiftBark();
      }
      timeSinceLastShiftRef.current = 0;
      return { ...prev, gearMode: mode, currentGear: gear };
    });
  }, []);

  const setMXDriveMode = useCallback((mode: MXDriveMode) => {
    setState((prev) => ({ ...prev, mXDriveMode: mode }));
  }, []);

  const setDrivelogicMode = useCallback((mode: DrivelogicMode) => {
    setState((prev) => ({ ...prev, drivelogicMode: mode }));
  }, []);

  const shiftUp = useCallback(() => {
    setState((prev) => {
      if (prev.gearMode === 'M' && prev.currentGear < 8 && prev.currentGear >= 1) {
        timeSinceLastShiftRef.current = 0;
        if (prev.isEngineRunning) {
          engineAudio.triggerShiftBark();
        }
        return { ...prev, currentGear: prev.currentGear + 1 };
      }
      return prev;
    });
  }, []);

  const shiftDown = useCallback(() => {
    setState((prev) => {
      if (prev.gearMode === 'M' && prev.currentGear > 1) {
        timeSinceLastShiftRef.current = 0;
        if (prev.isEngineRunning) {
          engineAudio.triggerShiftBark();
        }
        return { ...prev, currentGear: prev.currentGear - 1 };
      }
      return prev;
    });
  }, []);

  const toggleSound = useCallback(() => {
    const active = engineAudio.toggleMute();
    setState((prev) => ({ ...prev, soundEnabled: active }));
  }, []);

  // Keyboard controls listener (W/S/A/D/Arrows/Space/Q/E/M/X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'w' || e.key === 'ArrowUp') {
        keysPressedRef.current.w = true;
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        keysPressedRef.current.s = true;
      } else if (e.code === 'Space') {
        keysPressedRef.current.space = true;
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        keysPressedRef.current.a = true;
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        keysPressedRef.current.d = true;
      } else if (e.key === 'e') {
        shiftUp();
      } else if (e.key === 'q') {
        shiftDown();
      } else if (e.key.toLowerCase() === 'x') {
        // Cycle M xDrive mode
        const modes: MXDriveMode[] = ['4wd', '4wd_sport', '2wd'];
        const nextIdx = (modes.indexOf(stateRef.current.mXDriveMode) + 1) % modes.length;
        setMXDriveMode(modes[nextIdx]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'w' || e.key === 'ArrowUp') {
        keysPressedRef.current.w = false;
        setThrottle(0);
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        keysPressedRef.current.s = false;
        setBrake(0);
      } else if (e.code === 'Space') {
        keysPressedRef.current.space = false;
        setBrake(0);
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        keysPressedRef.current.a = false;
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        keysPressedRef.current.d = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setThrottle, setBrake, shiftUp, shiftDown, setMXDriveMode]);

  // Main high-frequency Physics / Kinematics Loop
  useEffect(() => {
    const updatePhysics = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      const current = stateRef.current;

      // 1. Procedural Engine Starting Sequence (Cranking -> Ignition Catch -> Cold Start Flare -> Idle)
      if (isStartingRef.current) {
        const elapsed = (now - startStartTimeRef.current) / 1000;
        if (elapsed < 0.28) {
          // Phase 1: Mechanical Starter Turnover (0.00s - 0.28s)
          const crankWobble = Math.sin(now * 0.001 * STARTER_CADENCE_HZ * Math.PI * 2) * 25;
          const crankingRpm = STARTER_RPM + crankWobble;
          const crankAngleAdvance = (crankingRpm / 60) * (2 * Math.PI) * dt;
          const nextCrankAngle = (current.crankshaftAngleRad + crankAngleAdvance) % (4 * Math.PI);

          engineAudio.update(false, crankingRpm, 0, true);

          setState((prev) => ({
            ...prev,
            engineRpm: crankingRpm,
            targetRpm: crankingRpm,
            isStarting: true,
            isEngineRunning: false,
            crankshaftAngleRad: nextCrankAngle,
            boostPressureBar: 0,
            boostPressurePsi: 0,
            turbo1BoostBar: 0,
            turbo2BoostBar: 0,
            engineTorqueNm: 0,
            enginePowerHp: 0,
            vehicleSpeedKmh: 0,
            fuelFlowRateLph: 0.2,
          }));
        } else if (elapsed < 2.28) {
          // Phase 2: Combustion Catch & Cold-Start Flare Roar (0.28s - 2.28s)
          const tIgn = elapsed - 0.28;
          let flareRpm: number;
          if (tIgn < 0.30) {
            const p = tIgn / 0.30;
            flareRpm = 350 + (COLD_START_ROAR_RPM - 350) * Math.sin(p * (Math.PI / 2));
          } else {
            const p = Math.min(1.0, (tIgn - 0.30) / 1.70);
            flareRpm = ENGINE_IDLE_RPM + (COLD_START_ROAR_RPM - ENGINE_IDLE_RPM) * Math.pow(1.0 - p, 2.4);
          }

          const crankAngleAdvance = (flareRpm / 60) * (2 * Math.PI) * dt;
          const nextCrankAngle = (current.crankshaftAngleRad + crankAngleAdvance) % (4 * Math.PI);

          const turboRpm = Math.min(18000, current.turboShaftSpeedRpm + 12000 * dt);
          const vacuumBar = -0.65 * Math.min(1, tIgn / 0.5);

          engineAudio.update(true, flareRpm, 0, false);

          setState((prev) => ({
            ...prev,
            engineRpm: flareRpm,
            targetRpm: ENGINE_IDLE_RPM,
            isStarting: true,
            isEngineRunning: true,
            crankshaftAngleRad: nextCrankAngle,
            boostPressureBar: vacuumBar,
            boostPressurePsi: vacuumBar * 14.5038,
            turbo1BoostBar: vacuumBar,
            turbo2BoostBar: vacuumBar,
            turboShaftSpeedRpm: turboRpm,
            engineTorqueNm: 45,
            enginePowerHp: 5.0,
            transmissionInputRpm: flareRpm,
            vehicleSpeedKmh: 0,
            fuelFlowRateLph: 1.5,
          }));
        } else {
          // Finished starting, smoothly hand off to normal running loop
          isStartingRef.current = false;
          setState((prev) => ({
            ...prev,
            isStarting: false,
            isEngineRunning: true,
            engineRpm: ENGINE_IDLE_RPM,
            targetRpm: ENGINE_IDLE_RPM,
            boostPressureBar: -0.65,
            boostPressurePsi: -9.4,
            turbo1BoostBar: -0.65,
            turbo2BoostBar: -0.65,
            turboShaftSpeedRpm: 15000,
          }));
        }
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      // 2. Engine OFF Resting / Coast-Down State
      if (!current.isEngineRunning) {
        const remainingRpm = Math.max(0, current.engineRpm - 1200 * dt);
        const remainingSpeed = Math.max(0, current.vehicleSpeedKmh - 15 * dt);
        const remainingTurbo = Math.max(0, current.turboShaftSpeedRpm - 15000 * dt);

        engineAudio.update(false, remainingRpm, 0, false);

        setState((prev) => ({
          ...prev,
          engineRpm: remainingRpm,
          targetRpm: 0,
          propShaftRpm: Math.max(0, prev.propShaftRpm - 250 * dt),
          frontPropShaftRpm: Math.max(0, prev.frontPropShaftRpm - 250 * dt),
          leftWheelRpm: Math.max(0, prev.leftWheelRpm - 70 * dt),
          rightWheelRpm: Math.max(0, prev.rightWheelRpm - 70 * dt),
          frontLeftWheelRpm: Math.max(0, prev.frontLeftWheelRpm - 70 * dt),
          frontRightWheelRpm: Math.max(0, prev.frontRightWheelRpm - 70 * dt),
          vehicleSpeedKmh: remainingSpeed,
          boostPressureBar: 0,
          boostPressurePsi: 0,
          turbo1BoostBar: 0,
          turbo2BoostBar: 0,
          wastegateDutyPercent: 0,
          engineTorqueNm: 0,
          enginePowerHp: 0,
          transmissionInputRpm: remainingRpm,
          transmissionOutputRpm: 0,
          fuelFlowRateLph: 0,
          turboShaftSpeedRpm: remainingTurbo,
        }));
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      // 0. Update input ramps from keyboard state
      let currentThrottle = current.throttle;
      let currentBrake = current.brake;
      let currentSteering = current.steeringAngle;

      if (keysPressedRef.current.w) {
        // Rapid drive-by-wire throttle response (0 to 100% in ~0.20s)
        currentThrottle = Math.min(1, currentThrottle + 5.0 * dt);
      }
      if (keysPressedRef.current.s || keysPressedRef.current.space) {
        // High-friction brake pedal bite (0 to 100% in ~0.15s)
        currentBrake = Math.min(1, currentBrake + 6.5 * dt);
      }
      if (keysPressedRef.current.a) {
        currentSteering = Math.min(35, currentSteering + 80.0 * dt);
      } else if (keysPressedRef.current.d) {
        currentSteering = Math.max(-35, currentSteering - 80.0 * dt);
      } else if (!keysPressedRef.current.a && !keysPressedRef.current.d && Math.abs(currentSteering) > 0.05) {
        // Self-centering front steering
        currentSteering -= Math.sign(currentSteering) * Math.min(Math.abs(currentSteering), 65.0 * dt);
      }

      // Track time in current gear for shift hysteresis
      timeSinceLastShiftRef.current += dt;

      const inNeutralOrPark = current.gearMode === 'P' || current.gearMode === 'N';

      // 1. Automatic Transmission Shift Schedule
      let activeGear = current.currentGear;
      if (inNeutralOrPark) {
        activeGear = 0;
      } else if (current.gearMode === 'R') {
        activeGear = -1;
      } else if (current.gearMode === 'D') {
        const nextGear = calculateAutomaticShiftSchedule(
          activeGear,
          currentThrottle,
          current.engineRpm,
          current.vehicleSpeedKmh,
          current.drivelogicMode,
          timeSinceLastShiftRef.current,
          currentBrake
        );
        if (nextGear !== activeGear) {
          activeGear = nextGear;
          timeSinceLastShiftRef.current = 0;
          engineAudio.triggerShiftBark();
        }
      } else if (current.gearMode === 'M') {
        // Manual mode: auto-downshift only to prevent stall if speed drops to stop or RPM < 1100
        if (current.vehicleSpeedKmh < 4.0 && activeGear > 1) {
          activeGear = 1;
          timeSinceLastShiftRef.current = 0;
          engineAudio.triggerShiftBark();
        } else if (current.engineRpm < 1100 && activeGear > 1 && timeSinceLastShiftRef.current > 0.5) {
          activeGear -= 1;
          timeSinceLastShiftRef.current = 0;
          engineAudio.triggerShiftBark();
        }
      }

      // 2. Transmission & Driveline Ratios
      const currentRatio = ZF_8HP76_GEAR_RATIOS[activeGear] ?? 0;
      const absRatio = Math.abs(currentRatio);
      const isReverse = activeGear === -1;
      const driveDirection = isReverse ? -1 : 1;

      // 3. Physical Tractive Acceleration & Vehicle Speed
      let currentSpeedKmh = current.vehicleSpeedKmh;
      let newSpeedKmh = currentSpeedKmh;

      if (inNeutralOrPark || currentRatio === 0) {
        if (current.gearMode === 'P') {
          newSpeedKmh = 0;
        } else {
          // Neutral: coasting with rolling resistance and brakes
          const decel = 1.5 + currentBrake * 45.0;
          newSpeedKmh = Math.max(0, Math.abs(currentSpeedKmh) - decel * dt * 3.6) * Math.sign(currentSpeedKmh || 1);
          if (Math.abs(newSpeedKmh) < 0.2) newSpeedKmh = 0;
        }
      } else {
        // Under driving load (D, M, R)
        const speedMs = Math.abs(currentSpeedKmh) / 3.6;

        // A. Engine torque at current RPM & throttle (up to 650 Nm)
        const engineTorque = calculateEngineTorque(current.engineRpm, currentThrottle);

        // B. Hydraulic torque converter stall multiplication at launch (up to 1.75x)
        const stallMult = 1.0 + Math.max(0, 0.75 * (1.0 - Math.min(1, speedMs / 6.0))) * Math.min(1, currentThrottle * 1.5);
        const wheelTorqueNm = engineTorque * stallMult * absRatio * FINAL_DRIVE_RATIO * 0.94;

        // C. Tractive drive force at the tire contact patch
        let fDrive = (wheelTorqueNm / TIRE_RADIUS_METERS);

        // Idle creep in D or R when neither throttle nor brake applied
        if (currentThrottle < 0.03 && currentBrake < 0.05) {
          const creepSpeedLimitKmh = 7.5;
          if (Math.abs(currentSpeedKmh) < creepSpeedLimitKmh) {
            fDrive = 850 * (1.0 - Math.abs(currentSpeedKmh) / creepSpeedLimitKmh);
          } else {
            fDrive = 0;
          }
        } else if (currentThrottle < 0.03) {
          fDrive = 0;
        }

        // Traction limit (M xDrive AWD launches with ~1.05g max traction)
        const maxAwdTractionForce = 1950 * 9.81 * (current.mXDriveMode === '4wd' ? 1.15 : (current.mXDriveMode === '4wd_sport' ? 1.05 : 0.92));
        fDrive = Math.min(fDrive, maxAwdTractionForce);

        // D. Opposing resistance forces
        // Aerodynamic drag: F = 0.5 * rho * Cd * A * v^2 (Cd=0.35, A=2.38 m^2)
        const fAero = 0.5 * 1.225 * 0.35 * 2.38 * speedMs * speedMs;
        // Rolling resistance: Fr = Crr * M * g
        const fRoll = 0.015 * 1950 * 9.81;
        // High-performance M braking: up to 1.25g deceleration (~24,000 N)
        const fBrake = currentBrake * 24000;

        // Effective inertial mass including drivetrain rotational inertia
        const effectiveMass = 1950 + 65 * (absRatio / 2);

        // Net acceleration
        const netForce = fDrive - fAero - fRoll - fBrake;
        const accelMs2 = netForce / effectiveMass;

        // Update speed
        let newSpeedMs = speedMs + accelMs2 * dt;

        // Stationary brake clamp: vehicle stays parked when brake is applied at standstill
        if (newSpeedMs < 0.3 && (currentBrake > 0.08 || (currentThrottle < 0.03 && currentBrake > 0.02))) {
          newSpeedMs = 0;
        } else if (newSpeedMs < 0) {
          newSpeedMs = 0;
        }

        // Top speed limiter (290 km/h M Driver's Package, 45 km/h in Reverse)
        const topSpeedMs = isReverse ? (45 / 3.6) : (290 / 3.6);
        newSpeedMs = Math.min(topSpeedMs, newSpeedMs);

        newSpeedKmh = newSpeedMs * 3.6 * driveDirection;
      }

      // 4. Engine RPM dynamics (BMW S58: 750 to 7200 RPM)
      let targetRpm = ENGINE_IDLE_RPM;
      let lockup: 'Unlocked' | 'Slipping' | 'Locked' = 'Unlocked';
      let transOutRpm = 0;

      if (inNeutralOrPark) {
        // Free revving in P / N
        targetRpm = ENGINE_IDLE_RPM + currentThrottle * (ENGINE_REDLINE_RPM - ENGINE_IDLE_RPM);
        // Rev limiter bounce at redline
        if (currentThrottle > 0.95 && current.engineRpm >= ENGINE_REDLINE_RPM - 80) {
          targetRpm = ENGINE_REDLINE_RPM - 150 + Math.sin(now * 0.05) * 120;
        }
        lockup = 'Unlocked';
        transOutRpm = 0;
      } else {
        // Under driving load (D / M / R)
        const absSpeedKmh = Math.abs(newSpeedKmh);
        const wheelRpm = (absSpeedKmh * 1000) / (60 * TIRE_CIRCUMFERENCE_METERS);
        transOutRpm = wheelRpm * FINAL_DRIVE_RATIO;
        const roadCoupledEngineRpm = transOutRpm * absRatio;

        // Torque converter lockup state and slip
        if (activeGear >= 2 && absSpeedKmh > 18) {
          lockup = 'Locked';
          const slipRpm = currentThrottle * 50; // minor compliance
          targetRpm = Math.max(ENGINE_IDLE_RPM, roadCoupledEngineRpm + slipRpm);
        } else if (absSpeedKmh > 8) {
          lockup = 'Slipping';
          const slipRpm = 120 + currentThrottle * 150;
          targetRpm = Math.max(ENGINE_IDLE_RPM, roadCoupledEngineRpm + slipRpm);
        } else {
          lockup = 'Unlocked';
          // At launch in 1st gear:
          // S58 engine flashes up to torque converter stall speed immediately under throttle!
          const stallFlashRpm = ENGINE_IDLE_RPM + currentThrottle * 2300; // ~3,050 RPM stall flash at WOT!
          const roadRpmWithSlip = roadCoupledEngineRpm + (150 * currentThrottle);
          targetRpm = Math.max(ENGINE_IDLE_RPM, Math.max(stallFlashRpm, roadRpmWithSlip));
        }

        // Manual mode hard rev limiter bounce
        if (current.gearMode === 'M' && roadCoupledEngineRpm >= ENGINE_REDLINE_RPM - 50) {
          targetRpm = ENGINE_REDLINE_RPM - 100 + Math.sin(now * 0.05) * 80;
        }
      }

      // Smooth RPM inertia response (S58 forged crankshaft revs fast: 5500 RPM/s accelerating)
      const rpmRate = currentThrottle > 0.05 ? 5500 : 3000;
      const newRpm = current.engineRpm + (targetRpm - current.engineRpm) * Math.min(1, (rpmRate * dt) / 1000);
      const clampedRpm = Math.max(ENGINE_IDLE_RPM, Math.min(ENGINE_REDLINE_RPM, newRpm));

      // 5. Dual Mono-Scroll Turbo Boost and Wastegate
      const boostData = calculateTurboBoost(clampedRpm, currentThrottle);

      // 6. Engine Torque & Power (up to 650 Nm, 503 HP)
      const torqueNm = calculateEngineTorque(clampedRpm, currentThrottle);
      const powerHp = calculateEnginePowerHp(torqueNm, clampedRpm);

      // 7. M xDrive Dynamics & Torque Split
      const mXDrive = calculateMXDriveDynamics(current.mXDriveMode, currentThrottle, currentSteering);
      const frontTorquePercent = Math.round(mXDrive.frontSplit * 100);

      // 8. Driveline Propeller Shaft Speeds
      const propShaftRpm = transOutRpm;
      const frontPropRpm = current.mXDriveMode === '2wd' ? 0 : transOutRpm;

      // 9. Differential & Wheel Speeds (Rear Active M Diff & Front Open Diff)
      const effectivePropRpm = Math.abs((newSpeedKmh * 1000) / (60 * TIRE_CIRCUMFERENCE_METERS)) * FINAL_DRIVE_RATIO;
      const rearDiffSpeeds = calculateDifferentialWheelSpeeds(effectivePropRpm, currentSteering);
      const frontDiffSpeeds = calculateDifferentialWheelSpeeds(
        current.mXDriveMode === '2wd' ? 0 : effectivePropRpm * (mXDrive.frontSplit > 0 ? 1 : 0),
        currentSteering
      );

      // 10. Crankshaft and Turbo rotation advancement
      const crankAngleAdvance = (clampedRpm / 60) * (2 * Math.PI) * dt;
      const nextCrankAngle = (current.crankshaftAngleRad + crankAngleAdvance) % (4 * Math.PI);

      // S58 twin turbos spool up to 195,000 RPM
      const targetTurboRpm = 18000 + Math.max(0, boostData.bar + 0.65) * 105000 + (clampedRpm / 7200) * 55000;
      const newTurboRpm = current.turboShaftSpeedRpm + (targetTurboRpm - current.turboShaftSpeedRpm) * 6.0 * dt;

      // Fuel flow (L/h): S58 Twin-Turbo high delivery
      const fuelFlow = Math.max(0.9, (powerHp * 0.31) + (clampedRpm / 7200) * 3.5);

      // Continuous S58 acoustic synthesis update
      engineAudio.update(true, clampedRpm, currentThrottle, false);

      setState((prev) => ({
        ...prev,
        throttle: currentThrottle,
        brake: currentBrake,
        steeringAngle: currentSteering,
        engineRpm: clampedRpm,
        targetRpm,
        boostPressureBar: boostData.bar,
        boostPressurePsi: boostData.psi,
        turbo1BoostBar: boostData.turbo1Bar,
        turbo2BoostBar: boostData.turbo2Bar,
        wastegateDutyPercent: boostData.wastegateDuty,
        engineTorqueNm: torqueNm,
        enginePowerHp: powerHp,
        currentGear: activeGear,
        torqueConverterLockup: lockup,
        transmissionInputRpm: clampedRpm,
        transmissionOutputRpm: transOutRpm,
        propShaftRpm: effectivePropRpm,
        frontPropShaftRpm: frontPropRpm,
        frontTorqueSplitPercent: frontTorquePercent,
        activeMDiffLockPercent: Math.round(mXDrive.activeMDiffLockPercent),
        leftWheelRpm: rearDiffSpeeds.leftWheelRpm,
        rightWheelRpm: rearDiffSpeeds.rightWheelRpm,
        frontLeftWheelRpm: frontDiffSpeeds.leftWheelRpm,
        frontRightWheelRpm: frontDiffSpeeds.rightWheelRpm,
        vehicleSpeedKmh: newSpeedKmh,
        fuelFlowRateLph: fuelFlow,
        crankshaftAngleRad: nextCrankAngle,
        turboShaftSpeedRpm: newTurboRpm,
      }));

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    state,
    setThrottle,
    setBrake,
    setSteeringAngle,
    toggleEngine,
    setGearMode,
    setMXDriveMode,
    setDrivelogicMode,
    shiftUp,
    shiftDown,
    toggleSound,
  };
}
