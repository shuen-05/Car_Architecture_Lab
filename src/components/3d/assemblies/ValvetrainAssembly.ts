import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { calculateValveLifts } from '../../../utils/math';

export class ValvetrainAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;
  private intakeCamshaft: THREE.Group;
  private exhaustCamshaft: THREE.Group;
  private intakeValves: THREE.Group[] = [];
  private exhaustValves: THREE.Group[] = [];
  private intakeSprings: THREE.Group[] = [];
  private exhaustSprings: THREE.Group[] = [];
  private directInjectors: THREE.Mesh[] = [];
  private sparkPlugs: THREE.Mesh[] = [];
  private ignitionCoils: THREE.Mesh[] = [];
  private timingChain: THREE.Mesh;
  private fuelRailGroup: THREE.Group;
  private bearingCapsGroup: THREE.Group;

  // S58 6-cylinder bore centers along Z
  private cylinderZOffsets = [0.2275, 0.1365, 0.0455, -0.0455, -0.1365, -0.2275];

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'S58ValvetrainAssembly';

    this.intakeCamshaft = new THREE.Group();
    this.exhaustCamshaft = new THREE.Group();
    this.timingChain = new THREE.Mesh();
    this.fuelRailGroup = new THREE.Group();
    this.bearingCapsGroup = new THREE.Group();

    this.buildCamshafts();
    this.buildValves();
    this.buildDirectInjectorsAndIgnition();
    this.buildHighPressureFuelRail();

    this.group.add(
      this.intakeCamshaft,
      this.exhaustCamshaft,
      this.bearingCapsGroup,
      this.fuelRailGroup
    );
  }

  private buildCamshafts() {
    const steelMat = this.materials.polishedSteel;
    const gearMat = this.materials.gearSteel;
    const vanosMat = this.materials.engineAluminum;

    // S58 DOHC Intake Camshaft with Valvetronic eccentric actuator (Left side, X = -0.038)
    const intakeShaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.58, 16);
    intakeShaftGeo.rotateX(Math.PI / 2);
    const intakeShaft = new THREE.Mesh(intakeShaftGeo, steelMat);
    this.intakeCamshaft.add(intakeShaft);

    // Double-VANOS Intake Variable Phaser Unit (Hydraulic vane phaser)
    const vanosInGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.045, 24);
    vanosInGeo.rotateX(Math.PI / 2);
    const vanosIn = new THREE.Mesh(vanosInGeo, vanosMat);
    vanosIn.position.set(0, 0, 0.30);
    this.intakeCamshaft.add(vanosIn);

    // S58 DOHC Exhaust Camshaft (Right side, X = +0.038)
    const exhaustShaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.58, 16);
    exhaustShaftGeo.rotateX(Math.PI / 2);
    const exhaustShaft = new THREE.Mesh(exhaustShaftGeo, steelMat);
    this.exhaustCamshaft.add(exhaustShaft);

    // Double-VANOS Exhaust Variable Phaser Unit
    const vanosExGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.040, 24);
    vanosExGeo.rotateX(Math.PI / 2);
    const vanosEx = new THREE.Mesh(vanosExGeo, gearMat);
    vanosEx.position.set(0, 0, 0.30);
    this.exhaustCamshaft.add(vanosEx);

    // Electro-hydraulic VANOS fast-switching solenoids (Front face)
    for (const sideX of [-0.038, 0.038]) {
      const solGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.035, 16);
      solGeo.rotateX(Math.PI / 2);
      const sol = new THREE.Mesh(solGeo, this.materials.subframeBlack);
      sol.position.set(sideX, 0.38, 0.34);
      this.bearingCapsGroup.add(sol);
    }

    // 14 Precision CNC Camshaft Bearing Caps (7 per camshaft, stationary on head)
    const capZOffsets = [0.28, 0.182, 0.091, 0.0, -0.091, -0.182, -0.28];
    for (const camX of [-0.038, 0.038]) {
      for (const capZ of capZOffsets) {
        const capGeo = new THREE.BoxGeometry(0.024, 0.015, 0.014);
        const cap = new THREE.Mesh(capGeo, vanosMat);
        cap.position.set(camX, 0.39, capZ);
        this.bearingCapsGroup.add(cap);

        // Dual Torx cap bolts
        for (const bx of [-0.009, 0.009]) {
          const boltGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.018, 8);
          const bolt = new THREE.Mesh(boltGeo, steelMat);
          bolt.position.set(camX + bx, 0.398, capZ);
          this.bearingCapsGroup.add(bolt);
        }
      }
    }

    // Cam lobes for all 6 cylinders (2 intake + 2 exhaust per cylinder = 24 lobes total)
    for (let i = 0; i < 6; i++) {
      const z = this.cylinderZOffsets[i];
      const lobeAngle = (i * (2 * Math.PI)) / 6;

      // 2 intake lobes per cylinder
      for (const offset of [-0.015, 0.015]) {
        const lobe = this.createCamLobe();
        lobe.position.set(0, 0, z + offset);
        lobe.rotation.z = lobeAngle;
        this.intakeCamshaft.add(lobe);
      }
      // 2 exhaust lobes per cylinder
      for (const offset of [-0.015, 0.015]) {
        const lobe = this.createCamLobe();
        lobe.position.set(0, 0, z + offset);
        lobe.rotation.z = lobeAngle + Math.PI / 2;
        this.exhaustCamshaft.add(lobe);
      }
    }

    this.intakeCamshaft.position.set(-0.038, 0.38, 0);
    this.exhaustCamshaft.position.set(0.038, 0.38, 0);

    // Timing Chain loop connecting crankshaft to Double-VANOS sprockets
    const chainPoints = [
      new THREE.Vector3(-0.038, 0.38, 0.30),
      new THREE.Vector3(0.038, 0.38, 0.30),
      new THREE.Vector3(0.042, 0.0, 0.30),
      new THREE.Vector3(-0.042, 0.0, 0.30),
    ];
    const chainCurve = new THREE.CatmullRomCurve3(chainPoints, true);
    const chainGeo = new THREE.TubeGeometry(chainCurve, 32, 0.005, 8, true);
    this.timingChain = new THREE.Mesh(chainGeo, this.materials.castIron);
    this.group.add(this.timingChain);
  }

  private createCamLobe(): THREE.Mesh {
    const lobeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16);
    lobeGeo.rotateX(Math.PI / 2);
    lobeGeo.scale(1.0, 1.45, 1.0); // authentic egg shape profile
    const lobe = new THREE.Mesh(lobeGeo, this.materials.polishedSteel);
    return lobe;
  }

  // Helical valve spring generator with titanium retainer cap
  private createValveSpring(): THREE.Group {
    const springGroup = new THREE.Group();
    const turns = 6;
    const radius = 0.0085;
    const height = 0.040;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= turns * 16; i++) {
      const t = i / (turns * 16);
      const angle = t * turns * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, t * height, Math.sin(angle) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const springGeo = new THREE.TubeGeometry(curve, turns * 16, 0.0012, 6, false);
    const springMesh = new THREE.Mesh(springGeo, this.materials.polishedSteel);
    springGroup.add(springMesh);

    // Titanium spring retainer cap on top
    const capGeo = new THREE.CylinderGeometry(0.0105, 0.0075, 0.003, 16);
    const cap = new THREE.Mesh(capGeo, this.materials.engineAluminum);
    cap.position.set(0, height, 0);
    springGroup.add(cap);

    return springGroup;
  }

  private buildValves() {
    const valveMat = this.materials.polishedSteel;

    // 24 Valves: 12 Intake Valves + 12 Exhaust Valves across 6 cylinders
    for (let cyl = 0; cyl < 6; cyl++) {
      const z = this.cylinderZOffsets[cyl];

      // 2 Intake Valves
      for (const zOffset of [-0.015, 0.015]) {
        const valveGroup = new THREE.Group();
        valveGroup.position.set(-0.032, 0.33, z + zOffset);

        // Stem & Poppet Head
        const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.09, 12);
        const stem = new THREE.Mesh(stemGeo, valveMat);
        valveGroup.add(stem);

        const headGeo = new THREE.ConeGeometry(0.0165, 0.008, 16);
        const head = new THREE.Mesh(headGeo, valveMat);
        head.rotation.x = Math.PI;
        head.position.set(0, -0.045, 0);
        valveGroup.add(head);

        // Dual helical valve spring
        const spring = this.createValveSpring();
        spring.position.set(0, -0.01, 0);
        valveGroup.add(spring);
        this.intakeSprings.push(spring);

        this.intakeValves.push(valveGroup);
        this.group.add(valveGroup);
      }

      // 2 Exhaust Valves (Sodium-cooled motorsport exhaust valves)
      for (const zOffset of [-0.015, 0.015]) {
        const valveGroup = new THREE.Group();
        valveGroup.position.set(0.032, 0.33, z + zOffset);

        const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.09, 12);
        const stem = new THREE.Mesh(stemGeo, valveMat);
        valveGroup.add(stem);

        const headGeo = new THREE.ConeGeometry(0.0145, 0.008, 16);
        const head = new THREE.Mesh(headGeo, valveMat);
        head.rotation.x = Math.PI;
        head.position.set(0, -0.045, 0);
        valveGroup.add(head);

        const spring = this.createValveSpring();
        spring.position.set(0, -0.01, 0);
        valveGroup.add(spring);
        this.exhaustSprings.push(spring);

        this.exhaustValves.push(valveGroup);
        this.group.add(valveGroup);
      }
    }
  }

  private buildDirectInjectorsAndIgnition() {
    const injMat = this.materials.chromeTrim;
    const coilMat = this.materials.intakePlastic;
    const bootMat = this.materials.rubberBlack;

    // 6 cylinders: 6 Spark Plugs + 6 High Precision 350-bar Direct Injectors
    for (let i = 0; i < 6; i++) {
      const z = this.cylinderZOffsets[i];

      // Central Spark Plug: threaded metal shell + ribbed ceramic insulator
      const plugGroup = new THREE.Group();
      plugGroup.position.set(0, 0.32, z);

      const plugShellGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.04, 12);
      const plugShell = new THREE.Mesh(plugShellGeo, this.materials.engineAluminum);
      plugGroup.add(plugShell);

      const insulatorGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.04, 12);
      const insulator = new THREE.Mesh(insulatorGeo, this.materials.rimSilver);
      insulator.position.set(0, 0.035, 0);
      plugGroup.add(insulator);

      this.sparkPlugs.push(plugGroup as unknown as THREE.Mesh);
      this.group.add(plugGroup);

      // Pencil Ignition Coil on top with rubber boot seal
      const coilGroup = new THREE.Group();
      coilGroup.position.set(0, 0.385, z);

      const coilBodyGeo = new THREE.BoxGeometry(0.03, 0.045, 0.03);
      const coilBody = new THREE.Mesh(coilBodyGeo, coilMat);
      coilGroup.add(coilBody);

      const bootGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12);
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(0, -0.03, 0);
      coilGroup.add(boot);

      this.ignitionCoils.push(coilGroup as unknown as THREE.Mesh);
      this.group.add(coilGroup);

      // S58 350-bar High Precision Direct Injector (HPI)
      const diGroup = new THREE.Group();
      diGroup.position.set(-0.025, 0.33, z);
      diGroup.rotation.z = 0.25;

      const diBodyGeo = new THREE.CylinderGeometry(0.005, 0.007, 0.065, 12);
      const diBody = new THREE.Mesh(diBodyGeo, injMat);
      diGroup.add(diBody);

      const diPlugGeo = new THREE.BoxGeometry(0.008, 0.012, 0.012);
      const diPlug = new THREE.Mesh(diPlugGeo, this.materials.subframeBlack);
      diPlug.position.set(-0.006, 0.02, 0);
      diGroup.add(diPlug);

      this.directInjectors.push(diGroup as unknown as THREE.Mesh);
      this.group.add(diGroup);
    }
  }

  // S58 Forged Stainless Steel 350-bar High-Pressure Fuel Rail
  private buildHighPressureFuelRail() {
    const railMat = this.materials.polishedSteel;

    // Longitudinal main fuel rail pipe
    const railGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.54, 16);
    railGeo.rotateX(Math.PI / 2);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(-0.032, 0.365, 0);
    this.fuelRailGroup.add(rail);

    // 6 high-pressure feed pipes branching down to each direct injector
    for (let i = 0; i < 6; i++) {
      const z = this.cylinderZOffsets[i];
      const pipeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.04, 8);
      pipeGeo.rotateZ(0.25);
      const pipe = new THREE.Mesh(pipeGeo, railMat);
      pipe.position.set(-0.028, 0.345, z);
      this.fuelRailGroup.add(pipe);
    }

    // High-Pressure Fuel Sensor at front of rail
    const sensorGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.022, 12);
    sensorGeo.rotateX(Math.PI / 2);
    const sensor = new THREE.Mesh(sensorGeo, this.materials.brassBronze);
    sensor.position.set(-0.032, 0.365, 0.28);
    this.fuelRailGroup.add(sensor);
  }

  public update(crankAngleRad: number, explodeFactor: number) {
    // Camshafts rotate at exactly 1/2 crankshaft speed
    const camAngle = crankAngleRad * 0.5;
    this.intakeCamshaft.rotation.z = camAngle;
    this.exhaustCamshaft.rotation.z = camAngle;

    // Poppet Valve lift and spring compression animations across all 6 cylinders
    for (let cyl = 0; cyl < 6; cyl++) {
      const lifts = calculateValveLifts(crankAngleRad, cyl);

      // Intake valves (2 per cylinder)
      const intakePushY = -(lifts.intakeLiftMm / 1000) * 1.5;
      const iIdx1 = cyl * 2;
      const iIdx2 = cyl * 2 + 1;

      if (this.intakeValves[iIdx1]) {
        this.intakeValves[iIdx1].position.y = 0.33 + intakePushY;
        if (this.intakeSprings[iIdx1]) {
          this.intakeSprings[iIdx1].scale.y = Math.max(0.65, 1.0 + intakePushY * 16);
        }
      }
      if (this.intakeValves[iIdx2]) {
        this.intakeValves[iIdx2].position.y = 0.33 + intakePushY;
        if (this.intakeSprings[iIdx2]) {
          this.intakeSprings[iIdx2].scale.y = Math.max(0.65, 1.0 + intakePushY * 16);
        }
      }

      // Exhaust valves (2 per cylinder)
      const exhaustPushY = -(lifts.exhaustLiftMm / 1000) * 1.5;
      const eIdx1 = cyl * 2;
      const eIdx2 = cyl * 2 + 1;

      if (this.exhaustValves[eIdx1]) {
        this.exhaustValves[eIdx1].position.y = 0.33 + exhaustPushY;
        if (this.exhaustSprings[eIdx1]) {
          this.exhaustSprings[eIdx1].scale.y = Math.max(0.65, 1.0 + exhaustPushY * 16);
        }
      }
      if (this.exhaustValves[eIdx2]) {
        this.exhaustValves[eIdx2].position.y = 0.33 + exhaustPushY;
        if (this.exhaustSprings[eIdx2]) {
          this.exhaustSprings[eIdx2].scale.y = Math.max(0.65, 1.0 + exhaustPushY * 16);
        }
      }
    }

    // Exploded view offsets: Valvetrain moves upward (+Y)
    const explodeY = explodeFactor * 0.45;
    this.intakeCamshaft.position.y = 0.38 + explodeY;
    this.exhaustCamshaft.position.y = 0.38 + explodeY;
    this.bearingCapsGroup.position.y = explodeY;
    this.fuelRailGroup.position.y = explodeY * 1.1;
    this.timingChain.position.y = explodeY * 0.5;

    this.ignitionCoils.forEach((coil) => {
      coil.position.y = 0.385 + explodeY * 1.3;
    });

    this.sparkPlugs.forEach((plug) => {
      plug.position.y = 0.32 + explodeY * 1.1;
    });

    this.directInjectors.forEach((di) => {
      di.position.x = -0.025 - explodeFactor * 0.15;
    });
  }
}
