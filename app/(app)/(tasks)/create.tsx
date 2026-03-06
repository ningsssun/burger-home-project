import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Avatar } from '@/shared/components/ui';
import { useCreateTask } from '@/features/tasks/hooks/useCreateTask';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Colors, Spacing, Typography, BorderRadius, TASK_CATEGORIES, TaskCategory } from '@/shared/constants/theme';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  points: z.coerce.number().min(1).max(100).default(10),
});

type FormData = z.infer<typeof schema>;

export default function CreateTaskScreen() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const createTask = useCreateTask();
  const members = useHouseholdMembers();

  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('other');
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', points: 10 },
  });

  const assignee = members.find((m) => m.userId === selectedAssignee);

  const onSubmit = async (data: FormData) => {
    try {
      await createTask({
        title: data.title,
        description: data.description,
        category: selectedCategory,
        assigneeId: selectedAssignee ?? undefined,
        assigneeName: assignee?.displayName,
        assigneePhotoURL: assignee?.photoURL ?? undefined,
        points: data.points,
        isRecurring,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Task Title"
              placeholder="e.g. Vacuum the living room"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.title?.message}
            />
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description (optional)"
              placeholder="Any notes..."
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              style={styles.textarea}
            />
          )}
        />

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {TASK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && {
                    backgroundColor: `${cat.color}20`,
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && { color: cat.color },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assignee */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Assign To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.assigneeRow}>
              <TouchableOpacity
                style={[styles.assigneeChip, !selectedAssignee && styles.assigneeChipActive]}
                onPress={() => setSelectedAssignee(null)}
              >
                <Text style={styles.assigneeChipText}>Anyone</Text>
              </TouchableOpacity>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.userId}
                  style={[
                    styles.assigneeChip,
                    selectedAssignee === member.userId && styles.assigneeChipActive,
                  ]}
                  onPress={() => setSelectedAssignee(member.userId)}
                >
                  <Avatar name={member.displayName} photoURL={member.photoURL} size={24} />
                  <Text style={styles.assigneeChipText}>{member.displayName.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Points */}
        <Controller
          control={control}
          name="points"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Points"
              placeholder="10"
              keyboardType="number-pad"
              onChangeText={onChange}
              onBlur={onBlur}
              value={String(value)}
              error={errors.points?.message}
            />
          )}
        />

        {/* Recurring */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.label}>Recurring Task</Text>
            <Text style={styles.hint}>Automatically repeat this task</Text>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: Colors.gray200, true: Colors.primary }}
          />
        </View>
      </ScrollView>

      {/* Submit button pinned above tab bar */}
      <View style={[styles.footer, { paddingBottom: bottomInset + Spacing.sm }]}>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
          size="lg"
        >
          Create Task
        </Button>
      </View>
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
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  fieldGroup: { gap: Spacing.sm },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.surface,
  },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  assigneeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.surface,
  },
  assigneeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  assigneeChipText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.background,
  },
});
