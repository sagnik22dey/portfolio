import * as THREE from 'three';
import type { GalleryItem } from './roomData';

export const CARD_W = 900;
export const CARD_H = 1200;
const TEX_SCALE = 0.85;

const INK = '#2b2620';
const SOFT = '#4a423a';
const FAINT = '#7a6f62';
const PAPER = '#fbf7ee';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';
const HAND = 'Caveat, cursive';

type Ctx = CanvasRenderingContext2D;
type Img = CanvasImageSource & { width: number; height: number };

/** Deterministic PRNG so every card keeps the same paper grain between redraws. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Wraps text into at most maxLines lines, ending with an ellipsis when truncated. */
function wrap(ctx: Ctx, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  let i = 0;
  for (; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) {
    lines.push(line);
    i = words.length;
  }
  if (i < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last.length && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last.replace(/[\s,.;:—-]+$/, '')}…`;
  }
  return lines;
}

function spacing(ctx: Ctx, px: number) {
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Warm paper sheet with fibre grain, foxing spots and a burnt edge vignette. */
function paperBase(ctx: Ctx, seed: number, tint: string) {
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  const r = rng(seed);
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = `rgba(90,70,40,${r() * 0.07})`;
    ctx.fillRect(r() * CARD_W, r() * CARD_H, 1 + r() * 2.2, 1 + r() * 2.2);
  }
  for (let i = 0; i < 7; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 + r() * 60);
    g.addColorStop(0, 'rgba(160,120,60,0.08)');
    g.addColorStop(1, 'rgba(160,120,60,0)');
    ctx.save();
    ctx.translate(r() * CARD_W, r() * CARD_H);
    ctx.fillStyle = g;
    ctx.fillRect(-100, -100, 200, 200);
    ctx.restore();
  }
  const v = ctx.createRadialGradient(CARD_W / 2, CARD_H / 2, CARD_H * 0.3, CARD_W / 2, CARD_H / 2, CARD_H * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(110,75,35,0.22)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, CARD_W - 44, CARD_H - 44);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(43,38,32,0.4)';
  ctx.strokeRect(34, 34, CARD_W - 68, CARD_H - 68);
}

function drawCover(ctx: Ctx, img: Img, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

/** Translucent masking-tape strip, as if the sketch was taped onto the sheet. */
function tape(ctx: Ctx, cx: number, cy: number, angle: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = hexA(color, 0.55);
  ctx.beginPath();
  ctx.moveTo(-80, -22);
  for (let x = -80; x <= 80; x += 10) ctx.lineTo(x, -22 + (x % 20 === 0 ? 2 : -2));
  ctx.lineTo(80, 22);
  for (let x = 80; x >= -80; x -= 10) ctx.lineTo(x, 22 + (x % 20 === 0 ? -2 : 2));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(-80, -22, 160, 10);
  ctx.restore();
}

/** Circular rubber stamp with the exhibit number. */
function stamp(ctx: Ctx, cx: number, cy: number, index: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.font = `700 18px ${SANS}`;
  spacing(ctx, 4);
  ctx.fillText('EXHIBIT', 2, -18);
  spacing(ctx, 0);
  ctx.font = `700 58px ${SERIF}`;
  ctx.fillText(String(index + 1).padStart(2, '0'), 0, 34);
  ctx.textAlign = 'left';
  ctx.restore();
}

function squiggle(ctx: Ctx, x: number, y: number, w: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= w; i += 10) ctx.lineTo(x + i, y + Math.sin(i / 13) * 3.5);
  ctx.stroke();
}

function label(ctx: Ctx, text: string, x: number, y: number, color = FAINT) {
  ctx.fillStyle = color;
  ctx.font = `700 21px ${SANS}`;
  spacing(ctx, 5);
  ctx.fillText(text.toUpperCase(), x, y);
  spacing(ctx, 0);
}

/** Draws a row of pill chips and returns the y below the last row. */
function chips(ctx: Ctx, items: string[], x: number, y: number, maxX: number, maxRows: number, fill: string, stroke: string, text: string) {
  ctx.font = `600 25px ${SANS}`;
  let cx = x;
  let cy = y;
  let rows = 1;
  for (const t of items) {
    const w = ctx.measureText(t).width + 38;
    if (cx + w > maxX) {
      if (rows === maxRows) break;
      rows++;
      cx = x;
      cy += 62;
    }
    roundRect(ctx, cx, cy, w, 48, 24);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = text;
    ctx.fillText(t, cx + 19, cy + 33);
    cx += w + 12;
  }
  return cy + 48;
}

function begin(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(canvas.width / CARD_W, 0, 0, canvas.height / CARD_H, 0, 0);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  spacing(ctx, 0);
  return ctx;
}

/** Draws the display face: taped sketch, exhibit stamp, title, tagline and tech chips. */
export function drawFront(canvas: HTMLCanvasElement, item: GalleryItem, index: number, total: number, img?: Img) {
  const ctx = begin(canvas);
  paperBase(ctx, index * 97 + 11, PAPER);

  const ix = 62;
  const iy = 70;
  const iw = CARD_W - 124;
  const ih = 560;
  ctx.fillStyle = 'rgba(43,38,32,0.18)';
  ctx.fillRect(ix + 10, iy + 12, iw, ih);
  ctx.fillStyle = '#efe6cf';
  ctx.fillRect(ix, iy, iw, ih);
  if (img && img.width) drawCover(ctx, img, ix, iy, iw, ih);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(ix, iy, iw, ih);
  tape(ctx, ix + 70, iy + 4, -0.32, item.accent);
  tape(ctx, ix + iw - 70, iy + 4, 0.3, item.accent);
  stamp(ctx, CARD_W - 130, iy + ih - 6, index, item.accent);

  let y = iy + ih + 78;
  label(ctx, `${item.category}  ·  ${item.period}`, 66, y, item.accent);
  if (item.featured) {
    ctx.fillStyle = item.accent;
    ctx.font = `700 46px ${HAND}`;
    ctx.fillText('★ flagship', 66, y + 58);
    y += 50;
  }

  y += 104;
  ctx.fillStyle = INK;
  let size = 104;
  ctx.font = `700 ${size}px ${SERIF}`;
  while (size > 72 && ctx.measureText(item.title).width > CARD_W - 132 && !item.title.includes(' ')) {
    size -= 4;
    ctx.font = `700 ${size}px ${SERIF}`;
  }
  const title = wrap(ctx, item.title, CARD_W - 132, 2);
  title.forEach((l, i) => ctx.fillText(l, 62, y + i * size * 0.94));
  y += (title.length - 1) * size * 0.94;
  squiggle(ctx, 66, y + 30, Math.min(ctx.measureText(title[title.length - 1] ?? '').width, 460), item.accent);

  y += 92;
  ctx.fillStyle = SOFT;
  ctx.font = `italic 500 42px ${SERIF}`;
  const tag = wrap(ctx, item.tagline, CARD_W - 132, item.featured ? 1 : 2);
  tag.forEach((l, i) => ctx.fillText(l, 66, y + i * 50));

  ctx.fillStyle = hexA(item.accent, 0.12);
  ctx.fillRect(38, 1070, CARD_W - 76, 92);
  ctx.fillStyle = item.accent;
  ctx.font = `700 50px ${HAND}`;
  ctx.fillText('read the brief →', 66, 1130);
  ctx.textAlign = 'right';
  ctx.fillStyle = INK;
  ctx.font = `italic 700 58px ${SERIF}`;
  ctx.fillText(String(index + 1).padStart(2, '0'), CARD_W - 120, 1134);
  ctx.font = `600 26px ${SANS}`;
  ctx.fillStyle = FAINT;
  ctx.fillText(`/${String(total).padStart(2, '0')}`, CARD_W - 66, 1132);
  ctx.textAlign = 'left';
}

/** Draws the brief face: accent header band, description, highlights and tech stack. */
export function drawBack(canvas: HTMLCanvasElement, item: GalleryItem, index: number) {
  const ctx = begin(canvas);
  paperBase(ctx, index * 131 + 7, '#f7f0df');

  ctx.fillStyle = item.accent;
  ctx.fillRect(38, 38, CARD_W - 76, 250);
  const r = rng(index + 3);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(0,0,0,${r() * 0.08})`;
    ctx.fillRect(38 + r() * (CARD_W - 76), 38 + r() * 250, 2, 2);
  }
  label(ctx, `Exhibit ${String(index + 1).padStart(2, '0')} · ${item.category}`, 70, 96, 'rgba(251,247,238,0.85)');
  ctx.fillStyle = PAPER;
  ctx.font = `700 70px ${SERIF}`;
  const title = wrap(ctx, item.title, CARD_W - 140, 2);
  title.forEach((l, i) => ctx.fillText(l, 68, 176 + i * 68));
  ctx.font = `italic 500 30px ${SERIF}`;
  ctx.fillStyle = 'rgba(251,247,238,0.9)';
  ctx.fillText(item.period, 70, title.length > 1 ? 272 : 240);

  let y = 350;
  label(ctx, 'The brief', 66, y);
  ctx.fillStyle = SOFT;
  ctx.font = `500 34px ${SERIF}`;
  const desc = wrap(ctx, item.description, CARD_W - 132, 6);
  desc.forEach((l, i) => ctx.fillText(l, 66, y + 50 + i * 42));
  y += 50 + desc.length * 42 + 36;

  if (item.highlights.length) {
    label(ctx, 'Highlights', 66, y);
    y += 46;
    ctx.font = `500 27px ${SANS}`;
    for (const h of item.highlights.slice(0, 2)) {
      const lines = wrap(ctx, h, CARD_W - 170, 2);
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(76, y - 9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = SOFT;
      lines.forEach((l, i) => ctx.fillText(l, 100, y + i * 36));
      y += lines.length * 36 + 18;
    }
    y += 16;
  }

  const ty = Math.min(y, 960);
  label(ctx, 'Built with', 66, ty);
  chips(ctx, item.tech, 66, ty + 22, CARD_W - 66, 2, INK, INK, PAPER);

  ctx.fillStyle = FAINT;
  ctx.font = `700 40px ${HAND}`;
  ctx.fillText('click again to hang it back', 66, 1146);
}

export type CanvasFace = { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture };

/** Creates an empty canvas-backed texture sized for one card face. */
export function makeFace(): CanvasFace {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(CARD_W * TEX_SCALE);
  canvas.height = Math.round(CARD_H * TEX_SCALE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { canvas, texture };
}
