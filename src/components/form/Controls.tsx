import type { ReactNode } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="text-text font-semibold mb-2">{label}</Text>
      {children}
      {hint ? (
        <Text className="text-text-faint text-xs mt-1.5">{hint}</Text>
      ) : null}
    </View>
  );
}

interface SegmentedProps<T extends string | number> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            className={`px-3.5 py-2 rounded-xl border ${
              active ? 'bg-accent border-accent' : 'bg-bg-input border-border'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                active ? 'text-bg' : 'text-text-muted'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SCALE_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'OK',
  4: 'Good',
  5: 'Great',
};

export function Scale5({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <View>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n === value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                active ? 'bg-accent border-accent' : 'bg-bg-input border-border'
              }`}
            >
              <Text
                className={`font-bold ${active ? 'text-bg' : 'text-text-muted'}`}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-text-faint text-xs">{lowLabel ?? 'Low'}</Text>
        <Text className="text-text-faint text-xs">
          {SCALE_LABELS[value] ?? ''}
        </Text>
        <Text className="text-text-faint text-xs">{highLabel ?? 'High'}</Text>
      </View>
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  suffix = '',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={() => set(value - step)}
        className="w-11 h-11 rounded-xl bg-bg-input border border-border items-center justify-center active:opacity-70"
      >
        <Text className="text-text text-xl">−</Text>
      </Pressable>
      <View className="min-w-[80px] items-center">
        <Text className="text-text text-lg font-bold">
          {value % 1 === 0 ? value : value.toFixed(1)}
          {suffix}
        </Text>
      </View>
      <Pressable
        onPress={() => set(value + step)}
        className="w-11 h-11 rounded-xl bg-bg-input border border-border items-center justify-center active:opacity-70"
      >
        <Text className="text-text text-xl">+</Text>
      </Pressable>
    </View>
  );
}

export function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-text font-semibold">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.bgInput, true: colors.accentDim }}
        thumbColor={value ? colors.accent : colors.textFaint}
      />
    </View>
  );
}

const QUICK_TIMES = ['21:00', '21:30', '22:00', '22:30', '23:00'];

export function TimeField({
  value,
  onChange,
  quickTimes = QUICK_TIMES,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  quickTimes?: string[];
}) {
  return (
    <View>
      <TextInput
        value={value ?? ''}
        onChangeText={(t) => onChange(t.length === 0 ? null : t)}
        placeholder="HH:MM"
        placeholderTextColor={colors.textFaint}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text"
      />
      <View className="flex-row flex-wrap gap-2 mt-2">
        {quickTimes.map((t) => (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            className={`px-3 py-1.5 rounded-lg border ${
              value === t ? 'bg-accent border-accent' : 'bg-bg-input border-border'
            }`}
          >
            <Text
              className={`text-xs ${value === t ? 'text-bg' : 'text-text-muted'}`}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
