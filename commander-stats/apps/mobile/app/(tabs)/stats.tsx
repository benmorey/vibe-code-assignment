import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  getOverallStats,
  getStatsByDeck,
  getStatsByOpponent,
  getStatsByCommander,
} from '../../lib/db/queries';
import type { DeckStats, OpponentStats, CommanderStats } from '@commander-stats/shared';
import { ManaColors } from '../../components/ManaColors';

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3 mt-6">
      {title}
    </Text>
  );
}

function WinRateBar({ rate, games }: { rate: number; games: number }) {
  if (games === 0) {
    return <Text className="text-text-muted text-sm">N/A</Text>;
  }

  return (
    <View className="flex-row items-center gap-2 flex-1">
      <View className="flex-1 h-1.5 bg-card-border rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${Math.round(rate * 100)}%` }}
        />
      </View>
      <Text className="text-white text-xs font-semibold w-10 text-right">
        {Math.round(rate * 100)}%
      </Text>
    </View>
  );
}

function DeckStatRow({ stat }: { stat: DeckStats }) {
  return (
    <View className="bg-card rounded-xl p-4 mb-2 border border-card-border">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {stat.deck.name}
          </Text>
          {stat.deck.commander ? (
            <Text className="text-text-secondary text-xs mt-0.5">{stat.deck.commander}</Text>
          ) : null}
          {stat.deck.colors ? (
            <View className="mt-1.5">
              <ManaColors colors={stat.deck.colors} size={11} />
            </View>
          ) : null}
        </View>
        <View className="items-end">
          <Text className="text-text-muted text-xs">{stat.total_games}G / {stat.wins}W</Text>
          <Text className="text-text-muted text-xs">Avg {stat.avg_placement.toFixed(1)}</Text>
        </View>
      </View>
      <WinRateBar rate={stat.win_rate} games={stat.total_games} />
    </View>
  );
}

function OpponentStatRow({ stat }: { stat: OpponentStats }) {
  return (
    <View className="bg-card rounded-xl p-4 mb-2 border border-card-border">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-semibold text-sm flex-1 mr-3" numberOfLines={1}>
          {stat.opponent.name}
        </Text>
        <Text className="text-text-muted text-xs">{stat.total_games}G / {stat.wins}W</Text>
      </View>
      <WinRateBar rate={stat.win_rate} games={stat.total_games} />
    </View>
  );
}

function CommanderStatRow({ stat }: { stat: CommanderStats }) {
  return (
    <View className="bg-card rounded-xl p-4 mb-2 border border-card-border">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-semibold text-sm flex-1 mr-3" numberOfLines={1}>
          {stat.commander_name}
        </Text>
        <Text className="text-text-muted text-xs">{stat.total_games}G / {stat.wins}W</Text>
      </View>
      <WinRateBar rate={stat.win_rate} games={stat.total_games} />
    </View>
  );
}

export default function StatsScreen() {
  const { data: overall, isLoading: loadingOverall, refetch: refetchOverall } = useQuery({
    queryKey: ['overall-stats-simple'],
    queryFn: getOverallStats,
  });

  const { data: deckStats, isLoading: loadingDecks, refetch: refetchDecks } = useQuery({
    queryKey: ['deck-stats'],
    queryFn: getStatsByDeck,
  });

  const { data: opponentStats, isLoading: loadingOpponents, refetch: refetchOpponents } = useQuery({
    queryKey: ['opponent-stats'],
    queryFn: getStatsByOpponent,
  });

  const { data: commanderStats, isLoading: loadingCommanders, refetch: refetchCommanders } = useQuery({
    queryKey: ['commander-stats'],
    queryFn: getStatsByCommander,
  });

  const isLoading = loadingOverall || loadingDecks || loadingOpponents || loadingCommanders;

  const refetchAll = () => {
    refetchOverall();
    refetchDecks();
    refetchOpponents();
    refetchCommanders();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetchAll}
          tintColor="#7c3aed"
          colors={['#7c3aed']}
        />
      }
    >
      {/* Overall Stats */}
      <SectionHeader title="Overall" />
      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-2xl font-bold text-primary">
            {overall?.total_games || 0}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">Total Games</Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-2xl font-bold text-success">
            {overall?.total_games
              ? `${Math.round(overall.win_rate * 100)}%`
              : 'N/A'}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">Win Rate</Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-2xl font-bold text-accent">
            {overall?.total_games ? overall.avg_placement.toFixed(1) : 'N/A'}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">Avg Place</Text>
        </View>
      </View>

      {/* Win Rate Progress */}
      {overall && overall.total_games > 0 && (
        <View className="bg-card rounded-xl p-4 border border-card-border mb-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary text-sm">Overall Win Rate</Text>
            <Text className="text-white text-sm font-semibold">
              {overall.wins}/{overall.total_games} games
            </Text>
          </View>
          <View className="h-3 bg-card-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.round(overall.win_rate * 100)}%` }}
            />
          </View>
        </View>
      )}

      {/* By Deck */}
      <SectionHeader title="Win Rate by Deck" />
      {deckStats && deckStats.length > 0 ? (
        deckStats.map((stat, i) => <DeckStatRow key={i} stat={stat} />)
      ) : (
        <View className="bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-text-muted text-sm">No deck data yet</Text>
        </View>
      )}

      {/* By Opponent */}
      <SectionHeader title="Win Rate vs Opponents" />
      {opponentStats && opponentStats.length > 0 ? (
        opponentStats.map((stat, i) => <OpponentStatRow key={i} stat={stat} />)
      ) : (
        <View className="bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-text-muted text-sm">No opponent data yet</Text>
        </View>
      )}

      {/* By Commander */}
      <SectionHeader title="Win Rate vs Commanders" />
      {commanderStats && commanderStats.length > 0 ? (
        commanderStats.map((stat, i) => <CommanderStatRow key={i} stat={stat} />)
      ) : (
        <View className="bg-card rounded-xl p-4 border border-card-border items-center">
          <Text className="text-text-muted text-sm">No commander data yet</Text>
        </View>
      )}
    </ScrollView>
  );
}
