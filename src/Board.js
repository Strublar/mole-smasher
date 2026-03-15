import { Mole } from './Mole.js';
import { MoleState } from './MoleState.js';
import { HOLE_COUNT } from './constants.js';

export class Board {
  constructor(containerEl, { onKill, isGameRunning }) {
    this._moles = Array.from({ length: HOLE_COUNT }, () => {
      const hole = document.createElement('div');
      hole.className = 'hole';
      hole.innerHTML = '<div class="mole" aria-hidden="true"></div>';
      containerEl.appendChild(hole);
      return new Mole(hole, { onKill, isGameRunning });
    });
  }

  spawnOne() {
    const idle = this._moles.filter(m => m.state === MoleState.IDLE);
    if (!idle.length) return;
    const mole = idle[Math.floor(Math.random() * idle.length)];
    mole.activate({ onExpire: () => {} });
  }

  resetAll() {
    this._moles.forEach(m => m.reset());
  }
}
