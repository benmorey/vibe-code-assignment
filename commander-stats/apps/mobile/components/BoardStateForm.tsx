import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { CardZone } from '@commander-stats/shared';

interface CardEntry {
  name: string;
  zone: CardZone;
}

interface LandEntry {
  land_type: string;
  count: number;
}

interface BoardStateFormProps {
  onSubmit: (data: {
    turn_number: number;
    cards_in_hand_count: number;
    cards: CardEntry[];
    lands: LandEntry[];
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

const LAND_TYPES = ['Forest', 'Island', 'Swamp', 'Mountain', 'Plains', 'Command Tower'];

const ZONES: { key: CardZone; label: string; color: string }[] = [
  { key: 'battlefield', label: 'Battlefield', color: 'bg-success/20 border-success/30 text-success' },
  { key: 'graveyard', label: 'Graveyard', color: 'bg-error/20 border-error/30 text-error' },
  { key: 'exile', label: 'Exile', color: 'bg-warning/20 border-warning/30 text-warning' },
];

export function BoardStateForm({ onSubmit, isSubmitting }: BoardStateFormProps) {
  const [turnNumber, setTurnNumber] = useState('1');
  const [handCount, setHandCount] = useState('7');
  const [cardInput, setCardInput] = useState('');
  const [selectedZone, setSelectedZone] = useState<CardZone>('battlefield');
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [lands, setLands] = useState<LandEntry[]>(
    LAND_TYPES.map(lt => ({ land_type: lt, count: 0 }))
  );
  const [notes, setNotes] = useState('');
  const [customLandInput, setCustomLandInput] = useState('');

  const addCard = () => {
    if (!cardInput.trim()) return;
    setCards(prev => [...prev, { name: cardInput.trim(), zone: selectedZone }]);
    setCardInput('');
  };

  const removeCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const updateLandCount = (index: number, delta: number) => {
    setLands(prev => prev.map((land, i) =>
      i === index ? { ...land, count: Math.max(0, land.count + delta) } : land
    ));
  };

  const addCustomLand = () => {
    if (!customLandInput.trim()) return;
    setLands(prev => [...prev, { land_type: customLandInput.trim(), count: 1 }]);
    setCustomLandInput('');
  };

  const handleSubmit = () => {
    onSubmit({
      turn_number: parseInt(turnNumber, 10) || 1,
      cards_in_hand_count: parseInt(handCount, 10) || 0,
      cards,
      lands: lands.filter(l => l.count > 0),
      notes,
    });
  };

  const cardsByZone = (zone: CardZone) => cards.filter(c => c.zone === zone);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Turn & Hand */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Turn Number</Text>
          <TextInput
            value={turnNumber}
            onChangeText={setTurnNumber}
            keyboardType="number-pad"
            className="bg-card rounded-xl px-4 py-3 text-white border border-card-border"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Cards in Hand</Text>
          <TextInput
            value={handCount}
            onChangeText={setHandCount}
            keyboardType="number-pad"
            className="bg-card rounded-xl px-4 py-3 text-white border border-card-border"
          />
        </View>
      </View>

      {/* Lands */}
      <Text className="text-white font-semibold mb-3">Lands</Text>
      {lands.map((land, index) => (
        <View key={index} className="flex-row items-center justify-between mb-2">
          <Text className="text-white text-sm flex-1">{land.land_type}</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => updateLandCount(index, -1)}
              className="w-8 h-8 bg-card-border rounded-lg items-center justify-center"
            >
              <Text className="text-white font-bold">−</Text>
            </TouchableOpacity>
            <Text className="text-white font-semibold w-6 text-center">{land.count}</Text>
            <TouchableOpacity
              onPress={() => updateLandCount(index, 1)}
              className="w-8 h-8 bg-primary rounded-lg items-center justify-center"
            >
              <Text className="text-white font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Custom Land */}
      <View className="flex-row gap-2 mb-6">
        <TextInput
          value={customLandInput}
          onChangeText={setCustomLandInput}
          placeholder="Add custom land..."
          placeholderTextColor="#6b7280"
          className="flex-1 bg-card rounded-xl px-3 py-2.5 text-white border border-card-border text-sm"
        />
        <TouchableOpacity
          onPress={addCustomLand}
          className="bg-card border border-primary px-4 rounded-xl items-center justify-center"
        >
          <Text className="text-primary font-semibold text-sm">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <Text className="text-white font-semibold mb-3">Cards</Text>

      {/* Zone Selector */}
      <View className="flex-row gap-2 mb-3">
        {ZONES.map(zone => (
          <TouchableOpacity
            key={zone.key}
            onPress={() => setSelectedZone(zone.key)}
            className={`flex-1 py-2 rounded-lg border ${
              selectedZone === zone.key ? zone.color : 'bg-card border-card-border'
            }`}
          >
            <Text
              className={`text-xs text-center font-medium ${
                selectedZone === zone.key ? '' : 'text-text-secondary'
              }`}
            >
              {zone.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Input */}
      <View className="flex-row gap-2 mb-4">
        <TextInput
          value={cardInput}
          onChangeText={setCardInput}
          onSubmitEditing={addCard}
          placeholder={`Add card to ${selectedZone}...`}
          placeholderTextColor="#6b7280"
          returnKeyType="done"
          className="flex-1 bg-card rounded-xl px-3 py-2.5 text-white border border-card-border text-sm"
        />
        <TouchableOpacity
          onPress={addCard}
          className="bg-primary px-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-semibold text-sm">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Cards List by Zone */}
      {ZONES.map(zone => {
        const zoneCards = cardsByZone(zone.key);
        if (zoneCards.length === 0) return null;
        return (
          <View key={zone.key} className="mb-4">
            <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
              {zone.label} ({zoneCards.length})
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {zoneCards.map((card, i) => {
                const globalIndex = cards.findIndex(
                  (c, idx) => c.zone === zone.key &&
                  cards.filter((cc, iidx) => cc.zone === zone.key && iidx < idx).length === i
                );
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => removeCard(
                      cards.findIndex(
                        (c, idx) =>
                          c.zone === zone.key &&
                          cards.filter((cc, j) => cc.zone === zone.key && j < idx).length === i
                      )
                    )}
                    className="bg-background px-2.5 py-1.5 rounded-lg border border-card-border flex-row items-center gap-1"
                  >
                    <Text className="text-white text-xs">{card.name}</Text>
                    <Text className="text-error text-xs">×</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Notes */}
      <Text className="text-text-secondary text-sm mb-2">Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Observations about this board state..."
        placeholderTextColor="#6b7280"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="bg-card rounded-xl px-4 py-3 text-white border border-card-border min-h-[80px] mb-4"
      />

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`py-4 rounded-xl items-center ${isSubmitting ? 'bg-primary/50' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold text-base">
          {isSubmitting ? 'Saving...' : 'Save Board State'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
