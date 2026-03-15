import { MoleState } from './MoleState.js';
import { MOLE_VISIBLE_MS, MOLE_RETREAT_MS, DEATH_DURATION_MS, POINTS_PER_MOLE } from './constants.js';

export class Mole {
  constructor(holeElement, { onKill, isGameRunning }) {
    this.holeElement     = holeElement;
    this.element         = holeElement.querySelector('.mole');
    this.state           = MoleState.IDLE;
    this.timerId         = null;
    this._retreatTimerId = null;
    this._onKill         = onKill;
    this._isGameRunning  = isGameRunning;

    this._boundHandleClick   = this._handleClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
  }

  activate({ onExpire }) {
    if (this.state !== MoleState.IDLE) return;

    this.state = MoleState.ACTIVE;
    this.element.classList.add('mole--active');
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');
    this.element.removeAttribute('aria-hidden');
    this.element.addEventListener('click',   this._boundHandleClick);
    this.element.addEventListener('keydown', this._boundHandleKeydown);

    this.timerId = setTimeout(() => {
      if (this.state !== MoleState.ACTIVE) return;
      this._retreat(onExpire);
    }, MOLE_VISIBLE_MS);
  }

  _retreat(callback) {
    this.state = MoleState.RETREATING;
    this._cleanupListeners();
    this.element.classList.remove('mole--active');
    this.element.classList.add('mole--retreating');

    this._retreatTimerId = setTimeout(() => {
      this._retreatTimerId = null;
      if (this.state === MoleState.RETREATING) {
        this._resetToIdle();
        callback?.();
      }
    }, MOLE_RETREAT_MS);
  }

  _handleClick(e) {
    e.stopPropagation();
    if (!this._isGameRunning()) return;
    if (this.state !== MoleState.ACTIVE) return;
    this._kill();
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e);
    }
  }

  _kill() {
    this.state = MoleState.DEAD;
    clearTimeout(this.timerId);
    this.timerId = null;
    this._cleanupListeners();
    this._onKill(POINTS_PER_MOLE);
    this.element.classList.remove('mole--active');
    this.element.classList.add('mole--dead');
    this.element.removeAttribute('role');
    this.element.removeAttribute('tabindex');

    this.timerId = setTimeout(() => {
      if (this.state === MoleState.DEAD) {
        this._resetToIdle();
      }
    }, DEATH_DURATION_MS);
  }

  _cleanupListeners() {
    this.element.removeEventListener('click',   this._boundHandleClick);
    this.element.removeEventListener('keydown', this._boundHandleKeydown);
  }

  _resetToIdle() {
    this.state = MoleState.IDLE;
    this.element.classList.remove('mole--active', 'mole--dead', 'mole--retreating');
    this.element.removeAttribute('role');
    this.element.removeAttribute('tabindex');
    this.element.setAttribute('aria-hidden', 'true');
    this.timerId = null;
  }

  reset() {
    clearTimeout(this.timerId);
    clearTimeout(this._retreatTimerId);
    this.timerId = null;
    this._retreatTimerId = null;
    this._cleanupListeners();
    this._resetToIdle();
  }
}
