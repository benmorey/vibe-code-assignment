import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDecks, getStatsByDeck } from '../../lib/db/queries';
import { syncDecks } from '../../lib/api/archidekt';
import { useSettingsStore } from '../../lib/store/settingsStore';
import { ManaColors } from '../../components/ManaColors';
import type { Deck } from '@commander-stats/shared';

function DeckRow({ deck, winRate, totalGames }: { deck: Deck; winRate: number; totalGames: number }) {
  return (
    <View className="bg-card rounded-xl p-4 mb-3 border border-card-border">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {deck.name}
          </Text>
          {deck.commander ? (
            <Text className="text-primary text-sm mt-0.5">{deck.commander}</Text>
          ) : null}
          {deck.colors ? (
            <View className="mt-2">
              <ManaColors colors={deck.colors} size={14} />
            </View>
          ) : null}
          <Text className="text-text-muted text-xs mt-2">
            {deck.card_count} cards
            {deck.synced_at ? ` • Synced ${new Date(deck.synced_at).toLocaleDateString()}` : ''}
          </Text>
        </View>
        <View className="items-end">
          {totalGames > 0 ? (
            <>
              <Text className="text-primary font-bold text-lg">
                {Math.round(winRate * 100)}%
              </Text>
              <Text className="text-text-muted text-xs">{totalGames}G</Text>
            </>
          ) : (
            <Text className="text-text-muted text-sm">N/A</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function DecksScreen() {
  const queryClient = useQueryClient();
  const { archidekt_username, saveSettings } = useSettingsStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [usernameInput, setUsernameInput] = useState(archidekt_username);

  const { data: decks, isLoading, refetch } = useQuery({
    queryKey: ['decks'],
    queryFn: getDecks,
  });

  const { data: deckStats } = useQuery({
    queryKey: ['deck-stats'],
    queryFn: getStatsByDeck,
  });

  const syncMutation = useMutation({
    mutationFn: () => {
      if (!archidekt_username) {
        throw new Error('Please set your Archidekt username first');
      }
      return syncDecks(archidekt_username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      queryClient.invalidateQueries({ queryKey: ['deck-stats'] });
      Alert.alert('Success', 'Decks synced successfully!');
    },
    onError: (error: Error) => {
      Alert.alert('Sync Failed', error.message);
    },
  });

  const handleSaveSettings = async () => {
    await saveSettings({ archidekt_username: usernameInput });
    setSettingsVisible(false);
  };

  const getStatsForDeck = (deckId: number) => {
    return deckStats?.find(s => s.deck.id === deckId) || null;
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header Actions */}
      <View className="flex-row px-4 pt-4 pb-2 gap-3">
        <TouchableOpacity
          onPress={() => syncMutation.mutate()}
          disabled={syncMutation.isPending || !archidekt_username}
          className={`flex-1 py-3 rounded-xl items-center ${
            syncMutation.isPending || !archidekt_username
              ? 'bg-card'
              : 'bg-primary'
          }`}
        >
          {syncMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className={`font-semibold text-sm ${
              !archidekt_username ? 'text-text-muted' : 'text-white'
            }`}>
              ↻ Sync from Archidekt
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setUsernameInput(archidekt_username);
            setSettingsVisible(true);
          }}
          className="bg-card px-4 py-3 rounded-xl border border-card-border"
        >
          <Text className="text-white text-sm">⚙️</Text>
        </TouchableOpacity>
      </View>

      {!archidekt_username && (
        <View className="mx-4 mb-4 bg-accent/20 rounded-xl p-3 border border-accent/40">
          <Text className="text-accent text-sm text-center">
            Set your Archidekt username to sync your decks
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
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
          <View className="py-8 items-center">
            <ActivityIndicator color="#7c3aed" />
          </View>
        ) : decks && decks.length > 0 ? (
          <>
            <Text className="text-text-secondary text-xs mb-3">
              {decks.length} deck{decks.length !== 1 ? 's' : ''}
            </Text>
            {decks.map(deck => {
              const stats = getStatsForDeck(deck.id);
              return (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  winRate={stats?.win_rate || 0}
                  totalGames={stats?.total_games || 0}
                />
              );
            })}
          </>
        ) : (
          <View className="py-16 items-center">
            <Text className="text-5xl mb-4">🃏</Text>
            <Text className="text-white font-semibold text-lg mb-2">No Decks Yet</Text>
            <Text className="text-text-secondary text-sm text-center px-8">
              {archidekt_username
                ? 'Tap "Sync from Archidekt" to import your decks'
                : 'Set your Archidekt username to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6 border-t border-card-border">
            <Text className="text-white font-bold text-xl mb-6">Archidekt Settings</Text>

            <Text className="text-text-secondary text-sm mb-2">Archidekt Username</Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Enter your username"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-background rounded-xl px-4 py-3 text-white border border-card-border mb-6"
            />

            <TouchableOpacity
              onPress={handleSaveSettings}
              className="bg-primary rounded-xl py-4 items-center mb-3"
            >
              <Text className="text-white font-bold text-base">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSettingsVisible(false)}
              className="py-3 items-center"
            >
              <Text className="text-text-secondary text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
