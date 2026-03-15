import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArchidektDeck, ArchidektDeckListResponse, ArchidektDeckDetailResponse, ArchidektCard } from '@commander-stats/shared';
import { upsertDeck } from '../db/queries';

const ARCHIDEKT_BASE_URL = 'https://archidekt.com/api';
const ARCHIDEKT_USERNAME_KEY = '@commander_stats/archidekt_username';

export async function getArchidektUsername(): Promise<string | null> {
  return AsyncStorage.getItem(ARCHIDEKT_USERNAME_KEY);
}

export async function setArchidektUsername(username: string): Promise<void> {
  await AsyncStorage.setItem(ARCHIDEKT_USERNAME_KEY, username);
}

export async function fetchDeckPage(url: string): Promise<ArchidektDeckListResponse> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Archidekt API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function syncDecks(username: string): Promise<ArchidektDeck[]> {
  const allDecks: ArchidektDeck[] = [];
  let nextUrl: string | null =
    `${ARCHIDEKT_BASE_URL}/decks/?owner=${encodeURIComponent(username)}&format=3&pageSize=100`;

  while (nextUrl) {
    const data = await fetchDeckPage(nextUrl);
    allDecks.push(...data.results);
    nextUrl = data.next;
  }

  // Save to local DB
  for (const deck of allDecks) {
    const commanderName = deck.commanders?.[0] || '';
    const colors = deck.colorIdentity?.join('') || '';

    await upsertDeck({
      archidekt_id: String(deck.id),
      name: deck.name,
      commander: commanderName,
      colors,
      format: 'Commander',
      card_count: deck.cardCount || 0,
      synced_at: new Date().toISOString(),
    });
  }

  return allDecks;
}

export async function getDeckDetails(deckId: number): Promise<ArchidektDeckDetailResponse> {
  const response = await fetch(`${ARCHIDEKT_BASE_URL}/decks/${deckId}/`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Archidekt API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getCommanderFromDeck(deck: ArchidektDeckDetailResponse): string {
  const commanderCard = deck.cards?.find((card: ArchidektCard) =>
    card.categories?.includes('Commander')
  );
  return commanderCard?.card?.oracleCard?.name || '';
}

export function getDeckColors(deck: ArchidektDeckDetailResponse): string {
  return deck.colorIdentity?.join('') || '';
}
