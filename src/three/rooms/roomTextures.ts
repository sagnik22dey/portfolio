import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amt = 14) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function sketchBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lw: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  const j = () => (Math.random() - 0.5) * 5;
  ctx.beginPath();
  ctx.moveTo(x + j(), y + j());
  ctx.lineTo(x + w + j(), y + j());
  ctx.lineTo(x + w + j(), y + h + j());
  ctx.lineTo(x + j(), y + h + j());
  ctx.closePath();
  ctx.stroke();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, max = 99): number {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[i] + ' ';
      cy += lh;
      if (++count >= max - 1) {
        ctx.fillText(line.trim() + '…', x, cy);
        return cy;
      }
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
  return cy;
}

/** Paper base fill with fibrous grain, shared across room card textures. */
function paperBase(ctx: CanvasRenderingContext2D, w: number, h: number, tone = '#f3ecd9') {
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 18);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = '#2b2620';
    ctx.lineWidth = Math.random() * 1.1;
    const gx = Math.random() * w;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx + (Math.random() - 0.5) * 30, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function stonePlateBase(ctx: CanvasRenderingContext2D, w: number, h: number, tone = '#18191e') {
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 8);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.font = '24px monospace';
  ctx.fillText('+', 32, 48);
  ctx.fillText('+', w - 46, 48);
  ctx.fillText('+', 32, h - 34);
  ctx.fillText('+', w - 46, h - 34);
}

/** A hanging exhibition plate: title, tagline, category and period on dark basalt stone. */
export function makeGalleryCardFront(opts: {
  title: string;
  tagline: string;
  category: string;
  period: string;
  accent: string;
}): THREE.CanvasTexture {
  const key = `gcf:${opts.title}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 1024;
  const h = 1400;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  stonePlateBase(ctx, w, h, '#18191e');

  ctx.textAlign = 'left';
  ctx.fillStyle = opts.accent;
  ctx.font = '700 36px "Space Mono", monospace';
  ctx.fillText(opts.category.toUpperCase(), 72, 120);

  ctx.strokeStyle = 'rgba(217,119,6,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 144);
  ctx.lineTo(w - 72, 144);
  ctx.stroke();

  ctx.fillStyle = '#f3f4f6';
  ctx.font = '700 84px Georgia, serif';
  const afterTitle = wrap(ctx, opts.title, 72, 250, w - 144, 96, 3);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'italic 46px Georgia, serif';
  wrap(ctx, opts.tagline, 72, afterTitle + 80, w - 144, 58, 4);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 32px "Space Mono", monospace';
  ctx.fillText(opts.period, 72, h - 140);

  ctx.fillStyle = '#d97706';
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.fillText('CLICK TO INSPECT DETAILS →', 72, h - 80);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cache.set(key, tex);
  return tex;
}

/** The reverse of a gallery plate: description, tech chips and a link cue. */
export function makeGalleryCardBack(opts: {
  title: string;
  description: string;
  tech: string[];
  accent: string;
  hasLink: boolean;
}): THREE.CanvasTexture {
  const key = `gcb:${opts.title}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 1024;
  const h = 1400;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  stonePlateBase(ctx, w, h, '#141518');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f3f4f6';
  ctx.font = '700 64px Georgia, serif';
  ctx.fillText(opts.title, 72, 130);

  ctx.strokeStyle = opts.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, 156);
  ctx.lineTo(360, 156);
  ctx.stroke();

  ctx.fillStyle = '#d1d5db';
  ctx.font = '400 36px Georgia, serif';
  const afterDesc = wrap(ctx, opts.description, 72, 230, w - 144, 52, 10);

  let cx = 72;
  let cy = afterDesc + 80;
  ctx.font = '600 28px "Space Mono", monospace';
  for (const t of opts.tech.slice(0, 8)) {
    const tw = ctx.measureText(t).width + 36;
    if (cx + tw > w - 72) {
      cx = 72;
      cy += 64;
    }
    ctx.strokeStyle = 'rgba(217,119,6,0.45)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(cx, cy - 32, tw, 48);
    ctx.strokeRect(cx, cy - 32, tw, 48);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(t, cx + 18, cy + 3);
    cx += tw + 16;
  }

  if (opts.hasLink) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 32px "Space Mono", monospace';
    ctx.fillText('CLICK TO OPEN APPLICATION ↗', 72, h - 90);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cache.set(key, tex);
  return tex;
}

