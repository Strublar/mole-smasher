/**
 * mole.js
 * Mole object and animation system for Mole Smasher
 * 
 * Manages individual mole state, animations, and rendering.
 * Implements state machine (HIDDEN → APPEARING → VISIBLE → DISAPPEARING)
 * with smooth animations and collision detection.
 * 
 * @module mole
 */

class Mole {
  /**
   * Mole state constants
   * Define lifecycle states for a mole
   */
  static STATES = {
    HIDDEN: 'hidden',
    APPEARING: 'appearing',
    VISIBLE: 'visible',
    DISAPPEARING: 'disappearing'
  };

  /**
   * Mole animation timing (in milliseconds)
   * Defines duration of each state phase
   */
  static TIMINGS = {
    APPEARING_DURATION: 200,      // Time to pop up
    VISIBLE_DURATION: 1000,       // Time visible and smashable
    DISAPPEARING_DURATION: 200,   // Time to pop down
    TOTAL_DURATION: 1400          // Total lifetime: 200 + 1000 + 200
  };

  /**
   * Initialize a Mole at a given hole position
   * Mole starts in HIDDEN state and will transition when spawned
   * 
   * @param {number} x - X coordinate of hole center
   * @param {number} y - Y coordinate of hole center
   * @param {number} radius - Radius of the hole (for hit detection)
   */
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.moleRadius = radius - 5; // Slightly smaller than hole for visuals

    // State management
    this.state = Mole.STATES.HIDDEN;
    this.spawnTime = null;
    this.animationProgress = 0; // 0 = start, 1 = end of current state

    // Rendering
    this.image = null;
    this.imageLoaded = false;

