import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGameWithDetails,
  getBoardStatesForGame,
  deleteGame,
} from '../../lib/db/queries';
import type { BoardStateWithCards, GamePlayerWithOpponent } from '@commander-stats/shared';
import { ManaColors } from '../../components/ManaColors';

function PlayerRow({ player }: { player: GamePlayerWithOpponent }) {
  const isWin = player.placement === 1;
  const suffix = player.placement === 1 ? 'st' : player.placement === 2 ? 'nd' : player.placement === 3 ? 'rd' : 'th';

  return (
    <View className="flex-row items-center py-3 border-b border-card-border last:border-0">
      <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
        <Text className="text-primary text-xs font-bold">{player.turn_order}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-medium">
          {player.is_me ? 'You' : player.opponent?.name || 'Opponent'}
          {player.is_me ? ' (you)' : ''}
        </Text>
        {player.commander_name ? (
          <Text className="text-text-secondary text-xs">{player.commander_name}</Text>
        ) : null}
      </View>
      <View className={`px-2 py-1 rounded-lg ${isWin ? 'bg-success/20' : 'bg-card-border'}`}>
        <Text className={`text-xs font-bold ${isWin ? 'text-success' : 'text-text-secondary'}`}>
          {player.placement}{suffix}
        </Text>
      </View>
    </View>
  );
}

function BoardStateCard({ state }: { state: BoardStateWithCards }) {
  const [expanded, setExpanded] = useState(false);
  const battlefield = state.cards.filter(c => c.zone === 'battlefield');
  const graveyard = state.cards.filter(c => c.zone === 'graveyard');
  const exile = state.cards.filter(c => c.zone === 'exile');
  const totalLands = state.lands.reduce((s, l) => s + l.count, 0);

  return (
    <View className="bg-card rounded-xl border border-card-border mb-3 overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="p-4"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-semibold text-sm">Turn {state.turn_number}</Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              {battlefield.length} on battlefield • {totalLands} lands • {state.cards_in_hand_count} in hand
            </Text>
          </View>
          <Text className="text-text-muted text-lg">{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-card-border">
          {/* Lands */}
          {state.lands.length > 0 && (
            <View className="mt-3">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Lands ({totalLands})</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {state.lands.map((land, i) => (
                  <View key={i} className="bg-background px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs">{land.land_type} ×{land.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Battlefield */}
          {battlefield.length > 0 && (
            <View className="mt-3">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
                Battlefield ({battlefield.length})
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {battlefield.map((card, i) => (
                  <View key={i} className="bg-background px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs">{card.card_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Graveyard */}
          {graveyard.length > 0 && (
            <View className="mt-3">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
                Graveyard ({graveyard.length})
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {graveyard.map((card, i) => (
                  <View key={i} className="bg-background px-2 py-1 rounded-lg">
                    <Text className="text-text-secondary text-xs">{card.card_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Exile */}
          {exile.length > 0 && (
            <View className="mt-3">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
                Exile ({exile.length})
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {exile.map((card, i) => (
                  <View key={i} className="bg-background px-2 py-1 rounded-lg">
                    <Text className="text-text-muted text-xs">{card.card_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {state.notes && (
            <View className="mt-3">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-1">Notes</Text>
              <Text className="text-text-secondary text-sm">{state.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const gameId = parseInt(id, 10);

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGameWithDetails(gameId),
    enabled: !isNaN(gameId),
  });

  const { data: boardStates } = useQuery({
    queryKey: ['board-states', gameId],
    queryFn: () => getBoardStatesForGame(gameId),
    enabled: !isNaN(gameId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['overall-stats'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Loading...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Game not found</Text>
      </View>
    );
  }

  const isWin = game.my_placement === 1;
  const sortedPlayers = [...game.players].sort((a, b) => a.turn_order - b.turn_order);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Game Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="pr-2">
              <Text className="text-error text-sm">Delete</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Result Banner */}
        <View
          className={`rounded-xl p-5 mb-4 border ${
            isWin ? 'bg-success/10 border-success/30' : 'bg-card border-card-border'
          }`}
        >
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-white font-bold text-xl">
                {game.deck?.name || 'Unknown Deck'}
              </Text>
              {game.deck?.commander ? (
                <Text className="text-primary text-sm mt-0.5">{game.deck.commander}</Text>
              ) : null}
              {game.deck?.colors ? (
                <View className="mt-2">
                  <ManaColors colors={game.deck.colors} size={14} />
                </View>
              ) : null}
            </View>
            <View className="items-end">
              <Text
                className={`text-3xl font-black ${isWin ? 'text-success' : 'text-white'}`}
              >
                {game.my_placement}{game.my_placement === 1 ? 'st' : game.my_placement === 2 ? 'nd' : game.my_placement === 3 ? 'rd' : 'th'}
              </Text>
              {isWin && <Text className="text-success text-xs mt-0.5">Winner!</Text>}
            </View>
          </View>
        </View>

        {/* Game Info */}
        <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-3">Game Info</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary text-sm">Date</Text>
            <Text className="text-white text-sm">
              {new Date(game.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary text-sm">Players</Text>
            <Text className="text-white text-sm">{game.player_count}</Text>
          </View>
        </View>

        {/* Players */}
        <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Players</Text>
          {sortedPlayers.map(player => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </View>

        {/* Notes */}
        {game.notes && (
          <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
            <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Notes</Text>
            <Text className="text-white text-sm">{game.notes}</Text>
          </View>
        )}

        {/* Board States */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-muted text-xs uppercase tracking-wider">
              Board States ({boardStates?.length || 0})
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/scan?gameId=${gameId}`)}
              className="bg-primary/20 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-primary text-xs font-semibold">+ Add Scan</Text>
            </TouchableOpacity>
          </View>

          {boardStates && boardStates.length > 0 ? (
            boardStates.map(state => (
              <BoardStateCard key={state.id} state={state} />
            ))
          ) : (
            <View className="bg-card rounded-xl p-4 border border-card-border items-center">
              <Text className="text-text-muted text-sm">No board states captured</Text>
              <Text className="text-text-muted text-xs mt-1 text-center">
                Use the camera scan to capture your board state
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
