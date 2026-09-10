import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { RotatingAssembly } from './RotatingAssembly';
import { ValvetrainAssembly } from './ValvetrainAssembly';
import { TurboAssembly } from './TurboAssembly';
import { SubsystemId } from '../../../types/powertrain';

export class EngineAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;
  public rotatingAssembly: RotatingAssembly;
  public valvetrainAssembly: ValvetrainAssembly;
  public turboAssembly: TurboAssembly;

  private cylinderBlock: THREE.Group;
  private cylinderHead: THREE.Group;
  private oilPanGroup: THREE.Group;
  private intakeSystemGroup: THREE.Group;
  private accessoryDriveGroup: THREE.Group;

  // Front Accessory Pulleys (Animated)
  private alternatorPulley: THREE.Mesh;
  private acPulley: THREE.Mesh;
  private waterPumpPulley: THREE.Mesh;
  private tensionerPulley: THREE.Mesh;
  private idlerPulley: THREE.Mesh;
  private serpentineBelt: THREE.Mesh;

  private throttlePlate: THREE.Mesh;
  private cylinderLiners: THREE.Mesh[] = [];

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'EngineAssembly';

    this.cylinderBlock = new THREE.Group();
    this.cylinderHead = new THREE.Group();
    this.oilPanGroup = new THREE.Group();
    this.intakeSystemGroup = new THREE.Group();
    this.accessoryDriveGroup = new THREE.Group();

    this.alternatorPulley = new THREE.Mesh();
    this.acPulley = new THREE.Mesh();
    this.waterPumpPulley = new THREE.Mesh();
    this.tensionerPulley = new THREE.Mesh();
    this.idlerPulley = new THREE.Mesh();
    this.serpentineBelt = new THREE.Mesh();
    this.throttlePlate = new THREE.Mesh();

    this.rotatingAssembly = new RotatingAssembly(materials);
    this.valvetrainAssembly = new ValvetrainAssembly(materials);
    this.turboAssembly = new TurboAssembly(materials);

    this.buildCylinderBlock();
    this.buildFrontAccessoryDrive();
    this.buildCylinderHead();
    this.buildOilPan();
    this.buildIntakeAndIntercooler();

    this.group.add(
      this.cylinderBlock,
      this.accessoryDriveGroup,
      this.cylinderHead,
      this.oilPanGroup,
      this.intakeSystemGroup,
      this.rotatingAssembly.group,
      this.valvetrainAssembly.group,
      this.turboAssembly.group
    );

    // Position longitudinal S58 Twin-Turbo in engine bay (tunnel height Y = 0.32, front axle bay Z = 1.30)
    this.group.position.set(0, 0.32, 1.30);
  }

  // =========================================================================
  // 1. S58 Closed-Deck Aluminum Engine Block & Castings
  // =========================================================================
  private buildCylinderBlock() {
    const blockMat = this.materials.engineAluminum;
    const linerMat = this.materials.castIron;
    const steelMat = this.materials.polishedSteel;
    const ironMat = this.materials.castIron;

    // S58 Closed-Deck High-Rigidity Aluminum Engine Block (Length 0.58m, Bore 84mm)
    const blockGeo = new THREE.BoxGeometry(0.26, 0.22, 0.58);
    const blockMesh = new THREE.Mesh(blockGeo, blockMat);
    blockMesh.position.set(0, 0.11, 0);
    this.cylinderBlock.add(blockMesh);

    // 6 Wire-Arc Sprayed LDS Iron Coated Cylinder Bores (84mm bore, 90mm stroke)
    const zOffsets = [0.2275, 0.1365, 0.0455, -0.0455, -0.1365, -0.2275];
    for (let i = 0; i < 6; i++) {
      const linerGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.21, 24, 1, true);
      const liner = new THREE.Mesh(linerGeo, linerMat);
      liner.position.set(0, 0.11, zOffsets[i]);
      this.cylinderLiners.push(liner);
      this.cylinderBlock.add(liner);
    }

    // Integrated cross-flow water cooling channels
    const jacketGeo = new THREE.BoxGeometry(0.22, 0.14, 0.54);
    const jacket = new THREE.Mesh(jacketGeo, this.materials.chassisSteel);
    jacket.position.set(0, 0.11, 0);
    jacket.scale.set(0.95, 0.95, 0.95);
    this.cylinderBlock.add(jacket);

    // Structural External Stiffening Ribs/Webbing along both block flanks
    for (const sideX of [-0.132, 0.132]) {
      for (let r = 0; r < 7; r++) {
        const rZ = -0.24 + r * 0.08;
        const ribGeo = new THREE.BoxGeometry(0.008, 0.18, 0.014);
        const rib = new THREE.Mesh(ribGeo, blockMat);
        rib.position.set(sideX, 0.11, rZ);
        this.cylinderBlock.add(rib);
      }
    }

    // Front Timing Chain Housing & Oil Pump Cover
    const frontCoverGeo = new THREE.BoxGeometry(0.25, 0.26, 0.035);
    const frontCover = new THREE.Mesh(frontCoverGeo, blockMat);
    frontCover.position.set(0, 0.12, 0.30);
    this.cylinderBlock.add(frontCover);

    // Rear Transmission Bellhousing Mating Flange with Perimeter Bolt Bosses
    const bellFlangeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.024, 28);
    bellFlangeGeo.rotateX(Math.PI / 2);
    const bellFlange = new THREE.Mesh(bellFlangeGeo, blockMat);
    bellFlange.position.set(0, 0.08, -0.30);
    this.cylinderBlock.add(bellFlange);

    for (let b = 0; b < 8; b++) {
      const bAngle = (b / 8) * Math.PI * 2;
      const bossGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.03, 10);
      bossGeo.rotateX(Math.PI / 2);
      const boss = new THREE.Mesh(bossGeo, steelMat);
      boss.position.set(Math.cos(bAngle) * 0.165, 0.08 + Math.sin(bAngle) * 0.165, -0.30);
      this.cylinderBlock.add(boss);
    }

    // High-Torque Starter Motor with Solenoid (Lower intake flank: X = -0.14, Y = 0.04, Z = -0.18)
    const starterMotorGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.13, 18);
    starterMotorGeo.rotateX(Math.PI / 2);
    const starterMotor = new THREE.Mesh(starterMotorGeo, this.materials.subframeBlack);
    starterMotor.position.set(-0.14, 0.04, -0.18);
    this.cylinderBlock.add(starterMotor);

    const solenoidGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.08, 14);
    solenoidGeo.rotateX(Math.PI / 2);
    const solenoid = new THREE.Mesh(solenoidGeo, steelMat);
    solenoid.position.set(-0.14, 0.085, -0.17);
    this.cylinderBlock.add(solenoid);

    // Engine Oil Filter Housing with Integrated Oil-to-Water Heat Exchanger
    const filterBaseGeo = new THREE.BoxGeometry(0.08, 0.08, 0.09);
    const filterBase = new THREE.Mesh(filterBaseGeo, blockMat);
    filterBase.position.set(-0.15, 0.14, 0.16);
    this.cylinderBlock.add(filterBase);

    // Ribbed Spin-on Oil Filter Canister Cap
    const capGeo = new THREE.CylinderGeometry(0.032, 0.034, 0.085, 18);
    capGeo.rotateZ(0.35);
    const cap = new THREE.Mesh(capGeo, ironMat);
    cap.position.set(-0.17, 0.18, 0.16);
    this.cylinderBlock.add(cap);

    // Oil Heat Exchanger Aluminum Plate Stack
    const coolerGeo = new THREE.BoxGeometry(0.065, 0.045, 0.085);
    const cooler = new THREE.Mesh(coolerGeo, steelMat);
    cooler.position.set(-0.16, 0.08, 0.16);
    this.cylinderBlock.add(cooler);

    // Camshaft-Driven High-Pressure Fuel Pump (HDP) at Top Rear of Head
    const hdpGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.055, 16);
    const hdp = new THREE.Mesh(hdpGeo, steelMat);
    hdp.position.set(-0.04, 0.38, -0.29);
    this.cylinderBlock.add(hdp);

    // Active Structural Engine Mounts (Cast aluminum brackets + Hydraulic rubber isolators)
    for (const side of [-1, 1]) {
      const mountBracketGeo = new THREE.BoxGeometry(0.06, 0.08, 0.12);
      const mountBracket = new THREE.Mesh(mountBracketGeo, blockMat);
      mountBracket.position.set(side * 0.16, 0.04, 0.02);
      mountBracket.rotation.z = -side * 0.25;
      this.cylinderBlock.add(mountBracket);

      // Hydraulic hydro-mount body
      const hydroMountGeo = new THREE.CylinderGeometry(0.042, 0.046, 0.07, 16);
      const hydroMount = new THREE.Mesh(hydroMountGeo, this.materials.rubberBlack);
      hydroMount.position.set(side * 0.19, -0.01, 0.02);
      this.cylinderBlock.add(hydroMount);

      // Lower mounting stud to subframe
      const mountStudGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8);
      const mountStud = new THREE.Mesh(mountStudGeo, steelMat);
      mountStud.position.set(side * 0.19, -0.05, 0.02);
      this.cylinderBlock.add(mountStud);
    }

    // High-Temperature Embossed Gold Thermal Heat Shields over Turbos & Exhaust Flange
    const shieldPoints = [
      new THREE.Vector3(0.16, 0.14, -0.22),
      new THREE.Vector3(0.24, 0.18, -0.10),
      new THREE.Vector3(0.25, 0.19, 0.04),
      new THREE.Vector3(0.23, 0.16, 0.18),
    ];
    const shieldCurve = new THREE.CatmullRomCurve3(shieldPoints);
    const shieldGeo = new THREE.TubeGeometry(shieldCurve, 20, 0.052, 12, false);
    const turboShield = new THREE.Mesh(shieldGeo, this.materials.heatShieldGold);
    turboShield.scale.set(0.65, 0.95, 1.0);
    this.cylinderBlock.add(turboShield);

    // Embossed heat shield standoffs and Torx retaining screws
    for (let s = 0; s < 4; s++) {
      const sZ = -0.18 + s * 0.11;
      const standoffGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.025, 8);
      standoffGeo.rotateZ(Math.PI / 2);
      const standoff = new THREE.Mesh(standoffGeo, steelMat);
      standoff.position.set(0.195, 0.18, sZ);
      this.cylinderBlock.add(standoff);
    }

    // Coolant Distribution Hard Pipes with Constant-Tension Spring Clamps
    const coolantPoints = [
      new THREE.Vector3(-0.06, 0.01, 0.32),
      new THREE.Vector3(-0.16, 0.02, 0.28),
      new THREE.Vector3(-0.16, 0.02, 0.05),
      new THREE.Vector3(-0.15, 0.01, -0.15),
    ];
    const coolantCurve = new THREE.CatmullRomCurve3(coolantPoints);
    const coolantPipeGeo = new THREE.TubeGeometry(coolantCurve, 24, 0.014, 10, false);
    const coolantPipe = new THREE.Mesh(coolantPipeGeo, blockMat);
    this.cylinderBlock.add(coolantPipe);

    for (const clampZ of [0.29, 0.06, -0.13]) {
      const clampGeo = new THREE.TorusGeometry(0.016, 0.002, 8, 16);
      clampGeo.rotateY(Math.PI / 2);
      const clamp = new THREE.Mesh(clampGeo, steelMat);
      clamp.position.set(-0.16, 0.02, clampZ);
      this.cylinderBlock.add(clamp);
    }

    // Crankcase Ventilation (PCV) Oil Separator Cyclone Module on Head Flank
    const pcvBoxGeo = new THREE.BoxGeometry(0.065, 0.09, 0.12);
    const pcvBox = new THREE.Mesh(pcvBoxGeo, this.materials.intakePlastic);
    pcvBox.position.set(-0.145, 0.28, -0.06);
    this.cylinderBlock.add(pcvBox);

    const pcvHosePoints = [
      new THREE.Vector3(-0.145, 0.32, -0.06),
      new THREE.Vector3(-0.16, 0.35, 0.04),
      new THREE.Vector3(-0.13, 0.33, 0.12),
    ];
    const pcvHoseCurve = new THREE.CatmullRomCurve3(pcvHosePoints);
    const pcvHoseGeo = new THREE.TubeGeometry(pcvHoseCurve, 16, 0.008, 8, false);
    const pcvHose = new THREE.Mesh(pcvHoseGeo, this.materials.rubberBootBlack);
    this.cylinderBlock.add(pcvHose);

    // Stainless Steel Dipstick Tube with Anodized Pull Ring
    const dipstickPoints = [
      new THREE.Vector3(-0.14, 0.02, 0.08),
      new THREE.Vector3(-0.16, 0.15, 0.07),
      new THREE.Vector3(-0.17, 0.32, 0.06),
    ];
    const dipstickCurve = new THREE.CatmullRomCurve3(dipstickPoints);
    const dipstickGeo = new THREE.TubeGeometry(dipstickCurve, 16, 0.004, 8, false);
    const dipstick = new THREE.Mesh(dipstickGeo, steelMat);
    this.cylinderBlock.add(dipstick);

    const pullRingGeo = new THREE.TorusGeometry(0.012, 0.003, 8, 16);
    const pullRing = new THREE.Mesh(pullRingGeo, this.materials.brakeCaliper);
    pullRing.position.set(-0.17, 0.335, 0.06);
    this.cylinderBlock.add(pullRing);

    // Engine Wiring Loom / Sensor Conduits (Black corrugated tubing along intake flank)
    const loomPoints = [
      new THREE.Vector3(-0.15, 0.24, 0.22),
      new THREE.Vector3(-0.155, 0.22, 0.0),
      new THREE.Vector3(-0.15, 0.20, -0.20),
    ];
    const loomCurve = new THREE.CatmullRomCurve3(loomPoints);
    const loomGeo = new THREE.TubeGeometry(loomCurve, 16, 0.007, 8, false);
    const loom = new THREE.Mesh(loomGeo, this.materials.rubberBootBlack);
    this.cylinderBlock.add(loom);
  }

  // =========================================================================
  // 2. Front Accessory Serpentine Belt Drive System (Animated)
  // =========================================================================
  private buildFrontAccessoryDrive() {
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const beltMat = this.materials.rubberBlack;
    const blackMat = this.materials.subframeBlack;

    // 1. High-Output Alternator (Upper Left: X = -0.15, Y = 0.09, Z = 0.32)
    const altBodyGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.075, 20);
    altBodyGeo.rotateX(Math.PI / 2);
    const altBody = new THREE.Mesh(altBodyGeo, aluMat);
    altBody.position.set(-0.15, 0.09, 0.32);
    this.accessoryDriveGroup.add(altBody);

    const altPulleyGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.022, 20);
    altPulleyGeo.rotateX(Math.PI / 2);
    this.alternatorPulley = new THREE.Mesh(altPulleyGeo, steelMat);
    this.alternatorPulley.position.set(-0.15, 0.09, 0.355);
    this.accessoryDriveGroup.add(this.alternatorPulley);

    // 2. A/C Compressor with Magnetic Clutch Pulley (Lower Right: X = 0.15, Y = 0.03, Z = 0.32)
    const acBodyGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.095, 18);
    acBodyGeo.rotateX(Math.PI / 2);
    const acBody = new THREE.Mesh(acBodyGeo, blackMat);
    acBody.position.set(0.15, 0.03, 0.32);
    this.accessoryDriveGroup.add(acBody);

    const acPulleyGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.022, 20);
    acPulleyGeo.rotateX(Math.PI / 2);
    this.acPulley = new THREE.Mesh(acPulleyGeo, steelMat);
    this.acPulley.position.set(0.15, 0.03, 0.355);
    this.accessoryDriveGroup.add(this.acPulley);

    // 3. Coolant Water Pump (Upper Center: X = 0.0, Y = 0.17, Z = 0.32)
    const wpBodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 18);
    wpBodyGeo.rotateX(Math.PI / 2);
    const wpBody = new THREE.Mesh(wpBodyGeo, aluMat);
    wpBody.position.set(0.0, 0.17, 0.32);
    this.accessoryDriveGroup.add(wpBody);

    const wpPulleyGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.022, 20);
    wpPulleyGeo.rotateX(Math.PI / 2);
    this.waterPumpPulley = new THREE.Mesh(wpPulleyGeo, steelMat);
    this.waterPumpPulley.position.set(0.0, 0.17, 0.355);
    this.accessoryDriveGroup.add(this.waterPumpPulley);

    // 4. Spring-Loaded Belt Tensioner (X = -0.075, Y = 0.19)
    const tensBodyGeo = new THREE.BoxGeometry(0.024, 0.045, 0.02);
    const tensBody = new THREE.Mesh(tensBodyGeo, aluMat);
    tensBody.position.set(-0.075, 0.18, 0.33);
    this.accessoryDriveGroup.add(tensBody);

    const tensPulleyGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.022, 18);
    tensPulleyGeo.rotateX(Math.PI / 2);
    this.tensionerPulley = new THREE.Mesh(tensPulleyGeo, steelMat);
    this.tensionerPulley.position.set(-0.075, 0.20, 0.355);
    this.accessoryDriveGroup.add(this.tensionerPulley);

    // 5. Ribbed Idler Guide Pulley (X = 0.09, Y = 0.12)
    const idlerPulleyGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.022, 18);
    idlerPulleyGeo.rotateX(Math.PI / 2);
    this.idlerPulley = new THREE.Mesh(idlerPulleyGeo, steelMat);
    this.idlerPulley.position.set(0.09, 0.12, 0.355);
    this.accessoryDriveGroup.add(this.idlerPulley);

    // 6. Continuous Multi-Rib Serpentine Drive Belt (Closed Loop Route)
    const beltPoints = [
      new THREE.Vector3(0.0, -0.082, 0.355),    // Bottom of crank pulley
      new THREE.Vector3(0.196, 0.03, 0.355),    // Under A/C compressor pulley
      new THREE.Vector3(0.122, 0.14, 0.355),    // Over idler pulley
      new THREE.Vector3(0.0, 0.21, 0.355),      // Over water pump pulley
      new THREE.Vector3(-0.075, 0.23, 0.355),   // Under tensioner pulley
      new THREE.Vector3(-0.178, 0.09, 0.355),   // Around alternator pulley
    ];
    const beltCurve = new THREE.CatmullRomCurve3(beltPoints, true);
    const beltGeo = new THREE.TubeGeometry(beltCurve, 48, 0.005, 8, true);
    this.serpentineBelt = new THREE.Mesh(beltGeo, beltMat);
    this.accessoryDriveGroup.add(this.serpentineBelt);
  }

  // =========================================================================
  // 3. Cylinder Head & Authentic M Power Vanity Engine Cover
  // =========================================================================
  private buildCylinderHead() {
    const headMat = this.materials.engineAluminum;
    const coverMat = this.materials.mPowerEngineCover;

    // S58 3D-Printed Core Cylinder Head Monoblock
    const headGeo = new THREE.BoxGeometry(0.28, 0.14, 0.58);
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.29, 0);
    this.cylinderHead.add(headMesh);

    // Authentic M Carbon Fiber Composite Engine Cover with M Tri-Color Graphics
    const coverGeo = new THREE.BoxGeometry(0.28, 0.042, 0.56);
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.set(0, 0.385, 0);
    this.cylinderHead.add(coverMesh);

    // 3D Knurled Billet Oil Filler Cap
    const capBaseGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.016, 20);
    const capBase = new THREE.Mesh(capBaseGeo, this.materials.subframeBlack);
    capBase.position.set(0.075, 0.412, 0.17);
    this.cylinderHead.add(capBase);

    const capTopGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.003, 16);
    const capTop = new THREE.Mesh(capTopGeo, this.materials.brassBronze);
    capTop.position.set(0.075, 0.422, 0.17);
    this.cylinderHead.add(capTop);

    // 4 Rubber Engine Cover Vibration Isolator Mounting Grommets
    for (const gx of [-0.11, 0.11]) {
      for (const gz of [-0.22, 0.22]) {
        const grommetGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12);
        const grommet = new THREE.Mesh(grommetGeo, this.materials.polishedSteel);
        grommet.position.set(gx, 0.407, gz);
        this.cylinderHead.add(grommet);
      }
    }
  }

  // =========================================================================
  // 4. Track-Spec Motorsport Dual-Chamber Oil Sump
  // =========================================================================
  private buildOilPan() {
    const panMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;

    // Stepped Dual-Chamber Oil Pan:
    // Rear Main Deep Sump Chamber (holds 6.5L synthetic motor oil)
    const rearSumpGeo = new THREE.BoxGeometry(0.24, 0.11, 0.34);
    const rearSump = new THREE.Mesh(rearSumpGeo, panMat);
    rearSump.position.set(0, -0.055, -0.11);
    this.oilPanGroup.add(rearSump);

    // Front Anti-Surge Shallow Reservoir Chamber (clears front subframe / axle)
    const frontReservoirGeo = new THREE.BoxGeometry(0.22, 0.06, 0.22);
    const frontReservoir = new THREE.Mesh(frontReservoirGeo, panMat);
    frontReservoir.position.set(0, -0.03, 0.17);
    this.oilPanGroup.add(frontReservoir);

    // Dynamic Lateral G-Force Scavenge Oil Line
    const scavengeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.26, 12);
    scavengeGeo.rotateX(Math.PI / 2);
    const scavenge = new THREE.Mesh(scavengeGeo, steelMat);
    scavenge.position.set(-0.08, -0.04, 0.04);
    this.oilPanGroup.add(scavenge);

    // Magnetic Oil Drain Plug Bolt
    const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12);
    const bolt = new THREE.Mesh(boltGeo, steelMat);
    bolt.position.set(0.06, -0.11, -0.24);
    this.oilPanGroup.add(bolt);
  }

  private buildIntakeAndIntercooler() {
    const intakeMat = this.materials.intakePlastic;
    const aluMat = this.materials.engineAluminum;

    // =========================================================================
    // S58 High-Flow Dual-Stage Intake Airbox Assembly
    // =========================================================================
    const airboxGroup = new THREE.Group();
    airboxGroup.name = 'S58IntakeAirbox';
    const boxX = -0.35;
    const boxZ = 0.35;

    // 1. Lower Housing Basin / Tub (Glass-filled polyamide composite)
    const lowerTubGeo = new THREE.BoxGeometry(0.18, 0.08, 0.28);
    const lowerTub = new THREE.Mesh(lowerTubGeo, intakeMat);
    lowerTub.position.set(boxX, 0.30, boxZ);
    lowerTub.castShadow = true;
    airboxGroup.add(lowerTub);

    // Beveled bottom chassis mounting tabs & vibration isolation grommets
    [-0.10, 0.10].forEach((bz) => {
      const tabGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.018, 12);
      const tab = new THREE.Mesh(tabGeo, this.materials.rubberBlack);
      tab.position.set(boxX - 0.09, 0.25, boxZ + bz);
      airboxGroup.add(tab);

      const collarGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.022, 10);
      const collar = new THREE.Mesh(collarGeo, this.materials.gearSteel);
      collar.position.set(boxX - 0.09, 0.25, boxZ + bz);
      airboxGroup.add(collar);
    });

    // 2. Perimeter Sealing Split Flange & Gasket
    const flangeGeo = new THREE.BoxGeometry(0.194, 0.012, 0.294);
    const flange = new THREE.Mesh(flangeGeo, intakeMat);
    flange.position.set(boxX, 0.346, boxZ);
    airboxGroup.add(flange);

    // Synthetic silicone perimeter sealing gasket visible along the split line
    const gasketGeo = new THREE.BoxGeometry(0.190, 0.004, 0.290);
    const gasket = new THREE.Mesh(gasketGeo, this.materials.brakeCaliper);
    gasket.position.set(boxX, 0.346, boxZ);
    airboxGroup.add(gasket);

    // 3. Upper Airbox Lid / Cover with Contoured Top
    const upperLidGeo = new THREE.BoxGeometry(0.178, 0.065, 0.278);
    const upperLid = new THREE.Mesh(upperLidGeo, intakeMat);
    upperLid.position.set(boxX, 0.385, boxZ);
    upperLid.castShadow = true;
    airboxGroup.add(upperLid);

    // Molded Transverse Stiffening Ribs on the Lid (Characteristic BMW M composite structure)
    [-0.09, -0.045, 0.0, 0.045, 0.09].forEach((rz) => {
      const ribGeo = new THREE.BoxGeometry(0.165, 0.008, 0.008);
      const rib = new THREE.Mesh(ribGeo, intakeMat);
      rib.position.set(boxX, 0.421, boxZ + rz);
      airboxGroup.add(rib);
    });

    // Central Longitudinal Spine Rib
    const spineGeo = new THREE.BoxGeometry(0.010, 0.009, 0.25);
    const spine = new THREE.Mesh(spineGeo, intakeMat);
    spine.position.set(boxX, 0.422, boxZ);
    airboxGroup.add(spine);

    // Molded Airflow Direction Chevron Arrow on Top Lid
    const arrowGeo = new THREE.ConeGeometry(0.015, 0.035, 3);
    arrowGeo.rotateX(Math.PI / 2);
    arrowGeo.rotateZ(Math.PI);
    const arrow = new THREE.Mesh(arrowGeo, this.materials.subframeBlack);
    arrow.position.set(boxX - 0.045, 0.423, boxZ - 0.04);
    airboxGroup.add(arrow);

    // BMW ///M Tri-Color Emblem Strip on Lid
    const mColors = [0x0066b1, 0x001e4d, 0xd12421];
    mColors.forEach((hex, idx) => {
      const stripeMat = new THREE.MeshStandardMaterial({
        color: hex,
        metalness: 0.2,
        roughness: 0.35,
        clippingPlanes: this.materials.carPaint.clippingPlanes,
      });
      const stripeGeo = new THREE.BoxGeometry(0.004, 0.002, 0.024);
      stripeGeo.rotateY(0.25);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(boxX + 0.04 + idx * 0.0055, 0.423, boxZ + 0.05);
      airboxGroup.add(stripe);
    });

    // 4. Quick-Release Stainless Wire Bail Latches (Clips)
    const clipMat = this.materials.polishedSteel;
    const clipSpecs = [
      { x: boxX - 0.098, y: 0.346, z: boxZ - 0.07, ry: 0 },
      { x: boxX - 0.098, y: 0.346, z: boxZ + 0.07, ry: 0 },
      { x: boxX, y: 0.346, z: boxZ + 0.148, ry: Math.PI / 2 },
      { x: boxX, y: 0.346, z: boxZ - 0.148, ry: -Math.PI / 2 },
    ];
    clipSpecs.forEach((spec) => {
      const clipGroup = new THREE.Group();
      clipGroup.position.set(spec.x, spec.y, spec.z);
      clipGroup.rotation.y = spec.ry;

      // Base bracket
      const baseGeo = new THREE.BoxGeometry(0.006, 0.022, 0.016);
      const base = new THREE.Mesh(baseGeo, this.materials.gearSteel);
      clipGroup.add(base);

      // Wire spring loop bail
      const wireGeo = new THREE.TorusGeometry(0.009, 0.0018, 8, 14, Math.PI);
      wireGeo.rotateZ(-Math.PI / 2);
      const wire = new THREE.Mesh(wireGeo, clipMat);
      wire.position.set(0.004, 0, 0);
      clipGroup.add(wire);

      airboxGroup.add(clipGroup);
    });

    // 5. Molded Front Cold-Air Intake Inlet (Flush with housing face)
    const inletGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.025, 20);
    inletGeo.rotateX(Math.PI / 2);
    inletGeo.scale(1.3, 0.75, 1.0); // Molded oval aperture
    const inlet = new THREE.Mesh(inletGeo, intakeMat);
    inlet.position.set(boxX, 0.31, boxZ + 0.145);
    airboxGroup.add(inlet);

    // Recessed dark honeycomb mesh inside the inlet
    const meshGeo = new THREE.CircleGeometry(0.032, 16);
    meshGeo.scale(1.3, 0.75, 1.0);
    const inletMesh = new THREE.Mesh(meshGeo, this.materials.subframeBlack);
    inletMesh.position.set(boxX, 0.31, boxZ + 0.155);
    airboxGroup.add(inletMesh);

    // 6. Rear Clean-Air Outlet Duct & Rubber Accordion Coupler (Feeds into Throttle Body)
    const outletPoints = [
      new THREE.Vector3(boxX, 0.375, boxZ - 0.14),
      new THREE.Vector3(boxX + 0.05, 0.36, boxZ - 0.22),
      new THREE.Vector3(-0.20, 0.32, -0.02),
    ];
    const outletCurve = new THREE.CatmullRomCurve3(outletPoints);
    const outletGeo = new THREE.TubeGeometry(outletCurve, 16, 0.038, 18, false);
    const outlet = new THREE.Mesh(outletGeo, intakeMat);
    outlet.castShadow = true;
    airboxGroup.add(outlet);

    // Flexible accordion rubber boot coupler
    const bootPoints = [
      new THREE.Vector3(boxX + 0.065, 0.355, boxZ - 0.245),
      new THREE.Vector3(boxX + 0.095, 0.345, boxZ - 0.295),
    ];
    const bootCurve = new THREE.CatmullRomCurve3(bootPoints);
    const bootGeo = new THREE.TubeGeometry(bootCurve, 8, 0.041, 16, false);
    const boot = new THREE.Mesh(bootGeo, this.materials.rubberBootBlack);
    airboxGroup.add(boot);

    // Dual stainless steel hose clamps on the coupler
    [0.0, 1.0].forEach((t) => {
      const pt = bootCurve.getPoint(t);
      const clampGeo = new THREE.TorusGeometry(0.0415, 0.0025, 8, 20);
      clampGeo.rotateY(0.45);
      const clamp = new THREE.Mesh(clampGeo, clipMat);
      clamp.position.copy(pt);
      airboxGroup.add(clamp);

      const blockGeo = new THREE.BoxGeometry(0.007, 0.007, 0.012);
      const block = new THREE.Mesh(blockGeo, this.materials.gearSteel);
      block.position.set(pt.x, pt.y + 0.0415, pt.z);
      airboxGroup.add(block);
    });

    // 7. Digital Mass Air Flow (MAF) Sensor with Harness Connector
    const mafBodyGeo = new THREE.BoxGeometry(0.032, 0.038, 0.028);
    const mafBody = new THREE.Mesh(mafBodyGeo, this.materials.subframeBlack);
    mafBody.position.set(boxX + 0.025, 0.408, boxZ - 0.17);
    airboxGroup.add(mafBody);

    // 2 Torx mounting screws
    [-0.011, 0.011].forEach((tx) => {
      const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.006, 8);
      const screw = new THREE.Mesh(screwGeo, this.materials.gearSteel);
      screw.position.set(boxX + 0.025 + tx, 0.428, boxZ - 0.17);
      airboxGroup.add(screw);
    });

    // 4-pin weatherpack electrical plug & corrugated wiring harness
    const plugGeo = new THREE.BoxGeometry(0.014, 0.012, 0.020);
    const plug = new THREE.Mesh(plugGeo, this.materials.compositePanBlack);
    plug.position.set(boxX + 0.045, 0.412, boxZ - 0.17);
    airboxGroup.add(plug);

    const wirePoints = [
      new THREE.Vector3(boxX + 0.052, 0.412, boxZ - 0.17),
      new THREE.Vector3(boxX + 0.08, 0.39, boxZ - 0.14),
      new THREE.Vector3(boxX + 0.10, 0.35, boxZ - 0.08),
    ];
    const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 8, 0.004, 8, false);
    const wire = new THREE.Mesh(wireGeo, this.materials.rubberBlack);
    airboxGroup.add(wire);

    this.intakeSystemGroup.add(airboxGroup);

    // 76mm Electronic Drive-by-Wire Throttle Body
    const throttleBodyGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.06, 20);
    throttleBodyGeo.rotateZ(Math.PI / 2);
    const throttleBody = new THREE.Mesh(throttleBodyGeo, aluMat);
    throttleBody.position.set(-0.20, 0.32, -0.05);
    this.intakeSystemGroup.add(throttleBody);

    // Servomotor Housing on Throttle Body
    const servoGeo = new THREE.BoxGeometry(0.03, 0.04, 0.04);
    const servo = new THREE.Mesh(servoGeo, this.materials.subframeBlack);
    servo.position.set(-0.20, 0.36, -0.05);
    this.intakeSystemGroup.add(servo);

    // Rotating throttle butterfly plate
    const plateGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.003, 16);
    this.throttlePlate = new THREE.Mesh(plateGeo, this.materials.brassBronze);
    this.throttlePlate.position.set(-0.20, 0.32, -0.05);
    this.intakeSystemGroup.add(this.throttlePlate);

    // 6 Tuned Intake Runners feeding each cylinder
    const zOffsets = [0.2275, 0.1365, 0.0455, -0.0455, -0.1365, -0.2275];
    for (let i = 0; i < 6; i++) {
      const runnerGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.12, 14);
      runnerGeo.rotateZ(1.1);
      const runner = new THREE.Mesh(runnerGeo, intakeMat);
      runner.position.set(-0.12, 0.31, zOffsets[i]);
      this.intakeSystemGroup.add(runner);
    }
  }

  public setSubsystemFocus(subsystemId: SubsystemId) {
    if (subsystemId === 'valvetrain') {
      this.cylinderBlock.visible = true;
      this.cylinderHead.visible = false; // Expose the 24 helical springs and cams!
      this.intakeSystemGroup.visible = false;
      this.valvetrainAssembly.group.visible = true;
      this.rotatingAssembly.group.visible = false;
      this.turboAssembly.group.visible = false;
      this.accessoryDriveGroup.visible = true;
      this.oilPanGroup.visible = true;
    } else if (subsystemId === 'rotating_assembly') {
      this.cylinderBlock.visible = false; // Expose pistons, rods, and crankshaft!
      this.cylinderHead.visible = false;
      this.intakeSystemGroup.visible = false;
      this.valvetrainAssembly.group.visible = false;
      this.rotatingAssembly.group.visible = true;
      this.turboAssembly.group.visible = false;
      this.accessoryDriveGroup.visible = true;
      this.oilPanGroup.visible = false;
    } else if (subsystemId === 'turbocharger') {
      this.cylinderBlock.visible = true;
      this.cylinderHead.visible = true;
      this.intakeSystemGroup.visible = true;
      this.valvetrainAssembly.group.visible = false;
      this.rotatingAssembly.group.visible = false;
      this.turboAssembly.group.visible = true;
      this.accessoryDriveGroup.visible = true;
      this.oilPanGroup.visible = true;
    } else if (subsystemId === 'engine_block') {
      this.cylinderBlock.visible = true;
      this.cylinderHead.visible = false;
      this.intakeSystemGroup.visible = false;
      this.valvetrainAssembly.group.visible = false;
      this.rotatingAssembly.group.visible = true;
      this.turboAssembly.group.visible = false;
      this.accessoryDriveGroup.visible = true;
      this.oilPanGroup.visible = true;
    } else {
      // Default: show everything in engine
      this.cylinderBlock.visible = true;
      this.cylinderHead.visible = true;
      this.intakeSystemGroup.visible = true;
      this.valvetrainAssembly.group.visible = true;
      this.rotatingAssembly.group.visible = true;
      this.turboAssembly.group.visible = true;
      this.accessoryDriveGroup.visible = true;
      this.oilPanGroup.visible = true;
    }
  }

  public update(
    crankAngleRad: number,
    turboSpeedRpm: number,
    wastegateDuty: number,
    throttle: number,
    explodeFactor: number
  ) {
    // 1. Throttle butterfly valve angle
    const throttleAngle = 0.12 + throttle * (Math.PI / 2 - 0.12);
    this.throttlePlate.rotation.y = throttleAngle;

    // 2. Dynamic Rotation of Front Accessory Drive Pulleys (synchronized with crank rotation)
    this.alternatorPulley.rotation.z = crankAngleRad * 2.8;
    this.acPulley.rotation.z = crankAngleRad * 1.25;
    this.waterPumpPulley.rotation.z = crankAngleRad * 1.1;
    this.tensionerPulley.rotation.z = -crankAngleRad * 1.4;
    this.idlerPulley.rotation.z = -crankAngleRad * 1.4;

    // 3. Sub-assemblies updates
    this.rotatingAssembly.update(crankAngleRad, explodeFactor);
    this.valvetrainAssembly.update(crankAngleRad, explodeFactor);
    this.turboAssembly.update(turboSpeedRpm, wastegateDuty, explodeFactor);

    // 4. Exploded view offsets
    this.cylinderHead.position.y = explodeFactor * 0.42;
    this.oilPanGroup.position.y = -explodeFactor * 0.32;
    this.accessoryDriveGroup.position.z = explodeFactor * 0.28;
    this.intakeSystemGroup.position.x = -explodeFactor * 0.38;
  }
}
