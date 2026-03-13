# Timer System Architecture - PR #1

## System Overview

The timer system is the authoritative source for all game timing information. It tracks wall-clock time (actual elapsed seconds) rather than frame-based time, ensuring accuracy regardless of frame rate variations.

```
┌─────────────────────────────────────────────────────────────┐
│                    GameEngine.gameLoop()                    │
│                    (60 FPS via RAF)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─ Queries: CountdownTimer.getElapsedTime()
                       │
                       ├─ Queries: CountdownTimer.isGameOver()
                       │
                       ├─ Queries: CountdownTimer.getRemainingTimeFloor()
                       │
                       └─ Passes time to MoleSpawner.update()
                               │
                               ├─ Queries: TimerManager.getSpawnInterval()
                               │
                               └─ Queries: TimerManager.getPhase()
```

## Module Dependencies

```
index.html (Script Load Order)
    ↓
1. js/utils.js ..................... Shared utilities (getCurrentTime, clamp, etc.)
    ↓
2. js/grid.js ...................... Grid system for hole management
3. js/mole.js ...................... Mole class for individual mole behavior
    ↓
4. js/timer.js ..................... CountdownTimer module (depends on GameUtils)
    ↓
5. js/gameLogic.js ................. MoleSpawner (depends on CountdownTimer)
    ↓
6. src/game.js ..................... GameEngine (depends on all above)
    ↓
    Document.addEventListener('DOMContentLoaded')
        └─ GameEngine.initialize()
```

## CountdownTimer Module Design

### Public API

#### Control Methods
```javascript
CountdownTimer.start(duration = 60)   // Begin countdown timer
CountdownTimer.stop()                  // Pause timer (preserves elapsed time)
CountdownTimer.reset()                 // Clear state for fresh game
```

#### Query Methods
```javascript
CountdownTimer.getElapsedTime()        // Elapsed seconds (float)
CountdownTimer.getRemainingTime()      // Remaining seconds (float)
CountdownTimer.getRemainingTimeFloor() // Remaining seconds (integer)
CountdownTimer.getDuration()           // Total game duration
CountdownTimer.isGameOver()            // boolean: remaining <= 0
```

#### Difficulty Methods
```javascript
CountdownTimer.getSpawnInterval()      // Current spawn interval in ms
CountdownTimer.getPhase()              // Current phase: 'early', 'middle', 'late'
CountdownTimer.getIsRunning()          // boolean: timer active
```

### Private Implementation

```javascript
// State Variables
let startTime = null;        // Wall-clock time when game started (ms)
let isRunning = false;       // Is timer currently counting down
let gameDuration = 60;       // Game duration in seconds

// Helper Functions
calculateElapsedTime()       // (currentTime - startTime) / 1000
calculateRemainingTime()     // max(0, gameDuration - elapsed)
calculateSpawnIntervalSmooth()  // Smooth interpolation between phases
getCurrentPhase()            // 'early' (0-20s), 'middle' (20-40s), 'late' (40-60s+)
```

### Time Calculation Flow

```
User clicks "Start Game"
    ↓
GameEngine.start()
    ├─ CountdownTimer.reset()        // Clear previous state
    └─ CountdownTimer.start(60)      // Start timer with 60s duration
                ↓
            startTime = GameUtils.getCurrentTime()  // Record wall-clock time
            isRunning = true
                ↓
        Each Frame: CountdownTimer.getElapsedTime()
                ├─ elapsed = (currentTime - startTime) / 1000
                └─ return elapsed in seconds
                ↓
        Each Frame: CountdownTimer.getRemainingTime()
                ├─ elapsed = calculateElapsedTime()
                ├─ remaining = gameDuration - elapsed
                ├─ clamp(remaining, 0, 60)
                └─ return remaining in seconds
                ↓
        Display: CountdownTimer.getRemainingTimeFloor()
                ├─ remaining = getRemainingTime()
                └─ return Math.floor(remaining)
```

