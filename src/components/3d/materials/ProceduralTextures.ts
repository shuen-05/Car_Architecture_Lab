import * as THREE from 'three';

/**
 * Creates an authentic Lexus F-Sport Spindle Grille procedural mesh texture.
 * Features interlocking 3D diamond/L-mesh pattern with high-gloss highlights.
 */
export function createSpindleGrindleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark rich graphite backdrop
  ctx.fillStyle = '#0e1117';
  ctx.fillRect(0, 0, 512, 512);

  // Draw intricate F-Sport interlocking diamond L-mesh
  const stepX = 24;
  const stepY = 18;

  for (let y = 0; y <= 512 + stepY; y += stepY) {
    const rowOffset = (Math.floor(y / stepY) % 2) * (stepX / 2);
    for (let x = -stepX; x <= 512 + stepX; x += stepX) {
      const cx = x + rowOffset;
      const cy = y;

      // Dark shadow recess cell core
      ctx.fillStyle = '#06070a';
      ctx.beginPath();
      ctx.moveTo(cx, cy - stepY * 0.40);
      ctx.lineTo(cx + stepX * 0.40, cy);
      ctx.lineTo(cx, cy + stepY * 0.40);
      ctx.lineTo(cx - stepX * 0.40, cy);
      ctx.closePath();
      ctx.fill();

      // Sharp metallic graphite mesh rib
      ctx.strokeStyle = '#5a6578';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Bright specular glint on upper mesh ribs
      ctx.strokeStyle = '#a4b3c8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - stepX * 0.38, cy - stepY * 0.05);
      ctx.lineTo(cx, cy - stepY * 0.40);
      ctx.lineTo(cx + stepX * 0.38, cy - stepY * 0.05);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 16);
  return texture;
}

export const createSpindleGrilleTexture = createSpindleGrindleTexture;



/**
 * Creates authentic BMW Roundel emblem (Bavarian blue & white quarters, black outer ring, chrome BMW lettering)
 */
export function createBMWRoundelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;

  // Outer glossy black bezel ring
  ctx.fillStyle = '#0a0a0c';
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // Silver/chrome outer rim
  ctx.strokeStyle = '#c8d2dc';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Silver/chrome inner separating ring
  ctx.strokeStyle = '#c8d2dc';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 170, 0, Math.PI * 2);
  ctx.stroke();

  // Blue and white alternating quadrants
  const rInner = 166;
  // Top-Right: Bavarian Light Blue (#0066b1)
  ctx.fillStyle = '#0066b1';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rInner, -Math.PI / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Bottom-Right: Pure White
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rInner, 0, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Bottom-Left: Bavarian Light Blue
  ctx.fillStyle = '#0066b1';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rInner, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Top-Left: Pure White
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, rInner, Math.PI, (3 * Math.PI) / 2);
  ctx.closePath();
  ctx.fill();

  // Fine chrome dividing cross
  ctx.strokeStyle = '#b0bcc8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - rInner, cy);
  ctx.lineTo(cx + rInner, cy);
  ctx.moveTo(cx, cy - rInner);
  ctx.lineTo(cx, cy + rInner);
  ctx.stroke();

  // "B M W" Lettering in top arc
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 54px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Letter B
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.50);
  ctx.fillText('B', 0, -208);
  ctx.restore();

  // Letter M
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.0);
  ctx.fillText('M', 0, -208);
  ctx.restore();

  // Letter W
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.50);
  ctx.fillText('W', 0, -208);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const createLexusCenterCapTexture = createBMWRoundelTexture; // Alias for compatibility

/**
 * Creates authentic BMW ///M3 Competition badge texture
 */
export function createBMWM3BadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // High gloss piano black badge backing
  ctx.fillStyle = '#08090a';
  ctx.fillRect(0, 0, 512, 160);

  // Chrome border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 156);

  // Three slanted iconic M stripes: Light Blue (#008fd5), Dark Blue/Violet (#242d72), Red (#e4002b)
  const slant = 32;
  const stripeWidth = 28;
  const startX = 40;
  const startY = 130;
  const endY = 30;

  const colors = ['#008fd5', '#242d72', '#e4002b'];
  for (let i = 0; i < 3; i++) {
    const x = startX + i * (stripeWidth + 4);
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(x + slant, endY);
    ctx.lineTo(x + slant + stripeWidth, endY);
    ctx.lineTo(x + stripeWidth, startY);
    ctx.lineTo(x, startY);
    ctx.closePath();
    ctx.fill();
  }

  // Chrome "M3"
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic bold 96px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('M3', 180, 80);

  // Small "COMPETITION" subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 22px "Arial", sans-serif';
  ctx.fillText('COMPETITION', 185, 132);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const createFSportBadgeTexture = createBMWM3BadgeTexture; // Alias

/**
 * Creates authentic German Euro license plate "M · CS 3004" (Munich BMW plate)
 */
