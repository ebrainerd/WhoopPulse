import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '@/theme/colors';

export interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  bars: Bar[];
  height?: number;
  /** When set, draws a baseline at zero and supports negative values. */
  signed?: boolean;
}

const PADDING = { left: 30, right: 12, top: 8, bottom: 22 };

export function BarChart({ bars, height = 180, signed = false }: BarChartProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const values = bars.map((b) => b.value);
  const maxV = Math.max(1, ...values.map((v) => (signed ? Math.abs(v) : v)));
  const lo = signed ? -maxV : 0;
  const hi = maxV;
  const span = hi - lo || 1;

  const plotW = Math.max(0, width - PADDING.left - PADDING.right);
  const plotH = height - PADDING.top - PADDING.bottom;
  const yAt = (v: number) => PADDING.top + plotH - ((v - lo) / span) * plotH;
  const zeroY = yAt(0);

  const slot = bars.length > 0 ? plotW / bars.length : plotW;
  const barW = Math.min(28, slot * 0.6);

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {signed && (
            <Rect
              x={PADDING.left}
              y={zeroY}
              width={plotW}
              height={1}
              fill={colors.border}
            />
          )}
          {bars.map((b, i) => {
            const cx = PADDING.left + slot * i + slot / 2;
            const top = b.value >= 0 ? yAt(b.value) : zeroY;
            const h = Math.abs(yAt(b.value) - zeroY) || 1;
            const color =
              b.color ?? (b.value >= 0 ? colors.recoveryHigh : colors.recoveryLow);
            return (
              <Rect
                key={`bar-${i}`}
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={h}
                rx={3}
                fill={color}
              />
            );
          })}
          {bars.map((b, i) => {
            const cx = PADDING.left + slot * i + slot / 2;
            return (
              <SvgText
                key={`lbl-${i}`}
                x={cx}
                y={height - 6}
                fontSize={9}
                fill={colors.textFaint}
                textAnchor="middle"
              >
                {b.label}
              </SvgText>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
