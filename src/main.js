import { Game } from './game.js';

const app = document.getElementById('app');
const canvas = document.createElement('canvas');
app.appendChild(canvas);

const GAME_W = 360;
const GAME_H = 640;

function resize() {
  const scaleX = window.innerWidth / GAME_W;
  const scaleY = window.innerHeight / GAME_H;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = GAME_W * scale + 'px';
  canvas.style.height = GAME_H * scale + 'px';
}

canvas.width = GAME_W;
canvas.height = GAME_H;
resize();
window.addEventListener('resize', resize);

const game = new Game(canvas, GAME_W, GAME_H);
game.start();
