import { DEATH_DURATION_MS } from './constants.js';
import { Game } from './game.js';

document.documentElement.style.setProperty('--death-duration', `${DEATH_DURATION_MS}ms`);

document.addEventListener('DOMContentLoaded', () => {
  const boardEl  = document.getElementById('board');
  const scoreEl  = document.getElementById('score-value');
  const startBtn = document.getElementById('btn-start');
  const pauseBtn = document.getElementById('btn-pause');

  if (!boardEl || !scoreEl || !startBtn || !pauseBtn) {
    console.error('Mole Smasher: required DOM elements not found');
    return;
  }

  new Game({ boardEl, scoreEl, startBtn, pauseBtn });
});
