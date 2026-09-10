import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { WheelModel } from './WheelModel';

export class SuspensionAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;
  private frontSuspensionGroup: THREE.Group;
  private rearSuspensionGroup: THREE.Group;

  // Steering System
  private steeringRack: THREE.Group;
  private rackCenterBar: THREE.Mesh;
  private leftTieRod: THREE.Mesh;
  private rightTieRod: THREE.Mesh;
  private leftBellows: THREE.Group;
  private rightBellows: THREE.Group;

  // Front Knuckles / Uprights
  public leftKnuckle: THREE.Group;
  public rightKnuckle: THREE.Group;
  public leftWheelModel: WheelModel;
  public rightWheelModel: WheelModel;

  // Front Control Links & Struts
  private frontStruts: THREE.Group[] = [];
  private frontDropLinks: THREE.Group[] = [];

  // Rear Suspension Components
  private rearSubframe: THREE.Group;
  private rearArms: THREE.Mesh[] = [];
  private rearDampers: THREE.Group[] = [];
  private rearSprings: THREE.Mesh[] = [];

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'SuspensionAssembly';

    this.frontSuspensionGroup = new THREE.Group();
    this.frontSuspensionGroup.name = 'FrontSuspensionGroup';
    this.rearSuspensionGroup = new THREE.Group();
    this.rearSuspensionGroup.name = 'RearSuspensionGroup';

    this.leftKnuckle = new THREE.Group();
    this.leftKnuckle.name = 'LeftFrontKnuckle';
    this.rightKnuckle = new THREE.Group();
    this.rightKnuckle.name = 'RightFrontKnuckle';

    // Wheels (rendered through WheelModel when focused or in isolated mode)
    this.leftWheelModel = new WheelModel({ materials, isFront: true, side: -1 });
    this.rightWheelModel = new WheelModel({ materials, isFront: true, side: 1 });
    this.leftWheelModel.group.visible = false;
    this.rightWheelModel.group.visible = false;

    // Initialize Steering Rack
    this.steeringRack = new THREE.Group();
    this.steeringRack.name = 'SteeringRackAssembly';
    const rackBarGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.62, 16);
    rackBarGeo.rotateZ(Math.PI / 2);
    this.rackCenterBar = new THREE.Mesh(rackBarGeo, this.materials.polishedSteel);

    const tieRodGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.28, 12);
    tieRodGeo.rotateZ(Math.PI / 2);
    this.leftTieRod = new THREE.Mesh(tieRodGeo, this.materials.polishedSteel);
    this.rightTieRod = new THREE.Mesh(tieRodGeo, this.materials.polishedSteel);

    this.leftBellows = this.createSteeringBellows();
    this.rightBellows = this.createSteeringBellows();
    this.rearSubframe = new THREE.Group();

    this.buildFrontDoubleJointAxle();
    this.buildRearFiveLinkAxle();

    this.group.add(this.frontSuspensionGroup, this.rearSuspensionGroup);
  }

  // Helical coil spring generator
  private createHelicalSpring(
    radius: number,
    height: number,
    turns: number,
    tubeRadius: number,
    material: THREE.Material
  ): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const segments = turns * 36;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * turns * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = t * height;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, segments, tubeRadius, 10, false);
    return new THREE.Mesh(geometry, material);
  }

  // Corrugated rubber steering rack bellows
  private createSteeringBellows(): THREE.Group {
    const bellows = new THREE.Group();
    const ringCount = 7;
    for (let r = 0; r < ringCount; r++) {
      const ringGeo = new THREE.TorusGeometry(0.022, 0.005, 8, 16);
      ringGeo.rotateY(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, this.materials.rubberBootBlack);
      ring.position.set(r * 0.012 - 0.042, 0, 0);
      bellows.add(ring);
    }
    const coreGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.09, 12);
    coreGeo.rotateZ(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, this.materials.rubberBootBlack);
    bellows.add(core);
    return bellows;
  }

  // Ball-joint with rubber dust boot
  private createBallJoint(radius: number = 0.016): THREE.Group {
    const joint = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(radius, 12, 12);
    const sphere = new THREE.Mesh(sphereGeo, this.materials.polishedSteel);
    joint.add(sphere);

    const bootGeo = new THREE.CylinderGeometry(radius * 1.15, radius * 0.85, radius * 1.4, 12);
    const boot = new THREE.Mesh(bootGeo, this.materials.rubberBootBlack);
    joint.add(boot);

    const studGeo = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, radius * 2.2, 10);
    const stud = new THREE.Mesh(studGeo, this.materials.polishedSteel);
    stud.position.y = radius * 0.9;
    joint.add(stud);

    return joint;
  }

  // =========================================================================
  // 1. FRONT DOUBLE-JOINT SPRING STRUT AXLE (BMW M Architecture)
  // =========================================================================
  private buildFrontDoubleJointAxle() {
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const subMat = this.materials.subframeBlack;

    // --- A. Front Cast Aluminum Subframe Cradle ---
    const subframe = new THREE.Group();
    subframe.name = 'FrontSubframeCradle';

    // Main transverse cradle bar (Z = 1.50m, Y = 0.21m)
    const cradleCrossGeo = new THREE.BoxGeometry(0.86, 0.05, 0.22);
    const cradleCross = new THREE.Mesh(cradleCrossGeo, aluMat);
    cradleCross.position.set(0, 0.21, 1.50);
    subframe.add(cradleCross);

    // Diagonal chassis shear plate / reinforcement plate
    const shearPlateGeo = new THREE.BoxGeometry(0.72, 0.012, 0.42);
    const shearPlate = new THREE.Mesh(shearPlateGeo, aluMat);
    shearPlate.position.set(0, 0.185, 1.52);
    subframe.add(shearPlate);

    // Front subframe mounting bushings (4 chassis attach points)
    const bushCoords = [
      [-0.38, 0.22, 1.36],
      [0.38, 0.22, 1.36],
      [-0.42, 0.22, 1.64],
      [0.42, 0.22, 1.64],
    ];
    for (const [bx, by, bz] of bushCoords) {
      const bushGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.048, 14);
      const bush = new THREE.Mesh(bushGeo, this.materials.rubberBlack);
      bush.position.set(bx, by, bz);
      subframe.add(bush);

      const boltGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
      const bolt = new THREE.Mesh(boltGeo, steelMat);
      bolt.position.set(bx, by, bz);
      subframe.add(bolt);
    }
    this.frontSuspensionGroup.add(subframe);

    // --- B. Steering System with Electric Power Steering Motor & Bellows ---
    const rackHousingGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.54, 16);
    rackHousingGeo.rotateZ(Math.PI / 2);
    const rackHousing = new THREE.Mesh(rackHousingGeo, subMat);
    rackHousing.position.set(0, 0.26, 1.62);
    this.steeringRack.add(rackHousing);

    // Electric Power Steering (EPS) belt-drive motor housing
    const epsMotorGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 16);
    epsMotorGeo.rotateX(Math.PI / 2);
    const epsMotor = new THREE.Mesh(epsMotorGeo, subMat);
    epsMotor.position.set(-0.16, 0.26, 1.68);
    this.steeringRack.add(epsMotor);

    // Rack center sliding rod
    this.rackCenterBar.position.set(0, 0.26, 1.62);
    this.steeringRack.add(this.rackCenterBar);

    // Left and right accordion bellows
    this.leftBellows.position.set(-0.28, 0.26, 1.62);
    this.rightBellows.position.set(0.28, 0.26, 1.62);
    this.steeringRack.add(this.leftBellows, this.rightBellows);

    // Tie rods with outer tie-rod ends and ball joints
    this.leftTieRod.position.set(-0.44, 0.26, 1.60);
    this.rightTieRod.position.set(0.44, 0.26, 1.60);
    this.steeringRack.add(this.leftTieRod, this.rightTieRod);

    const leftTieEnd = this.createBallJoint(0.014);
    leftTieEnd.position.set(-0.56, 0.26, 1.58);
    leftTieEnd.rotation.x = Math.PI / 2;
    this.steeringRack.add(leftTieEnd);

    const rightTieEnd = this.createBallJoint(0.014);
    rightTieEnd.position.set(0.56, 0.26, 1.58);
    rightTieEnd.rotation.x = Math.PI / 2;
    this.steeringRack.add(rightTieEnd);

    this.frontSuspensionGroup.add(this.steeringRack);

    // --- C. Front Anti-Roll Bar & Articulated End Links ---
    const swayBarPoints = [
      new THREE.Vector3(-0.58, 0.24, 1.48),
      new THREE.Vector3(-0.42, 0.21, 1.42),
      new THREE.Vector3(-0.20, 0.21, 1.42),
      new THREE.Vector3(0, 0.21, 1.42),
      new THREE.Vector3(0.20, 0.21, 1.42),
      new THREE.Vector3(0.42, 0.21, 1.42),
      new THREE.Vector3(0.58, 0.24, 1.48),
    ];
    const swayBarCurve = new THREE.CatmullRomCurve3(swayBarPoints);
    const swayBarGeo = new THREE.TubeGeometry(swayBarCurve, 24, 0.013, 10, false);
    const frontSwayBar = new THREE.Mesh(swayBarGeo, this.materials.subframeBlack);
    this.frontSuspensionGroup.add(frontSwayBar);

    // Sway bar rubber D-bushings and brackets clamped to subframe
    for (const x of [-0.28, 0.28]) {
      const dBushGeo = new THREE.BoxGeometry(0.045, 0.04, 0.045);
      const dBush = new THREE.Mesh(dBushGeo, this.materials.rubberBlack);
      dBush.position.set(x, 0.21, 1.42);
      this.frontSuspensionGroup.add(dBush);

      const clampGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.038, 12, 1, false, 0, Math.PI);
      clampGeo.rotateX(Math.PI / 2);
      const clamp = new THREE.Mesh(clampGeo, steelMat);
      clamp.position.set(x, 0.225, 1.42);
      this.frontSuspensionGroup.add(clamp);
    }

    // --- D. Dual Lower Forged Aluminum Links & Adaptive M Struts per side ---
    for (const side of [-1, 1]) {
      const knuckleGroup = side === -1 ? this.leftKnuckle : this.rightKnuckle;
      const wheelModel = side === -1 ? this.leftWheelModel : this.rightWheelModel;

      // Wheel Knuckle Position (aligned inside front wheel well)
      knuckleGroup.position.set(side * 0.58, 0.338, 1.535);

      // 1. Forged Aluminum Steering Knuckle / Swivel Bearing Body
      const knuckleBodyGeo = new THREE.BoxGeometry(0.045, 0.18, 0.08);
      const knuckleMesh = new THREE.Mesh(knuckleBodyGeo, aluMat);
      knuckleGroup.add(knuckleMesh);

      // Integrated brake caliper mounting ears
      const caliperEarGeo = new THREE.BoxGeometry(0.02, 0.04, 0.16);
      const caliperEar = new THREE.Mesh(caliperEarGeo, aluMat);
      caliperEar.position.set(-side * 0.02, 0.02, 0.06);
      knuckleGroup.add(caliperEar);

      // Knuckle wheel hub bearing cartridge
      const hubCartridgeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.04, 20);
      hubCartridgeGeo.rotateZ(Math.PI / 2);
      const hubCartridge = new THREE.Mesh(hubCartridgeGeo, steelMat);
      hubCartridge.position.set(side * 0.015, 0, 0);
      knuckleGroup.add(hubCartridge);

      // Steering arm extending to meet tie-rod end
      const steerArmGeo = new THREE.BoxGeometry(0.03, 0.022, 0.08);
      const steerArm = new THREE.Mesh(steerArmGeo, aluMat);
      steerArm.position.set(0, -0.075, 0.045);
      knuckleGroup.add(steerArm);

      // Mount WheelModel
      knuckleGroup.add(wheelModel.group);
      this.frontSuspensionGroup.add(knuckleGroup);

      // 2. Transverse Wishbone Lower Link (forged aluminum, subframe to knuckle)
      const wishboneGroup = new THREE.Group();
      const wishboneGeo = new THREE.BoxGeometry(0.24, 0.024, 0.042);
      const wishboneMesh = new THREE.Mesh(wishboneGeo, aluMat);
      wishboneMesh.position.set(side * 0.42, 0.21, 1.52);
      wishboneMesh.rotation.z = side * 0.08;
      wishboneGroup.add(wishboneMesh);

      // Inner subframe rubber bushing
      const wishboneInnerBush = new THREE.CylinderGeometry(0.022, 0.022, 0.038, 12);
      wishboneInnerBush.rotateX(Math.PI / 2);
      const innerBush = new THREE.Mesh(wishboneInnerBush, this.materials.rubberBlack);
      innerBush.position.set(side * 0.30, 0.20, 1.51);
      wishboneGroup.add(innerBush);

      // Outer ball joint with protective rubber dust boot
      const wishboneOuterJoint = this.createBallJoint(0.015);
      wishboneOuterJoint.position.set(side * 0.54, 0.22, 1.53);
      wishboneGroup.add(wishboneOuterJoint);
      this.frontSuspensionGroup.add(wishboneGroup);

      // 3. Tension Strut (Thrust Rod / Pull-Rod pointing forward diagonally)
      const tensionGroup = new THREE.Group();
      const tensionPoints = [
        new THREE.Vector3(side * 0.26, 0.215, 1.68),
        new THREE.Vector3(side * 0.38, 0.22, 1.60),
        new THREE.Vector3(side * 0.53, 0.225, 1.55),
      ];
      const tensionCurve = new THREE.CatmullRomCurve3(tensionPoints);
      const tensionGeo = new THREE.TubeGeometry(tensionCurve, 16, 0.014, 8, false);
      const tensionMesh = new THREE.Mesh(tensionGeo, aluMat);
      tensionGroup.add(tensionMesh);

      // Large hydraulic hydro-bushing at front subframe anchor
      const hydroBushGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.044, 16);
      const hydroBush = new THREE.Mesh(hydroBushGeo, this.materials.rubberBlack);
      hydroBush.position.set(side * 0.26, 0.215, 1.68);
      tensionGroup.add(hydroBush);

      // Outer ball joint at knuckle
      const tensionJoint = this.createBallJoint(0.015);
      tensionJoint.position.set(side * 0.53, 0.225, 1.55);
      tensionGroup.add(tensionJoint);
      this.frontSuspensionGroup.add(tensionGroup);

      // 4. M Adaptive Coilover Strut Assembly
      const strutGroup = new THREE.Group();
      strutGroup.name = `FrontMAdaptiveStrut_${side > 0 ? 'R' : 'L'}`;
      strutGroup.position.set(side * 0.54, 0.24, 1.535);

      // Lower strut mounting clevis clamped securely around the knuckle body
      const clevisGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.06, 16);
      const clevis = new THREE.Mesh(clevisGeo, aluMat);
      clevis.position.set(0, 0.04, 0);
      strutGroup.add(clevis);

      // Inverted monotube damper body (threaded steel cylinder)
      const damperBodyGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.24, 20);
      const damperBody = new THREE.Mesh(damperBodyGeo, steelMat);
      damperBody.position.set(0, 0.18, 0);
      strutGroup.add(damperBody);

      // Blue anodized threaded lower spring perch & lock collar
      const perchGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.014, 20);
      const perch = new THREE.Mesh(perchGeo, this.materials.anodizedBlue);
      perch.position.set(0, 0.12, 0);
      strutGroup.add(perch);

      const lockCollarGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.008, 20);
      const lockCollar = new THREE.Mesh(lockCollarGeo, this.materials.anodizedBlue);
      lockCollar.position.set(0, 0.108, 0);
      strutGroup.add(lockCollar);

      // Progressive micro-cellular polyurethane bump stop (ochre elastomer)
      const bumpStopGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.045, 12);
      const bumpStop = new THREE.Mesh(bumpStopGeo, this.materials.suspensionDamperYellow);
      bumpStop.position.set(0, 0.28, 0);
      strutGroup.add(bumpStop);

      // Accordion rubber dust boot / gaiter over damper piston rod
      for (let b = 0; b < 4; b++) {
        const bootRingGeo = new THREE.TorusGeometry(0.024, 0.005, 8, 16);
        bootRingGeo.rotateX(Math.PI / 2);
        const bootRing = new THREE.Mesh(bootRingGeo, this.materials.rubberBootBlack);
        bootRing.position.set(0, 0.23 + b * 0.018, 0);
        strutGroup.add(bootRing);
      }

      // Adaptive M Coilover Spring (BMW M Sport red powdercoated helical spring)
      const coilSpring = this.createHelicalSpring(0.044, 0.24, 6.5, 0.007, this.materials.brakeCaliper);
      coilSpring.position.set(0, 0.125, 0);
      strutGroup.add(coilSpring);

      // Electronic Damper Control (EDC) proportional solenoid valve module
      const edcValveGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.048, 14);
      edcValveGeo.rotateZ(Math.PI / 2);
      const edcValve = new THREE.Mesh(edcValveGeo, aluMat);
      edcValve.position.set(-side * 0.034, 0.16, 0.012);
      strutGroup.add(edcValve);

      // EDC harness connector pigtail
      const pigtailGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8);
      const pigtail = new THREE.Mesh(pigtailGeo, this.materials.rubberBlack);
      pigtail.position.set(-side * 0.052, 0.16, 0.012);
      strutGroup.add(pigtail);

      // Upper strut top mount hat with chassis triangulation studs
      const topHatGeo = new THREE.CylinderGeometry(0.056, 0.048, 0.024, 20);
      const topHat = new THREE.Mesh(topHatGeo, subMat);
      topHat.position.set(0, 0.37, 0);
      strutGroup.add(topHat);

      for (let s = 0; s < 3; s++) {
        const sAngle = (s / 3) * Math.PI * 2;
        const studGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8);
        const stud = new THREE.Mesh(studGeo, steelMat);
        stud.position.set(Math.cos(sAngle) * 0.042, 0.385, Math.sin(sAngle) * 0.042);
        strutGroup.add(stud);
      }

      // Slightly cant strut inwards for authentic negative kingpin angle
      strutGroup.rotation.z = -side * 0.06;
      this.frontStruts.push(strutGroup);
      this.frontSuspensionGroup.add(strutGroup);

      // 5. Articulated Sway Bar Drop Link (End Link) connecting sway bar to strut tab
      const dropLinkGroup = new THREE.Group();
      const dropRodGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.14, 10);
      const dropRod = new THREE.Mesh(dropRodGeo, steelMat);
      dropRod.position.set(0, 0.07, 0);
      dropLinkGroup.add(dropRod);

      const dropJointTop = this.createBallJoint(0.011);
      dropJointTop.position.set(0, 0.14, 0);
      dropLinkGroup.add(dropJointTop);

      const dropJointBottom = this.createBallJoint(0.011);
      dropJointBottom.position.set(0, 0, 0);
      dropLinkGroup.add(dropJointBottom);

      dropLinkGroup.position.set(side * 0.52, 0.20, 1.49);
      dropLinkGroup.rotation.z = side * 0.08;
      this.frontDropLinks.push(dropLinkGroup);
      this.frontSuspensionGroup.add(dropLinkGroup);
    }
  }

  // =========================================================================
  // 2. REAR FIVE-LINK INDEPENDENT SUSPENSION (BMW M Architecture)
  // =========================================================================
  private buildRearFiveLinkAxle() {
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const subMat = this.materials.subframeBlack;

    // --- A. Rear Multi-Link Subframe Cradle ---
    this.rearSubframe.name = 'RearSubframeCradle';

    // High-rigidity perimeter cradle frame (tubular steel)
    const cradleBarPoints = [
      new THREE.Vector3(-0.46, 0.22, -1.18),
      new THREE.Vector3(-0.48, 0.22, -1.44),
      new THREE.Vector3(0, 0.23, -1.48),
      new THREE.Vector3(0.48, 0.22, -1.44),
      new THREE.Vector3(0.46, 0.22, -1.18),
      new THREE.Vector3(0, 0.22, -1.14),
      new THREE.Vector3(-0.46, 0.22, -1.18),
    ];
    const cradleCurve = new THREE.CatmullRomCurve3(cradleBarPoints);
    const cradleGeo = new THREE.TubeGeometry(cradleCurve, 32, 0.022, 10, true);
    const cradleMesh = new THREE.Mesh(cradleGeo, subMat);
    this.rearSubframe.add(cradleMesh);

    // 4 Heavy-duty subframe-to-unibody rubber isolation bushings
    const rearBushCoords = [
      [-0.46, 0.23, -1.18],
      [0.46, 0.23, -1.18],
      [-0.48, 0.23, -1.44],
      [0.48, 0.23, -1.44],
    ];
    for (const [bx, by, bz] of rearBushCoords) {
      const bushGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.052, 16);
      const bush = new THREE.Mesh(bushGeo, this.materials.rubberBlack);
      bush.position.set(bx, by, bz);
      this.rearSubframe.add(bush);

      const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.065, 8);
      const bolt = new THREE.Mesh(boltGeo, steelMat);
      bolt.position.set(bx, by, bz);
      this.rearSubframe.add(bolt);
    }

    // Differential support mounting brackets (front and rear mounts)
    const diffMountGeo = new THREE.BoxGeometry(0.18, 0.04, 0.08);
    const diffMount = new THREE.Mesh(diffMountGeo, aluMat);
    diffMount.position.set(0, 0.24, -1.45);
    this.rearSubframe.add(diffMount);
    this.rearSuspensionGroup.add(this.rearSubframe);

    // --- B. Rear Anti-Roll Bar & End Links ---
    const rearBarPoints = [
      new THREE.Vector3(-0.56, 0.22, -1.42),
      new THREE.Vector3(-0.36, 0.20, -1.46),
      new THREE.Vector3(0, 0.20, -1.46),
      new THREE.Vector3(0.36, 0.20, -1.46),
      new THREE.Vector3(0.56, 0.22, -1.42),
    ];
    const rearBarCurve = new THREE.CatmullRomCurve3(rearBarPoints);
    const rearBarGeo = new THREE.TubeGeometry(rearBarCurve, 20, 0.011, 8, false);
    const rearSwayBar = new THREE.Mesh(rearBarGeo, subMat);
    this.rearSuspensionGroup.add(rearSwayBar);

    // --- C. Five Independent Links per side (Separate Spring & Damper) ---
    for (const side of [-1, 1]) {
      // 1. Cast Aluminum Wheel Carrier (Upright Hub)
      const carrierGroup = new THREE.Group();
      carrierGroup.position.set(side * 0.58, 0.338, -1.324);

      const carrierBodyGeo = new THREE.BoxGeometry(0.05, 0.20, 0.10);
      const carrierMesh = new THREE.Mesh(carrierBodyGeo, aluMat);
      carrierGroup.add(carrierMesh);

      const rearHubGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.04, 18);
      rearHubGeo.rotateZ(Math.PI / 2);
      const rearHub = new THREE.Mesh(rearHubGeo, steelMat);
      rearHub.position.set(side * 0.016, 0, 0);
      carrierGroup.add(rearHub);
      this.rearSuspensionGroup.add(carrierGroup);

      // 2. Link 1: Lower Control Arm / Spring Carrier (Wide, hollow-cast aluminum)
      const lowerArmGeo = new THREE.BoxGeometry(0.28, 0.034, 0.08);
      const lowerArm = new THREE.Mesh(lowerArmGeo, aluMat);
      lowerArm.position.set(side * 0.44, 0.17, -1.324);
      lowerArm.rotation.z = side * 0.06;
      this.rearArms.push(lowerArm);
      this.rearSuspensionGroup.add(lowerArm);

      // Lower spring isolator rubber cup on the lower arm
      const springCupGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.014, 16);
      const springCup = new THREE.Mesh(springCupGeo, this.materials.rubberBootBlack);
      springCup.position.set(side * 0.44, 0.19, -1.324);
      this.rearSuspensionGroup.add(springCup);

      // Separate Progressive Barrel Coil Spring (seated on lower arm)
      const rearSpring = this.createHelicalSpring(0.046, 0.24, 7, 0.008, this.materials.brakeCaliper);
      rearSpring.position.set(side * 0.44, 0.20, -1.324);
      this.rearSprings.push(rearSpring);
      this.rearSuspensionGroup.add(rearSpring);

      // Upper chassis spring cup
      const topCupGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.018, 16);
      const topCup = new THREE.Mesh(topCupGeo, subMat);
      topCup.position.set(side * 0.44, 0.43, -1.324);
      this.rearSuspensionGroup.add(topCup);

      // 3. Link 2: Upper Camber Wishbone
      const upperCamberGeo = new THREE.BoxGeometry(0.24, 0.022, 0.038);
      const upperCamber = new THREE.Mesh(upperCamberGeo, aluMat);
      upperCamber.position.set(side * 0.48, 0.43, -1.31);
      upperCamber.rotation.z = -side * 0.08;
      this.rearArms.push(upperCamber);
      this.rearSuspensionGroup.add(upperCamber);

      // 4. Link 3: Upper Guide Link (Transverse rod)
      const guideLinkGeo = new THREE.BoxGeometry(0.22, 0.020, 0.032);
      const guideLink = new THREE.Mesh(guideLinkGeo, aluMat);
      guideLink.position.set(side * 0.47, 0.41, -1.38);
      guideLink.rotation.z = -side * 0.06;
      this.rearArms.push(guideLink);
      this.rearSuspensionGroup.add(guideLink);

      // 5. Link 4: Trailing Link (Longitudinal thrust arm)
      const trailingPoints = [
        new THREE.Vector3(side * 0.44, 0.23, -1.08),
        new THREE.Vector3(side * 0.52, 0.24, -1.20),
        new THREE.Vector3(side * 0.56, 0.26, -1.28),
      ];
      const trailingCurve = new THREE.CatmullRomCurve3(trailingPoints);
      const trailingGeo = new THREE.TubeGeometry(trailingCurve, 14, 0.015, 8, false);
      const trailingArm = new THREE.Mesh(trailingGeo, aluMat);
      this.rearArms.push(trailingArm);
      this.rearSuspensionGroup.add(trailingArm);

      // Large rubber trailing bushing at chassis anchor
      const trailBushGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.042, 14);
      trailBushGeo.rotateX(Math.PI / 2);
      const trailBush = new THREE.Mesh(trailBushGeo, this.materials.rubberBlack);
      trailBush.position.set(side * 0.44, 0.23, -1.08);
      this.rearSuspensionGroup.add(trailBush);

      // 6. Link 5: Toe Control Track Rod with Eccentric Alignment Cam Washer
      const toeLinkGeo = new THREE.BoxGeometry(0.25, 0.022, 0.032);
      const toeLink = new THREE.Mesh(toeLinkGeo, steelMat);
      toeLink.position.set(side * 0.47, 0.20, -1.40);
      toeLink.rotation.z = side * 0.05;
      this.rearArms.push(toeLink);
      this.rearSuspensionGroup.add(toeLink);

      // Eccentric alignment washer & bolt
      const eccentricWasherGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 12);
      eccentricWasherGeo.rotateX(Math.PI / 2);
      const eccentricWasher = new THREE.Mesh(eccentricWasherGeo, this.materials.anodizedBlue);
      eccentricWasher.position.set(side * 0.35, 0.20, -1.40);
      this.rearSuspensionGroup.add(eccentricWasher);

      // 7. Rear Monotube Damper with Piggyback Reservoir & EDC Valve
      const damperGroup = new THREE.Group();
      damperGroup.name = `RearMAdaptiveDamper_${side > 0 ? 'R' : 'L'}`;
      damperGroup.position.set(side * 0.55, 0.22, -1.37);

      // Lower mounting eye with bonded rubber bushing
      const lowerEyeGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.036, 14);
      lowerEyeGeo.rotateX(Math.PI / 2);
      const lowerEye = new THREE.Mesh(lowerEyeGeo, this.materials.rubberBlack);
      damperGroup.add(lowerEye);

      // Monotube damper outer cylinder
      const tubeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.30, 20);
      const tube = new THREE.Mesh(tubeGeo, steelMat);
      tube.position.set(0, 0.16, 0);
      damperGroup.add(tube);

      // Piggyback auxiliary gas reservoir (authentic M monotube shock)
      const resGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 16);
      const res = new THREE.Mesh(resGeo, this.materials.anodizedBlue);
      res.position.set(-side * 0.036, 0.16, 0.018);
      damperGroup.add(res);

      const resClampGeo = new THREE.BoxGeometry(0.045, 0.02, 0.025);
      const resClamp = new THREE.Mesh(resClampGeo, aluMat);
      resClamp.position.set(-side * 0.018, 0.18, 0.01);
      damperGroup.add(resClamp);

      // EDC electronic valve module with wiring connector
      const edcGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.036, 12);
      edcGeo.rotateZ(Math.PI / 2);
      const edc = new THREE.Mesh(edcGeo, aluMat);
      edc.position.set(-side * 0.032, 0.24, -0.01);
      damperGroup.add(edc);

      // Damper upper piston rod and top chassis mount
      const rodGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.12, 12);
      const rod = new THREE.Mesh(rodGeo, steelMat);
      rod.position.set(0, 0.35, 0);
      damperGroup.add(rod);

      const topMountGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.028, 16);
      const topMount = new THREE.Mesh(topMountGeo, this.materials.rubberBlack);
      topMount.position.set(0, 0.41, 0);
      damperGroup.add(topMount);

      damperGroup.rotation.z = -side * 0.08;
      this.rearDampers.push(damperGroup);
      this.rearSuspensionGroup.add(damperGroup);
    }
  }

  // Kinematic Updates
  public update(
    explodeFactor: number,
    steeringAngleDeg: number,
    vehicleSpeedKmh: number,
    leftWheelRpm: number,
    rightWheelRpm: number
  ) {
    // Steer front knuckles smoothly with Ackermann geometry and dynamic camber/caster tilt
    const steerRad = (steeringAngleDeg * Math.PI) / 180;
    const ackermannFL = steerRad > 0 ? 1.05 : 0.95;
    const ackermannFR = steerRad > 0 ? 0.95 : 1.05;
    const staticCamber = 0.0; // 0° static camber at neutral steering (perfectly vertical, no tilt)
    const dynamicCamberGain = 0.12; // Dynamic camber tilt active only when steering angle is applied
    const casterPitch = -steerRad * 0.04;

    const camberFL = staticCamber + steerRad * dynamicCamberGain;
    const camberFR = staticCamber + steerRad * dynamicCamberGain;

    this.leftKnuckle.rotation.order = 'YXZ';
    this.leftKnuckle.rotation.y = steerRad * ackermannFL;
    this.leftKnuckle.rotation.z = camberFL;
    this.leftKnuckle.rotation.x = casterPitch;

    this.rightKnuckle.rotation.order = 'YXZ';
    this.rightKnuckle.rotation.y = steerRad * ackermannFR;
    this.rightKnuckle.rotation.z = camberFR;
    this.rightKnuckle.rotation.x = casterPitch;

    // Steering rack moves laterally with steering input
    const rackTravel = -(steeringAngleDeg / 35) * 0.055;
    this.rackCenterBar.position.x = rackTravel;
    this.leftTieRod.position.x = -0.44 + rackTravel * 0.5;
    this.rightTieRod.position.x = 0.44 + rackTravel * 0.5;

    // Scale rubber bellows accordion dynamically with rack stroke
    this.leftBellows.scale.x = 1.0 - rackTravel * 4.0;
    this.rightBellows.scale.x = 1.0 + rackTravel * 4.0;

    // Rotate front wheels when isolated WheelModel is active
    const dt = 0.016;
    const avgWheelRpm = (leftWheelRpm + rightWheelRpm) / 2;
    const frontWheelAdvance = (avgWheelRpm / 60) * (2 * Math.PI) * dt;
    this.leftWheelModel.updateRotation(frontWheelAdvance);
    this.rightWheelModel.updateRotation(frontWheelAdvance);

    // Exploded View Kinematics
    if (explodeFactor > 0.001) {
      // Front and rear subframe assemblies separate longitudinally and downward
      this.frontSuspensionGroup.position.set(0, -explodeFactor * 0.18, explodeFactor * 0.28);
      this.rearSuspensionGroup.position.set(0, -explodeFactor * 0.18, -explodeFactor * 0.28);

      // Knuckles extend laterally outward
      this.leftKnuckle.position.x = -0.58 - explodeFactor * 0.20;
      this.rightKnuckle.position.x = 0.58 + explodeFactor * 0.20;
    } else {
      this.frontSuspensionGroup.position.set(0, 0, 0);
      this.rearSuspensionGroup.position.set(0, 0, 0);
      this.leftKnuckle.position.x = -0.58;
      this.rightKnuckle.position.x = 0.58;
    }
  }
}

