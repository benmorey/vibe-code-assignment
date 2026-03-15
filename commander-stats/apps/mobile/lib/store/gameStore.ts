import { create } from 'zustand';
import type { NewGameFormData, NewGameOpponent } from '@commander-stats/shared';

interface GameStoreState {
  // Current game being logged
  currentGame: NewGameFormData;
  currentStep: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetGame: () => void;

  setDate: (date: string) => void;
  setPlayerCount: (count: number) => void;
  setMyDeckId: (deckId: number | null) => void;
  setMyTurnOrder: (order: number) => void;
  setMyPlacement: (placement: number) => void;
  setNotes: (notes: string) => void;

  addOpponent: (opponent: NewGameOpponent) => void;
  updateOpponent: (index: number, opponent: Partial<NewGameOpponent>) => void;
  removeOpponent: (index: number) => void;

  isValid: () => boolean;
}

const defaultGame: NewGameFormData = {
  date: new Date().toISOString().split('T')[0],
  player_count: 4,
  my_deck_id: null,
  my_turn_order: 1,
  opponents: [],
  my_placement: null,
  notes: '',
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentGame: { ...defaultGame },
  currentStep: 0,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set(state => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  resetGame: () => set({
    currentGame: {
      ...defaultGame,
      date: new Date().toISOString().split('T')[0],
    },
    currentStep: 0,
  }),

  setDate: (date) => set(state => ({
    currentGame: { ...state.currentGame, date }
  })),

  setPlayerCount: (count) => set(state => ({
    currentGame: { ...state.currentGame, player_count: count }
  })),

  setMyDeckId: (deckId) => set(state => ({
    currentGame: { ...state.currentGame, my_deck_id: deckId }
  })),

  setMyTurnOrder: (order) => set(state => ({
    currentGame: { ...state.currentGame, my_turn_order: order }
  })),

  setMyPlacement: (placement) => set(state => ({
    currentGame: { ...state.currentGame, my_placement: placement }
  })),

  setNotes: (notes) => set(state => ({
    currentGame: { ...state.currentGame, notes }
  })),

  addOpponent: (opponent) => set(state => ({
    currentGame: {
      ...state.currentGame,
      opponents: [...state.currentGame.opponents, opponent],
    }
  })),

  updateOpponent: (index, opponent) => set(state => ({
    currentGame: {
      ...state.currentGame,
      opponents: state.currentGame.opponents.map((o, i) =>
        i === index ? { ...o, ...opponent } : o
      ),
    }
  })),

  removeOpponent: (index) => set(state => ({
    currentGame: {
      ...state.currentGame,
      opponents: state.currentGame.opponents.filter((_, i) => i !== index),
    }
  })),

  isValid: () => {
    const { currentGame } = get();
    return (
      currentGame.my_deck_id !== null &&
      currentGame.my_placement !== null &&
      currentGame.date !== '' &&
      currentGame.player_count >= 2
    );
  },
}));
