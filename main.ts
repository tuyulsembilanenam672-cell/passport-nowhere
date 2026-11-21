// The Passport Page of a Country That Isn't There
// Invented passport spread for the Republic of Kestrelia, drawn fully in code.
// Node 22, stdlib only, no network, deterministic. Writes /output/entry.png
// (1024x1024 PNG, <= 1 MiB).
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const img = new Uint8Array(W * H * 4);

type RGB = [number, number, number];
const NAVY: RGB = [28, 47, 74];
const INK: RGB = [24, 38, 60];
const CREAM: RGB = [246, 239, 221];
const CREAM2: RGB = [238, 229, 205];
const GOLD: RGB = [176, 141, 62];
const TEAL: RGB = [31, 79, 92];
const BLUE: RGB = [31, 79, 163];
const RED: RGB = [176, 42, 42];
const PURPLE: RGB = [107, 63, 160];
const GREEN: RGB = [30, 122, 70];
const SKIN: RGB = [217, 169, 134];
const SKIN_D: RGB = [198, 148, 112];
const HAIR: RGB = [58, 38, 26];

// ---- pixel buffer ----
function setPx(x: number, y: number, c: RGB, a = 1): void {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 4;
  const ia = 1 - a;
  img[i] = Math.round(c[0] * a + img[i] * ia);
  img[i + 1] = Math.round(c[1] * a + img[i + 1] * ia);
  img[i + 2] = Math.round(c[2] * a + img[i + 2] * ia);
  img[i + 3] = 255;
}
function fillRect(x: number, y: number, w: number, h: number, c: RGB, a = 1): void {
  const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w)), y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) setPx(xx, yy, c, a);
}
function hline(x0: number, x1: number, y: number, c: RGB, a = 1): void {
  for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) setPx(x, y, c, a);
}
function vline(x: number, y0: number, y1: number, c: RGB, a = 1): void {
  for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) setPx(x, y, c, a);
}
function line(x0: number, y0: number, x1: number, y1: number, c: RGB, a = 1): void {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) setPx(x0 + (dx * i) / steps, y0 + (dy * i) / steps, c, a);
}
function rectOutline(x: number, y: number, w: number, h: number, c: RGB, a = 1): void {
  hline(x, x + w, y, c, a); hline(x, x + w, y + h, c, a);
  vline(x, y, y + h, c, a); vline(x + w, y, y + h, c, a);
}
function fillCircle(cx: number, cy: number, r: number, c: RGB, a = 1): void {
  for (let yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++) {
    const dy = yy - cy, dx = Math.sqrt(Math.max(0, r * r - dy * dy));
    for (let xx = Math.floor(cx - dx); xx <= Math.ceil(cx + dx); xx++) setPx(xx, yy, c, a);
  }
}
function circleOutline(cx: number, cy: number, r: number, c: RGB, a = 1): void {
  for (let t = 0; t < 360; t += 1) {
    const rad = (t * Math.PI) / 180;
    setPx(cx + r * Math.cos(rad), cy + r * Math.sin(rad), c, a);
  }
}
function fillEllipse(cx: number, cy: number, rx: number, ry: number, c: RGB, a = 1): void {
  for (let yy = Math.floor(cy - ry); yy <= Math.ceil(cy + ry); yy++) {
    const dy = (yy - cy) / ry, dx = rx * Math.sqrt(Math.max(0, 1 - dy * dy));
    for (let xx = Math.floor(cx - dx); xx <= Math.ceil(cx + dx); xx++) setPx(xx, yy, c, a);
  }
}
function fillPoly(pts: number[][], c: RGB, a = 1): void {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % pts.length];
      if ((p0[1] <= y && p1[1] > y) || (p1[1] <= y && p0[1] > y)) {
        xs.push(p0[0] + ((y - p0[1]) * (p1[0] - p0[0])) / (p1[1] - p0[1]));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) hline(Math.ceil(xs[k]), Math.floor(xs[k + 1]), y, c, a);
  }
}
function rot(x: number, y: number, cx: number, cy: number, ang: number): [number, number] {
  const s = Math.sin(ang), co = Math.cos(ang);
  return [cx + (x - cx) * co - (y - cy) * s, cy + (x - cx) * s + (y - cy) * co];
}
function rotRectOutline(cx: number, cy: number, w: number, h: number, angDeg: number, c: RGB, a = 1): void {
  const ang = (angDeg * Math.PI) / 180;
  const hw = w / 2, hh = h / 2;
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => rot(cx + x, cy + y, cx, cy, ang));
  for (let i = 0; i < 4; i++) {
    const p0 = corners[i], p1 = corners[(i + 1) % 4];
    line(p0[0], p0[1], p1[0], p1[1], c, a);
  }
}

