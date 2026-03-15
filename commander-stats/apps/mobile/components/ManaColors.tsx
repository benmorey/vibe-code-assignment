import { View, Text } from 'react-native';

const MANA_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  W: { bg: '#f9f6ee', text: '#1f2937', label: 'W' },
  U: { bg: '#0e68ab', text: '#ffffff', label: 'U' },
  B: { bg: '#150b00', text: '#d4d4d4', label: 'B' },
  R: { bg: '#d3202a', text: '#ffffff', label: 'R' },
  G: { bg: '#00733e', text: '#ffffff', label: 'G' },
  C: { bg: '#9ca3af', text: '#1f2937', label: 'C' },
};

interface ManaColorsProps {
  colors: string;
  size?: number;
  showLabel?: boolean;
}

export function ManaColors({ colors, size = 14, showLabel = false }: ManaColorsProps) {
  if (!colors || colors.length === 0) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#4b5563',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: size * 0.55, color: '#9ca3af' }}>C</Text>
      </View>
    );
  }

  // Parse the color string (e.g., "WUBRG", "UB", "RG")
  const colorOrder = ['W', 'U', 'B', 'R', 'G'];
  const colorChars = colorOrder.filter(c => colors.toUpperCase().includes(c));

  if (colorChars.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {colorChars.map(color => {
        const config = MANA_COLORS[color];
        if (!config) return null;
        return (
          <View
            key={color}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: config.bg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 0.5,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: size * 0.55, color: config.text, fontWeight: '700' }}>
              {showLabel ? config.label : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function ColorlessMana({ size = 14 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#4b5563',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
