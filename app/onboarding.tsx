import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Splash } from '@/components/ui/Splash';
import { env, isWhoopConfigured } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useWhoopAuth } from '@/hooks/useWhoopAuth';
import {
  requestNotificationPermissions,
  scheduleAllReminders,
} from '@/services/notifications';
import { markOnboarded, upsertProfile } from '@/services/profile';
import { colors } from '@/theme/colors';

export default function Onboarding() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const { profile, loading: dataLoading, refresh, whoopConnection } = useData();

  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState(env.defaultLocation.name);
  const [busy, setBusy] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connect, busy: whoopBusy, error: whoopError } = useWhoopAuth(() => {
    refresh();
  });

  if (loading || dataLoading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (profile?.onboardedAt) return <Redirect href="/(tabs)" />;

  const enableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleAllReminders();
      setNotifEnabled(true);
    }
  };

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await upsertProfile(user.id, {
        fullName: name.trim() || null,
        locationName,
        locationLat: env.defaultLocation.lat,
        locationLng: env.defaultLocation.lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      await markOnboarded(user.id);
      await refresh();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  const connected = Boolean(whoopConnection?.connectedAt);

  return (
    <Screen>
      <View className="mt-6 mb-6">
        <Text className="text-accent text-3xl font-extrabold">Welcome</Text>
        <Text className="text-text-muted mt-2">
          Let’s set up your personal recovery coach.
        </Text>
      </View>

      <View className="gap-4">
        <Card>
          <CardTitle>About you</CardTitle>
          <Text className="text-text-muted text-xs mb-1.5 ml-1">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="First name"
            placeholderTextColor={colors.textFaint}
            className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text mb-3"
          />
          <Text className="text-text-muted text-xs mb-1.5 ml-1">Location</Text>
          <TextInput
            value={locationName}
            onChangeText={setLocationName}
            placeholder="City"
            placeholderTextColor={colors.textFaint}
            className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text"
          />
          <Text className="text-text-faint text-xs mt-2">
            Used for weather-aware recovery predictions.
          </Text>
        </Card>

        <Card>
          <CardTitle>Connect Whoop</CardTitle>
          <Text className="text-text-muted text-sm mb-3">
            Auto-sync recovery, HRV, sleep, and strain. You can also do this later
            from the dashboard.
          </Text>
          {connected ? (
            <Text className="text-recovery-high font-semibold">✓ Connected</Text>
          ) : (
            <Button
              title={isWhoopConfigured ? 'Connect Whoop' : 'Whoop not configured'}
              variant="secondary"
              loading={whoopBusy}
              disabled={!isWhoopConfigured}
              onPress={connect}
            />
          )}
          {whoopError ? (
            <Text className="text-recovery-low text-xs mt-2">{whoopError}</Text>
          ) : null}
        </Card>

        <Card>
          <CardTitle>Reminders</CardTitle>
          <Text className="text-text-muted text-sm mb-3">
            A 7 PM nudge to journal and a morning recovery summary.
          </Text>
          {notifEnabled ? (
            <Text className="text-recovery-high font-semibold">✓ Enabled</Text>
          ) : (
            <Button
              title="Enable notifications"
              variant="secondary"
              onPress={enableNotifications}
            />
          )}
        </Card>
      </View>

      {error ? (
        <Text className="text-recovery-low text-sm mt-4">{error}</Text>
      ) : null}

      <View className="mt-6">
        <Button title="Start journaling" loading={busy} onPress={finish} />
      </View>
    </Screen>
  );
}
