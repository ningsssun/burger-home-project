import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { registerForPushNotifications } from '../../../shared/lib/notifications';
import { useCurrentUser } from '../../auth/hooks/useAuth';

export function useNotificationsSetup() {
  const user = useCurrentUser();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!user) return;

    // Register for push notifications
    registerForPushNotifications(user.uid).catch(console.warn);

    // Handle notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Could show in-app toast here
      },
    );

    // Handle notification tap (app in background or closed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          router.push(`/(app)/(tasks)/${taskId}`);
        }
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.uid]);
}
