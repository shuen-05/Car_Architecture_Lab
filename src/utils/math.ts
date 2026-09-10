// Engineering physics and kinematics calculations for 2025 BMW M3 Competition Touring (G81)

// ZF 8HP76 M Steptronic 8-Speed Automatic Transmission with Drivelogic
export const ZF_8HP76_GEAR_RATIOS: Record<number, number> = {
  [-1]: -3.456, // Reverse
  0: 0,         // Neutral / Park
  1: 5.000,     // 1st
  2: 3.200,     // 2nd
  3: 2.143,     // 3rd
  4: 1.720,     // 4th
  5: 1.314,     // 5th
  6: 1.000,     // 6th (Direct)
  7: 0.822,     // 7th (Overdrive)
  8: 0.640,     // 8th (High-Speed Cruise Overdrive)
};

export const AA81E_GEAR_RATIOS = ZF_8HP76_GEAR_RATIOS; // Alias for compatibility
export const FINAL_DRIVE_RATIO = 3.154; // BMW M Active Differential final drive
export const FRONT_FINAL_DRIVE_RATIO = 3.154; // Front differential ratio
export const TIRE_RADIUS_METERS = 0.338; // 285/30ZR20 rear approx 0.676m diameter
export const TIRE_CIRCUMFERENCE_METERS = 2 * Math.PI * TIRE_RADIUS_METERS; // ~2.12m

// BMW S58 3.0-Liter TwinPower Turbo Inline-6 Specs
export const ENGINE_IDLE_RPM = 750;
export const ENGINE_REDLINE_RPM = 7200; // S58 high-revving motorsport limiter
export const ENGINE_PEAK_TORQUE_NM = 650; // 479 lb-ft @ 2,750 - 5,500 RPM
export const ENGINE_PEAK_POWER_HP = 503; // 510 PS @ 6,250 RPM

/**
 * Calculates BMW S58 3.0L Twin-Turbo torque (Nm) at a given RPM and throttle
 */
export function calculateEngineTorque(rpm: number, throttle: number): number {
  if (rpm < 600) return 0;
  
  // Authentic wide-open throttle (WOT) dynamometer curve for BMW S58
  let baseTorque = 0;
  if (rpm < 1400) {
    // Off-idle torque build-up
    baseTorque = 280 + (rpm - 600) * (420 - 280) / (1400 - 600);
  } else if (rpm < 2750) {
    // Twin mono-scroll spooling window
    baseTorque = 420 + (rpm - 1400) * (650 - 420) / (2750 - 1400);
  } else if (rpm <= 5500) {
    // Famous broad S58 torque plateau: 650 Nm from 2,750 to 5,500 RPM
    baseTorque = 650;
  } else if (rpm <= 6250) {
    // Sustained high power peak (503 hp at 6,250 RPM)
    baseTorque = 650 - (rpm - 5500) * (650 - 565) / (6250 - 5500);
  } else {
    // High-RPM over-rev toward 7,200 RPM redline
    baseTorque = 565 - (rpm - 6250) * (565 - 480) / (7200 - 6250);
  }

  // Throttle modulation + idle offset
  const effectiveLoad = Math.max(0.06, throttle);
  return baseTorque * Math.pow(effectiveLoad, 0.82);
}

/**
 * Calculates horsepower: HP = (Torque_Nm * RPM) / 7127
 */
export function calculateEnginePowerHp(torqueNm: number, rpm: number): number {
  return (torqueNm * rpm) / 7127;
}

/**
 * Calculates twin turbo boost pressure (bar & PSI) based on RPM and throttle
 */
