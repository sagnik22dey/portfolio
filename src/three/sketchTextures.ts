import * as THREE from 'three';

/** Generate a warm paper texture with subtle procedural grain. */
export function makePaperTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f3ecd9';
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = '#2b2620';
    ctx.lineWidth = Math.random() * 1.2;
    ctx.beginPath();
    const x = Math.random() * size;
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 40, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Generate an ink cross-hatch texture used to shade surfaces. */
export function makeHatchTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#efe7d2';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(43,38,32,0.14)';
  ctx.lineWidth = 1;
  for (let i = -size; i < size; i += 9) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type StoneBlock = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  g: number;
  b: number;
  heightVal: number;
  chiselMarks: { x1: number; y1: number; x2: number; y2: number }[];
};

let cachedStoneWallPair: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;

/** Generate paired color and height bump textures for realistic cavern stone masonry. */
export function makeStoneWallPair(size = 512): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  if (cachedStoneWallPair) {
    return cachedStoneWallPair;
  }

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  cCtx.fillStyle = '#1c1611';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#101010';
  bCtx.fillRect(0, 0, size, size);

  const numRows = 7;
  const rowHeight = size / numRows;
  const mortar = 6;
  const blocks: StoneBlock[] = [];

  const baseColors = [
    { r: 74, g: 61, b: 50 },
    { r: 84, g: 70, b: 58 },
    { r: 64, g: 54, b: 45 },
    { r: 92, g: 76, b: 62 },
    { r: 60, g: 50, b: 42 },
    { r: 78, g: 66, b: 54 },
    { r: 70, g: 58, b: 48 },
  ];

  for (let row = 0; row < numRows; row++) {
    const y = row * rowHeight + mortar / 2;
    const h = rowHeight - mortar;
    let x = (row % 2 === 0 ? 0 : -rowHeight * 0.8) - 30;

    while (x < size + 50) {
      const w = 70 + Math.random() * 80;
      const palette = baseColors[Math.floor(Math.random() * baseColors.length)];
      const variation = (Math.random() - 0.5) * 16;
      const r = Math.max(30, Math.min(180, palette.r + variation));
      const g = Math.max(25, Math.min(160, palette.g + variation * 0.9));
      const b = Math.max(20, Math.min(140, palette.b + variation * 0.8));
      const heightVal = 175 + Math.random() * 60;

      const marks: { x1: number; y1: number; x2: number; y2: number }[] = [];
      const numMarks = 2 + Math.floor(Math.random() * 3);
      for (let m = 0; m < numMarks; m++) {
        const mx = x + 8 + Math.random() * (w - 16);
        const my = y + 6 + Math.random() * (h - 12);
        marks.push({
          x1: mx,
          y1: my,
          x2: mx + (Math.random() - 0.5) * 24,
          y2: my + (Math.random() - 0.5) * 12,
        });
      }

      blocks.push({ x, y, w, h, r, g, b, heightVal, chiselMarks: marks });
      x += w + mortar;
    }
  }

  for (const block of blocks) {
    const radius = 5;
    const { x, y, w, h } = block;

    cCtx.save();
    cCtx.beginPath();
    cCtx.roundRect(x, y, w, h, radius);
    cCtx.fillStyle = `rgb(${Math.round(block.r)}, ${Math.round(block.g)}, ${Math.round(block.b)})`;
    cCtx.fill();

    const colorGrad = cCtx.createLinearGradient(x, y, x + w, y + h);
    colorGrad.addColorStop(0, 'rgba(255, 235, 205, 0.18)');
    colorGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.04)');
    colorGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    colorGrad.addColorStop(1, 'rgba(12, 9, 6, 0.42)');
    cCtx.fillStyle = colorGrad;
    cCtx.fill();

    cCtx.strokeStyle = 'rgba(15, 11, 7, 0.5)';
    cCtx.lineWidth = 1.2;
    for (const mark of block.chiselMarks) {
      cCtx.beginPath();
      cCtx.moveTo(mark.x1, mark.y1);
      cCtx.lineTo(mark.x2, mark.y2);
      cCtx.stroke();
    }
    cCtx.restore();

    bCtx.save();
    bCtx.beginPath();
    bCtx.roundRect(x, y, w, h, radius);
    const bumpGrad = bCtx.createRadialGradient(
      x + w * 0.45,
      y + h * 0.45,
      Math.min(w, h) * 0.1,
      x + w * 0.5,
      y + h * 0.5,
      Math.max(w, h) * 0.65
    );
    const hv = Math.round(block.heightVal);
    bumpGrad.addColorStop(0, `rgb(${hv}, ${hv}, ${hv})`);
    bumpGrad.addColorStop(0.7, `rgb(${Math.round(hv * 0.85)}, ${Math.round(hv * 0.85)}, ${Math.round(hv * 0.85)})`);
    bumpGrad.addColorStop(1, 'rgb(35, 35, 35)');
    bCtx.fillStyle = bumpGrad;
    bCtx.fill();

    bCtx.strokeStyle = 'rgb(18, 18, 18)';
    bCtx.lineWidth = 1.5;
    for (const mark of block.chiselMarks) {
      bCtx.beginPath();
      bCtx.moveTo(mark.x1, mark.y1);
      bCtx.lineTo(mark.x2, mark.y2);
      bCtx.stroke();
    }
    bCtx.restore();
  }

  const cImg = cCtx.getImageData(0, 0, size, size);
  const cd = cImg.data;
  const bImg = bCtx.getImageData(0, 0, size, size);
  const bd = bImg.data;
  for (let i = 0; i < cd.length; i += 4) {
    const noise = (Math.random() - 0.5) * 24;
    cd[i] = Math.max(0, Math.min(255, cd[i] + noise));
    cd[i + 1] = Math.max(0, Math.min(255, cd[i + 1] + noise * 0.9));
    cd[i + 2] = Math.max(0, Math.min(255, cd[i + 2] + noise * 0.8));

    const bNoise = (Math.random() - 0.5) * 16;
    bd[i] = Math.max(0, Math.min(255, bd[i] + bNoise));
    bd[i + 1] = bd[i];
    bd[i + 2] = bd[i];
  }
  cCtx.putImageData(cImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = 4;

  cachedStoneWallPair = { map, bumpMap };
  return cachedStoneWallPair;
}

