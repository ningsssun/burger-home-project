import { Stack } from 'expo-router';
import { Colors } from '@/shared/constants/theme';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }} />
  );
}
