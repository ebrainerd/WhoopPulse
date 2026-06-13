import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function Splash({ message }: { message?: string }) {
  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <Text className="text-accent text-2xl font-extrabold mb-4">
        Recovery Journal
      </Text>
      <ActivityIndicator color={colors.accent} />
      {message ? (
        <Text className="text-text-muted text-sm mt-3">{message}</Text>
      ) : null}
    </View>
  );
}
