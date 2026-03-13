# Quick Start Testing Guide - PR #1

## 5-Minute Test Plan

### Setup (30 seconds)
1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. Open browser DevTools Console (F12 or Cmd+Shift+I)
3. You should see no errors

### Test 1: Initial State (1 minute)
```
Expected State:
✓ Timer display shows "60s"
✓ Score display shows "0"
✓ Canvas shows 3x3 grid of holes (empty)
✓ "Start Game" button is enabled
✓ "Reset" button is disabled
✓ Console shows: "Game engine initialized"
```

### Test 2: Start Game (2 minutes)
```
Actions:
1. Click "Start Game" button
2. Watch the timer for 10 seconds

Expected Results:
✓ Console shows: "Game started"
✓ Console shows: "[CountdownTimer] Timer started with duration 60s"
✓ Moles start appearing and disappearing
✓ Timer display counts down: 60 → 59 → 58... → 51 (approximately)
✓ Canvas display also shows counting time
✓ Timer is smooth and matches real-world seconds (±1 sec)
✓ "Start Game" button becomes disabled
✓ "Reset" button becomes enabled
```

### Test 3: Timer Countdown Accuracy (1 minute)
```
Actions:
1. Wait for timer to reach around 5 seconds
2. Watch carefully for 5 seconds

Expected Results:
✓ Timer displays: 5 → 4 → 3 → 2 → 1 → 0
✓ No jumps or skipped numbers
✓ Count is smooth and synchronized
✓ Canvas and DOM display show same time
```

### Test 4: Game Over (30 seconds)
```
Actions:
1. Wait for timer to reach 0
2. OR: Let the full 60 seconds elapse

Expected Results:
✓ Timer reaches 0 (not negative)
✓ Immediately shows "GAME OVER" overlay
✓ Displays "Final Score: 0"
✓ Console shows: "Game Over! Final Score: 0"
✓ Console shows: "[CountdownTimer] Timer stopped"
✓ Mole spawning stops
✓ "Start Game" button becomes enabled again
✓ "Reset" button still enabled
```

### Test 5: Reset Game (30 seconds)
```
Actions:
1. Click "Reset" button after game over

Expected Results:
✓ Console shows: "Game reset"
✓ Console shows: "[CountdownTimer] Timer reset"
✓ Console shows: "[Spawner] Spawner reset"
✓ Timer display returns to "60s"
✓ Score display shows "0"
✓ Canvas clears and shows grid
✓ "Start Game" button enabled
✓ "Reset" button disabled
✓ Ready to play again
```

## Console Output Expected

### Full Game Session
```
[LOAD]
Grid initialized with 9 holes (3x3)
Game engine initialized

[START GAME]
Game started
[CountdownTimer] Timer started with duration 60s
[Spawner] Spawner initialized
[Spawner] Phase: early, Spawn Interval: 1500ms, Active Moles: 1
[Spawner] Phase: early, Spawn Interval: 1489ms, Active Moles: 2
Mole 0 smashed at (x, y)   [if you click a mole]
[Spawner] *** PHASE TRANSITION *** Now in MIDDLE phase. Spawn Interval: 892ms

[GAME OVER - 60 seconds elapsed]
Game Over! Final Score: 0
[CountdownTimer] Timer stopped

[RESET]
Game reset
[CountdownTimer] Timer reset
[Spawner] Spawner reset
```

## Common Issues & Solutions

### Issue: Timer not counting down
**Solution:** 
- Refresh page (clear browser cache if needed)
- Check console for errors
- Verify script load order in DevTools Network tab

### Issue: Timer shows negative values
**Solution:**
- Should never happen (fixed in PR #1)
- If it does: timer module has boundary checking
- Report as bug

### Issue: Game over doesn't trigger at 60s
**Solution:**
- Check that CountdownTimer.isGameOver() is called
- Verify GAME_DURATION = 60 in game.js
- Check console for "Game Over!" message

### Issue: Timer display and canvas time don't match
**Solution:**
- Both now use same timer module
- Should always be synchronized
- Check for console errors

### Issue: Moles still spawn after game over
**Solution:**
- Should not happen (fixed in PR #1)
- MoleSpawner.reset() called in gameOver()
- Check console logs

## Performance Check

### Expected Performance
- ✓ Smooth 60 FPS (no stuttering)
- ✓ No memory leaks (RAM stable)
- ✓ CPU usage minimal (idle game uses <5% CPU)
- ✓ Timer accuracy ±1 second

### Check FPS
1. Open Chrome DevTools
2. Go to Performance tab
3. Record 10 seconds of gameplay
4. Check FPS graph (should be consistently 60)

## Browser Compatibility
- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+

## Next Steps After Testing

### If All Tests Pass ✅
- PR is ready to merge
- Timer functionality is fixed
- Ready for PR #2 (Scoring System)

### If Any Test Fails ❌
1. Check console for error messages
2. Review code in Chrome DevTools
3. Verify script loading order
4. Check AGENT.md for architecture guidelines

## Debug Mode (DevTools Console)

You can test timer directly in console:

```javascript
// Check timer state
CountdownTimer.getElapsedTime()           // Current elapsed seconds
CountdownTimer.getRemainingTime()         // Current remaining seconds
CountdownTimer.getRemainingTimeFloor()    // Remaining as integer
CountdownTimer.isGameOver()               // Is game over?
CountdownTimer.getPhase()                 // Current difficulty phase

// Check game state
GameEngine.getGameState()                 // Current game state object
GameEngine.getMoles()                     // Array of active moles
MoleSpawner.getMoleStatus()              // Spawner status info

// Manually test spawn intervals
for (let i = 0; i < 60; i++) {
  console.log(i + 's: ' + CountdownTimer.getSpawnInterval().toFixed(0) + 'ms');
}
```

## Session Duration Recommendations

- **Full 60-second game:** 2 minutes
- **Multiple plays:** 5-10 minutes
- **Performance testing:** 10+ minutes

---

**Total Estimated Testing Time:** 5-10 minutes

**Pass Criteria:** All 5 tests pass without errors or warnings

**Ready to test:** ✅
