import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPreferences, Trip } from '../types';

const PREFERENCES_KEY = '@adventure_trip_planner/notification_prefs_v1';
const DEFAULT_PREFERENCES: NotificationPreferences = { tripReminders: true, packingReminders: true };

type TripReminderInput = Pick<Trip, 'startDate' | 'activityType' | 'destination'>;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status; // 'granted' | 'denied' | 'undetermined'
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
  return raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<NotificationPreferences>) } : DEFAULT_PREFERENCES;
}

export async function setNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

// Schedules a local reminder that fires the day before the trip starts (09:00).
export async function scheduleTripStartReminder(trip: TripReminderInput): Promise<string | null> {
  const prefs = await getNotificationPreferences();
  if (!prefs.tripReminders) return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const startDate = new Date(trip.startDate);
  const triggerDate = new Date(startDate);
  triggerDate.setDate(triggerDate.getDate() - 1);
  triggerDate.setHours(9, 0, 0, 0);

  if (triggerDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Adventure Trip Planner',
      body: `Your ${trip.activityType.toLowerCase()} trip to ${trip.destination} starts tomorrow!`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

export async function scheduleChecklistReminder(trip: TripReminderInput, unpackedCount: number): Promise<string | null> {
  if (unpackedCount <= 0) return null;
  const prefs = await getNotificationPreferences();
  if (!prefs.packingReminders) return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const triggerDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Packing checklist reminder',
      body: `You still have ${unpackedCount} item(s) to pack for ${trip.destination}.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

// Fires a few seconds from now so the user can confirm notifications are
// actually working on their device, from Profile -> Notification Settings.
export async function sendTestNotification(): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'Notifications are working! You will get reminders like this for upcoming trips.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, repeats: false },
  });
}

export async function cancelAllTripReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
