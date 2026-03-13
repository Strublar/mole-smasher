# Agent Development Guidelines — Mole Smasher

This document serves as the definitive guide for AI agents and developers working on the Mole Smasher project. It contains project vision, technical specifications, architecture notes, and coding standards.

## Project Vision

**Mole Smasher** is a lightweight, browser-based game that recreates the classic arcade "whack-a-mole" experience. The project demonstrates modern HTML5 Canvas capabilities while maintaining simplicity and accessibility.

### Goals

1. Create an engaging, responsive game playable on desktop and mobile devices
2. Implement using vanilla HTML5/CSS/JavaScript (no external game libraries)
3. Maintain clean, readable, well-documented code for learning purposes
4. Deliver a fully functional MVP with core gameplay mechanics
5. Support high score tracking and game state persistence

### Success Criteria

- Smooth 60 FPS gameplay
- Responsive click/tap detection
- Accurate score calculation
- Cross-browser compatibility
- Mobile touch support
- Intuitive UI/UX

## Tech Stack

### Frontend Layer

| Technology | Purpose | Details |
|-----------|---------|---------|
| **HTML5** | Markup & Canvas API | Semantic HTML5 structure; `<canvas>` element for game rendering |
| **CSS3** | Styling & Layout | Flexbox/Grid for layout; Animations for UI feedback; Media queries for responsiveness |
| **JavaScript (ES6+)** | Game Logic | Vanilla JS (no frameworks); Modular code structure; Event-driven architecture |

### Architecture

```
HTML5 Canvas Rendering → JavaScript Game Engine → DOM Event Listeners
                              ↓
                      Game State Management
                              ↓
                    Score/Timer/Mole Spawning
```

### Why Vanilla Implementation?

- No external dependencies to manage
- Teaches fundamental game loop concepts
- Maximum control over performance
- Minimal bundle size
- Excellent for learning Canvas API

## Folder Structure

```
mole-smasher/
│
├── README.md                 # Project documentation
├── agent.md                  # This file — development guidelines
├── package.json              # Project metadata
├── .gitignore                # Git ignore rules
├── index.html                # Main HTML entry point
│
├── src/
│   ├── game.js              # Core game logic and state management
│   ├── mole.js              # Mole object and behavior (future)
│   └── utils.js             # Utility functions (collision, random, etc.)
│
├── styles/
│   └── style.css            # All game styling
│
└── assets/
    ├── images/              # Sprites and game graphics
    │   ├── mole.png
    │   ├── hole.png
    │   └── background.png
    └── sounds/              # Audio files (future)
        ├── smash.mp3
        └── spawn.mp3
```

## Code Organization

### Module Pattern

Each JavaScript file should follow this structure:

```javascript
// 1. Module declaration with clear comments
const GameModule = (() => {
  // 2. Private variables
  let gameState = {};
  
  // 3. Private functions
  const initializeGame = () => { /* ... */ };
  
  // 4. Public API
  return {
    start: () => { /* ... */ },
    reset: () => { /* ... */ }
  };
})();
```

### Naming Conventions

**Variables & Functions**
- Use `camelCase` for variables and functions
- Use descriptive, self-documenting names
- Prefix boolean values with `is` or `has` (e.g., `isGameActive`, `hasCollision`)
- Use `UPPER_SNAKE_CASE` for constants

**Examples**
```javascript
const gameWidth = 800;           // Good
const GAME_WIDTH = 800;          // Also good for constants
const w = 800;                   // Bad
const isGameRunning = true;      // Good
const gameRunning = true;        // Acceptable but less clear
```

**Classes & Objects**
- Use `PascalCase` for class names
- Use `camelCase` for instance properties and methods

```javascript
class Mole {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  update() { /* ... */ }
}
```

## Game Mechanics Overview

### Core Gameplay Loop

```
Initialize Game
    ↓
Game Loop (60 FPS)
    ├─→ Update Game State
    │    ├─ Move moles
    │    ├─ Check collisions
    │    ├─ Update timer
    │    └─ Update score
    ├─→ Render to Canvas
    │    ├─ Draw background
    │    ├─ Draw holes/moles
    │    └─ Draw UI (score, timer)
    └─→ Handle Events
         └─ Mouse/touch clicks
    ↓
Game Over?
    ├─→ No: Continue loop
    └─→ Yes: Display final score, allow restart
```

### Mole Behavior

- **Spawn**: Moles appear at random holes with random intervals
- **Animation**: Smooth pop-up and pop-down animations
- **Vulnerability Window**: Moles are "smashable" for a limited duration
- **Despawn**: Moles disappear after their time window expires (penalty)
- **Difficulty Scaling**: Spawn rate and duration decrease over time

### Scoring System

- **Base Points**: X points per mole smashed
- **Accuracy Bonus**: Bonus for rapid consecutive smashes
- **Difficulty Multiplier**: Higher multiplier at higher game speeds
- **Missed Penalty**: Y points deducted for missed moles (optional)

