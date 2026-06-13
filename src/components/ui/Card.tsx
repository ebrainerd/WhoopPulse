import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-bg-card border border-border-subtle p-4 ${className}`}
    >
      {children}
    </View>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
      {children}
    </Text>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3 mt-2">
      <Text className="text-text text-lg font-bold">{title}</Text>
      {action}
    </View>
  );
}
