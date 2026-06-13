import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { Segmented } from '@/components/form/Controls';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useData } from '@/context/DataContext';
import { predictionAccuracy } from '@/prediction/engine';
import { colors } from '@/theme/colors';
import type { WhoopCycle } from '@/types/models';
import { shortDate } from '@/utils/date';

type Metric = 'recovery' | 'hrv' | 'rhr' | 'sleep' | 'strain';

const METRICS: { label: string; value: Metric }[] = [
  { label: 'Recovery', value: 'recovery' },
  { label: 'HRV', value: 'hrv' },
  { label: 'RHR', value: 'rhr' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Strain', value: 'strain' },
];

function metricValue(c: WhoopCycle, m: Metric): number | null {
  switch (m) {
    case 'recovery':
      return c.recoveryScore;
    case 'hrv':
      return c.hrvMs;
    case 'rhr':
      return c.rhrBpm;
    case 'sleep':
      return c.sleepDurationMin != null ? c.sleepDurationMin / 60 : null;
    case 'strain':
      return c.dayStrain;
  }
}

export default function History() {
  const { cycles, predictions, refreshing, refresh } = useData();
  const [metric, setMetric] = useState<Metric>('recovery');

  const recent = useMemo(() => cycles.slice(-30), [cycles]);
  const labels = recent.map((c) => shortDate(c.date));

  const metricSeries: LineSeries[] = [
    {
      label: METRICS.find((m) => m.value === metric)!.label,
      color: colors.accent,
      values: recent.map((c) => metricValue(c, metric)),
    },
  ];

  const accuracy = useMemo(() => predictionAccuracy(predictions), [predictions]);

  const predRecent = useMemo(() => predictions.slice(-30), [predictions]);
  const predLabels = predRecent.map((p) => shortDate(p.date));
  const accuracySeries: LineSeries[] = [
    {
      label: 'Predicted',
      color: colors.accent,
      values: predRecent.map((p) => p.predictedScore),
      dashed: true,
    },
    {
      label: 'Actual',
      color: colors.recoveryHigh,
      values: predRecent.map((p) => p.actualScore),
    },
  ];

  const hasData = recent.length > 0;
  const hasPredData = predRecent.some((p) => p.actualScore != null);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="mt-2 mb-2">
        <Text className="text-text text-2xl font-extrabold">History</Text>
      </View>

      <SectionHeader title="Trends" />
      <Card className="mb-4">
        <View className="mb-4">
          <Segmented options={METRICS} value={metric} onChange={setMetric} />
        </View>
        {hasData ? (
          <LineChart series={metricSeries} labels={labels} height={210} />
        ) : (
          <Text className="text-text-muted text-sm py-6 text-center">
            No Whoop history yet. Connect Whoop and sync to see trends.
          </Text>
        )}
      </Card>

      <SectionHeader title="Prediction Accuracy" />
      <Card>
        {accuracy.count > 0 && accuracy.mae != null ? (
          <View className="flex-row justify-between mb-4">
            <Stat label="Avg error" value={`±${accuracy.mae} pts`} />
            <Stat
              label="Within band"
              value={`${Math.round((accuracy.withinBand ?? 0) * 100)}%`}
            />
            <Stat
              label="Bias"
              value={`${accuracy.bias && accuracy.bias > 0 ? '+' : ''}${
                accuracy.bias ?? 0
              }`}
            />
          </View>
        ) : null}
        {hasPredData ? (
          <LineChart
            series={accuracySeries}
            labels={predLabels}
            height={210}
            yMin={0}
            yMax={100}
          />
        ) : (
          <Text className="text-text-muted text-sm py-6 text-center">
            Once a few predictions are checked against your actual recovery,
            you’ll see how accurate they’ve been here.
          </Text>
        )}
      </Card>
      <View className="h-4" />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-text-faint text-[11px] uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-text text-lg font-bold mt-0.5">{value}</Text>
    </View>
  );
}