// ---- 5x7 bitmap font (glyph = 7 rows of 5 bits) ----
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
};
function textWidth(s: string, scale: number, pitch?: number): number {
  const p = pitch ?? 6 * scale;
  return s.length * p - (pitch === undefined ? scale : 0);
}
function drawText(x: number, y: number, s: string, scale: number, c: RGB, a = 1, pitch?: number): void {
  const p = pitch ?? 6 * scale;
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]] ?? FONT["?"];
    const ox = x + i * p;
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (g[gy][gx] === "1") fillRect(ox + gx * scale, y + gy * scale, scale, scale, c, a);
    }
  }
}
function drawTextCentered(cx: number, y: number, s: string, scale: number, c: RGB, a = 1): void {
  drawText(cx - textWidth(s, scale) / 2, y, s, scale, c, a);
}
// Draw text centered on (cx,cy), rotated by angDeg (baseline angle).
function drawTextRotated(cx: number, cy: number, s: string, scale: number, c: RGB, angDeg: number, a = 1): void {
  const ang = (angDeg * Math.PI) / 180;
  const co = Math.cos(ang), si = Math.sin(ang);
  const total = s.length * 6 * scale;
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]] ?? FONT["?"];
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (g[gy][gx] !== "1") continue;
      const lx = i * 6 * scale + gx * scale + scale / 2 - total / 2;
      const ly = gy * scale + scale / 2 - 3.5 * scale;
      const rx = lx * co - ly * si, ry = lx * si + ly * co;
      fillRect(cx + rx - scale / 2, cy + ry - scale / 2, scale, scale, c, a);
    }
  }
}
// Text along a circle arc (degrees, 0 = east, increasing clockwise in screen coords).
function drawArcText(cx: number, cy: number, r: number, s: string, scale: number, c: RGB, startDeg: number, endDeg: number, a = 1): void {
  const n = s.length;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? (startDeg + endDeg) / 2 : startDeg + ((endDeg - startDeg) * i) / (n - 1);
    const rad = (t * Math.PI) / 180;
    const px = cx + r * Math.cos(rad), py = cy + r * Math.sin(rad);
    const g = FONT[s[i]] ?? FONT["?"];
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (g[gy][gx] !== "1") continue;
      const lx = (gx - 2) * scale, ly = (gy - 3) * scale;
      const co = Math.cos(rad + Math.PI / 2), si = Math.sin(rad + Math.PI / 2);
      const rx = lx * co - ly * si, ry = lx * si + ly * co;
      fillRect(px + rx, py + ry, scale, scale, c, a);
    }
  }
}

