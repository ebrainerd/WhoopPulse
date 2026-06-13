import { Redirect, Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { Splash } from '@/components/ui/Splash';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { colors } from '@/theme/colors';

function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { session, loading } = useAuth();
  const { profile, loading: dataLoading } = useData();

  if (loading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (dataLoading) return <Splash message="Loading your data…" />;
  if (!profile?.onboardedAt) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.borderSubtle,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon icon="◎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <TabIcon icon="✎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fast"
        options={{
          title: 'Fast',
          tabBarIcon: ({ color }) => <TabIcon icon="⏱" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon icon="📈" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabIcon icon="✦" color={color} />,
        }}
      />
    </Tabs>
  );
}
