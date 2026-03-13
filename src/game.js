/**
 * game.js
 * Core game engine for Mole Smasher
 * 
 * Manages game state, rendering loop, event handling,
 * and core gameplay mechanics. Implements the main game loop
 * with 60 FPS target using requestAnimationFrame.
 * 
 * @module game
 */

const GameEngine = (() => {
  // =========================================================================
  // PRIVATE VARIABLES - Game State
  // =========================================================================

  let canvas = null;
  let ctx = null;
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
    update(deltaTime);

    // Render frame
    render();

    // Schedule next frame
    requestAnimationFrame(gameLoop);
  };

  /**
   * Update game state each frame
   * Handles timer countdown, state validation, and game-over conditions
   * 
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  const update = (deltaTime) => {
    // Calculate time remaining based on elapsed time
    const elapsedSeconds = (Date.now() - gameState.startTime) / 1000;
    gameState.timeRemaining = Math.max(
      0,
      GAME_CONFIG.GAME_DURATION - Math.floor(elapsedSeconds)
    );

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
   * Draws background, game elements, and UI elements
   */
  const render = () => {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw game title/status
    drawGameStatus();

    // TODO: Draw game elements (holes, moles) as features are added
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
   * Placeholder for mole collision detection logic
   * 
   * @param {number} x - X coordinate of click
   * @param {number} y - Y coordinate of click
   */
  const handleClick = (x, y) => {
    // TODO: Implement mole collision detection
    // Check if click hits any active mole and update score
    console.log(`Click at (${x}, ${y})`);
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
   */
  const start = () => {
    if (gameState.isRunning) return;

    gameState.isRunning = true;
    gameState.score = 0;
    gameState.timeRemaining = GAME_CONFIG.GAME_DURATION;
    gameState.startTime = Date.now();
    gameState.lastFrameTime = Date.now();

    updateButtonStates();
    requestAnimationFrame(gameLoop);

    console.log('Game started');
  };

  /**
   * Reset the game to initial state
   * Clears score, timer, and prepares for new game
   */
  const reset = () => {
    gameState.isRunning = false;
    gameState.score = 0;
    gameState.timeRemaining = GAME_CONFIG.GAME_DURATION;
    gameState.startTime = null;
    gameState.lastFrameTime = 0;

    updateScoreDisplay();
    updateTimerDisplay();
    updateButtonStates();

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    console.log('Game reset');
  };

  /**
   * Handle game over condition
   * Stops the game and displays final state
   */
  const gameOver = () => {
    gameState.isRunning = false;
    updateButtonStates();

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
  // PUBLIC API - Initialization
  // =========================================================================

  /**
   * Initialize the game engine
   * Must be called once on page load to set up canvas and listeners
   * 
   * @returns {boolean} True if initialization successful
   */
  const initialize = () => {
    if (!initializeCanvas()) {
      console.error('Failed to initialize canvas');
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
