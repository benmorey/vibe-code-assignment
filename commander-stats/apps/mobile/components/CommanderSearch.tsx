import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { searchCards } from '../lib/api/scryfall';
import type { ScryfallCard } from '@commander-stats/shared';

interface CommanderSearchProps {
  value: string;
  onSelect: (name: string) => void;
  placeholder?: string;
}

export function CommanderSearch({ value, onSelect, placeholder = 'Search commander...' }: CommanderSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchCards(`is:commander ${text}`);
        setResults(data.data.slice(0, 8));
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const handleSelect = useCallback((card: ScryfallCard) => {
    setQuery(card.name);
    onSelect(card.name);
    setResults([]);
    setShowResults(false);
  }, [onSelect]);

  const handleManualEntry = useCallback(() => {
    onSelect(query);
    setResults([]);
    setShowResults(false);
  }, [query, onSelect]);

  return (
    <View>
      <View className="relative">
        <TextInput
          value={query}
          onChangeText={handleSearch}
          onBlur={() => {
            setTimeout(() => setShowResults(false), 200);
          }}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          className="bg-background rounded-lg px-3 py-2.5 text-white text-sm border border-card-border"
        />
        {isLoading && (
          <View className="absolute right-3 top-2.5">
            <ActivityIndicator size="small" color="#7c3aed" />
          </View>
        )}
      </View>

      {showResults && results.length > 0 && (
        <View className="bg-card rounded-xl border border-card-border mt-1 overflow-hidden max-h-48">
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                className="px-3 py-2.5 border-b border-card-border"
              >
                <Text className="text-white text-sm">{item.name}</Text>
                {item.type_line && (
                  <Text className="text-text-muted text-xs mt-0.5">{item.type_line}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {query.length > 2 && !showResults && value !== query && (
        <TouchableOpacity onPress={handleManualEntry} className="mt-1">
          <Text className="text-primary text-xs">Use "{query}" as commander name</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
