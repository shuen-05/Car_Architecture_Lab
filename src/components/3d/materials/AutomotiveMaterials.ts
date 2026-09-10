import * as THREE from 'three';
import { createSpindleGrilleTexture, createMPowerEngineCoverTexture } from './ProceduralTextures';

export interface CarMaterials {
  carPaint: THREE.MeshPhysicalMaterial;
  carPaintSecondary: THREE.MeshPhysicalMaterial;
  carbonFiber: THREE.MeshStandardMaterial;
  shadowlineGloss: THREE.MeshPhysicalMaterial;
  carGlass: THREE.MeshPhysicalMaterial;
  chassisSteel: THREE.MeshStandardMaterial;
  subframeBlack: THREE.MeshStandardMaterial;
  engineAluminum: THREE.MeshStandardMaterial;
  polishedSteel: THREE.MeshStandardMaterial;
  castIron: THREE.MeshStandardMaterial;
  inconelHeat: THREE.MeshStandardMaterial;
  turboCompressor: THREE.MeshStandardMaterial;
  brassBronze: THREE.MeshStandardMaterial;
  intakePlastic: THREE.MeshStandardMaterial;
  rubberBlack: THREE.MeshStandardMaterial;
  brakeRotor: THREE.MeshStandardMaterial;
  brakeCaliper: THREE.MeshPhysicalMaterial;
  rimSilver: THREE.MeshStandardMaterial;
  rimDark: THREE.MeshStandardMaterial;
  chromeTrim: THREE.MeshStandardMaterial;
  spindleMesh: THREE.MeshStandardMaterial;
  headlightLens: THREE.MeshPhysicalMaterial;
  ledEmissive: THREE.MeshStandardMaterial;
  ledRedEmissive: THREE.MeshStandardMaterial;
  sparkFlameEmissive: THREE.MeshStandardMaterial;
  gearSteel: THREE.MeshStandardMaterial;
  transmissionFluid: THREE.MeshPhysicalMaterial;
  xrayChassis: THREE.MeshPhysicalMaterial;
  xrayInterior: THREE.MeshPhysicalMaterial;
  mPowerEngineCover: THREE.MeshPhysicalMaterial;
  suspensionDamperYellow: THREE.MeshStandardMaterial;
  heatShieldGold: THREE.MeshPhysicalMaterial;
  rubberBootBlack: THREE.MeshStandardMaterial;
  anodizedBlue: THREE.MeshStandardMaterial;
  compositePanBlack: THREE.MeshStandardMaterial;
  exhaustStainless: THREE.MeshStandardMaterial;
  exhaustBlackChrome: THREE.MeshPhysicalMaterial;
  exhaustFlexBellows: THREE.MeshStandardMaterial;
  exhaustHeatShieldSilver: THREE.MeshStandardMaterial;
  exhaustMufflerBody: THREE.MeshStandardMaterial;
  valveActuator: THREE.MeshStandardMaterial;
}

