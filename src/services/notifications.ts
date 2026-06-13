import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local notifications: a ~7 PM journal reminder and an ~8 AM morning recovery
 * summary. Uses daily calendar triggers; no server push required for the MVP.
 */

const JOURNAL_REMINDER_ID = 'journal-reminder';
const MORNING_SUMMARY_ID = 'morning-summary';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recovery',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

async function scheduleDaily(
  identifier: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleJournalReminder(
  hour = 19,
  minute = 0,
): Promise<void> {
  if (Platform.OS === 'web') return;
  await scheduleDaily(
    JOURNAL_REMINDER_ID,
    hour,
    minute,
    'Log your day 🌙',
    'Two minutes now sharpens tomorrow’s recovery prediction.',
  );
}

export async function scheduleMorningSummary(
  hour = 8,
  minute = 0,
): Promise<void> {
  if (Platform.OS === 'web') return;
  await scheduleDaily(
    MORNING_SUMMARY_ID,
    hour,
    minute,
    'Recovery check ☀️',
    'See yesterday’s recovery and today’s best actions.',
  );
}

export async function scheduleAllReminders(): Promise<void> {
  await Promise.all([scheduleJournalReminder(), scheduleMorningSummary()]);
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
