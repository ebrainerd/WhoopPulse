import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ScoreRing } from '@/components/ScoreRing';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { predictionAccuracy } from '@/prediction/engine';
import { listRecommendationLogsSince } from '@/services/predictions';
import { recoveryColor } from '@/theme/colors';
import type { RecommendationLog } from '@/types/models';
import { addDaysKey, prettyDate, todayKey, yesterdayKey } from '@/utils/date';
import { signed } from '@/utils/format';
import { todayJournalGreeting } from '@/utils/greeting';
import { mean, round } from '@/utils/stats';

export default function Briefing() {
  const router = useRouter();
  const { user } = useAuth();
  const { cycles, predictions, livePrediction, profile } = useData();
  const [logs, setLogs] = useState<RecommendationLog[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLogs(await listRecommendationLogsSince(user.id, addDaysKey(todayKey(), -45)));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const yKey = yesterdayKey();
  const yesterdayCycle = cycles.find((c) => c.date === yKey) ?? null;
  const yesterdayPrediction = predictions.find((p) => p.date === yKey) ?? null;
  const accuracy = useMemo(() => predictionAccuracy(predictions), [predictions]);

  // Did following actions help? Compare actual recovery on days where the user
  // followed >=1 recommendation vs days where they followed none.
  const adherenceEffect = useMemo(() => {
    const recoveryByDate = new Map<string, number>();
    for (const c of cycles) {
      if (c.recoveryScore != null) recoveryByDate.set(c.date, c.recoveryScore);
    }
    const byDate = new Map<string, boolean>();
    for (const l of logs) {
      byDate.set(l.date, (byDate.get(l.date) ?? false) || l.followed);
    }
    const followed: number[] = [];
    const notFollowed: number[] = [];
    for (const [date, didFollow] of byDate.entries()) {
      const r = recoveryByDate.get(date);
      if (r == null) continue;
      (didFollow ? followed : notFollowed).push(r);
    }
    if (followed.length < 3 || notFollowed.length < 3) return null;
    return round(mean(followed) - mean(notFollowed), 1);
  }, [logs, cycles]);

  const hitYesterday =
    yesterdayPrediction && yesterdayCycle?.recoveryScore != null
      ? Math.abs(
          yesterdayCycle.recoveryScore - yesterdayPrediction.predictedScore,
        ) <= yesterdayPrediction.confidence
      : null;

  const topActions = livePrediction?.recommendations.slice(0, 3) ?? [];

  return (
    <Screen>
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <View>
          <Text className="text-text-muted text-sm">{todayJournalGreeting()}</Text>
          <Text className="text-text text-2xl font-extrabold">
            Morning Briefing
          </Text>
          <Text className="text-text-faint text-xs mt-0.5">
            {prettyDate(todayKey())}
          </Text>
        </View>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Done</Text>
        </Pressable>
      </View>

      <SectionHeader title="Yesterday" />
      <Card className="mb-4">
        {yesterdayCycle?.recoveryScore != null ? (
          <View className="flex-row items-center">
            <ScoreRing score={yesterdayCycle.recoveryScore} size={88} strokeWidth={9} />
            <View className="flex-1 ml-4">
              {yesterdayPrediction ? (
                <>
                  <Text className="text-text-muted text-sm">
                    Predicted {yesterdayPrediction.predictedScore} · actual{' '}
                    {yesterdayCycle.recoveryScore}
                  </Text>
                  <Text
                    className="text-base font-bold mt-1"
                    style={{
                      color: hitYesterday ? '#34D399' : '#FBBF24',
                    }}
                  >
                    {hitYesterday ? 'On target' : 'Off'} by{' '}
                    {signed(
                      yesterdayCycle.recoveryScore -
                        yesterdayPrediction.predictedScore,
                    )}{' '}
                    pts
                  </Text>
                </>
              ) : (
                <Text className="text-text-muted text-sm">
                  No prediction was logged for yesterday.
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text className="text-text-muted text-sm">
            Yesterday’s recovery isn’t in yet. Sync Whoop to pull it.
          </Text>
        )}
      </Card>

      {accuracy.count >= 3 && accuracy.mae != null && (
        <Card className="mb-4">
          <CardTitle>How the model is doing</CardTitle>
          <Text className="text-text text-sm">
            Accurate within ±{accuracy.mae} pts across {accuracy.count} checked
            predictions.
          </Text>
          {adherenceEffect != null && (
            <Text className="text-text text-sm mt-2">
              On days you followed at least one action, recovery averaged{' '}
              <Text
                className="font-bold"
                style={{ color: adherenceEffect >= 0 ? '#34D399' : '#F87171' }}
              >
                {signed(adherenceEffect)} pts
              </Text>{' '}
              vs days you didn’t.
            </Text>
          )}
        </Card>
      )}

      {livePrediction && (
        <>
          <SectionHeader title="Today’s outlook" />
          <Card className="mb-4">
            <View className="flex-row items-center">
              <Text
                className="text-4xl font-extrabold"
                style={{
                  color: recoveryColor(livePrediction.prediction.predictedScore),
                }}
              >
                {livePrediction.prediction.predictedScore}
              </Text>
              <Text className="text-text-faint text-base ml-1">
                ±{livePrediction.prediction.confidence}
              </Text>
              <Text className="text-text-muted text-sm ml-auto">
                predicted for tomorrow
              </Text>
            </View>
          </Card>
        </>
      )}

      <SectionHeader title="Top actions today" />
      <Card className="mb-4">
        {topActions.length > 0 ? (
          topActions.map((a) => (
            <View key={a.key} className="flex-row items-start py-2">
              <Text className="text-recovery-high font-bold mr-3">
                +{a.impactPoints}
              </Text>
              <View className="flex-1">
                <Text className="text-text font-semibold">{a.title}</Text>
                <Text className="text-text-muted text-xs mt-0.5">{a.detail}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-text-muted text-sm">
            You’re dialed in — no high-impact changes for today.
          </Text>
        )}
      </Card>

      <Pressable
        onPress={() => router.replace('/(tabs)/journal')}
        className="rounded-xl bg-accent py-3 active:opacity-80"
      >
        <Text className="text-bg text-center font-bold">
          Log today’s journal
        </Text>
      </Pressable>
      <Text className="text-text-faint text-xs text-center mt-3">
        {profile?.fullName ? `Have a great day, ${profile.fullName}.` : ''}
      </Text>
      <View className="h-4" />
    </Screen>
  );
}