## Game Initialization Sequence

### On Page Load

```
1. HTML parsed
2. Scripts loaded in order:
   - js/utils.js → GameUtils available
   - js/grid.js → Grid class available
   - js/mole.js → Mole class available
   - js/timer.js → CountdownTimer available
   - js/gameLogic.js → MoleSpawner available
   - src/game.js → GameEngine available
3. DOMContentLoaded event
4. GameEngine.initialize()
   └─ Calls GameEngine.reset()
      └─ CountdownTimer.reset()  (timer ready but not started)
```

### When User Clicks "Start Game"

```
GameEngine.start()
│
├─ gameState.isRunning = true
├─ gameState.score = 0
├─ moles = []  (clear previous moles)
│
├─ CountdownTimer.reset()   (clear any old state)
├─ CountdownTimer.start(60) (begin countdown)
│   └─ startTime = NOW
│   └─ isRunning = true
│
├─ MoleSpawner.initialize()
│   └─ TimerManager.start()  (no-op: already running)
│
├─ requestAnimationFrame(gameLoop)
│   └─ GameEngine.gameLoop() called 60x per second
│
└─ console: "Game started"
```

## Game Loop Timing

### Each Frame

```
GameEngine.gameLoop(currentTime)
│
├─ Calculate deltaTime
│   └─ deltaTime = (currentTime - lastFrameTime) / 1000
│
├─ GameEngine.update(deltaTime)
│   │
│   ├─ Query Timer State (Single Source of Truth)
│   │   ├─ elapsedTime = CountdownTimer.getElapsedTime()
│   │   ├─ Check: if (CountdownTimer.isGameOver())
│   │   └─ Display: CountdownTimer.getRemainingTimeFloor()
│   │
│   ├─ Update Spawner (Uses Timer Info)
│   │   ├─ spawnInterval = TimerManager.getSpawnInterval()
│   │   └─ phase = TimerManager.getPhase()
│   │
│   ├─ Update Active Moles
│   │   └─ mole.update(currentTime) for each mole
│   │
│   └─ Check Game Over
│       ├─ if (CountdownTimer.isGameOver())
│       │   └─ GameEngine.gameOver()
│       │       └─ CountdownTimer.stop()
│       └─ else: continue game loop
│
└─ GameEngine.render()
    ├─ Clear canvas
    ├─ Draw grid
    ├─ Draw moles
    └─ Draw status text (queries CountdownTimer)
```

## Difficulty Scaling Timeline

The game difficulty increases smoothly over time via spawn interval changes:

### Early Phase (0-20 seconds)
- Spawn interval: 1500ms → 900ms
- Moles appear every 1-1.5 seconds initially
- Gradually increase to every 0.9 seconds

### Middle Phase (20-40 seconds)
- Spawn interval: 900ms → 500ms
- Moles appear every 0.5-0.9 seconds
- Difficulty increases mid-game

### Late Phase (40-60 seconds)
- Spawn interval: 500ms → 300ms
- Moles appear every 0.3-0.5 seconds
- Maximum difficulty at game end

### Implementation

```javascript
// Linear interpolation between spawn intervals
const calculateSpawnIntervalSmooth = (elapsedSeconds) => {
  if (elapsedSeconds < 20) {
    // Early: 1500 → 900
    const progress = elapsedSeconds / 20;
    return 1500 - (600 * progress);
  } else if (elapsedSeconds < 40) {
    // Middle: 900 → 500
    const progress = (elapsedSeconds - 20) / 20;
    return 900 - (400 * progress);
  } else {
    // Late: 500 → 300
    const progress = Math.min(1, (elapsedSeconds - 40) / 20);
    return 500 - (200 * progress);
  }
};
```

## Boundary Conditions

### At Game Start (T=0)
```javascript
CountdownTimer.getElapsedTime()        // Returns 0
CountdownTimer.getRemainingTime()      // Returns 60
CountdownTimer.isGameOver()            // Returns false
```

