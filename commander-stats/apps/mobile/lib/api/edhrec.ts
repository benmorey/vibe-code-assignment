import type { EDHRECCommanderData, EDHRECCardList, EDHRECTheme } from '@commander-stats/shared';

const EDHREC_JSON_BASE = 'https://json.edhrec.com/pages/commanders';

export function commanderNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function getCommanderData(commanderName: string): Promise<EDHRECCommanderData | null> {
  const slug = commanderNameToSlug(commanderName);
  const url = `${EDHREC_JSON_BASE}/${slug}.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`EDHREC API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('EDHREC fetch error:', error);
    return null;
  }
}

export async function getCommanderArchetypes(commanderName: string): Promise<EDHRECTheme[]> {
  const data = await getCommanderData(commanderName);
  if (!data) return [];

  const themesSection = data.container?.json_dict?.cardlists?.find(
    (list: EDHRECCardList) => list.tag === 'themes'
  );

  if (!themesSection) return [];

  return themesSection.cardviews.slice(0, 10).map(view => ({
    name: view.name,
    href: `/commanders/${commanderNameToSlug(commanderName)}/${view.sanitized}`,
    count: view.num_decks,
  }));
}

export async function getTopCardsForCommander(
  commanderName: string,
  category?: string
): Promise<{ name: string; inclusion: number; num_decks: number }[]> {
  const data = await getCommanderData(commanderName);
  if (!data) return [];

  const cardlists = data.container?.json_dict?.cardlists || [];

  let targetList: EDHRECCardList | undefined;
  if (category) {
    targetList = cardlists.find((list: EDHRECCardList) =>
      list.tag === category || list.header.toLowerCase().includes(category.toLowerCase())
    );
  } else {
    targetList = cardlists[0];
  }

  if (!targetList) return [];

  return targetList.cardviews.slice(0, 20).map(view => ({
    name: view.name,
    inclusion: view.inclusion,
    num_decks: view.num_decks,
  }));
}
