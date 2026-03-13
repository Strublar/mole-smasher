/**
 * game.js
 * Core game engine for Mole Smasher
 * 
 * Manages game state, rendering loop, event handling,
 * and core gameplay mechanics. Implements the main game loop
 * with 60 FPS target using requestAnimationFrame.
 * 
 * Integrates Grid and Mole systems for hole management and
 * mole rendering/collision detection. Also integrates spawning
 * system and timer management for mole lifecycle control.
 * 
 * @module game
 */

const GameEngine = (() => {
  // =========================================================================
  // PRIVATE VARIABLES - Game State
  // =========================================================================

  let canvas = null;
  let ctx = null;
  let grid = null;
  let moles = []; // Array of Mole instances

  let gameState = {
    isRunning: false,
    score: 0,
    timeRemaining: 60,
    startTime: null,
    lastFrameTime: 0
  };

  const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GAME_DURATION: 60,
    TARGET_FPS: 60
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Initialization
  // =========================================================================

  /**
   * Initialize canvas context and retrieve DOM references
   * Sets up the canvas 2D rendering context for game drawing
   */
  const initializeCanvas = () => {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return false;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D canvas context');
      return false;
    }

    // Set canvas to display size from HTML attributes
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    return true;
  };

  /**
   * Initialize grid system
   * Creates 3x3 grid of holes with calculated positions
   * 
   * @returns {boolean} True if grid initialized successfully
   */
  const initializeGrid = () => {
    try {
      grid = new Grid(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT, 9);
      console.log('Grid initialized with 9 holes (3x3)');
      return true;
    } catch (error) {
      console.error('Failed to initialize grid:', error);
      return false;
    }
  };

  /**
   * Attach event listeners to DOM elements
   * Binds click/touch handlers and button controls
   */
  const attachEventListeners = () => {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (startBtn) {
      startBtn.addEventListener('click', start);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', reset);
    }

    // Canvas click/tap handler for mole smashing
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('touchend', handleCanvasTouch);
    }
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Game Loop
  // =========================================================================

  /**
   * Main game loop called at 60 FPS via requestAnimationFrame
   * Updates game state, renders canvas, and schedules next frame
   * 
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  const gameLoop = (currentTime) => {
    if (!gameState.isRunning) {
      return;
    }

    // Calculate delta time for smooth animations
    const deltaTime = (currentTime - gameState.lastFrameTime) / 1000;
    gameState.lastFrameTime = currentTime;

    // Update game state
    update(deltaTime, currentTime);

    // Render frame
    render();

    // Schedule next frame
    requestAnimationFrame(gameLoop);
  };

  /**
   * Update game state each frame
   * Handles timer countdown, mole updates, spawning, state validation, and game-over conditions
   * 
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  const update = (deltaTime, currentTime) => {
    // Calculate time remaining based on elapsed time
    const elapsedSeconds = (currentTime - gameState.startTime) / 1000;
    gameState.timeRemaining = Math.max(
      0,
      GAME_CONFIG.GAME_DURATION - Math.floor(elapsedSeconds)
    );

    // Update spawner - checks if new mole should spawn and spawns/cleans up as needed
    MoleSpawner.update(currentTime);

    // Update all active moles
    if (moles && moles.length > 0) {
      for (let i = moles.length - 1; i >= 0; i--) {
        const mole = moles[i];
        const isActive = mole.update(currentTime);

        // Remove mole if its lifetime has expired
        if (!isActive) {
          moles.splice(i, 1);
        }
      }
    }

    // Update UI displays
    updateScoreDisplay();
    updateTimerDisplay();

    // Check for game over condition
    if (gameState.timeRemaining <= 0) {
      gameOver();
    }
  };

  /**
   * Render current game state to canvas
   * Draws background, game elements (grid, moles), and UI elements
   */
  const render = () => {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw grid (holes)
    if (grid) {
      grid.render(ctx);
    }

    // Draw all active moles
    if (moles && moles.length > 0) {
      moles.forEach((mole) => {
        mole.render(ctx);
      });
    }

    // Draw game title/status
    drawGameStatus();
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Rendering Utilities
  // =========================================================================

  /**
   * Draw game status text on canvas
   * Displays current score and time remaining
   */
  const drawGameStatus = () => {
    const fontSize = 20;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#667eea';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);

    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${gameState.timeRemaining}s`, GAME_CONFIG.CANVAS_WIDTH - 20, 40);
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - Event Handlers
  // =========================================================================

  /**
   * Handle canvas click events
   * Checks for mole collision at click coordinates
   * 
   * @param {MouseEvent} event - Click event object
   */
  const handleCanvasClick = (event) => {
    if (!gameState.isRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    handleClick(clickX, clickY);
  };

  /**
   * Handle canvas touch events
   * Converts touch coordinates to click-style handling
   * 
   * @param {TouchEvent} event - Touch event object
   */
  const handleCanvasTouch = (event) => {
    if (!gameState.isRunning) return;

    event.preventDefault();

    const touch = event.touches[0] || event.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    handleClick(touchX, touchY);
  };

  /**
   * Process click/tap at given coordinates
   * Checks if click hits any active mole and updates score accordingly
   * 
   * @param {number} x - X coordinate of click
   * @param {number} y - Y coordinate of click
   */
  const handleClick = (x, y) => {
    if (!moles || moles.length === 0) {
      return;
    }

    // Check each mole for collision
    for (let i = 0; i < moles.length; i++) {
      const mole = moles[i];
      if (mole.isHit(x, y)) {
        // Mole was smashed - score will be incremented in future PR
        console.log(`Mole ${i} smashed at (${x}, ${y})`);
        // TODO: Increment score when scoring system is implemented
        break; // Only one mole can be hit per click
      }
    }
  };

  // =========================================================================
  // PRIVATE FUNCTIONS - UI Updates
  // =========================================================================

  /**
   * Update score display in DOM
   */
  const updateScoreDisplay = () => {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      scoreDisplay.textContent = gameState.score;
    }
  };

  /**
   * Update timer display in DOM
   */
  const updateTimerDisplay = () => {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = gameState.timeRemaining;
    }
  };

  /**
   * Update button states based on game state
   */
  const updateButtonStates = () => {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (startBtn) {
      startBtn.disabled = gameState.isRunning;
    }

    if (resetBtn) {
      resetBtn.disabled = !gameState.isRunning;
    }
  };

  // =========================================================================
  // PUBLIC API - Game Control
  // =========================================================================

  /**
   * Start the game
   * Initializes game state and begins the game loop
   * Integrates spawner and timer initialization
   */
  const start = () => {
    if (gameState.isRunning) return;

    gameState.isRunning = true;
    gameState.score = 0;
    gameState.timeRemaining = GAME_CONFIG.GAME_DURATION;
    gameState.startTime = Date.now();
    gameState.lastFrameTime = Date.now();

    // Clear moles array
    moles = [];

    // Initialize spawner and timer systems
    MoleSpawner.initialize();

    updateButtonStates();
    requestAnimationFrame(gameLoop);

    console.log('Game started');
  };

  /**
   * Reset the game to initial state
   * Clears score, timer, moles, and prepares for new game
   * Also resets spawner and timer systems
   */
  const reset = () => {
    gameState.isRunning = false;
    gameState.score = 0;
    gameState.timeRemaining = GAME_CONFIG.GAME_DURATION;
    gameState.startTime = null;
    gameState.lastFrameTime = 0;

    // Clear moles
    moles = [];

    // Reset spawner and timer
    MoleSpawner.reset();

    updateScoreDisplay();
    updateTimerDisplay();
    updateButtonStates();

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Render grid in cleared state
    if (grid) {
      grid.render(ctx);
    }

    console.log('Game reset');
  };

  /**
   * Handle game over condition
   * Stops the game and displays final state
   * Stops spawning and timer systems
   */
  const gameOver = () => {
    gameState.isRunning = false;
    updateButtonStates();

    // Stop spawner and timer
    MoleSpawner.reset();

    console.log(`Game Over! Final Score: ${gameState.score}`);

    // Optional: Show game over message on canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 40);

    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 40);
  };

  // =========================================================================
  // PUBLIC API - Mole Management (for spawning system)
  // =========================================================================

  /**
   * Add a mole to the game
   * Used by spawning system to create new moles
   * 
   * @param {number} holeIndex - Index of hole to spawn mole at (0-8)
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {Mole|null} The created mole or null if invalid index
   */
  const addMole = (holeIndex, currentTime) => {
    if (!grid) {
      console.warn('Grid not initialized');
      return null;
    }

    const hole = grid.getHoleAt(holeIndex);
    if (!hole) {
      console.warn(`Cannot add mole: invalid hole index ${holeIndex}`);
      return null;
    }

    const mole = new Mole(hole.x, hole.y, hole.radius);
    mole.spawn(currentTime);
    moles.push(mole);

    return mole;
  };

  /**
   * Get current moles array
   * 
   * @returns {Array<Mole>} Array of active moles
   */
  const getMoles = () => {
    return [...moles];
  };

  /**
   * Get grid instance
   * 
   * @returns {Grid} The grid object
   */
  const getGrid = () => {
    return grid;
  };

  // =========================================================================
  // PUBLIC API - Initialization
  // =========================================================================

  /**
   * Initialize the game engine
   * Must be called once on page load to set up canvas, grid, and listeners
   * 
   * @returns {boolean} True if initialization successful
   */
  const initialize = () => {
    if (!initializeCanvas()) {
      console.error('Failed to initialize canvas');
      return false;
    }

    if (!initializeGrid()) {
      console.error('Failed to initialize grid');
      return false;
    }

    attachEventListeners();
    reset();

    console.log('Game engine initialized');
    return true;
  };

  // =========================================================================
  // RETURN PUBLIC API
  // =========================================================================

  return {
    initialize,
    start,
    reset,
    addMole,
    getMoles,
    getGrid,
    getGameState: () => ({ ...gameState }),
    getCanvasContext: () => ctx
  };
})();

// ============================================================================
// Initialize Game on Page Load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  GameEngine.initialize();
});
