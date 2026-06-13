import { Text, View } from 'react-native';

interface StatProps {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
}

export function Stat({ label, value, hint, valueColor }: StatProps) {
  return (
    <View className="flex-1 min-w-[88px]">
      <Text className="text-text-faint text-[11px] uppercase tracking-wide">
        {label}
      </Text>
      <Text
        className="text-text text-xl font-bold mt-0.5"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </Text>
      {hint ? (
        <Text className="text-text-faint text-[11px] mt-0.5">{hint}</Text>
      ) : null}
    </View>
  );
}
