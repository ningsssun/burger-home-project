import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCompleteTask } from '@/features/tasks/hooks/useCompleteTask';
import { Avatar, Badge, Button, Card } from '@/shared/components/ui';
import { Colors, Spacing, Typography, TASK_CATEGORIES } from '@/shared/constants/theme';

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const tasks = useTasks();
  const task = tasks.find((t) => t.id === taskId);
  const completeTask = useCompleteTask();

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = TASK_CATEGORIES.find((c) => c.id === task.category);
  const isCompleted = task.status === 'completed';

  const handleComplete = async () => {
    try {
      const points = await completeTask(task);
      Alert.alert('Task Complete!', `You earned ${points} points! 🎉`, [
        { text: 'Awesome!', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title & status */}
        <Card>
          <View style={styles.taskHeader}>
            {category && (
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            )}
            <Text style={[styles.title, isCompleted && styles.titleDone]}>
              {task.title}
            </Text>
          </View>

          <View style={styles.badges}>
            <Badge
              label={task.status}
              variant={
                task.status === 'completed'
                  ? 'success'
                  : task.status === 'skipped'
                  ? 'warning'
                  : 'default'
              }
            />
            {category && <Badge label={`${category.emoji} ${category.label}`} color={category.color} />}
            <Badge label={`${task.points} pts`} color={Colors.primary} />
          </View>

          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : null}
        </Card>

        {/* Details */}
        <Card>
          <Text style={styles.sectionLabel}>Details</Text>

          {task.assigneeId && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Assigned to</Text>
              <View style={styles.assigneeValue}>
                <Avatar
                  name={task.assigneeName ?? '?'}
                  photoURL={task.assigneePhotoURL}
                  size={24}
                />
                <Text style={styles.detailValue}>{task.assigneeName}</Text>
              </View>
            </View>
          )}

          {task.dueDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Due date</Text>
              <Text style={styles.detailValue}>
                {format(task.dueDate.toDate(), 'PPP')}
              </Text>
            </View>
          )}

          {task.isRecurring && (
            <View style={styles.detailRow}>
              <Ionicons name="repeat" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Recurring</Text>
              <Text style={styles.detailValue}>
                {task.recurrenceRule?.frequency ?? 'Yes'}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {task.createdAt ? format(task.createdAt.toDate(), 'PPP') : '—'}
            </Text>
          </View>

          {isCompleted && task.completedAt && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
              <Text style={styles.detailLabel}>Completed</Text>
              <Text style={[styles.detailValue, { color: Colors.success }]}>
                {format(task.completedAt.toDate(), 'PPP')}
              </Text>
            </View>
          )}
        </Card>

        {/* Action */}
        {!isCompleted && (
          <Button onPress={handleComplete} fullWidth size="lg">
            Mark as Complete ✓
          </Button>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryEmoji: { fontSize: 32 },
  title: {
    flex: 1,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailLabel: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  assigneeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: Colors.textSecondary,
  },
});
