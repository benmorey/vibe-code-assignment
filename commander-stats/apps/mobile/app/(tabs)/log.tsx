import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '../../lib/store/gameStore';
import {
  getDecks,
  insertGame,
  insertGamePlayer,
  findOrCreateOpponent,
} from '../../lib/db/queries';
import type { Deck, NewGameOpponent } from '@commander-stats/shared';
import { ManaColors } from '../../components/ManaColors';
import { CommanderSearch } from '../../components/CommanderSearch';

const STEPS = ['Setup', 'Opponents', 'Results', 'Review'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row justify-center mb-6 gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-2 rounded-full ${
            i === current ? 'bg-primary w-6' : i < current ? 'bg-primary/50 w-2' : 'bg-card-border w-2'
          }`}
        />
      ))}
    </View>
  );
}

function DeckPicker({ selectedId, onSelect }: { selectedId: number | null; onSelect: (id: number) => void }) {
  const { data: decks, isLoading } = useQuery({ queryKey: ['decks'], queryFn: getDecks });

  if (isLoading) {
    return <Text className="text-text-secondary text-sm py-4">Loading decks...</Text>;
  }

  if (!decks || decks.length === 0) {
    return (
      <Text className="text-text-muted text-sm py-4">
        No decks found. Sync from Archidekt in the Decks tab.
      </Text>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      {decks.map((deck: Deck) => (
        <TouchableOpacity
          key={deck.id}
          onPress={() => onSelect(deck.id)}
          className={`mr-3 p-3 rounded-xl border min-w-[140px] ${
            selectedId === deck.id
              ? 'bg-primary/20 border-primary'
              : 'bg-card border-card-border'
          }`}
        >
          <Text
            className={`font-semibold text-sm mb-1 ${
              selectedId === deck.id ? 'text-primary' : 'text-white'
            }`}
            numberOfLines={2}
          >
            {deck.name}
          </Text>
          {deck.commander ? (
            <Text className="text-text-secondary text-xs" numberOfLines={1}>{deck.commander}</Text>
          ) : null}
          {deck.colors ? <ManaColors colors={deck.colors} size={12} /> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function OpponentRow({
  opponent,
  index,
  onUpdate,
  onRemove,
}: {
  opponent: NewGameOpponent;
  index: number;
  onUpdate: (data: Partial<NewGameOpponent>) => void;
  onRemove: () => void;
}) {
  return (
    <View className="bg-card rounded-xl p-4 mb-3 border border-card-border">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-text-secondary text-xs font-medium">
          Player {index + 2} • Turn {opponent.turn_order}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Text className="text-error text-sm">Remove</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={opponent.name}
        onChangeText={text => onUpdate({ name: text })}
        placeholder="Opponent name"
        placeholderTextColor="#6b7280"
        className="bg-background rounded-lg px-3 py-2.5 text-white text-sm border border-card-border mb-2"
      />

      <CommanderSearch
        value={opponent.commander_name}
        onSelect={name => onUpdate({ commander_name: name })}
        placeholder="Commander name"
      />
    </View>
  );
}

export default function LogGameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    currentGame,
    currentStep,
    nextStep,
    prevStep,
    resetGame,
    setDate,
    setPlayerCount,
    setMyDeckId,
    setMyTurnOrder,
    setMyPlacement,
    setNotes,
    addOpponent,
    updateOpponent,
    removeOpponent,
  } = useGameStore();

  const { data: decks } = useQuery({ queryKey: ['decks'], queryFn: getDecks });

  const saveGameMutation = useMutation({
    mutationFn: async () => {
      if (!currentGame.my_deck_id || currentGame.my_placement === null) {
        throw new Error('Please fill in all required fields');
      }

      const gameId = await insertGame({
        date: currentGame.date,
        player_count: currentGame.player_count,
        my_placement: currentGame.my_placement,
        my_deck_id: currentGame.my_deck_id,
        notes: currentGame.notes || null,
      });

      const deck = decks?.find(d => d.id === currentGame.my_deck_id);

      // Insert my player entry
      await insertGamePlayer({
        game_id: gameId,
        opponent_id: null,
        commander_name: deck?.commander || '',
        commander_id: null,
        placement: currentGame.my_placement,
        turn_order: currentGame.my_turn_order,
        is_me: 1,
      });

      // Insert opponents
      for (const opp of currentGame.opponents) {
        const opponentId = opp.name ? await findOrCreateOpponent(opp.name) : null;
        await insertGamePlayer({
          game_id: gameId,
          opponent_id: opponentId,
          commander_name: opp.commander_name,
          commander_id: null,
          placement: opp.placement || 0,
          turn_order: opp.turn_order,
          is_me: 0,
        });
      }

      return gameId;
    },
    onSuccess: (gameId) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['overall-stats'] });
      queryClient.invalidateQueries({ queryKey: ['deck-stats'] });
      resetGame();
      Alert.alert(
        'Game Logged!',
        'Would you like to add a board state snapshot?',
        [
          {
            text: 'Skip',
            style: 'cancel',
            onPress: () => router.push('/(tabs)/history'),
          },
          {
            text: 'Add Board State',
            onPress: () => router.push(`/game/${gameId}`),
          },
        ]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const addNewOpponent = useCallback(() => {
    const turnOrder = currentGame.opponents.length + 2;
    addOpponent({
      name: '',
      commander_name: '',
      placement: null,
      turn_order: turnOrder,
    });
  }, [currentGame.opponents.length, addOpponent]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text className="text-white font-bold text-lg mb-4">Game Setup</Text>

            {/* Date */}
            <Text className="text-text-secondary text-sm mb-2">Date</Text>
            <TextInput
              value={currentGame.date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6b7280"
              className="bg-card rounded-xl px-4 py-3 text-white border border-card-border mb-4"
            />

            {/* Player Count */}
            <Text className="text-text-secondary text-sm mb-2">Number of Players</Text>
            <View className="flex-row gap-2 mb-4">
              {[2, 3, 4, 5, 6].map(count => (
                <TouchableOpacity
                  key={count}
                  onPress={() => setPlayerCount(count)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    currentGame.player_count === count
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card border-card-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      currentGame.player_count === count ? 'text-primary' : 'text-white'
                    }`}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Turn Order */}
            <Text className="text-text-secondary text-sm mb-2">My Turn Order</Text>
            <View className="flex-row gap-2 mb-4">
              {Array.from({ length: currentGame.player_count }, (_, i) => i + 1).map(order => (
                <TouchableOpacity
                  key={order}
                  onPress={() => setMyTurnOrder(order)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    currentGame.my_turn_order === order
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card border-card-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      currentGame.my_turn_order === order ? 'text-primary' : 'text-white'
                    }`}
                  >
                    {order}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deck Selection */}
            <Text className="text-text-secondary text-sm mb-2">Select Your Deck</Text>
            <DeckPicker
              selectedId={currentGame.my_deck_id}
              onSelect={setMyDeckId}
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text className="text-white font-bold text-lg mb-4">Opponents</Text>
            <Text className="text-text-secondary text-sm mb-4">
              Add {currentGame.player_count - 1} opponent{currentGame.player_count > 2 ? 's' : ''} (optional)
            </Text>

            {currentGame.opponents.map((opp, index) => (
              <OpponentRow
                key={index}
                opponent={opp}
                index={index}
                onUpdate={data => updateOpponent(index, data)}
                onRemove={() => removeOpponent(index)}
              />
            ))}

            {currentGame.opponents.length < currentGame.player_count - 1 && (
              <TouchableOpacity
                onPress={addNewOpponent}
                className="border-2 border-dashed border-card-border rounded-xl py-4 items-center mb-4"
              >
                <Text className="text-text-secondary text-sm">+ Add Opponent</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="text-white font-bold text-lg mb-4">Results</Text>

            {/* My Placement */}
            <Text className="text-text-secondary text-sm mb-2">My Final Placement</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {Array.from({ length: currentGame.player_count }, (_, i) => i + 1).map(place => (
                <TouchableOpacity
                  key={place}
                  onPress={() => setMyPlacement(place)}
                  className={`px-5 py-3 rounded-xl border ${
                    currentGame.my_placement === place
                      ? place === 1
                        ? 'bg-success/20 border-success'
                        : 'bg-primary/20 border-primary'
                      : 'bg-card border-card-border'
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      currentGame.my_placement === place
                        ? place === 1 ? 'text-success' : 'text-primary'
                        : 'text-white'
                    }`}
                  >
                    {place === 1 ? '🏆 1st' : `${place}${place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Opponent Placements */}
            {currentGame.opponents.length > 0 && (
              <>
                <Text className="text-text-secondary text-sm mb-3">Opponent Placements (optional)</Text>
                {currentGame.opponents.map((opp, index) => (
                  <View key={index} className="mb-3">
                    <Text className="text-white text-sm mb-2">
                      {opp.name || `Opponent ${index + 1}`}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {Array.from({ length: currentGame.player_count }, (_, i) => i + 1).map(place => (
                        <TouchableOpacity
                          key={place}
                          onPress={() => updateOpponent(index, { placement: place })}
                          className={`px-4 py-2 rounded-lg border ${
                            opp.placement === place
                              ? 'bg-primary/20 border-primary'
                              : 'bg-card border-card-border'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              opp.placement === place ? 'text-primary' : 'text-white'
                            }`}
                          >
                            {place}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Notes */}
            <Text className="text-text-secondary text-sm mb-2">Notes (optional)</Text>
            <TextInput
              value={currentGame.notes}
              onChangeText={setNotes}
              placeholder="How did the game go?"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-card rounded-xl px-4 py-3 text-white border border-card-border min-h-[80px]"
            />
          </View>
        );

      case 3: {
        const deck = decks?.find(d => d.id === currentGame.my_deck_id);
        return (
          <View>
            <Text className="text-white font-bold text-lg mb-4">Review</Text>

            <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-3">Game Summary</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-text-secondary text-sm">Date</Text>
                <Text className="text-white text-sm">{currentGame.date}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-text-secondary text-sm">Players</Text>
                <Text className="text-white text-sm">{currentGame.player_count}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-text-secondary text-sm">Deck</Text>
                <Text className="text-white text-sm" numberOfLines={1}>
                  {deck?.name || 'Not selected'}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-text-secondary text-sm">My Turn Order</Text>
                <Text className="text-white text-sm">{currentGame.my_turn_order}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-text-secondary text-sm">Placement</Text>
                <Text
                  className={`text-sm font-bold ${
                    currentGame.my_placement === 1 ? 'text-success' : 'text-white'
                  }`}
                >
                  {currentGame.my_placement
                    ? `${currentGame.my_placement}${currentGame.my_placement === 1 ? 'st 🏆' : currentGame.my_placement === 2 ? 'nd' : currentGame.my_placement === 3 ? 'rd' : 'th'}`
                    : 'Not set'}
                </Text>
              </View>
            </View>

            {currentGame.opponents.length > 0 && (
              <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
                <Text className="text-text-muted text-xs uppercase tracking-wider mb-3">Opponents</Text>
                {currentGame.opponents.map((opp, i) => (
                  <View key={i} className="flex-row justify-between mb-2">
                    <Text className="text-text-secondary text-sm">
                      {opp.name || `Opponent ${i + 1}`}
                    </Text>
                    <Text className="text-white text-sm">{opp.commander_name || '—'}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentGame.notes ? (
              <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
                <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Notes</Text>
                <Text className="text-white text-sm">{currentGame.notes}</Text>
              </View>
            ) : null}
          </View>
        );
      }

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return currentGame.my_deck_id !== null;
      case 1:
        return true;
      case 2:
        return currentGame.my_placement !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="px-4 pt-4">
        <StepIndicator current={currentStep} total={STEPS.length} />
        <View className="flex-row justify-between mb-2">
          {STEPS.map((step, i) => (
            <Text
              key={step}
              className={`text-xs ${
                i === currentStep
                  ? 'text-primary font-semibold'
                  : i < currentStep
                  ? 'text-primary/60'
                  : 'text-text-muted'
              }`}
            >
              {step}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="px-4 pb-6 pt-3 border-t border-card-border flex-row gap-3">
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={prevStep}
            className="flex-1 bg-card py-4 rounded-xl items-center border border-card-border"
          >
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < STEPS.length - 1 ? (
          <TouchableOpacity
            onPress={nextStep}
            disabled={!canProceed()}
            className={`flex-1 py-4 rounded-xl items-center ${
              canProceed() ? 'bg-primary' : 'bg-primary/40'
            }`}
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => saveGameMutation.mutate()}
            disabled={saveGameMutation.isPending}
            className="flex-1 bg-success py-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold">
              {saveGameMutation.isPending ? 'Saving...' : 'Save Game'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
