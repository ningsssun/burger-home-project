import { Stack } from 'expo-router';
import { Colors } from '@/shared/constants/theme';
import { useListsSubscription } from '@/features/lists/hooks/useLists';

export default function ListsLayout() {
  useListsSubscription();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }} />
  );
}
