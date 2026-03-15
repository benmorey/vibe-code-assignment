import { View, Text, TouchableOpacity } from 'react-native';
import type { GameWithDetails } from '@commander-stats/shared';
import { ManaColors } from './ManaColors';

interface GameCardProps {
  game: GameWithDetails;
  onPress?: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const isWin = game.my_placement === 1;
  const opponents = game.players.filter(p => !p.is_me);
  const deckColors = game.deck?.colors || '';

  const placementSuffix =
    game.my_placement === 1 ? 'st' :
    game.my_placement === 2 ? 'nd' :
    game.my_placement === 3 ? 'rd' : 'th';

  const content = (
    <View className="bg-card rounded-xl p-4 border border-card-border">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          {/* Deck name */}
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {game.deck?.name || 'Unknown Deck'}
          </Text>

          {/* Commander */}
          {game.deck?.commander ? (
            <Text className="text-primary text-sm mt-0.5">{game.deck.commander}</Text>
          ) : null}

          {/* Colors */}
          {deckColors ? (
            <View className="mt-1.5">
              <ManaColors colors={deckColors} size={12} />
            </View>
          ) : null}

          {/* Date & metadata */}
          <Text className="text-text-muted text-xs mt-2">
            {new Date(game.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' · '}{game.player_count}P
          </Text>

          {/* Opponents */}
          {opponents.length > 0 && (
            <Text className="text-text-muted text-xs mt-0.5" numberOfLines={1}>
              vs {opponents.map(o => o.opponent?.name || o.commander_name || '?').join(', ')}
            </Text>
          )}
        </View>

        {/* Placement */}
        <View
          className={`px-3 py-2 rounded-lg ${
            isWin ? 'bg-success/20 border border-success/30' : 'bg-card-border'
          }`}
        >
          <Text
            className={`text-base font-black ${isWin ? 'text-success' : 'text-text-secondary'}`}
          >
            {isWin ? '🏆' : `${game.my_placement}${placementSuffix}`}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {game.notes ? (
        <Text className="text-text-secondary text-xs mt-2 italic" numberOfLines={1}>
          "{game.notes}"
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
