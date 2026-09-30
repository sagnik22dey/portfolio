import * as THREE from 'three';

let grain: THREE.CanvasTexture | null = null;
const materials = new Map<string, THREE.Material>();

/** Shared 128px paper-fibre grain texture, tinted by each material's colour. */
export function paperGrain(): THREE.CanvasTexture {
  if (grain) return grain;
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 232 + Math.random() * 23;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v - 4;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grain = new THREE.CanvasTexture(c);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.colorSpace = THREE.SRGBColorSpace;
  return grain;
}

/** Cached flat-shaded Lambert "paper" material for a colour. */
export function paperMat(color: string, side: THREE.Side = THREE.FrontSide): THREE.MeshLambertMaterial {
  const key = `${color}-${side}`;
  const hit = materials.get(key);
  if (hit) return hit as THREE.MeshLambertMaterial;
  const m = new THREE.MeshLambertMaterial({ color, flatShading: true, map: paperGrain(), side });
  materials.set(key, m);
  return m;
}

/** Cached unlit material used for glowing bits (lamps, windows). */
export function glowMat(color: string): THREE.MeshBasicMaterial {
  const key = `glow-${color}`;
  const hit = materials.get(key);
  if (hit) return hit as THREE.MeshBasicMaterial;
  const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  materials.set(key, m);
  return m;
}

/** Release every shared material and the grain texture (called when the experience unmounts). */
export function disposePaper(): void {
  materials.forEach((m) => m.dispose());
  materials.clear();
  grain?.dispose();
  grain = null;
}

/** Hash a vertex position to a stable offset so shared seam vertices move together (no cracks). */
function hashOffset(x: number, y: number, z: number, seed: number): number {
  const s = Math.sin(Math.round(x * 100) * 12.9898 + Math.round(y * 100) * 78.233 + Math.round(z * 100) * 37.719 + seed) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}

/** Crumple a geometry into faceted folded paper and return a non-indexed flat-shaded copy. */
export function foldGeometry(geo: THREE.BufferGeometry, amount: number, seed: number, keepTopFlat = false): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) maxY = Math.max(maxY, pos.getY(i));
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const onTop = keepTopFlat && Math.abs(y - maxY) < 1e-4;
    pos.setXYZ(
      i,
      x + hashOffset(x, y, z, seed) * amount,
      onTop ? y : y + hashOffset(z, x, y, seed + 1) * amount,
      z + hashOffset(y, z, x, seed + 2) * amount
    );
  }
  const out = geo.index ? geo.toNonIndexed() : geo;
  if (out !== geo) geo.dispose();
  out.computeVertexNormals();
  return out;
}

type LabelOpts = { width?: number; height?: number; font?: string; bg?: string; fg?: string; sub?: string };

/** Draw a small paper label (ink border + serif text) into a canvas texture. */
export function makeLabel(text: string, opts: LabelOpts = {}): THREE.CanvasTexture {
  const { width = 512, height = 160, bg = '#fdfcf8', fg = '#2b2620', sub } = opts;
  const font = opts.font ?? '600 76px "Cormorant Garamond", Georgia, serif';
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;
  ctx.fillText(text, width / 2, sub ? height * 0.42 : height / 2, width - 40);
  if (sub) {
    ctx.fillStyle = '#c2410c';
    ctx.font = '500 30px Inter, system-ui, sans-serif';
    ctx.fillText(sub, width / 2, height * 0.76, width - 40);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
