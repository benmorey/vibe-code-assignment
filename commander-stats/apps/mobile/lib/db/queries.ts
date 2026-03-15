import { getDb } from './index';
import type {
  Deck,
  Game,
  GamePlayer,
  GameWithDetails,
  GamePlayerWithOpponent,
  Opponent,
  BoardState,
  BoardStateCard,
  BoardStateLand,
  BoardStateWithCards,
  WinRateStats,
  DeckStats,
  OpponentStats,
  CommanderStats,
  OverallStats,
} from '@commander-stats/shared';

// ============================================================
// Deck Queries
// ============================================================

export async function getDecks(): Promise<Deck[]> {
  const db = await getDb();
  return db.getAllAsync<Deck>('SELECT * FROM decks ORDER BY name ASC');
}

export async function getDeckById(id: number): Promise<Deck | null> {
  const db = await getDb();
  return db.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
}

export async function upsertDeck(deck: Omit<Deck, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO decks (archidekt_id, name, commander, colors, format, card_count, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(archidekt_id) DO UPDATE SET
       name = excluded.name,
       commander = excluded.commander,
       colors = excluded.colors,
       format = excluded.format,
       card_count = excluded.card_count,
       synced_at = excluded.synced_at`,
    [deck.archidekt_id, deck.name, deck.commander, deck.colors, deck.format, deck.card_count, deck.synced_at]
  );
  return result.lastInsertRowId;
}

export async function insertDeck(deck: Omit<Deck, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO decks (archidekt_id, name, commander, colors, format, card_count, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [deck.archidekt_id, deck.name, deck.commander, deck.colors, deck.format, deck.card_count, deck.synced_at]
  );
  return result.lastInsertRowId;
}

export async function updateDeck(id: number, deck: Partial<Omit<Deck, 'id' | 'created_at'>>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(deck).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(deck), id];
  await db.runAsync(`UPDATE decks SET ${fields} WHERE id = ?`, values);
}

export async function deleteDeck(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

// ============================================================
// Opponent Queries
// ============================================================

export async function getOpponents(): Promise<Opponent[]> {
  const db = await getDb();
  return db.getAllAsync<Opponent>('SELECT * FROM opponents ORDER BY name ASC');
}

export async function getOpponentById(id: number): Promise<Opponent | null> {
  const db = await getDb();
  return db.getFirstAsync<Opponent>('SELECT * FROM opponents WHERE id = ?', [id]);
}

export async function insertOpponent(opponent: Omit<Opponent, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO opponents (name, archidekt_username) VALUES (?, ?)',
    [opponent.name, opponent.archidekt_username]
  );
  return result.lastInsertRowId;
}

export async function findOrCreateOpponent(name: string, archidektUsername?: string): Promise<number> {
  const db = await getDb();
  const existing = await db.getFirstAsync<Opponent>(
    'SELECT * FROM opponents WHERE name = ? COLLATE NOCASE',
    [name]
  );
  if (existing) return existing.id;
  return insertOpponent({ name, archidekt_username: archidektUsername || null });
}

// ============================================================
// Game Queries
// ============================================================

export async function getGames(limit = 50, offset = 0): Promise<Game[]> {
  const db = await getDb();
  return db.getAllAsync<Game>(
    'SELECT * FROM games ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

export async function getGameById(id: number): Promise<Game | null> {
  const db = await getDb();
  return db.getFirstAsync<Game>('SELECT * FROM games WHERE id = ?', [id]);
}

export async function getGameWithDetails(id: number): Promise<GameWithDetails | null> {
  const db = await getDb();
  const game = await db.getFirstAsync<Game>('SELECT * FROM games WHERE id = ?', [id]);
  if (!game) return null;

  const deck = game.my_deck_id
    ? await db.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [game.my_deck_id])
    : null;

  const players = await db.getAllAsync<GamePlayer & { opponent_name?: string; opponent_archidekt?: string }>(
    `SELECT gp.*, o.name as opponent_name, o.archidekt_username as opponent_archidekt
     FROM game_players gp
     LEFT JOIN opponents o ON gp.opponent_id = o.id
     WHERE gp.game_id = ?
     ORDER BY gp.turn_order ASC`,
    [id]
  );

  const playersWithOpponent: GamePlayerWithOpponent[] = players.map(p => ({
    id: p.id,
    game_id: p.game_id,
    opponent_id: p.opponent_id,
    commander_name: p.commander_name,
    commander_id: p.commander_id,
    placement: p.placement,
    turn_order: p.turn_order,
    is_me: p.is_me,
    opponent: p.opponent_id && p.opponent_name ? {
      id: p.opponent_id,
      name: p.opponent_name,
      archidekt_username: p.opponent_archidekt || null,
      created_at: '',
    } : undefined,
  }));

  const boardStates = await db.getAllAsync<BoardState>(
    'SELECT * FROM board_states WHERE game_id = ? ORDER BY turn_number ASC',
    [id]
  );

  return {
    ...game,
    deck: deck!,
    players: playersWithOpponent,
    board_states: boardStates,
  };
}

export async function getRecentGamesWithDetails(limit = 10): Promise<GameWithDetails[]> {
  const db = await getDb();
  const games = await db.getAllAsync<Game>(
    'SELECT * FROM games ORDER BY date DESC, created_at DESC LIMIT ?',
    [limit]
  );

  const results: GameWithDetails[] = [];
  for (const game of games) {
    const details = await getGameWithDetails(game.id);
    if (details) results.push(details);
  }
  return results;
}

export async function insertGame(game: Omit<Game, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO games (date, player_count, my_placement, my_deck_id, notes) VALUES (?, ?, ?, ?, ?)',
    [game.date, game.player_count, game.my_placement, game.my_deck_id, game.notes]
  );
  return result.lastInsertRowId;
}

export async function updateGame(id: number, game: Partial<Omit<Game, 'id' | 'created_at'>>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(game).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(game), id];
  await db.runAsync(`UPDATE games SET ${fields} WHERE id = ?`, values);
}

export async function deleteGame(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM games WHERE id = ?', [id]);
}

// ============================================================
// Game Player Queries
// ============================================================

export async function insertGamePlayer(player: Omit<GamePlayer, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO game_players (game_id, opponent_id, commander_name, commander_id, placement, turn_order, is_me) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [player.game_id, player.opponent_id, player.commander_name, player.commander_id, player.placement, player.turn_order, player.is_me]
  );
  return result.lastInsertRowId;
}

export async function getGamePlayers(gameId: number): Promise<GamePlayer[]> {
  const db = await getDb();
  return db.getAllAsync<GamePlayer>(
    'SELECT * FROM game_players WHERE game_id = ? ORDER BY turn_order ASC',
    [gameId]
  );
}

// ============================================================
// Board State Queries
// ============================================================

export async function insertBoardState(state: Omit<BoardState, 'id' | 'timestamp'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO board_states (game_id, cards_in_hand_count, turn_number, notes) VALUES (?, ?, ?, ?)',
    [state.game_id, state.cards_in_hand_count, state.turn_number, state.notes]
  );
  return result.lastInsertRowId;
}

export async function insertBoardStateCard(card: Omit<BoardStateCard, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO board_state_cards (board_state_id, card_name, scryfall_id, zone) VALUES (?, ?, ?, ?)',
    [card.board_state_id, card.card_name, card.scryfall_id, card.zone]
  );
  return result.lastInsertRowId;
}

export async function insertBoardStateLand(land: Omit<BoardStateLand, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO board_state_lands (board_state_id, land_type, count) VALUES (?, ?, ?)',
    [land.board_state_id, land.land_type, land.count]
  );
  return result.lastInsertRowId;
}

export async function getBoardStatesForGame(gameId: number): Promise<BoardStateWithCards[]> {
  const db = await getDb();
  const states = await db.getAllAsync<BoardState>(
    'SELECT * FROM board_states WHERE game_id = ? ORDER BY turn_number ASC',
    [gameId]
  );

  const results: BoardStateWithCards[] = [];
  for (const state of states) {
    const cards = await db.getAllAsync<BoardStateCard>(
      'SELECT * FROM board_state_cards WHERE board_state_id = ?',
      [state.id]
    );
    const lands = await db.getAllAsync<BoardStateLand>(
      'SELECT * FROM board_state_lands WHERE board_state_id = ?',
      [state.id]
    );
    results.push({ ...state, cards, lands });
  }
  return results;
}

// ============================================================
// Stats Queries
// ============================================================

export async function getOverallStats(): Promise<WinRateStats> {
  const db = await getDb();
  const result = await db.getFirstAsync<{
    total_games: number;
    wins: number;
    avg_placement: number;
  }>(`
    SELECT
      COUNT(*) as total_games,
      SUM(CASE WHEN my_placement = 1 THEN 1 ELSE 0 END) as wins,
      AVG(CAST(my_placement AS FLOAT)) as avg_placement
    FROM games
  `);

  const total = result?.total_games || 0;
  const wins = result?.wins || 0;
  return {
    total_games: total,
    wins,
    win_rate: total > 0 ? wins / total : 0,
    avg_placement: result?.avg_placement || 0,
  };
}

export async function getStatsByDeck(): Promise<DeckStats[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    deck_id: number;
    total_games: number;
    wins: number;
    avg_placement: number;
  }>(`
    SELECT
      g.my_deck_id as deck_id,
      COUNT(*) as total_games,
      SUM(CASE WHEN g.my_placement = 1 THEN 1 ELSE 0 END) as wins,
      AVG(CAST(g.my_placement AS FLOAT)) as avg_placement
    FROM games g
    WHERE g.my_deck_id IS NOT NULL
    GROUP BY g.my_deck_id
    ORDER BY total_games DESC
  `);

  const results: DeckStats[] = [];
  for (const row of rows) {
    const deck = await getDeckById(row.deck_id);
    if (deck) {
      results.push({
        deck,
        total_games: row.total_games,
        wins: row.wins,
        win_rate: row.total_games > 0 ? row.wins / row.total_games : 0,
        avg_placement: row.avg_placement,
      });
    }
  }
  return results;
}

export async function getStatsByOpponent(): Promise<OpponentStats[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    opponent_id: number;
    opponent_name: string;
    opponent_archidekt: string | null;
    opponent_created_at: string;
    total_games: number;
    wins: number;
    avg_placement: number;
  }>(`
    SELECT
      o.id as opponent_id,
      o.name as opponent_name,
      o.archidekt_username as opponent_archidekt,
      o.created_at as opponent_created_at,
      COUNT(DISTINCT gp.game_id) as total_games,
      SUM(CASE WHEN g.my_placement = 1 THEN 1 ELSE 0 END) as wins,
      AVG(CAST(g.my_placement AS FLOAT)) as avg_placement
    FROM game_players gp
    JOIN opponents o ON gp.opponent_id = o.id
    JOIN games g ON gp.game_id = g.id
    WHERE gp.is_me = 0 AND gp.opponent_id IS NOT NULL
    GROUP BY o.id
    ORDER BY total_games DESC
  `);

  return rows.map(row => ({
    opponent: {
      id: row.opponent_id,
      name: row.opponent_name,
      archidekt_username: row.opponent_archidekt,
      created_at: row.opponent_created_at,
    },
    total_games: row.total_games,
    wins: row.wins,
    win_rate: row.total_games > 0 ? row.wins / row.total_games : 0,
    avg_placement: row.avg_placement,
  }));
}

export async function getStatsByCommander(): Promise<CommanderStats[]> {
  const db = await getDb();
  return db.getAllAsync<CommanderStats>(`
    SELECT
      gp.commander_name,
      gp.commander_id,
      COUNT(DISTINCT gp.game_id) as total_games,
      SUM(CASE WHEN g.my_placement = 1 THEN 1 ELSE 0 END) as wins,
      AVG(CAST(g.my_placement AS FLOAT)) as avg_placement,
      CAST(SUM(CASE WHEN g.my_placement = 1 THEN 1 ELSE 0 END) AS FLOAT) /
        NULLIF(COUNT(DISTINCT gp.game_id), 0) as win_rate
    FROM game_players gp
    JOIN games g ON gp.game_id = g.id
    WHERE gp.is_me = 0 AND gp.commander_name != ''
    GROUP BY gp.commander_name
    ORDER BY total_games DESC
  `);
}

export async function buildOverallStats(): Promise<OverallStats> {
  const [overall, byDeck, byOpponent, byCommander, recentGames] = await Promise.all([
    getOverallStats(),
    getStatsByDeck(),
    getStatsByOpponent(),
    getStatsByCommander(),
    getRecentGamesWithDetails(5),
  ]);

  const favoriteDeck = byDeck.length > 0 ? byDeck[0].deck : null;

  return {
    ...overall,
    favorite_deck: favoriteDeck,
    recent_games: recentGames,
    by_deck: byDeck,
    by_opponent: byOpponent,
    by_commander: byCommander,
  };
}
