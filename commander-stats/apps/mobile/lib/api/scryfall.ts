import type { ScryfallCard, ScryfallSearchResponse } from '@commander-stats/shared';

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

// Rate limiting: Scryfall asks for max 10 requests/sec
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // ms

async function scryfallFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  return response;
}

export async function searchCards(query: string, page = 1): Promise<ScryfallSearchResponse> {
  const url = `${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(query)}&page=${page}`;
  const response = await scryfallFetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return { object: 'list', total_cards: 0, has_more: false, data: [] };
    }
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  return response.json();
}

export async function searchCard(name: string): Promise<ScryfallCard[]> {
  const result = await searchCards(`!"${name}"`);
  return result.data;
}

export async function getCardByName(name: string, exact = true): Promise<ScryfallCard | null> {
  const param = exact ? 'exact' : 'fuzzy';
  const url = `${SCRYFALL_BASE_URL}/cards/named?${param}=${encodeURIComponent(name)}`;
  const response = await scryfallFetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  return response.json();
}

export async function getCardById(scryfallId: string): Promise<ScryfallCard | null> {
  const url = `${SCRYFALL_BASE_URL}/cards/${scryfallId}`;
  const response = await scryfallFetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  return response.json();
}

export async function getCommanderDecks(commanderName: string): Promise<ScryfallSearchResponse> {
  const query = `is:commander !"${commanderName}"`;
  return searchCards(query);
}

export async function getCommanderCardData(commanderName: string): Promise<ScryfallCard | null> {
  return getCardByName(commanderName, true);
}

export function getCardImageUrl(card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string | null {
  if (card.image_uris) {
    return card.image_uris[size];
  }
  if (card.card_faces?.[0]?.image_uris) {
    return card.card_faces[0].image_uris[size] || null;
  }
  return null;
}

export function formatManaCost(manaCost: string | null): string {
  if (!manaCost) return '';
  return manaCost.replace(/[{}]/g, match => {
    if (match === '{') return '';
    if (match === '}') return '';
    return match;
  });
}

export function getColorIdentityString(colorIdentity: string[]): string {
  const order = ['W', 'U', 'B', 'R', 'G'];
  return order.filter(c => colorIdentity.includes(c)).join('');
}