export function createEuroMunichPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Pure reflective white plate background
  ctx.fillStyle = '#fdfdfd';
  ctx.fillRect(0, 0, 512, 128);

  // Thin black perimeter border
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 122);

  // Left EU Blue Band (Width 64px)
  ctx.fillStyle = '#003399';
  ctx.fillRect(4, 4, 60, 120);

  // European Stars Circle (12 gold dots)
  ctx.fillStyle = '#ffcc00';
  for (let s = 0; s < 12; s++) {
    const angle = (s / 12) * Math.PI * 2;
    const sx = 34 + Math.cos(angle) * 16;
    const sy = 40 + Math.sin(angle) * 16;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Country Code "D" (Deutschland)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', 34, 92);

  // Munich District "M"
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 72px "DIN 1451", "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('M', 80, 64);

  // Official Bavarian Seal and Emissions Badges
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(162, 50, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(162, 80, 12, 0, Math.PI * 2);
  ctx.fill();

  // Registration "CS 3004"
  ctx.fillStyle = '#111827';
  ctx.fillText('CS 3004', 190, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const createOntarioLicensePlateTexture = createEuroMunichPlateTexture; // Alias

/**
 * Creates photorealistic asphalt parking lot ground texture with painted white parking lines
 * matching the authentic Ontario parking lot in the reference hero photograph.
 */
export function createAsphaltParkingGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark weathered asphalt base
  ctx.fillStyle = '#22262c';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Realistic fine aggregate and bitumen gravel noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Subtle tarmac tar patches and slight color variations
  ctx.fillStyle = 'rgba(18, 20, 24, 0.25)';
  for (let p = 0; p < 30; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const pr = 40 + Math.random() * 80;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Authentic white painted parking stall lines angled across lot (matching photo)
  ctx.save();
  ctx.translate(512, 512);
  ctx.rotate(-28 * (Math.PI / 180)); // 28-degree diagonal parking angle

  ctx.strokeStyle = '#d6dde4';
  ctx.lineWidth = 18;
  ctx.lineCap = 'butt';

  // Draw multiple parallel parking stall boundary lines
  for (let x = -1000; x <= 1000; x += 380) {
    ctx.beginPath();
    ctx.moveTo(x, -1200);
    ctx.lineTo(x, 1200);
    ctx.stroke();

    // Subtle weathered paint edge noise
    ctx.strokeStyle = 'rgba(214, 221, 228, 0.4)';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x, -1200);
    ctx.lineTo(x, 1200);
    ctx.stroke();
    ctx.strokeStyle = '#d6dde4';
    ctx.lineWidth = 18;
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates authentic BMW M Power Engine Vanity Cover texture:
 * Features 2x2 twill carbon fiber weave backdrop, signature BMW M tri-color diagonal stripes,
 * embossed silver "///M Power TwinPower Turbo" typography, and oil filler cap marking.
 */
export function createMPowerEngineCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark carbon composite background
  ctx.fillStyle = '#16181d';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. High-fidelity 2x2 Twill Carbon Fiber Weave
  const cellSize = 16;
  for (let y = 0; y < 1024; y += cellSize) {
    for (let x = 0; x < 1024; x += cellSize) {
      const block = (Math.floor(x / (cellSize * 2)) + Math.floor(y / (cellSize * 2))) % 2 === 0;
      ctx.fillStyle = block ? '#1f232b' : '#111317';
      ctx.fillRect(x, y, cellSize, cellSize);

      // Fine fiber strand lines
      ctx.strokeStyle = block ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (block) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y + cellSize);
      } else {
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x, y + cellSize);
      }
      ctx.stroke();
    }
  }

  // 3. Central recessed brushed aluminum accent insert
  ctx.fillStyle = '#121418';
  ctx.fillRect(180, 200, 664, 624);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 4;
  ctx.strokeRect(180, 200, 664, 624);

  // 4. Iconic BMW M Tri-Color Diagonal Stripes
  const stripeWidth = 32;
  const slant = 140;
  const startX = 240;
  const startY = 320;
  const endY = 700;

  const mColors = [
    '#0066b1', // BMW Light Blue (Bavarian)
    '#00205b', // BMW Navy Blue (Dark Violet/Blue)
    '#e00000', // Motorsport Red
  ];

  mColors.forEach((col, idx) => {
    const x = startX + idx * (stripeWidth + 4);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + slant, startY);
    ctx.lineTo(x + slant + stripeWidth, startY);
    ctx.lineTo(x + stripeWidth, endY);
    ctx.lineTo(x, endY);
    ctx.closePath();
    ctx.fill();

    // Specular highlight on top edge
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 5. Silver "///M Power" embossed branding
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic bold 82px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('M Power', 420, 430);

  // Subtitle "TwinPower Turbo"
  ctx.font = 'bold 36px "Arial", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('TwinPower Turbo', 424, 510);

  // S58 designation badge
  ctx.font = '600 24px "Arial", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('3.0L INLINE 6-CYLINDER · 350 BAR HPI', 424, 570);
  ctx.restore();

  // 6. Oil filler cap graphic (top right)
  const capX = 860;
  const capY = 160;
  ctx.fillStyle = '#0a0b0d';
  ctx.beginPath();
  ctx.arc(capX, capY, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Oil can symbol inside cap
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OIL 0W-30', capX, capY);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

