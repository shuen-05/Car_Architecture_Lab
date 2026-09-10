import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';

export class DrivetrainAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  private rearCarbonPropShaft: THREE.Group;
  private frontPropShaft: THREE.Group;
  private transferCase: THREE.Group;
  private frontDifferential: THREE.Group;

  // Granular ATC13-1 Transfer Case sub-assemblies for exploded view and kinematics
  private tcCasingGroup: THREE.Group;
  private tcActuatorGroup: THREE.Group;
  private tcInternalsGroup: THREE.Group;

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'MxDriveDrivetrainAssembly';

    this.rearCarbonPropShaft = new THREE.Group();
    this.frontPropShaft = new THREE.Group();
    this.transferCase = new THREE.Group();
    this.frontDifferential = new THREE.Group();

    this.tcCasingGroup = new THREE.Group();
    this.tcActuatorGroup = new THREE.Group();
    this.tcInternalsGroup = new THREE.Group();

    this.transferCase.add(
      this.tcCasingGroup,
      this.tcActuatorGroup,
      this.tcInternalsGroup
    );

    this.buildMxDriveSystem();

    this.group.add(
      this.transferCase,
      this.rearCarbonPropShaft,
      this.frontPropShaft,
      this.frontDifferential
    );

    // Position along vehicle center tunnel (raised to match engine & transmission output at Y = 0.32m)
    this.group.position.set(0, 0.32, 0.0);
  }

  private buildMxDriveSystem() {
    this.buildTransferCase();
    this.buildPropellerShafts();
    this.buildFrontDifferential();
  }

  /**
   * BMW / Magna ATC13-1 Electronically Controlled Multi-Plate Transfer Case (Verteilergetriebe)
   * Spans from transmission tail adapter (Z = 0.22) to rear CFRP driveshaft (Z = 0.08)
   */
  private buildTransferCase() {
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const gearSteel = this.materials.gearSteel;
    const frictionMat = this.materials.brassBronze;
    const blackMat = this.materials.subframeBlack;
    const rubberMat = this.materials.rubberBootBlack;

    // =========================================================================
    // 1. HIGH-PRESSURE DIE-CAST ALUMINUM CASING (Outer Housing & Chain Drop)
    // =========================================================================

    // A. Front Transmission Mating Flange (mating directly to ZF 8HP76 at Z = 0.22)
    const frontFlangeGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.018, 24);
    frontFlangeGeo.rotateX(Math.PI / 2);
    const frontFlange = new THREE.Mesh(frontFlangeGeo, aluMat);
    frontFlange.position.set(0, 0, 0.22);
    this.tcCasingGroup.add(frontFlange);

    // 6 Perimeter Transmission-to-Transfer Case E-Torx Bolt Bosses
    for (let b = 0; b < 6; b++) {
      const bAngle = (b / 6) * Math.PI * 2 + 0.25;
      const bX = Math.cos(bAngle) * 0.076;
      const bY = Math.sin(bAngle) * 0.076;

      const bossGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.016, 12);
      bossGeo.rotateX(Math.PI / 2);
      const boss = new THREE.Mesh(bossGeo, aluMat);
      boss.position.set(bX, bY, 0.222);
      this.tcCasingGroup.add(boss);

      const boltGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.01, 8);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, steelMat);
      bolt.position.set(bX, bY, 0.231);
      this.tcCasingGroup.add(bolt);
    }

    // B. Main Clutch Barrel Housing (Cutaway aperture on top-right to reveal internals)
    // Modeled with an open sector on the upper-right flank to expose clutch discs and mainshaft
    const drumGeo = new THREE.CylinderGeometry(0.082, 0.078, 0.11, 28, 1, false, Math.PI * 1.05, Math.PI * 1.35);
    drumGeo.rotateX(Math.PI / 2);
    const mainDrum = new THREE.Mesh(drumGeo, aluMat);
    mainDrum.position.set(0, 0, 0.165);
    this.tcCasingGroup.add(mainDrum);

    // Cutaway lip beveled rim highlights
    const rimBevelGeo = new THREE.BoxGeometry(0.006, 0.006, 0.11);
    const rimBevel1 = new THREE.Mesh(rimBevelGeo, steelMat);
    rimBevel1.position.set(0.080, -0.012, 0.165);
    this.tcCasingGroup.add(rimBevel1);

    const rimBevel2 = new THREE.Mesh(rimBevelGeo, steelMat);
    rimBevel2.position.set(-0.012, 0.080, 0.165);
    this.tcCasingGroup.add(rimBevel2);

    // C. Rear Extension Snout & Output Bearing Carrier (Z = 0.11 down to Z = 0.08)
    const snoutGeo = new THREE.CylinderGeometry(0.062, 0.050, 0.045, 24);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, aluMat);
    snout.position.set(0, 0, 0.098);
    this.tcCasingGroup.add(snout);

    // Viton rubber rear output shaft oil seal
    const sealGeo = new THREE.TorusGeometry(0.046, 0.005, 12, 24);
    const seal = new THREE.Mesh(sealGeo, rubberMat);
    seal.position.set(0, 0, 0.085);
    this.tcCasingGroup.add(seal);

    // D. Lateral Chain Drop Casing (Driver side: X = -0.02 to -0.13, Y = 0.0 to -0.04)
    // Lower front output shaft tunnel (centered at X = -0.12, Y = -0.04, matching frontPropShaft)
    const frontOutputTunnelGeo = new THREE.CylinderGeometry(0.046, 0.044, 0.12, 20);
    frontOutputTunnelGeo.rotateX(Math.PI / 2);
    const frontOutputTunnel = new THREE.Mesh(frontOutputTunnelGeo, aluMat);
    frontOutputTunnel.position.set(-0.12, -0.04, 0.17);
    this.tcCasingGroup.add(frontOutputTunnel);

    // Lateral cast aluminum bridge / web connecting main drum to front output tunnel
    const bridgeGeo = new THREE.BoxGeometry(0.11, 0.075, 0.11);
    const bridge = new THREE.Mesh(bridgeGeo, aluMat);
    bridge.position.set(-0.065, -0.02, 0.165);
    bridge.rotation.z = 0.32; // Angled along the center-to-front-shaft drop vector
    this.tcCasingGroup.add(bridge);

    // Lower Chain Sump Bulge & Oil Reservoir
    const sumpGeo = new THREE.BoxGeometry(0.09, 0.035, 0.10);
    const sump = new THREE.Mesh(sumpGeo, aluMat);
    sump.position.set(-0.075, -0.065, 0.165);
    this.tcCasingGroup.add(sump);

    // 4 Sump Longitudinal Heat Dissipation Cooling Fins
    for (let f = 0; f < 4; f++) {
      const finX = -0.11 + f * 0.022;
      const finGeo = new THREE.BoxGeometry(0.0035, 0.008, 0.09);
      const fin = new THREE.Mesh(finGeo, aluMat);
      fin.position.set(finX, -0.084, 0.165);
      this.tcCasingGroup.add(fin);
    }

    // Magnetic fluid drain plug at bottom of chain sump
    const drainGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.008, 12);
    const drainPlug = new THREE.Mesh(drainGeo, steelMat);
    drainPlug.position.set(-0.075, -0.086, 0.15);
    this.tcCasingGroup.add(drainPlug);

    // Hex fluid filler plug on passenger side
    const fillPlugGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.010, 6);
    fillPlugGeo.rotateZ(Math.PI / 2);
    const fillPlug = new THREE.Mesh(fillPlugGeo, steelMat);
    fillPlug.position.set(0.078, -0.01, 0.16);
    this.tcCasingGroup.add(fillPlug);

    // Copper crush washer for fill plug
    const fillWasherGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.002, 16);
    fillWasherGeo.rotateZ(Math.PI / 2);
    const fillWasher = new THREE.Mesh(fillWasherGeo, frictionMat);
    fillWasher.position.set(0.074, -0.01, 0.16);
    this.tcCasingGroup.add(fillWasher);

    // Front Output Bearing Retainer & Companion Flange (Z = 0.22, X = -0.12, Y = -0.04)
    const frontBearingCollarGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.016, 20);
    frontBearingCollarGeo.rotateX(Math.PI / 2);
    const frontBearingCollar = new THREE.Mesh(frontBearingCollarGeo, aluMat);
    frontBearingCollar.position.set(-0.12, -0.04, 0.222);
    this.tcCasingGroup.add(frontBearingCollar);

    const frontFlangeMeshGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.02, 16);
    frontFlangeMeshGeo.rotateX(Math.PI / 2);
    const frontFlangeMesh = new THREE.Mesh(frontFlangeMeshGeo, steelMat);
    frontFlangeMesh.position.set(-0.12, -0.04, 0.23);
    this.tcCasingGroup.add(frontFlangeMesh);

    // E. Structural Reinforcement Stiffening Ribs along Casing
    for (let r = 0; r < 4; r++) {
      const ribGeo = new THREE.BoxGeometry(0.004, 0.012, 0.10);
      const rib = new THREE.Mesh(ribGeo, aluMat);
      rib.position.set(-0.03 + r * 0.028, -0.065, 0.165);
      rib.rotation.z = -0.25;
      this.tcCasingGroup.add(rib);
    }

    // Upper structural webbing between main drum and chain case
    const upperGussetGeo = new THREE.BoxGeometry(0.005, 0.04, 0.09);
    const upperGusset = new THREE.Mesh(upperGussetGeo, aluMat);
    upperGusset.position.set(-0.05, 0.055, 0.165);
    upperGusset.rotation.z = -0.55;
    this.tcCasingGroup.add(upperGusset);

    // F. Perimeter Split Flange & 8 E-Torx Case Assembly Bolts
    for (let cb = 0; cb < 8; cb++) {
      const t = cb / 7;
      const boltX = -0.13 + t * 0.18;
      const boltY = -0.06 + Math.sin(t * Math.PI) * 0.12;
      const caseBoltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.012, 8);
      caseBoltGeo.rotateX(Math.PI / 2);
      const caseBolt = new THREE.Mesh(caseBoltGeo, steelMat);
      caseBolt.position.set(boltX, boltY, 0.165);
      this.tcCasingGroup.add(caseBolt);
    }

    // G. Fluid Pressure Breather / Vent Assembly on Top
    const ventElbowGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.015, 8);
    const ventElbow = new THREE.Mesh(ventElbowGeo, frictionMat);
    ventElbow.position.set(-0.03, 0.084, 0.18);
    this.tcCasingGroup.add(ventElbow);

    const ventHoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.03, 0.09, 0.18),
      new THREE.Vector3(-0.03, 0.11, 0.17),
      new THREE.Vector3(-0.02, 0.115, 0.14),
    ]);
    const ventHoseGeo = new THREE.TubeGeometry(ventHoseCurve, 12, 0.0035, 8, false);
    const ventHose = new THREE.Mesh(ventHoseGeo, rubberMat);
    this.tcCasingGroup.add(ventHose);

    const ventCapGeo = new THREE.CylinderGeometry(0.007, 0.005, 0.012, 12);
    ventCapGeo.rotateX(Math.PI / 2);
    const ventCap = new THREE.Mesh(ventCapGeo, blackMat);
    ventCap.position.set(-0.02, 0.115, 0.134);
    this.tcCasingGroup.add(ventCap);

    // H. BMW M Identification Data Plaque
    const idPlateGeo = new THREE.BoxGeometry(0.035, 0.018, 0.002);
    const idPlate = new THREE.Mesh(idPlateGeo, steelMat);
    idPlate.position.set(-0.06, 0.04, 0.108);
    idPlate.rotation.y = 0.2;
    this.tcCasingGroup.add(idPlate);

    // =========================================================================
    // 2. ELECTRO-MECHANICAL CLUTCH ACTUATOR SERVO MOTOR UNIT
    // =========================================================================

    // Worm-Gear Reduction Housing (Cast aluminum gearbox mounted on transfer case)
    const gearBoxGeo = new THREE.BoxGeometry(0.065, 0.045, 0.055);
    const gearBox = new THREE.Mesh(gearBoxGeo, aluMat);
    gearBox.position.set(-0.10, 0.065, 0.17);
    this.tcActuatorGroup.add(gearBox);

    // 3 Actuator-to-Case Torx Retaining Bolts
    for (let ab = 0; ab < 3; ab++) {
      const angle = (ab / 3) * Math.PI * 2;
      const abBoltGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.008, 6);
      abBoltGeo.rotateZ(Math.PI / 2);
      const abBolt = new THREE.Mesh(abBoltGeo, steelMat);
      abBolt.position.set(-0.134, 0.065 + Math.sin(angle) * 0.016, 0.17 + Math.cos(angle) * 0.016);
      this.tcActuatorGroup.add(abBolt);
    }

    // Cylindrical High-Speed DC Stepper / Servo Motor Body (Black anodized)
    const motorCylGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.09, 20);
    const motorCyl = new THREE.Mesh(motorCylGeo, blackMat);
    motorCyl.position.set(-0.10, 0.125, 0.17);
    this.tcActuatorGroup.add(motorCyl);

    // 10 Longitudinal Heatsink Cooling Fins around the motor casing
    for (let finIdx = 0; finIdx < 10; finIdx++) {
      const fAngle = (finIdx / 10) * Math.PI * 2;
      const fX = -0.10 + Math.cos(fAngle) * 0.033;
      const fZ = 0.17 + Math.sin(fAngle) * 0.033;
      const mFinGeo = new THREE.BoxGeometry(0.002, 0.082, 0.004);
      const mFin = new THREE.Mesh(mFinGeo, blackMat);
      mFin.position.set(fX, 0.125, fZ);
      mFin.rotation.y = -fAngle;
      this.tcActuatorGroup.add(mFin);
    }

    // Motor Stamped Steel Top End-Cap & Bearing Boss
    const capGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.008, 20);
    const cap = new THREE.Mesh(capGeo, steelMat);
    cap.position.set(-0.10, 0.172, 0.17);
    this.tcActuatorGroup.add(cap);

    const capBossGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.006, 16);
    const capBoss = new THREE.Mesh(capBossGeo, blackMat);
    capBoss.position.set(-0.10, 0.177, 0.17);
    this.tcActuatorGroup.add(capBoss);

    // Weatherproof 4-Pin Electrical Connector Socket (Deutsch style)
    const socketGeo = new THREE.BoxGeometry(0.024, 0.022, 0.028);
    const socket = new THREE.Mesh(socketGeo, blackMat);
    socket.position.set(-0.068, 0.135, 0.17);
    this.tcActuatorGroup.add(socket);

    // Flexible Corrugated Wire Harness Conduit (Routing forward along transmission tunnel)
    const harnessCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.055, 0.135, 0.17),
      new THREE.Vector3(-0.04, 0.12, 0.20),
      new THREE.Vector3(-0.04, 0.10, 0.26),
      new THREE.Vector3(-0.05, 0.07, 0.32),
    ]);
    const harnessGeo = new THREE.TubeGeometry(harnessCurve, 16, 0.0045, 8, false);
    const harness = new THREE.Mesh(harnessGeo, rubberMat);
    this.tcActuatorGroup.add(harness);

    // 2 Plastic Harness Zip-Tie Retainers
    for (const clipZ of [0.21, 0.28]) {
      const clipGeo = new THREE.BoxGeometry(0.008, 0.012, 0.006);
      const clip = new THREE.Mesh(clipGeo, blackMat);
      clip.position.set(-0.04, 0.105, clipZ);
      this.tcActuatorGroup.add(clip);
    }

    // =========================================================================
    // 3. INTERNAL CLUTCH PACK & CHAIN DROP MECHANICS (Visible inside cutaway)
    // =========================================================================

    // A. Main Center Through-Shaft (Transfers 100% torque to rear carbon driveshaft)
    const mainShaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.165, 20);
    mainShaftGeo.rotateX(Math.PI / 2);
    const mainShaft = new THREE.Mesh(mainShaftGeo, steelMat);
    mainShaft.position.set(0, 0, 0.155);
    this.tcInternalsGroup.add(mainShaft);

    // Hardened Spline Ridges on Main Shaft
    for (let s = 0; s < 8; s++) {
      const sAngle = (s / 8) * Math.PI * 2;
      const sGeo = new THREE.BoxGeometry(0.002, 0.0035, 0.09);
      const spline = new THREE.Mesh(sGeo, steelMat);
      spline.position.set(Math.cos(sAngle) * 0.022, Math.sin(sAngle) * 0.022, 0.155);
      spline.rotation.z = sAngle;
      this.tcInternalsGroup.add(spline);
    }

    // B. Clutch Hub & Vented Outer Clutch Drum
    const clutchDrumGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.055, 24, 1, true);
    clutchDrumGeo.rotateX(Math.PI / 2);
    const clutchDrum = new THREE.Mesh(clutchDrumGeo, gearSteel);
    clutchDrum.position.set(0, 0, 0.165);
    this.tcInternalsGroup.add(clutchDrum);

    // 7 Interleaved Multi-Plate Wet Clutch Discs (4 Sintered Friction Discs + 3 Steel Plates)
    const clutchZPositions = [0.145, 0.151, 0.157, 0.163, 0.169, 0.175, 0.181];
    clutchZPositions.forEach((zPos, idx) => {
      const isFrictionDisc = idx % 2 === 0;
      const discGeo = new THREE.CylinderGeometry(
        0.064,
        0.064,
        isFrictionDisc ? 0.0035 : 0.0022,
        24
      );
      discGeo.rotateX(Math.PI / 2);
      const disc = new THREE.Mesh(discGeo, isFrictionDisc ? frictionMat : steelMat);
      disc.position.set(0, 0, zPos);
      this.tcInternalsGroup.add(disc);

      // Detail: Radial oil flow slots on friction discs
      if (isFrictionDisc) {
        for (let sl = 0; sl < 6; sl++) {
          const slAngle = (sl / 6) * Math.PI * 2;
          const slotGeo = new THREE.BoxGeometry(0.025, 0.002, 0.004);
          const slot = new THREE.Mesh(slotGeo, blackMat);
          slot.position.set(Math.cos(slAngle) * 0.045, Math.sin(slAngle) * 0.045, zPos);
          slot.rotation.z = slAngle;
          this.tcInternalsGroup.add(slot);
        }
      }
    });

    // C. Ball-Ramp Pressure Expander Thrust Ring
    const rampRingGeo = new THREE.CylinderGeometry(0.066, 0.066, 0.010, 24);
    rampRingGeo.rotateX(Math.PI / 2);
    const rampRing = new THREE.Mesh(rampRingGeo, steelMat);
    rampRing.position.set(0, 0, 0.192);
    this.tcInternalsGroup.add(rampRing);

    // 3 Hardened Chrome Steel Ball Bearings in ramp ramps
    for (let b = 0; b < 3; b++) {
      const bAngle = (b / 3) * Math.PI * 2;
      const ballGeo = new THREE.SphereGeometry(0.0055, 12, 12);
      const ball = new THREE.Mesh(ballGeo, steelMat);
      ball.position.set(Math.cos(bAngle) * 0.048, Math.sin(bAngle) * 0.048, 0.194);
      this.tcInternalsGroup.add(ball);
    }

    // D. Hy-Vo Silent Drive Chain & Dual Sprockets
    // Upper drive sprocket on clutch drum (centered at 0, 0, Z = 0.135, spins on central axis)
    const upperSprocketGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.016, 20);
    upperSprocketGeo.rotateX(Math.PI / 2);
    const upperSprocket = new THREE.Mesh(upperSprocketGeo, gearSteel);
    upperSprocket.position.set(0, 0, 0.135);
    this.tcInternalsGroup.add(upperSprocket);

    // Multi-Link Hy-Vo Silent Drive Chain (Stationary loop securely housed inside lateral chain drop casing)
    // Top span
    const topSpanGeo = new THREE.BoxGeometry(0.128, 0.014, 0.015);
    const topSpan = new THREE.Mesh(topSpanGeo, steelMat);
    topSpan.position.set(-0.06, 0.016, 0.135);
    topSpan.rotation.z = 0.32;
    this.tcCasingGroup.add(topSpan);

    // Bottom span
    const bottomSpanGeo = new THREE.BoxGeometry(0.128, 0.014, 0.015);
    const bottomSpan = new THREE.Mesh(bottomSpanGeo, steelMat);
    bottomSpan.position.set(-0.06, -0.056, 0.135);
    bottomSpan.rotation.z = 0.32;
    this.tcCasingGroup.add(bottomSpan);

    // Curved chain wraps around upper and lower sprocket positions
    const upperWrapGeo = new THREE.TorusGeometry(0.038, 0.007, 8, 16, Math.PI);
    const upperWrap = new THREE.Mesh(upperWrapGeo, steelMat);
    upperWrap.position.set(0, 0, 0.135);
    upperWrap.rotation.z = 1.88;
    this.tcCasingGroup.add(upperWrap);

    const lowerWrapGeo = new THREE.TorusGeometry(0.038, 0.007, 8, 16, Math.PI);
    const lowerWrap = new THREE.Mesh(lowerWrapGeo, steelMat);
    lowerWrap.position.set(-0.12, -0.04, 0.135);
    lowerWrap.rotation.z = -1.26;
    this.tcCasingGroup.add(lowerWrap);
  }

  /**
   * Front & Rear Propeller Shafts
   */
  private buildPropellerShafts() {
    const carbonMat = this.materials.carbonFiber;
    const steelMat = this.materials.polishedSteel;

    // 1. Single-Piece CFRP Rear Propeller Shaft (Z = 0.08 down to Z = -1.18)
    const shaftLength = 1.26;
    const rearTubeGeo = new THREE.CylinderGeometry(0.042, 0.042, shaftLength, 24);
    rearTubeGeo.rotateX(Math.PI / 2);
    const rearTube = new THREE.Mesh(rearTubeGeo, carbonMat);
    rearTube.position.set(0, 0, -0.55);
    this.rearCarbonPropShaft.add(rearTube);

    // Front & rear companion flanges with 3-bolt Guibo flex disc sleeves
    for (const zEnd of [0.08, -1.18]) {
      const flangeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.035, 20);
      flangeGeo.rotateX(Math.PI / 2);
      const flange = new THREE.Mesh(flangeGeo, steelMat);
      flange.position.set(0, 0, zEnd);
      this.rearCarbonPropShaft.add(flange);

      // 3 Forged sleeve bolt bosses
      for (let s = 0; s < 3; s++) {
        const sAngle = (s / 3) * Math.PI * 2;
        const bossGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.038, 10);
        bossGeo.rotateX(Math.PI / 2);
        const bossMesh = new THREE.Mesh(bossGeo, steelMat);
        bossMesh.position.set(Math.cos(sAngle) * 0.048, Math.sin(sAngle) * 0.048, zEnd);
        this.rearCarbonPropShaft.add(bossMesh);
      }
    }

    // 2. Front Propeller Shaft (Runs forward from transfer case Z = 0.22 to front differential Z = 1.535)
    // Centered at X = -0.12, Y = -0.04 so rotation around Z spins on its own axis!
    this.frontPropShaft.position.set(-0.12, -0.04, 0);

    const frontShaftLen = 1.315;
    const frontTubeGeo = new THREE.CylinderGeometry(0.028, 0.028, frontShaftLen, 20);
    frontTubeGeo.rotateX(Math.PI / 2);
    const frontTube = new THREE.Mesh(frontTubeGeo, steelMat);
    frontTube.position.set(0, 0, 0.8775);
    this.frontPropShaft.add(frontTube);

    // Driven lower chain sprocket inside transfer case (Z = 0.135, spins on front shaft axis)
    const lowerSprocketGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.016, 20);
    lowerSprocketGeo.rotateX(Math.PI / 2);
    const lowerSprocket = new THREE.Mesh(lowerSprocketGeo, this.materials.gearSteel);
    lowerSprocket.position.set(0, 0, 0.135);
    this.frontPropShaft.add(lowerSprocket);

    // Forged Universal Joint / CV Yoke at Transfer Case Output (Z = 0.23)
    const uJointYokeGeo = new THREE.CylinderGeometry(0.036, 0.030, 0.035, 16);
    uJointYokeGeo.rotateX(Math.PI / 2);
    const uJointYoke = new THREE.Mesh(uJointYokeGeo, steelMat);
    uJointYoke.position.set(0, 0, 0.23);
    this.frontPropShaft.add(uJointYoke);

    // Front Splined Slip-Yoke at Front Differential (Z = 1.52)
    const slipYokeGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.04, 16);
    slipYokeGeo.rotateX(Math.PI / 2);
    const slipYoke = new THREE.Mesh(slipYokeGeo, steelMat);
    slipYoke.position.set(0, 0, 1.52);
    this.frontPropShaft.add(slipYoke);
  }

  /**
   * Front Axle Differential Unit
   */
  private buildFrontDifferential() {
    const castMat = this.materials.castIron;
    const steelMat = this.materials.polishedSteel;

    const frontDiffGeo = new THREE.SphereGeometry(0.10, 20, 16);
    const frontDiff = new THREE.Mesh(frontDiffGeo, castMat);
    frontDiff.position.set(-0.08, 0.02, 1.535);
    this.frontDifferential.add(frontDiff);

    // Front left & right half-shaft outputs
    for (const side of [-1, 1]) {
      const hsGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.65, 16);
      hsGeo.rotateZ(Math.PI / 2);
      const hs = new THREE.Mesh(hsGeo, steelMat);
      hs.position.set(side * 0.40, 0.02, 1.535);
      this.frontDifferential.add(hs);
    }
  }

  public update(propShaftRpm: number, explodeFactor: number) {
    const dt = 0.016;
    const rotationAdvance = (propShaftRpm / 60) * (2 * Math.PI) * dt;

    // Rotate rear carbon shaft, front driveshaft, and transfer case internals
    this.rearCarbonPropShaft.rotation.z += rotationAdvance;
    this.frontPropShaft.rotation.z += rotationAdvance;
    this.tcInternalsGroup.rotation.z += rotationAdvance;

    // Exploded view kinematics
    this.rearCarbonPropShaft.position.z = -explodeFactor * 0.25;
    this.frontPropShaft.position.z = explodeFactor * 0.25;
    this.frontDifferential.position.y = -explodeFactor * 0.22;

    // Transfer Case Exploded separation
    this.tcCasingGroup.position.x = -explodeFactor * 0.12;
    this.tcActuatorGroup.position.y = explodeFactor * 0.16;
    this.tcInternalsGroup.position.x = explodeFactor * 0.08;
  }
}
