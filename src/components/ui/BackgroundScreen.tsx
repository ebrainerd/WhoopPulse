import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backgrounds, type BackgroundKey } from '@/theme/backgrounds';
import { colors } from '@/theme/colors';

interface BackgroundScreenProps {
  children: ReactNode;
  image?: BackgroundKey;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentClassName?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

// Strong dark scrim so light text stays readable over any photo.
const SCRIM: [string, string, string] = [
  'rgba(8,11,15,0.62)',
  'rgba(8,11,15,0.86)',
  'rgba(8,11,15,0.97)',
];

/**
 * A screen with a fixed nature photo background, a dark gradient scrim for
 * readability, and a subtle fade-in for content. Background stays put while
 * content scrolls over it.
 */
export function BackgroundScreen({
  children,
  image = 'coast',
  scroll = true,
  refreshing,
  onRefresh,
  contentClassName = '',
  edges = ['top'],
}: BackgroundScreenProps) {
  const content = (
    <Animated.View
      entering={FadeIn.duration(350)}
      className={`flex-1 px-4 ${contentClassName}`}
    >
      {children}
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-bg">
      <Image
        source={backgrounds[image]}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={SCRIM}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className="flex-1" edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={Boolean(refreshing)}
                  onRefresh={onRefresh}
                  tintColor={colors.accent}
                  colors={[colors.accent]}
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48, flexGrow: 1 },
});
