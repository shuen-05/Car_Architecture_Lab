import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { createBMWRoundelTexture } from '../materials/ProceduralTextures';

export interface WheelAssemblyOptions {
  materials: CarMaterials;
  isFront: boolean;
  side: 1 | -1; // +1 = Right, -1 = Left
}

// Global cache for parsed geometries so each 30MB STL is fetched & parsed only once
const wheelGeometryCache = new Map<string, THREE.BufferGeometry>();

export class WheelModel {
  public group: THREE.Group;
  public rotatingGroup: THREE.Group;
  public caliper!: THREE.Mesh;
  public rotor: THREE.Group;

  private isFront: boolean;
  private side: 1 | -1;
  private materials: CarMaterials;

  constructor(options: WheelAssemblyOptions) {
    const { materials, isFront, side } = options;
    this.materials = materials;
    this.isFront = isFront;
    this.side = side;

    this.group = new THREE.Group();
    this.group.name = `BMWM3Wheel_${isFront ? 'Front' : 'Rear'}_${side > 0 ? 'R' : 'L'}`;

    this.rotatingGroup = new THREE.Group();
    this.rotor = new THREE.Group();

    // 1. Build initial procedural high-detail wheel (BMW Style 826M Double-Spoke & Michelin Pilot Sport 4S)
    this.buildProceduralWheel();

    // 2. Build M Carbon Ceramic Ventilated Rotor & 6-Piston Gold M Caliper
    this.buildMCarbonCeramicBrakes();

    // 3. Load 3D Print STL assets in background
    this.loadWheelSTLAssets();

    this.group.add(this.rotatingGroup);
  }

  private buildProceduralWheel() {
    const rimRadius = this.isFront ? 0.241 : 0.254; // 19" front / 20" rear
    const tireRadius = 0.338; // 676mm diameter
    const tireWidth = this.isFront ? 0.275 : 0.285;
    const tireMat = this.materials.rubberBlack;
    const wheelMat = this.materials.rimDark; // Jet black Style 826M
    const spokeMat = this.materials.rimSilver;

    // Tire Body
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 40, 1, true);
    const tireBody = new THREE.Mesh(tireGeo, tireMat);
    tireBody.rotation.z = Math.PI / 2;
    this.rotatingGroup.add(tireBody);

    // Annular sidewalls
    const sidewallGeo = new THREE.RingGeometry(rimRadius, tireRadius, 40);
    for (const sign of [-1, 1]) {
      const sidewall = new THREE.Mesh(sidewallGeo, tireMat);
      sidewall.position.set(sign * (tireWidth / 2), 0, 0);
      sidewall.rotation.y = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.rotatingGroup.add(sidewall);
    }

