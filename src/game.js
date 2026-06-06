import { PIXEL_SIZE, drawSprite, drawSpritePx, drawText, drawTextPx, textWidthPx } from './pixels.js';
import {
  PLAYER_IDLE, PLAYER_WALK1, PLAYER_WALK2,
  PLAYER_HOLD, NAM_HOLD,
  STAR_SPRITE, MINI_STAR, METEOR_SPRITE
} from './sprites.js';

const GW = 360 / PIXEL_SIZE;   // 90 grid cells wide
const FOOTER_PX = 130;
const VIEWPORT_GH = Math.floor((640 - FOOTER_PX) / PIXEL_SIZE); // ~127 cells tall

const TOTAL_STARS = 5;
const WORLD_HEIGHT = VIEWPORT_GH * 5;  // taller world so stars spread apart

// 5 distinct star colors
const STAR_COLORS = ['#ffff55', '#ff88ff', '#88ffff', '#ff9944', '#aaffaa'];

const MAX_LIVES = 5;

// Jump height ≈ vy²/(2*gravity) = 65²/(2*140) ≈ 15 grid cells
// Keep max gap well below that so player can always reach the next platform
function platformGap(worldY) {
  const t = 1 - (worldY / WORLD_HEIGHT);
  return 7 + Math.floor(t * 5);  // 7–12 grid cells — always jumpable
}
function platformWidth() {
  return 16 + Math.floor(Math.random() * 10); // 16–25
}

export class Game {
  constructor(canvas, w, h) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = w;
    this.H = h;
    this.state = 'start'; // start | playing | ending | win | gameover
    this.frame = 0;
    this.keys = {};
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;

    this.bgStars = this._genBgStars();
    this.platforms = [];
    this.collectibles = [];
    this.meteors = [];
    this.particles = [];
    this.hearts = [];        // floating hearts for win screen

    this.player = null;
    this.nam = null;
    this.camera = 0;
    this.starsCollected = 0;

    this.winStars = [];
    this.winTimer = 0;
    this.winTextAlpha = 0;
    this.winPhase = 0;
    // win scene: planet + characters
    this.winScene = null;

    this.music = new Audio('/music/bgm.mp3');
    this.music.loop = true;
    this.music.volume = 0.5;