### At Game End (T≥60)
```javascript
CountdownTimer.getElapsedTime()        // Returns 60+
CountdownTimer.getRemainingTime()      // Returns 0 (clamped)
CountdownTimer.isGameOver()            // Returns true
```

### Protection via clamp()
```javascript
// Remaining time calculation
const remaining = gameDuration - elapsed;
return clamp(remaining, 0, gameDuration);  // Always: 0 ≤ remaining ≤ 60
```

## Error Prevention

### Race Condition Prevention
**Before:** MoleSpawner.initialize() called TimerManager.start(), AND GameEngine.start() tried to manage timing
```javascript
// PROBLEM: Multiple initialization points
GameEngine.start() → MoleSpawner.initialize() → TimerManager.start()
GameEngine.start() → tries to manage timing separately
```

**After:** Single initialization point in GameEngine.start()
```javascript
// SOLUTION: Centralized control
GameEngine.start()
  ├─ CountdownTimer.reset()          // Clear state
  ├─ CountdownTimer.start(60)        // Begin countdown
  └─ MoleSpawner.initialize()        // Initialize spawner (timer already running)
```

### Idempotent start() Method
```javascript
const start = (duration = 60) => {
  if (isRunning) {
    return;  // Already running - safe to call multiple times
  }
  // ... initialization code ...
};
```

### Off-by-One Prevention
**Before:** Manual calculation in game.js
```javascript
const elapsedSeconds = (currentTime - startTime) / 1000;
const timeRemaining = Math.floor(elapsedSeconds);  // Prone to drift
```

**After:** Single calculation in timer module
```javascript
const calculateRemainingTime = () => {
  const elapsed = (now - startTime) / 1000;
  const remaining = duration - elapsed;
  return clamp(remaining, 0, duration);  // Always safe
};
```

### Negative Time Prevention
```javascript
// GameUtils.clamp() ensures: 0 ≤ remaining ≤ duration
const remaining = clamp(gameDuration - elapsedSeconds, 0, gameDuration);
// Even if elapsed > duration, remaining will be 0 (not negative)
```

## Compatibility Layer

### TimerManager Alias
```javascript
// For backward compatibility with gameLogic.js
const TimerManager = CountdownTimer;

// gameLogic.js can still use:
TimerManager.getSpawnInterval()  // ✓ Works
TimerManager.getPhase()          // ✓ Works
TimerManager.start()             // ✓ Works
```

## Performance Characteristics

### Time Accuracy
- Uses `performance.now()` or `Date.now()` for high-resolution timing
- Wall-clock based: not affected by frame rate
- Accuracy: ±1ms (sub-frame precision)

### CPU Efficiency
- No polling or expensive calculations
- Simple wall-clock subtraction: O(1)
- Spawn interval uses pre-calculated phases: O(1)

### Memory Usage
- Only 3 state variables: `startTime`, `isRunning`, `gameDuration`
- No mole tracking (handled by GameEngine)
- ~50 bytes per module instance

## Future Extensions

### Pause System (PR #3)
```javascript
// Could add:
const pausedTime = null;
const pause = () => { pausedTime = getCurrentTime(); };
const resume = () => { startTime += (getCurrentTime() - pausedTime); };
```

### Variable Duration Games (PR #4)
```javascript
// start(duration) already supports this
CountdownTimer.start(120);  // 2-minute game
CountdownTimer.start(30);   // 30-second game
```

### Sound Effect Timing (PR #5)
```javascript
// Timer provides accurate timing for sync:
const soundDelay = CountdownTimer.getElapsedTime() * 1000;
AudioManager.play('sound', soundDelay);
```

---

**Architecture Pattern:** Single Responsibility
**State Management:** Centralized in CountdownTimer
**Time Source:** Wall-clock (performance.now or Date.now)
**Initialization:** Centralized in GameEngine
**Testing:** Can mock GameUtils.getCurrentTime() for deterministic testing
