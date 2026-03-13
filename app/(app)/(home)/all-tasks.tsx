import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useAssignTask } from '@/features/tasks/hooks/useAssignTask';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { Task } from '@/shared/types/models';

const UNASSIGNED = '__unassigned__';

export default function AllTasksScreen() {
  const insets  = useSafeAreaInsets();
  const allTasks = useTasks();
  const members  = useHouseholdMembers();
  const assignTask = useAssignTask();

  const [filterMemberId, setFilterMemberId] = useState<string | null>(null);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);

  // This week's tasks: due this week, or completed this week, or pending with no due date
  const weekTasks = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd   = endOfWeek(new Date(),   { weekStartsOn: 1 });
    return allTasks.filter(t => {
      if (t.status === 'pending') {
        if (!t.dueDate) return true;
        const due = t.dueDate.toDate();
        return due >= weekStart && due <= weekEnd;
      }
      if (t.status === 'completed' && t.completedAt) {
        const done = t.completedAt.toDate();
        return done >= weekStart && done <= weekEnd;
      }
      return false;
    });
  }, [allTasks]);

  const filteredTasks = useMemo(() => {
    if (!filterMemberId) return weekTasks;
    if (filterMemberId === UNASSIGNED) return weekTasks.filter(t => !t.assigneeId);
    return weekTasks.filter(t => t.assigneeId === filterMemberId);
  }, [weekTasks, filterMemberId]);

  const pendingTasks   = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const handleAssign = async (member: { userId: string; displayName: string }) => {
    if (!taskToAssign) return;
    setTaskToAssign(null);
    try {
      await assignTask(taskToAssign.id, member.userId, member.displayName);
    } catch {
      Alert.alert('错误', '指定失败，请重试');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>本周全家任务</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary badges */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{pendingTasks.length}</Text>
          <Text style={styles.summaryLabel}>待完成</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: Colors.slate }]}>{completedTasks.length}</Text>
          <Text style={styles.summaryLabel}>已完成</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{members.length}</Text>
          <Text style={styles.summaryLabel}>成员</Text>
        </View>
      </View>

      {/* Member filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, !filterMemberId && styles.filterChipActive]}
          onPress={() => setFilterMemberId(null)}
        >
          <Text style={[styles.filterChipText, !filterMemberId && styles.filterChipTextActive]}>全部</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMemberId === UNASSIGNED && styles.filterChipActive]}
          onPress={() => setFilterMemberId(UNASSIGNED)}
        >
          <Text style={[styles.filterChipText, filterMemberId === UNASSIGNED && styles.filterChipTextActive]}>未指定</Text>
        </TouchableOpacity>
        {members.map(m => (
          <TouchableOpacity
            key={m.userId}
            style={[styles.filterChip, filterMemberId === m.userId && styles.filterChipActive]}
            onPress={() => setFilterMemberId(m.userId)}
          >
            <Text style={[styles.filterChipText, filterMemberId === m.userId && styles.filterChipTextActive]}>
              {m.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>未完成 · {pendingTasks.length}项</Text>
            {pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} onAssign={() => setTaskToAssign(task)} />
            ))}
          </>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>已完成 · {completedTasks.length}项</Text>
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} onAssign={() => setTaskToAssign(task)} />
            ))}
          </>
        )}

        {filteredTasks.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>暂无任务</Text>
          </View>
        )}
      </ScrollView>

      {/* Assign person modal */}
      <Modal
        visible={!!taskToAssign}
        animationType="slide"
        transparent
        onRequestClose={() => setTaskToAssign(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setTaskToAssign(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>指定负责人</Text>
            {taskToAssign && (
              <Text style={styles.sheetSubtitle} numberOfLines={1}>
                {taskToAssign.title.replace(/^(\p{Emoji}\s?)/u, '')}
              </Text>
            )}
            {members.map(m => (
              <TouchableOpacity key={m.userId} style={styles.memberRow} onPress={() => handleAssign(m)}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{m.displayName.charAt(0)}</Text>
                </View>
                <Text style={styles.memberName}>{m.displayName}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.slate} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TaskCard({ task, onAssign }: { task: Task; onAssign: () => void }) {
  const done      = task.status === 'completed';
  const emoji     = task.title.match(/^(\p{Emoji})/u)?.[1] ?? '📋';
  const rawTitle  = task.title.replace(/^(\p{Emoji}\s?)/u, '');
  const dueStr    = task.dueDate ? format(task.dueDate.toDate(), 'M月d日') : null;
  const doneStr   = task.completedAt ? format(task.completedAt.toDate(), 'M月d日') : null;
  const unassigned = !task.assigneeId;

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, done && styles.cardTitleDone]} numberOfLines={1}>
          {rawTitle}
        </Text>
        <View style={styles.cardMeta}>
          {task.assigneeName ? (
            <View style={styles.assigneeBadge}>
              <Text style={styles.assigneeText}>{task.assigneeName}</Text>
            </View>
          ) : null}
          {!done && dueStr ? <Text style={styles.metaDate}>{dueStr}</Text> : null}
          {done && doneStr ? <Text style={styles.metaDate}>完成 {doneStr}</Text> : null}
          <Text style={styles.metaPoints}>⭐ {task.points}</Text>
        </View>
      </View>
      {unassigned && !done ? (
        <TouchableOpacity style={styles.assignBtn} onPress={onAssign}>
          <Ionicons name="person-add-outline" size={14} color={Colors.ink} />
          <Text style={styles.assignBtnText}>指定</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.statusDot, done && styles.statusDotDone]}>
          {done && <Ionicons name="checkmark" size={12} color={Colors.white} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lightBg, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.ink },
  headerRight: { width: 40 },

  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryNum: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.ink },
  summaryLabel: { fontSize: Typography.xs, color: Colors.slate },
  summaryDivider: { width: 1, height: 32, backgroundColor: Colors.gray200 },

  filterScroll: { flexGrow: 0, marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99,
    backgroundColor: Colors.lightBg,
  },
  filterChipActive: { backgroundColor: Colors.pink },
  filterChipText: { fontSize: Typography.sm, color: Colors.slate, fontWeight: Typography.medium },
  filterChipTextActive: { color: Colors.ink, fontWeight: Typography.semibold },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xxl, gap: Spacing.sm },

  sectionLabel: {
    fontSize: Typography.xs, fontWeight: Typography.semibold,
    color: Colors.slate, textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4,
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg,
    padding: Spacing.md, gap: Spacing.md,
  },
  cardDone: { opacity: 0.5 },
  cardEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.ink },
  cardTitleDone: { textDecorationLine: 'line-through', color: Colors.slate },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3, flexWrap: 'wrap' },
  assigneeBadge: {
    backgroundColor: Colors.pink, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  assigneeText: { fontSize: Typography.xs, color: Colors.ink, fontWeight: Typography.medium },
  metaDate: { fontSize: Typography.xs, color: Colors.slate },
  metaPoints: { fontSize: Typography.xs, color: Colors.slate },
  statusDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.slate,
    alignItems: 'center', justifyContent: 'center',
  },
  statusDotDone: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  assignBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  assignBtnText: { fontSize: Typography.xs, color: Colors.ink, fontWeight: Typography.semibold },

  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.slate },

  // Assign modal
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.sm,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.ink },
  sheetSubtitle: { fontSize: Typography.sm, color: Colors.slate, marginBottom: Spacing.sm },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.gray200,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.ink },
  memberName: { flex: 1, fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.ink },
});
