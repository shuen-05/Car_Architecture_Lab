import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { SubsystemId } from '../../../types/powertrain';

export class ExhaustAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  // Sub-assemblies for exploded view kinematics
  private frontSectionGroup: THREE.Group;
  private midPipeGroup: THREE.Group;
  private rearAxleBypassGroup: THREE.Group;
  private rearSilencerGroup: THREE.Group;
  private heatShieldsGroup: THREE.Group;

  // Dynamic active flap valve butterfly discs
  private leftValveDisc: THREE.Mesh | null = null;
  private rightValveDisc: THREE.Mesh | null = null;

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'ExhaustAssembly';

    this.frontSectionGroup = new THREE.Group();
    this.frontSectionGroup.name = 'ExhaustFrontSection';

    this.midPipeGroup = new THREE.Group();
    this.midPipeGroup.name = 'ExhaustMidPipeSection';

    this.rearAxleBypassGroup = new THREE.Group();
    this.rearAxleBypassGroup.name = 'ExhaustRearAxleBypass';

    this.rearSilencerGroup = new THREE.Group();
    this.rearSilencerGroup.name = 'ExhaustRearSilencer';

    this.heatShieldsGroup = new THREE.Group();
    this.heatShieldsGroup.name = 'ExhaustHeatShields';

    this.buildFrontDownpipeConnections();
    this.buildTransmissionTunnelMidPipe();
    this.buildRearAxleBypass();
    this.buildTransverseRearSilencer();
    this.buildUnderbodyHeatShields();

    this.group.add(
      this.frontSectionGroup,
      this.midPipeGroup,
      this.rearAxleBypassGroup,
      this.rearSilencerGroup,
      this.heatShieldsGroup
    );
  }

  // =========================================================================
  // 1. Front Modular Flange Connections & Flexible Decoupler Bellows
  // =========================================================================
  private buildFrontDownpipeConnections() {
    const pipeMat = this.materials.exhaustStainless;
    const flangeMat = this.materials.polishedSteel;
    const bellowsMat = this.materials.exhaustFlexBellows;
    const catMat = this.materials.exhaustStainless;
    const boltMat = this.materials.gearSteel;
    const sensorMat = this.materials.brassBronze;

    // Helper: Build heavy-duty 2-bolt oval exhaust flange
    const createFlange = (x: number, y: number, z: number, rx: number, ry: number) => {
      const flangeGroup = new THREE.Group();
      flangeGroup.position.set(x, y, z);
      flangeGroup.rotation.set(rx, ry, 0);

      const plateGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 16);
      plateGeo.scale(1.4, 1.0, 0.9);
      plateGeo.rotateX(Math.PI / 2);
      const plate = new THREE.Mesh(plateGeo, flangeMat);
      plate.castShadow = true;
      flangeGroup.add(plate);

      // 2 High-tensile clamping through-bolts with copper locknuts
      [-0.036, 0.036].forEach((bx) => {
        const boltGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.026, 8);
        boltGeo.rotateX(Math.PI / 2);
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(bx, 0, 0);
        bolt.castShadow = true;
        flangeGroup.add(bolt);

        const nutGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.008, 6);
        nutGeo.rotateX(Math.PI / 2);
        const nut = new THREE.Mesh(nutGeo, sensorMat);
        nut.position.set(bx, 0, 0.012);
        flangeGroup.add(nut);
      });

      return flangeGroup;
    };

    // Helper: Build corrugated wire-mesh flex bellows decoupler
    const createFlexBellows = (curve: THREE.CatmullRomCurve3) => {
      const bellowsGroup = new THREE.Group();
      // Outer sleeve
      const sleeveGeo = new THREE.TubeGeometry(curve, 20, 0.026, 16, false);
      const sleeve = new THREE.Mesh(sleeveGeo, bellowsMat);
      sleeve.castShadow = true;
      bellowsGroup.add(sleeve);

      // Corrugated concentric reinforcement rings
      const ringPoints = curve.getPoints(12);
      ringPoints.forEach((pt) => {
        const ringGeo = new THREE.TorusGeometry(0.027, 0.0025, 8, 16);
        const ring = new THREE.Mesh(ringGeo, flangeMat);
        ring.position.copy(pt);
        ring.lookAt(pt.clone().add(curve.getTangentAt(0.5)));
        bellowsGroup.add(ring);
      });

      return bellowsGroup;
    };

    // --- Bank 1 (Front Turbo Downpipe Outlet at X = 0.16, Y = 0.38, Z = 1.02) ---
    this.frontSectionGroup.add(createFlange(0.16, 0.38, 1.02, 0.15, -0.1));

    const bank1EntryPoints = [
      new THREE.Vector3(0.16, 0.38, 1.02),
      new THREE.Vector3(0.16, 0.28, 0.90),
      new THREE.Vector3(0.15, 0.19, 0.78),
      new THREE.Vector3(0.13, 0.135, 0.68),
    ];
    const bank1EntryCurve = new THREE.CatmullRomCurve3(bank1EntryPoints);
    const bank1EntryGeo = new THREE.TubeGeometry(bank1EntryCurve, 18, 0.021, 14, false);
    const bank1EntryPipe = new THREE.Mesh(bank1EntryGeo, pipeMat);
    bank1EntryPipe.castShadow = true;
    this.frontSectionGroup.add(bank1EntryPipe);

    // Bank 1 Flex Bellows
    const bank1BellowsPoints = [
      new THREE.Vector3(0.13, 0.135, 0.68),
      new THREE.Vector3(0.105, 0.122, 0.58),
      new THREE.Vector3(0.080, 0.122, 0.48),
      new THREE.Vector3(0.065, 0.122, 0.44),
    ];
    const bank1BellowsCurve = new THREE.CatmullRomCurve3(bank1BellowsPoints);
    this.frontSectionGroup.add(createFlexBellows(bank1BellowsCurve));

    // Bank 1 Secondary Catalytic Converter / Otto Particulate Filter (OPF 1)
    const opf1Geo = new THREE.CylinderGeometry(0.032, 0.032, 0.16, 20);
    opf1Geo.rotateX(Math.PI / 2);
    const opf1 = new THREE.Mesh(opf1Geo, catMat);
    opf1.position.set(0.065, 0.122, 0.35);
    opf1.castShadow = true;
    this.frontSectionGroup.add(opf1);

    // OPF 1 Tapered Transition Cones & Heat Shield Band
    const opf1ConeInGeo = new THREE.ConeGeometry(0.032, 0.024, 18, 1, true);
    opf1ConeInGeo.rotateX(-Math.PI / 2);
    const opf1ConeIn = new THREE.Mesh(opf1ConeInGeo, flangeMat);
    opf1ConeIn.position.set(0.065, 0.122, 0.442);
    this.frontSectionGroup.add(opf1ConeIn);

    const opf1ConeOutGeo = new THREE.ConeGeometry(0.032, 0.024, 18, 1, true);
    opf1ConeOutGeo.rotateX(Math.PI / 2);
    const opf1ConeOut = new THREE.Mesh(opf1ConeOutGeo, flangeMat);
    opf1ConeOut.position.set(0.065, 0.122, 0.258);
    this.frontSectionGroup.add(opf1ConeOut);

    // Differential Pressure / Temperature Sensor Port on OPF 1
    const sensor1Geo = new THREE.CylinderGeometry(0.006, 0.006, 0.028, 8);
    const sensor1 = new THREE.Mesh(sensor1Geo, sensorMat);
    sensor1.position.set(0.098, 0.145, 0.35);
    sensor1.rotation.z = Math.PI / 3;
    this.frontSectionGroup.add(sensor1);

    // --- Bank 2 (Rear Turbo Downpipe Outlet at X = 0.14, Y = 0.37, Z = 0.88) ---
    this.frontSectionGroup.add(createFlange(0.14, 0.37, 0.88, 0.18, -0.2));

    const bank2EntryPoints = [
      new THREE.Vector3(0.14, 0.37, 0.88),
      new THREE.Vector3(0.135, 0.27, 0.78),
      new THREE.Vector3(0.12, 0.18, 0.68),
      new THREE.Vector3(0.09, 0.135, 0.58),
    ];
    const bank2EntryCurve = new THREE.CatmullRomCurve3(bank2EntryPoints);
    const bank2EntryGeo = new THREE.TubeGeometry(bank2EntryCurve, 18, 0.021, 14, false);
    const bank2EntryPipe = new THREE.Mesh(bank2EntryGeo, pipeMat);
    bank2EntryPipe.castShadow = true;
    this.frontSectionGroup.add(bank2EntryPipe);

    // Bank 2 Flex Bellows
    const bank2BellowsPoints = [
      new THREE.Vector3(0.09, 0.135, 0.58),
      new THREE.Vector3(0.04, 0.122, 0.52),
      new THREE.Vector3(-0.02, 0.122, 0.47),
      new THREE.Vector3(-0.055, 0.122, 0.44),
    ];
    const bank2BellowsCurve = new THREE.CatmullRomCurve3(bank2BellowsPoints);
    this.frontSectionGroup.add(createFlexBellows(bank2BellowsCurve));

    // Bank 2 Secondary Catalytic Converter / Otto Particulate Filter (OPF 2)
    const opf2Geo = new THREE.CylinderGeometry(0.032, 0.032, 0.16, 20);
    opf2Geo.rotateX(Math.PI / 2);
    const opf2 = new THREE.Mesh(opf2Geo, catMat);
    opf2.position.set(-0.055, 0.122, 0.35);
    opf2.castShadow = true;
    this.frontSectionGroup.add(opf2);

    const opf2ConeInGeo = new THREE.ConeGeometry(0.032, 0.024, 18, 1, true);
    opf2ConeInGeo.rotateX(-Math.PI / 2);
    const opf2ConeIn = new THREE.Mesh(opf2ConeInGeo, flangeMat);
    opf2ConeIn.position.set(-0.055, 0.122, 0.442);
    this.frontSectionGroup.add(opf2ConeIn);

    const opf2ConeOutGeo = new THREE.ConeGeometry(0.032, 0.024, 18, 1, true);
    opf2ConeOutGeo.rotateX(Math.PI / 2);
    const opf2ConeOut = new THREE.Mesh(opf2ConeOutGeo, flangeMat);
    opf2ConeOut.position.set(-0.055, 0.122, 0.258);
    this.frontSectionGroup.add(opf2ConeOut);

    const sensor2Geo = new THREE.CylinderGeometry(0.006, 0.006, 0.028, 8);
    const sensor2 = new THREE.Mesh(sensor2Geo, sensorMat);
    sensor2.position.set(-0.088, 0.145, 0.35);
    sensor2.rotation.z = -Math.PI / 3;
    this.frontSectionGroup.add(sensor2);
  }

  // =========================================================================
  // 2. Central Transmission Tunnel Mid-Piping & Precision X-Pipe Crossover
  // =========================================================================
  private buildTransmissionTunnelMidPipe() {
    const pipeMat = this.materials.exhaustStainless;
    const resonatorMat = this.materials.polishedSteel;
    const hangerMat = this.materials.gearSteel;
    const rubberMat = this.materials.rubberBootBlack;
    const gussetMat = this.materials.chassisSteel;

    // --- Right Mid-Pipe (Bank 1) ---
    const rightTunnelPoints = [
      new THREE.Vector3(0.065, 0.122, 0.258),
      new THREE.Vector3(0.065, 0.122, 0.16),
      // Inward bend into central X-Pipe crossover union
      new THREE.Vector3(0.045, 0.122, 0.06),
      new THREE.Vector3(0.016, 0.122, -0.02), // X-junction pinch point
      new THREE.Vector3(0.045, 0.122, -0.10),
      new THREE.Vector3(0.065, 0.122, -0.20),
      new THREE.Vector3(0.065, 0.125, -0.37),
    ];
    const rightMidCurve = new THREE.CatmullRomCurve3(rightTunnelPoints);
    const rightMidGeo = new THREE.TubeGeometry(rightMidCurve, 32, 0.0185, 16, false);
    const rightMidPipe = new THREE.Mesh(rightMidGeo, pipeMat);
    rightMidPipe.castShadow = true;
    this.midPipeGroup.add(rightMidPipe);

    // --- Left Mid-Pipe (Bank 2) ---
    const leftTunnelPoints = [
      new THREE.Vector3(-0.055, 0.122, 0.258),
      new THREE.Vector3(-0.055, 0.122, 0.16),
      // Inward bend into central X-Pipe crossover union
      new THREE.Vector3(-0.040, 0.122, 0.06),
      new THREE.Vector3(-0.016, 0.122, -0.02), // X-junction pinch point
      new THREE.Vector3(-0.040, 0.122, -0.10),
      new THREE.Vector3(-0.065, 0.122, -0.20),
      new THREE.Vector3(-0.065, 0.125, -0.37),
    ];
    const leftMidCurve = new THREE.CatmullRomCurve3(leftTunnelPoints);
    const leftMidGeo = new THREE.TubeGeometry(leftMidCurve, 32, 0.0185, 16, false);
    const leftMidPipe = new THREE.Mesh(leftMidGeo, pipeMat);
    leftMidPipe.castShadow = true;
    this.midPipeGroup.add(leftMidPipe);

    // X-Pipe Central Crossover Window & Stamped Reinforcement Gusset Plate
    const xUnionBridgeGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.034, 16);
    xUnionBridgeGeo.rotateZ(Math.PI / 2);
    const xUnionBridge = new THREE.Mesh(xUnionBridgeGeo, pipeMat);
    xUnionBridge.position.set(0, 0.122, -0.02);
    this.midPipeGroup.add(xUnionBridge);

    // Stamped Structural Gusset Diamond between converging branches
    const gussetGeo = new THREE.BoxGeometry(0.075, 0.005, 0.07);
    const gusset = new THREE.Mesh(gussetGeo, gussetMat);
    gusset.position.set(0, 0.127, -0.02);
    this.midPipeGroup.add(gusset);

    // --- Dual Straight-Through Mid-Resonators (Z = -0.38 to -0.70) ---
    // Right Resonator (Bank 1)
    const rightResGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.30, 20);
    rightResGeo.rotateX(Math.PI / 2);
    const rightRes = new THREE.Mesh(rightResGeo, resonatorMat);
    rightRes.position.set(0.065, 0.125, -0.53);
    rightRes.castShadow = true;
    this.midPipeGroup.add(rightRes);

    // Right Resonator Entry & Exit Tapers
    const rResConeInGeo = new THREE.ConeGeometry(0.035, 0.025, 18, 1, true);
    rResConeInGeo.rotateX(-Math.PI / 2);
    const rResConeIn = new THREE.Mesh(rResConeInGeo, pipeMat);
    rResConeIn.position.set(0.065, 0.125, -0.37);
    this.midPipeGroup.add(rResConeIn);

    const rResConeOutGeo = new THREE.ConeGeometry(0.035, 0.025, 18, 1, true);
    rResConeOutGeo.rotateX(Math.PI / 2);
    const rResConeOut = new THREE.Mesh(rResConeOutGeo, pipeMat);
    rResConeOut.position.set(0.065, 0.125, -0.69);
    this.midPipeGroup.add(rResConeOut);

    // Left Resonator (Bank 2)
    const leftResGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.30, 20);
    leftResGeo.rotateX(Math.PI / 2);
    const leftRes = new THREE.Mesh(leftResGeo, resonatorMat);
    leftRes.position.set(-0.065, 0.125, -0.53);
    leftRes.castShadow = true;
    this.midPipeGroup.add(leftRes);

    const lResConeInGeo = new THREE.ConeGeometry(0.035, 0.025, 18, 1, true);
    lResConeInGeo.rotateX(-Math.PI / 2);
    const lResConeIn = new THREE.Mesh(lResConeInGeo, pipeMat);
    lResConeIn.position.set(-0.065, 0.125, -0.37);
    this.midPipeGroup.add(lResConeIn);

    const lResConeOutGeo = new THREE.ConeGeometry(0.035, 0.025, 18, 1, true);
    lResConeOutGeo.rotateX(Math.PI / 2);
    const lResConeOut = new THREE.Mesh(lResConeOutGeo, pipeMat);
    lResConeOut.position.set(-0.065, 0.125, -0.69);
    this.midPipeGroup.add(lResConeOut);

    // Pipes extending from resonators to rear axle disconnect joint (Z = -0.70 to -0.92)
    const postResRightPoints = [
      new THREE.Vector3(0.065, 0.125, -0.69),
      new THREE.Vector3(0.063, 0.165, -0.80),
      new THREE.Vector3(0.060, 0.216, -0.92),
    ];
    const postResRightGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(postResRightPoints), 12, 0.0185, 14, false);
    const postResRightPipe = new THREE.Mesh(postResRightGeo, pipeMat);
    postResRightPipe.castShadow = true;
    this.midPipeGroup.add(postResRightPipe);

    const postResLeftPoints = [
      new THREE.Vector3(-0.065, 0.125, -0.69),
      new THREE.Vector3(-0.063, 0.165, -0.80),
      new THREE.Vector3(-0.060, 0.216, -0.92),
    ];
    const postResLeftGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(postResLeftPoints), 12, 0.0185, 14, false);
    const postResLeftPipe = new THREE.Mesh(postResLeftGeo, pipeMat);
    postResLeftPipe.castShadow = true;
    this.midPipeGroup.add(postResLeftPipe);

    // Mid-pipe Chassis Hanger Bracket & Rubber Isolators (at Z = -0.82)
    const hangerRodGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 10);
    hangerRodGeo.rotateZ(Math.PI / 2);
    const hangerRod = new THREE.Mesh(hangerRodGeo, hangerMat);
    hangerRod.position.set(0, 0.180, -0.82);
    this.midPipeGroup.add(hangerRod);

    [-0.10, 0.10].forEach((hx) => {
      const isolatorGeo = new THREE.BoxGeometry(0.024, 0.038, 0.028);
      const isolator = new THREE.Mesh(isolatorGeo, rubberMat);
      isolator.position.set(hx, 0.200, -0.82);
      this.midPipeGroup.add(isolator);
    });

    // Transmission Tunnel Transverse Structural Stiffening Cross-Brace (Underneath exhaust pipes)
    const tunnelBraceGeo = new THREE.BoxGeometry(0.28, 0.008, 0.045);
    const tunnelBrace = new THREE.Mesh(tunnelBraceGeo, gussetMat);
    tunnelBrace.position.set(0, 0.092, 0.18);
    tunnelBrace.castShadow = true;
    this.midPipeGroup.add(tunnelBrace);
  }

  // =========================================================================
  // 3. Rear Axle Bypass Section (Around Differential & Rear Subframe)
  // =========================================================================
  private buildRearAxleBypass() {
    const pipeMat = this.materials.exhaustStainless;
    const flangeMat = this.materials.polishedSteel;
    const boltMat = this.materials.gearSteel;

    // Dual 2-bolt modular disconnect flanges at Z = -0.92
    [-0.060, 0.060].forEach((fx) => {
      const flangeGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.010, 16);
      flangeGeo.rotateX(Math.PI / 2);
      const flange = new THREE.Mesh(flangeGeo, flangeMat);
      flange.position.set(fx, 0.216, -0.92);
      flange.castShadow = true;
      this.rearAxleBypassGroup.add(flange);

      [-0.025, 0.025].forEach((bx) => {
        const boltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.020, 8);
        boltGeo.rotateX(Math.PI / 2);
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(fx + bx, 0.216, -0.92);
        this.rearAxleBypassGroup.add(bolt);
      });
    });

    // --- Right Rear Axle Bypass (around differential housing at Z = -1.324) ---
    const rightBypassPoints = [
      new THREE.Vector3(0.060, 0.216, -0.92),
      new THREE.Vector3(0.110, 0.225, -1.05),
      new THREE.Vector3(0.180, 0.245, -1.18),
      new THREE.Vector3(0.225, 0.268, -1.324), // Flared apex clearing right side of differential
      new THREE.Vector3(0.210, 0.278, -1.48),
      new THREE.Vector3(0.185, 0.282, -1.62),
      new THREE.Vector3(0.170, 0.285, -1.74),
      new THREE.Vector3(0.165, 0.286, -1.82), // Enters rear silencer right inlet
    ];
    const rightBypassCurve = new THREE.CatmullRomCurve3(rightBypassPoints);
    const rightBypassGeo = new THREE.TubeGeometry(rightBypassCurve, 36, 0.0185, 16, false);
    const rightBypassPipe = new THREE.Mesh(rightBypassGeo, pipeMat);
    rightBypassPipe.castShadow = true;
    this.rearAxleBypassGroup.add(rightBypassPipe);

    // --- Left Rear Axle Bypass (around differential housing at Z = -1.324) ---
    const leftBypassPoints = [
      new THREE.Vector3(-0.060, 0.216, -0.92),
      new THREE.Vector3(-0.110, 0.225, -1.05),
      new THREE.Vector3(-0.180, 0.245, -1.18),
      new THREE.Vector3(-0.225, 0.268, -1.324), // Flared apex clearing left side of differential
      new THREE.Vector3(-0.210, 0.278, -1.48),
      new THREE.Vector3(-0.185, 0.282, -1.62),
      new THREE.Vector3(-0.170, 0.285, -1.74),
      new THREE.Vector3(-0.165, 0.286, -1.82), // Enters rear silencer left inlet
    ];
    const leftBypassCurve = new THREE.CatmullRomCurve3(leftBypassPoints);
    const leftBypassGeo = new THREE.TubeGeometry(leftBypassCurve, 36, 0.0185, 16, false);
    const leftBypassPipe = new THREE.Mesh(leftBypassGeo, pipeMat);
    leftBypassPipe.castShadow = true;
    this.rearAxleBypassGroup.add(leftBypassPipe);
  }

  // =========================================================================
  // 4. Transverse M Rear Silencer (Backbox) & Active Acoustic Flap Valves
  // =========================================================================
  private buildTransverseRearSilencer() {
    const mufflerMat = this.materials.exhaustMufflerBody;
    const pipeMat = this.materials.exhaustStainless;
    const flangeMat = this.materials.polishedSteel;
    const actuatorMat = this.materials.valveActuator;
    const hangerMat = this.materials.gearSteel;
    const rubberMat = this.materials.rubberBootBlack;

    // Transverse Main Silencer Casing: Width = 0.72m, Depth = 0.28m, Height = 0.13m, centered at Z = -1.98, Y = 0.295
    const silencerBodyGeo = new THREE.BoxGeometry(0.72, 0.13, 0.28);
    const silencerBody = new THREE.Mesh(silencerBodyGeo, mufflerMat);
    silencerBody.position.set(0, 0.295, -1.98);
    silencerBody.castShadow = true;
    this.rearSilencerGroup.add(silencerBody);

    // Aerodynamic Beveled Bottom Contour
    const bottomCoverGeo = new THREE.CylinderGeometry(0.060, 0.060, 0.70, 18);
    bottomCoverGeo.rotateZ(Math.PI / 2);
    const bottomCover = new THREE.Mesh(bottomCoverGeo, mufflerMat);
    bottomCover.position.set(0, 0.245, -1.98);
    bottomCover.scale.set(1.0, 0.65, 1.8);
    bottomCover.castShadow = true;
    this.rearSilencerGroup.add(bottomCover);

    // Stamped Swage Stiffening Ribs across top of silencer
    [-0.09, 0, 0.09].forEach((rz) => {
      const ribGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.70, 12);
      ribGeo.rotateZ(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeo, flangeMat);
      rib.position.set(0, 0.362, -1.98 + rz);
      this.rearSilencerGroup.add(rib);
    });

    // Perimeter Rolled Seam Welds on Left and Right Silencer End-Caps
    [-0.36, 0.36].forEach((ex) => {
      const capSeamGeo = new THREE.TorusGeometry(0.065, 0.0045, 8, 16);
      capSeamGeo.rotateY(Math.PI / 2);
      const capSeam = new THREE.Mesh(capSeamGeo, flangeMat);
      capSeam.position.set(ex, 0.295, -1.98);
      capSeam.scale.set(1.0, 0.9, 1.8);
      this.rearSilencerGroup.add(capSeam);
    });

    // Dual Rear Silencer Rubber Chassis Hangers to Trunk Unibody
    [-0.24, 0.24].forEach((hx) => {
      const hangerPinGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8);
      const hangerPin = new THREE.Mesh(hangerPinGeo, hangerMat);
      hangerPin.position.set(hx, 0.375, -1.96);
      this.rearSilencerGroup.add(hangerPin);

      const rubberBlockGeo = new THREE.BoxGeometry(0.028, 0.035, 0.028);
      const rubberBlock = new THREE.Mesh(rubberBlockGeo, rubberMat);
      rubberBlock.position.set(hx, 0.405, -1.96);
      this.rearSilencerGroup.add(rubberBlock);
    });

    // --- Active Electronic Acoustic Flap Valve Actuators ---
    // Valve actuators mounted on the outer exit pipes (X = -0.335 and +0.335)
    const buildFlapValveAssembly = (side: 'left' | 'right', x: number) => {
      const valveGroup = new THREE.Group();
      valveGroup.position.set(x, 0.295, -2.16);

      // Stainless valve sleeve
      const valveSleeveGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.045, 16);
      valveSleeveGeo.rotateX(Math.PI / 2);
      const valveSleeve = new THREE.Mesh(valveSleeveGeo, flangeMat);
      valveGroup.add(valveSleeve);

      // Electronic Stepper Servomotor Body
      const motorGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.040, 14);
      const motor = new THREE.Mesh(motorGeo, actuatorMat);
      motor.position.set(side === 'left' ? -0.025 : 0.025, 0.024, 0);
      motor.castShadow = true;
      valveGroup.add(motor);

      // Aluminum cooling fin heat sink cap
      const finCapGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.008, 14);
      const finCap = new THREE.Mesh(finCapGeo, flangeMat);
      finCap.position.set(side === 'left' ? -0.025 : 0.025, 0.045, 0);
      valveGroup.add(finCap);

      // Electrical Connector Plug
      const plugGeo = new THREE.BoxGeometry(0.009, 0.011, 0.014);
      const plug = new THREE.Mesh(plugGeo, this.materials.intakePlastic);
      plug.position.set(side === 'left' ? -0.034 : 0.034, 0.020, 0.012);
      valveGroup.add(plug);

      // Rotating Butterfly Valve Disc
      const discGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.002, 16);
      const disc = new THREE.Mesh(discGeo, flangeMat);
      const spindleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.036, 8);
      const spindle = new THREE.Mesh(spindleGeo, hangerMat);
      spindle.add(disc);

      if (side === 'left') {
        this.leftValveDisc = spindle;
      } else {
        this.rightValveDisc = spindle;
      }

      valveGroup.add(spindle);
      return valveGroup;
    };

    this.rearSilencerGroup.add(buildFlapValveAssembly('left', -0.335));
    this.rearSilencerGroup.add(buildFlapValveAssembly('right', 0.335));

    // Silencer Outlet Stub Pipes feeding the quad tailpipes
    [-0.335, -0.225, 0.225, 0.335].forEach((sx) => {
      const stubGeo = new THREE.CylinderGeometry(0.0185, 0.0185, 0.06, 14);
      stubGeo.rotateX(Math.PI / 2);
      const stub = new THREE.Mesh(stubGeo, pipeMat);
      stub.position.set(sx, 0.286, -2.15);
      this.rearSilencerGroup.add(stub);
    });
  }


  // =========================================================================
  // 6. Underbody Dimpled Aluminum Thermal Heat Shields
  // =========================================================================
  private buildUnderbodyHeatShields() {
    const shieldMat = this.materials.exhaustHeatShieldSilver;

    // 1. Transmission Tunnel Arch Heat Shield (Runs above mid-pipes, behind transmission)
    const tunnelShieldPoints = [
      new THREE.Vector3(0, 0.24, 0.15),
      new THREE.Vector3(0, 0.23, -0.10),
      new THREE.Vector3(0, 0.23, -0.45),
      new THREE.Vector3(0, 0.24, -0.85),
    ];
    const tunnelShieldCurve = new THREE.CatmullRomCurve3(tunnelShieldPoints);
    const tunnelShieldGeo = new THREE.TubeGeometry(tunnelShieldCurve, 20, 0.11, 12, false);
    tunnelShieldGeo.scale(1.2, 0.45, 1.0);
    const tunnelShield = new THREE.Mesh(tunnelShieldGeo, shieldMat);
    tunnelShield.position.set(0, 0.03, 0);
    this.heatShieldsGroup.add(tunnelShield);

    // 2. Rear Axle Protective Curved Heat Shield
    const rearShieldGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.48, 16, 1, true, 0, Math.PI);
    rearShieldGeo.rotateZ(Math.PI / 2);
    rearShieldGeo.rotateY(Math.PI);
    const rearShield = new THREE.Mesh(rearShieldGeo, shieldMat);
    rearShield.position.set(0, 0.28, -1.45);
    rearShield.scale.set(1.1, 0.4, 0.8);
    this.heatShieldsGroup.add(rearShield);

    // 3. Trunk Floor Heat Shield (Above the Rear Transverse Silencer)
    const trunkShieldGeo = new THREE.BoxGeometry(0.74, 0.005, 0.38);
    const trunkShield = new THREE.Mesh(trunkShieldGeo, shieldMat);
    trunkShield.position.set(0, 0.38, -1.98);
    this.heatShieldsGroup.add(trunkShield);
  }

  // =========================================================================
  // Subsystem Focus & Visibility Control
  // =========================================================================
  public setSubsystemFocus(subsystemId: SubsystemId) {
    if (subsystemId === 'all') {
      this.group.visible = true;
      this.frontSectionGroup.visible = true;
      this.midPipeGroup.visible = true;
      this.rearAxleBypassGroup.visible = true;
      this.rearSilencerGroup.visible = true;
      this.heatShieldsGroup.visible = true;
    } else if (subsystemId === 'rolling_chassis') {
      this.group.visible = true;
      this.frontSectionGroup.visible = true;
      this.midPipeGroup.visible = true;
      this.rearAxleBypassGroup.visible = true;
      this.rearSilencerGroup.visible = true;
      this.heatShieldsGroup.visible = false;
    } else if (subsystemId === 'exhaust') {
      this.group.visible = true;
      this.frontSectionGroup.visible = true;
      this.midPipeGroup.visible = true;
      this.rearAxleBypassGroup.visible = true;
      this.rearSilencerGroup.visible = true;
      this.heatShieldsGroup.visible = false;
    } else {
      this.group.visible = false;
    }
  }

  // =========================================================================
  // Dynamic Kinematics, Exploded View, & Active Flap Valve Control
  // =========================================================================
  public update(
    engineRpm: number,
    throttle: number,
    explodeFactor: number,
    isCutaway: boolean = false
  ) {
    // 1. Dynamic Active Flap Valve Disc Rotation
    const isValveOpen = throttle > 0.35 || engineRpm > 3400;
    const targetValveAngle = isValveOpen ? Math.PI / 2 : 0;

    if (this.leftValveDisc) {
      this.leftValveDisc.rotation.x = THREE.MathUtils.lerp(
        this.leftValveDisc.rotation.x,
        targetValveAngle,
        0.15
      );
    }
    if (this.rightValveDisc) {
      this.rightValveDisc.rotation.x = THREE.MathUtils.lerp(
        this.rightValveDisc.rotation.x,
        targetValveAngle,
        0.15
      );
    }

    // 2. High-RPM Acoustic Micro-Vibration
    if (engineRpm > 1000) {
      const vib = Math.sin(Date.now() * 0.04) * (engineRpm / 7200) * 0.0006;
      this.group.position.y = vib;
    } else {
      this.group.position.y = 0;
    }

    // 3. Exploded View Kinematic Separation
    if (explodeFactor > 0.001) {
      this.frontSectionGroup.position.set(0, -explodeFactor * 0.08, explodeFactor * 0.15);
      this.midPipeGroup.position.set(0, -explodeFactor * 0.28, -explodeFactor * 0.05);
      this.rearAxleBypassGroup.position.set(0, -explodeFactor * 0.22, -explodeFactor * 0.15);
      this.rearSilencerGroup.position.set(0, -explodeFactor * 0.12, -explodeFactor * 0.30);
      this.heatShieldsGroup.position.set(0, explodeFactor * 0.15, 0);
    } else {
      this.frontSectionGroup.position.set(0, 0, 0);
      this.midPipeGroup.position.set(0, 0, 0);
      this.rearAxleBypassGroup.position.set(0, 0, 0);
      this.rearSilencerGroup.position.set(0, 0, 0);
      this.heatShieldsGroup.position.set(0, 0, 0);
    }
  }
}
