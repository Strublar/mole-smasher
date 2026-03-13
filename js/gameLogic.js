/**
 * gameLogic.js
 * Mole spawning system and game logic for Mole Smasher
 *
 * Implements mole spawning algorithm with:
 * - Random hole selection (no duplicate moles per hole)
 * - Timing-based spawn rate control via TimerManager
 * - Difficulty scaling through spawn intervals
 * - Mole lifecycle tracking (spawn → active → cleanup)
 * - Debug logging for game progression
 *
 * The spawner prevents multiple moles from occupying the same hole
 * by maintaining a Map of holeIndex -> mole instance. This allows
 * direct and efficient mole-to-hole association.
 *
 * @module gameLogic
 */

const MoleSpawner = (() => {
  // =========================================================================
  // PRIVATE VARIABLES - Spawn State
  // =========================================================================

  let molesByHole = new Map(); // Map: holeIndex -> Mole instance
  let lastSpawnTime = 0; // Timestamp of last mole spawn (ms)
  let spawnCount = 0; // Total moles spawned (for debug logging)
  let lastLoggedPhase = null; // Tracks phase for logging transitions

  // Configuration constants
  const CONFIG = {
    MOLE_VISIBLE_DURATION: 1400, // Must match Mole.TIMINGS.TOTAL_DURATION
    TOTAL_HOLES: 9,
    DEBUG_LOG_INTERVAL: 5 // Log spawn info every N spawns
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Hole Management
  // =========================================================================

  /**
   * Get all available hole indices (holes without active moles)
   * Uses set difference to find unoccupied holes
   *
   * @returns {Array<number>} Array of available hole indices (0-8)
   */
  const getAvailableHoles = () => {
    const available = [];
    for (let i = 0; i < CONFIG.TOTAL_HOLES; i++) {
      if (!molesByHole.has(i)) {
        available.push(i);
      }
    }
    return available;
  };

  /**
   * Select a random hole from available holes
   * Uses Math.random() for uniform distribution
   * Only considers holes not currently occupied by active moles
   *
   * @returns {number|null} Random available hole index, or null if no holes available
   */
  const selectRandomHole = () => {
    const available = getAvailableHoles();
    if (available.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Spawn Logic
  // =========================================================================

  /**
   * Determine if a new mole should spawn based on timing
   * Compares time since last spawn with current spawn interval from TimerManager
   *
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {boolean} True if enough time has elapsed for new spawn
   */
  const shouldSpawnMole = (currentTime) => {
    const timeSinceLastSpawn = currentTime - lastSpawnTime;
    const spawnInterval = TimerManager.getSpawnInterval();

    return timeSinceLastSpawn >= spawnInterval;
  };

  /**
   * Spawn a mole at a random unoccupied hole
   * Attempts to add mole via GameEngine.addMole() and updates tracking
   *
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {boolean} True if mole was successfully spawned
   */
  const spawnMoleAtRandomHole = (currentTime) => {
    const holeIndex = selectRandomHole();

    // No available holes
    if (holeIndex === null) {
      return false;
    }

    // Request GameEngine to create mole at hole
    const mole = GameEngine.addMole(holeIndex, currentTime);
    if (!mole) {
      return false;
    }

    // Track this hole as occupied with direct mole reference
    molesByHole.set(holeIndex, mole);
    lastSpawnTime = currentTime;
    spawnCount++;

    // Debug logging (every N spawns and on phase change)
    if (spawnCount % CONFIG.DEBUG_LOG_INTERVAL === 0) {
      const currentPhase = TimerManager.getPhase();
      const spawnInterval = TimerManager.getSpawnInterval();
      console.log(
        `[Spawner] Phase: ${currentPhase}, Spawn Interval: ${Math.round(spawnInterval)}ms, Active Moles: ${molesByHole.size}`
      );
    }

    // Log phase transitions
    const currentPhase = TimerManager.getPhase();
    if (currentPhase !== lastLoggedPhase) {
      lastLoggedPhase = currentPhase;
      const spawnInterval = TimerManager.getSpawnInterval();
      console.log(
        `[Spawner] *** PHASE TRANSITION *** Now in ${currentPhase.toUpperCase()} phase. Spawn Interval: ${Math.round(spawnInterval)}ms`
      );
    }

    return true;
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Lifecycle Management
  // =========================================================================

  /**
   * Clean up moles that have expired
   * Checks each tracked hole to see if its mole is still in the engine
   * Removes hole tracking when mole is no longer present
   * This approach is more efficient and reliable than coordinate matching
   *
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  const cleanupExpiredMoles = (currentTime) => {
    const activeMoles = GameEngine.getMoles();

    // Create a Set for O(1) lookup of moles still in engine
    const activeMoleSet = new Set(activeMoles);

    // Check each tracked hole to see if its mole still exists
    const holesToRemove = [];
    molesByHole.forEach((mole, holeIndex) => {
      // If the mole is no longer in the engine, the hole is now available
      if (!activeMoleSet.has(mole)) {
        holesToRemove.push(holeIndex);
      }
    });

    // Remove expired holes from tracking
    holesToRemove.forEach((holeIndex) => {
      molesByHole.delete(holeIndex);
    });
  };

  // =========================================================================
  // PUBLIC API - Initialization
  // =========================================================================

  /**
   * Initialize the spawner for a new game
   * Resets spawn state and initializes TimerManager
   */
  const initialize = () => {
    molesByHole.clear();
    lastSpawnTime = 0;
    spawnCount = 0;
    lastLoggedPhase = null;

    TimerManager.start();

    console.log('[Spawner] Spawner initialized');
  };

  // =========================================================================
  // PUBLIC API - Game Loop Integration
  // =========================================================================

  /**
   * Update spawner each frame
   * Checks if new mole should spawn, spawns if ready, and cleans up expired moles
   * Called from GameEngine.update() each frame
   *
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  const update = (currentTime) => {
    // Check if we should spawn a new mole
    if (shouldSpawnMole(currentTime)) {
      spawnMoleAtRandomHole(currentTime);
    }

    // Clean up moles that have finished their animation
    cleanupExpiredMoles(currentTime);
  };

  /**
   * Get current spawner status
   * Returns information about active moles and spawn rate
   *
   * @returns {Object} Status object with activeHoles, spawnCount, lastSpawnTime, spawnInterval
   */
  const getMoleStatus = () => {
    return {
      activeHoles: Array.from(molesByHole.keys()),
      activeMoleCount: molesByHole.size,
      totalSpawned: spawnCount,
      lastSpawnTime,
      currentSpawnInterval: TimerManager.getSpawnInterval(),
      currentPhase: TimerManager.getPhase()
    };
  };

  // =========================================================================
  // PUBLIC API - Reset
  // =========================================================================

  /**
   * Reset spawner to initial state
   * Called when game ends or resets
   */
  const reset = () => {
    molesByHole.clear();
    lastSpawnTime = 0;
    spawnCount = 0;
    lastLoggedPhase = null;

    TimerManager.stop();
    TimerManager.reset();

    console.log('[Spawner] Spawner reset');
  };

  // =========================================================================
  // RETURN PUBLIC API
  // =========================================================================

  return {
    initialize,
    update,
    getMoleStatus,
    reset
  };
})();
