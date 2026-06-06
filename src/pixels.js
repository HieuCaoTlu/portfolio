// Pixel art renderer — grid coords × PIXEL_SIZE = canvas px
export const PIXEL_SIZE = 4;

// drawSprite: px/py are grid coords
export function drawSprite(ctx, sprite, px, py, colors = {}) {
  const defaults = { '#': '#ffffff', '@': '#aaaaff', '*': '#ffff88', '~': '#4466ff' };
  const palette = { ...defaults, ...colors };
  const ox = Math.round(px) * PIXEL_SIZE;
  const oy = Math.round(py) * PIXEL_SIZE;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const ch = sprite[row][col];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch] || '#ffffff';
      ctx.fillStyle = color;
      ctx.fillRect(ox + col * PIXEL_SIZE, oy + row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
}

// drawSpritePx: px/py are canvas px (for UI elements)
export function drawSpritePx(ctx, sprite, px, py, colors = {}) {
  const defaults = { '#': '#ffffff', '@': '#aaaaff', '*': '#ffff88', '~': '#4466ff' };
  const palette = { ...defaults, ...colors };
  const ox = Math.round(px);
  const oy = Math.round(py);
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const ch = sprite[row][col];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch] || '#ffffff';
      ctx.fillStyle = color;
      ctx.fillRect(ox + col * PIXEL_SIZE, oy + row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
}

const FONT = {
  'A': ['010','101','111','101','101'],
  'B': ['110','101','110','101','110'],
  'C': ['011','100','100','100','011'],
  'D': ['110','101','101','101','110'],
  'E': ['111','100','111','100','111'],
  'F': ['111','100','111','100','100'],
  'G': ['011','100','101','101','011'],
  'H': ['101','101','111','101','101'],
  'I': ['111','010','010','010','111'],
  'J': ['001','001','001','101','010'],
  'K': ['101','101','110','101','101'],
  'L': ['100','100','100','100','111'],
  'M': ['101','111','101','101','101'],
  'N': ['101','111','111','101','101'],
  'O': ['010','101','101','101','010'],
  'P': ['110','101','110','100','100'],
  'Q': ['010','101','101','110','011'],
  'R': ['110','101','110','101','101'],
  'S': ['011','100','010','001','110'],
  'T': ['111','010','010','010','010'],
  'U': ['101','101','101','101','010'],
  'V': ['101','101','101','010','010'],
  'W': ['101','101','101','111','101'],
  'X': ['101','101','010','101','101'],
  'Y': ['101','010','010','010','010'],
  'Z': ['111','001','010','100','111'],
  '0': ['010','101','101','101','010'],
  '1': ['010','110','010','010','111'],
  '2': ['010','101','010','100','111'],
  '3': ['110','001','010','001','110'],
  '4': ['101','101','111','001','001'],
  '5': ['111','100','110','001','110'],
  '6': ['010','100','110','101','010'],
  '7': ['111','001','010','010','010'],
  '8': ['010','101','010','101','010'],
  '9': ['010','101','011','001','010'],
  '/': ['001','001','010','100','100'],
  ' ': ['000','000','000','000','000'],
  ':': ['000','010','000','010','000'],
  '!': ['010','010','010','000','010'],
  '.': ['000','000','000','000','010'],
  '"': ['101','101','000','000','000'],
  "'": ['010','010','000','000','000'],
};

// Returns text width in canvas px
export function textWidthPx(text, scale = 1) {
  return text.length * (3 + 1) * scale * PIXEL_SIZE;
}

// drawText: px/py are grid coords
export function drawText(ctx, text, px, py, color = '#ffffff', scale = 1) {
  drawTextPx(ctx, text, px * PIXEL_SIZE, py * PIXEL_SIZE, color, scale);
}

// drawTextPx: px/py are canvas px — use this for UI so centering is exact
export function drawTextPx(ctx, text, px, py, color = '#ffffff', scale = 1) {
  const charW = (3 + 1) * scale * PIXEL_SIZE;
  let cx = Math.round(px);
  const oy = Math.round(py);
  const upper = text.toUpperCase();
  for (const ch of upper) {
    const rows = FONT[ch];
    if (!rows) { cx += charW; continue; }
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === '1') {
          ctx.fillStyle = color;
          ctx.fillRect(
            cx + c * scale * PIXEL_SIZE,
            oy + r * scale * PIXEL_SIZE,
            PIXEL_SIZE * scale,
            PIXEL_SIZE * scale
          );
        }
      }
    }
    cx += charW;
  }
}
