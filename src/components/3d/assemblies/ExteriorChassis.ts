import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { CarMaterials } from '../materials/AutomotiveMaterials';
import { SubsystemId } from '../../../types/powertrain';

export class ExteriorChassisAssembly {
  public group: THREE.Group;
  private materials: CarMaterials;

  // Unibody structural frame (visible during cutaway/xray/exploded)
  public unibodyChassisGroup: THREE.Group;

  // Authentic FBX node references
  public fbxRoot: THREE.Group | null = null;
  public wheelsGroup: THREE.Group | null = null;
  public bodyMesh: THREE.Mesh | null = null;
  public badgesMesh: THREE.Mesh | null = null;
  public interiorMesh: THREE.Mesh | null = null;
  public bodyLodA: THREE.Group | null = null;
  public windowMesh: THREE.Mesh | null = null;
  public windowInsideMesh: THREE.Mesh | null = null;
  public lightMesh: THREE.Mesh | null = null;
  public carbonMesh: THREE.Mesh | null = null;
  public engineCowlingMesh: THREE.Mesh | null = null;
  public baseUndertrayMesh: THREE.Mesh | null = null;
  public grilleMeshes: THREE.Mesh[] = [];

  // Front Steerable Wheel Pivots & Meshes
  public frontLeftWheelPivot: THREE.Group | null = null;
  public frontRightWheelPivot: THREE.Group | null = null;
  private flMeshes: THREE.Mesh[] = [];
  private frMeshes: THREE.Mesh[] = [];
  private currentSteeringAngle: number = 0;

  // Loading & view state
  public isLoaded = false;
  private isCutawayActive = false;
  private currentXRayState: boolean | null = null;
  private currentSubsystem: SubsystemId = 'all';

  constructor(materials: CarMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'BMWM3TouringExteriorAssembly';

    this.unibodyChassisGroup = new THREE.Group();
    this.unibodyChassisGroup.name = 'UnibodyChassisGroup';
    this.unibodyChassisGroup.visible = false;
    this.buildUnibodyPlatform();

    this.group.add(this.unibodyChassisGroup);

    // Load authentic 2023 BMW M3 Touring FBX model with PBR textures
    this.loadM3TouringFBX();
  }

  // 1. Unibody Structural Platform & Floorpan
  private buildUnibodyPlatform() {
    const mat = this.materials.chassisSteel;
    const subMat = this.materials.subframeBlack;

    // Rigid structural floorpan
    const floorGeo = new THREE.BoxGeometry(1.36, 0.04, 2.6);
    const floor = new THREE.Mesh(floorGeo, mat);
    floor.position.set(0, 0.22, 0.08);
    floor.receiveShadow = true;
    this.unibodyChassisGroup.add(floor);

    // Front Structural Subframe & S58 Engine Cradle (Z = +1.45)
    const frontSubGeo = new THREE.BoxGeometry(0.92, 0.06, 0.48);
    const frontSub = new THREE.Mesh(frontSubGeo, subMat);
    frontSub.position.set(0, 0.22, 1.45);
    this.unibodyChassisGroup.add(frontSub);

    // Rear Structural Subframe (Z = -1.30)
    const rearSubGeo = new THREE.BoxGeometry(0.92, 0.06, 0.48);
    const rearSub = new THREE.Mesh(rearSubGeo, subMat);
    rearSub.position.set(0, 0.22, -1.30);
    this.unibodyChassisGroup.add(rearSub);

    // BMW M Carbon Precision Front Strut Tower Brace (engine bay boomerang brace)
    const bracePoints = [
      new THREE.Vector3(-0.62, 0.78, 1.25),
      new THREE.Vector3(-0.35, 0.81, 1.05),
      new THREE.Vector3(0, 0.82, 0.95),
      new THREE.Vector3(0.35, 0.81, 1.05),
      new THREE.Vector3(0.62, 0.78, 1.25),
    ];
    const braceCurve = new THREE.CatmullRomCurve3(bracePoints);
    const braceGeo = new THREE.TubeGeometry(braceCurve, 32, 0.02, 12, false);
    const brace = new THREE.Mesh(braceGeo, this.materials.carbonFiber);
    brace.castShadow = true;
    this.unibodyChassisGroup.add(brace);
  }

