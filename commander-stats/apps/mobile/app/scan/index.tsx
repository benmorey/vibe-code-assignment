import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeBoardState } from '../../lib/api/vision';
import {
  insertBoardState,
  insertBoardStateCard,
  insertBoardStateLand,
} from '../../lib/db/queries';
import { useSettingsStore } from '../../lib/store/settingsStore';
import type { VisionBoardState, VisionCard, VisionLand } from '@commander-stats/shared';

function ZoneSection({
  title,
  cards,
  emptyText,
}: {
  title: string;
  cards: VisionCard[];
  emptyText: string;
}) {
  if (cards.length === 0) {
    return (
      <View className="mb-4">
        <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">{title}</Text>
        <Text className="text-text-muted text-sm italic">{emptyText}</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
        {title} ({cards.length})
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {cards.map((card, i) => (
          <View key={i} className="bg-background px-2.5 py-1.5 rounded-lg border border-card-border">
            <Text className="text-white text-xs">
              {card.quantity > 1 ? `${card.quantity}x ` : ''}{card.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LandSection({ lands }: { lands: VisionLand[] }) {
  if (lands.length === 0) {
    return null;
  }

  const total = lands.reduce((s, l) => s + l.count, 0);

  return (
    <View className="mb-4">
      <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
        Lands ({total})
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {lands.map((land, i) => (
          <View key={i} className="bg-background px-2.5 py-1.5 rounded-lg border border-card-border">
            <Text className="text-white text-xs">{land.land_type} ×{land.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { claude_api_key } = useSettingsStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [boardState, setBoardState] = useState<VisionBoardState | null>(null);
  const [turnNumber, setTurnNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(claude_api_key);

  const analyzeMutation = useMutation({
    mutationFn: async (uri: string) => {
      const key = apiKeyInput || claude_api_key;
      if (!key) {
        throw new Error('Please enter your Claude API key');
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return analyzeBoardState(base64, key);
    },
    onSuccess: (data) => {
      setBoardState(data);
      if (data.turn_number) {
        setTurnNumber(String(data.turn_number));
      }
      if (data.notes) {
        setNotes(data.notes);
      }
    },
    onError: (error: Error) => {
      Alert.alert('Analysis Failed', error.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!boardState || !gameId) return;

      const gId = parseInt(gameId, 10);
      const turnNum = parseInt(turnNumber, 10) || 1;

      const handCount = boardState.hand_count || 0;
      const stateId = await insertBoardState({
        game_id: gId,
        cards_in_hand_count: handCount,
        turn_number: turnNum,
        notes: notes || null,
      });

      // Insert battlefield cards
      for (const card of boardState.battlefield) {
        for (let q = 0; q < (card.quantity || 1); q++) {
          await insertBoardStateCard({
            board_state_id: stateId,
            card_name: card.name,
            scryfall_id: null,
            zone: 'battlefield',
          });
        }
      }

      // Insert graveyard cards
      for (const card of boardState.graveyard) {
        for (let q = 0; q < (card.quantity || 1); q++) {
          await insertBoardStateCard({
            board_state_id: stateId,
            card_name: card.name,
            scryfall_id: null,
            zone: 'graveyard',
          });
        }
      }

      // Insert exile cards
      for (const card of boardState.exile) {
        for (let q = 0; q < (card.quantity || 1); q++) {
          await insertBoardStateCard({
            board_state_id: stateId,
            card_name: card.name,
            scryfall_id: null,
            zone: 'exile',
          });
        }
      }

      // Insert lands
      for (const land of boardState.lands) {
        await insertBoardStateLand({
          board_state_id: stateId,
          land_type: land.land_type,
          count: land.count,
        });
      }

      return stateId;
    },
    onSuccess: () => {
      if (gameId) {
        queryClient.invalidateQueries({ queryKey: ['board-states', parseInt(gameId)] });
      }
      Alert.alert('Saved!', 'Board state has been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Save Failed', error.message);
    },
  });

  const pickImage = useCallback(async (source: 'camera' | 'library') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is needed.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setBoardState(null);
      analyzeMutation.mutate(uri);
    }
  }, [analyzeMutation]);

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Board State' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* API Key Section */}
        {!claude_api_key && (
          <View className="bg-accent/10 rounded-xl p-4 border border-accent/30 mb-4">
            <Text className="text-accent text-sm font-semibold mb-2">Claude API Key Required</Text>
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor="#6b7280"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-background rounded-lg px-3 py-2.5 text-white text-sm border border-card-border"
            />
            <Text className="text-text-muted text-xs mt-2">
              Get your API key at console.anthropic.com
            </Text>
          </View>
        )}

        {/* Image Capture */}
        {!imageUri ? (
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-2">Capture Board State</Text>
            <Text className="text-text-secondary text-sm mb-4">
              Take or select a photo of your current board to analyze with AI
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => pickImage('camera')}
                className="flex-1 bg-primary rounded-xl py-4 items-center"
              >
                <Text className="text-4xl mb-1">📷</Text>
                <Text className="text-white font-semibold text-sm">Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage('library')}
                className="flex-1 bg-card rounded-xl py-4 items-center border border-card-border"
              >
                <Text className="text-4xl mb-1">🖼️</Text>
                <Text className="text-white font-semibold text-sm">Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="mb-4">
            <View className="relative rounded-xl overflow-hidden mb-3">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-56 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  setImageUri(null);
                  setBoardState(null);
                }}
                className="absolute top-2 right-2 bg-black/60 rounded-full px-3 py-1"
              >
                <Text className="text-white text-xs">Change</Text>
              </TouchableOpacity>
            </View>

            {analyzeMutation.isPending && (
              <View className="bg-card rounded-xl p-6 items-center border border-card-border mb-4">
                <ActivityIndicator color="#7c3aed" size="large" />
                <Text className="text-white font-semibold mt-3">Analyzing board state...</Text>
                <Text className="text-text-secondary text-sm mt-1">
                  Claude is identifying cards and lands
                </Text>
              </View>
            )}

            {analyzeMutation.isError && (
              <View className="bg-error/10 rounded-xl p-4 border border-error/30 mb-4">
                <Text className="text-error text-sm font-semibold">Analysis failed</Text>
                <TouchableOpacity
                  onPress={() => imageUri && analyzeMutation.mutate(imageUri)}
                  className="mt-2"
                >
                  <Text className="text-primary text-sm">Try again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Board State Results */}
        {boardState && (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-lg">Board State</Text>
              <View className="bg-success/20 px-3 py-1 rounded-full">
                <Text className="text-success text-xs font-semibold">Analyzed</Text>
              </View>
            </View>

            {/* Summary row */}
            <View className="flex-row gap-2 mb-4">
              <View className="flex-1 bg-card rounded-xl p-3 border border-card-border items-center">
                <Text className="text-primary font-bold text-xl">
                  {boardState.battlefield.length}
                </Text>
                <Text className="text-text-muted text-xs">Battlefield</Text>
              </View>
              <View className="flex-1 bg-card rounded-xl p-3 border border-card-border items-center">
                <Text className="text-text-secondary font-bold text-xl">
                  {boardState.lands.reduce((s, l) => s + l.count, 0)}
                </Text>
                <Text className="text-text-muted text-xs">Lands</Text>
              </View>
              <View className="flex-1 bg-card rounded-xl p-3 border border-card-border items-center">
                <Text className="text-warning font-bold text-xl">{boardState.hand_count}</Text>
                <Text className="text-text-muted text-xs">In Hand</Text>
              </View>
              <View className="flex-1 bg-card rounded-xl p-3 border border-card-border items-center">
                <Text className="text-error font-bold text-xl">{boardState.graveyard.length}</Text>
                <Text className="text-text-muted text-xs">Graveyard</Text>
              </View>
            </View>

            <View className="bg-card rounded-xl p-4 border border-card-border mb-4">
              <LandSection lands={boardState.lands} />
              <ZoneSection
                title="Battlefield"
                cards={boardState.battlefield}
                emptyText="No cards identified"
              />
              <ZoneSection
                title="Graveyard"
                cards={boardState.graveyard}
                emptyText="Graveyard empty"
              />
              {boardState.exile.length > 0 && (
                <ZoneSection
                  title="Exile"
                  cards={boardState.exile}
                  emptyText=""
                />
              )}
            </View>

            {/* Turn & Notes */}
            <View className="mb-4">
              <Text className="text-text-secondary text-sm mb-2">Turn Number</Text>
              <TextInput
                value={turnNumber}
                onChangeText={setTurnNumber}
                keyboardType="number-pad"
                className="bg-card rounded-xl px-4 py-3 text-white border border-card-border mb-4"
              />

              <Text className="text-text-secondary text-sm mb-2">Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any observations about this board state..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-card rounded-xl px-4 py-3 text-white border border-card-border min-h-[80px]"
              />
            </View>

            {/* Save Button */}
            {gameId && (
              <TouchableOpacity
                onPress={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="bg-primary rounded-xl py-4 items-center"
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Save Board State</Text>
                )}
              </TouchableOpacity>
            )}

            {!gameId && (
              <View className="bg-card rounded-xl p-4 border border-card-border items-center">
                <Text className="text-text-muted text-sm text-center">
                  Open this screen from a game to save the board state
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}
