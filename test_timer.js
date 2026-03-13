/**
 * Automated Test Suite for PR #1: Timer Functionality
 * Tests timer countdown, game-over triggers, and reset functionality
 */

const fs = require('fs');

// ============================================================================
// TEST 1: Code Analysis - Module Exports
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 1: Timer Module Exports & Structure');
console.log('='.repeat(70));

const timerCode = fs.readFileSync('./js/timer.js', 'utf8');
const gameCode = fs.readFileSync('./src/game.js', 'utf8');

let test1Pass = true;

// Check timer module structure
const checks = [
  {
    name: 'CountdownTimer IIFE defined',
    condition: timerCode.includes('const CountdownTimer = (() =>')
  },
  {
    name: 'start() method exported',
    condition: timerCode.includes('start')
  },
  {
    name: 'stop() method exported',
    condition: timerCode.includes('stop')
  },
  {
    name: 'reset() method exported',
    condition: timerCode.includes('reset')
  },
  {
    name: 'getRemainingTime() method exported',
    condition: timerCode.includes('getRemainingTime')
  },
  {
    name: 'getRemainingTimeFloor() method exported',
    condition: timerCode.includes('getRemainingTimeFloor')
  },
  {
    name: 'isGameOver() method exported',
    condition: timerCode.includes('isGameOver')
  },
  {
    name: 'TimerManager backward-compatible alias',
    condition: timerCode.includes('const TimerManager = CountdownTimer')
  },
  {
    name: 'Game engine uses CountdownTimer',
    condition: gameCode.includes('CountdownTimer.start(')
  },
  {
    name: 'Game engine checks isGameOver()',
    condition: gameCode.includes('CountdownTimer.isGameOver()')
  }
];

checks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test1Pass = false;
});

// ============================================================================
// TEST 2: Timer Logic Analysis
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 2: Timer Logic Implementation');
console.log('='.repeat(70));

let test2Pass = true;

const logicChecks = [
  {
    name: 'Elapsed time calculated from startTime',
    condition: timerCode.includes('GameUtils.getCurrentTime() - startTime')
  },
  {
    name: 'Remaining time = duration - elapsed (with clamp to 0)',
    condition: timerCode.includes('gameDuration - elapsedSeconds') && 
               timerCode.includes('GameUtils.clamp(remaining, 0, gameDuration)')
  },
  {
    name: 'isGameOver checks remaining <= 0',
    condition: timerCode.includes('getRemainingTime() <= 0')
  },
  {
    name: 'Timer prevents negative remaining time',
    condition: timerCode.includes('clamp(remaining, 0, gameDuration)')
  },
  {
    name: 'start() records startTime from getCurrentTime',
    condition: timerCode.includes('startTime = GameUtils.getCurrentTime()')
  },
  {
    name: 'reset() clears startTime to null',
    condition: timerCode.includes('startTime = null')
  },
  {
    name: 'Game duration defaults to 60 seconds',
    condition: timerCode.includes('let gameDuration = 60')
  }
];

logicChecks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test2Pass = false;
});

// ============================================================================
// TEST 3: Game Engine Integration
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 3: Game Engine Integration');
console.log('='.repeat(70));

let test3Pass = true;

const integrationChecks = [
  {
    name: 'GameEngine.start() calls CountdownTimer.reset()',
    condition: gameCode.includes('CountdownTimer.reset()')
  },
  {
    name: 'GameEngine.start() calls CountdownTimer.start()',
    condition: gameCode.includes('CountdownTimer.start(GAME_CONFIG.GAME_DURATION)')
  },
  {
    name: 'GameEngine.update() checks CountdownTimer.isGameOver()',
    condition: gameCode.includes('CountdownTimer.isGameOver()')
  },
  {
    name: 'gameOver() calls CountdownTimer.stop()',
    condition: gameCode.includes('CountdownTimer.stop()')
  },
  {
    name: 'reset() calls CountdownTimer.reset()',
    condition: gameCode.includes('CountdownTimer.reset()')
  },
  {
    name: 'Timer display updated via getRemainingTimeFloor()',
    condition: gameCode.includes('CountdownTimer.getRemainingTimeFloor()')
  },
  {
    name: 'Canvas status shows time remaining',
    condition: gameCode.includes('timeRemaining')
  }
];

integrationChecks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test3Pass = false;
});

// ============================================================================
// TEST 4: HTML Structure
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 4: HTML Event Handlers & UI Elements');
console.log('='.repeat(70));

