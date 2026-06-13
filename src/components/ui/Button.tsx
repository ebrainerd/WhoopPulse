import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import { colors } from '@/theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  'flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-80';

const variants: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-accent', text: 'text-bg font-bold' },
  secondary: {
    container: 'bg-bg-input border border-border',
    text: 'text-text font-semibold',
  },
  ghost: { container: 'bg-transparent', text: 'text-accent font-semibold' },
  danger: { container: 'bg-transparent', text: 'text-recovery-low font-semibold' },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`${base} ${v.container} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'opacity-50' : ''
      }`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.bg : colors.accent}
        />
      ) : (
        <View>
          <Text className={v.text}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