export function calculateTurboBoost(rpm: number, throttle: number): {
  bar: number;
  psi: number;
  turbo1Bar: number;
  turbo2Bar: number;
  wastegateDuty: number;
} {
  if (throttle < 0.05 || rpm < 900) {
    const vacuumBar = -0.65 + (rpm / 7200) * 0.15;
    return {
      bar: vacuumBar,
      psi: vacuumBar * 14.5038,
      turbo1Bar: vacuumBar,
      turbo2Bar: vacuumBar,
      wastegateDuty: 0,
    };
  }

  // Twin mono-scroll turbos spool independently for Cyl 1-3 and 4-6
  const spoolFactor = Math.min(1.0, Math.max(0, (rpm - 1300) / 1450));
  const maxBoostAtRpm = 1.70 * spoolFactor; // Peak 1.70 bar (24.7 PSI)
  const targetBoost = (maxBoostAtRpm * throttle) - (0.25 * (1 - throttle));

  // High-precision electronic wastegate control
  const wastegateDuty = targetBoost > 1.2 ? Math.min(100, ((targetBoost - 1.2) / 0.50) * 100) : 0;

  // Slight micro-variation between front and rear turbos for authentic telemetry
  const turbo1Bar = targetBoost * 0.995;
  const turbo2Bar = targetBoost * 1.005;

  return {
    bar: targetBoost,
    psi: targetBoost * 14.5038,
    turbo1Bar,
    turbo2Bar,
    wastegateDuty,
  };
}

/**
 * Calculates M xDrive torque distribution and Active M Differential lockup
 */
export function calculateMXDriveDynamics(
  mode: '4wd' | '4wd_sport' | '2wd',
  throttle: number,
  steeringAngleDeg: number
): {
  frontSplit: number; // 0 to 0.5
  rearSplit: number;  // 0.5 to 1.0
  activeMDiffLockPercent: number; // 0 to 100
} {
  if (mode === '2wd') {
    // Pure RWD mode: transfer case completely decoupled!
    const diffLock = Math.min(100, throttle * 85 + Math.abs(steeringAngleDeg) * 0.4);
    return { frontSplit: 0, rearSplit: 1.0, activeMDiffLockPercent: diffLock };
  } else if (mode === '4wd_sport') {
    // Rear-biased AWD (20:80 to 30:70)
    const front = Math.min(0.30, 0.15 + throttle * 0.15);
    const diffLock = Math.min(100, throttle * 75 + Math.abs(steeringAngleDeg) * 0.6);
    return { frontSplit: front, rearSplit: 1.0 - front, activeMDiffLockPercent: diffLock };
  } else {
    // Default 4WD: maximum traction (40:60 default, up to 50:50 on hard throttle)
    const front = 0.35 + throttle * 0.15;
    const diffLock = Math.min(100, throttle * 60 + Math.abs(steeringAngleDeg) * 0.5);
    return { frontSplit: front, rearSplit: 1.0 - front, activeMDiffLockPercent: diffLock };
  }
}

/**
 * Calculates piston position along cylinder bore using Slider-Crank kinematics
 * BMW S58: stroke = 90.0mm, rod length = 144.4mm
 * Returns displacement from TDC in millimeters (0 to 90mm)
 */
export function calculatePistonDisplacement(crankAngleRad: number): number {
  const r = 45.0; // Crank radius = stroke / 2 = 90mm / 2
  const l = 144.4; // Connecting rod center-to-center length
  const sinTheta = Math.sin(crankAngleRad);
  const cosTheta = Math.cos(crankAngleRad);
  const displacement = r * (1 - cosTheta) + l - Math.sqrt(l * l - r * r * sinTheta * sinTheta);
  return displacement; // 0 mm at TDC, 86 mm at BDC
}

/**
 * Calculates poppet valve lift in millimeters for intake and exhaust valves
 * 4-stroke cycle = 720 degrees (4 * PI rad)
 * 1-3-4-2 firing order
 */
/**
 * Calculates authentic BMW S58 Inline-6 cylinder crank angle offset
 * Firing order: 1 - 5 - 3 - 6 - 2 - 4
 * Cranks are paired at 120-degree intervals: (1,6), (2,5), (3,4)
 */
