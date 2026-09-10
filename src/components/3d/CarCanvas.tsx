import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CarModel } from './CarModel';
import { PowertrainState, SubsystemId, ViewMode } from '../../types/powertrain';
import { SUBSYSTEM_SPECS } from '../../data/subsystemData';
import { createAsphaltParkingGroundTexture } from './materials/ProceduralTextures';

interface CarCanvasProps {
  state: PowertrainState;
  viewMode: ViewMode;
  explodeFactor: number;
  selectedSubsystem: SubsystemId;
  onSelectSubsystem: (id: SubsystemId) => void;
  paintColor?: string;
}

export const CarCanvas: React.FC<CarCanvasProps> = ({
  state,
  viewMode,
  explodeFactor,
  selectedSubsystem,
  onSelectSubsystem,
  paintColor,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const carModelRef = useRef<CarModel | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(4.40, 1.35, 4.40));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.60, 0.10));

  // Handle camera transition when selected subsystem changes
  useEffect(() => {
    const spec = SUBSYSTEM_SPECS[selectedSubsystem] || SUBSYSTEM_SPECS.all;
    targetCamPosRef.current.set(...spec.cameraPosition);
    targetLookAtRef.current.set(...spec.cameraTarget);

    if (carModelRef.current) {
      carModelRef.current.setSubsystemFocus(selectedSubsystem);
    }
  }, [selectedSubsystem]);

  // Handle View Mode changes
  useEffect(() => {
    if (carModelRef.current) {
      carModelRef.current.setViewMode(viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    if (carModelRef.current && paintColor) {
      const hex = parseInt(paintColor.replace('#', '0x'), 16);
      carModelRef.current.setPaintColor(hex);
    }
  }, [paintColor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2028); // Overcast outdoor sky tone
    scene.fog = new THREE.FogExp2(0x1a2028, 0.025);

    // 2. Camera setup - Calibrated Hero 3/4 Studio View Framing Full M3 Touring
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(4.35, 1.25, 4.35);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.localClippingEnabled = true; // Enables cutaway section clipping
    container.appendChild(renderer.domElement);

    // 4. HDR Studio Reflections with RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.8;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Don't flip below ground
    controls.target.set(0, 0.58, 0.08);
    controlsRef.current = controls;

    let isUserInteracting = false;
    const onControlsStart = () => {
      isUserInteracting = true;
    };
    const onControlsEnd = () => {
      isUserInteracting = false;
      targetCamPosRef.current.copy(camera.position);
      targetLookAtRef.current.copy(controls.target);
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('end', onControlsEnd);

    (window as any).__SET_CAMERA__ = (px: number, py: number, pz: number, tx: number, ty: number, tz: number) => {
      targetCamPosRef.current.set(px, py, pz);
      targetLookAtRef.current.set(tx, ty, tz);
      camera.position.set(px, py, pz);
      controls.target.set(tx, ty, tz);
      controls.update();
    };

    // 6. Lighting: Authentic Outdoor Automotive Daylight Rig matching Reference Image
    // Soft cool overcast sky hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xe2ecf8, 0x1e242c, 0.85);
    scene.add(hemiLight);

    // Key directional sunlight casting crisp soft car contact shadows onto asphalt
    const dirLight = new THREE.DirectionalLight(0xfffef5, 1.8);
    dirLight.position.set(4.5, 8.5, 6.0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.bias = -0.0002;
    dirLight.shadow.radius = 2.0;
    scene.add(dirLight);

    // Front soft sky fill light for clear grille and badge definition
    const fillLight = new THREE.DirectionalLight(0xecf2fa, 0.9);
    fillLight.position.set(0, 3.5, 7.5);
    scene.add(fillLight);

    // Soft rim light accentuating the dynamic swoosh crease
    const rimLight = new THREE.DirectionalLight(0xd0e0f8, 0.8);
    rimLight.position.set(-6, 3.5, -4);
    scene.add(rimLight);

    // 7. Authentic Outdoor Asphalt Parking Lot Ground with Painted White Lines
    const asphaltTex = createAsphaltParkingGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.88,
      metalness: 0.10,
    });
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.005;
    ground.receiveShadow = true;
    scene.add(ground);

    // Realistic Soft Contact Shadow directly beneath car tires and floorpan
    const shadowPlaneGeo = new THREE.PlaneGeometry(3.2, 5.8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.65 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.001, -0.05);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 8. Master BMW M3 Car Model
    const carModel = new CarModel();
    carModelRef.current = carModel;
    (window as any).__CAR_MODEL__ = carModel;
    (window as any).__THREE_CAMERA__ = camera;
    (window as any).__THREE_CONTROLS__ = controls;
    (window as any).__THREE__ = THREE;
    scene.add(carModel.group);

    // 7. Raycasting click-to-focus on 3D parts
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(carModel.group.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        let detectedSubsystem: SubsystemId = 'all';

        // Traverse up to find which assembly was clicked
        while (obj && obj !== carModel.group) {
          if (obj.name === 'TurboAssembly') {
            detectedSubsystem = 'turbocharger';
            break;
          } else if (obj.name === 'ValvetrainAssembly') {
            detectedSubsystem = 'valvetrain';
            break;
          } else if (obj.name === 'RotatingAssembly') {
            detectedSubsystem = 'rotating_assembly';
            break;
          } else if (obj.name === 'EngineAssembly') {
            detectedSubsystem = 'engine_bay';
            break;
          } else if (obj.name === 'TransmissionAssembly') {
            detectedSubsystem = 'transmission';
            break;
          } else if (obj.name === 'DrivetrainAssembly') {
            detectedSubsystem = 'driveshaft';
            break;
          } else if (obj.name === 'DifferentialAssembly') {
            detectedSubsystem = 'differential';
            break;
          } else if (obj.name === 'ExhaustAssembly') {
            detectedSubsystem = 'exhaust';
            break;
          } else if (obj.name === 'SuspensionAssembly') {
            detectedSubsystem = 'chassis_suspension';
            break;
          } else if (obj.name === 'ExteriorChassisAssembly') {
            detectedSubsystem = 'exterior';
            break;
          }
          obj = obj.parent;
        }

        if (detectedSubsystem !== 'all') {
          onSelectSubsystem(detectedSubsystem);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 8. Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation render loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera interpolation towards target when not dragging
      if (!isUserInteracting) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        controls.target.lerp(targetLookAtRef.current, 0.08);
      }
      controls.update();

      // Render scene
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('end', onControlsEnd);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update car model animations every state update
  useEffect(() => {
    if (carModelRef.current) {
      carModelRef.current.update(state, explodeFactor, viewMode);
    }
  }, [state, explodeFactor, viewMode]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
    />
  );
};
