import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';

export class RotatingAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;
  private crankshaftGroup: THREE.Group;
  private pistons: THREE.Group[] = [];
  private connectingRods: THREE.Group[] = [];
  private sparkFlashes: THREE.Mesh[] = [];
  private crankPulley: THREE.Mesh;

  // Authentic BMW S58 Inline-6: 84mm bore, 91mm bore spacing, 6 cylinders
  // Z positions centered around 0
  private cylinderZOffsets = [0.2275, 0.1365, 0.0455, -0.0455, -0.1365, -0.2275]; // Cylinders 1 through 6
  
  // Crank throws: 120-degree split crankshaft (balanced primary and secondary harmonics)
  // Cylinders 1 & 6 paired at 0 rad
  // Cylinders 2 & 5 paired at 4*PI/3 rad (240°)
  // Cylinders 3 & 4 paired at 2*PI/3 rad (120°)
  private crankThrowAngles = [
    0,
    (4 * Math.PI) / 3,
    (2 * Math.PI) / 3,
    (2 * Math.PI) / 3,
    (4 * Math.PI) / 3,
    0,
  ];

  // S58 1-5-3-6-2-4 firing cycle angles (0 to 4*PI rad)
  private firingAngles = [
    0,
    (8 * Math.PI) / 3, // Cyl 2: 480°
    (4 * Math.PI) / 3, // Cyl 3: 240°
    (10 * Math.PI) / 3, // Cyl 4: 600°
    (2 * Math.PI) / 3,  // Cyl 5: 120°
    2 * Math.PI,        // Cyl 6: 360°
  ];

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'S58RotatingAssembly';

    this.crankshaftGroup = new THREE.Group();
    this.crankPulley = new THREE.Mesh();

    this.buildCrankshaft();
    this.buildPistonsAndRods();

    this.group.add(this.crankshaftGroup);
  }

  private buildCrankshaft() {
    const steelMat = this.materials.polishedSteel;
    const ironMat = this.materials.castIron;
    const bronzeMat = this.materials.brassBronze;

    // Forged lightweight nitrided steel crankshaft (7 main bearings for S58 I6)
    const mainShaftGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.58, 24);
    mainShaftGeo.rotateX(Math.PI / 2);
    const mainShaft = new THREE.Mesh(mainShaftGeo, steelMat);
    this.crankshaftGroup.add(mainShaft);

    // Front Harmonic Vibration Damper Pulley with multi-groove serpentine belt track
    const pulleyGroup = new THREE.Group();
    const damperOuterGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.035, 32);
    damperOuterGeo.rotateX(Math.PI / 2);
    const damperOuter = new THREE.Mesh(damperOuterGeo, ironMat);
    pulleyGroup.add(damperOuter);

    // Serpentine multi-rib grooves on damper outer ring
    for (let r = -2; r <= 2; r++) {
      const grooveGeo = new THREE.TorusGeometry(0.083, 0.0018, 8, 32);
      const groove = new THREE.Mesh(grooveGeo, this.materials.rubberBlack);
      groove.position.set(0, 0, r * 0.006);
      pulleyGroup.add(groove);
    }

    // Damper elastomer rubber ring cushion
    const rubberRingGeo = new THREE.TorusGeometry(0.065, 0.005, 8, 32);
    const rubberRing = new THREE.Mesh(rubberRingGeo, this.materials.rubberBlack);
    pulleyGroup.add(rubberRing);

    pulleyGroup.position.set(0, 0, 0.31);
    this.crankPulley = damperOuter;
    this.crankshaftGroup.add(pulleyGroup);

    // Rear lightweight dual-mass flywheel / torque converter flexplate
    const flywheelGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.022, 36);
    flywheelGeo.rotateX(Math.PI / 2);
    const flywheel = new THREE.Mesh(flywheelGeo, steelMat);
    flywheel.position.set(0, 0, -0.31);
    this.crankshaftGroup.add(flywheel);

    // Starter ring gear on flywheel circumference (138 teeth)
    const ringGearGeo = new THREE.TorusGeometry(0.124, 0.004, 12, 48);
    const ringGear = new THREE.Mesh(ringGearGeo, this.materials.gearSteel);
    ringGear.position.set(0, 0, -0.31);
    this.crankshaftGroup.add(ringGear);

    // 12 precision counterweights & 6 rod journals
    for (let i = 0; i < 6; i++) {
      const z = this.cylinderZOffsets[i];
      const throwAngle = this.crankThrowAngles[i];

      // Counterweight with chamfered aerodynamic motorsport profile
      const cwGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.014, 20, 1, false, 0, Math.PI);
      cwGeo.rotateX(Math.PI / 2);

      for (const zOff of [-0.016, 0.016]) {
        const cw = new THREE.Mesh(cwGeo, steelMat);
        cw.rotation.z = throwAngle + Math.PI; // opposite crank throw
        cw.position.set(0, 0, z + zOff);
        this.crankshaftGroup.add(cw);

        // Factory dynamic balance drill lightening holes in counterweights
        for (let b = -1; b <= 1; b++) {
          const drillGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 12);
          drillGeo.rotateX(Math.PI / 2);
          const drill = new THREE.Mesh(drillGeo, this.materials.castIron);
          const bAngle = throwAngle + Math.PI + b * 0.45;
          drill.position.set(Math.cos(bAngle) * 0.048, Math.sin(bAngle) * 0.048, z + zOff);
          this.crankshaftGroup.add(drill);
        }
      }

      // Rod journal pin (S58 stroke = 90mm -> radius r = 0.045m)
      const pinGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.024, 20);
      pinGeo.rotateX(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, steelMat);
      const pinX = Math.sin(throwAngle) * 0.045;
      const pinY = Math.cos(throwAngle) * 0.045;
      pin.position.set(pinX, pinY, z);
      this.crankshaftGroup.add(pin);

      // Journal cross-drilled oil passage hole
      const oilHoleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.025, 8);
      const oilHole = new THREE.Mesh(oilHoleGeo, this.materials.castIron);
      oilHole.position.set(pinX, pinY, z);
      this.crankshaftGroup.add(oilHole);
    }
  }

  private buildPistonsAndRods() {
    const pistonMat = this.materials.engineAluminum;
    const rodMat = this.materials.polishedSteel;
    const steelMat = this.materials.polishedSteel;
    const sparkMat = this.materials.sparkFlameEmissive;
    const bronzeMat = this.materials.brassBronze;
    const ironMat = this.materials.castIron;
    const skirtMat = this.materials.shadowlineGloss; // Graphite anti-friction coating

    const rodLength = 0.1444; // 144.4mm

    for (let i = 0; i < 6; i++) {
      const z = this.cylinderZOffsets[i];

      // ==========================================
      // 1. Motorsport Forged H-Beam Connecting Rod
      // ==========================================
      const rodGroup = new THREE.Group();
      rodGroup.position.set(0, 0, z);

      // Big-End Journal & Bearing Shell
      const bigEndShellGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.024, 24);
      bigEndShellGeo.rotateX(Math.PI / 2);
      const bigEndShell = new THREE.Mesh(bigEndShellGeo, rodMat);
      rodGroup.add(bigEndShell);

      // Big-End Bronze/Tri-Metal Bearing Insert
      const bearingGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.023, 24, 1, true);
      bearingGeo.rotateX(Math.PI / 2);
      const bearing = new THREE.Mesh(bearingGeo, bronzeMat);
      rodGroup.add(bearing);

      // Dual ARP-Style High-Tensile 12-Point Rod Cap Bolts
      for (const boltX of [-0.022, 0.022]) {
        const boltGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.032, 12);
        const bolt = new THREE.Mesh(boltGeo, this.materials.subframeBlack);
        bolt.position.set(boltX, -0.010, 0);
        rodGroup.add(bolt);
      }

      // True H-Beam Rod Profile: Central Web + Front/Rear Flanges
      const webGeo = new THREE.BoxGeometry(0.007, rodLength * 0.72, 0.016);
      const web = new THREE.Mesh(webGeo, rodMat);
      web.position.set(0, rodLength * 0.50, 0);
      rodGroup.add(web);

      for (const flangeZ of [-0.009, 0.009]) {
        const flangeGeo = new THREE.BoxGeometry(0.016, rodLength * 0.72, 0.0035);
        const flange = new THREE.Mesh(flangeGeo, rodMat);
        flange.position.set(0, rodLength * 0.50, flangeZ);
        rodGroup.add(flange);
      }

      // Small-End Eye (at Y = rodLength)
      const smallEndGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.022, 20);
      smallEndGeo.rotateX(Math.PI / 2);
      const smallEnd = new THREE.Mesh(smallEndGeo, rodMat);
      smallEnd.position.set(0, rodLength, 0);
      rodGroup.add(smallEnd);

      // Small-End Bronze Bushing for Wrist Pin
      const bushGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.023, 16, 1, true);
      bushGeo.rotateX(Math.PI / 2);
      const bush = new THREE.Mesh(bushGeo, bronzeMat);
      bush.position.set(0, rodLength, 0);
      rodGroup.add(bush);

      this.connectingRods.push(rodGroup);
      this.group.add(rodGroup);

      // ==========================================
      // 2. High-Performance Forged Piston (84mm)
      // ==========================================
      const pistonGroup = new THREE.Group();
      pistonGroup.position.set(0, 0.190, z);

      // Piston Crown & Body Monoblock
      const crownGeo = new THREE.CylinderGeometry(0.0418, 0.0418, 0.048, 32);
      const crown = new THREE.Mesh(crownGeo, pistonMat);
      crown.castShadow = true;
      pistonGroup.add(crown);

      // Central Combustion Dish on Crown (9.3:1 compression ratio chamber)
      const dishGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.003, 24);
      const dish = new THREE.Mesh(dishGeo, this.materials.subframeBlack);
      dish.position.set(0, 0.023, 0);
      pistonGroup.add(dish);

      // CNC Machined Valve Relief Pockets on Piston Crown
      // 2 Intake Valve Reliefs (Left side, X = -0.016, Z = +/- 0.012)
      for (const vz of [-0.012, 0.012]) {
        const inReliefGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.004, 16);
        const inRelief = new THREE.Mesh(inReliefGeo, this.materials.subframeBlack);
        inRelief.position.set(-0.016, 0.023, vz);
        pistonGroup.add(inRelief);
      }
      // 2 Exhaust Valve Reliefs (Right side, X = +0.016, Z = +/- 0.012)
      for (const vz of [-0.012, 0.012]) {
        const exReliefGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.004, 16);
        const exRelief = new THREE.Mesh(exReliefGeo, this.materials.subframeBlack);
        exRelief.position.set(0.016, 0.023, vz);
        pistonGroup.add(exRelief);
      }

      // Graphite-Coated Anti-Friction Slipper Skirt Panels
      for (const sideX of [-0.0419, 0.0419]) {
        const skirtGeo = new THREE.BoxGeometry(0.0015, 0.028, 0.038);
        const skirt = new THREE.Mesh(skirtGeo, skirtMat);
        skirt.position.set(sideX, -0.010, 0);
        pistonGroup.add(skirt);
      }

      // 3 Visible Ring Lands (Top Compression, 2nd Scraper, 3-Piece Oil Ring)
      const ringHeights = [0.014, 0.007, -0.001];
      const ringMats = [steelMat, ironMat, bronzeMat];
      for (let r = 0; r < 3; r++) {
        const ringGeo = new THREE.TorusGeometry(0.0422, 0.0010, 8, 32);
        ringGeo.rotateX(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, ringMats[r]);
        ring.position.set(0, ringHeights[r], 0);
        pistonGroup.add(ring);
      }

      // High-Strength Nitrided Hollow Gudgeon Wrist Pin
      const wristPinGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.056, 20);
      wristPinGeo.rotateX(Math.PI / 2);
      const wristPin = new THREE.Mesh(wristPinGeo, steelMat);
      wristPin.position.set(0, -0.007, 0);
      pistonGroup.add(wristPin);

      // Hollow Pin Inner Bore
      const pinInnerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.057, 16);
      pinInnerGeo.rotateX(Math.PI / 2);
      const pinInner = new THREE.Mesh(pinInnerGeo, this.materials.subframeBlack);
      pinInner.position.set(0, -0.007, 0);
      pistonGroup.add(pinInner);

      this.pistons.push(pistonGroup);
      this.group.add(pistonGroup);

      // Combustion Flame Flash (at spark ignition)
      const flameGeo = new THREE.SphereGeometry(0.038, 16, 12);
      const flame = new THREE.Mesh(flameGeo, sparkMat);
      flame.scale.set(1.0, 0.45, 1.0);
      flame.position.set(0, 0.245, z);
      flame.visible = false;
      this.sparkFlashes.push(flame);
      this.group.add(flame);
    }
  }

  public update(crankAngleRad: number, explodeFactor: number) {
    // Rotate crankshaft
    this.crankshaftGroup.rotation.z = crankAngleRad;

    // Kinematics for S58 6-cylinder engine
    const r = 0.045; // S58 crank throw radius = 45mm (90mm stroke)
    const l = 0.1444; // S58 rod length = 144.4mm

    for (let i = 0; i < 6; i++) {
      const theta = crankAngleRad + this.crankThrowAngles[i];
      // Crank pin location
      const pinX = -Math.sin(theta) * r;
      const pinY = Math.cos(theta) * r;

      // Piston wristpin height: Y = pinY + sqrt(l^2 - pinX^2)
      const wristPinY = pinY + Math.sqrt(l * l - pinX * pinX);

      // Exploded offset moves pistons up progressively
      const explodeY = explodeFactor * (0.15 + i * 0.025);

      // Entire piston group moves with the wrist pin
      this.pistons[i].position.y = wristPinY + 0.007 + explodeY;

      // Rod kinematics: Big end at crank pin, Small end at piston wristpin
      const rodGroup = this.connectingRods[i];
      rodGroup.position.set(pinX, pinY, this.cylinderZOffsets[i]);

      // Rod angle
      const rodAngle = Math.atan2(pinX, wristPinY - pinY);
      rodGroup.rotation.z = -rodAngle;

      // S58 1-5-3-6-2-4 firing order flash
      const cycleAngle = ((crankAngleRad % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
      const diff = Math.abs(cycleAngle - this.firingAngles[i]);
      const isFiring = diff < 0.20 || diff > 4 * Math.PI - 0.20;
      this.sparkFlashes[i].visible = isFiring && explodeFactor < 0.6;
      this.sparkFlashes[i].position.y = this.pistons[i].position.y + 0.035;
    }

    // Explode crankshaft downwards (-Y)
    this.crankshaftGroup.position.y = -explodeFactor * 0.35;
  }
}
