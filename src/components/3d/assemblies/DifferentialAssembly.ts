import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { WheelModel } from './WheelModel';

/**
 * BMW M3 Competition Touring (G81) - Active M Differential (HAG 215 / GHAS)
 *
 * Engineering Features:
 * 1. Asymmetric Nodular Cast Iron Carrier Housing (The "Pumpkin"):
 *    - Bulged ring gear housing with structural longitudinal and radial stiffening ribs.
 *    - Forward pinion quill/snout with bearing retainer collar and companion input flange.
 *    - Transverse axle output bearing journals with forged drive flanges and 6-bolt circles.
 *    - Dual front rubber-metal subframe mounting ears.
 *    - Hexagonal service oil fill and magnetic drain plugs + oil temp sensor.
 * 2. High-Pressure Die-Cast Aluminum Finned Cooling Cover:
 *    - 7 deep horizontal aerodynamic cooling fins with central vertical spine.
 *    - Perimeter mating flange with 10 high-tensile steel hex bolts and lock washers.
 *    - Large rear asymmetric hydraulic subframe mounting eyelet with steel sleeve.
 *    - Top pressure-relief breather vent cap.
 * 3. GHAS (Geregeltes Hinterachsgetriebe) Electronic Actuator Module:
 *    - Cylindrical DC servomotor with black anodized cooling grooves.
 *    - Compact cycloidal/planetary reduction gearbox casing.
 *    - Ball-ramp actuation pushrod and weather-sealed dual-conductor wiring harness.
 * 4. Internal Mechanical Core (Visible in Cutaway & Exploded Views):
 *    - 47-tooth spiral-beveled hypoid crown wheel (ring gear) with 10 ring gear bolts.
 *    - Hypoid drive pinion with tapered roller bearings and hypoid offset.
 *    - Differential carrier cage with cross-pin and 4 bevel spider pinions.
 *    - Active M multi-plate wet clutch pack (carbon friction discs, steel reaction plates, ball-ramp expander).
 * 5. Motorsport M Performance Half-Shafts & CV Joints:
 *    - Inner CV plunge joints with machined steel tulips and 6-bolt Torx flanges.
 *    - Multi-convoluted accordion rubber bellows boots with crimped stainless Oetiker clamps.
 *    - Asymmetric stepped torsion axle shafts (thickened right bar to eliminate wheel-hop).
 *    - Outer fixed Rzeppa CV joints with 48-tooth ABS reluctor tone rings and 12-point axle nuts.
 */
