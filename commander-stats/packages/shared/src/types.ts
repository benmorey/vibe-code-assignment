// ============================================================
// Core Database Entity Types
// ============================================================

export interface Deck {
  id: number;
  archidekt_id: string | null;
  name: string;
  commander: string;
  colors: string; // e.g. "WUBRG" or "UB"
  format: string;
  card_count: number;
  synced_at: string | null;
  created_at: string;
}

export interface Opponent {
  id: number;
  name: string;
  archidekt_username: string | null;
  created_at: string;
}

export interface Game {
  id: number;
  date: string;
  player_count: number;
  my_placement: number;
  my_deck_id: number;
  notes: string | null;
  created_at: string;
}

export interface GamePlayer {
  id: number;
  game_id: number;
  opponent_id: number | null;
  commander_name: string;
  commander_id: string | null;
  placement: number;
  turn_order: number;
  is_me: number; // 0 or 1
}

export interface BoardState {
  id: number;
  game_id: number;
  timestamp: string;
  cards_in_hand_count: number;
  turn_number: number;
  notes: string | null;
}

export interface BoardStateCard {
  id: number;
  board_state_id: number;
  card_name: string;
  scryfall_id: string | null;
  zone: CardZone;
}

export interface BoardStateLand {
  id: number;
  board_state_id: number;
  land_type: string;
  count: number;
}

export type CardZone = 'battlefield' | 'graveyard' | 'hand' | 'exile';

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

// ============================================================
// Extended / Joined Types
// ============================================================

export interface GameWithDetails extends Game {
  deck: Deck;
  players: GamePlayerWithOpponent[];
  board_states?: BoardState[];
}

export interface GamePlayerWithOpponent extends GamePlayer {
  opponent?: Opponent;
}

export interface BoardStateWithCards extends BoardState {
  cards: BoardStateCard[];
  lands: BoardStateLand[];
}

// ============================================================
// Archidekt API Types
// ============================================================

export interface ArchidektDeck {
  id: number;
  name: string;
  owner: {
    username: string;
  };
  categories: ArchidektCategory[];
  featured: string;
  format: number;
  commanders: string[];
  colorIdentity: string[];
  cardCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ArchidektCategory {
  name: string;
  includedInDeck: boolean;
  includedInPrice: boolean;
  isPremium: boolean;
}

export interface ArchidektCard {
  id: number;
  quantity: number;
  card: {
    oracleCard: {
      name: string;
      cmc: number;
      colorIdentity: string[];
      types: string[];
    };
    uid: string;
    edition: {
      editioncode: string;
    };
  };
  categories: string[];
}

export interface ArchidektDeckListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArchidektDeck[];
}

export interface ArchidektDeckDetailResponse {
  id: number;
  name: string;
  cards: ArchidektCard[];
  commanders: ArchidektCard[];
  categories: ArchidektCategory[];
  format: number;
  colorIdentity: string[];
}

// ============================================================
// Scryfall API Types
// ============================================================

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost: string | null;
  cmc: number;
  type_line: string;
  oracle_text: string | null;
  colors: string[] | null;
  color_identity: string[];
  set: string;
  set_name: string;
  collector_number: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }>;
  legalities: {
    commander: string;
  };
  prices: {
    usd: string | null;
    usd_foil: string | null;
  };
  edhrec_rank: number | null;
}

export interface ScryfallSearchResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}

// ============================================================
// EDHREC Types
// ============================================================

export interface EDHRECCommanderData {
  container: {
    json_dict: {
      card: {
        name: string;
        sanitized: string;
      };
      cardlists: EDHRECCardList[];
    };
  };
}

export interface EDHRECCardList {
  header: string;
  tag: string;
  cardviews: EDHRECCardView[];
}

export interface EDHRECCardView {
  name: string;
  sanitized: string;
  num_decks: number;
  inclusion: number;
  image_uris?: {
    art_crop: string;
  };
}

export interface EDHRECTheme {
  name: string;
  href: string;
  count: number;
}

// ============================================================
// Vision / Claude API Types
// ============================================================

export interface VisionBoardState {
  battlefield: VisionCard[];
  graveyard: VisionCard[];
  hand_count: number;
  exile: VisionCard[];
  lands: VisionLand[];
  turn_number: number | null;
  notes: string;
}

export interface VisionCard {
  name: string;
  quantity: number;
  notes?: string;
}

export interface VisionLand {
  land_type: string;
  count: number;
}

// ============================================================
// Stats Types
// ============================================================

export interface WinRateStats {
  total_games: number;
  wins: number;
  win_rate: number;
  avg_placement: number;
}

export interface DeckStats extends WinRateStats {
  deck: Deck;
}

export interface OpponentStats extends WinRateStats {
  opponent: Opponent;
}

export interface CommanderStats extends WinRateStats {
  commander_name: string;
  commander_id?: string;
}

export interface OverallStats {
  total_games: number;
  wins: number;
  win_rate: number;
  avg_placement: number;
  favorite_deck: Deck | null;
  recent_games: GameWithDetails[];
  by_deck: DeckStats[];
  by_opponent: OpponentStats[];
  by_commander: CommanderStats[];
}

// ============================================================
// Store / Form Types
// ============================================================

export interface NewGameFormData {
  date: string;
  player_count: number;
  my_deck_id: number | null;
  my_turn_order: number;
  opponents: NewGameOpponent[];
  my_placement: number | null;
  notes: string;
}

export interface NewGameOpponent {
  id?: number; // If existing opponent
  name: string;
  commander_name: string;
  placement: number | null;
  turn_order: number;
}

export interface AppSettings {
  archidekt_username: string;
  claude_api_key: string;
  dark_mode: boolean;
}
