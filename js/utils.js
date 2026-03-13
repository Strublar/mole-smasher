/**
 * utils.js
 * Shared utility functions for Mole Smasher
 * 
 * Provides common helper functions used across the game engine,
 * timer system, and spawning system to avoid code duplication.
 * 
 * Functions include time utilities, math helpers, and collision detection.
 * 
 * @module utils
 */

const GameUtils = (() => {
  // =========================================================================
  // TIME UTILITIES
  // =========================================================================

  /**
   * Get current time in milliseconds using high-resolution timer
   * Prefers performance.now() for consistency, falls back to Date.now()
   * 
   * @returns {number} Current time in milliseconds
   */
  const getCurrentTime = () => {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  };

  /**
   * Clamp a value between min and max boundaries
   * Ensures value stays within safe bounds
   * 
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum boundary (inclusive)
   * @param {number} max - Maximum boundary (inclusive)
   * @returns {number} Clamped value
   */
  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  /**
   * Linear interpolation between two values
   * Smoothly transitions from start to end based on progress
   * 
   * @param {number} start - Starting value
   * @param {number} end - Ending value
   * @param {number} progress - Progress from 0 to 1
   * @returns {number} Interpolated value
   */
  const lerp = (start, end, progress) => {
    return start + (end - start) * progress;
  };

  // =========================================================================
  // MATH UTILITIES
  // =========================================================================

  /**
   * Generate random integer between min and max (inclusive)
   * Uses Math.random() for uniform distribution
   * 
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer in range
   */
  const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Check if two circles collide
   * Calculates distance between centers and compares with sum of radii
   * 
   * @param {number} x1 - X coordinate of first circle center
   * @param {number} y1 - Y coordinate of first circle center
   * @param {number} r1 - Radius of first circle
   * @param {number} x2 - X coordinate of second circle center
   * @param {number} y2 - Y coordinate of second circle center
   * @param {number} r2 - Radius of second circle
   * @returns {boolean} True if circles overlap
   */
  const checkCircleCollision = (x1, y1, r1, x2, y2, r2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    return distanceSquared < radiusSum * radiusSum;
  };

  // =========================================================================
  // RETURN PUBLIC API
  // =========================================================================

  return {
    getCurrentTime,
    clamp,
    lerp,
    randomInt,
    checkCircleCollision
  };
})();
