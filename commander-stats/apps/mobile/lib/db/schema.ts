import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'commander_stats.db';

export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archidekt_id TEXT UNIQUE,
      name TEXT NOT NULL,
      commander TEXT NOT NULL DEFAULT '',
      colors TEXT NOT NULL DEFAULT '',
      format TEXT NOT NULL DEFAULT 'Commander',
      card_count INTEGER NOT NULL DEFAULT 0,
      synced_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS opponents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      archidekt_username TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      player_count INTEGER NOT NULL DEFAULT 4,
      my_placement INTEGER NOT NULL DEFAULT 1,
      my_deck_id INTEGER REFERENCES decks(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      opponent_id INTEGER REFERENCES opponents(id) ON DELETE SET NULL,
      commander_name TEXT NOT NULL DEFAULT '',
      commander_id TEXT,
      placement INTEGER NOT NULL DEFAULT 0,
      turn_order INTEGER NOT NULL DEFAULT 1,
      is_me INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS board_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      cards_in_hand_count INTEGER NOT NULL DEFAULT 0,
      turn_number INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS board_state_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_state_id INTEGER NOT NULL REFERENCES board_states(id) ON DELETE CASCADE,
      card_name TEXT NOT NULL,
      scryfall_id TEXT,
      zone TEXT NOT NULL DEFAULT 'battlefield'
    );

    CREATE TABLE IF NOT EXISTS board_state_lands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_state_id INTEGER NOT NULL REFERENCES board_states(id) ON DELETE CASCADE,
      land_type TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1
    );
  `);
}
