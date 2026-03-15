import { View, Text, TouchableOpacity } from 'react-native';
import type { Deck } from '@commander-stats/shared';
import { ManaColors } from './ManaColors';

interface DeckCardProps {
  deck: Deck;
  winRate?: number;
  totalGames?: number;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function DeckCard({
  deck,
  winRate,
  totalGames,
  onPress,
  selected,
  compact = false,
}: DeckCardProps) {
  const hasStats = totalGames !== undefined && totalGames > 0;
  const winRateDisplay = hasStats ? `${Math.round((winRate || 0) * 100)}%` : 'N/A';

  const content = (
    <View
      className={`rounded-xl border ${
        selected
          ? 'bg-primary/10 border-primary'
          : 'bg-card border-card-border'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text
            className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}
            numberOfLines={1}
          >
            {deck.name}
          </Text>

          {deck.commander ? (
            <Text
              className={`text-primary ${compact ? 'text-xs' : 'text-sm'} mt-0.5`}
              numberOfLines={1}
            >
              {deck.commander}
            </Text>
          ) : null}

          {deck.colors && !compact ? (
            <View className="mt-2">
              <ManaColors colors={deck.colors} size={14} />
            </View>
          ) : null}

          {!compact && (
            <Text className="text-text-muted text-xs mt-2">
              {deck.card_count} cards
              {deck.synced_at
                ? ` • Synced ${new Date(deck.synced_at).toLocaleDateString()}`
                : ''}
            </Text>
          )}
        </View>

        {!compact && (
          <View className="items-end">
            <Text
              className={`font-bold text-lg ${
                hasStats
                  ? (winRate || 0) >= 0.5
                    ? 'text-success'
                    : 'text-white'
                  : 'text-text-muted'
              }`}
            >
              {winRateDisplay}
            </Text>
            {hasStats && (
              <Text className="text-text-muted text-xs">
                {totalGames}G / {Math.round((winRate || 0) * totalGames)}W
              </Text>
            )}
          </View>
        )}
      </View>

      {compact && deck.colors ? (
        <View className="mt-1.5">
          <ManaColors colors={deck.colors} size={11} />
        </View>
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
