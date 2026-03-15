import { Board } from './Board.js';
import { ScoreDisplay } from './ScoreDisplay.js';
import { SPAWN_INTERVAL_MS } from './constants.js';

export class Game {
  constructor({ boardEl, scoreEl, startBtn, pauseBtn }) {
    this._running  = false;
    this._paused   = false;
    this._spawnId  = null;
    this._score    = new ScoreDisplay(scoreEl);
    this._board    = new Board(boardEl, {
      onKill:        (pts) => this._score.add(pts),
      isGameRunning: ()    => this._running && !this._paused,
    });
    this._startBtn = startBtn;
    this._pauseBtn = pauseBtn;

    startBtn.addEventListener('click', () => this.start());
    pauseBtn.addEventListener('click', () => this.togglePause());
  }

  start() {
    if (this._running) return;
    this._running  = true;
    this._paused   = false;
    this._score.reset();
    this._startBtn.disabled = true;
    this._pauseBtn.disabled = false;
    this._spawnId  = setInterval(() => this._board.spawnOne(), SPAWN_INTERVAL_MS);
  }

  togglePause() {
    if (!this._running) return;
    this._paused = !this._paused;
    this._pauseBtn.textContent = this._paused ? 'Resume' : 'Pause';
    if (this._paused) {
      clearInterval(this._spawnId);
      this._spawnId = null;
    } else {
      this._spawnId = setInterval(() => this._board.spawnOne(), SPAWN_INTERVAL_MS);
    }
  }

  gameOver() {
    this._running = false;
    clearInterval(this._spawnId);
    this._spawnId = null;
    this._board.resetAll();
    this._startBtn.disabled = false;
    this._pauseBtn.disabled = true;
    this._pauseBtn.textContent = 'Pause';
  }
}
