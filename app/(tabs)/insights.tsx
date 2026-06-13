import { useMemo } from 'react';
import { Share, Text, View } from 'react-native';

import { BarChart, type Bar } from '@/components/charts/BarChart';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useData } from '@/context/DataContext';
import { computeDrivers, computeTrends } from '@/prediction/insights';
import { predictionAccuracy } from '@/prediction/engine';
import { colors } from '@/theme/colors';

export default function Insights() {
  const { journals, cycles, predictions, refreshing, refresh, profile } = useData();

  const drivers = useMemo(
    () => computeDrivers(journals, cycles),
    [journals, cycles],
  );
  const trends = useMemo(
    () => computeTrends(journals, cycles),
    [journals, cycles],
  );
  const accuracy = useMemo(() => predictionAccuracy(predictions), [predictions]);

  const driverBars: Bar[] = drivers.slice(0, 6).map((d) => ({
    label: d.label.split(' ')[0],
    value: Math.round(d.correlation * 100),
    color: d.correlation >= 0 ? colors.recoveryHigh : colors.recoveryLow,
  }));

  const exportData = async () => {
    const header = 'date,predicted_score,actual_score,confidence,baseline\n';
    const rows = predictions
      .map(
        (p) =>
          `${p.date},${p.predictedScore},${p.actualScore ?? ''},${p.confidence},${Math.round(
            p.baseline,
          )}`,
      )
      .join('\n');
    const csv = header + rows;
    try {
      await Share.share({
        title: 'Recovery predictions export',
        message: csv,
      });
    } catch {
      // user cancelled / unsupported
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="mt-2 mb-2">
        <Text className="text-text text-2xl font-extrabold">Insights</Text>
        <Text className="text-text-muted text-sm mt-0.5">
          {profile?.fullName ? `${profile.fullName}’s ` : ''}personalized patterns
        </Text>
      </View>

      {accuracy.count >= 3 && accuracy.mae != null && (
        <Card className="mb-4">
          <CardTitle>Prediction Quality</CardTitle>
          <Text className="text-text text-base">
            Across {accuracy.count} checked predictions, your model is accurate
            within{' '}
            <Text className="text-accent font-bold">±{accuracy.mae} points</Text>
            {accuracy.withinBand != null
              ? `, landing inside its confidence band ${Math.round(
                  accuracy.withinBand * 100,
                )}% of the time.`
              : '.'}
          </Text>
        </Card>
      )}

      <SectionHeader title="Top Drivers" />
      <Card className="mb-4">
        <Text className="text-text-muted text-sm mb-3">
          How your inputs correlate with next-day recovery (−100 to +100).
        </Text>
        {drivers.length > 0 ? (
          <>
            <BarChart bars={driverBars} signed height={180} />
            <View className="mt-3">
              {drivers.slice(0, 6).map((d) => (
                <View
                  key={d.key}
                  className="flex-row items-center justify-between py-1.5 border-t border-border-subtle"
                >
                  <Text className="text-text-muted text-sm flex-1">
                    {d.label}
                  </Text>
                  <Text
                    className="text-sm font-semibold mr-3"
                    style={{
                      color:
                        d.correlation >= 0
                          ? colors.recoveryHigh
                          : colors.recoveryLow,
                    }}
                  >
                    {d.correlation > 0 ? '+' : ''}
                    {d.correlation.toFixed(2)}
                  </Text>
                  <Text className="text-text-faint text-xs">n={d.samples}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text className="text-text-muted text-sm py-4 text-center">
            Keep journaling — once you have ~1 week of paired data, your strongest
            recovery drivers will appear here.
          </Text>
        )}
      </Card>

      <SectionHeader title="Observations" />
      <Card className="mb-4">
        {trends.length > 0 ? (
          trends.map((t, i) => (
            <View key={i} className="flex-row py-1.5">
              <Text className="text-accent mr-2">•</Text>
              <Text className="text-text text-sm flex-1">{t.text}</Text>
            </View>
          ))
        ) : (
          <Text className="text-text-muted text-sm py-2">
            No strong patterns detected yet. The more you log, the sharper these
            get.
          </Text>
        )}
      </Card>

      <SectionHeader title="Export" />
      <Card className="mb-4">
        <Text className="text-text-muted text-sm mb-3">
          Export your prediction history as CSV to review with a coach or doctor.
        </Text>
        <Button
          title="Export predictions (CSV)"
          variant="secondary"
          onPress={exportData}
          disabled={predictions.length === 0}
        />
      </Card>
      <View className="h-4" />
    </Screen>
  );
}
