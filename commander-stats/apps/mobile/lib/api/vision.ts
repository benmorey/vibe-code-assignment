import Anthropic from '@anthropic-ai/sdk';
import type { VisionBoardState } from '@commander-stats/shared';

const VISION_MODEL = 'claude-opus-4-6';

const BOARD_STATE_PROMPT = `You are analyzing a Magic: The Gathering Commander game board state from an image.

Please identify and return a JSON object with the following structure:
{
  "battlefield": [
    { "name": "Card Name", "quantity": 1, "notes": "optional notes" }
  ],
  "graveyard": [
    { "name": "Card Name", "quantity": 1 }
  ],
  "hand_count": 7,
  "exile": [
    { "name": "Card Name", "quantity": 1 }
  ],
  "lands": [
    { "land_type": "Forest", "count": 5 },
    { "land_type": "Island", "count": 3 },
    { "land_type": "Swamp", "count": 2 },
    { "land_type": "Mountain", "count": 1 },
    { "land_type": "Plains", "count": 1 },
    { "land_type": "Command Tower", "count": 1 }
  ],
  "turn_number": 7,
  "notes": "Any relevant observations about the board state"
}

Rules:
- Only include cards you can clearly identify
- For lands, group by type (basic lands by type, nonbasic lands by name)
- Count tapped vs untapped lands together
- If you can see a hand, estimate the count but don't list the cards
- Include commanders on battlefield normally
- For tokens, describe them as best you can
- Return ONLY the JSON object, no other text`;

export async function analyzeBoardState(
  imageBase64: string,
  apiKey: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
): Promise<VisionBoardState> {
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: BOARD_STATE_PROMPT,
          },
        ],
      },
    ],
  });

  const responseText = message.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('');

  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as VisionBoardState;

    // Validate and provide defaults
    return {
      battlefield: parsed.battlefield || [],
      graveyard: parsed.graveyard || [],
      hand_count: parsed.hand_count || 0,
      exile: parsed.exile || [],
      lands: parsed.lands || [],
      turn_number: parsed.turn_number || null,
      notes: parsed.notes || '',
    };
  } catch (error) {
    console.error('Failed to parse vision response:', responseText);
    throw new Error('Failed to parse board state from image. Please try again with a clearer image.');
  }
}

export function estimateManaAvailable(lands: { land_type: string; count: number }[]): number {
  return lands.reduce((sum, land) => sum + land.count, 0);
}