export function getS58CylinderCycleOffset(cylinderIndex: number): number {
  // Cyl 1 (idx 0) = 0° (0 rad)
  // Cyl 2 (idx 1) = 480° (8*PI/3 rad)
  // Cyl 3 (idx 2) = 240° (4*PI/3 rad)
  // Cyl 4 (idx 3) = 600° (10*PI/3 rad)
  // Cyl 5 (idx 4) = 120° (2*PI/3 rad)
  // Cyl 6 (idx 5) = 360° (2*PI rad)
  const offsets = [
    0,
    (8 * Math.PI) / 3,
    (4 * Math.PI) / 3,
    (10 * Math.PI) / 3,
    (2 * Math.PI) / 3,
    2 * Math.PI,
  ];
  return offsets[cylinderIndex] ?? 0;
}

/**
 * Calculates poppet valve lift in millimeters for intake and exhaust valves
 * BMW S58 4-stroke cycle = 720 degrees (4 * PI rad)
 * 1-5-3-6-2-4 firing order across 6 cylinders (index 0 to 5)
 */
export function calculateValveLifts(cycleAngleRad: number, cylinderIndex: number): { intakeLiftMm: number; exhaustLiftMm: number } {
  // 720 degree cycle normalized to [0, 4*PI)
  const normalizedAngle = ((cycleAngleRad % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
  const offset = getS58CylinderCycleOffset(cylinderIndex);
  const localAngle = ((normalizedAngle - offset) + 4 * Math.PI) % (4 * Math.PI);

  const maxLift = 9.8; // BMW Valvetronic variable lift up to 9.8mm

  // Intake stroke occurs between 360° (2*PI) and 540° (3*PI)
  // Valve opens slightly before TDC (~340°) and closes after BDC (~580°)
  const intakeOpen = 1.9 * Math.PI; // ~342°
  const intakeClose = 3.25 * Math.PI; // ~585°
  let intakeLiftMm = 0;
  if (localAngle >= intakeOpen && localAngle <= intakeClose) {
    const progress = (localAngle - intakeOpen) / (intakeClose - intakeOpen);
    intakeLiftMm = Math.sin(progress * Math.PI) * maxLift;
  }

  // Exhaust stroke occurs between 180° (PI) and 360° (2*PI)
  // Valve opens before BDC (~140°) and closes slightly after TDC (~380°)
  const exhaustOpen = 0.8 * Math.PI; // ~144°
  const exhaustClose = 2.1 * Math.PI; // ~378°
  let exhaustLiftMm = 0;
  if (localAngle >= exhaustOpen && localAngle <= exhaustClose) {
    const progress = (localAngle - exhaustOpen) / (exhaustClose - exhaustOpen);
    exhaustLiftMm = Math.sin(progress * Math.PI) * maxLift;
  }

  return {
    intakeLiftMm: Math.max(0, intakeLiftMm),
    exhaustLiftMm: Math.max(0, exhaustLiftMm),
  };
}

/**
 * Calculates differential wheel speed differentiation based on Ackermann steering angle
 * Wheelbase L = 2.800m, Track width W = 1.540m
 */
export function calculateDifferentialWheelSpeeds(
  propShaftRpm: number,
  steeringAngleDeg: number
): { ringGearRpm: number; leftWheelRpm: number; rightWheelRpm: number; speedDifferentialRatio: number } {
  const ringGearRpm = propShaftRpm / FINAL_DRIVE_RATIO;
  
  if (Math.abs(steeringAngleDeg) < 0.2) {
    return {
      ringGearRpm,
      leftWheelRpm: ringGearRpm,
      rightWheelRpm: ringGearRpm,
      speedDifferentialRatio: 1.0,
    };
  }

  const steeringRad = (steeringAngleDeg * Math.PI) / 180;
  const wheelbase = 2.80; // meters
  const trackWidth = 1.54; // meters
  
  // Turning radius from center of rear axle
  const turningRadius = wheelbase / Math.tan(Math.abs(steeringRad));
  
  // When steering left (positive angle): left wheel is inside (slower), right wheel is outside (faster)
  // When steering right (negative angle): right wheel is inside, left wheel is outside
  const innerFactor = (turningRadius - trackWidth / 2) / turningRadius;
  const outerFactor = (turningRadius + trackWidth / 2) / turningRadius;

  let leftWheelRpm = ringGearRpm;
  let rightWheelRpm = ringGearRpm;

  if (steeringAngleDeg > 0) {
    // Turning left
    leftWheelRpm = ringGearRpm * innerFactor;
    rightWheelRpm = ringGearRpm * outerFactor;
  } else {
    // Turning right
    leftWheelRpm = ringGearRpm * outerFactor;
    rightWheelRpm = ringGearRpm * innerFactor;
  }

  return {
    ringGearRpm,
    leftWheelRpm,
    rightWheelRpm,
    speedDifferentialRatio: rightWheelRpm / (leftWheelRpm || 1),
  };
}

/**
 * ZF 8HP76 Automatic Transmission shift schedule with Drivelogic calibration
 * Returns next gear (1 to 8) based on current gear, throttle, engine RPM, vehicle speed, and shift cooldown
 */
export function calculateAutomaticShiftSchedule(
  currentGear: number,
  throttle: number,
  engineRpm: number,
  vehicleSpeedKmh: number,
  drivelogicMode: string | number,
  timeSinceLastShiftSec: number,
  brake: number = 0
): number {
  if (currentGear <= 0) return currentGear; // Park, Neutral, Reverse

  // If vehicle has slowed down to near stop (< 10 km/h), return to 1st gear
  if (vehicleSpeedKmh < 10.0) {
    return 1;
  }
  if (vehicleSpeedKmh < 22.0 && currentGear > 2) {
    return 2;
  }

  // Minimum shift duration to prevent gear hunting (faster cooldown under heavy braking)
  const minShiftCooldown = brake > 0.3 ? 0.18 : 0.35;
  if (timeSinceLastShiftSec < minShiftCooldown) {
    return currentGear;
  }

  // Drivelogic shift thresholds modifier
  let drivelogicOffset = 0;
  const modeStr = String(drivelogicMode);
  if (modeStr.includes('1')) drivelogicOffset = -300;
  else if (modeStr.includes('3')) drivelogicOffset = +400;

  // 1. Dynamic Upshift Threshold (2,200 RPM at 0% throttle up to 6,950 RPM at 100% WOT)
  const baseUpshiftRpm = 2200 + drivelogicOffset;
  const maxUpshiftRpm = 6950;
  const upshiftRpm = baseUpshiftRpm + Math.pow(Math.max(0, throttle), 1.35) * (maxUpshiftRpm - baseUpshiftRpm);

  if (engineRpm >= upshiftRpm && currentGear < 8) {
    // Only upshift if next gear wouldn't immediately drop RPM below downshift threshold
    const currentRatio = ZF_8HP76_GEAR_RATIOS[currentGear] || 1;
    const nextRatio = ZF_8HP76_GEAR_RATIOS[currentGear + 1] || 1;
    const predictedRpmAfterShift = engineRpm * (nextRatio / currentRatio);
    if (predictedRpmAfterShift > 1300) {
      return currentGear + 1;
    }
  }

  // 2. Downshift Thresholds (Anti-lugging, Braking & Kickdown)
  // Under braking, downshift more eagerly to provide engine braking and prepare for re-acceleration
  const luggingDownshiftRpm = brake > 0.2 ? 1650 : 1250;
  if (engineRpm < luggingDownshiftRpm && currentGear > 1) {
    return currentGear - 1;
  }

  // Kickdown: driver suddenly steps on heavy throttle (> 70%) while at low-to-mid RPM
  if (throttle > 0.70 && currentGear > 1) {
    const currentRatio = ZF_8HP76_GEAR_RATIOS[currentGear] || 1;
    const prevRatio = ZF_8HP76_GEAR_RATIOS[currentGear - 1] || 1;
    const predictedRpmOnKickdown = engineRpm * (prevRatio / currentRatio);
    // Allow kickdown if downshifted RPM will land comfortably below 6,400 RPM
    if (predictedRpmOnKickdown < 6400 && engineRpm < 4400) {
      return currentGear - 1;
    }
  }

  return currentGear;
}

