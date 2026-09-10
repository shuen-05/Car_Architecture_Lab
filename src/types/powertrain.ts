// Types for 2025 BMW M3 Competition Touring (G81) Architecture Lab

export type GearMode = 'P' | 'R' | 'N' | 'D' | 'M';
export type MXDriveMode = '4wd' | '4wd_sport' | '2wd';
export type DrivelogicMode = 1 | 2 | 3 | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';

export interface PowertrainState {
  isEngineRunning: boolean;
  isStarting?: boolean;
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
  steeringAngle: number; // -35 to +35 degrees
  gearMode: GearMode;
  currentGear: number; // 1 to 8 (in D or M), 0 in N/P, -1 in R
  drivelogicMode: DrivelogicMode;
  mXDriveMode: MXDriveMode;
  engineRpm: number; // 750 to 7200 RPM (S58 high-revving limit)
  targetRpm: number;
  boostPressureBar: number; // -0.6 bar (vacuum) to +1.70 bar (peak S58 boost)
  boostPressurePsi: number; // up to 24.7 PSI
  turbo1BoostBar: number; // Front turbo (Cyl 1-3)
  turbo2BoostBar: number; // Rear turbo (Cyl 4-6)
  wastegateDutyPercent: number; // 0 to 100%
  torqueConverterLockup: 'Unlocked' | 'Slipping' | 'Locked';
  engineTorqueNm: number; // up to 650 Nm (479 lb-ft)
  enginePowerHp: number; // up to 503 hp (510 PS)
  transmissionInputRpm: number;
  transmissionOutputRpm: number;
  propShaftRpm: number;
  frontPropShaftRpm: number; // Front drive shaft for M xDrive
  frontTorqueSplitPercent: number; // 0% (in 2WD) to 50% (in 4WD)
  activeMDiffLockPercent: number; // 0% (open) to 100% (locked)
  differentialRatio: number; // 3.154 (BMW M final drive)
  leftWheelRpm: number;
  rightWheelRpm: number;
  frontLeftWheelRpm: number;
  frontRightWheelRpm: number;
  vehicleSpeedKmh: number;
  fuelFlowRateLph: number; // liters per hour
  coolantTempC: number;
  oilTempC: number;
  crankshaftAngleRad: number; // 0 to 4*PI (720 deg 4-stroke cycle)
  turboShaftSpeedRpm: number; // up to 195,000 RPM
  soundEnabled: boolean;
}

export type ViewMode = 'exterior' | 'cutaway' | 'xray' | 'exploded';

export type SubsystemId = 
  | 'all'
  | 'rolling_chassis'
  | 'exterior'
  | 'chassis_suspension'
  | 'engine_bay'
  | 'engine_block'
  | 'valvetrain'
  | 'rotating_assembly'
  | 'turbocharger'
  | 'transmission'
  | 'torque_converter'
  | 'driveshaft'
  | 'differential'
  | 'brakes_wheels'
  | 'exhaust';

export interface SubsystemSpec {
  id: SubsystemId;
  name: string;
  category: string;
  shortDescription: string;
  engineeringDetails: string[];
  materials: string[];
  keySpecs: { label: string; value: string }[];
  governingFormula?: {
    formula: string;
    description: string;
  };
  cameraTarget: [number, number, number]; // [x, y, z] target in 3D scene
  cameraPosition: [number, number, number]; // [x, y, z] camera eye
}

export interface EducationalChapter {
  id: number;
  title: string;
  subtitle: string;
  subsystemId: SubsystemId;
  description: string;
  bulletPoints: string[];
  formulaTitle?: string;
  formulaLatex?: string;
  formulaExplanation?: string;
  recommendedExplode: number; // 0 to 1
  recommendedViewMode: ViewMode;
  cameraBookmark: SubsystemId;
}
