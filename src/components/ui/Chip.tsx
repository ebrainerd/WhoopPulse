import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`rounded-full px-3.5 py-2 mr-2 mb-2 border ${
        selected
          ? 'bg-accent border-accent'
          : 'bg-bg-input border-border'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-bg' : 'text-text-muted'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
