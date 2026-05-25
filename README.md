# Neon Sky Survivor (Gameap)

A complete browser game app built with Vite + vanilla JavaScript, based on the Neon Sky Survivor design.

## What is included

- Full playable survival game loop (instant restart)
- Keyboard + touch controls
- Coins, obstacles, score, and run timer
- Power-ups:
  - Shield
  - Magnet
  - Slow Time
  - Coin Rush
  - Boost
- Persistent progression in local storage:
  - `coins`
  - `best_score`
  - `skins`
  - `current_streak`
- Multi-screen app UI:
  - Home
  - Game
  - Shop
  - Leaderboard
  - Profile
- Daily login streak rewards
- Daily missions with progress bars
- Local daily/weekly leaderboard from run history
- Rank progression (Bronze → Legend)
- Beat-my-score challenge copy button

## Tech stack

- Vite
- Vanilla JavaScript
- HTML/CSS
- Canvas rendering

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build for production

```bash
npm run build
```

Output goes to `./dist`.

## Android and iOS app workflow

This project now includes Capacitor native shells in:

- `/home/runner/work/Gameap/Gameap/android`
- `/home/runner/work/Gameap/Gameap/ios`

Install dependencies:

```bash
npm install
```

Build web assets and sync them into the native projects:

```bash
npm run mobile:sync
```

Open the native projects:

```bash
npm run android:open
npm run ios:open
```

### Requirements

- Android builds require Android Studio
- iOS builds require Xcode on macOS

### Update workflow

After changing the web app, run `npm run mobile:sync` again before opening or rebuilding the native apps.

## Controls

- Move left/right: `A` / `D` or `←` / `→`
- Mobile/tablet: drag across the game canvas
- Restart after game over: click **Restart**

## Notes

- All progression data is saved in browser local storage.
- Daily missions and streaks reset by date.
- Leaderboards are local-device (no backend service required).