    // Rim barrel
    const barrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius - 0.02, tireWidth * 0.95, 36, 1, true);
    const barrel = new THREE.Mesh(barrelGeo, wheelMat);
    barrel.rotation.z = Math.PI / 2;
    this.rotatingGroup.add(barrel);

    // BMW Style 826M 5-Double-Spoke forged face
    const spokeFaceX = this.side * (tireWidth / 2 - 0.016);
    const rInner = 0.048;
    const rOuter = rimRadius - 0.008;
    const spokeLength = rOuter - rInner;
    const rMid = (rInner + rOuter) / 2;

    for (let i = 0; i < 5; i++) {
      const baseAngle = (i / 5) * Math.PI * 2;
      for (const offset of [-0.09, 0.09]) {
        const spokeAngle = baseAngle + offset;
        const rotX = Math.PI / 2 - spokeAngle;

        const spokeGeo = new THREE.BoxGeometry(0.014, spokeLength, 0.015);
        const spoke = new THREE.Mesh(spokeGeo, wheelMat);
        spoke.position.set(spokeFaceX, Math.sin(spokeAngle) * rMid, Math.cos(spokeAngle) * rMid);
        spoke.rotation.x = rotX;
        this.rotatingGroup.add(spoke);

        // Machined diamond-cut spoke highlight
        const accentGeo = new THREE.BoxGeometry(0.003, spokeLength * 0.96, 0.008);
        const accent = new THREE.Mesh(accentGeo, spokeMat);
        accent.position.set(spokeFaceX + this.side * 0.005, Math.sin(spokeAngle) * rMid, Math.cos(spokeAngle) * rMid);
        accent.rotation.x = rotX;
        this.rotatingGroup.add(accent);
      }
    }

    // Hub & 5 Lug nuts
    const hubGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.02, 24);
    const hub = new THREE.Mesh(hubGeo, wheelMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(spokeFaceX - this.side * 0.005, 0, 0);
    this.rotatingGroup.add(hub);

    for (let l = 0; l < 5; l++) {
      const lugAngle = (l / 5) * Math.PI * 2;
      const lugGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.012, 10);
      const lug = new THREE.Mesh(lugGeo, this.materials.chromeTrim);
      lug.rotation.z = Math.PI / 2;
      lug.position.set(spokeFaceX + this.side * 0.004, Math.sin(lugAngle) * 0.032, Math.cos(lugAngle) * 0.032);
      this.rotatingGroup.add(lug);
    }

    // Center BMW Roundel Center Cap
    const capTex = createBMWRoundelTexture();
    const capMat = new THREE.MeshStandardMaterial({
      map: capTex,
      metalness: 0.85,
      roughness: 0.25,
    });
    const capGeo = new THREE.CircleGeometry(0.024, 24);
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.rotation.y = this.side > 0 ? Math.PI / 2 : -Math.PI / 2;
    capMesh.position.set(spokeFaceX + this.side * 0.008, 0, 0);
    this.rotatingGroup.add(capMesh);
  }

  private buildMCarbonCeramicBrakes() {
    // 400mm front / 380mm rear M Carbon Ceramic cross-drilled rotor
    const rotorRadius = this.isFront ? 0.20 : 0.19;
    const rotorThickness = this.isFront ? 0.032 : 0.028;
    const rotorMat = this.materials.brakeRotor;

    const discGeo = new THREE.CylinderGeometry(rotorRadius, rotorRadius, rotorThickness, 36);
    const discMesh = new THREE.Mesh(discGeo, rotorMat);
    discMesh.rotation.z = Math.PI / 2;
    this.rotor.add(discMesh);

    // Carbon ceramic friction hat
    const hatGeo = new THREE.CylinderGeometry(0.09, 0.095, 0.035, 24);
    const hatMesh = new THREE.Mesh(hatGeo, this.materials.subframeBlack);
    hatMesh.rotation.z = Math.PI / 2;
    this.rotor.add(hatMesh);

    this.rotor.position.set(this.side * 0.025, 0, 0);
    this.rotatingGroup.add(this.rotor);

    // BMW M Carbon Ceramic Gold 6-Piston Brake Caliper
    const caliperHeight = this.isFront ? 0.19 : 0.14;
    const caliperWidth = 0.07;
    const caliperDepth = 0.085;
    const caliperGeo = new THREE.BoxGeometry(caliperWidth, caliperHeight, caliperDepth);
    const goldCaliperMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8961e, // BMW M Carbon Ceramic Gold
      metalness: 0.75,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    this.caliper = new THREE.Mesh(caliperGeo, goldCaliperMat);
    this.caliper.position.set(this.side * 0.025, 0.11, 0.11);
    this.group.add(this.caliper);
  }

  private loadWheelSTLAssets() {
    const loader = new STLLoader();
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const wheelFile = this.isFront
      ? `${base}models/m3_g81/m3_wheel_front_l.stl`
      : `${base}models/m3_g81/m3_wheel_rear_l.stl`;
    const scale = 0.0241;

    // Check cache first
    if (wheelGeometryCache.has(wheelFile)) {
      this.attachLoadedWheel(wheelGeometryCache.get(wheelFile)!);
      return;
    }

    loader.load(
      wheelFile,
      (geometry) => {
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox!.getCenter(center);

        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) - center.x;
          const y = pos.getY(i) - center.y;
          const z = pos.getZ(i) - center.z;
          // Align axle along X, face in Y-Z
          pos.setXYZ(i, z * scale, y * scale, x * scale);
        }
        pos.needsUpdate = true;
        geometry.computeVertexNormals();

        wheelGeometryCache.set(wheelFile, geometry);
        this.attachLoadedWheel(geometry);
      },
      undefined,
      (err) => {
        console.warn(`Could not load ${wheelFile}, using procedural wheel:`, err);
      }
    );
  }

  private attachLoadedWheel(geometry: THREE.BufferGeometry) {
    const wheelMesh = new THREE.Mesh(geometry, this.materials.rimDark);
    wheelMesh.castShadow = true;
    if (this.side < 0) {
      wheelMesh.scale.x = -1;
    }
    this.rotatingGroup.add(wheelMesh);
  }

  public updateRotation(angleAdvanceRad: number) {
    this.rotatingGroup.rotation.x += angleAdvanceRad;
  }
}
