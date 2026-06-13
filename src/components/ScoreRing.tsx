import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, recoveryColor } from '@/theme/colors';

interface ScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  caption?: string;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  caption,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const color = recoveryColor(score);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bgInput}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text className="text-text font-extrabold" style={{ fontSize: size * 0.3 }}>
        {score == null ? '—' : Math.round(score)}
      </Text>
      {caption ? (
        <Text className="text-text-faint text-[11px] mt-0.5">{caption}</Text>
      ) : null}
    </View>
  );
}