  // 2. Load Authentic 2023 BMW M3 Touring FBX Model with PBR Textures
  private loadM3TouringFBX() {
    const loader = new FBXLoader();
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const resourcePath = `${base}models/m3_touring_fbx/`;
    loader.setResourcePath(resourcePath);

    loader.load(
      `${resourcePath}FINAL_MODEL_TOURING.fbx`,
      (fbx) => {
        this.fbxRoot = fbx;

        // Traverse FBX to enable shadows and assign clipping planes
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const mList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mList.forEach((m) => {
              if (m) {
                m.clippingPlanes = this.materials.carPaint.clippingPlanes;
                m.clipShadows = true;
              }
            });
          }
        });

        // 1. Painted body shell
        const bodyPaint = fbx.getObjectByName('bodyPaint_Geo_lodABody_lodA') as THREE.Mesh;
        if (bodyPaint) {
          this.bodyMesh = bodyPaint;
          this.bodyMesh.material = this.materials.carPaint;
        }

        // 2. Badges (BMW Roundels and M3 competition badges)
        const badges = fbx.getObjectByName('badegsBadge_Geo_lodABody_lodA') as THREE.Mesh;
        if (badges) {
          this.badgesMesh = badges;
          const m = badges.material as THREE.MeshStandardMaterial;
          if (m) {
            m.transparent = true;
            m.alphaTest = 0.15;
            m.roughness = 0.2;
            m.metalness = 0.8;
          }
        }

        // 3. Authentic BMW M3 Cabin Interior
        const interior = fbx.getObjectByName('interiorInterior_Geo_lodABody_lodA') as THREE.Mesh;
        if (interior) {
          this.interiorMesh = interior;
          const m = interior.material as THREE.MeshStandardMaterial;
          if (m) {
            m.roughness = 0.65;
            m.metalness = 0.15;
          }
        }

        // 4. Body_lodA containing lights, glass, grilles, aero
        this.bodyLodA = fbx.getObjectByName('Body_lodA') as THREE.Group;
        if (this.bodyLodA) {
          this.baseUndertrayMesh = this.bodyLodA.getObjectByName('Base_Geo_lodA') as THREE.Mesh;
          this.windowMesh = this.bodyLodA.getObjectByName('Window_Geo_lodA') as THREE.Mesh;
          this.windowInsideMesh = this.bodyLodA.getObjectByName('WindowInside_Geo_lodA') as THREE.Mesh;
          this.lightMesh = this.bodyLodA.getObjectByName('Light_Geo_lodA') as THREE.Mesh;
          this.carbonMesh = this.bodyLodA.getObjectByName('Carbon1_Geo_lodA') as THREE.Mesh;
          this.engineCowlingMesh = this.bodyLodA.getObjectByName('Engine_Geo_lodA') as THREE.Mesh;

          if (this.carbonMesh) {
            const m = this.carbonMesh.material as THREE.MeshStandardMaterial;
            if (m) {
              m.roughness = 0.28;
              m.metalness = 0.35;
            }
          }

          this.grilleMeshes = (this.bodyLodA.children || []).filter((c) =>
            c.name.startsWith('Grille')
          ) as THREE.Mesh[];

          for (const g of this.grilleMeshes) {
            const m = g.material as THREE.MeshStandardMaterial;
            if (m) {
              m.roughness = 0.15;
              m.metalness = 0.25;
            }
          }

          const coloured = this.bodyLodA.getObjectByName('Coloured_Geo_lodA') as THREE.Mesh;
          if (coloured) {
            coloured.material = new THREE.MeshStandardMaterial({
              color: 0x181a1f,
              roughness: 0.85,
              metalness: 0.08,
              clippingPlanes: this.materials.carPaint.clippingPlanes,
            });
          }

          const seatBelt = this.bodyLodA.getObjectByName('SeatBelt_Geo_lodA') as THREE.Mesh;
          if (seatBelt) {
            seatBelt.material = new THREE.MeshStandardMaterial({
              color: 0x14161a,
              roughness: 0.9,
              clippingPlanes: this.materials.carPaint.clippingPlanes,
            });
          }
        }

