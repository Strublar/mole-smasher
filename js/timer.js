/**
 * timer.js
 * Timer and difficulty scaling system for Mole Smasher
 *
 * Manages game timing, tracks elapsed time, and calculates spawn intervals
 * based on game difficulty phases. Implements smooth interpolation between
 * difficulty levels rather than discrete jumps.
 *
 * Difficulty Progression:
 * - Early Game (0-20s):   Spawn interval decreases from 1500ms → 900ms
 * - Middle Game (20-40s): Spawn interval decreases from 900ms → 500ms
 * - Late Game (40-60s):   Spawn interval decreases from 500ms → 300ms (minimum)
 *
 * @module timer
 */

const TimerManager = (() => {
  // =========================================================================
  // PRIVATE VARIABLES - Timing State
  // =========================================================================

  let startTime = null;
  let isRunning = false;

  // Difficulty phase boundaries (in seconds)
  const PHASE_BREAKPOINTS = {
    EARLY_PHASE_END: 20,
    MIDDLE_PHASE_END: 40,
    LATE_PHASE_END: 60
  };

  // Spawn interval constraints (in milliseconds)
  const SPAWN_INTERVALS = {
    MAX_INTERVAL: 1500,    // Slowest spawn rate
    EARLY_MID_BOUNDARY: 900,
    MIDDLE_LATE_BOUNDARY: 500,
    MIN_INTERVAL: 300      // Fastest spawn rate (minimum 300ms for human reaction time)
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Difficulty Calculation
  // =========================================================================

  /**
   * Calculate spawn interval using linear interpolation based on elapsed time
   * Provides smooth difficulty curve rather than discrete jumps
   *
   * @param {number} elapsedSeconds - Time elapsed since game start
   * @returns {number} Spawn interval in milliseconds
   */
  const calculateSpawnIntervalSmooth = (elapsedSeconds) => {
    if (elapsedSeconds < PHASE_BREAKPOINTS.EARLY_PHASE_END) {
      // Early Game (0-20s): 1500ms → 900ms
      const phaseProgress = elapsedSeconds / PHASE_BREAKPOINTS.EARLY_PHASE_END;
      const intervalRange = SPAWN_INTERVALS.MAX_INTERVAL - SPAWN_INTERVALS.EARLY_MID_BOUNDARY;
      return SPAWN_INTERVALS.MAX_INTERVAL - (intervalRange * phaseProgress);
    } else if (elapsedSeconds < PHASE_BREAKPOINTS.MIDDLE_PHASE_END) {
      // Middle Game (20-40s): 900ms → 500ms
      const phaseElapsed = elapsedSeconds - PHASE_BREAKPOINTS.EARLY_PHASE_END;
      const phaseDuration = PHASE_BREAKPOINTS.MIDDLE_PHASE_END - PHASE_BREAKPOINTS.EARLY_PHASE_END;
      const phaseProgress = phaseElapsed / phaseDuration;
      const intervalRange = SPAWN_INTERVALS.EARLY_MID_BOUNDARY - SPAWN_INTERVALS.MIDDLE_LATE_BOUNDARY;
      return SPAWN_INTERVALS.EARLY_MID_BOUNDARY - (intervalRange * phaseProgress);
    } else {
      // Late Game (40-60s): 500ms → 300ms
      const phaseElapsed = elapsedSeconds - PHASE_BREAKPOINTS.MIDDLE_PHASE_END;
      const phaseDuration = PHASE_BREAKPOINTS.LATE_PHASE_END - PHASE_BREAKPOINTS.MIDDLE_PHASE_END;
      const phaseProgress = Math.min(1, phaseElapsed / phaseDuration);
      const intervalRange = SPAWN_INTERVALS.MIDDLE_LATE_BOUNDARY - SPAWN_INTERVALS.MIN_INTERVAL;
      return SPAWN_INTERVALS.MIDDLE_LATE_BOUNDARY - (intervalRange * phaseProgress);
    }
  };

  /**
   * Determine current difficulty phase based on elapsed time
   *
   * @param {number} elapsedSeconds - Time elapsed since game start
   * @returns {string} Phase name: 'early', 'middle', or 'late'
   */
  const getCurrentPhase = (elapsedSeconds) => {
    if (elapsedSeconds < PHASE_BREAKPOINTS.EARLY_PHASE_END) {
      return 'early';
    } else if (elapsedSeconds < PHASE_BREAKPOINTS.MIDDLE_PHASE_END) {
      return 'middle';
    } else {
      return 'late';
    }
  };

  // =========================================================================
  // PUBLIC API - Timer Control
  // =========================================================================

  /**
   * Start the timer
   * Records start time and enables spawn interval calculations
   */
  const start = () => {
    if (isRunning) return;

    startTime = Date.now();
    isRunning = true;

    console.log('[TimerManager] Timer started');
  };

  /**
   * Stop the timer
   * Pauses spawn interval calculations
   */
  const stop = () => {
    isRunning = false;
    console.log('[TimerManager] Timer stopped');
  };

  /**
   * Reset timer state
   * Clears start time for fresh game
   */
  const reset = () => {
    startTime = null;
    isRunning = false;
    console.log('[TimerManager] Timer reset');
  };

  // =========================================================================
  // PUBLIC API - Timing Queries
  // =========================================================================

  /**
   * Get elapsed time since game start
   *
   * @returns {number} Elapsed time in seconds (0 if timer not started)
   */
  const getElapsedTime = () => {
    if (!isRunning || startTime === null) {
      return 0;
    }

    return (Date.now() - startTime) / 1000;
  };

  /**
   * Get current spawn interval based on game progress
   * Incorporates difficulty scaling
   *
   * @returns {number} Spawn interval in milliseconds
   */
  const getSpawnInterval = () => {
    const elapsedSeconds = getElapsedTime();
    return calculateSpawnIntervalSmooth(elapsedSeconds);
  };

  /**
   * Get current difficulty phase
   *
   * @returns {string} Current phase: 'early', 'middle', or 'late'
   */
  const getPhase = () => {
    return getCurrentPhase(getElapsedTime());
  };

  /**
   * Check if timer is currently running
   *
   * @returns {boolean} True if timer is active
   */
  const getIsRunning = () => {
    return isRunning;
  };

  // =========================================================================
  // RETURN PUBLIC API
  // =========================================================================

  return {
    start,
    stop,
    reset,
    getElapsedTime,
    getSpawnInterval,
    getPhase,
    getIsRunning
  };
})();