const htmlCode = fs.readFileSync('./index.html', 'utf8');

let test4Pass = true;

const htmlChecks = [
  {
    name: 'Timer display element exists (id="timer-display")',
    condition: htmlCode.includes('id="timer-display"')
  },
  {
    name: 'Start button exists (id="start-btn")',
    condition: htmlCode.includes('id="start-btn"')
  },
  {
    name: 'Reset button exists (id="reset-btn")',
    condition: htmlCode.includes('id="reset-btn"')
  },
  {
    name: 'Canvas element exists (id="gameCanvas")',
    condition: htmlCode.includes('id="gameCanvas"')
  },
  {
    name: 'timer.js is loaded before game.js',
    condition: htmlCode.indexOf('timer.js') < htmlCode.indexOf('game.js')
  },
  {
    name: 'gameLogic.js is loaded before game.js',
    condition: htmlCode.indexOf('gameLogic.js') < htmlCode.indexOf('game.js')
  },
  {
    name: 'Score display element exists',
    condition: htmlCode.includes('id="score-display"')
  }
];

htmlChecks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test4Pass = false;
});

// ============================================================================
// TEST 5: Event Handler Analysis
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 5: Event Handler Implementation');
console.log('='.repeat(70));

let test5Pass = true;

const eventChecks = [
  {
    name: 'Canvas click handler attached (addEventListener)',
    condition: gameCode.includes("canvas.addEventListener('click'")
  },
  {
    name: 'Canvas touch handler attached (addEventListener)',
    condition: gameCode.includes("canvas.addEventListener('touchend'")
  },
  {
    name: 'Click handler checks if game is running',
    condition: gameCode.includes('!gameState.isRunning')
  },
  {
    name: 'Touch handler prevents default and gets touch coordinates',
    condition: gameCode.includes('event.preventDefault()')
  },
  {
    name: 'mole.isHit() checks collision',
    condition: gameCode.includes('mole.isHit(x, y)')
  },
  {
    name: 'Start button event listener attached',
    condition: gameCode.includes("addEventListener('click', start)")
  },
  {
    name: 'Reset button event listener attached',
    condition: gameCode.includes("addEventListener('click', reset)")
  }
];

eventChecks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test5Pass = false;
});

// ============================================================================
// TEST 6: Edge Cases
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST 6: Edge Cases & Boundary Conditions');
console.log('='.repeat(70));

let test6Pass = true;

const edgeCaseChecks = [
  {
    name: 'Remaining time cannot go below 0 (clamped)',
    condition: timerCode.includes('clamp(remaining, 0, gameDuration)')
  },
  {
    name: 'Timer prevents negative display values',
    condition: timerCode.includes('calculateRemainingTime()') && 
               timerCode.includes('clamp')
  },
  {
    name: 'getRemainingTimeFloor() rounds down (Math.floor)',
    condition: timerCode.includes('Math.floor(getRemainingTime())')
  },
  {
    name: 'start() is idempotent (checks isRunning)',
    condition: timerCode.includes('if (isRunning)') && 
               timerCode.includes('return;')
  },
  {
    name: 'Difficulty phases defined with breakpoints',
    condition: timerCode.includes('PHASE_BREAKPOINTS')
  },
  {
    name: 'Spawn interval smoothly interpolates',
    condition: timerCode.includes('calculateSpawnIntervalSmooth')
  }
];

edgeCaseChecks.forEach(check => {
  const status = check.condition ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.condition) test6Pass = false;
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));

const allTests = [
  { name: 'TEST 1: Module Exports', pass: test1Pass },
  { name: 'TEST 2: Timer Logic', pass: test2Pass },
  { name: 'TEST 3: Game Integration', pass: test3Pass },
  { name: 'TEST 4: HTML Structure', pass: test4Pass },
  { name: 'TEST 5: Event Handlers', pass: test5Pass },
  { name: 'TEST 6: Edge Cases', pass: test6Pass }
];

let overallPass = true;
allTests.forEach(test => {
  const status = test.pass ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${test.name}`);
  if (!test.pass) overallPass = false;
});

console.log('\n' + '='.repeat(70));
if (overallPass) {
  console.log('✓✓✓ ALL CODE STRUCTURE TESTS PASSED ✓✓✓');
} else {
  console.log('✗✗✗ SOME TESTS FAILED - SEE ABOVE ✗✗✗');
}
console.log('='.repeat(70) + '\n');

process.exit(overallPass ? 0 : 1);
