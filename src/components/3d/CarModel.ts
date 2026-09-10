import * as THREE from 'three';
import { CarMaterials, createAutomotiveMaterials } from './materials/AutomotiveMaterials';
import { ExteriorChassisAssembly } from './assemblies/ExteriorChassis';
import { SuspensionAssembly } from './assemblies/SuspensionAssembly';
import { EngineAssembly } from './assemblies/EngineAssembly';
import { TransmissionAssembly } from './assemblies/TransmissionAssembly';
import { DrivetrainAssembly } from './assemblies/DrivetrainAssembly';
import { DifferentialAssembly } from './assemblies/DifferentialAssembly';
import { ExhaustAssembly } from './assemblies/ExhaustAssembly';
import { PowertrainState, SubsystemId, ViewMode } from '../../types/powertrain';

export class CarModel {
  public group: THREE.Group;
  public materials: CarMaterials;
  public clippingPlanes: THREE.Plane[];

  public exteriorChassis: ExteriorChassisAssembly;
  public suspension: SuspensionAssembly;
  public engine: EngineAssembly;
  public transmission: TransmissionAssembly;
  public drivetrain: DrivetrainAssembly;
  public differential: DifferentialAssembly;
  public exhaust: ExhaustAssembly;

  private currentExplode = 0;
  private currentSubsystem: SubsystemId = 'all';

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'BMWM3TouringMasterModel';

    // Longitudinal cutaway clipping plane (disabled by default with constant 999.0)
    const cutawayPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 999.0);
    this.clippingPlanes = [cutawayPlane];

    this.materials = createAutomotiveMaterials(this.clippingPlanes);

    this.exteriorChassis = new ExteriorChassisAssembly(this.materials);
    this.suspension = new SuspensionAssembly(this.materials);
    this.engine = new EngineAssembly(this.materials);
    this.transmission = new TransmissionAssembly(this.materials);
    this.drivetrain = new DrivetrainAssembly(this.materials);
    this.differential = new DifferentialAssembly(this.materials);
    this.exhaust = new ExhaustAssembly(this.materials);

    this.group.add(
      this.exteriorChassis.group,
      this.suspension.group,
      this.engine.group,
      this.transmission.group,
      this.drivetrain.group,
      this.differential.group,
      this.exhaust.group
    );
  }

  public setViewMode(mode: ViewMode) {
    const isXRay = mode === 'xray';
    const isCutaway = mode === 'cutaway';

    // Enable or disable cutaway plane
    this.clippingPlanes[0].constant = isCutaway ? 0.02 : 999.0;

    // Body panel transparency / x-ray
    this.exteriorChassis.update(this.currentExplode, isXRay, isCutaway);
  }

  public setPaintColor(hex: number) {
    this.materials.carPaint.color.setHex(hex);
  }

  public setSubsystemFocus(subsystemId: SubsystemId) {
    this.currentSubsystem = subsystemId;

    const showAll = subsystemId === 'all' || subsystemId === 'rolling_chassis';

    // Propagate granular part visibility to sub-assemblies
    this.exteriorChassis.setSubsystemFocus(subsystemId);
    this.engine.setSubsystemFocus(subsystemId);
    this.transmission.setSubsystemFocus(subsystemId);
    this.exhaust.setSubsystemFocus(subsystemId);

    // Group for complete drivetrain line: differential, driveshaft, transfer case (torque_converter), gearbox (transmission)
    const isDrivetrainFocus =
      subsystemId === 'differential' ||
      subsystemId === 'driveshaft' ||
      subsystemId === 'torque_converter' ||
      subsystemId === 'transmission';

    // Control visibility based on selected subsystem
    // 1. Suspension: only visible in showAll, chassis_suspension, or brakes_wheels
    this.suspension.group.visible =
      showAll || subsystemId === 'chassis_suspension' || subsystemId === 'brakes_wheels';

    // 2. Engine: only visible in showAll or engine sub-components (NOT exhaust!)
    this.engine.group.visible =
      showAll ||
      subsystemId === 'engine_bay' ||
      subsystemId === 'engine_block' ||
      subsystemId === 'valvetrain' ||
      subsystemId === 'rotating_assembly' ||
      subsystemId === 'turbocharger';

    // 3. Transmission (Gearbox): visible in showAll and when focusing drivetrain parts
    this.transmission.group.visible =
      showAll || isDrivetrainFocus;

    // 4. Drivetrain (Transfer Case & Driveshafts): visible in showAll and when focusing drivetrain parts
    this.drivetrain.group.visible =
      showAll || isDrivetrainFocus;

    // 5. Differential: visible in showAll, when focusing drivetrain parts, or brakes_wheels
    this.differential.group.visible =
      showAll || isDrivetrainFocus || subsystemId === 'brakes_wheels';

    // 6. Exhaust: visible in showAll and ONLY when focusing exhaust!
    this.exhaust.group.visible =
      showAll || subsystemId === 'exhaust';
  }

  public update(state: PowertrainState, explodeFactor: number, viewMode: ViewMode) {
    this.currentExplode = explodeFactor;

    // Update clipping plane constant
    this.clippingPlanes[0].constant = viewMode === 'cutaway' ? 0.02 : 999.0;

    // 1. Exterior
    this.exteriorChassis.update(
      explodeFactor,
      viewMode === 'xray',
      viewMode === 'cutaway',
      state.steeringAngle
    );

    // 2. Suspension & front steering & rotating front wheels
    this.suspension.update(
      explodeFactor,
      state.steeringAngle,
      state.vehicleSpeedKmh,
      state.leftWheelRpm,
      state.rightWheelRpm
    );

    // 3. Engine, Rotating assembly, Valvetrain, Turbocharger
    this.engine.update(
      state.crankshaftAngleRad,
      state.turboShaftSpeedRpm,
      state.wastegateDutyPercent,
      state.throttle,
      explodeFactor
    );

    // 4. AA81E Transmission & Torque Converter
    this.transmission.update(
      state.engineRpm,
      state.transmissionInputRpm,
      state.transmissionOutputRpm,
      state.currentGear,
      explodeFactor
    );

    // 5. Driveshaft (Propeller Shaft)
    this.drivetrain.update(state.propShaftRpm, explodeFactor);

    // 6. Rear Differential & Rear Wheels
    this.differential.update(
      state.propShaftRpm,
      state.leftWheelRpm,
      state.rightWheelRpm,
      state.brake,
      explodeFactor,
      state.activeMDiffLockPercent
    );

    // 7. Full System M Sport Exhaust
    this.exhaust.update(
      state.engineRpm,
      state.throttle,
      explodeFactor,
      viewMode === 'cutaway'
    );
  }
}
