# 1 Minute Brain Challenge

React Native + Expo mini-game where you have **1-3 minutes** (depending on difficulty) to solve as many brain puzzles as possible.

## Features

- **Home screen**
  - Game title and short description.
  - Button to start a new challenge (1-3 minutes based on difficulty).
  - Simple stats: best score, games played, average score.

- **Puzzle screen**
  - Endless stream of mini-puzzles for 1-3 minutes (based on difficulty).
  - Visual countdown bar and remaining seconds text.
  - Live score and streak display.

- **Timer system**
  - 1-3 minute countdown (based on difficulty) with a shrinking progress bar.
  - Color changes (green → yellow → red) as time runs out.

- **Score system**
  - Score increments for each correct answer.
  - Tracks current streak and best streak per game.
  - Persists best score and basic stats locally.

- **Puzzle types**
  - Mental math (quick arithmetic).
  - Memory sequence (remember and recall numbers).
  - Simple logic patterns (what comes next?).

- **Tech stack**
  - React Native + Expo.
  - TypeScript.
  - React Navigation.
  - AsyncStorage for local stats.

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/mdturin/1-Minute-Brain-Challenge.git
cd "1 Minute Brain Challenge/app"
npm install
```

Start the Expo dev server:

```bash
npm start
```

Then:

- Press `w` to run on **web** in your browser, or
- Use the **Expo Go** app on your phone to scan the QR code and play on a real device.
