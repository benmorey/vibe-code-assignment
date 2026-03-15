import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRecentGamesWithDetails } from '../../lib/db/queries';
import type { GameWithDetails } from '@commander-stats/shared';
import { ManaColors } from '../../components/ManaColors';

function PlacementBadge({ placement, playerCount }: { placement: number; playerCount: number }) {
  const isWin = placement === 1;
  const colors = isWin
    ? 'bg-success/20 border-success/40'
    : placement === 2
    ? 'bg-accent/20 border-accent/40'
    : 'bg-card border-card-border';
  const textColors = isWin ? 'text-success' : placement === 2 ? 'text-accent' : 'text-text-secondary';
  const suffix = placement === 1 ? 'st' : placement === 2 ? 'nd' : placement === 3 ? 'rd' : 'th';

  return (
    <View className={`px-3 py-1.5 rounded-lg border ${colors}`}>
      <Text className={`text-sm font-bold ${textColors}`}>
        {isWin ? '🏆 ' : ''}{placement}{suffix}
      </Text>
    </View>
  );
}

function GameCard({ game, onPress }: { game: GameWithDetails; onPress: () => void }) {
  const opponents = game.players.filter(p => !p.is_me);
  const myPlayer = game.players.find(p => p.is_me);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-xl p-4 mb-3 border border-card-border"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          {/* Deck & Date */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white font-semibold text-base flex-1 mr-2" numberOfLines={1}>
              {game.deck?.name || 'Unknown Deck'}
            </Text>
          </View>

          {/* Commander */}
          {game.deck?.commander ? (
            <Text className="text-primary text-sm mb-1">{game.deck.commander}</Text>
          ) : null}

          {/* Colors */}
          {game.deck?.colors ? (
            <View className="mb-2">
              <ManaColors colors={game.deck.colors} size={12} />
            </View>
          ) : null}

          {/* Metadata */}
          <Text className="text-text-muted text-xs">
            {new Date(game.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' · '}
            {game.player_count} players
            {myPlayer ? ` · Turn ${myPlayer.turn_order}` : ''}
          </Text>

          {/* Opponents */}
          {opponents.length > 0 && (
            <Text className="text-text-muted text-xs mt-1" numberOfLines={1}>
              vs {opponents.map(o => o.opponent?.name || o.commander_name || '?').join(', ')}
            </Text>
          )}

          {/* Notes */}
          {game.notes ? (
            <Text className="text-text-secondary text-xs mt-1 italic" numberOfLines={1}>
              "{game.notes}"
            </Text>
          ) : null}
        </View>

        <PlacementBadge placement={game.my_placement} playerCount={game.player_count} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();

  const { data: games, isLoading, refetch } = useQuery({
    queryKey: ['games', 'history'],
    queryFn: () => getRecentGamesWithDetails(100),
  });

  // Group games by month
  const grouped = (games || []).reduce<Record<string, GameWithDetails[]>>((acc, game) => {
    const date = new Date(game.date);
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(game);
    return acc;
  }, {});

  const sections = Object.entries(grouped);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor="#7c3aed"
          colors={['#7c3aed']}
        />
      }
    >
      {isLoading ? (
        <View className="py-16 items-center">
          <Text className="text-text-secondary">Loading games...</Text>
        </View>
      ) : games && games.length > 0 ? (
        <>
          <Text className="text-text-secondary text-xs mb-4">
            {games.length} game{games.length !== 1 ? 's' : ''} total
          </Text>

          {sections.map(([month, monthGames]) => (
            <View key={month} className="mb-2">
              <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
                {month}
              </Text>
              {monthGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPress={() => router.push(`/game/${game.id}`)}
                />
              ))}
            </View>
          ))}
        </>
      ) : (
        <View className="py-20 items-center">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-white font-semibold text-lg mb-2">No Games Logged</Text>
          <Text className="text-text-secondary text-sm text-center px-8">
            Head to the Log tab to record your first game
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