    // Initialize image loading
    this._loadImage();
  }

  /**
   * Load mole image from assets
   * Attempts to load PNG image; falls back to canvas rendering if load fails
   * 
   * @private
   */
  _loadImage() {
    const image = new Image();
    const self = this;

    image.onload = function() {
      self.image = image;
      self.imageLoaded = true;
      console.log('Mole image loaded successfully');
    };

    image.onerror = function() {
      console.warn('Failed to load mole image, falling back to canvas rendering');
      self.imageLoaded = false;
    };

    // Attempt to load mole PNG
    image.src = 'assets/images/mole.png';
  }

  /**
   * Spawn the mole at current time
   * Transitions from HIDDEN to APPEARING state
   * 
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  spawn(currentTime) {
    this.spawnTime = currentTime;
    this.state = Mole.STATES.APPEARING;
  }

  /**
   * Update mole state and animation
   * Called each frame to progress the mole through its lifecycle
   * 
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {boolean} True if mole is still active, false if despawned
   */
  update(currentTime) {
    if (this.state === Mole.STATES.HIDDEN || this.spawnTime === null) {
      return true; // Still exists, just hidden
    }

    const elapsedTime = currentTime - this.spawnTime;

    // Determine current state based on elapsed time
    if (elapsedTime < Mole.TIMINGS.APPEARING_DURATION) {
      // APPEARING: 0 - 200ms
      this.state = Mole.STATES.APPEARING;
      this.animationProgress = elapsedTime / Mole.TIMINGS.APPEARING_DURATION;
    } else if (elapsedTime < Mole.TIMINGS.APPEARING_DURATION + Mole.TIMINGS.VISIBLE_DURATION) {
      // VISIBLE: 200ms - 1200ms
      this.state = Mole.STATES.VISIBLE;
      this.animationProgress = 1; // Fully visible
    } else if (elapsedTime < Mole.TIMINGS.TOTAL_DURATION) {
      // DISAPPEARING: 1200ms - 1400ms
      this.state = Mole.STATES.DISAPPEARING;
      const disappearingElapsed = elapsedTime - (Mole.TIMINGS.APPEARING_DURATION + Mole.TIMINGS.VISIBLE_DURATION);
      this.animationProgress = 1 - (disappearingElapsed / Mole.TIMINGS.DISAPPEARING_DURATION);
    } else {
      // Mole lifetime expired - should be removed
      return false;
    }

    return true;
  }

  /**
   * Check if a click/tap hit this mole
   * Only returns true for moles in VISIBLE state
   * Uses circle collision detection based on animation offset
   * 
   * @param {number} clickX - X coordinate of click/tap
   * @param {number} clickY - Y coordinate of click/tap
   * @returns {boolean} True if click hit this mole and mole is smashable
   */
  isHit(clickX, clickY) {
    // Only visible moles can be smashed
    if (this.state !== Mole.STATES.VISIBLE) {
      return false;
    }

    // Calculate mole's current Y position accounting for animation
    const displayY = this._getDisplayY();

    // Distance from click to mole center
    const distX = clickX - this.x;
    const distY = clickY - displayY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // Hit detection: click within mole radius
    return distance <= this.moleRadius;
  }

  /**
   * Get the current display Y position with animation offset
   * During APPEARING and DISAPPEARING states, mole moves vertically
   * 
   * @private
   * @returns {number} Y coordinate for rendering the mole
   */
  _getDisplayY() {
    if (this.state === Mole.STATES.HIDDEN) {
      return this.y + this.radius; // Below ground
    }

    // Calculate vertical offset based on animation progress
    const maxOffset = this.radius * 1.5; // How far up the mole travels

    if (this.state === Mole.STATES.APPEARING) {
      // Pop up: progress from 0 to 1
      // animationProgress goes from 0 to 1, so offset should go from maxOffset to 0
      return this.y + (1 - this.animationProgress) * maxOffset;
    } else if (this.state === Mole.STATES.VISIBLE) {
      // Fully visible: at top position
      return this.y - this.moleRadius;
    } else if (this.state === Mole.STATES.DISAPPEARING) {
      // Pop down: progress from 1 to 0
      // animationProgress goes from 1 to 0, so mole stays above ground
      // Use Math.max to ensure mole doesn't go below ground level
      const offset = Math.max(0, this.animationProgress * maxOffset);
      return this.y + offset;
    }

    return this.y;
  }

  /**
   * Get animation scale factor for visual effect
   * Mole scales slightly during appearing/disappearing phases
   * 
   * @private
   * @returns {number} Scale factor (1.0 = normal size)
   */
  _getAnimationScale() {
    if (this.state === Mole.STATES.VISIBLE) {
      return 1.0;
    }

    // Slight scale reduction during appearing/disappearing
    const minScale = 0.7;
    return minScale + (this.animationProgress * (1.0 - minScale));
  }

  /**
   * Render the mole to canvas
   * Draws mole head as a circle with animation-based positioning
   * Uses canvas fallback if image failed to load
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   */
  render(ctx) {
    if (this.state === Mole.STATES.HIDDEN) {
      return; // Don't render hidden moles
    }

    const displayY = this._getDisplayY();
    const scale = this._getAnimationScale();
    const scaledRadius = this.moleRadius * scale;

    // If image is loaded, draw it; otherwise use canvas fallback
    if (this.imageLoaded && this.image) {
      this._renderMoleImage(ctx, displayY, scaledRadius);
    } else {
      this._renderMoleCanvas(ctx, displayY, scaledRadius);
    }
  }

  /**
   * Render mole using loaded image
   * Draws mole sprite centered at position with animation scaling
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   * @param {number} displayY - Y coordinate for rendering
   * @param {number} scaledRadius - Current mole radius with animation scaling
   */
  _renderMoleImage(ctx, displayY, scaledRadius) {
    const diameter = scaledRadius * 2;

    // Save context state for transformation
    ctx.save();

    // Draw image centered at mole position
    ctx.drawImage(
      this.image,
      this.x - scaledRadius,
      displayY - scaledRadius,
      diameter,
      diameter
    );

    // Restore context state
    ctx.restore();
  }

  /**
   * Render mole using canvas 2D drawing
   * Fallback rendering when image fails to load
   * Draws mole head as brown circle with eyes
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   * @param {number} displayY - Y coordinate for rendering
   * @param {number} scaledRadius - Current mole radius with animation scaling
   */
  _renderMoleCanvas(ctx, displayY, scaledRadius) {
    // Draw mole head (brown circle)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(this.x, displayY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw mole outline
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw eyes
    this._renderMoleEyes(ctx, this.x, displayY, scaledRadius);
  }

  /**
   * Render mole eyes for visual detail
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   * @param {number} centerX - Mole center X coordinate
   * @param {number} centerY - Mole center Y coordinate
   * @param {number} scaledRadius - Current mole radius with animation scaling
   */
  _renderMoleEyes(ctx, centerX, centerY, scaledRadius) {
    const eyeRadius = scaledRadius * 0.15;
    const eyeDistance = scaledRadius * 0.35;
    const eyeY = centerY - scaledRadius * 0.2;

    // Left eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - eyeDistance, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeDistance, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Left eye shine (pupil)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - eyeDistance + eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Right eye shine (pupil)
    ctx.beginPath();
    ctx.arc(centerX + eyeDistance + eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
