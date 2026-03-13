/**
 * grid.js
 * Grid management system for Mole Smasher
 * 
 * Manages a 3x3 grid of holes with calculated positions and sizes.
 * Provides methods to access hole positions and render the grid to canvas.
 * 
 * @module grid
 */

class Grid {
  /**
   * Initialize the Grid with hole positions based on canvas dimensions
   * Creates a 3x3 grid with equal spacing and margins
   * 
   * @param {number} canvasWidth - Width of the game canvas
   * @param {number} canvasHeight - Height of the game canvas
   * @param {number} numHoles - Total number of holes (default 9 for 3x3)
   * @throws {Error} If canvasWidth or canvasHeight are not positive numbers
   */
  constructor(canvasWidth, canvasHeight, numHoles = 9) {
    // Validate canvas dimensions
    if (typeof canvasWidth !== 'number' || canvasWidth <= 0) {
      throw new Error(`Invalid canvasWidth: must be a positive number, got ${canvasWidth}`);
    }
    if (typeof canvasHeight !== 'number' || canvasHeight <= 0) {
      throw new Error(`Invalid canvasHeight: must be a positive number, got ${canvasHeight}`);
    }

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.numHoles = numHoles;

    // Grid layout: 3x3
    this.cols = 3;
    this.rows = 3;

    // Calculate hole dimensions with proper spacing
    this.holeRadius = 35;

    // Margin from edges and spacing between holes
    const horizontalMargin = 60;
    const verticalMargin = 100;

    const availableWidth = canvasWidth - (2 * horizontalMargin);
    const availableHeight = canvasHeight - (2 * verticalMargin);

    // Calculate spacing between hole centers
    this.horizontalSpacing = availableWidth / (this.cols - 1);
    this.verticalSpacing = availableHeight / (this.rows - 1);

    // Starting position (top-left hole)
    this.startX = horizontalMargin;
    this.startY = verticalMargin;

    // Generate all hole positions
    this.holes = this._generateHoles();
  }

  /**
   * Generate positions for all holes in the grid
   * Uses row-major ordering (left-to-right, top-to-bottom)
   * 
   * @private
   * @returns {Array<Object>} Array of hole position objects {x, y, radius, index}
   */
  _generateHoles() {
    const holes = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const x = this.startX + (col * this.horizontalSpacing);
        const y = this.startY + (row * this.verticalSpacing);

        holes.push({
          index,
          x,
          y,
          radius: this.holeRadius
        });
      }
    }

    return holes;
  }

  /**
   * Get hole position object by index
   * 
   * @param {number} index - Index of the hole (0-8 for 3x3)
   * @returns {Object|null} Hole object with {x, y, radius, index} or null if invalid
   */
  getHoleAt(index) {
    if (index < 0 || index >= this.numHoles) {
      console.warn(`Invalid hole index: ${index}`);
      return null;
    }
    return this.holes[index];
  }

  /**
   * Get all hole positions
   * 
   * @returns {Array<Object>} Array of all hole position objects
   */
  getAllHoles() {
    return [...this.holes];
  }

  /**
   * Render all holes to the canvas
   * Draws each hole as a circle with a border to indicate ground/hole
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   */
  render(ctx) {
    this.holes.forEach((hole) => {
      this._renderHole(ctx, hole);
    });
  }

  /**
   * Render a single hole
   * Draws a circle with brown fill (hole) and darker border
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   * @param {Object} hole - Hole position object {x, y, radius}
   */
  _renderHole(ctx, hole) {
    // Draw hole background (brown circle)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw hole border (darker brown)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Optional: Add rim effect with lighter color
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius - 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}
