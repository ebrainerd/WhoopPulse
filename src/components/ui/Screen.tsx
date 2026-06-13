import type { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentClassName?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  contentClassName = '',
  edges = ['top'],
}: ScreenProps) {
  const inner = (
    <View className={`flex-1 px-4 ${contentClassName}`}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={scrollContent}
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
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const scrollContent: ScrollViewProps['contentContainerStyle'] = {
  paddingBottom: 48,
  flexGrow: 1,
};