export class DifferentialAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  // Major Structural Assemblies
  private carrierGroup: THREE.Group;
  private coolingCoverGroup: THREE.Group;
  private ghasActuatorGroup: THREE.Group;

  // Internal Mechanical Core
  private internalCoreGroup: THREE.Group;
  private drivePinion: THREE.Group;
  private ringGearGroup: THREE.Group;
  private diffCase: THREE.Group;
  private spiderPinions: THREE.Mesh[] = [];
  private sideGears: THREE.Mesh[] = [];
  private clutchPackGroup: THREE.Group;
  private clutchPressurePlate: THREE.Mesh | null = null;

  // Half-Shafts & Wheels
  private leftHalfShaft: THREE.Group;
  private rightHalfShaft: THREE.Group;
  public leftWheelModel: WheelModel;
  public rightWheelModel: WheelModel;

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'DifferentialAssembly';

    this.carrierGroup = new THREE.Group();
    this.carrierGroup.name = 'NodularIronCarrier';

    this.coolingCoverGroup = new THREE.Group();
    this.coolingCoverGroup.name = 'AluminumCoolingCover';

    this.ghasActuatorGroup = new THREE.Group();
    this.ghasActuatorGroup.name = 'GHASElectronicActuator';

    this.internalCoreGroup = new THREE.Group();
    this.internalCoreGroup.name = 'InternalCore';

    this.drivePinion = new THREE.Group();
    this.drivePinion.name = 'DrivePinion';

    this.ringGearGroup = new THREE.Group();
    this.ringGearGroup.name = 'HypoidRingGear';

    this.diffCase = new THREE.Group();
    this.diffCase.name = 'DiffCarrierCage';

    this.clutchPackGroup = new THREE.Group();
    this.clutchPackGroup.name = 'MultiPlateClutchPack';

    this.leftHalfShaft = new THREE.Group();
    this.leftHalfShaft.name = 'LeftHalfShaft';

    this.rightHalfShaft = new THREE.Group();
    this.rightHalfShaft.name = 'RightHalfShaft';

    // Wheels
    this.leftWheelModel = new WheelModel({ materials, isFront: false, side: -1 });
    this.rightWheelModel = new WheelModel({ materials, isFront: false, side: 1 });
    this.leftWheelModel.group.visible = false;
    this.rightWheelModel.group.visible = false;

    // Build sub-assemblies
    this.buildNodularIronCarrier();
    this.buildRearCoolingCover();
    this.buildGHASElectronicActuator();
    this.buildInternalCore();
    this.buildPerformanceHalfShafts();

    // Assemble internal hierarchy
    this.internalCoreGroup.add(this.drivePinion, this.ringGearGroup);

    this.group.add(
      this.carrierGroup,
      this.coolingCoverGroup,
      this.ghasActuatorGroup,
      this.internalCoreGroup,
      this.leftHalfShaft,
      this.rightHalfShaft,
      this.leftWheelModel.group,
      this.rightWheelModel.group
    );

    // Position on BMW M3 G81 rear axle: Z = -1.324, center height Y = 0.338m
    this.group.position.set(0, 0.338, -1.324);
    this.leftWheelModel.group.position.set(-0.80, 0, 0);
    this.rightWheelModel.group.position.set(0.80, 0, 0);
  }

  // =========================================================================
  // 1. Asymmetric Nodular Cast Iron Carrier Housing (The "Pumpkin")
  // =========================================================================
  private buildNodularIronCarrier() {
    const castMat = this.materials.castIron;
    const steelMat = this.materials.polishedSteel;
    const boltMat = this.materials.gearSteel;
    const rubberMat = this.materials.rubberBlack;
    const brassMat = this.materials.brassBronze;

    // A. Main Center Pumpkin Shell (asymmetric left bulge for 215mm ring gear)
    const centerPumpkinGeo = new THREE.SphereGeometry(0.128, 28, 22);
    centerPumpkinGeo.scale(1.08, 0.96, 0.94);
    const centerPumpkin = new THREE.Mesh(centerPumpkinGeo, castMat);
    centerPumpkin.position.set(-0.012, -0.005, 0.005);
    centerPumpkin.castShadow = true;
    this.carrierGroup.add(centerPumpkin);

    // Ring Gear Left Clearance Swell
    const ringBulgeGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.052, 24);
    ringBulgeGeo.rotateZ(Math.PI / 2);
    const ringBulge = new THREE.Mesh(ringBulgeGeo, castMat);
    ringBulge.position.set(-0.042, 0.002, 0.0);
    ringBulge.castShadow = true;
    this.carrierGroup.add(ringBulge);

    // B. Structural Longitudinal & Radial Stiffening Ribs
    // Top spine reinforcement keel
    const topRibGeo = new THREE.BoxGeometry(0.016, 0.024, 0.18);
    const topRib = new THREE.Mesh(topRibGeo, castMat);
    topRib.position.set(0.0, 0.118, 0.02);
    this.carrierGroup.add(topRib);

    // Bottom structural keel
    const bottomRibGeo = new THREE.BoxGeometry(0.018, 0.022, 0.16);
    const bottomRib = new THREE.Mesh(bottomRibGeo, castMat);
    bottomRib.position.set(0.0, -0.122, 0.01);
    this.carrierGroup.add(bottomRib);

    // 4 Diagonal gussets radiating from the pinion snout into the main bulb
    const gussetAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    gussetAngles.forEach((ang) => {
      const gussetGeo = new THREE.BoxGeometry(0.012, 0.026, 0.08);
      const gusset = new THREE.Mesh(gussetGeo, castMat);
      gusset.position.set(Math.cos(ang) * 0.065, Math.sin(ang) * 0.065 - 0.01, 0.085);
      gusset.rotation.z = ang;
      gusset.rotation.x = 0.22;
      this.carrierGroup.add(gusset);
    });

    // C. Forward Pinion Quill / Snout (extends forward towards driveshaft at Z = +0.14)
    const snoutGeo = new THREE.CylinderGeometry(0.042, 0.058, 0.11, 24);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, castMat);
    // Hypoid offset: pinion axis sits ~20mm below carrier center line
    snout.position.set(0.012, -0.020, 0.088);
    snout.castShadow = true;
    this.carrierGroup.add(snout);

    // Front Pinion Bearing Retainer Collar
    const retainerGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.020, 24);
    retainerGeo.rotateX(Math.PI / 2);
    const retainer = new THREE.Mesh(retainerGeo, castMat);
    retainer.position.set(0.012, -0.020, 0.132);
    this.carrierGroup.add(retainer);

    // 4 Bearing Retainer Socket Bolts
    for (let b = 0; b < 4; b++) {
      const bAng = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 8);
      bGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(bGeo, boltMat);
      bolt.position.set(
        0.012 + Math.cos(bAng) * 0.038,
        -0.020 + Math.sin(bAng) * 0.038,
        0.142
      );
      this.carrierGroup.add(bolt);
    }

    // Input Pinion Companion Drive Flange (mates directly to CFRP propeller shaft companion flange)
    const inFlangeGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.016, 24);
    inFlangeGeo.rotateX(Math.PI / 2);
    const inFlange = new THREE.Mesh(inFlangeGeo, steelMat);
    inFlange.position.set(0.012, -0.020, 0.144);
    inFlange.castShadow = true;
    this.carrierGroup.add(inFlange);

    // 6 Perimeter Mounting Studs on Companion Flange
    for (let s = 0; s < 6; s++) {
      const sAng = (s / 6) * Math.PI * 2;
      const studGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.022, 10);
      studGeo.rotateX(Math.PI / 2);
      const stud = new THREE.Mesh(studGeo, boltMat);
      stud.position.set(
        0.012 + Math.cos(sAng) * 0.042,
        -0.020 + Math.sin(sAng) * 0.042,
        0.148
      );
      this.carrierGroup.add(stud);
    }

    // D. Transverse Axle Output Bearing Hubs & Forged Drive Flanges
    [-1, 1].forEach((side) => {
      // Cylindrical Bearing Sleeve projecting laterally
      const axleJournalGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.065, 20);
      axleJournalGeo.rotateZ(Math.PI / 2);
      const axleJournal = new THREE.Mesh(axleJournalGeo, castMat);
      axleJournal.position.set(side * 0.102, 0.0, 0.0);
      axleJournal.castShadow = true;
      this.carrierGroup.add(axleJournal);

      // Output Oil Seal Protective Lip
      const sealLipGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.012, 20);
      sealLipGeo.rotateZ(Math.PI / 2);
      const sealLip = new THREE.Mesh(sealLipGeo, steelMat);
      sealLip.position.set(side * 0.130, 0.0, 0.0);
      this.carrierGroup.add(sealLip);

      // Heavy-Duty Forged Output Drive Companion Flange
      const outFlangeGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.014, 24);
      outFlangeGeo.rotateZ(Math.PI / 2);
      const outFlange = new THREE.Mesh(outFlangeGeo, steelMat);
      outFlange.position.set(side * 0.138, 0.0, 0.0);
      outFlange.castShadow = true;
      this.carrierGroup.add(outFlange);

      // 6 M10 Perimeter Torx Output Bolts on each side
      for (let t = 0; t < 6; t++) {
        const tAng = (t / 6) * Math.PI * 2;
        const boltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8);
        boltGeo.rotateZ(Math.PI / 2);
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(
          side * 0.144,
          Math.sin(tAng) * 0.042,
          Math.cos(tAng) * 0.042
        );
        this.carrierGroup.add(bolt);
      }
    });

    // E. Subframe Front Mounting Ears (Dual Rubber-Metal Bushings)
    [-1, 1].forEach((side) => {
      // Cast Lug Arm
      const earArmGeo = new THREE.BoxGeometry(0.038, 0.032, 0.045);
      const earArm = new THREE.Mesh(earArmGeo, castMat);
      earArm.position.set(side * 0.125, 0.062, 0.065);
      this.carrierGroup.add(earArm);

      // Outer Bushing Sleeve
      const bushSleeveGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.042, 18);
      bushSleeveGeo.rotateX(Math.PI / 2);
      const bushSleeve = new THREE.Mesh(bushSleeveGeo, castMat);
      bushSleeve.position.set(side * 0.132, 0.062, 0.082);
      this.carrierGroup.add(bushSleeve);

      // Rubber Damper Core
      const rubberCoreGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.044, 18);
      rubberCoreGeo.rotateX(Math.PI / 2);
      const rubberCore = new THREE.Mesh(rubberCoreGeo, rubberMat);
      rubberCore.position.set(side * 0.132, 0.062, 0.082);
      this.carrierGroup.add(rubberCore);

      // Inner Steel Crush Sleeve & Subframe Bolt
      const innerSleeveGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.052, 16);
      innerSleeveGeo.rotateX(Math.PI / 2);
      const innerSleeve = new THREE.Mesh(innerSleeveGeo, steelMat);
      innerSleeve.position.set(side * 0.132, 0.062, 0.082);
      this.carrierGroup.add(innerSleeve);
    });

    // F. Service Hardware: Oil Plugs & Temperature Sensor
    // Oil Fill Plug (Upper Right flank)
    const fillPlugGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 6);
    fillPlugGeo.rotateZ(Math.PI / 2);
    const fillPlug = new THREE.Mesh(fillPlugGeo, steelMat);
    fillPlug.position.set(0.082, 0.048, -0.035);
    this.carrierGroup.add(fillPlug);

    // Magnetic Drain Plug (Lowest Center Point)
    const drainPlugGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.012, 6);
    const drainPlug = new THREE.Mesh(drainPlugGeo, steelMat);
    drainPlug.position.set(0.0, -0.132, -0.015);
    this.carrierGroup.add(drainPlug);

    // Differential Oil Temperature Sensor (Upper Right Boss)
    const sensorGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.024, 12);
    sensorGeo.rotateX(-Math.PI / 4);
    const sensor = new THREE.Mesh(sensorGeo, brassMat);
    sensor.position.set(0.055, 0.092, 0.025);
    this.carrierGroup.add(sensor);

    // Sensor 2-Pin Wire Harness Connector
    const connGeo = new THREE.BoxGeometry(0.012, 0.014, 0.018);
    const conn = new THREE.Mesh(connGeo, this.materials.subframeBlack);
    conn.position.set(0.055, 0.106, 0.038);
    this.carrierGroup.add(conn);
  }

  // =========================================================================
  // 2. Die-Cast Aluminum Finned Heat Sink Rear Cooling Cover
  // =========================================================================
  private buildRearCoolingCover() {
    const aluMat = this.materials.engineAluminum;
    const boltMat = this.materials.gearSteel;
    const steelMat = this.materials.polishedSteel;
    const rubberMat = this.materials.rubberBlack;

    // A. Perimeter Mating Flange (Z = -0.092)
    const flangeGeo = new THREE.CylinderGeometry(0.134, 0.134, 0.012, 28);
    flangeGeo.rotateX(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, aluMat);
    flange.position.set(0.0, 0.0, -0.092);
    flange.castShadow = true;
    this.coolingCoverGroup.add(flange);

    // 10 Perimeter Hex Bolts & Washers securing cover to iron carrier
    for (let b = 0; b < 10; b++) {
      const bAng = (b / 10) * Math.PI * 2;
      const bRadius = 0.124;

      // Hex bolt head
      const boltGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.012, 6);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(
        Math.cos(bAng) * bRadius,
        Math.sin(bAng) * bRadius,
        -0.098
      );
      this.coolingCoverGroup.add(bolt);

      // Steel washer
      const washerGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.002, 12);
      washerGeo.rotateX(Math.PI / 2);
      const washer = new THREE.Mesh(washerGeo, steelMat);
      washer.position.set(
        Math.cos(bAng) * bRadius,
        Math.sin(bAng) * bRadius,
        -0.093
      );
      this.coolingCoverGroup.add(washer);
    }

    // B. Rear Contoured Aluminum Dome Housing
    const domeGeo = new THREE.CylinderGeometry(0.122, 0.130, 0.045, 26);
    domeGeo.rotateX(Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, aluMat);
    dome.position.set(0.0, 0.0, -0.118);
    dome.castShadow = true;
    this.coolingCoverGroup.add(dome);

    // C. 7 Deep Horizontal Aerodynamic Cooling Fins
    // Varied fin widths matching the authentic BMW M cover contour
    const finConfigs = [
      { y: 0.078, width: 0.170, depth: 0.026 },
      { y: 0.052, width: 0.215, depth: 0.034 },
      { y: 0.026, width: 0.235, depth: 0.038 },
      { y: 0.000, width: 0.245, depth: 0.040 },
      { y: -0.026, width: 0.235, depth: 0.038 },
      { y: -0.052, width: 0.210, depth: 0.034 },
      { y: -0.078, width: 0.165, depth: 0.026 },
    ];

    finConfigs.forEach((cfg) => {
      const finGeo = new THREE.BoxGeometry(cfg.width, 0.005, cfg.depth);
      const fin = new THREE.Mesh(finGeo, aluMat);
      fin.position.set(0.0, cfg.y, -0.140 - cfg.depth / 2);
      fin.castShadow = true;
      this.coolingCoverGroup.add(fin);
    });

    // Central Vertical Stiffening Rib Dividing Fins
    const vertSpineGeo = new THREE.BoxGeometry(0.014, 0.185, 0.042);
    const vertSpine = new THREE.Mesh(vertSpineGeo, aluMat);
    vertSpine.position.set(0.0, 0.0, -0.145);
    vertSpine.castShadow = true;
    this.coolingCoverGroup.add(vertSpine);

    // D. Large Rear Hydraulic Subframe Mounting Lug (Asymmetric Upper-Left)
    const mountLugGeo = new THREE.BoxGeometry(0.048, 0.042, 0.052);
    const mountLug = new THREE.Mesh(mountLugGeo, aluMat);
    mountLug.position.set(-0.065, 0.072, -0.155);
    this.coolingCoverGroup.add(mountLug);

    // Large Bushing Eyelet Tube
    const eyeletGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.050, 20);
    eyeletGeo.rotateX(Math.PI / 2);
    const eyelet = new THREE.Mesh(eyeletGeo, aluMat);
    eyelet.position.set(-0.065, 0.072, -0.175);
    this.coolingCoverGroup.add(eyelet);

    // Vulcanized Rubber Damper Bushing
    const bushRubberGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.052, 20);
    bushRubberGeo.rotateX(Math.PI / 2);
    const bushRubber = new THREE.Mesh(bushRubberGeo, rubberMat);
    bushRubber.position.set(-0.065, 0.072, -0.175);
    this.coolingCoverGroup.add(bushRubber);

    // Center Steel Through-Sleeve
    const centerSleeveGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.062, 16);
    centerSleeveGeo.rotateX(Math.PI / 2);
    const centerSleeve = new THREE.Mesh(centerSleeveGeo, steelMat);
    centerSleeve.position.set(-0.065, 0.072, -0.175);
    this.coolingCoverGroup.add(centerSleeve);

    // E. Differential Pressure Relief Breather Cap (Top Right)
    const breatherStemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.022, 12);
    const breatherStem = new THREE.Mesh(breatherStemGeo, steelMat);
    breatherStem.position.set(0.045, 0.125, -0.115);
    this.coolingCoverGroup.add(breatherStem);

    const breatherCapGeo = new THREE.CylinderGeometry(0.012, 0.010, 0.014, 14);
    const breatherCap = new THREE.Mesh(breatherCapGeo, this.materials.subframeBlack);
    breatherCap.position.set(0.045, 0.136, -0.115);
    this.coolingCoverGroup.add(breatherCap);
  }

  // =========================================================================
  // 3. GHAS (Geregeltes Hinterachsgetriebe) Electronic Actuator Module
  // =========================================================================
  private buildGHASElectronicActuator() {
    const motorMat = this.materials.subframeBlack;
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const boltMat = this.materials.gearSteel;
    const wireMat = this.materials.heatShieldGold;

    // Actuator Base Position (Mounted on upper-left flank of carrier)
    const actX = -0.098;
    const actY = 0.088;
    const actZ = 0.012;

    // A. Planetary Reduction Gearbox Casing
    const gearboxGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.038, 20);
    gearboxGeo.rotateX(Math.PI / 2);
    const gearbox = new THREE.Mesh(gearboxGeo, aluMat);
    gearbox.position.set(actX, actY, actZ);
    gearbox.castShadow = true;
    this.ghasActuatorGroup.add(gearbox);

    // Mounting Flange with 3 Torx Screws
    for (let s = 0; s < 3; s++) {
      const sAng = (s / 3) * Math.PI * 2;
      const sGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.010, 8);
      sGeo.rotateX(Math.PI / 2);
      const screw = new THREE.Mesh(sGeo, boltMat);
      screw.position.set(
        actX + Math.cos(sAng) * 0.026,
        actY + Math.sin(sAng) * 0.026,
        actZ - 0.018
      );
      this.ghasActuatorGroup.add(screw);
    }

    // B. DC Electric Servomotor Housing (oriented longitudinally)
    const motorGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.075, 20);
    motorGeo.rotateX(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(actX, actY, actZ + 0.052);
    motor.castShadow = true;
    this.ghasActuatorGroup.add(motor);

    // Motor Shell Cooling Ribs (6 axial grooves)
    for (let r = 0; r < 6; r++) {
      const rAng = (r / 6) * Math.PI * 2;
      const ribGeo = new THREE.BoxGeometry(0.003, 0.003, 0.065);
      const rib = new THREE.Mesh(ribGeo, aluMat);
      rib.position.set(
        actX + Math.cos(rAng) * 0.0265,
        actY + Math.sin(rAng) * 0.0265,
        actZ + 0.052
      );
      this.ghasActuatorGroup.add(rib);
    }

    // Motor End Cap & Terminal Housing
    const endCapGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.014, 18);
    endCapGeo.rotateX(Math.PI / 2);
    const endCap = new THREE.Mesh(endCapGeo, motorMat);
    endCap.position.set(actX, actY, actZ + 0.094);
    this.ghasActuatorGroup.add(endCap);

    // Weather-Sealed High-Current Electrical Plug
    const plugGeo = new THREE.BoxGeometry(0.016, 0.014, 0.022);
    const plug = new THREE.Mesh(plugGeo, wireMat);
    plug.position.set(actX + 0.014, actY + 0.018, actZ + 0.096);
    this.ghasActuatorGroup.add(plug);

    // Flexible Protective Wiring Conduit curving up towards body harness
    const wirePoints = [
      new THREE.Vector3(actX + 0.014, actY + 0.018, actZ + 0.105),
      new THREE.Vector3(actX + 0.022, actY + 0.038, actZ + 0.115),
      new THREE.Vector3(actX + 0.035, actY + 0.065, actZ + 0.100),
      new THREE.Vector3(actX + 0.045, actY + 0.090, actZ + 0.080),
    ];
    const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 16, 0.0045, 8, false);
    const wireTube = new THREE.Mesh(wireGeo, this.materials.rubberBlack);
    this.ghasActuatorGroup.add(wireTube);

    // Internal Actuator Ball-Ramp Pushrod entering Carrier
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.045, 12);
    rodGeo.rotateX(Math.PI / 2);
    const rod = new THREE.Mesh(rodGeo, steelMat);
    rod.position.set(actX + 0.018, actY - 0.015, actZ - 0.025);
    this.ghasActuatorGroup.add(rod);
  }

  // =========================================================================
  // 4. Internal Mechanical Core (Cutaway & Exploded View Architecture)
  // =========================================================================
  private buildInternalCore() {
    const gearMat = this.materials.gearSteel;
    const steelMat = this.materials.polishedSteel;
    const boltMat = this.materials.gearSteel;
    const carbonMat = this.materials.carbonFiber;

    // A. Hypoid Drive Pinion (15 spiral teeth, offset below axle center)
    const pinionShaftGeo = new THREE.CylinderGeometry(0.022, 0.032, 0.14, 20);
    pinionShaftGeo.rotateX(Math.PI / 2);
    const pinionShaft = new THREE.Mesh(pinionShaftGeo, gearMat);
    this.drivePinion.add(pinionShaft);

    // Tapered Roller Bearing Cones (Front & Rear)
    for (const bz of [-0.035, 0.038]) {
      const bearingGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.018, 20);
      bearingGeo.rotateX(Math.PI / 2);
      const bearing = new THREE.Mesh(bearingGeo, steelMat);
      bearing.position.set(0, 0, bz);
      this.drivePinion.add(bearing);
    }

    // Beveled Hypoid Pinion Head (15 spiral teeth)
    const headGeo = new THREE.ConeGeometry(0.046, 0.045, 20);
    headGeo.rotateX(-Math.PI / 2);
    const headMesh = new THREE.Mesh(headGeo, gearMat);
    headMesh.position.set(0, 0, -0.065);
    this.drivePinion.add(headMesh);

    // Position Pinion with ~20mm hypoid drop
    this.drivePinion.position.set(0.012, -0.020, 0.088);

    // B. 47-Tooth Hypoid Spiral Crown Wheel (Ring Gear)
    // Heavy-duty forged alloy steel ring body (215mm OD)
    const ringBodyGeo = new THREE.CylinderGeometry(0.118, 0.118, 0.036, 40);
    ringBodyGeo.rotateZ(Math.PI / 2);
    const ringBody = new THREE.Mesh(ringBodyGeo, gearMat);
    this.ringGearGroup.add(ringBody);

    // Spiral Beveled Tooth Face (Chamfered hypoid tooth envelope)
    const toothTorusGeo = new THREE.TorusGeometry(0.112, 0.016, 16, 48);
    toothTorusGeo.rotateY(Math.PI / 2);
    const toothTorus = new THREE.Mesh(toothTorusGeo, gearMat);
    this.ringGearGroup.add(toothTorus);

    // 10 High-Tensile Ring Gear Bolts fastening gear to carrier cage
    for (let b = 0; b < 10; b++) {
      const bAng = (b / 10) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.012, 6);
      boltGeo.rotateZ(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(
        -0.020,
        Math.sin(bAng) * 0.078,
        Math.cos(bAng) * 0.078
      );
      this.ringGearGroup.add(bolt);
    }

    // C. Differential Carrier Cage (Windowed Cast Iron Housing)
    const cageGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.085, 24);
    cageGeo.rotateZ(Math.PI / 2);
    const cage = new THREE.Mesh(cageGeo, this.materials.castIron);
    this.diffCase.add(cage);

    // Cross-Pin Shaft
    const crossPinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 16);
    const crossPin = new THREE.Mesh(crossPinGeo, steelMat);
    this.diffCase.add(crossPin);

    // 4 Bevel Spider Pinions (Top, Bottom, Front, Rear)
    const spiderAngles = [
      { y: 0.048, z: 0, rotZ: 0 },
      { y: -0.048, z: 0, rotZ: Math.PI },
      { y: 0, z: 0.048, rotZ: Math.PI / 2, rotY: Math.PI / 2 },
      { y: 0, z: -0.048, rotZ: -Math.PI / 2, rotY: Math.PI / 2 },
    ];
    spiderAngles.forEach((cfg) => {
      const spiderGeo = new THREE.ConeGeometry(0.025, 0.030, 16);
      const spider = new THREE.Mesh(spiderGeo, gearMat);
      spider.position.set(0, cfg.y, cfg.z);
      spider.rotation.z = cfg.rotZ;
      if (cfg.rotY) spider.rotation.y = cfg.rotY;
      this.spiderPinions.push(spider);
      this.diffCase.add(spider);
    });

    // 2 Side Output Bevel Gears (splined to left & right axle shafts)
    [-1, 1].forEach((side) => {
      const sideGearGeo = new THREE.ConeGeometry(0.038, 0.030, 18);
      const sideGear = new THREE.Mesh(sideGearGeo, gearMat);
      sideGear.position.set(side * 0.040, 0, 0);
      sideGear.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.sideGears.push(sideGear);
      this.diffCase.add(sideGear);
    });

    // D. Active M Multi-Plate Wet Clutch Pack
    // Alternating stack of 5 carbon friction discs and 5 steel reaction plates
    const discCount = 5;
    const packStartX = -0.045;
    for (let i = 0; i < discCount; i++) {
      const dx = packStartX - i * 0.007;

      // Carbon Friction Disc
      const fDiscGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.0028, 24);
      fDiscGeo.rotateZ(Math.PI / 2);
      const fDisc = new THREE.Mesh(fDiscGeo, carbonMat);
      fDisc.position.set(dx, 0, 0);
      this.clutchPackGroup.add(fDisc);

      // Nitrided Steel Reaction Plate with drive tabs
      const sPlateGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.0022, 24);
      sPlateGeo.rotateZ(Math.PI / 2);
      const sPlate = new THREE.Mesh(sPlateGeo, steelMat);
      sPlate.position.set(dx - 0.0035, 0, 0);
      this.clutchPackGroup.add(sPlate);
    }

    // Ball-Ramp Expander & Clutch Pressure Plate
    const pressurePlateGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.007, 24);
    pressurePlateGeo.rotateZ(Math.PI / 2);
    this.clutchPressurePlate = new THREE.Mesh(pressurePlateGeo, steelMat);
    this.clutchPressurePlate.position.set(packStartX - discCount * 0.007 - 0.006, 0, 0);
    this.clutchPackGroup.add(this.clutchPressurePlate);

    // Assemble Core
    this.ringGearGroup.add(this.diffCase);
    this.ringGearGroup.add(this.clutchPackGroup);
    this.ringGearGroup.position.set(-0.018, 0, 0);
  }

  // =========================================================================
  // 5. Motorsport M Performance Half-Shafts & Constant Velocity Joints
  // =========================================================================
  private buildPerformanceHalfShafts() {
    const steelMat = this.materials.polishedSteel;
    const rubberMat = this.materials.rubberBlack;
    const clampMat = this.materials.chromeTrim;
    const shaftMat = this.materials.subframeBlack;
    const boltMat = this.materials.gearSteel;

    [-1, 1].forEach((side) => {
      const shaftGroup = side === -1 ? this.leftHalfShaft : this.rightHalfShaft;

      // A. Inner Plunge Constant Velocity Joint (Machined Steel Tulip)
      const innerJointGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.055, 20);
      innerJointGeo.rotateZ(Math.PI / 2);
      const innerJoint = new THREE.Mesh(innerJointGeo, steelMat);
      innerJoint.position.set(side * 0.165, 0, 0);
      innerJoint.castShadow = true;
      shaftGroup.add(innerJoint);

      // Inner Flange Mating to Differential Output Stub
      const innerFlangeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.012, 20);
      innerFlangeGeo.rotateZ(Math.PI / 2);
      const innerFlange = new THREE.Mesh(innerFlangeGeo, steelMat);
      innerFlange.position.set(side * 0.142, 0, 0);
      shaftGroup.add(innerFlange);

      // Inner 6-Bolt Circle
      for (let b = 0; b < 6; b++) {
        const bAng = (b / 6) * Math.PI * 2;
        const bGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.014, 8);
        bGeo.rotateZ(Math.PI / 2);
        const bolt = new THREE.Mesh(bGeo, boltMat);
        bolt.position.set(
          side * 0.146,
          Math.sin(bAng) * 0.038,
          Math.cos(bAng) * 0.038
        );
        shaftGroup.add(bolt);
      }

      // Triple-Convoluted Accordion Inner CV Boot
      for (let c = 0; c < 3; c++) {
        const cRadius = 0.038 - c * 0.005;
        const convGeo = new THREE.TorusGeometry(cRadius, 0.008, 12, 24);
        convGeo.rotateY(Math.PI / 2);
        const conv = new THREE.Mesh(convGeo, rubberMat);
        conv.position.set(side * (0.195 + c * 0.015), 0, 0);
        shaftGroup.add(conv);
      }

      // Stainless Steel Oetiker Boot Clamps
      [0.188, 0.245].forEach((cx) => {
        const clampGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.006, 20);
        clampGeo.rotateZ(Math.PI / 2);
        const clamp = new THREE.Mesh(clampGeo, clampMat);
        clamp.position.set(side * cx, 0, 0);
        shaftGroup.add(clamp);
      });

      // B. High-Strength Torsion Axle Bar
      // Authentic unequal diameters: Left shaft = 32mm, Right shaft = 36-38mm to prevent wheel hop
      const shaftRadius = side === -1 ? 0.016 : 0.0185;
      const barLength = 0.36;
      const barGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, barLength, 18);
      barGeo.rotateZ(Math.PI / 2);
      const bar = new THREE.Mesh(barGeo, shaftMat);
      bar.position.set(side * 0.43, 0, 0);
      bar.castShadow = true;
      shaftGroup.add(bar);

      // Harmonic Vibration Damper Donut (on longer right axle)
      if (side === 1) {
        const damperGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.030, 20);
        damperGeo.rotateZ(Math.PI / 2);
        const damper = new THREE.Mesh(damperGeo, rubberMat);
        damper.position.set(0.44, 0, 0);
        shaftGroup.add(damper);
      }

      // C. Outer Fixed High-Articulation CV Joint (Rzeppa Joint)
      const outerJointGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.065, 22);
      outerJointGeo.rotateZ(Math.PI / 2);
      const outerJoint = new THREE.Mesh(outerJointGeo, steelMat);
      outerJoint.position.set(side * 0.655, 0, 0);
      outerJoint.castShadow = true;
      shaftGroup.add(outerJoint);

      // Outer Triple-Convoluted Rubber Boot
      for (let c = 0; c < 3; c++) {
        const cRadius = 0.026 + c * 0.006;
        const convGeo = new THREE.TorusGeometry(cRadius, 0.008, 12, 24);
        convGeo.rotateY(Math.PI / 2);
        const conv = new THREE.Mesh(convGeo, rubberMat);
        conv.position.set(side * (0.595 + c * 0.015), 0, 0);
        shaftGroup.add(conv);
      }

      // Outer Boot Clamps
      [0.585, 0.638].forEach((cx) => {
        const clampGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.006, 20);
        clampGeo.rotateZ(Math.PI / 2);
        const clamp = new THREE.Mesh(clampGeo, clampMat);
        clamp.position.set(side * cx, 0, 0);
        shaftGroup.add(clamp);
      });

      // 48-Tooth ABS / DSC Wheel Speed Tone Ring
      const toneRingGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.010, 36);
      toneRingGeo.rotateZ(Math.PI / 2);
      const toneRing = new THREE.Mesh(toneRingGeo, this.materials.gearSteel);
      toneRing.position.set(side * 0.695, 0, 0);
      shaftGroup.add(toneRing);

      // Splined Stub Axle Shaft through Wheel Hub
      const stubGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.09, 18);
      stubGeo.rotateZ(Math.PI / 2);
      const stub = new THREE.Mesh(stubGeo, steelMat);
      stub.position.set(side * 0.745, 0, 0);
      shaftGroup.add(stub);

      // 12-Point M24 Wheel Spindle Lock Nut with Staking Collar
      const nutGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.014, 12);
      nutGeo.rotateZ(Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, boltMat);
      nut.position.set(side * 0.795, 0, 0);
      shaftGroup.add(nut);
    });
  }

  // =========================================================================
  // 6. Dynamic Kinematics & Exploded View Updates
  // =========================================================================
  public update(
    propShaftRpm: number,
    leftWheelRpm: number,
    rightWheelRpm: number,
    brake: number,
    explodeFactor: number,
    activeMDiffLockPercent: number = 0
  ) {
    const dt = 0.016;

    // 1. Drive Pinion rotates with propeller shaft
    const pinionAdvance = (propShaftRpm / 60) * (2 * Math.PI) * dt;
    this.drivePinion.rotation.z += pinionAdvance;

    // 2. Ring Gear and Carrier Case rotate at kinematic average speed
    const ringRpm = (leftWheelRpm + rightWheelRpm) / 2;
    const ringAdvance = (ringRpm / 60) * (2 * Math.PI) * dt;
    this.ringGearGroup.rotation.x += ringAdvance;

    // 3. Differential Spider Pinions rotate relative to carrier during cornering/wheel speed delta
    const diffDeltaRpm = (rightWheelRpm - leftWheelRpm) / 2;
    const spiderAdvance = (diffDeltaRpm / 60) * (2 * Math.PI) * dt;
    this.spiderPinions.forEach((sp) => (sp.rotation.y += spiderAdvance * 2));
    this.sideGears.forEach((sg, idx) => (sg.rotation.z += (idx === 0 ? -1 : 1) * spiderAdvance));

    // 4. Dynamic Multi-Plate Clutch Pack Lockup Clamping
    // GHAS ball ramp applies axial thrust proportional to active lock percentage
    if (this.clutchPressurePlate) {
      const lockPinch = (activeMDiffLockPercent / 100) * 0.003;
      this.clutchPressurePlate.position.x = -0.045 - 5 * 0.007 - 0.006 + lockPinch;
    }

    // 5. Half-Shafts rotate with individual differentiated wheel speeds
    const leftAdvance = (leftWheelRpm / 60) * (2 * Math.PI) * dt;
    const rightAdvance = (rightWheelRpm / 60) * (2 * Math.PI) * dt;

    this.leftHalfShaft.rotation.x += leftAdvance;
    this.rightHalfShaft.rotation.x += rightAdvance;

    this.leftWheelModel.updateRotation(leftAdvance);
    this.rightWheelModel.updateRotation(rightAdvance);

    // 6. Caliper Brake Pinch
    const brakePinch = brake * 0.004;
    this.leftWheelModel.caliper.position.x = -0.02 + brakePinch;
    this.rightWheelModel.caliper.position.x = 0.02 - brakePinch;

    // 7. Exploded View Kinematics (Layered multi-axis separation)
    if (explodeFactor > 0.001) {
      // Rear finned cover slides rearward
      this.coolingCoverGroup.position.z = -explodeFactor * 0.42;

      // Carrier pumpkin slides slightly rearward
      this.carrierGroup.position.z = -explodeFactor * 0.16;

      // GHAS actuator separates outward and upward
      this.ghasActuatorGroup.position.set(
        -explodeFactor * 0.18,
        explodeFactor * 0.22,
        explodeFactor * 0.08
      );

      // Internal Drive Pinion slides forward towards driveshaft
      this.drivePinion.position.z = 0.088 + explodeFactor * 0.26;

      // Ring gear, diff case & clutch pack lift upward out of the carrier
      this.ringGearGroup.position.y = explodeFactor * 0.28;

      // Half-shafts telescope outward symmetrically
      this.leftHalfShaft.position.x = -explodeFactor * 0.26;
      this.rightHalfShaft.position.x = explodeFactor * 0.26;

      // Wheels separate outward
      this.leftWheelModel.group.position.x = -0.80 - explodeFactor * 0.55;
      this.rightWheelModel.group.position.x = 0.80 + explodeFactor * 0.55;
    } else {
      // Return to exact native positions
      this.coolingCoverGroup.position.set(0, 0, 0);
      this.carrierGroup.position.set(0, 0, 0);
      this.ghasActuatorGroup.position.set(0, 0, 0);
      this.drivePinion.position.set(0.012, -0.020, 0.088);
      this.ringGearGroup.position.set(-0.018, 0, 0);
      this.leftHalfShaft.position.set(0, 0, 0);
      this.rightHalfShaft.position.set(0, 0, 0);
      this.leftWheelModel.group.position.x = -0.80;
      this.rightWheelModel.group.position.x = 0.80;
    }
  }
}