        // Find wheels group
        this.wheelsGroup = fbx.getObjectByName('Wheel1A_3D') as THREE.Group;

        // Add FBX directly to exterior chassis assembly
        this.group.add(fbx);
        fbx.updateMatrixWorld(true);

        // Setup steerable front wheel pivots with dynamic camber/caster tilt
        this.setupSteerableFrontWheels();

        // Cache original materials for all meshes in FBX
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.userData.originalMaterial = (child as THREE.Mesh).material;
          }
        });

        this.isLoaded = true;

        this.setSubsystemFocus(this.currentSubsystem);

        if (this.currentXRayState !== null) {
          this.applyXRayState(this.currentXRayState);
        }
      },
      undefined,
      (err) => {
        console.error('Error loading FINAL_MODEL_TOURING.fbx:', err);
      }
    );
  }

  // Separate front left and right wheels into articulated steer/camber pivots
  private setupSteerableFrontWheels() {
    if (!this.wheelsGroup) return;

    // Authentic front wheel center coordinates
    const flCenter = new THREE.Vector3(0.78326, 0.3386, 1.535);
    const frCenter = new THREE.Vector3(-0.78326, 0.3386, 1.535);

    this.frontLeftWheelPivot = new THREE.Group();
    this.frontLeftWheelPivot.name = 'FrontLeftWheelPivot';
    this.frontLeftWheelPivot.position.copy(flCenter);

    this.frontRightWheelPivot = new THREE.Group();
    this.frontRightWheelPivot.name = 'FrontRightWheelPivot';
    this.frontRightWheelPivot.position.copy(frCenter);

    this.flMeshes = [];
    this.frMeshes = [];

    // Filter wheel, tire, rim, caliper meshes by front left and front right bounding centers
    this.wheelsGroup.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const mesh = c as THREE.Mesh;
        const b = new THREE.Box3().setFromObject(mesh);
        const cnt = new THREE.Vector3();
        b.getCenter(cnt);
        if (cnt.z > 0.5 && cnt.x > 0.3) {
          this.flMeshes.push(mesh);
        } else if (cnt.z > 0.5 && cnt.x < -0.3) {
          this.frMeshes.push(mesh);
        }
      }
    });

    // Reparent Front Left meshes relative to flPivot
    this.flMeshes.forEach((m) => {
      const worldPos = new THREE.Vector3();
      m.getWorldPosition(worldPos);
      const worldQuat = new THREE.Quaternion();
      m.getWorldQuaternion(worldQuat);
      const worldScale = new THREE.Vector3();
      m.getWorldScale(worldScale);

      this.frontLeftWheelPivot!.add(m);
      m.position.copy(worldPos).sub(flCenter);
      m.quaternion.copy(worldQuat);
      m.scale.copy(worldScale);
    });

    // Reparent Front Right meshes relative to frPivot
    this.frMeshes.forEach((m) => {
      const worldPos = new THREE.Vector3();
      m.getWorldPosition(worldPos);
      const worldQuat = new THREE.Quaternion();
      m.getWorldQuaternion(worldQuat);
      const worldScale = new THREE.Vector3();
      m.getWorldScale(worldScale);

      this.frontRightWheelPivot!.add(m);
      m.position.copy(worldPos).sub(frCenter);
      m.quaternion.copy(worldQuat);
      m.scale.copy(worldScale);
    });

    this.wheelsGroup.add(this.frontLeftWheelPivot, this.frontRightWheelPivot);
  }

  private applyXRayState(isXRay: boolean) {
    if (!this.fbxRoot) return;
    const wheels = this.wheelsGroup;

    this.fbxRoot.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Determine if this mesh belongs to the wheels
        let isWheel = false;
        let p: THREE.Object3D | null = mesh;
        while (p && p !== this.fbxRoot) {
          if (p === wheels || (p.name && p.name.toLowerCase().includes('wheel'))) {
            isWheel = true;
            break;
          }
          p = p.parent;
        }

        // Apply transparency to all non-wheel meshes of the 3D model
        if (!isWheel) {
          if (isXRay) {
            const nameLower = mesh.name.toLowerCase();
            if (
              nameLower.includes('interior') ||
              nameLower.includes('seat') ||
              nameLower.includes('base')
            ) {
              mesh.material = this.materials.xrayInterior;
            } else {
              mesh.material = this.materials.xrayChassis;
            }
          } else {
            // Restore original material
            if (mesh === this.bodyMesh) {
              mesh.material = this.materials.carPaint;
            } else if (mesh.userData.originalMaterial) {
              mesh.material = mesh.userData.originalMaterial;
            }
          }
        }
      }
    });
  }

  public setSubsystemFocus(subsystemId: SubsystemId) {
    this.currentSubsystem = subsystemId;

    if (subsystemId === 'all' || subsystemId === 'exterior') {
      this.group.visible = true;
      if (this.fbxRoot) {
        this.fbxRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.visible = true;
          }
        });
      }
      if (this.bodyMesh) this.bodyMesh.visible = true;
      if (this.bodyLodA) this.bodyLodA.visible = true;
      if (this.interiorMesh) this.interiorMesh.visible = true;
      if (this.badgesMesh) this.badgesMesh.visible = true;
      if (this.wheelsGroup) this.wheelsGroup.visible = true;
      if (this.baseUndertrayMesh) this.baseUndertrayMesh.visible = !this.isCutawayActive;
    } else if (subsystemId === 'brakes_wheels' || subsystemId === 'rolling_chassis') {
      this.group.visible = true;
      if (this.fbxRoot) {
        const wheels = this.wheelsGroup;
        this.fbxRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            let isWheel = false;
            let p: THREE.Object3D | null = child;
            while (p && p !== this.fbxRoot) {
              if (p === wheels || (p.name && p.name.toLowerCase().includes('wheel'))) {
                isWheel = true;
                break;
              }
              p = p.parent;
            }
            child.visible = isWheel;
          }
        });
      }
      if (this.bodyMesh) this.bodyMesh.visible = false;
      if (this.bodyLodA) this.bodyLodA.visible = false;
      if (this.interiorMesh) this.interiorMesh.visible = false;
      if (this.badgesMesh) this.badgesMesh.visible = false;
      if (this.unibodyChassisGroup) this.unibodyChassisGroup.visible = false;
      if (this.wheelsGroup) this.wheelsGroup.visible = true;
      if (this.baseUndertrayMesh) this.baseUndertrayMesh.visible = false;
    } else {
      this.group.visible = false;
    }
  }

  public update(
    explodeFactor: number,
    isXRay: boolean,
    isCutaway: boolean = false,
    steeringAngleDeg?: number
  ) {
    this.isCutawayActive = isCutaway;

    if (steeringAngleDeg !== undefined) {
      this.currentSteeringAngle = steeringAngleDeg;
    }

    if (this.currentXRayState !== isXRay) {
      this.currentXRayState = isXRay;
      this.applyXRayState(isXRay);
    }

    // Dynamic front wheel steering & camber/caster tilt
    if (this.frontLeftWheelPivot && this.frontRightWheelPivot) {
      const steerRad = (this.currentSteeringAngle * Math.PI) / 180;
      const ackermannFL = steerRad > 0 ? 1.05 : 0.95;
      const ackermannFR = steerRad > 0 ? 0.95 : 1.05;
      const staticCamber = 0.0; // 0° static camber at neutral steering (perfectly vertical, no tilt)
      const dynamicCamberGain = 0.12; // Dynamic camber tilt active only when steering angle is applied
      const casterPitch = -steerRad * 0.04;

      // Camber tilt around Z axis (0 at neutral, tilts with steering input)
      const camberFL = staticCamber + steerRad * dynamicCamberGain;
      const camberFR = staticCamber + steerRad * dynamicCamberGain;

      this.frontLeftWheelPivot.rotation.order = 'YXZ';
      this.frontLeftWheelPivot.rotation.y = steerRad * ackermannFL;
      this.frontLeftWheelPivot.rotation.z = camberFL;
      this.frontLeftWheelPivot.rotation.x = casterPitch;

      this.frontRightWheelPivot.rotation.order = 'YXZ';
      this.frontRightWheelPivot.rotation.y = steerRad * ackermannFR;
      this.frontRightWheelPivot.rotation.z = camberFR;
      this.frontRightWheelPivot.rotation.x = casterPitch;

      // Exploded View lateral wheel displacement
      if (explodeFactor > 0.001) {
        this.frontLeftWheelPivot.position.set(0.78326 + explodeFactor * 0.25, 0.3386, 1.535);
        this.frontRightWheelPivot.position.set(-0.78326 - explodeFactor * 0.25, 0.3386, 1.535);
      } else {
        this.frontLeftWheelPivot.position.set(0.78326, 0.3386, 1.535);
        this.frontRightWheelPivot.position.set(-0.78326, 0.3386, 1.535);
      }
    }

    // Unibody platform visible when exploded, never during cutaway or X-Ray
    this.unibodyChassisGroup.visible = (explodeFactor > 0.03) && !isCutaway && !isXRay;

    // Underbody base undertray hidden in cutaway mode or rolling chassis to reveal complete powertrain
    if (this.baseUndertrayMesh) {
      this.baseUndertrayMesh.visible =
        !isCutaway &&
        this.currentSubsystem !== 'rolling_chassis' &&
        this.currentSubsystem !== 'brakes_wheels';
    }

    // Exploded View Disassembly Kinematics:
    if (explodeFactor > 0.001) {
      // 1. Body shell lifts upward (+Y)
      if (this.bodyMesh) this.bodyMesh.position.set(0, explodeFactor * 0.70, 0);
      if (this.badgesMesh) this.badgesMesh.position.set(0, explodeFactor * 0.70, 0);

      // 2. Greenhouse glass lifts higher (+Y) inside Body_lodA
      if (this.windowMesh) this.windowMesh.position.set(0, explodeFactor * 0.85, 0);
      if (this.windowInsideMesh) this.windowInsideMesh.position.set(0, explodeFactor * 0.85, 0);

      // 3. Cabin interior lifts slightly (+Y)
      if (this.interiorMesh) this.interiorMesh.position.set(0, explodeFactor * 0.30, 0);

      // 4. Headlights and Grilles glide forward (+Z) inside Body_lodA
      if (this.lightMesh) this.lightMesh.position.set(0, 0, explodeFactor * 0.75);
      for (const g of this.grilleMeshes) {
        g.position.set(0, 0, explodeFactor * 0.75);
      }

      // 5. Carbon aero skirts and undertray lower slightly (-Y)
      if (this.carbonMesh) this.carbonMesh.position.set(0, -explodeFactor * 0.15, 0);
      if (this.baseUndertrayMesh) this.baseUndertrayMesh.position.set(0, -explodeFactor * 0.25, 0);

      // 6. Engine bay cowling lifts (+Y)
      if (this.engineCowlingMesh) this.engineCowlingMesh.position.set(0, explodeFactor * 0.40, 0);
    } else {
      // Return everything to exact native 0 rest offset
      if (this.bodyMesh) this.bodyMesh.position.set(0, 0, 0);
      if (this.badgesMesh) this.badgesMesh.position.set(0, 0, 0);
      if (this.windowMesh) this.windowMesh.position.set(0, 0, 0);
      if (this.windowInsideMesh) this.windowInsideMesh.position.set(0, 0, 0);
      if (this.interiorMesh) this.interiorMesh.position.set(0, 0, 0);
      if (this.lightMesh) this.lightMesh.position.set(0, 0, 0);
      for (const g of this.grilleMeshes) {
        g.position.set(0, 0, 0);
      }
      if (this.carbonMesh) this.carbonMesh.position.set(0, 0, 0);
      if (this.baseUndertrayMesh) this.baseUndertrayMesh.position.set(0, 0, 0);
      if (this.engineCowlingMesh) this.engineCowlingMesh.position.set(0, 0, 0);
    }
  }
}
