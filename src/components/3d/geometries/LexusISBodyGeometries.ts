import * as THREE from 'three';

/**
 * Procedural continuous smooth geometry builder for 2025 Lexus IS 300.
 * Constructs sleek, continuous body panels with smooth vertex normals (no blocky boxes).
 */

// Helper to calculate smooth normals
export function finalizeGeometry(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the continuous, sculpted Hood of the Lexus IS 300
 * Features central power-bulge, dual sharp character creases, and curved nose contour.
 */
export function createLexusHoodGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const resX = 16;
  const resZ = 20;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Hood runs from cowl (Z = +0.72) to front nose (Z = +1.98)
  const zStart = 0.72;
  const zEnd = 1.98;

  for (let j = 0; j <= resZ; j++) {
    const v = j / resZ;
    const z = zStart + v * (zEnd - zStart);

    // Width narrows from cowl (~1.48m) to nose (~1.12m)
    const widthAtZ = 1.48 - v * 0.36;
    const halfW = widthAtZ / 2;

    // Height slopes from cowl (0.84m) down to front nose (0.64m)
    const baseY = 0.84 - v * 0.20 - Math.pow(v, 2) * 0.04;

    for (let i = 0; i <= resX; i++) {
      const u = i / resX;
      const x = (u - 0.5) * widthAtZ;
      const normX = Math.abs(u - 0.5) * 2; // 0 at center, 1 at edge

      // Subtle transverse curvature (dome)
      let y = baseY + (1 - Math.pow(normX, 2)) * 0.035;

      // Dual center power-bulge character creases around normX = 0.35
      const creaseDist = Math.abs(normX - 0.35);
      if (creaseDist < 0.22) {
        y += Math.cos((creaseDist / 0.22) * (Math.PI / 2)) * 0.016;
      }

      // Drop off at outer hood shutlines
      if (normX > 0.85) {
        const edgeDrop = (normX - 0.85) / 0.15;
        y -= edgeDrop * 0.035;
      }

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < resZ; j++) {
    for (let i = 0; i < resX; i++) {
      const a = j * (resX + 1) + i;
      const b = j * (resX + 1) + (i + 1);
      const c = (j + 1) * (resX + 1) + i;
      const d = (j + 1) * (resX + 1) + (i + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}

/**
 * Builds the signature Lexus Spindle Grille surface
 * Massive single-piece hourglass: wide upper crown, pinched waist, flared aggressive lower trapezoid.
 */
export function createLexusSpindleGrilleGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const resY = 24;
  const resX = 18;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const yMin = 0.14; // Lower splitter level
  const yMax = 0.64; // Upper hood shutline level
  const yWaist = 0.44; // Pinched waist level

  for (let j = 0; j <= resY; j++) {
    const v = j / resY;
    const y = yMin + v * (yMax - yMin);

    // Calculate width along hourglass curve:
    // Pinched at yWaist (~0.68m), flared at bottom (~1.08m), medium at top (~0.92m)
    let halfWidth = 0.34;
    if (y < yWaist) {
      const lowerT = (yWaist - y) / (yWaist - yMin);
      halfWidth = 0.34 + lowerT * 0.20; // 0.54m (1.08m wide) at base
    } else {
      const upperT = (y - yWaist) / (yMax - yWaist);
      halfWidth = 0.34 + upperT * 0.12; // 0.46m (0.92m wide) at top
    }

    // Forward protrusion (spindle nose juts forward)
    const zBase = 2.08 - Math.abs(y - yWaist) * 0.08;

    for (let i = 0; i <= resX; i++) {
      const u = i / resX;
      const x = (u - 0.5) * (halfWidth * 2);
      const normX = Math.abs(u - 0.5) * 2;

      // Grille bows forward in the center
      const z = zBase - Math.pow(normX, 1.8) * 0.12;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < resY; j++) {
    for (let i = 0; i < resX; i++) {
      const a = j * (resX + 1) + i;
      const b = j * (resX + 1) + (i + 1);
      const c = (j + 1) * (resX + 1) + i;
      const d = (j + 1) * (resX + 1) + (i + 1);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}

/**
 * Builds the sharp Spindle Grille Chrome Border Frame
 */
export function createSpindleFrameCurve(): THREE.CatmullRomCurve3 {

  const yMin = 0.14;
  const yWaist = 0.44;
  const yMax = 0.64;

  const points = [
    // Bottom edge
    new THREE.Vector3(-0.54, yMin, 2.01),
    new THREE.Vector3(0, yMin, 2.10),
    new THREE.Vector3(0.54, yMin, 2.01),
    // Right upward taper to waist
    new THREE.Vector3(0.35, yWaist, 2.02),
    // Right upward flare to top
    new THREE.Vector3(0.46, yMax, 1.94),
    // Top edge
    new THREE.Vector3(0, yMax, 2.02),
    new THREE.Vector3(-0.46, yMax, 1.94),
    // Left downward taper to waist
    new THREE.Vector3(-0.35, yWaist, 2.02),
    // Left downward flare to bottom
    new THREE.Vector3(-0.54, yMin, 2.01),
  ];

  const curve = new THREE.CatmullRomCurve3(points, true);
  return curve;
}

/**
 * Builds continuous Front Bumper Fascia wrapping around the spindle grille and headlights
 */
export function createFrontBumperFasciaGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  // Create left and right front bumper cheeks
  // Runs from wheel arch (Z = +1.20) to nose corner (Z = +2.05)
  for (const side of [-1, 1]) {
    const stepsZ = 12;
    const stepsY = 8;
    const startIdx = positions.length / 3;

    for (let j = 0; j <= stepsZ; j++) {
      const tZ = j / stepsZ;
      const z = 1.20 + tZ * 0.85;

      // Width narrows slightly toward front
      const xOuter = side * (0.86 - Math.pow(tZ, 2) * 0.14);
      // Inner edge meets the spindle grille boundary
      let xInner = side * (0.40 - tZ * 0.10);
      if (tZ > 0.7) {
        const grilleT = (tZ - 0.7) / 0.3;
        xInner = side * (0.33 + grilleT * 0.18);
      }

      for (let i = 0; i <= stepsY; i++) {
        const tY = i / stepsY;
        const y = 0.14 + tY * 0.48; // 0.14 to 0.62

        const x = xInner + (xOuter - xInner) * (1 - tY * 0.2);
        // Aerodynamic curvature
        const zOffset = Math.sin(tY * Math.PI) * 0.04;

        positions.push(x, y, z + zOffset);
        uvs.push(tZ, tY);
      }
    }

    for (let j = 0; j < stepsZ; j++) {
      for (let i = 0; i < stepsY; i++) {
        const a = startIdx + j * (stepsY + 1) + i;
        const b = startIdx + j * (stepsY + 1) + (i + 1);
        const c = startIdx + (j + 1) * (stepsY + 1) + i;
        const d = startIdx + (j + 1) * (stepsY + 1) + (i + 1);

        if (side === 1) {
          indices.push(a, c, b);
          indices.push(b, c, d);
        } else {
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}

/**
 * Builds continuous Side Body Panels with the signature rising dynamic swoosh line
 */
export function createLexusSideBodyGeometry(side: 1 | -1): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const zMin = -1.25; // Rear wheel center
  const zMax = 1.15;  // Front wheel center
  const resZ = 24;
  const resY = 12;

  for (let j = 0; j <= resZ; j++) {
    const v = j / resZ;
    const z = zMax - v * (zMax - zMin); // from front wheel to rear wheel

    for (let i = 0; i <= resY; i++) {
      const u = i / resY;
      const y = 0.14 + u * 0.72; // Rocker to shoulder line (0.14m to 0.86m)

      // Signature Lexus IS rising dynamic character line:
      // Starts low near front door, swooshes sharply upward toward rear wheel arch!
      const risingLineY = 0.22 + Math.pow(v, 1.8) * 0.38;
      const distToCrease = Math.abs(y - risingLineY);

      // Base body bulge (narrower in waist Z=0, wider at muscular rear haunch Z=-1.25)
      let halfWidth = 0.82 + Math.pow(v, 2) * 0.07;
      
      // Crease flare
      if (distToCrease < 0.12) {
        halfWidth += Math.cos((distToCrease / 0.12) * (Math.PI / 2)) * 0.022;
      }

      // Tumblehome (side glass and upper shoulder tucks inward)
      if (y > 0.65) {
        const tuck = (y - 0.65) / 0.21;
        halfWidth -= tuck * 0.06;
      }

      const x = side * halfWidth;

      positions.push(x, y, z);
      uvs.push(v, u);
    }
  }

  for (let j = 0; j < resZ; j++) {
    for (let i = 0; i < resY; i++) {
      const a = j * (resY + 1) + i;
      const b = j * (resY + 1) + (i + 1);
      const c = (j + 1) * (resY + 1) + i;
      const d = (j + 1) * (resY + 1) + (i + 1);

      if (side === 1) {
        indices.push(a, b, c);
        indices.push(b, d, c);
      } else {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}

/**
 * Builds continuous Aerodynamic Greenhouse & Fastback Roof Shell
 */
export function createLexusRoofGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const resZ = 24;
  const resX = 14;

  // Runs from top of front windshield (Z = +0.15) to rear ducktail (Z = -1.95)
  const zStart = 0.18;
  const zEnd = -1.95;

  for (let j = 0; j <= resZ; j++) {
    const v = j / resZ;
    const z = zStart + v * (zEnd - zStart);

    // Profile curve: roof is highest (1.42m) near B-pillar (Z = -0.30), slopes to 0.94m at trunk
    let y = 1.38;
    if (z > -0.35) {
      // Front roof crown
      const t = (z - (-0.35)) / (zStart - (-0.35));
      y = 1.41 - t * 0.04;
    } else if (z > -1.40) {
      // Rear fastback slope
      const t = ((-0.35) - z) / (1.40 - 0.35);
      y = 1.41 - Math.pow(t, 1.4) * 0.38; // down to ~1.03m
    } else {
      // Trunk decklid
      const t = ((-1.40) - z) / (1.95 - 1.40);
      y = 1.03 - t * 0.09 + Math.pow(t, 3) * 0.04; // ducktail kick at end
    }

    // Width curve: narrows at trunk
    const widthAtZ = z > -1.2 ? 1.34 - (1 - Math.abs(z + 0.35) / 1.5) * 0.08 : 1.42 - (Math.abs(z + 1.2) / 0.75) * 0.12;

    for (let i = 0; i <= resX; i++) {
      const u = i / resX;
      const x = (u - 0.5) * widthAtZ;
      const normX = Math.abs(u - 0.5) * 2;

      // Subtle aerodynamic crown / Pagoda roof depression
      let roofY = y - Math.pow(normX, 2) * 0.04;

      positions.push(x, roofY, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < resZ; j++) {
    for (let i = 0; i < resX; i++) {
      const a = j * (resX + 1) + i;
      const b = j * (resX + 1) + (i + 1);
      const c = (j + 1) * (resX + 1) + i;
      const d = (j + 1) * (resX + 1) + (i + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}

/**
 * Builds continuous Rear Bumper & Diffuser Assembly
 */
export function createLexusRearBumperGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const resZ = 10;
  const resX = 20;

  const zStart = -1.90;
  const zEnd = -2.28;

  for (let j = 0; j <= resZ; j++) {
    const v = j / resZ;
    const z = zStart + v * (zEnd - zStart);

    // Rear bumper profile height
    const yTop = 0.94 - v * 0.06;
    const yBottom = 0.16 + v * 0.08;

    const width = 1.76 - v * 0.12;

    for (let i = 0; i <= resX; i++) {
      const u = i / resX;
      const x = (u - 0.5) * width;
      const normX = Math.abs(u - 0.5) * 2;

      // Wrap around rear corners
      const cornerZ = z - Math.pow(normX, 3) * 0.18;
      const y = yBottom + (yTop - yBottom) * (1 - Math.pow(normX, 4) * 0.15);

      positions.push(x, y, cornerZ);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < resZ; j++) {
    for (let i = 0; i < resX; i++) {
      const a = j * (resX + 1) + i;
      const b = j * (resX + 1) + (i + 1);
      const c = (j + 1) * (resX + 1) + i;
      const d = (j + 1) * (resX + 1) + (i + 1);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return finalizeGeometry(geo);
}