## Code Standards

### Comments & Documentation

**File Header**
```javascript
/**
 * game.js
 * Core game engine for Mole Smasher
 * 
 * Manages game state, rendering loop, event handling,
 * and core gameplay mechanics.
 * 
 * @module game
 */
```

**Function Documentation**
```javascript
/**
 * Detects collision between click/tap and mole position
 * @param {number} clickX - X coordinate of click
 * @param {number} clickY - Y coordinate of click
 * @param {Object} mole - Mole object with x, y, radius properties
 * @returns {boolean} True if collision detected
 */
const checkCollision = (clickX, clickY, mole) => { /* ... */ };
```

**Inline Comments**
- Use sparingly for non-obvious logic
- Explain "why", not "what"
- Keep comments updated with code

```javascript
// Good: Explains decision
// Use requestAnimationFrame for 60 FPS instead of setTimeout
const gameLoop = () => requestAnimationFrame(gameLoop);

// Bad: States obvious
// Increment score
score++;
```

### Code Style

**Formatting**
- 2-space indentation
- Semicolons required
- Max line length: 100 characters (readability)
- One statement per line

**Functions**
- Keep functions small and focused (single responsibility)
- Max complexity: reasonable cognitive load
- Use arrow functions for callbacks; regular functions for object methods

**Variables**
- Declare with `const` by default
- Use `let` only when reassignment needed
- Avoid `var`
- Declare variables at point of use (ES6+)

## Git Workflow

### Branch Naming

```
feat/feature-name        # New feature
fix/bug-fix-name        # Bug fix
refactor/change-name    # Code refactoring
docs/documentation-name # Documentation
```

### Commit Messages

**Format**: `type(scope): brief description`

```
feat(canvas): implement game loop with requestAnimationFrame
fix(collision): correct mole hit detection algorithm
docs(readme): add setup instructions
refactor(game): extract mole spawning to separate module
```

**Commit Guidelines**
- Describe *what* changed and *why*
- Use imperative mood ("add" not "added")
- Keep first line under 50 characters
- Reference issue numbers when applicable: `fix: collision bug (#42)`

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with clear commits
3. Write descriptive PR title and description
4. Ensure code follows style guide
5. Request review from team lead
6. Address feedback and re-request review
7. Merge to `main` when approved

## Development Guidelines

### Starting a New Feature

1. Create feature branch: `git checkout -b feat/feature-name`
2. Review this agent.md file and README.md
3. Plan implementation (pseudo-code or comments first)
4. Write code following style guide
5. Test thoroughly (manual and automated)
6. Commit with clear messages
7. Open Pull Request

### Testing Approach

**Manual Testing** (until automated framework is added)
- Test gameplay on desktop and mobile
- Test in multiple browsers
- Verify click/tap detection accuracy
- Check score calculation
- Test edge cases (rapid clicks, boundary collisions, etc.)

**Automated Testing** (future PR)
- Unit tests for utility functions
- Integration tests for game loop
- Visual regression tests for rendering

### Performance Considerations

- Use `requestAnimationFrame` for game loop (not `setInterval`)
- Minimize DOM manipulation during game loop
- Cache Canvas context and dimensions
- Avoid creating objects in hot paths (game loop)
- Profile with browser DevTools before optimizing

## Browser Support

**Target Browsers**
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

**Required APIs**
- HTML5 Canvas 2D Context
- Touch Events API (mobile)
- `requestAnimationFrame`
- LocalStorage (for high scores)

## Configuration & Constants

Game configuration should be centralized in a config object:

```javascript
const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  NUM_HOLES: 9,
  GAME_DURATION: 60, // seconds
  INITIAL_SPAWN_RATE: 800, // milliseconds
  SPAWN_RATE_DECREASE: 20, // per level
  MOLE_VISIBLE_DURATION: 1000, // milliseconds
  BASE_POINTS: 10
};
```

## Future Enhancements (Not in MVP)

- [ ] Sound effects and background music
- [ ] Particle effects for visual feedback
- [ ] Leaderboard with server persistence
- [ ] Multiple difficulty levels
- [ ] Power-ups and special moles
- [ ] Animation polish and tweens
- [ ] Accessibility features (screen readers, keyboard support)
- [ ] Progressive Web App (offline support)

## Resources & References

### HTML5 Canvas
- MDN: Canvas API — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Canvas Tutorial — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

### Game Development
- Game Loop Pattern — https://developer.mozilla.org/en-US/docs/Games/Anatomy
- requestAnimationFrame — https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

### JavaScript
- ES6+ Features — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
- Touch Events — https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

## Quick Reference

| Task | Command |
|------|---------|
| Start game | Open `index.html` in browser |
| Check code style | Review against this document |
| Test locally | npm start (opens browser) |
| Build for production | npm run build (future) |
| Run tests | npm test (future) |

---

**Document Version**: 1.0  
**Last Updated**: PR #1 - Repository Initialization  
**Maintained By**: Development Team
