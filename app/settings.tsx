import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { isWhoopConfigured } from '@/config/env';
import { MODEL_VERSION } from '@/prediction/engine';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useWhoopAuth } from '@/hooks/useWhoopAuth';
import {
  cancelAllReminders,
  requestNotificationPermissions,
  scheduleAllReminders,
} from '@/services/notifications';
import { prettyDate } from '@/utils/date';

export default function Settings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, whoopConnection, refresh, syncWhoop } = useData();
  const { connect, busy: whoopBusy } = useWhoopAuth(() => refresh());
  const [syncing, setSyncing] = useState(false);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  const connected = Boolean(whoopConnection?.connectedAt);

  const doSync = async () => {
    setSyncing(true);
    try {
      await syncWhoop();
    } finally {
      setSyncing(false);
    }
  };

  const enableNotifs = async () => {
    const ok = await requestNotificationPermissions();
    if (ok) {
      await scheduleAllReminders();
      setNotifMsg('Reminders scheduled (7 PM journal, 8 AM summary).');
    } else {
      setNotifMsg('Notification permission denied.');
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <Text className="text-text text-2xl font-extrabold">Settings</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-accent font-semibold">Done</Text>
        </Pressable>
      </View>

      <Card className="mb-4">
        <CardTitle>Account</CardTitle>
        <Text className="text-text">{user?.email}</Text>
        {profile?.locationName ? (
          <Text className="text-text-muted text-sm mt-1">
            {profile.locationName}
          </Text>
        ) : null}
      </Card>

      <Card className="mb-4">
        <CardTitle>Whoop</CardTitle>
        {connected ? (
          <>
            <Text className="text-recovery-high font-semibold mb-1">
              ✓ Connected
            </Text>
            {whoopConnection?.lastSyncedAt ? (
              <Text className="text-text-muted text-xs mb-3">
                Last synced {prettyDate(whoopConnection.lastSyncedAt.slice(0, 10))}
              </Text>
            ) : (
              <Text className="text-text-muted text-xs mb-3">Not synced yet</Text>
            )}
            <Button
              title={syncing ? 'Syncing…' : 'Sync now'}
              variant="secondary"
              loading={syncing}
              onPress={doSync}
            />
          </>
        ) : (
          <Button
            title={isWhoopConfigured ? 'Connect Whoop' : 'Whoop not configured'}
            variant="secondary"
            loading={whoopBusy}
            disabled={!isWhoopConfigured}
            onPress={connect}
          />
        )}
      </Card>

      <Card className="mb-4">
        <CardTitle>Notifications</CardTitle>
        <Text className="text-text-muted text-sm mb-3">
          7 PM journal reminder and a morning recovery summary.
        </Text>
        <View className="gap-2">
          <Button
            title="Enable reminders"
            variant="secondary"
            onPress={enableNotifs}
          />
          <Button
            title="Turn off reminders"
            variant="ghost"
            onPress={async () => {
              await cancelAllReminders();
              setNotifMsg('Reminders turned off.');
            }}
          />
        </View>
        {notifMsg ? (
          <Text className="text-text-muted text-xs mt-2">{notifMsg}</Text>
        ) : null}
      </Card>

      <Card className="mb-4">
        <CardTitle>About</CardTitle>
        <Text className="text-text-muted text-sm">
          Prediction model: {MODEL_VERSION}
        </Text>
      </Card>

      <Button title="Sign out" variant="danger" onPress={signOut} />
      <View className="h-6" />
    </Screen>
  );
}
