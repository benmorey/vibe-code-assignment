import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { buildOverallStats } from '../../lib/db/queries';
import type { GameWithDetails } from '@commander-stats/shared';
import { ManaColors } from '../../components/ManaColors';

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View className="flex-1 bg-card rounded-xl p-4 mx-1 border border-card-border items-center">
      <Text className="text-2xl font-bold text-primary">{value}</Text>
      <Text className="text-xs text-text-secondary mt-1 text-center">{label}</Text>
      {sub && <Text className="text-xs text-text-muted mt-0.5">{sub}</Text>}
    </View>
  );
}

function RecentGameRow({ game, onPress }: { game: GameWithDetails; onPress: () => void }) {
  const isWin = game.my_placement === 1;
  const deckName = game.deck?.name || 'Unknown Deck';
  const commander = game.deck?.commander || '';
  const opponents = game.players.filter(p => !p.is_me);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-xl p-4 mb-3 border border-card-border"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>{deckName}</Text>
          {commander ? (
            <Text className="text-text-secondary text-xs mt-0.5">{commander}</Text>
          ) : null}
          <Text className="text-text-muted text-xs mt-1">
            {game.player_count}P • Turn {game.my_turn_order || 1} •{' '}
            {new Date(game.date).toLocaleDateString()}
          </Text>
          {opponents.length > 0 && (
            <Text className="text-text-muted text-xs mt-1" numberOfLines={1}>
              vs {opponents.map(o => o.opponent?.name || o.commander_name).join(', ')}
            </Text>
          )}
        </View>
        <View
          className={`px-3 py-1.5 rounded-lg ${isWin ? 'bg-success/20' : 'bg-card-border'}`}
        >
          <Text
            className={`text-sm font-bold ${isWin ? 'text-success' : 'text-text-secondary'}`}
          >
            {isWin ? '1st' : `${game.my_placement}${game.my_placement === 2 ? 'nd' : game.my_placement === 3 ? 'rd' : 'th'}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['overall-stats'],
    queryFn: buildOverallStats,
  });

  const winRateDisplay = stats
    ? stats.total_games > 0
      ? `${Math.round(stats.win_rate * 100)}%`
      : 'N/A'
    : '-';

  const avgPlacementDisplay = stats
    ? stats.total_games > 0
      ? stats.avg_placement.toFixed(1)
      : 'N/A'
    : '-';

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
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-white">Commander Stats</Text>
        <Text className="text-text-secondary mt-1">Track your MTG journey</Text>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mb-6">
        <StatBox label="Total Games" value={stats ? String(stats.total_games) : '-'} />
        <StatBox label="Win Rate" value={winRateDisplay} />
        <StatBox label="Avg Placement" value={avgPlacementDisplay} />
      </View>

      {/* Favorite Deck */}
      {stats?.favorite_deck && (
        <View className="bg-card rounded-xl p-4 mb-6 border border-card-border">
          <Text className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">
            Most Played Deck
          </Text>
          <Text className="text-white font-semibold text-base">{stats.favorite_deck.name}</Text>
          {stats.favorite_deck.commander ? (
            <Text className="text-text-secondary text-sm mt-0.5">{stats.favorite_deck.commander}</Text>
          ) : null}
          {stats.favorite_deck.colors ? (
            <View className="mt-2">
              <ManaColors colors={stats.favorite_deck.colors} />
            </View>
          ) : null}
        </View>
      )}

      {/* Log Game Button */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/log')}
        className="bg-primary rounded-xl py-4 mb-6 items-center"
      >
        <Text className="text-white font-bold text-base">+ Log New Game</Text>
      </TouchableOpacity>

      {/* Recent Games */}
      <View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Recent Games</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text className="text-primary text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-8 items-center">
            <Text className="text-text-secondary">Loading...</Text>
          </View>
        ) : stats?.recent_games && stats.recent_games.length > 0 ? (
          stats.recent_games.map(game => (
            <RecentGameRow
              key={game.id}
              game={game}
              onPress={() => router.push(`/game/${game.id}`)}
            />
          ))
        ) : (
          <View className="bg-card rounded-xl p-8 items-center border border-card-border">
            <Text className="text-4xl mb-3">🎲</Text>
            <Text className="text-white font-semibold mb-1">No Games Yet</Text>
            <Text className="text-text-secondary text-sm text-center">
              Log your first game to start tracking your progress
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
