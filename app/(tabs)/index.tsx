import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BestActions } from '@/components/dashboard/BestActions';
import { PredictionCard } from '@/components/dashboard/PredictionCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { WhoopSummary } from '@/components/dashboard/WhoopSummary';
import { BackgroundScreen } from '@/components/ui/BackgroundScreen';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, SectionHeader } from '@/components/ui/Card';
import { isWhoopConfigured } from '@/config/env';
import { useData } from '@/context/DataContext';
import { useWhoopAuth } from '@/hooks/useWhoopAuth';
import { predictionAccuracy } from '@/prediction/engine';
import { todayKey } from '@/utils/date';
import { todayJournalGreeting } from '@/utils/greeting';

export default function Dashboard() {
  const router = useRouter();
  const {
    refreshing,
    refresh,
    cycles,
    predictions,
    livePrediction,
    recommendationLogs,
    tomorrowWeather,
    profile,
    whoopConnection,
    todayJournal,
    syncWhoop,
    toggleRecommendation,
  } = useData();

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { connect, busy: whoopBusy } = useWhoopAuth(() => refresh());

  const latestCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;
  const accuracy = useMemo(() => predictionAccuracy(predictions), [predictions]);
  const connected = Boolean(whoopConnection?.connectedAt);

  // Auto-present the morning briefing once per day (when we have real data).
  useEffect(() => {
    if (cycles.length === 0) return;
    const key = `briefing-seen-${todayKey()}`;
    AsyncStorage.getItem(key).then((seen) => {
      if (!seen) {
        AsyncStorage.setItem(key, '1');
        router.push('/briefing');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles.length]);

  const doSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      await syncWhoop();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <BackgroundScreen image="coast" refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <View>
          <Text className="text-text-muted text-sm">
            {todayJournalGreeting()}
          </Text>
          <Text className="text-text text-2xl font-extrabold">
            {profile?.fullName ? profile.fullName : 'Recovery'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle items-center justify-center"
        >
          <Text className="text-text-muted text-lg">⚙</Text>
        </Pressable>
      </View>

      {accuracy.count >= 5 && accuracy.mae != null && (
        <View className="bg-bg-card rounded-xl border border-border-subtle px-3 py-2 mb-4">
          <Text className="text-text-muted text-xs">
            Your predictions have been accurate within ±{Math.round(accuracy.mae)}{' '}
            pts lately ({accuracy.count} checked).
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/briefing')}
        className="rounded-2xl bg-bg-card border border-border-subtle p-4 mb-4 flex-row items-center active:opacity-80"
      >
        <Text className="text-2xl mr-3">☀️</Text>
        <View className="flex-1">
          <Text className="text-text font-bold">Morning Briefing</Text>
          <Text className="text-text-muted text-xs">
            Yesterday’s result, accuracy, and today’s top actions
          </Text>
        </View>
        <Text className="text-text-faint text-lg">›</Text>
      </Pressable>

      {livePrediction && (
        <PredictionCard
          prediction={livePrediction.prediction}
          onWhatIf={() => router.push('/what-if')}
        />
      )}

      <View className="mt-4">
        <BestActions
          recommendations={livePrediction?.recommendations ?? []}
          logs={recommendationLogs}
          onToggle={toggleRecommendation}
        />
      </View>

      <SectionHeader
        title="Today’s Whoop"
        action={
          connected ? (
            <Pressable onPress={doSync} disabled={syncing}>
              <Text className="text-accent text-sm font-semibold">
                {syncing ? 'Syncing…' : 'Sync'}
              </Text>
            </Pressable>
          ) : null
        }
      />

      {!connected && (
        <Card className="mb-3">
          <CardTitle>Connect Whoop</CardTitle>
          <Text className="text-text-muted text-sm mb-3">
            Link your Whoop account to auto-sync recovery, HRV, sleep, and strain.
          </Text>
          <Button
            title={isWhoopConfigured ? 'Connect Whoop' : 'Whoop not configured'}
            variant="secondary"
            loading={whoopBusy}
            disabled={!isWhoopConfigured}
            onPress={connect}
          />
        </Card>
      )}

      <WhoopSummary cycle={latestCycle} />
      {syncError ? (
        <Text className="text-recovery-low text-xs mt-2">{syncError}</Text>
      ) : null}

      <View className="mt-4">
        <WeatherCard
          weather={tomorrowWeather}
          locationName={profile?.locationName}
        />
      </View>

      <View className="mt-6 mb-2 gap-2">
        <Button
          title={todayJournal ? 'Edit today’s journal' : 'Log today’s journal'}
          onPress={() => router.push('/(tabs)/journal')}
        />
        <Button
          title="What-If simulator"
          variant="secondary"
          onPress={() => router.push('/what-if')}
        />
      </View>
    </BackgroundScreen>
  );
}
