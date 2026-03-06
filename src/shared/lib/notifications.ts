import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FIRESTORE_COLLECTIONS } from '../constants/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Firestore
  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    fcmTokens: arrayUnion(token),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token;
}

export async function scheduleTaskReminder(
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  minutesBefore = 60,
): Promise<string | null> {
  const triggerDate = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);

  if (triggerDate <= new Date()) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task due soon',
      body: `"${taskTitle}" is due in ${minutesBefore} minutes`,
      data: { taskId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return notificationId;
}

export async function cancelTaskReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