    this._setupInput();
  }

  // ─── World generation ────────────────────────────────────────────

  _genBgStars() {
    const stars = [];
    for (let i = 0; i < 260; i++) {
      stars.push({
        x: Math.random() * GW,
        y: Math.random() * WORLD_HEIGHT,
        size: Math.random() < 0.65 ? 1 : Math.random() < 0.6 ? 2 : 3,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.03,
      });
    }
    return stars;
  }

  generateWorld() {
    this.platforms = [];
    this.collectibles = [];
    this.meteors = [];
    this.hearts = [];

    // Ground
    this.platforms.push({ x: 0, y: WORLD_HEIGHT - 6, w: GW, h: 2 });

    // Place 5 stars evenly — each in its own vertical zone
    const zoneH = Math.floor((WORLD_HEIGHT - 30) / TOTAL_STARS);
    const starTargetYs = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
      // zone 0 = bottom, zone 4 = top
      const zoneTop = WORLD_HEIGHT - 20 - (i + 1) * zoneH;
      const zoneBot = WORLD_HEIGHT - 20 - i * zoneH;
      // random Y within the zone, but not too close to edges
      const margin = Math.floor(zoneH * 0.15);
      starTargetYs.push(zoneTop + margin + Math.floor(Math.random() * (zoneH - 2 * margin)));
    }

    // Generate platforms bottom to top
    let y = WORLD_HEIGHT - 16;
    while (y > 6) {
      const gap = platformGap(WORLD_HEIGHT - y);
      const pw = platformWidth();
      const px = Math.floor(Math.random() * (GW - pw));
      this.platforms.push({ x: px, y, w: pw, h: 2 });

      // Check if a star should be placed near this platform
      for (let i = 0; i < starTargetYs.length; i++) {
        const ty = starTargetYs[i];
        if (Math.abs(y - ty) < gap * 1.5 && !this.collectibles.find(c => c.starIndex === i)) {
          this.collectibles.push({
            x: px + Math.floor(pw / 2) - 3,
            y: y - 10,
            collected: false,
            starIndex: i,
            bob: Math.random() * Math.PI * 2,
          });
        }
      }

      y -= gap + 6;
    }

    // Meteors: spawn zones in the upper 70% of the world
    this._spawnMeteors();
  }

  _spawnMeteors() {
    const count = 12;
    for (let i = 0; i < count; i++) {
      this.meteors.push(this._newMeteor());
    }
  }

  _newMeteor(forceY = null) {
    const x = Math.random() * GW;
    const y = forceY !== null ? forceY : Math.random() * WORLD_HEIGHT * 0.8;
    return {
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: 15 + Math.random() * 12,
      active: true,
    };
  }

  initPlayer() {
    this.player = {
      x: GW / 2 - 4,
      y: WORLD_HEIGHT - 20,
      vx: 0, vy: 0,
      prevY: WORLD_HEIGHT - 20,
      onGround: false,
      jumpsLeft: 2,
      jumpLock: false,
      facing: 1,
      walkFrame: 0,
      walkTimer: 0,
      hitTimer: 0,
      lives: MAX_LIVES,
    };
    this.starsCollected = 0;
    this.camera = WORLD_HEIGHT - VIEWPORT_GH;
  }

  // ─── Input ───────────────────────────────────────────────────────

  _setupInput() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (this.state === 'start' || this.state === 'win' || this.state === 'gameover') this.startGame();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    const canvas = this.canvas;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this.state === 'start' || this.state === 'win' || this.state === 'gameover') { this.startGame(); return; }
      this._handleTouch(e.touches);
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      this._handleTouch(e.touches);
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      this._handleTouch(e.touches);
    }, { passive: false });

    canvas.addEventListener('mousedown', e => {
      if (this.state === 'start' || this.state === 'win' || this.state === 'gameover') { this.startGame(); return; }
      const rect = canvas.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width;
      const ry = (e.clientY - rect.top) / rect.height;
      if (ry > 1 - FOOTER_PX / 640) {
        if (rx < 0.33) this.touchLeft = true;
        else if (rx > 0.67) this.touchRight = true;
        else this.touchJump = true;
      }
    });
    canvas.addEventListener('mouseup', () => {
      this.touchLeft = false; this.touchRight = false; this.touchJump = false;
    });
  }

  _handleTouch(touches) {
    this.touchLeft = false; this.touchRight = false; this.touchJump = false;
    const rect = this.canvas.getBoundingClientRect();
    for (const t of touches) {
      const rx = (t.clientX - rect.left) / rect.width;
      const ry = (t.clientY - rect.top) / rect.height;
      if (ry > 1 - FOOTER_PX / 640) {
        if (rx < 0.33) this.touchLeft = true;
        else if (rx > 0.67) this.touchRight = true;
        else this.touchJump = true;
      }
    }
  }

  startGame() {
    this.winStars = []; this.winTimer = 0; this.winPhase = 0;
    this.winScene = null; this.nam = null; this.particles = []; this.hearts = [];
    this.winTextAlpha = 0;
    this.generateWorld();
    this.initPlayer();
    this.state = 'playing';
    this.music.play().catch(() => {});
  }

  start() {
    let last = 0;
    const loop = ts => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ─── Update ──────────────────────────────────────────────────────

  update(dt) {
    this.frame++;
    if (this.state === 'start' || this.state === 'win' || this.state === 'gameover') return;
    if (this.state === 'ending') { this.updateEnding(dt); return; }
    this.updatePlayer(dt);
    this.updateCamera();
    this.updateMeteors(dt);
    this.updateParticles(dt);
    this.checkCollectibles();
  }

  updatePlayer(dt) {
    const p = this.player;
    const speed = 30;        // nhanh hơn → nhảy xa hơn
    const jumpPower = -90;   // cao hơn (~29 grid cells)
    const gravity = 150;     // vẫn nhanh rơi, cảm giác responsive
    const maxFall = 100;

    const left  = this.keys['ArrowLeft']  || this.keys['KeyA'] || this.touchLeft;
    const right = this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
    const jump  = this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchJump;

    if (left)       { p.vx = -speed; p.facing = -1; }
    else if (right) { p.vx =  speed; p.facing =  1; }
    else             { p.vx *= 0.75; }

    if (jump && !p.jumpLock && p.jumpsLeft > 0) {
      p.vy = jumpPower;
      p.onGround = false;
      p.jumpsLeft--;
      p.jumpLock = true;
      this._spawnJumpParticles(p.x + 4, p.y + 12);
    }
    if (!jump) p.jumpLock = false;

    p.vy = Math.min(p.vy + gravity * dt, maxFall);
    p.prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Wrap horizontally
    if (p.x < -2)       p.x = GW - 6;
    if (p.x > GW - 6)   p.x = -2;

    // Platform landing
    p.onGround = false;
    for (const plat of this.platforms) {
      if (p.x + 6 > plat.x && p.x + 1 < plat.x + plat.w) {
        const botNow  = p.y + 12;
        const botPrev = p.prevY + 12;
        if (botPrev <= plat.y + 0.5 && botNow >= plat.y) {
          p.y = plat.y - 12;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 2;
        }
      }
    }

    // Walk anim
    if (Math.abs(p.vx) > 1) {
      p.walkTimer++;
      if (p.walkTimer >= 8) { p.walkTimer = 0; p.walkFrame ^= 1; }
    } else { p.walkFrame = 0; }

    // Hit timer cooldown
    if (p.hitTimer > 0) p.hitTimer -= dt;

    // Fall off bottom
    if (p.y > WORLD_HEIGHT + 10) { p.y = WORLD_HEIGHT - 20; p.vy = 0; }
  }

  updateCamera() {
    const p = this.player;
    const target = p.y - VIEWPORT_GH * 0.55;
    this.camera += (target - this.camera) * 0.08;
    this.camera = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_GH, this.camera));
  }

  updateMeteors(dt) {
    const p = this.player;
    for (const m of this.meteors) {
      if (!m.active) continue;
      m.y += m.vy * dt;
      m.x += m.vx * dt;

      // Wrap off edges
      if (m.x < -4) m.x = GW + 4;
      if (m.x > GW + 4) m.x = -4;

      // Respawn if fallen too far below world
      if (m.y > WORLD_HEIGHT + 20) {
        m.y = -10;
        m.x = Math.random() * GW;
      }

      // Hit player
      if (m.y < WORLD_HEIGHT * 0.9 && p.hitTimer <= 0) {
        const dx = Math.abs(p.x + 3 - (m.x + 3));
        const dy = Math.abs(p.y + 6 - (m.y + 3));
        if (dx < 6 && dy < 6) {
          p.lives--;
          p.hitTimer = 1.5;
          this._spawnHitParticles(p.x + 3, p.y + 6);
          // Knock player back
          p.vx = (p.x > m.x ? 1 : -1) * 22;
          p.vy = -20;
          p.onGround = false;
          // Respawn meteor far above
          m.x = Math.random() * GW;
          m.y = this.camera - 20 - Math.random() * 20;
          if (p.lives <= 0) {
            this.state = 'gameover';
          }
        }
      }
    }
  }

  updateParticles(dt) {
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt;
      p.life -= dt;
    }
  }

  checkCollectibles() {
    const p = this.player;
    for (const c of this.collectibles) {
      if (c.collected) continue;
      c.bob += 0.05;
      if (Math.abs(p.x - c.x) < 8 && Math.abs(p.y - c.y) < 10) {
        c.collected = true;
        this.starsCollected++;
        this._spawnCollectParticles(c.x + 3, c.y + 3);
        if (this.starsCollected >= TOTAL_STARS) {
          this.state = 'ending';
          this.winTimer = 0;
          this.winPhase = 0;
          this._initWinStars();
        }
      }
    }
  }

  _initWinStars() {
    const p = this.player;
    this.winStars = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
      const angle = (i / TOTAL_STARS) * Math.PI * 2 - Math.PI / 2;
      this.winStars.push({
        x: p.x + 3,
        y: p.y + 14,
        tx: p.x + 3 + Math.cos(angle) * 12,
        ty: p.y + 4 + Math.sin(angle) * 12,
        phase: i * 0.4,
        size: 1,
      });
    }
  }

  updateEnding(dt) {
    this.winTimer += dt;
    this.updateParticles(dt);

    // Target: two characters standing side by side at screen center
    const centerX = GW / 2;
    const centerY = this.camera + VIEWPORT_GH / 2;

    if (this.winPhase === 0) {
      // Stars scatter and fade — short effect
      for (const s of this.winStars) {
        s.phase += dt * 2;
        s.x += (s.tx - s.x) * dt * 3;
        s.y += (s.ty - s.y) * dt * 3;
      }
      if (this.winTimer > 1.2) {
        this.winPhase = 1;
        const p = this.player;
        // Win scene: player walks to center, Nam appears beside
        this.winScene = {
          playerX:  p.x,
          playerY:  p.y,
          playerTX: centerX - 10,  // dịch trái thêm 6
          playerTY: centerY,
          namX:     centerX + 20,
          namTX:    centerX - 3,   // namTX = playerTX + 7
          namY:     centerY,
          namAlpha: 0,
          alpha: 1,
        };
      }
    } else if (this.winPhase === 1) {
      const ws = this.winScene;
      // Slide player toward target
      ws.playerX += (ws.playerTX - ws.playerX) * dt * 3;
      ws.playerY += (ws.playerTY - ws.playerY) * dt * 3;
      // Slide Nam in from side
      ws.namX += (ws.namTX - ws.namX) * dt * 3;
      ws.namAlpha = Math.min(1, ws.namAlpha + dt * 2);

      const arrived =
        Math.abs(ws.playerX - ws.playerTX) < 0.5 &&
        Math.abs(ws.namX - ws.namTX) < 0.5;
      if (arrived && this.winTimer > 3.0) {
        this.winPhase = 2;
      }
    } else if (this.winPhase === 2) {
      this.winTextAlpha = Math.min(1, this.winTextAlpha + dt * 0.4);
    }
  }

  // ─── Particles ───────────────────────────────────────────────────

  _spawnJumpParticles(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 20,
        vy: 5 + Math.random() * 8, life: 0.3, color: '#4466ff',
      });
    }
  }

  _spawnCollectParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      this.particles.push({
        x, y, vx: Math.cos(a) * (14 + Math.random() * 10),
        vy: Math.sin(a) * (14 + Math.random() * 10),
        life: 0.6, color: ['#ffff88','#ffffff','#aaaaff'][i % 3],
      });
    }
  }

  _spawnHitParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.particles.push({
        x, y, vx: Math.cos(a) * 20, vy: Math.sin(a) * 20 - 10,
        life: 0.5, color: ['#ff4400','#ffaa00','#ffffff'][i % 3],
      });
    }
  }

  _spawnWinParticles() {
    if (!this.winScene) return;
    const ws = this.winScene;
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const cx = (ws.playerX + ws.namX) / 2 + 4;
      this.particles.push({
        x: cx, y: ws.playerY,
        vx: Math.cos(a) * (18 + Math.random() * 18),
        vy: Math.sin(a) * (18 + Math.random() * 18) - 15,
        life: 1.8,
        color: ['#ffff88','#ffffff','#ffaaff','#88ffff'][i % 4],
      });
    }
  }

  // ─── Draw ────────────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    if (this.state === 'start')    { this.drawStartScreen(); return; }
    if (this.state === 'gameover') { this.drawGameOver();    return; }

    this.drawBackground();
    this.drawPlatforms();
    this.drawMeteors();
    this.drawCollectibles();
    this.drawParticles();

    if (this.state === 'ending' && this.winScene) {
      this.drawWinScene();
    } else {
      this.drawPlayer();
    }

    if (this.state === 'ending') {
      if (this.winPhase === 0) this.drawWinStars();
      if (this.winPhase >= 2)  this.drawWinText();
    }

    this.drawHUD();
    this.drawFooter();
  }

  drawHUD() {
    const ctx = this.ctx;
    const lives = this.player ? this.player.lives : 0;
    // Lives: tiny pixel hearts top-left
    ctx.fillStyle = 'rgba(0,6,24,0.65)';
    ctx.fillRect(0, 0, 62, 20);
    for (let i = 0; i < MAX_LIVES; i++) {
      const color = i < lives ? '#ff5588' : '#331133';
      ctx.fillStyle = color;
      const hx = (3 + i * 12) * PIXEL_SIZE;
      const hy = 3 * PIXEL_SIZE;
      const p = PIXEL_SIZE;
      // pixel heart shape (5x4)
      ctx.fillRect(hx + p,     hy,         p, p);
      ctx.fillRect(hx + 3 * p, hy,         p, p);
      ctx.fillRect(hx,         hy + p,     5 * p, p);
      ctx.fillRect(hx + p,     hy + 2 * p, 3 * p, p);
      ctx.fillRect(hx + 2 * p, hy + 3 * p, p, p);
    }
  }

  drawGameOver() {
    const ctx = this.ctx;
    const viewH = this.H - FOOTER_PX;
    // Dark bg
    const grad = ctx.createLinearGradient(0, 0, 0, viewH);
    grad.addColorStop(0, '#000510'); grad.addColorStop(1, '#001540');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, viewH);
    // Stars flicker
    for (const s of this.bgStars) {
      if (s.y > VIEWPORT_GH) continue;
      const tw = Math.sin(this.frame * s.speed + s.twinkle);
      ctx.globalAlpha = 0.3 + 0.4 * ((tw + 1) / 2);
      ctx.fillStyle = '#6688aa';
      ctx.fillRect(Math.floor(s.x) * PIXEL_SIZE, Math.floor(s.y) * PIXEL_SIZE, s.size * PIXEL_SIZE, s.size * PIXEL_SIZE);
    }
    ctx.globalAlpha = 1;

    const g1 = 'GAME OVER';
    const g2 = `NHAT DUOC ${this.starsCollected}/${TOTAL_STARS} SAO`;
    const g3 = 'CHAM DE THU LAI';
    drawTextPx(ctx, g1, Math.round((this.W - textWidthPx(g1, 2)) / 2), 60 * PIXEL_SIZE, '#ff4466', 2);
    drawTextPx(ctx, g2, Math.round((this.W - textWidthPx(g2)) / 2), 92 * PIXEL_SIZE, '#aabbcc');
    const blink = this.frame % 60 < 40 ? '#ffffff' : '#334466';
    drawTextPx(ctx, g3, Math.round((this.W - textWidthPx(g3)) / 2), 110 * PIXEL_SIZE, blink);

    this.drawFooter();
  }

  drawBackground() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    const viewH = this.H - FOOTER_PX;

    const grad = ctx.createLinearGradient(0, 0, 0, viewH);
    grad.addColorStop(0, '#000510');
    grad.addColorStop(0.5, '#001030');
    grad.addColorStop(1, '#002060');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, viewH);

    for (const s of this.bgStars) {
      const sy = s.y - cam;
      if (sy < -4 || sy > VIEWPORT_GH + 4) continue;
      const tw = Math.sin(this.frame * s.speed + s.twinkle);
      const alpha = 0.4 + 0.6 * ((tw + 1) / 2);
      ctx.globalAlpha = alpha;
      const br = Math.floor(180 + 75 * ((tw + 1) / 2));
      ctx.fillStyle = `rgb(${br},${br},${Math.floor(200 + 55 * ((tw + 1) / 2))})`;
      ctx.fillRect(Math.floor(s.x) * PIXEL_SIZE, Math.floor(sy) * PIXEL_SIZE, s.size * PIXEL_SIZE, s.size * PIXEL_SIZE);
    }
    ctx.globalAlpha = 1;
  }

  drawPlatforms() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    for (const p of this.platforms) {
      const sy = p.y - cam;
      if (sy + p.h < 0 || sy > VIEWPORT_GH) continue;
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(p.x * PIXEL_SIZE, sy * PIXEL_SIZE, p.w * PIXEL_SIZE, PIXEL_SIZE);
      ctx.fillStyle = '#1133aa';
      ctx.fillRect(p.x * PIXEL_SIZE, (sy + 1) * PIXEL_SIZE, p.w * PIXEL_SIZE, (p.h - 1) * PIXEL_SIZE);
      ctx.fillStyle = '#001155';
      ctx.fillRect(p.x * PIXEL_SIZE, (sy + p.h - 1) * PIXEL_SIZE, p.w * PIXEL_SIZE, PIXEL_SIZE);
    }
  }

  drawMeteors() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    for (const m of this.meteors) {
      if (!m.active) continue;
      const sy = m.y - cam;
      if (sy < -8 || sy > VIEWPORT_GH + 8) continue;
      drawSprite(ctx, METEOR_SPRITE, m.x, sy, { '#': '#ccddee', '@': '#889aaa' });
    }
  }

  drawCollectibles() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    for (const c of this.collectibles) {
      if (c.collected) continue;
      const sy = c.y - cam + Math.sin(c.bob) * 1.5;
      if (sy < -8 || sy > VIEWPORT_GH + 8) continue;
      const color = STAR_COLORS[c.starIndex % STAR_COLORS.length];
      const glow = (Math.sin(c.bob) + 1) / 2;
      ctx.globalAlpha = 0.22 + 0.28 * glow;
      ctx.fillStyle = color;
      ctx.fillRect((c.x - 1) * PIXEL_SIZE, (sy - 1) * PIXEL_SIZE, 9 * PIXEL_SIZE, 9 * PIXEL_SIZE);
      ctx.globalAlpha = 1;
      drawSprite(ctx, STAR_SPRITE, c.x, sy, { '*': color, '#': '#ffffff' });
    }
  }

  drawPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    const cam = Math.floor(this.camera);
    const sy = p.y - cam;

    // Flash red when hit
    if (p.hitTimer > 0 && Math.floor(p.hitTimer * 8) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    let sprite = PLAYER_IDLE;
    if (p.onGround && Math.abs(p.vx) > 1)
      sprite = p.walkFrame === 0 ? PLAYER_WALK1 : PLAYER_WALK2;

    const palette = { '#': '#ffffff', '@': '#88aaff', '~': '#4466ff' };
    if (p.facing < 0) {
      ctx.save();
      ctx.scale(-1, 1); ctx.translate(-this.W, 0);
      drawSprite(ctx, sprite, GW - p.x - 7, sy, palette);
      ctx.restore();
    } else {
      drawSprite(ctx, sprite, p.x, sy, palette);
    }
    ctx.globalAlpha = 1;
  }

  drawWinStars() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    for (const s of this.winStars) {
      const sy = s.y - cam;
      const glow = (Math.sin(s.phase * 3) + 1) / 2;
      ctx.globalAlpha = 0.5 + 0.5 * glow;
      ctx.fillStyle = '#ffff88';
      ctx.fillRect(Math.round(s.x) * PIXEL_SIZE, Math.round(sy) * PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE * 2);
    }
    ctx.globalAlpha = 1;
  }

  drawWinScene() {
    const ctx = this.ctx;
    const ws = this.winScene;
    const cam = Math.floor(this.camera);

    // Player — facing right toward Nam
    drawSprite(ctx, PLAYER_HOLD, ws.playerX, ws.playerY - cam,
      { '#': '#ffffff', '@': '#88aaff', '~': '#4466ff' });

    // Nam — vẽ thẳng (tay trái duỗi sang trái hướng về player)
    ctx.globalAlpha = ws.namAlpha;
    drawSprite(ctx, NAM_HOLD, ws.namX, ws.namY - cam,
      { '#': '#ffffff', '*': '#ffdd88', '~': '#ff88aa' });
    ctx.globalAlpha = 1;
  }

  drawWinText() {
    const ctx = this.ctx;
    const lines = [
      'CO NHUNG NGUOI',
      'XUAT HIEN NHU',
      'CA BAU TROI',
      'DAY SAO',
    ];

    const lineH = 8 * PIXEL_SIZE;
    const totalH = lines.length * lineH;
    // Position text in the upper-center of the viewport, above the characters
    const viewH = this.H - FOOTER_PX;
    const textTopPx = Math.round(viewH * 0.28 - totalH / 2);

    ctx.globalAlpha = this.winTextAlpha;
    // Subtle dark strip behind text only
    ctx.fillStyle = 'rgba(0,0,18,0.6)';
    ctx.fillRect(0, textTopPx - 6, this.W, totalH + 12);

    const sparkle = (Math.sin(this.frame * 0.05) + 1) / 2;
    const br = Math.floor(200 + 55 * sparkle);
    const color = `rgb(${br},${br},255)`;

    for (let i = 0; i < lines.length; i++) {
      const tw = textWidthPx(lines[i]);
      const tx = Math.round((this.W - tw) / 2);
      drawTextPx(ctx, lines[i], tx, textTopPx + i * lineH, color);
    }
    ctx.globalAlpha = 1;
  }

  drawParticles() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x) * PIXEL_SIZE, Math.floor(p.y - cam) * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
    ctx.globalAlpha = 1;
  }

  drawFooter() {
    const ctx = this.ctx;
    const fy = this.H - FOOTER_PX;

    ctx.fillStyle = '#000c24';
    ctx.fillRect(0, fy, this.W, FOOTER_PX);
    ctx.fillStyle = '#1144aa';
    ctx.fillRect(0, fy, this.W, 2);

    // ── Inventory — 5 slots centered ──
    const slotSize = 34;
    const slotGap = 10;
    const totalSlotW = TOTAL_STARS * slotSize + (TOTAL_STARS - 1) * slotGap;
    const invX = Math.round((this.W - totalSlotW) / 2);
    const invY = fy + 8;
    const starPx = 3 * PIXEL_SIZE; // 12 canvas px

    for (let i = 0; i < TOTAL_STARS; i++) {
      const sx = invX + i * (slotSize + slotGap);
      const collected = i < this.starsCollected;

      ctx.fillStyle = collected ? 'rgba(20,40,110,0.95)' : 'rgba(8,12,38,0.95)';
      ctx.strokeStyle = collected ? STAR_COLORS[i] : '#1c2e66';
      ctx.lineWidth = 2;
      this._roundRect(ctx, sx, invY, slotSize, slotSize, 7);
      ctx.fill(); ctx.stroke();

      const offX = Math.round((slotSize - starPx) / 2);
      const offY = Math.round((slotSize - starPx) / 2);
      if (collected) {
        const pulse = (Math.sin(this.frame * 0.06 + i * 1.1) + 1) / 2;
        ctx.globalAlpha = 0.7 + 0.3 * pulse;
        drawSpritePx(ctx, MINI_STAR, sx + offX, invY + offY, { '*': STAR_COLORS[i] });
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.25;
        drawSpritePx(ctx, MINI_STAR, sx + offX, invY + offY, { '*': '#8899bb' });
        ctx.globalAlpha = 1;
      }
    }

    // ── 3 circular control buttons ──
    const btnR = 28;
    const btnCY = fy + 64 + btnR;
    const btnCXs = [this.W / 4, this.W / 2, (this.W * 3) / 4];
    const cfgs = [
      { active: this.touchLeft,  dir: 'left',  ac: 'rgba(80,130,255,0.6)',  ic: 'rgba(30,60,160,0.35)', as: '#88aaff', is: 'rgba(60,100,220,0.6)' },
      { active: this.touchJump,  dir: 'up',    ac: 'rgba(60,200,255,0.6)',  ic: 'rgba(20,100,180,0.35)',as: '#66ddff', is: 'rgba(40,160,220,0.6)' },
      { active: this.touchRight, dir: 'right', ac: 'rgba(80,130,255,0.6)',  ic: 'rgba(30,60,160,0.35)', as: '#88aaff', is: 'rgba(60,100,220,0.6)' },
    ];
    for (const { active, dir, ac, ic, as, is } of cfgs) {
      const cx = btnCXs[cfgs.indexOf(cfgs.find(c => c.dir === dir))];
      const cy = btnCY;
      if (active) {
        ctx.beginPath(); ctx.arc(cx, cy, btnR + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,180,255,0.12)'; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, btnR, 0, Math.PI * 2);
      ctx.fillStyle = active ? ac : ic; ctx.fill();
      ctx.strokeStyle = active ? as : is;
      ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke();
      ctx.fillStyle = active ? '#ffffff' : 'rgba(160,200,255,0.85)';
      this._drawArrow(ctx, cx, cy, dir);
    }
  }

  drawStartScreen() {
    const ctx = this.ctx;
    const viewH = this.H - FOOTER_PX;
    const grad = ctx.createLinearGradient(0, 0, 0, viewH);
    grad.addColorStop(0, '#000510'); grad.addColorStop(1, '#001540');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, viewH);

    for (const s of this.bgStars) {
      if (s.y > VIEWPORT_GH) continue;
      const tw = Math.sin(this.frame * s.speed + s.twinkle);
      ctx.globalAlpha = 0.4 + 0.6 * ((tw + 1) / 2);
      ctx.fillStyle = '#aaccff';
      ctx.fillRect(Math.floor(s.x) * PIXEL_SIZE, Math.floor(s.y) * PIXEL_SIZE, s.size * PIXEL_SIZE, s.size * PIXEL_SIZE);
    }
    ctx.globalAlpha = 1;

    const sparkle = (Math.sin(this.frame * 0.04) + 1) / 2;
    const tc = `rgb(${Math.floor(180 + 75 * sparkle)},${Math.floor(180 + 75 * sparkle)},255)`;
    const title = 'BAU TROI';
    drawTextPx(ctx, title, Math.round((this.W - textWidthPx(title, 2)) / 2), 28 * PIXEL_SIZE, tc, 2);

    drawSprite(ctx, PLAYER_IDLE, GW / 2 - 4, 62, { '#': '#ffffff', '@': '#88aaff', '~': '#4466ff' });

    for (let i = 0; i < 5; i++) {
      const bY = 80 + Math.sin(this.frame * 0.03 + i) * 2;
      drawSprite(ctx, MINI_STAR, 8 + i * 16, bY, { '*': STAR_COLORS[i] });
    }

    const l1 = 'NHAT 5 NGOI SAO';
    const l2 = 'DE GAP NAM';
    const l3 = 'CHAM DE BAT DAU';
    drawTextPx(ctx, l1, Math.round((this.W - textWidthPx(l1)) / 2), 96  * PIXEL_SIZE, '#88aaff');
    drawTextPx(ctx, l2, Math.round((this.W - textWidthPx(l2)) / 2), 108 * PIXEL_SIZE, '#88aaff');
    const blink = this.frame % 60 < 40 ? '#ffffff' : '#334466';
    drawTextPx(ctx, l3, Math.round((this.W - textWidthPx(l3)) / 2), 130 * PIXEL_SIZE, blink);

    this.drawFooter();
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _drawArrow(ctx, cx, cy, dir) {
    const s = 14;
    ctx.beginPath();
    if (dir === 'left') {
      ctx.moveTo(cx + s, cy - s * 0.6); ctx.lineTo(cx - s * 0.6, cy); ctx.lineTo(cx + s, cy + s * 0.6);
    } else if (dir === 'right') {
      ctx.moveTo(cx - s, cy - s * 0.6); ctx.lineTo(cx + s * 0.6, cy); ctx.lineTo(cx - s, cy + s * 0.6);
    } else {
      ctx.moveTo(cx - s * 0.6, cy + s * 0.4); ctx.lineTo(cx, cy - s * 0.8); ctx.lineTo(cx + s * 0.6, cy + s * 0.4);
    }
    ctx.closePath(); ctx.fill();
  }
}