// ---- PNG encoder (RGBA, filter 0, zlib) ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(): Buffer {
  const stride = W * 4 + 1;
  const raw = Buffer.alloc(stride * H);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0;
    raw.set(img.subarray(y * W * 4, (y + 1) * W * 4), y * stride + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- deterministic pseudo-random (paper speckle) ----
let seed = 20261121;
function rnd(): number { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

// ---- guilloche: fine wavy security lines ----
function guilloche(x0: number, y0: number, x1: number, y1: number, c: RGB, a: number): void {
  for (let y = y0; y < y1; y += 5) {
    for (let x = x0; x < x1; x++) {
      const yy = y + Math.sin((x - x0) / 18 + y / 7) * 1.6;
      setPx(x, yy, c, a);
    }
  }
}
function guillocheArcs(cx: number, cy: number, r0: number, r1: number, c: RGB, a: number): void {
  for (let r = r0; r < r1; r += 4) {
    for (let t = 0; t < 360; t += 2) {
      const rad = (t * Math.PI) / 180;
      const rr = r + Math.sin(t / 9) * 1.5;
      setPx(cx + rr * Math.cos(rad), cy + rr * Math.sin(rad), c, a);
    }
  }
}

// ---- coat of arms: shield, eight-point star, sea waves ----
function emblem(cx: number, cy: number, s: number): void {
  // crown
  fillPoly([[cx - 18 * s, cy - 52 * s], [cx - 12 * s, cy - 64 * s], [cx - 6 * s, cy - 52 * s],
    [cx, cy - 66 * s], [cx + 6 * s, cy - 52 * s], [cx + 12 * s, cy - 64 * s], [cx + 18 * s, cy - 52 * s],
    [cx + 18 * s, cy - 46 * s], [cx - 18 * s, cy - 46 * s]], GOLD);
  // shield
  const sh: number[][] = [[cx - 34 * s, cy - 44 * s], [cx + 34 * s, cy - 44 * s], [cx + 34 * s, cy + 8 * s],
    [cx, cy + 40 * s], [cx - 34 * s, cy + 8 * s]];
  fillPoly(sh, [250, 244, 224]);
  for (let i = 0; i < sh.length; i++) line(sh[i][0], sh[i][1], sh[(i + 1) % sh.length][0], sh[(i + 1) % sh.length][1], NAVY);
  // eight-point star
  for (let k = 0; k < 8; k++) {
    const ang = (k * Math.PI) / 4;
    const len = k % 2 === 0 ? 22 * s : 13 * s;
    line(cx, cy - 18 * s, cx + len * Math.sin(ang), cy - 18 * s - len * Math.cos(ang), GOLD);
    line(cx, cy - 18 * s, cx + len * Math.sin(ang), cy - 18 * s - len * Math.cos(ang), GOLD);
  }
  fillCircle(cx, cy - 18 * s, 4 * s, GOLD);
  // sea waves inside shield
  for (const wy of [6, 14, 22]) {
    for (let x = cx - 30 * s; x <= cx + 30 * s; x += 1) {
      const yy = cy + wy * s + Math.sin((x - cx) / 7) * 2.5 * s;
      if (yy < cy + 36 * s - Math.abs(x - cx) * 0.9) setPx(x, yy, TEAL, 0.9);
    }
  }
  // supporters: two small stars flanking
  fillCircle(cx - 44 * s, cy - 10 * s, 2.5 * s, GOLD);
  fillCircle(cx + 44 * s, cy - 10 * s, 2.5 * s, GOLD);
}

// ---- portrait: stylised official photo of the holder ----
function portrait(x: number, y: number, w: number, h: number): void {
  // backdrop: soft teal bands
  for (let yy = 0; yy < h; yy++) {
    const t = yy / h;
    const c: RGB = [Math.round(126 - 40 * t), Math.round(168 - 46 * t), Math.round(160 - 40 * t)];
    hline(x, x + w, y + yy, c);
  }
  // faint backdrop arcs
  guillocheArcs(x + w / 2, y + h * 0.42, 8, 62, [255, 255, 255], 0.10);
  const cx = x + w / 2;
  // shoulders / jacket
  fillPoly([[cx - 62, y + h], [cx - 58, y + h * 0.78], [cx - 26, y + h * 0.70], [cx + 26, y + h * 0.70],
    [cx + 58, y + h * 0.78], [cx + 62, y + h]], [38, 52, 74]);
  // shirt + collar
  fillPoly([[cx - 14, y + h * 0.70], [cx, y + h * 0.86], [cx + 14, y + h * 0.70], [cx + 14, y + h * 0.78], [cx - 14, y + h * 0.78]], [245, 244, 238]);
  fillPoly([[cx - 16, y + h * 0.70], [cx, y + h * 0.76], [cx - 6, y + h * 0.70]], [245, 244, 238]);
  fillPoly([[cx + 16, y + h * 0.70], [cx, y + h * 0.76], [cx + 6, y + h * 0.70]], [245, 244, 238]);
  // neck
  fillRect(cx - 11, y + h * 0.58, 22, h * 0.14, SKIN_D);
  // ears
  fillEllipse(cx - 34, y + h * 0.38, 6, 10, SKIN);
  fillEllipse(cx + 34, y + h * 0.38, 6, 10, SKIN);
  // head
  fillEllipse(cx, y + h * 0.38, 34, 44, SKIN);
  // hair: cap over the top of the head, side part
  fillEllipse(cx, y + h * 0.38 - 26, 36, 26, HAIR);
  fillEllipse(cx, y + h * 0.38 - 18, 35, 24, SKIN);
  fillPoly([[cx - 34, y + h * 0.38 - 34], [cx - 10, y + h * 0.38 - 46], [cx + 34, y + h * 0.38 - 30],
    [cx + 30, y + h * 0.38 - 16], [cx - 30, y + h * 0.38 - 18]], HAIR);
  fillPoly([[cx + 6, y + h * 0.38 - 44], [cx + 34, y + h * 0.38 - 30], [cx + 34, y + h * 0.38 - 8],
    [cx + 26, y + h * 0.38 - 30]], HAIR);
  // brows, eyes, nose, mouth
  line(cx - 20, y + h * 0.36, cx - 8, y + h * 0.355, HAIR);
  line(cx + 8, y + h * 0.355, cx + 20, y + h * 0.36, HAIR);
  fillEllipse(cx - 14, y + h * 0.385, 3.5, 2.5, [40, 28, 20]);
  fillEllipse(cx + 14, y + h * 0.385, 3.5, 2.5, [40, 28, 20]);
  line(cx, y + h * 0.39, cx - 2, y + h * 0.46, SKIN_D);
  line(cx - 2, y + h * 0.46, cx + 2, y + h * 0.465, SKIN_D);
  line(cx - 8, y + h * 0.53, cx + 8, y + h * 0.53, [150, 92, 78]);
  // soft cheek shading
  fillEllipse(cx - 22, y + h * 0.46, 7, 4, [232, 150, 130], 0.35);
  fillEllipse(cx + 22, y + h * 0.46, 7, 4, [232, 150, 130], 0.35);
  // jacket lapels
  line(cx - 26, y + h * 0.70, cx - 8, y + h, [24, 36, 54]);
  line(cx + 26, y + h * 0.70, cx + 8, y + h, [24, 36, 54]);
}

// ---- rectangular border stamp, slightly rotated ----
function stamp(cx: number, cy: number, w: number, h: number, ang: number, c: RGB, lines: string[], scale: number): void {
  rotRectOutline(cx, cy, w, h, ang, c, 0.85);
  rotRectOutline(cx, cy, w - 10, h - 10, ang, c, 0.85);
  const n = lines.length;
  for (let i = 0; i < n; i++) {
    const ly = cy + (i - (n - 1) / 2) * (scale * 9 + 4);
    drawTextRotated(cx, ly, lines[i], scale, c, ang, 0.9);
  }
  // corner stars
  const a = (ang * Math.PI) / 180;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const lx = sx * (w / 2 - 14), ly = sy * (h / 2 - 14);
    const rx = lx * Math.cos(a) - ly * Math.sin(a), ry = lx * Math.sin(a) + ly * Math.cos(a);
    drawTextRotated(cx + rx, cy + ry, "*", 1, c, ang, 0.9);
  }
}

// ---- circular date stamp ----
function roundStamp(cx: number, cy: number, r: number, c: RGB, arcTop: string, arcBottom: string, mid: string[]): void {
  circleOutline(cx, cy, r, c, 0.9);
  circleOutline(cx, cy, r - 6, c, 0.9);
  drawTextCentered(cx, cy - r + 14, arcTop, 1, c, 0.9);
  drawTextCentered(cx, cy + r - 20, arcBottom, 1, c, 0.9);
  const n = mid.length;
  for (let i = 0; i < n; i++) drawTextCentered(cx, cy + (i - (n - 1) / 2) * 12 - 3, mid[i], 1, c, 0.9);
  fillCircle(cx - r + 12, cy, 2, c, 0.9);
  fillCircle(cx + r - 12, cy, 2, c, 0.9);
}

function field(x: number, y: number, label: string, value: string, vscale = 2): void {
  drawText(x, y, label, 1, [120, 110, 88]);
  drawText(x, y + 10, value, vscale, INK);
}
function fieldRow(y: number, x1: number, l1: string, v1: string, x2: number, l2: string, v2: string): void {
  field(x1, y, l1, v1);
  field(x2, y, l2, v2);
}

function drawLeftPage(): void {
  const px0 = 40, py0 = 40, pw = 458, ph = 944;
  // page shadow + paper
  fillRect(px0 + 7, py0 + 7, pw, ph, [10, 22, 30], 0.55);
  fillRect(px0, py0, pw, ph, CREAM);
  fillRect(px0, py0, pw, ph, CREAM2, 0.0);
  guilloche(px0 + 14, py0 + 14, px0 + pw - 14, py0 + ph - 14, [90, 130, 160], 0.10);
  rectOutline(px0 + 10, py0 + 10, pw - 20, ph - 20, NAVY, 0.35);

  drawTextCentered(px0 + pw / 2, py0 + 26, "REPUBLIC OF KESTRELIA", 2, NAVY);
  drawTextCentered(px0 + pw / 2, py0 + 48, "REPUBLIKA KESTRELIA", 1, [120, 110, 88]);
  emblem(px0 + pw / 2, py0 + 165, 1.0);
  drawTextCentered(px0 + pw / 2, py0 + 218, "PASSPORT", 4, NAVY);
  drawTextCentered(px0 + pw / 2, py0 + 252, "PASAPORTA", 1, [120, 110, 88]);

  drawTextCentered(px0 + pw / 2, py0 + 276, "TYPE P   CODE KE   NO. KE 847 201 5", 1, INK);

  // photo
  const fx = px0 + 26, fy = py0 + 300, fw = 148, fh = 188;
  fillRect(fx - 5, fy - 5, fw + 10, fh + 10, [255, 255, 255]);
  rectOutline(fx - 5, fy - 5, fw + 10, fh + 10, NAVY, 0.6);
  portrait(fx, fy, fw, fh);
  rectOutline(fx, fy, fw, fh, NAVY, 0.8);

  // data fields, two columns right of the photo
  const colX = fx + fw + 22;
  field(colX, fy + 2, "SURNAME", "VOSS");
  field(colX, fy + 44, "GIVEN NAMES", "ELENA MARA");
  field(colX, fy + 86, "NATIONALITY", "KESTRELIAN");
  field(colX, fy + 128, "DATE OF BIRTH", "14 MAR 1988");
  field(colX, fy + 170, "PLACE OF BIRTH", "AURELIA");

  // full-width rows below the photo
  const ry = py0 + 512;
  fieldRow(ry, px0 + 26, "SEX", "F", px0 + 96, "DATE OF ISSUE", "02 JUN 2026");
  fieldRow(ry + 46, px0 + 26, "DATE OF EXPIRY", "01 JUN 2036", px0 + 260, "HEIGHT", "171 CM");
  field(px0 + 26, ry + 92, "ISSUING AUTHORITY", "MINISTRY OF INTERIOR, AURELIA");

  // holder signature
  const sy = py0 + 668;
  drawText(px0 + 26, sy, "HOLDER'S SIGNATURE", 1, [120, 110, 88]);
  for (let x = px0 + 26; x < px0 + 300; x++) {
    const yy = sy + 26 + Math.sin((x - px0) / 9) * 3 + Math.sin((x - px0) / 23) * 2;
    setPx(x, yy, [30, 60, 140], 0.9);
    setPx(x, yy + 1, [30, 60, 140], 0.6);
  }
  line(px0 + 26, sy + 34, px0 + 300, sy + 34, NAVY, 0.5);

  // observations: the telling paperwork detail
  const oy = py0 + 722;
  rectOutline(px0 + 26, oy, pw - 52, 62, NAVY, 0.6);
  drawText(px0 + 34, oy + 8, "OBSERVATIONS", 1, NAVY);
  drawText(px0 + 34, oy + 24, "HOLDER IS A REGISTERED SEAFARER.", 1, INK);
  drawText(px0 + 34, oy + 38, "CREW VISA EXEMPT IN TALVERA, OSTMERE, CALDOR.", 1, INK);

  // machine-readable zone
  const my = py0 + 806;
  fillRect(px0 + 26, my, pw - 52, 76, [232, 224, 200]);
  rectOutline(px0 + 26, my, pw - 52, 76, NAVY, 0.5);
  const mrz1 = "P<KEAVOSS<<ELENA<MARA<<<<<<<<<<<<<<<<<<";
  const mrz2 = "KE8472015<0KEA8803147F3606012<<<<<<<<<<<<<<02";
  drawText(px0 + 34, my + 12, mrz1, 2, INK, 1, 9);
  drawText(px0 + 34, my + 42, mrz2, 2, INK, 1, 9);

  drawText(px0 + 26, py0 + ph - 26, "KE 847 201 5", 1, [120, 110, 88]);
  drawText(px0 + pw - 40, py0 + ph - 26, "1", 1, [120, 110, 88]);
}

function drawRightPage(): void {
  const px0 = 526, py0 = 40, pw = 458, ph = 944;
  fillRect(px0 + 7, py0 + 7, pw, ph, [10, 22, 30], 0.55);
  fillRect(px0, py0, pw, ph, CREAM);
  guilloche(px0 + 14, py0 + 14, px0 + pw - 14, py0 + ph - 14, [90, 130, 160], 0.10);
  rectOutline(px0 + 10, py0 + 10, pw - 20, ph - 20, NAVY, 0.35);
  // faint watermark star
  for (let k = 0; k < 8; k++) {
    const ang = (k * Math.PI) / 4;
    line(px0 + pw / 2, py0 + ph / 2, px0 + pw / 2 + 150 * Math.sin(ang), py0 + ph / 2 - 150 * Math.cos(ang), [90, 130, 160], 0.05);
  }

  drawTextCentered(px0 + pw / 2, py0 + 26, "VISAS", 3, NAVY);
  drawTextCentered(px0 + pw / 2, py0 + 56, "VIZE", 1, [120, 110, 88]);
  drawText(px0 + pw - 44, py0 + 30, "12", 2, NAVY);

  // ---- Talvera visa sticker ----
  const vx = px0 + 22, vy = py0 + 92, vw = pw - 44, vh = 208;
  fillRect(vx, vy, vw, vh, [222, 235, 246]);
  rectOutline(vx, vy, vw, vh, NAVY, 0.8);
  rectOutline(vx + 5, vy + 5, vw - 10, vh - 10, NAVY, 0.4);
  drawText(vx + 16, vy + 14, "VISA", 4, NAVY);
  // Talvera flag: three horizontal bars
  const fx = vx + vw - 96;
  fillRect(fx, vy + 16, 80, 12, [28, 110, 90]);
  fillRect(fx, vy + 28, 80, 12, [245, 244, 238]);
  fillRect(fx, vy + 40, 80, 12, [176, 42, 42]);
  drawText(vx + 16, vy + 52, "REPUBLIC OF TALVERA", 2, INK);
  drawText(vx + 16, vy + 82, "TYPE C - SINGLE ENTRY", 2, INK);
  drawText(vx + 16, vy + 106, "VALID 18 JUN 2026 - 17 JUL 2026", 2, INK);
  drawText(vx + 16, vy + 130, "STAY UP TO 30 DAYS", 2, INK);
  drawText(vx + 16, vy + 158, "FEE PAID 40 KR - RECEIPT 2214", 1, INK);
  drawText(vx + 16, vy + 172, "CONDITION: NO EMPLOYMENT", 1, RED);
  drawText(vx + 16, vy + 186, "ISSUED AURELIA, 16 JUN 2026", 1, [120, 110, 88]);
  // circular visa stamp overlapping the sticker corner
  roundStamp(vx + vw - 52, vy + vh - 30, 40, RED, "TALVERA", "CONSULATE", ["VISA", "18.06.26"]);

  // ---- travel stamps, in date order after issue (02 JUN 2026) ----
  stamp(px0 + pw / 2, py0 + 372, 330, 84, -6, BLUE, ["TALVERA - ENTRY", "18 JUN 2026"], 2);
  stamp(px0 + pw / 2, py0 + 478, 330, 84, 5, PURPLE, ["TALVERA - EXIT", "24 JUN 2026"], 2);
  stamp(px0 + pw / 2, py0 + 584, 330, 84, -4, RED, ["OSTMERE - ENTRY", "09 JUL 2026"], 2);
  stamp(px0 + pw / 2, py0 + 690, 330, 84, 6, GREEN, ["OSTMERE - EXIT", "20 JUL 2026"], 2);
  stamp(px0 + pw / 2, py0 + 796, 330, 84, -5, BLUE, ["CALDOR - ENTRY", "02 AUG 2026", "ADMITTED 90 DAYS"], 1);

  // arrival stamp back home, bottom right
  roundStamp(px0 + pw - 78, py0 + 884, 44, TEAL, "AURELIA", "KESTRELIA", ["ARRIVED", "12 AUG 2026"]);
  drawText(px0 + 26, py0 + 908, "THIS PASSPORT REMAINS THE PROPERTY", 1, [120, 110, 88]);
  drawText(px0 + 26, py0 + 922, "OF THE REPUBLIC OF KESTRELIA.", 1, [120, 110, 88]);
  drawText(px0 + 26, py0 + ph - 26, "P. 12", 1, [120, 110, 88]);
}

function main(): void {
  // desk background: deep teal with soft light bands
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const c: RGB = [Math.round(22 - 6 * t), Math.round(48 - 10 * t), Math.round(62 - 8 * t)];
    hline(0, W - 1, y, c);
  }
  for (let i = 0; i < 2600; i++) {
    const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
    setPx(x, y, [255, 255, 255], 0.02 + rnd() * 0.03);
  }
  // spine shadow between the pages
  fillRect(498, 40, 28, 944, [8, 18, 26], 0.6);
  drawLeftPage();
  drawRightPage();
  // centre fold line
  vline(511, 44, 980, [120, 110, 88], 0.5);
  vline(513, 44, 980, [255, 250, 235], 0.25);

  mkdirSync("/output", { recursive: true });
  const png = encodePNG();
  writeFileSync("/output/entry.png", png);
  console.log("wrote /output/entry.png", png.length, "bytes");
}

main();