export function createAutomotiveMaterials(clippingPlanes: THREE.Plane[] = []): CarMaterials {
  const commonProps = {
    clippingPlanes,
    clipShadows: true,
    side: THREE.DoubleSide,
  };

  // 1. BMW Isle of Man Green Metallic (Signature M3 Touring Launch Color)
  const carPaint = new THREE.MeshPhysicalMaterial({
    color: 0x134d3c, // BMW Isle of Man Green metallic
    metalness: 0.65,
    roughness: 0.20,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 0.95,
    envMapIntensity: 1.6,
    ...commonProps,
  });

  // Secondary metallic trim / contrast
  const carPaintSecondary = new THREE.MeshPhysicalMaterial({
    color: 0x11141a,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.5,
    ...commonProps,
  });

  // M Carbon Fiber (Roof, Front Strut Brace, Mirror Caps, Prop-Shaft)
  const carbonFiber = new THREE.MeshStandardMaterial({
    color: 0x1a1c20,
    metalness: 0.5,
    roughness: 0.35,
    envMapIntensity: 1.3,
    ...commonProps,
  });

  // M High-Gloss Shadowline (Grille surrounds, window trim, rear diffuser, side skirts)
  const shadowlineGloss = new THREE.MeshPhysicalMaterial({
    color: 0x08090b,
    metalness: 0.2,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.98,
    envMapIntensity: 2.0,
    ...commonProps,
  });

  // 2. High-End Automotive Tinted Safety Glass
  const carGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0a121c,
    metalness: 0.25,
    roughness: 0.05,
    transmission: 0.65,
    transparent: true,
    opacity: 0.75,
    ior: 1.52,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.2,
    ...commonProps,
  });

  // 3. Chassis & Structural Subframe Materials
  const chassisSteel = new THREE.MeshStandardMaterial({
    color: 0x282e38,
    metalness: 0.75,
    roughness: 0.45,
    ...commonProps,
  });

  const subframeBlack = new THREE.MeshStandardMaterial({
    color: 0x121418,
    metalness: 0.4,
    roughness: 0.65,
    ...commonProps,
  });

  // 4. 8AR-FTS Die-cast aluminum alloy
  const engineAluminum = new THREE.MeshStandardMaterial({
    color: 0xc4cbdb,
    metalness: 0.82,
    roughness: 0.32,
    envMapIntensity: 1.2,
    ...commonProps,
  });

  // 5. Micro-finished forged steel (crankshaft, wrist pins, camshaft lobes)
  const polishedSteel = new THREE.MeshStandardMaterial({
    color: 0xe8edf5,
    metalness: 0.96,
    roughness: 0.1,
    envMapIntensity: 1.8,
    ...commonProps,
  });

  // 6. Cast iron (exhaust manifold, cylinder liners, brake rotors)
  const castIron = new THREE.MeshStandardMaterial({
    color: 0x42464e,
    metalness: 0.7,
    roughness: 0.58,
    ...commonProps,
  });

  // 7. Inconel 713C turbine wheel & glowing exhaust scroll
  const inconelHeat = new THREE.MeshStandardMaterial({
    color: 0x8a4524,
    metalness: 0.85,
    roughness: 0.32,
    emissive: 0xcc2800,
    emissiveIntensity: 0.3,
    ...commonProps,
  });

  // 8. Billet CNC aluminum compressor wheel
  const turboCompressor = new THREE.MeshStandardMaterial({
    color: 0xf0f4fc,
    metalness: 0.98,
    roughness: 0.14,
    envMapIntensity: 1.6,
    ...commonProps,
  });

  // 9. Bronze / Copper journal bearings & bushings
  const brassBronze = new THREE.MeshStandardMaterial({
    color: 0xcfa048,
    metalness: 0.88,
    roughness: 0.28,
    ...commonProps,
  });

  // 10. Polyamide composite airbox and intake runners
  const intakePlastic = new THREE.MeshStandardMaterial({
    color: 0x181a1e,
    metalness: 0.1,
    roughness: 0.72,
    ...commonProps,
  });

  // 11. High-performance tire rubber
  const rubberBlack = new THREE.MeshStandardMaterial({
    color: 0x131416,
    metalness: 0.05,
    roughness: 0.92,
    ...commonProps,
  });

  // 12. Ventilated directional brake rotor
  const brakeRotor = new THREE.MeshStandardMaterial({
    color: 0x9ca4b0,
    metalness: 0.92,
    roughness: 0.24,
    envMapIntensity: 1.4,
    ...commonProps,
  });

  // 13. Lexus F-Sport High-Temp Orange brake caliper
  const brakeCaliper = new THREE.MeshPhysicalMaterial({
    color: 0xf05a00,
    metalness: 0.55,
    roughness: 0.2,
    clearcoat: 0.8,
    envMapIntensity: 1.3,
    ...commonProps,
  });

  // 14. 18-inch alloy wheel rim finishes (Two-Tone Diamond Cut)
  const rimSilver = new THREE.MeshStandardMaterial({
    color: 0xeef2fa,
    metalness: 0.94,
    roughness: 0.16,
    envMapIntensity: 1.8,
    ...commonProps,
  });

  const rimDark = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    metalness: 0.85,
    roughness: 0.35,
    ...commonProps,
  });

  // 15. Bright Chrome Trim (spindle surround, exhaust tips, emblems)
  const chromeTrim = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.02,
    envMapIntensity: 2.2,
    ...commonProps,
  });

  // 16. Spindle grille 3D diamond mesh
  const grilleTexture = createSpindleGrilleTexture();
  const spindleMesh = new THREE.MeshStandardMaterial({
    map: grilleTexture,
    color: 0xffffff,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.5,
    ...commonProps,
  });

  // 17. Crystal Clear Headlight Lens
  const headlightLens = new THREE.MeshPhysicalMaterial({
    color: 0xddeaff,
    metalness: 0.1,
    roughness: 0.04,
    transmission: 0.95,
    transparent: true,
    opacity: 0.3,
    ior: 1.5,
    envMapIntensity: 2.2,
    ...commonProps,
  });

  // 18. Triple-Beam Jewel Projector LED
  const ledEmissive = new THREE.MeshStandardMaterial({
    color: 0xe8f4ff,
    emissive: 0x9be0ff,
    emissiveIntensity: 2.4,
    metalness: 0.2,
    roughness: 0.1,
    ...commonProps,
  });

  // 19. Rear full-width L-Signature LED light blade
  const ledRedEmissive = new THREE.MeshStandardMaterial({
    color: 0xff1420,
    emissive: 0xff0a16,
    emissiveIntensity: 2.2,
    ...commonProps,
  });

  // 20. Spark plug combustion flash
  const sparkFlameEmissive = new THREE.MeshStandardMaterial({
    color: 0xffb338,
    emissive: 0xff7700,
    emissiveIntensity: 3.2,
    transparent: true,
    opacity: 0.92,
    ...commonProps,
  });

  // 21. Case-hardened transmission gear steel
  const gearSteel = new THREE.MeshStandardMaterial({
    color: 0x828b99,
    metalness: 0.94,
    roughness: 0.18,
    envMapIntensity: 1.4,
    ...commonProps,
  });

  // 22. Red translucent Automatic Transmission Fluid (ATF)
  const transmissionFluid = new THREE.MeshPhysicalMaterial({
    color: 0xd90036,
    transmission: 0.82,
    transparent: true,
    opacity: 0.42,
    roughness: 0.1,
    ior: 1.46,
    ...commonProps,
  });

  // 23. Holographic Iridescent Blueprint X-Ray Chassis & Interior
  const xrayChassis = new THREE.MeshPhysicalMaterial({
    color: 0x0a2d52,
    emissive: 0x0077cc,
    emissiveIntensity: 0.45,
    metalness: 0.4,
    roughness: 0.15,
    transmission: 0.86,
    transparent: true,
    opacity: 0.22,
    ior: 1.35,
    depthWrite: false,
    ...commonProps,
  });

  const xrayInterior = new THREE.MeshPhysicalMaterial({
    color: 0x0a2d52,
    emissive: 0x0077cc,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.15,
    transmission: 0.86,
    transparent: true,
    opacity: 0.12,
    ior: 1.35,
    depthWrite: false,
    ...commonProps,
  });

  // 24. Authentic BMW M Power Carbon Engine Vanity Cover Material
  const mPowerCoverTexture = createMPowerEngineCoverTexture();
  const mPowerEngineCover = new THREE.MeshPhysicalMaterial({
    map: mPowerCoverTexture,
    metalness: 0.35,
    roughness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
    envMapIntensity: 1.5,
    ...commonProps,
  });

  // 24. Suspension Polyurethane Bump Stop Elastomer
  const suspensionDamperYellow = new THREE.MeshStandardMaterial({
    color: 0xe89e24,
    roughness: 0.65,
    metalness: 0.05,
    ...commonProps,
  });

  // 25. Embossed Thermal Heat Shield Foil
  const heatShieldGold = new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    metalness: 0.92,
    roughness: 0.32,
    clearcoat: 0.35,
    reflectivity: 0.9,
    ...commonProps,
  });

  // 26. Synthetic Suspension & Steering Bellows Rubber
  const rubberBootBlack = new THREE.MeshStandardMaterial({
    color: 0x151517,
    roughness: 0.92,
    metalness: 0.02,
    ...commonProps,
  });

  // 27. Anodized CNC Aluminum Hardware
  const anodizedBlue = new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    metalness: 0.85,
    roughness: 0.25,
    ...commonProps,
  });

  // 28. Ribbed Composite Transmission Oil Pan
  const compositePanBlack = new THREE.MeshStandardMaterial({
    color: 0x1a1c20,
    roughness: 0.80,
    metalness: 0.12,
    ...commonProps,
  });

  // 29. Mandrel-Bent 304 Stainless Steel Exhaust Tubing (with warm straw heat tint)
  const exhaustStainless = new THREE.MeshStandardMaterial({
    color: 0xd2c9bd,
    roughness: 0.28,
    metalness: 0.88,
    ...commonProps,
  });

  // 30. Quad 100mm Black Chrome M Tailpipes with Deep Clearcoat
  const exhaustBlackChrome = new THREE.MeshPhysicalMaterial({
    color: 0x181a20,
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 0.95,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.2,
    ...commonProps,
  });

  // 31. Flexible Decoupler Stainless Steel Wire-Bellows
  const exhaustFlexBellows = new THREE.MeshStandardMaterial({
    color: 0xa8aab0,
    roughness: 0.50,
    metalness: 0.82,
    ...commonProps,
  });

  // 32. Dimpled Aluminum Underbody Tunnel Heat Shield
  const exhaustHeatShieldSilver = new THREE.MeshStandardMaterial({
    color: 0xd8dde4,
    roughness: 0.42,
    metalness: 0.78,
    ...commonProps,
  });

  // 33. Stamped 304 Stainless Steel Transverse Rear Silencer (Backbox)
  const exhaustMufflerBody = new THREE.MeshStandardMaterial({
    color: 0xb5bcc6,
    roughness: 0.38,
    metalness: 0.84,
    ...commonProps,
  });

  // 34. Electronic Flap Valve Stepper Motor Actuator
  const valveActuator = new THREE.MeshStandardMaterial({
    color: 0x22252a,
    roughness: 0.72,
    metalness: 0.30,
    ...commonProps,
  });

  return {
    carPaint,
    carPaintSecondary,
    carbonFiber,
    shadowlineGloss,
    carGlass,
    chassisSteel,
    subframeBlack,
    engineAluminum,
    polishedSteel,
    castIron,
    inconelHeat,
    turboCompressor,
    brassBronze,
    intakePlastic,
    rubberBlack,
    brakeRotor,
    brakeCaliper,
    rimSilver,
    rimDark,
    chromeTrim,
    spindleMesh,
    headlightLens,
    ledEmissive,
    ledRedEmissive,
    sparkFlameEmissive,
    gearSteel,
    transmissionFluid,
    xrayChassis,
    xrayInterior,
    mPowerEngineCover,
    suspensionDamperYellow,
    heatShieldGold,
    rubberBootBlack,
    anodizedBlue,
    compositePanBlack,
    exhaustStainless,
    exhaustBlackChrome,
    exhaustFlexBellows,
    exhaustHeatShieldSilver,
    exhaustMufflerBody,
    valveActuator,
  };
}
