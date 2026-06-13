import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { LineChart, type LineSeries } from '@/components/charts/LineChart';
import { BackgroundScreen } from '@/components/ui/BackgroundScreen';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import { predictionAccuracy } from '@/prediction/engine';
import { colors } from '@/theme/colors';
import { shortDate } from '@/utils/date';

export default function Trends() {
  const { cycles, predictions, refreshing, refresh } = useData();

  const recent = useMemo(() => cycles.slice(-30), [cycles]);
  const recoverySeries: LineSeries[] = [
    {
      label: 'Recovery',
      color: colors.accent,
      values: recent.map((c) => c.recoveryScore),
    },
  ];

  const accuracy = useMemo(() => predictionAccuracy(predictions), [predictions]);
  const predRecent = useMemo(() => predictions.slice(-30), [predictions]);
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

  const hasRecovery = recent.some((c) => c.recoveryScore != null);
  const hasAccuracy = predRecent.some((p) => p.actualScore != null);

  return (
    <BackgroundScreen image="mountains" refreshing={refreshing} onRefresh={refresh}>
      <View className="mt-2 mb-3">
        <Text className="text-text text-2xl font-extrabold">Trends</Text>
      </View>

      {accuracy.count >= 3 && accuracy.mae != null ? (
        <Card className="mb-4">
          <Text className="text-text text-base">
            Predictions accurate within{' '}
            <Text className="text-accent font-bold">±{accuracy.mae} pts</Text>{' '}
            across {accuracy.count} checked
            {accuracy.withinBand != null
              ? ` · inside the band ${Math.round(accuracy.withinBand * 100)}% of the time`
              : ''}
            .
          </Text>
        </Card>
      ) : (
        <Card className="mb-4">
          <Text className="text-text-muted text-sm">
            Keep logging — after about a week, you’ll see how accurate your
            predictions have been and watch the model sharpen.
          </Text>
        </Card>
      )}

      <SectionHeader title="Recovery (30 days)" />
      <Card className="mb-4">
        {hasRecovery ? (
          <LineChart
            series={recoverySeries}
            labels={recent.map((c) => shortDate(c.date))}
            height={210}
            yMin={0}
            yMax={100}
          />
        ) : (
          <Text className="text-text-muted text-sm py-6 text-center">
            No Whoop history yet. Connect Whoop and sync to see your trend.
          </Text>
        )}
      </Card>

      <SectionHeader title="Predicted vs Actual" />
      <Card>
        {hasAccuracy ? (
          <LineChart
            series={accuracySeries}
            labels={predRecent.map((p) => shortDate(p.date))}
            height={210}
            yMin={0}
            yMax={100}
          />
        ) : (
          <Text className="text-text-muted text-sm py-6 text-center">
            Once a few predictions are checked against your real recovery, the
            comparison shows up here.
          </Text>
        )}
      </Card>
      <View className="h-4" />
    </BackgroundScreen>
  );
}
