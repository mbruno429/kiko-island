import { INK } from './ui';

export const STAMPS = ['star', 'heart', 'flower', 'fish', 'shell', 'sun', 'kiko'] as const;
export type StampId = (typeof STAMPS)[number];

type C = CanvasRenderingContext2D;

// Each shape is drawn in a unit box (-0.5..0.5) and scaled to the stamp size.
const shapes: Record<StampId, (c: C, color: string) => void> = {
  star(c, color) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.21 : 0.48;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath();
    paint(c, color);
  },
  heart(c, color) {
    c.beginPath();
    c.moveTo(0, 0.44);
    c.bezierCurveTo(-0.62, 0.02, -0.5, -0.46, -0.22, -0.42);
    c.bezierCurveTo(-0.08, -0.4, 0, -0.3, 0, -0.2);
    c.bezierCurveTo(0, -0.3, 0.08, -0.4, 0.22, -0.42);
    c.bezierCurveTo(0.5, -0.46, 0.62, 0.02, 0, 0.44);
    c.closePath();
    paint(c, color);
  },
  flower(c, color) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      c.beginPath();
      c.arc(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0.18, 0, Math.PI * 2);
      paint(c, color);
    }
    c.beginPath();
    c.arc(0, 0, 0.17, 0, Math.PI * 2);
    paint(c, '#ffd23f');
  },
  fish(c, color) {
    c.beginPath();
    c.moveTo(0.2, 0);
    c.lineTo(0.48, -0.26);
    c.lineTo(0.48, 0.26);
    c.closePath();
    paint(c, color);
    c.beginPath();
    c.ellipse(-0.08, 0, 0.38, 0.25, 0, 0, Math.PI * 2);
    paint(c, color);
    c.beginPath();
    c.arc(-0.24, -0.06, 0.05, 0, Math.PI * 2);
    c.fillStyle = INK;
    c.fill();
  },
  shell(c, color) {
    c.beginPath();
    c.moveTo(-0.1, 0.42);
    c.lineTo(-0.46, -0.02);
    for (let i = 0; i < 5; i++) {
      const a0 = Math.PI + (i * Math.PI) / 5;
      const a1 = a0 + Math.PI / 5;
      const mid = (a0 + a1) / 2;
      c.quadraticCurveTo(Math.cos(mid) * 0.6, -0.02 + Math.sin(mid) * 0.52, Math.cos(a1) * 0.46, -0.02 + Math.sin(a1) * 0.4);
    }
    c.lineTo(0.1, 0.42);
    c.closePath();
    paint(c, color);
    c.beginPath();
    for (const a of [-0.9, -0.3, 0.3, 0.9]) {
      c.moveTo(0, 0.38);
      c.lineTo(Math.sin(a) * 0.36, -Math.cos(a) * 0.3);
    }
    c.stroke();
  },
  sun(c, color) {
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const r = i % 2 ? 0.33 : 0.49;
      const a = (i * Math.PI) / 8;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath();
    paint(c, color);
    c.beginPath();
    c.arc(0, 0, 0.24, 0, Math.PI * 2);
    paint(c, color);
  },
  kiko(c, color) {
    c.beginPath();
    c.moveTo(-0.14, -0.14);
    c.quadraticCurveTo(-0.2, -0.34, -0.3, -0.4);
    c.moveTo(0.14, -0.14);
    c.quadraticCurveTo(0.2, -0.34, 0.3, -0.4);
    c.stroke();
    for (const x of [-0.31, 0.31]) {
      c.beginPath();
      c.arc(x, -0.41, 0.07, 0, Math.PI * 2);
      paint(c, '#ffd23f');
    }
    c.beginPath();
    c.ellipse(0, 0.12, 0.36, 0.34, 0, 0, Math.PI * 2);
    paint(c, color);
    for (const [x, y, r] of [
      [-0.14, 0.08, 0.1],
      [0.14, 0.08, 0.1],
      [0, -0.08, 0.075],
    ]) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      paint(c, '#fff');
      c.beginPath();
      c.arc(x, y, r * 0.45, 0, Math.PI * 2);
      c.fillStyle = INK;
      c.fill();
    }
    c.beginPath();
    c.moveTo(-0.14, 0.25);
    c.quadraticCurveTo(0, 0.4, 0.14, 0.25);
    c.stroke();
  },
};

function paint(c: C, color: string): void {
  c.fillStyle = color;
  c.fill();
  c.stroke();
}

export function drawStamp(c: C, id: StampId, x: number, y: number, size: number, color: string, rotation = 0): void {
  c.save();
  c.translate(x, y);
  c.rotate(rotation);
  c.scale(size, size);
  c.lineWidth = Math.max(3, size * 0.045) / size;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.strokeStyle = INK;
  shapes[id](c, color);
  c.restore();
}

/** A small picture of a stamp for its button. */
export function stampIcon(id: StampId, color: string): HTMLCanvasElement {
  const px = 144;
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const c = cv.getContext('2d');
  if (c) drawStamp(c, id, px / 2, px / 2, px * 0.86, color);
  return cv;
}
