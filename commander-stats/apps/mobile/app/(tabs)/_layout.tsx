import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ focused, color, icon }: { focused: boolean; color: string; icon: string }) {
  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: 22, color }}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          color: '#ffffff',
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="🏠" />
          ),
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: 'My Decks',
          tabBarLabel: 'Decks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="🃏" />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log Game',
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="✏️" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="📋" />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistics',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="📊" />
          ),
        }}
      />
    </Tabs>
  );
}
