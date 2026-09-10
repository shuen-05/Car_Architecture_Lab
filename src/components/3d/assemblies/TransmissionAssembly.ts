import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { SubsystemId } from '../../../types/powertrain';

export class TransmissionAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  // Torque Converter Components
  private torqueConverterGroup: THREE.Group;
  private impellerPump: THREE.Group;
  private statorSprag: THREE.Group;
  private turbineRunner: THREE.Group;
  private lockupClutchDisc: THREE.Mesh;

  // Transmission Case & Internal Housing
  private transCase: THREE.Group;
  private valveBodyGroup: THREE.Group;
  private outputShaft: THREE.Mesh;
  private clutchPacks: THREE.Group;

  // Epicyclic Planetary Gearsets (Lepelletier Train)
  private planetarySet1: THREE.Group;
  private sunGear1: THREE.Mesh;
  private carrier1: THREE.Group;
  private planetPinions1: THREE.Mesh[] = [];
  private ringGear1: THREE.Mesh;

  private planetarySet2: THREE.Group;
  private sunGear2: THREE.Mesh;
  private carrier2: THREE.Group;
  private planetPinions2: THREE.Mesh[] = [];
  private ringGear2: THREE.Mesh;

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'TransmissionAssembly';

    this.torqueConverterGroup = new THREE.Group();
    this.impellerPump = new THREE.Group();
    this.statorSprag = new THREE.Group();
    this.turbineRunner = new THREE.Group();
    this.lockupClutchDisc = new THREE.Mesh();

    this.transCase = new THREE.Group();
    this.valveBodyGroup = new THREE.Group();
    this.outputShaft = new THREE.Mesh();
    this.clutchPacks = new THREE.Group();

    this.planetarySet1 = new THREE.Group();
    this.sunGear1 = new THREE.Mesh();
    this.carrier1 = new THREE.Group();
    this.ringGear1 = new THREE.Mesh();

    this.planetarySet2 = new THREE.Group();
    this.sunGear2 = new THREE.Mesh();
    this.carrier2 = new THREE.Group();
    this.ringGear2 = new THREE.Mesh();

    this.buildTorqueConverter();
    this.buildTransmissionCase();
    this.buildPlanetaryGearsets();
    this.buildValveBody();

    this.group.add(
      this.torqueConverterGroup,
      this.transCase,
      this.valveBodyGroup,
      this.planetarySet1,
      this.planetarySet2,
      this.clutchPacks,
      this.outputShaft
    );

    // Position behind engine: Z = 0.69, tunnel height Y = 0.32m
    this.group.position.set(0, 0.32, 0.69);
  }

  private buildTorqueConverter() {
    const steelMat = this.materials.polishedSteel;
    const aluMat = this.materials.engineAluminum;
    const bronzeMat = this.materials.brassBronze;

    // 1. Impeller Pump (driven by engine flexplate)
    const impellerShellGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.05, 32, 1, false, 0, Math.PI * 2);
    const impellerShell = new THREE.Mesh(impellerShellGeo, steelMat);
    impellerShell.rotation.x = Math.PI / 2;
    this.impellerPump.add(impellerShell);

    // Radial curved vanes inside impeller
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.003, 0.035, 0.02);
      const vane = new THREE.Mesh(vaneGeo, steelMat);
      vane.position.set(Math.cos(angle) * 0.085, Math.sin(angle) * 0.085, 0.01);
      vane.rotation.z = angle + 0.3;
      this.impellerPump.add(vane);
    }
    this.impellerPump.position.set(0, 0, 0.28);
    this.torqueConverterGroup.add(this.impellerPump);

    // 2. Stator with One-Way Sprag Roller Clutch
    const statorHubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.025, 24);
    const statorHub = new THREE.Mesh(statorHubGeo, bronzeMat);
    statorHub.rotation.x = Math.PI / 2;
    this.statorSprag.add(statorHub);

    // Aerodynamic curved stator blades
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.004, 0.028, 0.018);
      const blade = new THREE.Mesh(bladeGeo, bronzeMat);
      blade.position.set(Math.cos(angle) * 0.075, Math.sin(angle) * 0.075, 0);
      blade.rotation.z = angle + 0.65;
      this.statorSprag.add(blade);
    }
    this.statorSprag.position.set(0, 0, 0.23);
    this.torqueConverterGroup.add(this.statorSprag);

    // 3. Turbine Runner (drives input shaft)
    const turbineShellGeo = new THREE.CylinderGeometry(0.125, 0.12, 0.045, 32);
    const turbineShell = new THREE.Mesh(turbineShellGeo, aluMat);
    turbineShell.rotation.x = Math.PI / 2;
    this.turbineRunner.add(turbineShell);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.003, 0.032, 0.02);
      const vane = new THREE.Mesh(vaneGeo, aluMat);
      vane.position.set(Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, -0.01);
      vane.rotation.z = angle - 0.35;
      this.turbineRunner.add(vane);
    }
    this.turbineRunner.position.set(0, 0, 0.18);
    this.torqueConverterGroup.add(this.turbineRunner);

    // 4. Lockup Clutch Friction Disc
    const discGeo = new THREE.TorusGeometry(0.105, 0.012, 12, 32);
    this.lockupClutchDisc = new THREE.Mesh(discGeo, this.materials.castIron);
    this.lockupClutchDisc.position.set(0, 0, 0.14);
    this.torqueConverterGroup.add(this.lockupClutchDisc);
  }

  private buildTransmissionCase() {
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;
    const subMat = this.materials.subframeBlack;
    const panMat = this.materials.compositePanBlack;

    // 1. Bellhousing Shell with Stiffening Flange
    const bellGeo = new THREE.CylinderGeometry(0.165, 0.125, 0.22, 28, 1, true);
    const bellMesh = new THREE.Mesh(bellGeo, aluMat);
    bellMesh.rotation.x = Math.PI / 2;
    bellMesh.position.set(0, 0, 0.2);
    this.transCase.add(bellMesh);

    // Bellhousing perimeter flange ring (mating to S58 block)
    const flangeRingGeo = new THREE.TorusGeometry(0.166, 0.012, 10, 32);
    const flangeRing = new THREE.Mesh(flangeRingGeo, aluMat);
    flangeRing.position.set(0, 0, 0.31);
    this.transCase.add(flangeRing);

    // 14 Torx Bellhousing Perimeter Bolts
    for (let b = 0; b < 14; b++) {
      const bAngle = (b / 14) * Math.PI * 2;
      const boltHeadGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.014, 8);
      boltHeadGeo.rotateX(Math.PI / 2);
      const boltHead = new THREE.Mesh(boltHeadGeo, steelMat);
      boltHead.position.set(Math.cos(bAngle) * 0.165, Math.sin(bAngle) * 0.165, 0.316);
      this.transCase.add(boltHead);
    }

    // Starter motor pocket casting bulge on driver side
    const starterPocketGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.14, 16);
    starterPocketGeo.rotateX(Math.PI / 2);
    const starterPocket = new THREE.Mesh(starterPocketGeo, aluMat);
    starterPocket.position.set(-0.14, -0.04, 0.24);
    this.transCase.add(starterPocket);

    // 2. High-Rigidity Main Gearbox Body
    const mainBodyGeo = new THREE.CylinderGeometry(0.122, 0.108, 0.48, 28, 1, true);
    const mainBody = new THREE.Mesh(mainBodyGeo, aluMat);
    mainBody.rotation.x = Math.PI / 2;
    mainBody.position.set(0, 0, -0.15);
    this.transCase.add(mainBody);

    // Longitudinal and Circumferential Stiffening Ribs
    for (let r = 0; r < 8; r++) {
      const rAngle = (r / 8) * Math.PI * 2;
      const ribGeo = new THREE.BoxGeometry(0.008, 0.012, 0.44);
      const rib = new THREE.Mesh(ribGeo, aluMat);
      rib.position.set(Math.cos(rAngle) * 0.116, Math.sin(rAngle) * 0.116, -0.15);
      rib.rotation.z = rAngle;
      this.transCase.add(rib);
    }

    for (let h = 0; h < 3; h++) {
      const hoopGeo = new THREE.TorusGeometry(0.118, 0.006, 8, 30);
      const hoop = new THREE.Mesh(hoopGeo, aluMat);
      hoop.position.set(0, 0, 0.02 - h * 0.16);
      this.transCase.add(hoop);
    }

    // 3. Deep Ribbed Composite Transmission Oil Pan (Mechatronics Pan)
    const panGroup = new THREE.Group();
    panGroup.name = 'TransmissionOilPan';

    // Pan upper perimeter flange
    const panFlangeGeo = new THREE.BoxGeometry(0.21, 0.012, 0.44);
    const panFlange = new THREE.Mesh(panFlangeGeo, panMat);
    panFlange.position.set(0, -0.118, -0.08);
    panGroup.add(panFlange);

    // Pan main sump tub
    const panTubGeo = new THREE.BoxGeometry(0.185, 0.048, 0.40);
    const panTub = new THREE.Mesh(panTubGeo, panMat);
    panTub.position.set(0, -0.144, -0.08);
    panGroup.add(panTub);

    // 8 Longitudinal cooling dissipation fins along the bottom of the pan
    for (let f = 0; f < 8; f++) {
      const finX = -0.07 + f * 0.02;
      const finGeo = new THREE.BoxGeometry(0.004, 0.012, 0.36);
      const fin = new THREE.Mesh(finGeo, panMat);
      fin.position.set(finX, -0.17, -0.08);
      panGroup.add(fin);
    }

    // Recessed magnetic drain plug
    const drainPlugGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12);
    const drainPlug = new THREE.Mesh(drainPlugGeo, steelMat);
    drainPlug.position.set(0.04, -0.172, -0.22);
    panGroup.add(drainPlug);

    // 14 Torx pan perimeter bolts
    for (let pb = 0; pb < 14; pb++) {
      const pSide = pb < 7 ? -1 : 1;
      const pZ = -0.26 + (pb % 7) * 0.06;
      const panBoltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8);
      const panBolt = new THREE.Mesh(panBoltGeo, steelMat);
      panBolt.position.set(pSide * 0.098, -0.116, pZ);
      panGroup.add(panBolt);
    }
    this.transCase.add(panGroup);

    // 4. Rear Extension Tail Housing & Transmission Mount Crossmember
    const tailHousingGeo = new THREE.CylinderGeometry(0.078, 0.054, 0.16, 20);
    tailHousingGeo.rotateX(Math.PI / 2);
    const tailHousing = new THREE.Mesh(tailHousingGeo, aluMat);
    tailHousing.position.set(0, 0, -0.44);
    this.transCase.add(tailHousing);

    // Cast aluminum crossmember support bracket
    const crossBracketGeo = new THREE.BoxGeometry(0.42, 0.028, 0.065);
    const crossBracket = new THREE.Mesh(crossBracketGeo, aluMat);
    crossBracket.position.set(0, -0.11, -0.42);
    this.transCase.add(crossBracket);

    // Heavy rubber vibration isolator bushing
    const isolatorGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.048, 16);
    const isolator = new THREE.Mesh(isolatorGeo, this.materials.rubberBlack);
    isolator.position.set(0, -0.076, -0.42);
    this.transCase.add(isolator);

    // 5. M xDrive Intermediate Adapter Flange & Splined Output Coupling
    const adapterGroup = new THREE.Group();
    adapterGroup.name = 'MxDriveAdapterFlange';

    // CNC machined intermediate mounting flange collar mating to transfer case
    const adapterFlangeGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.022, 24);
    adapterFlangeGeo.rotateX(Math.PI / 2);
    const adapterFlange = new THREE.Mesh(adapterFlangeGeo, aluMat);
    adapterFlange.position.set(0, 0, -0.47);
    adapterGroup.add(adapterFlange);

    // 6 Transmission-to-Transfer Case heavy-duty E-Torx bolts
    for (let g = 0; g < 6; g++) {
      const gAngle = (g / 6) * Math.PI * 2;
      const gX = Math.cos(gAngle) * 0.072;
      const gY = Math.sin(gAngle) * 0.072;

      const boltGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.016, 10);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, steelMat);
      bolt.position.set(gX, gY, -0.47);
      adapterGroup.add(bolt);
    }

    // Hardened splined output shaft stub
    const outputStubGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.04, 16);
    outputStubGeo.rotateX(Math.PI / 2);
    const outputStub = new THREE.Mesh(outputStubGeo, steelMat);
    outputStub.position.set(0, 0, -0.47);
    adapterGroup.add(outputStub);

    this.transCase.add(adapterGroup);

    // 6. External Hydraulic ATF Cooler Hard Lines
    const coolerLine1Points = [
      new THREE.Vector3(0.124, -0.04, -0.06),
      new THREE.Vector3(0.138, -0.02, 0.10),
      new THREE.Vector3(0.142, 0.04, 0.28),
    ];
    const coolerLine1Curve = new THREE.CatmullRomCurve3(coolerLine1Points);
    const coolerLine1Geo = new THREE.TubeGeometry(coolerLine1Curve, 16, 0.006, 8, false);
    const coolerLine1 = new THREE.Mesh(coolerLine1Geo, steelMat);
    this.transCase.add(coolerLine1);

    const coolerLine2Points = [
      new THREE.Vector3(0.124, -0.07, -0.06),
      new THREE.Vector3(0.138, -0.05, 0.10),
      new THREE.Vector3(0.142, 0.01, 0.28),
    ];
    const coolerLine2Curve = new THREE.CatmullRomCurve3(coolerLine2Points);
    const coolerLine2Geo = new THREE.TubeGeometry(coolerLine2Curve, 16, 0.006, 8, false);
    const coolerLine2 = new THREE.Mesh(coolerLine2Geo, steelMat);
    this.transCase.add(coolerLine2);

    // Blue anodized AN hydraulic line fittings
    for (const lineZ of [-0.06, 0.28]) {
      const anGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.018, 10);
      anGeo.rotateZ(Math.PI / 2);
      const anFit1 = new THREE.Mesh(anGeo, this.materials.anodizedBlue);
      anFit1.position.set(0.13, -0.04, lineZ);
      this.transCase.add(anFit1);

      const anFit2 = new THREE.Mesh(anGeo, this.materials.anodizedBlue);
      anFit2.position.set(0.13, -0.07, lineZ);
      this.transCase.add(anFit2);
    }

    // 7. Mechatronics Wiring Harness Connector
    const bayonetGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.025, 14);
    bayonetGeo.rotateZ(Math.PI / 2);
    const bayonet = new THREE.Mesh(bayonetGeo, this.materials.rubberBootBlack);
    bayonet.position.set(0.12, 0.06, -0.16);
    this.transCase.add(bayonet);

    // Splined output shaft
    const shaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.65, 20);
    shaftGeo.rotateX(Math.PI / 2);
    this.outputShaft = new THREE.Mesh(shaftGeo, steelMat);
    this.outputShaft.position.set(0, 0, -0.12);

    // Multi-disc wet clutch packs (alternating friction and steel plates)
    for (let c = 0; c < 4; c++) {
      const zOffset = 0.05 - c * 0.08;
      for (let p = 0; p < 5; p++) {
        const isFriction = p % 2 === 0;
        const plateGeo = new THREE.TorusGeometry(0.095, 0.0025, 8, 28);
        const plate = new THREE.Mesh(
          plateGeo,
          isFriction ? this.materials.brassBronze : steelMat
        );
        plate.position.set(0, 0, zOffset + p * 0.005);
        this.clutchPacks.add(plate);
      }
    }
  }

  private buildPlanetaryGearsets() {
    const gearMat = this.materials.gearSteel;

    // === Planetary Set 1 (Primary reduction) ===
    // Sun gear 1 (geometry oriented along Z)
    const sun1Geo = new THREE.CylinderGeometry(0.038, 0.038, 0.03, 24);
    sun1Geo.rotateX(Math.PI / 2);
    this.sunGear1 = new THREE.Mesh(sun1Geo, gearMat);
    this.planetarySet1.add(this.sunGear1);

    // Planet Carrier 1 holding 3 pinions
    const carrierPlateGeo1 = new THREE.CylinderGeometry(0.085, 0.085, 0.008, 24);
    carrierPlateGeo1.rotateX(Math.PI / 2);
    const cPlate1 = new THREE.Mesh(carrierPlateGeo1, this.materials.polishedSteel);
    this.carrier1.add(cPlate1);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const pinionGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.028, 16);
      pinionGeo.rotateX(Math.PI / 2);
      const pinion = new THREE.Mesh(pinionGeo, gearMat);
      pinion.position.set(Math.cos(angle) * 0.058, Math.sin(angle) * 0.058, 0);
      this.planetPinions1.push(pinion);
      this.carrier1.add(pinion);
    }
    this.planetarySet1.add(this.carrier1);

    // Ring (Annulus) Gear 1
    const ring1Geo = new THREE.TorusGeometry(0.088, 0.008, 12, 32);
    this.ringGear1 = new THREE.Mesh(ring1Geo, gearMat);
    this.planetarySet1.add(this.ringGear1);
    this.planetarySet1.position.set(0, 0, 0.02);

    // === Planetary Set 2 (Secondary / Lepelletier stage) ===
    // Sun gear 2 (geometry oriented along Z)
    const sun2Geo = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 24);
    sun2Geo.rotateX(Math.PI / 2);
    this.sunGear2 = new THREE.Mesh(sun2Geo, gearMat);
    this.planetarySet2.add(this.sunGear2);

    // Planet Carrier 2 holding 4 pinions
    const carrierPlateGeo2 = new THREE.CylinderGeometry(0.085, 0.085, 0.008, 24);
    carrierPlateGeo2.rotateX(Math.PI / 2);
    const cPlate2 = new THREE.Mesh(carrierPlateGeo2, this.materials.polishedSteel);
    this.carrier2.add(cPlate2);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const pinionGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.028, 16);
      pinionGeo.rotateX(Math.PI / 2);
      const pinion = new THREE.Mesh(pinionGeo, gearMat);
      pinion.position.set(Math.cos(angle) * 0.062, Math.sin(angle) * 0.062, 0);
      this.planetPinions2.push(pinion);
      this.carrier2.add(pinion);
    }
    this.planetarySet2.add(this.carrier2);

    // Ring Gear 2
    const ring2Geo = new THREE.TorusGeometry(0.092, 0.008, 12, 32);
    this.ringGear2 = new THREE.Mesh(ring2Geo, gearMat);
    this.planetarySet2.add(this.ringGear2);
    this.planetarySet2.position.set(0, 0, -0.18);
  }

  private buildValveBody() {
    const bodyMat = this.materials.engineAluminum;
    const solenoidMat = this.materials.brakeCaliper; // electro-hydraulic solenoids

    // Hydraulic Valve Body block (mounted at bottom of transmission)
    const vbGeo = new THREE.BoxGeometry(0.18, 0.04, 0.36);
    const vbMesh = new THREE.Mesh(vbGeo, bodyMat);
    vbMesh.position.set(0, -0.12, -0.06);
    this.valveBodyGroup.add(vbMesh);

    // 8 Electro-Hydraulic Linear Solenoids
    for (let s = 0; s < 8; s++) {
      const x = (s % 2 === 0 ? -0.05 : 0.05);
      const z = -0.18 + Math.floor(s / 2) * 0.07;
      const solGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.035, 12);
      const solenoid = new THREE.Mesh(solGeo, solenoidMat);
      solenoid.position.set(x, -0.145, z);
      this.valveBodyGroup.add(solenoid);
    }
  }

  public setSubsystemFocus(subsystemId: SubsystemId) {
    if (subsystemId === 'transmission') {
      this.transCase.visible = false; // Expose planetary gears, torque converter, and clutch packs!
    } else {
      this.transCase.visible = true;
    }
  }

  public update(
    engineRpm: number,
    transInputRpm: number,
    transOutRpm: number,
    currentRatio: number,
    explodeFactor: number
  ) {
    const dt = 0.016;

    // 1. Impeller pump rotates with engine RPM
    const impellerAdvance = (engineRpm / 60) * (2 * Math.PI) * dt;
    this.impellerPump.rotation.z += impellerAdvance;

    // 2. Turbine runner rotates with transmission input RPM
    const turbineAdvance = (transInputRpm / 60) * (2 * Math.PI) * dt;
    this.turbineRunner.rotation.z += turbineAdvance;

    // 3. Epicyclic Planetary Gearset Rotations
    // Ring gear speed and carrier speed reflect gear reduction
    const ringSpeed = transOutRpm;
    const carrierSpeed = transInputRpm;
    const gearAdvance = (carrierSpeed / 60) * (2 * Math.PI) * dt;
    const outAdvance = (ringSpeed / 60) * (2 * Math.PI) * dt;

    // Primary stage: Carrier 1 driven forward (+Z), Sun gear counter-reacts (-Z), Pinions roll (-Z)
    this.carrier1.rotation.z += gearAdvance;
    this.sunGear1.rotation.z -= gearAdvance * 0.75;
    this.ringGear1.rotation.z += outAdvance;
    this.planetPinions1.forEach((p) => (p.rotation.z -= gearAdvance * 2.0));

    // Secondary stage: Carrier 2 & Ring 2 rotate forward (+Z), Sun 2 counter-reacts (-Z), Pinions 2 roll (-Z)
    this.carrier2.rotation.z += outAdvance;
    this.sunGear2.rotation.z -= outAdvance * 0.6;
    this.ringGear2.rotation.z += outAdvance;
    this.planetPinions2.forEach((p) => (p.rotation.z -= outAdvance * 1.8));

    // Output shaft rotates forward (+Z) with transmission output RPM
    this.outputShaft.rotation.z += outAdvance;

    // 4. Exploded view offsets:
    // Torque converter pulls forward (+Z)
    this.impellerPump.position.z = 0.28 + explodeFactor * 0.35;
    this.statorSprag.position.z = 0.23 + explodeFactor * 0.24;
    this.turbineRunner.position.z = 0.18 + explodeFactor * 0.14;
    this.lockupClutchDisc.position.z = 0.14 + explodeFactor * 0.06;

    // Transmission case pulls rearward (-Z)
    this.transCase.position.z = -explodeFactor * 0.25;

    // Valve body drops downward (-Y)
    this.valveBodyGroup.position.y = -explodeFactor * 0.28;

    // Planetary sets spread apart
    this.planetarySet1.position.z = 0.02 + explodeFactor * 0.08;
    this.planetarySet2.position.z = -0.18 - explodeFactor * 0.12;
    this.clutchPacks.position.z = -explodeFactor * 0.05;
  }
}
