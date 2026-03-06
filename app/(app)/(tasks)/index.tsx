import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, useTasksLoading } from '@/features/tasks/hooks/useTasks';
import { useCompleteTask } from '@/features/tasks/hooks/useCompleteTask';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';
import { Task, TaskStatus } from '@/shared/types/models';

type Filter = 'all' | 'mine' | TaskStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Done' },
];

export default function TasksScreen() {
  const tasks = useTasks();
  const loading = useTasksLoading();
  const completeTask = useCompleteTask();
  const [filter, setFilter] = useState<Filter>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'mine') return t.assigneeId !== null; // simplified
    return t.status === filter;
  });

  const handleComplete = useCallback(
    async (task: Task) => {
      try {
        const points = await completeTask(task);
        Alert.alert('', `+${points} points! 🎉`, [{ text: 'Nice!' }]);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
      }
    },
    [completeTask],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/(tasks)/create')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterText, filter === f.key && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task list */}
      <FlashList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/(app)/(tasks)/${item.id}`)}
            onComplete={() => handleComplete(item)}
            style={styles.taskCard}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? 'Create your first task!' : 'No tasks match this filter.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 99,
    backgroundColor: Colors.gray100,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  taskCard: { marginBottom: Spacing.sm },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
});
