import * as THREE from 'three';
import { CarMaterials } from '../materials/AutomotiveMaterials';

export class TurboAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  // S58 Twin Mono-Scroll Turbos (Front Turbo: Cyl 1-3, Rear Turbo: Cyl 4-6)
  private turbo1Group: THREE.Group;
  private turbo2Group: THREE.Group;
  private turbo1Compressor: THREE.Group;
  private turbo1Turbine: THREE.Group;
  private turbo2Compressor: THREE.Group;
  private turbo2Turbine: THREE.Group;
  private wastegate1Rod: THREE.Mesh;
  private wastegate2Rod: THREE.Mesh;
  private topChargeAirCooler: THREE.Group;
  private exhaustHeadersGroup: THREE.Group;
  private downpipesGroup: THREE.Group;

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'S58TwinTurboAssembly';

    this.turbo1Group = new THREE.Group();
    this.turbo2Group = new THREE.Group();
    this.turbo1Compressor = new THREE.Group();
    this.turbo1Turbine = new THREE.Group();
    this.turbo2Compressor = new THREE.Group();
    this.turbo2Turbine = new THREE.Group();
    this.wastegate1Rod = new THREE.Mesh();
    this.wastegate2Rod = new THREE.Mesh();
    this.topChargeAirCooler = new THREE.Group();
    this.exhaustHeadersGroup = new THREE.Group();
    this.downpipesGroup = new THREE.Group();

    // 1. Build authentic 3-into-1 tubular motorsport exhaust headers
    this.buildExhaustHeaders();

    // 2. Build Front Turbo (Cyl 1-3) at Z = +0.14
    this.buildTurboUnit(this.turbo1Group, this.turbo1Turbine, this.turbo1Compressor, (mesh) => { this.wastegate1Rod = mesh; });
    this.turbo1Group.position.set(0.24, 0.26, 0.14);

    // 3. Build Rear Turbo (Cyl 4-6) at Z = -0.14
    this.buildTurboUnit(this.turbo2Group, this.turbo2Turbine, this.turbo2Compressor, (mesh) => { this.wastegate2Rod = mesh; });
    this.turbo2Group.position.set(0.24, 0.26, -0.14);

    // 4. Build Twin Stainless Downpipes with Catalytic Converters
    this.buildDownpipes();

    // 5. Build BMW M Top-Mount Water-to-Air Charge Air Cooler
    this.buildTopChargeCooler();

    this.group.add(
      this.exhaustHeadersGroup,
      this.turbo1Group,
      this.turbo2Group,
      this.downpipesGroup,
      this.topChargeAirCooler
    );
  }

  // Authentic BMW M S58 3-into-1 Tubular Stainless Steel Exhaust Headers
  private buildExhaustHeaders() {
    const steelMat = this.materials.polishedSteel;
    const flangeMat = this.materials.castIron;

    // Head exhaust port Z offsets (6 cylinders)
    const zOffsets = [0.2275, 0.1365, 0.0455, -0.0455, -0.1365, -0.2275];

    // Front Header: Cylinders 1, 2, 3 converging to Front Turbo at (0.22, 0.26, 0.14)
    for (let c = 0; c < 3; c++) {
      const z = zOffsets[c];
      const points = [
        new THREE.Vector3(0.14, 0.28, z),
        new THREE.Vector3(0.18, 0.27, z * 0.7 + 0.14 * 0.3),
        new THREE.Vector3(0.21, 0.26, 0.14),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.016, 12, false);
      const runner = new THREE.Mesh(tubeGeo, steelMat);
      this.exhaustHeadersGroup.add(runner);

      // Port flange at cylinder head
      const portFlangeGeo = new THREE.BoxGeometry(0.01, 0.042, 0.042);
      const portFlange = new THREE.Mesh(portFlangeGeo, flangeMat);
      portFlange.position.set(0.14, 0.28, z);
      this.exhaustHeadersGroup.add(portFlange);
    }

    // Rear Header: Cylinders 4, 5, 6 converging to Rear Turbo at (0.22, 0.26, -0.14)
    for (let c = 3; c < 6; c++) {
      const z = zOffsets[c];
      const points = [
        new THREE.Vector3(0.14, 0.28, z),
        new THREE.Vector3(0.18, 0.27, z * 0.7 - 0.14 * 0.3),
        new THREE.Vector3(0.21, 0.26, -0.14),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.016, 12, false);
      const runner = new THREE.Mesh(tubeGeo, steelMat);
      this.exhaustHeadersGroup.add(runner);

      const portFlangeGeo = new THREE.BoxGeometry(0.01, 0.042, 0.042);
      const portFlange = new THREE.Mesh(portFlangeGeo, flangeMat);
      portFlange.position.set(0.14, 0.28, z);
      this.exhaustHeadersGroup.add(portFlange);
    }
  }

  // Twin Stainless Downpipes with High-Flow Catalytic Converters & O2 Sensors
  private buildDownpipes() {
    const pipeMat = this.materials.castIron;
    const catMat = this.materials.polishedSteel;
    const sensorMat = this.materials.brassBronze;

    // Front Turbo Downpipe
    const frontPoints = [
      new THREE.Vector3(0.285, 0.26, 0.14),
      new THREE.Vector3(0.26, 0.18, 0.05),
      new THREE.Vector3(0.20, 0.10, -0.10),
      new THREE.Vector3(0.16, 0.06, -0.28),
    ];
    const frontCurve = new THREE.CatmullRomCurve3(frontPoints);
    const frontPipeGeo = new THREE.TubeGeometry(frontCurve, 24, 0.024, 16, false);
    const frontPipe = new THREE.Mesh(frontPipeGeo, pipeMat);
    this.downpipesGroup.add(frontPipe);

    // Front Catalytic Converter Canister
    const frontCatGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 18);
    frontCatGeo.rotateX(Math.PI / 3);
    const frontCat = new THREE.Mesh(frontCatGeo, catMat);
    frontCat.position.set(0.23, 0.14, -0.02);
    this.downpipesGroup.add(frontCat);

    // Front O2 Lambda Sensor
    const frontO2Geo = new THREE.CylinderGeometry(0.007, 0.007, 0.025, 8);
    frontO2Geo.rotateZ(Math.PI / 2);
    const frontO2 = new THREE.Mesh(frontO2Geo, sensorMat);
    frontO2.position.set(0.26, 0.16, 0.02);
    this.downpipesGroup.add(frontO2);

    // Rear Turbo Downpipe
    const rearPoints = [
      new THREE.Vector3(0.285, 0.26, -0.14),
      new THREE.Vector3(0.25, 0.16, -0.22),
      new THREE.Vector3(0.18, 0.08, -0.32),
      new THREE.Vector3(0.14, 0.05, -0.42),
    ];
    const rearCurve = new THREE.CatmullRomCurve3(rearPoints);
    const rearPipeGeo = new THREE.TubeGeometry(rearCurve, 24, 0.024, 16, false);
    const rearPipe = new THREE.Mesh(rearPipeGeo, pipeMat);
    this.downpipesGroup.add(rearPipe);

    // Rear Catalytic Converter Canister
    const rearCatGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 18);
    rearCatGeo.rotateX(Math.PI / 3.2);
    const rearCat = new THREE.Mesh(rearCatGeo, catMat);
    rearCat.position.set(0.21, 0.12, -0.26);
    this.downpipesGroup.add(rearCat);

    // Rear O2 Sensor
    const rearO2Geo = new THREE.CylinderGeometry(0.007, 0.007, 0.025, 8);
    rearO2Geo.rotateZ(Math.PI / 2);
    const rearO2 = new THREE.Mesh(rearO2Geo, sensorMat);
    rearO2.position.set(0.24, 0.14, -0.20);
    this.downpipesGroup.add(rearO2);
  }

  private buildTurboUnit(
    parentGroup: THREE.Group,
    turbineWheelGroup: THREE.Group,
    compressorWheelGroup: THREE.Group,
    setWastegateRod: (mesh: THREE.Mesh) => void
  ) {
    const inconelMat = this.materials.inconelHeat;
    const compMat = this.materials.turboCompressor;
    const housingMat = this.materials.castIron;
    const aluMat = this.materials.engineAluminum;
    const steelMat = this.materials.polishedSteel;

    // CHRA Bearing Center Housing
    const chraGeo = new THREE.CylinderGeometry(0.032, 0.034, 0.055, 16);
    chraGeo.rotateZ(Math.PI / 2);
    const chra = new THREE.Mesh(chraGeo, housingMat);
    parentGroup.add(chra);

    // Stainless Braided Turbo Oil Feed & Coolant Lines
    const oilLineGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.06, 8);
    const oilLine = new THREE.Mesh(oilLineGeo, steelMat);
    oilLine.position.set(0, 0.045, 0);
    parentGroup.add(oilLine);

    const banjoGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 10);
    banjoGeo.rotateZ(Math.PI / 2);
    const banjo = new THREE.Mesh(banjoGeo, this.materials.brassBronze);
    banjo.position.set(0, 0.045, 0);
    parentGroup.add(banjo);

    // Turbine Housing (Mono-scroll volute)
    const turbineVoluteGeo = new THREE.TorusGeometry(0.052, 0.018, 14, 24, Math.PI * 1.5);
    const turbineVolute = new THREE.Mesh(turbineVoluteGeo, housingMat);
    turbineVolute.rotation.y = Math.PI / 2;
    turbineVolute.position.set(0.045, 0, 0);
    parentGroup.add(turbineVolute);

    // Turbine Wheel (Inconel 713C high-temp motorsport alloy)
    const tHubGeo = new THREE.ConeGeometry(0.022, 0.035, 14);
    tHubGeo.rotateZ(-Math.PI / 2);
    const tHub = new THREE.Mesh(tHubGeo, inconelMat);
    turbineWheelGroup.add(tHub);

    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.011, 0.024, 0.0025);
      const blade = new THREE.Mesh(bladeGeo, inconelMat);
      blade.position.set(0.004, Math.cos(angle) * 0.022, Math.sin(angle) * 0.022);
      blade.rotation.x = angle + 0.55;
      turbineWheelGroup.add(blade);
    }
    turbineWheelGroup.position.set(0.04, 0, 0);
    parentGroup.add(turbineWheelGroup);

    // Compressor Housing (Billet CNC cast aluminum)
    const compVoluteGeo = new THREE.TorusGeometry(0.058, 0.022, 14, 24, Math.PI * 1.6);
    const compVolute = new THREE.Mesh(compVoluteGeo, aluMat);
    compVolute.rotation.y = Math.PI / 2;
    compVolute.position.set(-0.045, 0, 0);
    parentGroup.add(compVolute);

    // Compressor Impeller Wheel
    const cHubGeo = new THREE.ConeGeometry(0.024, 0.038, 16);
    cHubGeo.rotateZ(Math.PI / 2);
    const cHub = new THREE.Mesh(cHubGeo, compMat);
    compressorWheelGroup.add(cHub);

    for (let i = 0; i < 11; i++) {
      const angle = (i / 11) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.012, 0.026, 0.002);
      const blade = new THREE.Mesh(bladeGeo, compMat);
      blade.position.set(-0.005, Math.cos(angle) * 0.024, Math.sin(angle) * 0.024);
      blade.rotation.x = angle - 0.45;
      compressorWheelGroup.add(blade);
    }
    compressorWheelGroup.position.set(-0.04, 0, 0);
    parentGroup.add(compressorWheelGroup);

    // Electronic Wastegate Actuator (Fast-acting linear servomotor)
    const actGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.035, 12);
    actGeo.rotateX(Math.PI / 2);
    const actuator = new THREE.Mesh(actGeo, this.materials.subframeBlack);
    actuator.position.set(0.06, 0.07, -0.04);
    parentGroup.add(actuator);

    // Wastegate actuator linkage rod
    const rodGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.065, 8);
    rodGeo.rotateX(Math.PI / 2);
    const rod = new THREE.Mesh(rodGeo, steelMat);
    rod.position.set(0.06, 0.06, 0.01);
    parentGroup.add(rod);
    setWastegateRod(rod);

    // Wastegate flapper bellcrank pivot arm
    const crankGeo = new THREE.BoxGeometry(0.008, 0.018, 0.004);
    const crank = new THREE.Mesh(crankGeo, steelMat);
    crank.position.set(0.06, 0.05, 0.04);
    parentGroup.add(crank);
  }

  private buildTopChargeCooler() {
    const coolerMat = this.materials.engineAluminum;
    const coreMat = this.materials.castIron;
    const clampMat = this.materials.polishedSteel;
    const couplerMat = this.materials.rubberBlack;

    // BMW M S58 signature top-mounted water-to-air charge cooler
    // Core Bar-and-Plate Heat Exchanger Matrix
    const coreBoxGeo = new THREE.BoxGeometry(0.24, 0.11, 0.32);
    const coreBox = new THREE.Mesh(coreBoxGeo, coreMat);
    coreBox.position.set(-0.02, 0.46, 0.02);
    this.topChargeAirCooler.add(coreBox);

    // Cast Aluminum End-Tanks (Left Inlet Tank & Right Outlet Tank)
    for (const side of [-1, 1]) {
      const tankGeo = new THREE.BoxGeometry(0.03, 0.115, 0.33);
      const tank = new THREE.Mesh(tankGeo, coolerMat);
      tank.position.set(-0.02 + side * 0.135, 0.46, 0.02);
      this.topChargeAirCooler.add(tank);
    }

    // Auxiliary Coolant Water Ports & Braided Rubber Hoses
    for (const cz of [-0.10, 0.10]) {
      const waterPortGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.025, 12);
      const waterPort = new THREE.Mesh(waterPortGeo, this.materials.engineAluminum);
      waterPort.position.set(0.12, 0.49, cz);
      this.topChargeAirCooler.add(waterPort);

      const waterHoseGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.08, 12);
      waterHoseGeo.rotateZ(Math.PI / 2);
      const waterHose = new THREE.Mesh(waterHoseGeo, couplerMat);
      waterHose.position.set(0.16, 0.49, cz);
      this.topChargeAirCooler.add(waterHose);
    }

    // Twin boost pipes connecting turbos to the top-mount cooler
    for (const zOffset of [0.14, -0.14]) {
      const pipePoints = [
        new THREE.Vector3(0.19, 0.26, zOffset),
        new THREE.Vector3(0.14, 0.40, zOffset * 0.8),
        new THREE.Vector3(0.08, 0.46, zOffset * 0.5),
      ];
      const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
      const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.020, 14, false);
      const pipeMesh = new THREE.Mesh(pipeGeo, this.materials.polishedSteel);
      this.topChargeAirCooler.add(pipeMesh);

      // Silicone coupler boot & T-bolt clamp at compressor outlet
      const bootGeo = new THREE.CylinderGeometry(0.023, 0.023, 0.025, 14);
      bootGeo.rotateZ(Math.PI / 3);
      const boot = new THREE.Mesh(bootGeo, couplerMat);
      boot.position.set(0.18, 0.28, zOffset);
      this.topChargeAirCooler.add(boot);

      const clampGeo = new THREE.TorusGeometry(0.024, 0.0018, 8, 20);
      clampGeo.rotateY(Math.PI / 2);
      const clamp = new THREE.Mesh(clampGeo, clampMat);
      clamp.position.set(0.18, 0.28, zOffset);
      this.topChargeAirCooler.add(clamp);
    }
  }

  public update(turboSpeedRpm: number, wastegateDuty: number, explodeFactor: number) {
    // High-speed rotation of turbine & compressor shaft
    const rotationAdvance = (turboSpeedRpm / 60) * 0.04;
    this.turbo1Turbine.rotation.x += rotationAdvance;
    this.turbo1Compressor.rotation.x += rotationAdvance;
    this.turbo2Turbine.rotation.x += rotationAdvance;
    this.turbo2Compressor.rotation.x += rotationAdvance;

    // Electronic wastegates position
    const wastegateOffset = (wastegateDuty / 100) * 0.012;
    this.wastegate1Rod.position.z = 0.01 + wastegateOffset;
    this.wastegate2Rod.position.z = 0.01 + wastegateOffset;

    // Exploded view offsets
    this.turbo1Group.position.x = 0.24 + explodeFactor * 0.35;
    this.turbo1Group.position.z = 0.14 + explodeFactor * 0.15;

    this.turbo2Group.position.x = 0.24 + explodeFactor * 0.35;
    this.turbo2Group.position.z = -0.14 - explodeFactor * 0.15;

    this.exhaustHeadersGroup.position.x = explodeFactor * 0.18;
    this.downpipesGroup.position.x = explodeFactor * 0.25;
    this.topChargeAirCooler.position.y = explodeFactor * 0.55;
  }
}
