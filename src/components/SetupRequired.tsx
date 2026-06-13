import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

/** Shown when Supabase env vars are missing so the app fails gracefully. */
export function SetupRequired() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-text text-2xl font-extrabold mb-2">
          Almost there
        </Text>
        <Text className="text-text-muted mb-4">
          The app isn’t connected to Supabase yet. Add your credentials to a
          `.env` file and restart.
        </Text>
        <Card>
          <Text className="text-text font-semibold mb-2">1. Create `.env`</Text>
          <Text className="text-text-muted text-sm mb-3">
            Copy `.env.example` and set:
          </Text>
          <View className="bg-bg-input rounded-lg p-3">
            <Text className="text-accent text-xs font-mono">
              EXPO_PUBLIC_SUPABASE_URL=…{'\n'}
              EXPO_PUBLIC_SUPABASE_ANON_KEY=…{'\n'}
              EXPO_PUBLIC_WHOOP_CLIENT_ID=…
            </Text>
          </View>
          <Text className="text-text font-semibold mt-4 mb-2">
            2. Run the migration
          </Text>
          <Text className="text-text-muted text-sm">
            Apply `supabase/migrations` to your project, then restart the dev
            server with `npm start`.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
