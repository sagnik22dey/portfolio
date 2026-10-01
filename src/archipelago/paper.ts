import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let grain: THREE.CanvasTexture | null = null;
const materials = new Map<string, THREE.Material>();
export const modelMaterials = new Map<string, THREE.Material>();

/** Shared 128px paper-fibre grain texture, tinted by each material's colour. */
export function paperGrain(): THREE.CanvasTexture {
  if (grain) return grain;
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 240 + Math.random() * 15;
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

/** Cached back-face ink material used for the inverted-hull outlines. */
export function inkMat(): THREE.MeshBasicMaterial {
  const hit = materials.get('ink');
  if (hit) return hit as THREE.MeshBasicMaterial;
  const m = new THREE.MeshBasicMaterial({ color: '#2b2620', side: THREE.BackSide });
  materials.set('ink', m);
  return m;
}

type GeoKind = 'box' | 'cyl' | 'cone' | 'ico' | 'oct' | 'torus' | 'sphere';
const geos = new Map<string, THREE.BufferGeometry>();

/** Cached primitive geometry keyed by kind + args, shared across every landmark. */
export function geom(kind: GeoKind, ...args: number[]): THREE.BufferGeometry {
  const key = `${kind}:${args.join(',')}`;
  const hit = geos.get(key);
  if (hit) return hit;
  let g: THREE.BufferGeometry;
  const a = args;
  switch (kind) {
    case 'box': g = new THREE.BoxGeometry(a[0], a[1], a[2]); break;
    case 'cyl': g = new THREE.CylinderGeometry(a[0], a[1], a[2], a[3] ?? 8, 1, false, a[4] ?? 0, a[5] ?? Math.PI * 2); break;
    case 'cone': g = new THREE.ConeGeometry(a[0], a[1], a[2] ?? 8); break;
    case 'ico': g = new THREE.IcosahedronGeometry(a[0], a[1] ?? 0); break;
    case 'oct': g = new THREE.OctahedronGeometry(a[0], 0); break;
    case 'torus': g = new THREE.TorusGeometry(a[0], a[1], a[2] ?? 6, a[3] ?? 16); break;
    case 'sphere': g = new THREE.SphereGeometry(a[0], a[1] ?? 10, a[2] ?? 8, 0, Math.PI * 2, 0, a[3] ?? Math.PI); break;
  }
  geos.set(key, g);
  return g;
}

const hulls = new Map<string, THREE.BufferGeometry>();

/** Inflated copy of a geometry along smoothed normals, rendered back-face in ink for a paper-cutout outline. */
export function inkHull(geo: THREE.BufferGeometry, thickness: number): THREE.BufferGeometry {
  const key = `${geo.uuid}:${thickness}`;
  const hit = hulls.get(key);
  if (hit) return hit;
  const src = new THREE.BufferGeometry();
  src.setAttribute('position', geo.attributes.position.clone());
  if (geo.index) src.setIndex(geo.index.clone());
  const merged = mergeVertices(src, 1e-3);
  src.dispose();
  merged.computeVertexNormals();
  const pos = merged.attributes.position as THREE.BufferAttribute;
  const nor = merged.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * thickness, pos.getY(i) + nor.getY(i) * thickness, pos.getZ(i) + nor.getZ(i) * thickness);
  }
  merged.deleteAttribute('normal');
  hulls.set(key, merged);
  return merged;
}

/** Release every shared material, geometry and the grain texture (called when the experience unmounts). */
export function disposePaper(): void {
  materials.forEach((m) => m.dispose());
  materials.clear();
  modelMaterials.forEach((m) => m.dispose());
  modelMaterials.clear();
  geos.forEach((g) => g.dispose());
  geos.clear();
  hulls.forEach((g) => g.dispose());
  hulls.clear();
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

let maxAniso = 4;

/** Record the renderer's max anisotropy so canvas/image textures stay crisp at grazing angles. */
export function setMaxAnisotropy(n: number): void {
  maxAniso = Math.max(1, Math.min(8, n));
}

/** Anisotropy level to use for crisp text and image textures. */
export function anisotropy(): number {
  return maxAniso;
}

const SCALE = 2;

function drawLabel(c: HTMLCanvasElement, text: string, opts: LabelOpts) {
  const { width = 512, height = 160, bg = '#fdfcf8', fg = '#2b2620', sub } = opts;
  const font = opts.font ?? '600 76px "Cormorant Garamond", Georgia, serif';
  const ctx = c.getContext('2d')!;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, width - 36, height - 36);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;
  ctx.fillText(text, width / 2, sub ? height * 0.42 : height / 2, width - 48);
  if (sub) {
    ctx.fillStyle = '#b8380a';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.fillText(sub.toUpperCase(), width / 2, height * 0.76, width - 60);
  }
}

/** Draw a paper label (ink border + serif text) into a 2x canvas texture, redrawn once web fonts finish loading. */
export function makeLabel(text: string, opts: LabelOpts = {}): THREE.CanvasTexture {
  const { width = 512, height = 160 } = opts;
  const c = document.createElement('canvas');
  c.width = width * SCALE;
  c.height = height * SCALE;
  drawLabel(c, text, opts);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) {
    Promise.all([fonts.load('600 76px "Cormorant Garamond"'), fonts.load('600 28px Inter')])
      .then(() => {
        drawLabel(c, text, opts);
        tex.needsUpdate = true;
      })
      .catch(() => undefined);
  }
  return tex;
}