/** A glowing "monitor screen" plate for the Studio tower (skills or experience). */
export function makeStudioScreen(opts: {
  eyebrow: string;
  title: string;
  lines: string[];
  accent: string;
}): THREE.CanvasTexture {
  const key = `ss:${opts.title}:${opts.eyebrow}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 640;
  const h = 400;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#1a1712';
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
  glow.addColorStop(0, 'rgba(60,52,40,0.7)');
  glow.addColorStop(1, 'rgba(20,17,12,1)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = opts.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.textAlign = 'left';
  ctx.fillStyle = opts.accent;
  ctx.font = '700 20px "Courier New", monospace';
  ctx.fillText(opts.eyebrow.toUpperCase(), 44, 66);

  ctx.fillStyle = '#f6f0e0';
  ctx.font = '700 40px Georgia, serif';
  const afterTitle = wrap(ctx, opts.title, 44, 116, w - 88, 44, 2);

  ctx.fillStyle = '#d8cdb6';
  ctx.font = '400 22px "Courier New", monospace';
  let ly = afterTitle + 48;
  for (const line of opts.lines.slice(0, 6)) {
    ctx.fillStyle = opts.accent;
    ctx.fillText('›', 44, ly);
    ctx.fillStyle = '#d8cdb6';
    wrap(ctx, line, 68, ly, w - 112, 28, 2);
    ly += 34;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** A milestone note for the About sky flight — big number, title, body. */
export function makeSkyNote(opts: {
  tag: string;
  title: string;
  body: string;
  accent: string;
}): THREE.CanvasTexture {
  const key = `sky:${opts.title}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 720;
  const h = 460;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  paperBase(ctx, w, h, '#faf6ec');
  sketchBorder(ctx, 26, 26, w - 52, h - 52, 5, '#2b2620');
  sketchBorder(ctx, 44, 44, w - 88, h - 88, 1.4, '#2b2620');

  ctx.textAlign = 'left';
  ctx.fillStyle = opts.accent;
  ctx.font = '700 22px Georgia, serif';
  ctx.fillText(opts.tag.toUpperCase(), 68, 104);

  ctx.fillStyle = '#2b2620';
  ctx.font = '700 56px Georgia, serif';
  const afterTitle = wrap(ctx, opts.title, 68, 168, w - 136, 60, 2);

  ctx.fillStyle = '#4a4238';
  ctx.font = '400 24px Georgia, serif';
  wrap(ctx, opts.body, 68, afterTitle + 52, w - 136, 34, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** A torn-edge note label for the Contact room social barrels. */
export function makeBarrelLabel(label: string, accent: string): THREE.CanvasTexture {
  const key = `bl:${label}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 384;
  const h = 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  paperBase(ctx, w, h, '#f6f0e0');
  sketchBorder(ctx, 16, 16, w - 32, h - 32, 4, '#2b2620');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b2620';
  ctx.font = '700 46px Georgia, serif';
  ctx.fillText(label, w / 2, h / 2 + 4);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 60, h / 2 + 30);
  ctx.lineTo(w / 2 + 60, h / 2 + 34);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** A soft painted cloud sprite for sky rooms. */
export function makeCloudSprite(): THREE.CanvasTexture {
  const c0 = cache.get('cloud');
  if (c0) return c0;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  for (let i = 0; i < 9; i++) {
    const x = s / 2 + (Math.random() - 0.5) * s * 0.55;
    const y = s / 2 + (Math.random() - 0.5) * s * 0.3;
    const r = s * (0.12 + Math.random() * 0.16);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set('cloud', tex);
  return tex;
}

/** A landscape caption plate hung beneath a gallery sketch: category, title, tagline. */
export function makeGalleryCaption(opts: {
  title: string;
  tagline: string;
  category: string;
  period: string;
  accent: string;
}): THREE.CanvasTexture {
  const key = `gcap:${opts.title}`;
  const c0 = cache.get(key);
  if (c0) return c0;

  const w = 1024;
  const h = 600;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  stonePlateBase(ctx, w, h, '#141518');

  ctx.textAlign = 'left';
  ctx.fillStyle = opts.accent;
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.fillText(`${opts.category.toUpperCase()} · ${opts.period}`, 72, 90);

  ctx.fillStyle = '#f3f4f6';
  ctx.font = '700 64px Georgia, serif';
  const after = wrap(ctx, opts.title, 72, 180, w - 144, 72, 2);

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'italic 34px Georgia, serif';
  wrap(ctx, opts.tagline, 72, after + 60, w - 144, 46, 2);

  ctx.fillStyle = '#d97706';
  ctx.font = '700 26px "Space Mono", monospace';
  ctx.fillText('CLICK TO EXAMINE SPECIMEN →', 72, h - 60);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cache.set(key, tex);
  return tex;
}

