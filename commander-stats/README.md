# Commander Stats Tracker

Track your Magic: The Gathering Commander games — win rates, board states, opponents, and more.

## Features

- **Archidekt Sync** — Import all your Commander decks directly from your Archidekt account
- **Game Logging** — Record placement, turn order, opponents, and full board states (lands, battlefield, graveyard, hand count)
- **Board Scanner** — Take a photo of your board and Claude Vision auto-extracts all card data
- **Opponent Tracking** — Track by player name, commander, or archetype (via EDHREC data)
- **Win Rate Stats** — Win rates vs specific players, commanders, deck archetypes, and with each of your decks; shows N/A when no data yet

## Apps

| Platform | Tech | How to Run |
|----------|------|-----------|
| iOS / Android | Expo (React Native) | `yarn mobile` |
| Web | Expo Web | `yarn mobile:web` |
| Desktop (Win/Mac/Linux) | Electron | `yarn desktop` |

## Project Structure

```
commander-stats/
├── apps/
│   ├── mobile/          # Expo app (iOS, Android, Web)
│   │   ├── app/         # Expo Router screens
│   │   │   ├── (tabs)/  # Dashboard, Decks, Log, History, Stats
│   │   │   ├── game/    # Game detail view
│   │   │   └── scan/    # Board state camera scanner
│   │   ├── components/  # Shared UI components
│   │   └── lib/
│   │       ├── api/     # Archidekt, Scryfall, EDHREC, Claude Vision
│   │       ├── db/      # SQLite schema + queries
│   │       └── store/   # Zustand state stores
│   └── desktop/         # Electron wrapper for desktop
└── packages/
    └── shared/          # TypeScript types shared across apps
```

## Setup

### Prerequisites
- Node.js 18+
- Yarn (workspaces)
- Expo CLI: `npm i -g expo-cli`

### Install

```bash
yarn install
```

### Configure

1. **Archidekt username** — Set in the app's Decks tab → Settings icon
2. **Claude API key** — Required for board state image recognition. Set in Decks tab → Settings

### Run Mobile (iOS/Android/Web)

```bash
# Start Expo dev server
yarn mobile

# Run on specific platform
yarn mobile:ios
yarn mobile:android
yarn mobile:web
```

### Run Desktop (Electron)

Build the Expo web app first, then start Electron:

```bash
yarn mobile:web   # builds web output
yarn desktop      # starts Electron pointing at localhost:8081
```

Build distributable packages:

```bash
cd apps/desktop
yarn build:mac    # .dmg
yarn build:win    # .exe installer
yarn build:linux  # .AppImage + .deb
```

## Tech Stack

- **Frontend**: Expo SDK 51 + Expo Router v3 (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **State**: Zustand + @tanstack/react-query
- **Database**: expo-sqlite (local-first, no server required)
- **Desktop**: Electron 31
- **APIs**:
  - [Archidekt](https://archidekt.com) — Deck sync
  - [Scryfall](https://scryfall.com/docs/api) — Card data & commander search
  - [EDHREC](https://edhrec.com) — Commander archetype data
  - [Anthropic Claude](https://anthropic.com) — Board state image recognition

## Database Schema

| Table | Description |
|-------|-------------|
| `decks` | Synced Archidekt decks |
| `games` | Game records with placement |
| `game_players` | Turn order, commander, placement per player |
| `opponents` | Tracked opponent profiles |
| `board_states` | Snapshots of board state at end of game |
| `board_state_cards` | Cards in each zone (battlefield/graveyard/exile) |
| `board_state_lands` | Land counts by type |
