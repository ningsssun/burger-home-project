import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useTasksSubscription, useTodayTasks, useUpcomingTasks } from '@/features/tasks/hooks/useTasks';
import { useCompleteTask } from '@/features/tasks/hooks/useCompleteTask';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { useCurrentUser, useCurrentUserDoc } from '@/features/auth/hooks/useAuth';
import { useHousehold } from '@/features/household/hooks/useHousehold';
import { Avatar } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';
import { Task } from '@/shared/types/models';

export default function HomeScreen() {
  useTasksSubscription();

  const user = useCurrentUser();
  const userDoc = useCurrentUserDoc();
  const household = useHousehold();
  const todayTasks = useTodayTasks(user?.uid);
  const upcomingTasks = useUpcomingTasks(user?.uid);
  const completeTask = useCompleteTask();

  const handleComplete = useCallback(
    async (task: Task) => {
      try {
        const points = await completeTask(task);
        Alert.alert('Great job!', `You earned ${points} points! 🎉`);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete task');
      }
    },
    [completeTask],
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{userDoc?.displayName ?? user?.displayName ?? 'there'} 👋</Text>
            {household && (
              <Text style={styles.householdName}>{household.name}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/(profile)')}>
            <Avatar
              name={userDoc?.displayName ?? user?.displayName ?? '?'}
              photoURL={userDoc?.photoURL}
              size={44}
            />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <Text style={styles.sectionCount}>{todayTasks.length}</Text>
          </View>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>All caught up for today!</Text>
            </View>
          ) : (
            todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/(app)/(tasks)/${task.id}`)}
                onComplete={() => handleComplete(task)}
              />
            ))
          )}
        </View>

        {/* Upcoming */}
        {upcomingTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming (7 days)</Text>
              <Text style={styles.sectionCount}>{upcomingTasks.length}</Text>
            </View>
            {upcomingTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/(app)/(tasks)/${task.id}`)}
                onComplete={() => handleComplete(task)}
              />
            ))}
          </View>
        )}

        {/* Quick add FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/(tasks)/create')}
        >
          <Text style={styles.fabText}>+ New Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  householdName: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  date: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 99,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  fab: {
    backgroundColor: Colors.primary,
    borderRadius: 99,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  fabText: {
    color: Colors.white,
    fontWeight: Typography.semibold,
    fontSize: Typography.base,
  },
});
