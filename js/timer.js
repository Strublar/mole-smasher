/**
 * timer.js
 * Timer and difficulty scaling system for Mole Smasher
 *
 * Manages game timing, tracks elapsed time, calculates remaining time,
 * and computes spawn intervals based on game difficulty phases.
 * Implements smooth interpolation between difficulty levels rather than
 * discrete jumps.
 * 
 * The timer is the single source of truth for timing information.
 * All game systems should query this module for elapsed/remaining time
 * rather than calculating it independently.
 *
 * Difficulty Progression:
 * - Early Game (0-20s):   Spawn interval decreases from 1500ms → 900ms
 * - Middle Game (20-40s): Spawn interval decreases from 900ms → 500ms
 * - Late Game (40-60s):   Spawn interval decreases from 500ms → 300ms (minimum)
 *
 * @module timer
 */

const CountdownTimer = (() => {
  // =========================================================================
  // PRIVATE VARIABLES - Timing State
  // =========================================================================

  let startTime = null;
  let isRunning = false;
  let gameDuration = 60; // Game duration in seconds

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
  // PRIVATE FUNCTIONS - Time Calculation
  // =========================================================================

  /**
   * Calculate elapsed time since game start
   * Uses wall-clock time (not frame-based) for accuracy
   * 
   * @returns {number} Elapsed time in seconds (0 if timer not started)
   */
  const calculateElapsedTime = () => {
    if (!isRunning || startTime === null) {
      return 0;
    }

    return (GameUtils.getCurrentTime() - startTime) / 1000;
  };

  /**
   * Calculate remaining time in the game
   * Subtracts elapsed time from game duration
   * Always returns non-negative value (clamps to 0 at boundaries)
   * 
   * @returns {number} Remaining time in seconds (0 when game is over)
   */
  const calculateRemainingTime = () => {
    const elapsedSeconds = calculateElapsedTime();
    const remaining = gameDuration - elapsedSeconds;
    return GameUtils.clamp(remaining, 0, gameDuration);
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
      const phaseProgress = GameUtils.clamp(phaseElapsed / phaseDuration, 0, 1);
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
   * Records start time and enables timing calculations
   * Safe to call multiple times - subsequent calls do nothing (idempotent)
   * 
   * @param {number} duration - Optional game duration in seconds (default: 60)
   */
  const start = (duration = 60) => {
    if (isRunning) {
      return; // Already running - idempotent
    }

    gameDuration = duration;
    startTime = GameUtils.getCurrentTime();
    isRunning = true;

    console.log(`[CountdownTimer] Timer started with duration ${duration}s`);
  };

  /**
   * Stop the timer
   * Pauses timing calculations but preserves elapsed time for resumption
   */
  const stop = () => {
    isRunning = false;
    console.log('[CountdownTimer] Timer stopped');
  };

  /**
   * Reset timer state
   * Clears start time and sets timer to initial state for fresh game
   */
  const reset = () => {
    startTime = null;
    isRunning = false;
    gameDuration = 60;
    console.log('[CountdownTimer] Timer reset');
  };

  // =========================================================================
  // PUBLIC API - Timing Queries
  // =========================================================================

  /**
   * Get elapsed time since game start
   * Wall-clock based for accuracy (not frame-dependent)
   *
   * @returns {number} Elapsed time in seconds (0 if timer not started)
   */
  const getElapsedTime = () => {
    return calculateElapsedTime();
  };

  /**
   * Get remaining time in the game
   * Directly calculated from elapsed time and game duration
   * Primary API for game systems to query remaining time
   *
   * @returns {number} Remaining time in seconds (0 when game is over)
   */
  const getRemainingTime = () => {
    return calculateRemainingTime();
  };

  /**
   * Get remaining time as integer seconds
   * Useful for display purposes where fractional seconds aren't needed
   *
   * @returns {number} Remaining time rounded down to nearest second
   */
  const getRemainingTimeFloor = () => {
    return Math.floor(getRemainingTime());
  };

  /**
   * Get game duration
   * 
   * @returns {number} Game duration in seconds
   */
  const getDuration = () => {
    return gameDuration;
  };

  /**
   * Check if game time has expired
   * True when remaining time reaches 0
   * 
   * @returns {boolean} True if remaining time is 0 or less
   */
  const isGameOver = () => {
    return getRemainingTime() <= 0;
  };

  /**
   * Get current spawn interval based on game progress
   * Incorporates difficulty scaling based on elapsed time
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
    // Control
    start,
    stop,
    reset,
    // Time queries
    getElapsedTime,
    getRemainingTime,
    getRemainingTimeFloor,
    getDuration,
    isGameOver,
    // Difficulty
    getSpawnInterval,
    getPhase,
    // State
    getIsRunning
  };
})();

// ============================================================================
// LEGACY COMPATIBILITY - TimerManager alias
// ============================================================================

// Keep old name for backward compatibility with gameLogic.js
const TimerManager = CountdownTimer;