/** Generate a realistic stone wall color texture. */
export function makeRealisticStoneWallTexture(size = 512): THREE.CanvasTexture {
  return makeStoneWallPair(size).map;
}

/** Generate a matching height bump texture for stone walls. */
export function makeStoneBumpTexture(size = 512): THREE.CanvasTexture {
  return makeStoneWallPair(size).bumpMap;
}

/** Generate rough bedrock cave rock texture for backward compatibility. */
export function makeCaveRockTexture(size = 512): THREE.CanvasTexture {
  return makeRealisticStoneWallTexture(size);
}

let cachedCavernCeilingPair: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;

/** Generate paired color and bump textures for natural cavern ceilings. */
export function makeCavernCeilingPair(size = 512): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  if (cachedCavernCeilingPair) {
    return cachedCavernCeilingPair;
  }

  const cCanvas = document.createElement('canvas');
  cCanvas.width = cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  cCtx.fillStyle = '#2c221a';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#303030';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 40; i++) {
    const y = Math.random() * size;
    const thickness = 4 + Math.random() * 14;
    const darkness = 0.15 + Math.random() * 0.25;

    cCtx.fillStyle = `rgba(18, 14, 10, ${darkness})`;
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.bezierCurveTo(
      size * 0.3,
      y + (Math.random() - 0.5) * 50,
      size * 0.7,
      y + (Math.random() - 0.5) * 50,
      size,
      y + (Math.random() - 0.5) * 16
    );
    cCtx.lineTo(size, y + thickness);
    cCtx.lineTo(0, y + thickness);
    cCtx.closePath();
    cCtx.fill();

    bCtx.fillStyle = `rgba(${Math.round(darkness * 220)}, ${Math.round(darkness * 220)}, ${Math.round(darkness * 220)}, 0.4)`;
    bCtx.fillRect(0, y, size, thickness);
  }

  const cImg = cCtx.getImageData(0, 0, size, size);
  const cd = cImg.data;
  const bImg = bCtx.getImageData(0, 0, size, size);
  const bd = bImg.data;
  for (let i = 0; i < cd.length; i += 4) {
    const n = (Math.random() - 0.5) * 28;
    cd[i] = Math.max(0, Math.min(255, cd[i] + n));
    cd[i + 1] = Math.max(0, Math.min(255, cd[i + 1] + n * 0.9));
    cd[i + 2] = Math.max(0, Math.min(255, cd[i + 2] + n * 0.8));

    const bn = (Math.random() - 0.5) * 24;
    bd[i] = Math.max(0, Math.min(255, bd[i] + bn));
    bd[i + 1] = bd[i];
    bd[i + 2] = bd[i];
  }
  cCtx.putImageData(cImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const map = new THREE.CanvasTexture(cCanvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = 4;

  cachedCavernCeilingPair = { map, bumpMap };
  return cachedCavernCeilingPair;
}

let cachedCaveFloorPair: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;

/** Generate paired color and bump textures for packed earthen stone cavern floors. */
export function makeCaveFloorPair(size = 512): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  if (cachedCaveFloorPair) {
    return cachedCaveFloorPair;
  }

  const cCanvas = document.createElement('canvas');
  cCanvas.width = cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  cCtx.fillStyle = '#261e16';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#252525';
  bCtx.fillRect(0, 0, size, size);

  const step = size / 10;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const pad = 3;
      const w = step - pad * 2;
      const h = step - pad * 2;
      const stoneTone = 38 + Math.random() * 20;

      cCtx.fillStyle = `rgb(${Math.round(stoneTone * 1.1)}, ${Math.round(stoneTone)}, ${Math.round(stoneTone * 0.85)})`;
      cCtx.beginPath();
      cCtx.roundRect(x + pad, y + pad, w, h, 3);
      cCtx.fill();

      const bVal = 130 + Math.random() * 50;
      bCtx.fillStyle = `rgb(${Math.round(bVal)}, ${Math.round(bVal)}, ${Math.round(bVal)})`;
      bCtx.beginPath();
      bCtx.roundRect(x + pad, y + pad, w, h, 3);
      bCtx.fill();
    }
  }

  const cImg = cCtx.getImageData(0, 0, size, size);
  const cd = cImg.data;
  const bImg = bCtx.getImageData(0, 0, size, size);
  const bd = bImg.data;
  for (let i = 0; i < cd.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    cd[i] = Math.max(0, Math.min(255, cd[i] + n));
    cd[i + 1] = Math.max(0, Math.min(255, cd[i + 1] + n * 0.9));
    cd[i + 2] = Math.max(0, Math.min(255, cd[i + 2] + n * 0.8));

    const bn = (Math.random() - 0.5) * 18;
    bd[i] = Math.max(0, Math.min(255, bd[i] + bn));
    bd[i + 1] = bd[i];
    bd[i + 2] = bd[i];
  }
  cCtx.putImageData(cImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const map = new THREE.CanvasTexture(cCanvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = 4;

  cachedCaveFloorPair = { map, bumpMap };
  return cachedCaveFloorPair;
}

/** Generate a packed earthen stone and mine floor texture for backward compatibility. */
export function makeCaveFloorTexture(size = 512): THREE.CanvasTexture {
  return makeCaveFloorPair(size).map;
}

/** Draw a hand-drawn-style framed panel to a texture. */
export function makePanelTexture(opts: {
  title: string;
  subtitle: string;
  accent: string;
  door?: boolean;
}): THREE.CanvasTexture {
  const w = 512;
  const h = 720;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#faf6ec';
  ctx.fillRect(0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const sketchRect = (x: number, y: number, ww: number, hh: number, lw: number) => {
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const j = () => (Math.random() - 0.5) * 5;
    ctx.moveTo(x + j(), y + j());
    ctx.lineTo(x + ww + j(), y + j());
    ctx.lineTo(x + ww + j(), y + hh + j());
    ctx.lineTo(x + j(), y + hh + j());
    ctx.closePath();
    ctx.stroke();
  };

  ctx.strokeStyle = '#2b2620';
  sketchRect(26, 26, w - 52, h - 52, 5);
  sketchRect(40, 40, w - 80, h - 80, 1.5);

  ctx.lineWidth = 2;
  const corner = (cx: number, cy: number, sx: number, sy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * 34);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * 34, cy);
    ctx.stroke();
  };
  corner(58, 58, 1, 1);
  corner(w - 58, 58, -1, 1);
  corner(58, h - 58, 1, -1);
  corner(w - 58, h - 58, -1, -1);

  if (opts.door) {
    ctx.strokeStyle = opts.accent;
    sketchRect(150, 120, w - 300, h - 260, 4);
    ctx.fillStyle = opts.accent;
    ctx.beginPath();
    ctx.arc(w - 190, h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(43,38,32,0.06)';
    ctx.lineWidth = 1;
    for (let yy = 130; yy < h - 140; yy += 10) {
      ctx.beginPath();
      ctx.moveTo(160, yy);
      ctx.lineTo(w - 160, yy + 20);
      ctx.stroke();
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b2620';
  ctx.font = '600 46px Georgia, serif';
  wrapText(ctx, opts.title, w / 2, opts.door ? h / 2 - 10 : 120, w - 120, 50);

  ctx.fillStyle = opts.accent;
  ctx.font = 'italic 26px Georgia, serif';
  wrapText(ctx, opts.subtitle, w / 2, opts.door ? h / 2 + 60 : 200, w - 140, 34);

  if (opts.door) {
    ctx.fillStyle = '#7a6f62';
    ctx.font = '500 20px Georgia, serif';
    ctx.fillText('— enter —', w / 2, h - 90);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Draw a small hanging sign with a section name for a doorway. */
export function makeSignTexture(title: string, accent: string): THREE.CanvasTexture {
  const w = 384;
  const h = 160;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#faf6ec';
  ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  const j = () => (Math.random() - 0.5) * 4;
  ctx.beginPath();
  ctx.moveTo(16 + j(), 16 + j());
  ctx.lineTo(w - 16 + j(), 16 + j());
  ctx.lineTo(w - 16 + j(), h - 16 + j());
  ctx.lineTo(16 + j(), h - 16 + j());
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#2b2620';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 62px Georgia, serif';
  ctx.fillText(title, w / 2, h / 2 + 4);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Draw the door-slab face with panelled sub-frames, subtitle plate, and keyhole. */
export function makeDoorTexture(opts: {
  subtitle: string;
  accent: string;
}): THREE.CanvasTexture {
  const w = 512;
  const h = 900;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#d9cba6';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(43,38,32,0.10)';
  ctx.lineWidth = 1;
  for (let x = 8; x < w; x += 7) {
    ctx.beginPath();
    ctx.moveTo(x + (Math.random() - 0.5) * 3, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, h);
    ctx.stroke();
  }

  const panel = (x: number, y: number, pw: number, ph: number) => {
    ctx.strokeStyle = 'rgba(43,38,32,0.55)';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, pw, ph);
    ctx.strokeStyle = 'rgba(43,38,32,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 14, y + 14, pw - 28, ph - 28);
  };
  panel(60, 60, w - 120, 300);
  panel(60, 400, w - 120, 300);

  ctx.fillStyle = opts.accent;
  ctx.fillRect(90, 735, w - 180, 70);
  ctx.fillStyle = '#faf6ec';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText(opts.subtitle.slice(0, 26), w / 2, 771);

  ctx.fillStyle = '#2b2620';
  ctx.beginPath();
  ctx.arc(w - 120, h / 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w - 128, h / 2, 16, 40);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, yy);
      line = word + ' ';
      yy += lh;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}
