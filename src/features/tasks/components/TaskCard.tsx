import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Task } from '../../../shared/types/models';
import { Avatar, Badge } from '../../../shared/components/ui';
import { Colors, Spacing, Typography, BorderRadius, TASK_CATEGORIES } from '../../../shared/constants/theme';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  style?: ViewStyle;
}

export function TaskCard({ task, onPress, onComplete, style }: TaskCardProps) {
  const category = TASK_CATEGORIES.find((c) => c.id === task.category);
  const isCompleted = task.status === 'completed';
  const isOverdue =
    task.status === 'pending' &&
    task.dueDate &&
    task.dueDate.toDate() < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.completedCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Complete button */}
      <TouchableOpacity
        style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
        onPress={onComplete}
        disabled={isCompleted}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
        ) : (
          <Ionicons name="ellipse-outline" size={28} color={Colors.gray300} />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.isRecurring && (
            <Ionicons name="repeat" size={14} color={Colors.gray400} />
          )}
        </View>

        <View style={styles.meta}>
          {category && (
            <Badge
              label={`${category.emoji} ${category.label}`}
              color={category.color}
            />
          )}
          {task.dueDate && (
            <View style={styles.dueRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={isOverdue ? Colors.error : Colors.textSecondary}
              />
              <Text style={[styles.dueText, isOverdue && styles.overdueText]}>
                {format(task.dueDate.toDate(), 'MMM d')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {task.assigneeId && (
          <Avatar
            name={task.assigneeName ?? '?'}
            photoURL={task.assigneePhotoURL}
            size={28}
          />
        )}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{task.points}pt</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
  } as ViewStyle,
  completedCard: {
    opacity: 0.6,
    backgroundColor: Colors.gray50,
  } as ViewStyle,
  checkButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  checkButtonCompleted: {} as ViewStyle,
  content: {
    flex: 1,
    gap: Spacing.xs,
  } as ViewStyle,
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  } as ViewStyle,
  title: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  } as ViewStyle,
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  } as ViewStyle,
  dueText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  overdueText: {
    color: Colors.error,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  } as ViewStyle,
  pointsBadge: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  } as ViewStyle,
  pointsText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
});
