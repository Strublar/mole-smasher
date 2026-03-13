# Mole Smasher

A fun and interactive HTML5 web-based game where players click or tap moles as they pop up from their holes. Test your reflexes and aim for the highest score!

## Game Overview

**Mole Smasher** is a classic whack-a-mole style game built with vanilla HTML5 Canvas and JavaScript. Players race against the clock to smash as many moles as possible before time runs out.

### Game Mechanics

- **Objective**: Click or tap moles as they randomly pop up from their holes
- **Scoring**: Each mole smashed awards points
- **Gameplay**: Moles appear at random positions and intervals
- **Time-Based**: Game runs for a set duration with a countdown timer
- **Difficulty**: Difficulty increases over time with faster mole appearances

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Graphics**: HTML5 Canvas for game rendering
- **No External Dependencies**: Pure vanilla implementation (no game libraries required)
- **Browser Compatible**: Works on modern browsers (Chrome, Firefox, Safari, Edge)

## Project Structure

```
mole-smasher/
├── README.md              # Project documentation
├── agent.md               # Development guidelines and architecture
├── package.json           # Project metadata and scripts
├── .gitignore             # Git ignore rules
├── index.html             # Main game entry point
├── src/
│   └── game.js            # Core game logic
├── styles/
│   └── style.css          # Game styling
└── assets/
    └── images/            # Game sprites and images
```

## Setup Instructions

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Optional: Node.js and npm for development tools

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mole-smasher.git
   cd mole-smasher
   ```

2. Install dependencies (if using development tools):
   ```bash
   npm install
   ```

## How to Run

### Quick Start (No Build Step)

Simply open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Using Development Server (Optional)

If you have Node.js installed:
```bash
npm start
```

This will start a local development server (implementation in future PRs).

## Game Rules

1. Moles pop up randomly across the game board
2. Click or tap each mole as fast as you can to smash it
3. Each successful smash awards points
4. Missed moles cost points or affect the score
5. Game ends when time runs out
6. Final score is displayed at the end
7. Restart to play again

## Features (Planned)

- ✓ Basic HTML5 Canvas setup
- ⏳ Mole spawning and animation
- ⏳ Click/tap detection and hit scoring
- ⏳ Score tracking and display
- ⏳ Timer and game state management
- ⏳ Sound effects and visual feedback
- ⏳ Difficulty progression
- ⏳ High score persistence (localStorage)
- ⏳ Mobile responsiveness

## Development

For detailed development guidelines, coding standards, and architecture notes, see [agent.md](./agent.md).

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Contributing

1. Create a feature branch: `git checkout -b feat/feature-name`
2. Make your changes and commit: `git commit -m "Description of changes"`
3. Push to your branch: `git push origin feat/feature-name`
4. Open a Pull Request

## License

MIT License

## Author

Created as a learning project for HTML5 Canvas game development.

---

**Status**: Under Development (PR #1: Repository Initialization)
