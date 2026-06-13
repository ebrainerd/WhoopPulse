import { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { colors } from '@/theme/colors';

export interface LineSeries {
  label: string;
  color: string;
  /** Aligned with `labels`; null = gap (no point). */
  values: (number | null)[];
  dashed?: boolean;
}

interface LineChartProps {
  series: LineSeries[];
  labels: string[];
  height?: number;
  yMin?: number;
  yMax?: number;
  /** Show dots on points. */
  dots?: boolean;
}

const PADDING = { left: 30, right: 12, top: 10, bottom: 22 };

export function LineChart({
  series,
  labels,
  height = 200,
  yMin,
  yMax,
  dots = true,
}: LineChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const allValues = series
    .flatMap((s) => s.values)
    .filter((v): v is number => v != null);
  const dataMin = allValues.length ? Math.min(...allValues) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 1;
  const lo = yMin ?? Math.floor(dataMin - (dataMax - dataMin) * 0.1);
  const hi = yMax ?? Math.ceil(dataMax + (dataMax - dataMin) * 0.1);
  const span = hi - lo || 1;

  const plotW = Math.max(0, width - PADDING.left - PADDING.right);
  const plotH = height - PADDING.top - PADDING.bottom;
  const n = labels.length;

  const xAt = (i: number) =>
    PADDING.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v: number) =>
    PADDING.top + plotH - ((v - lo) / span) * plotH;

  const gridLines = 4;

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const v = lo + (span * i) / gridLines;
            const y = yAt(v);
            return (
              <G key={`g-${i}`}>
                <Line
                  x1={PADDING.left}
                  y1={y}
                  x2={width - PADDING.right}
                  y2={y}
                  stroke={colors.borderSubtle}
                  strokeWidth={1}
                />
                <SvgText
                  x={PADDING.left - 6}
                  y={y + 3}
                  fontSize={9}
                  fill={colors.textFaint}
                  textAnchor="end"
                >
                  {Math.round(v)}
                </SvgText>
              </G>
            );
          })}

          {series.map((s) => {
            const pts = s.values
              .map((v, i) => (v == null ? null : `${xAt(i)},${yAt(v)}`))
              .filter((p): p is string => p != null)
              .join(' ');
            return (
              <Polyline
                key={`line-${s.label}`}
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '5,4' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {dots &&
            series.map((s) =>
              s.values.map((v, i) =>
                v == null ? null : (
                  <Circle
                    key={`dot-${s.label}-${i}`}
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={2.5}
                    fill={s.color}
                  />
                ),
              ),
            )}

          {labels.map((label, i) => {
            // Avoid clutter: show ~5 labels max.
            const step = Math.max(1, Math.ceil(n / 5));
            if (i % step !== 0 && i !== n - 1) return null;
            return (
              <SvgText
                key={`x-${i}`}
                x={xAt(i)}
                y={height - 6}
                fontSize={9}
                fill={colors.textFaint}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      )}

      {series.length > 1 && (
        <View className="flex-row flex-wrap mt-2">
          {series.map((s) => (
            <View key={`leg-${s.label}`} className="flex-row items-center mr-4 mb-1">
              <View
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: s.color }}
              />
              <Text className="text-text-muted text-xs">{s.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
