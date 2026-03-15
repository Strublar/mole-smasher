export class ScoreDisplay {
  constructor(element) {
    this._el    = element;
    this._score = 0;
  }

  add(points) {
    this._score += points;
    this._el.textContent = this._score;
  }

  reset() {
    this._score = 0;
    this._el.textContent = '0';
  }

  get value() { return this._score; }
}
