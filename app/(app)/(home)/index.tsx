import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from 'date-fns';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCompleteTask } from '@/features/tasks/hooks/useCompleteTask';
import { useCreateTask } from '@/features/tasks/hooks/useCreateTask';
import { useCurrentUser, useCurrentUserDoc } from '@/features/auth/hooks/useAuth';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { Task } from '@/shared/types/models';
import { APP_CONFIG } from '@/shared/constants/config';
import { useTranslation } from '@/shared/i18n';

const EMOJIS = ['🏠', '🧹', '🍳', '🛒', '👕', '🔧', '📋', '🌿', '🐾', '✨'];
const COLLAPSED_H = 150;
const EXPANDED_H  = 420;

function getMonthGrid(month: Date): Date[][] {
  const s = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const e = endOfWeek(endOfMonth(month),     { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: s, end: e });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export default function HomeScreen() {
  const t = useTranslation();

  const insets = useSafeAreaInsets();
  const user         = useCurrentUser();
  const userDoc      = useCurrentUserDoc();
  const members      = useHouseholdMembers();
  const allTasks     = useTasks();
  const completeTask = useCompleteTask();
  const createTask   = useCreateTask();

  // Calendar state
  const [selectedDate,  setSelectedDate]  = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calExpanded,   setCalExpanded]   = useState(false);
  const calHeight   = useRef(new Animated.Value(COLLAPSED_H)).current;
  const expandedRef = useRef(false);

  // Modal state
  const [showModal,          setShowModal]          = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [selectedEmoji,      setSelectedEmoji]      = useState('🏠');
  const [taskPoints,         setTaskPoints]          = useState(APP_CONFIG.DEFAULT_TASK_POINTS);
  const [modalDate,          setModalDate]           = useState(() => new Date());
  const [submitting,         setSubmitting]          = useState(false);
  const [inputKey,           setInputKey]            = useState(0);
  const taskTitleRef = useRef('');
  const inputRef     = useRef<TextInput>(null);

  // ─── Calendar PanResponder ────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, gs) => Math.abs(gs.dy) > 5,
      onPanResponderMove: (_, gs) => {
        const base = expandedRef.current ? EXPANDED_H : COLLAPSED_H;
        calHeight.setValue(Math.max(COLLAPSED_H, Math.min(EXPANDED_H, base - gs.dy)));
      },
      onPanResponderRelease: (_, gs) => {
        const wasExpanded = expandedRef.current;
        snapCalendar(wasExpanded ? gs.dy < 80 : gs.dy < -40);
      },
    })
  ).current;

  const snapCalendar = useCallback((expand: boolean) => {
    Animated.spring(calHeight, {
      toValue: expand ? EXPANDED_H : COLLAPSED_H,
      useNativeDriver: false,
      tension: 42, friction: 7,
    }).start();
    expandedRef.current = expand;
    setCalExpanded(expand);
  }, [calHeight]);

  const handleDatePress = useCallback((day: Date) => {
    setSelectedDate(day);
    setCalendarMonth(day);
    snapCalendar(false);
  }, [snapCalendar]);

  // ─── Task filtering ───────────────────────────────────────────
  // Show tasks assigned to me OR created by me
  const myTasks = useMemo(
    () => allTasks.filter(t => t.assigneeId === user?.uid || t.createdBy === user?.uid),
    [allTasks, user],
  );

  const getTasksForDate = useCallback((date: Date): Task[] => {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(start); end.setDate(end.getDate() + 1);
    return myTasks.filter(t => {
      if (t.dueDate)     { const d = t.dueDate.toDate();     if (d >= start && d < end) return true; }
      if (t.completedAt) { const d = t.completedAt.toDate(); if (d >= start && d < end) return true; }
      if (!t.dueDate && t.status === 'pending' && isSameDay(date, new Date())) return true;
      return false;
    });
  }, [myTasks]);

  const selectedDateTasks = useMemo(() => getTasksForDate(selectedDate), [getTasksForDate, selectedDate]);
  const pendingTasks   = selectedDateTasks.filter(t => t.status === 'pending');
  const completedTasks = selectedDateTasks.filter(t => t.status === 'completed');

  const taskDateSet = useMemo(() => {
    const s = new Set<string>();
    myTasks.forEach(t => {
      if (t.dueDate)     s.add(format(t.dueDate.toDate(),     'yyyy-MM-dd'));
      if (t.completedAt) s.add(format(t.completedAt.toDate(), 'yyyy-MM-dd'));
    });
    return s;
  }, [myTasks]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleComplete = useCallback(async (task: Task) => {
    try { await completeTask(task); }
    catch (err) { Alert.alert(t.error, err instanceof Error ? err.message : t.homeErrComplete); }
  }, [completeTask, t]);

  const openModal = () => {
    taskTitleRef.current = '';
    setInputKey(k => k + 1);
    setSelectedAssigneeId(null);
    setSelectedEmoji('🏠');
    setTaskPoints(APP_CONFIG.DEFAULT_TASK_POINTS);
    setModalDate(selectedDate);
    setShowModal(true);
  };

  const handleAddTask = async () => {
    const title = taskTitleRef.current.trim();
    if (!title) return;
    setSubmitting(true);
    try {
      const assignee = members.find(m => m.userId === selectedAssigneeId);
      await createTask({
        title: `${selectedEmoji} ${title}`,
        category: 'other',
        assigneeId:   assignee?.userId,
        assigneeName: assignee?.displayName,
        points: taskPoints,
        isRecurring: false,
        dueDate: modalDate,
      });
      taskTitleRef.current = '';
      setInputKey(k => k + 1);
      setSelectedAssigneeId(null);
      setSelectedEmoji('🏠');
      setTaskPoints(APP_CONFIG.DEFAULT_TASK_POINTS);
      setShowModal(false);
    } catch (err) {
      Alert.alert(t.error, err instanceof Error ? err.message : t.homeErrCreate);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Calendar data ─────────────────────────────────────────────
  // Show the week that contains selectedDate (not always current week)
  const displayWeek = useMemo(() => eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end:   endOfWeek(selectedDate,   { weekStartsOn: 1 }),
  }), [selectedDate]);

  const calendarWeeks = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);
  const displayName   = userDoc?.displayName ?? user?.displayName ?? '';
  const isToday       = isSameDay(selectedDate, new Date());

  // ─── Render ────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header (fixed) ── */}
      <View style={styles.header}>
        <Text style={styles.displayName}>{displayName}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(app)/(home)/all-tasks')}
          >
            <Ionicons name="home-outline" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCircle} onPress={openModal}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Pink summary card (fixed) ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View>
            <Text style={styles.summaryTitle}>{t.homeTodayTasks}</Text>
            <Text style={styles.summarySubtitle}>
              {pendingTasks.length} {t.homePending} · {completedTasks.length} {t.homeCompleted}
            </Text>
          </View>
        </View>
        <View style={styles.summaryCount}>
          <Text style={styles.summaryCountText}>{pendingTasks.length}</Text>
        </View>
      </View>

      {/* ── Task list (scrollable) ── */}
      <ScrollView
        style={styles.taskScroll}
        contentContainerStyle={[styles.taskContent, { paddingBottom: COLLAPSED_H + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {pendingTasks.map(task => (
          <TaskRow key={task.id} task={task} onComplete={() => handleComplete(task)} />
        ))}
        {completedTasks.map(task => (
          <TaskRow key={task.id} task={task} onComplete={() => {}} />
        ))}
        {selectedDateTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>{isToday ? t.homeNoTasksToday : t.homeNoTasksDay}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Draggable calendar sheet (absolute) ── */}
      <Animated.View style={[styles.calSheet, { height: calHeight }]}>
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <View style={styles.handleBar} />
          <View style={styles.monthRow}>
            {calExpanded ? (
              <>
                <TouchableOpacity style={styles.navBtn} onPress={() => setCalendarMonth(m => subMonths(m, 1))}>
                  <Ionicons name="chevron-back" size={18} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{format(calendarMonth, t.dateYearMonth)}</Text>
                <TouchableOpacity style={styles.navBtn} onPress={() => setCalendarMonth(m => addMonths(m, 1))}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.monthText}>{format(selectedDate, t.dateFull)}</Text>
                <TouchableOpacity style={styles.todayChip} onPress={() => handleDatePress(new Date())}>
                  <Text style={styles.todayChipText}>{t.homeToday}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.weekLabelRow}>
          {t.homeWeekLabels.map((l, i) => <Text key={i} style={styles.weekLabel}>{l}</Text>)}
        </View>

        {/* Collapsed: week containing selectedDate */}
        {!calExpanded && (
          <View style={styles.weekRow}>
            {displayWeek.map(day => {
              const sel = isSameDay(day, selectedDate);
              const tod = isSameDay(day, new Date());
              return (
                <TouchableOpacity key={day.toISOString()} style={styles.dayCell} onPress={() => handleDatePress(day)}>
                  <View style={[styles.dayCellInner, sel && styles.dayCellSelected]}>
                    <Text style={[styles.dayNum, tod && !sel && styles.dayNumToday, sel && styles.dayNumSelected]}>{format(day, 'd')}</Text>
                  </View>
                  {taskDateSet.has(format(day, 'yyyy-MM-dd')) && <View style={[styles.taskDot, sel && styles.taskDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Expanded: full month */}
        {calExpanded && (
          <ScrollView style={styles.monthGrid} showsVerticalScrollIndicator={false}>
            {calendarWeeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map(day => {
                  const sel     = isSameDay(day, selectedDate);
                  const tod     = isSameDay(day, new Date());
                  const inMonth = isSameMonth(day, calendarMonth);
                  return (
                    <TouchableOpacity key={day.toISOString()} style={styles.dayCell} onPress={() => handleDatePress(day)}>
                      <View style={[styles.dayCellInner, sel && styles.dayCellSelected]}>
                        <Text style={[styles.dayNum, !inMonth && styles.dayNumFaded, tod && !sel && styles.dayNumToday, sel && styles.dayNumSelected]}>{format(day, 'd')}</Text>
                      </View>
                      {taskDateSet.has(format(day, 'yyyy-MM-dd')) && <View style={[styles.taskDot, sel && styles.taskDotSelected]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <TouchableOpacity style={styles.backBtn} onPress={() => { handleDatePress(new Date()); setCalendarMonth(new Date()); }}>
              <Text style={styles.backBtnText}>{t.homeBackToToday}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>

      {/* ── Add Task Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}
        onShow={() => setTimeout(() => inputRef.current?.focus(), 350)}>
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowModal(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t.homeAddTask}</Text>

            <TextInput
              ref={inputRef}
              key={inputKey}
              style={styles.input}
              placeholder={t.homeTaskName}
              placeholderTextColor={Colors.slate}
              onChangeText={t => { taskTitleRef.current = t; }}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />

            {/* Emoji */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]} onPress={() => setSelectedEmoji(e)}>
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Assignee */}
            <Text style={styles.sectionLabel}>{t.homeAssignee}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              <TouchableOpacity style={[styles.chip, !selectedAssigneeId && styles.chipActive]} onPress={() => setSelectedAssigneeId(null)}>
                <Text style={[styles.chipText, !selectedAssigneeId && styles.chipTextActive]}>{t.homeNoAssignee}</Text>
              </TouchableOpacity>
              {members.map(m => (
                <TouchableOpacity key={m.userId} style={[styles.chip, selectedAssigneeId === m.userId && styles.chipActive]} onPress={() => setSelectedAssigneeId(m.userId)}>
                  <Text style={[styles.chipText, selectedAssigneeId === m.userId && styles.chipTextActive]}>{m.displayName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date picker */}
            <Text style={styles.sectionLabel}>{t.homeTaskDate}</Text>
            <View style={styles.datePicker}>
              <TouchableOpacity style={styles.dateArrowBtn} onPress={() => setModalDate(d => subDays(d, 1))}>
                <Ionicons name="chevron-back" size={18} color={Colors.ink} />
              </TouchableOpacity>
              <Text style={styles.dateText}>{format(modalDate, t.dateMonthDay)}</Text>
              <TouchableOpacity style={styles.dateArrowBtn} onPress={() => setModalDate(d => addDays(d, 1))}>
                <Ionicons name="chevron-forward" size={18} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            {/* Points stepper */}
            <Text style={styles.sectionLabel}>{t.homeRewardPointsLabel}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setTaskPoints(p => Math.max(5, p - 5))}>
                <Ionicons name="remove" size={18} color={Colors.ink} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{t.homePoints(taskPoints)}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setTaskPoints(p => p + 5)}>
                <Ionicons name="add" size={18} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleAddTask} disabled={submitting}>
              <Text style={styles.submitBtnText}>{t.homeAddBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── TaskRow ──────────────────────────────────────────────────────
function TaskRow({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const done     = task.status === 'completed';
  const emoji    = task.title.match(/^(\p{Emoji})/u)?.[1] ?? '📋';
  const rawTitle = task.title.replace(/^(\p{Emoji}\s?)/u, '');
  return (
    <View style={[styles.taskRow, done && styles.taskRowDone]}>
      <Text style={styles.taskEmoji}>{emoji}</Text>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, done && styles.taskTitleDone]} numberOfLines={1}>{rawTitle}</Text>
        <View style={styles.taskMeta}>
          {task.assigneeName ? <Text style={styles.taskAssignee}>{task.assigneeName}</Text> : null}
          <Text style={styles.taskPoints}>⭐ {task.points} 积分</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.checkbox, done && styles.checkboxDone]} onPress={onComplete} disabled={done}>
        {done && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  displayName: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.ink },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lightBg,
    alignItems: 'center', justifyContent: 'center',
  },
  addCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
  },

  summaryCard: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  summaryIcon: { fontSize: 32 },
  summaryTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.ink },
  summarySubtitle: { fontSize: Typography.sm, color: Colors.ink, opacity: 0.7, marginTop: 2 },
  summaryCount: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1B1DF',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCountText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: '#1E0517' },

  taskScroll: { flex: 1 },
  taskContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs, gap: Spacing.sm },

  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg,
    padding: Spacing.md, gap: Spacing.md,
  },
  taskRowDone: { opacity: 0.45 },
  taskEmoji:   { fontSize: 24 },
  taskInfo:    { flex: 1 },
  taskTitle:   { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.ink },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.slate },
  taskMeta:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  taskAssignee:{ fontSize: Typography.xs, color: Colors.slate },
  taskPoints:  { fontSize: Typography.xs, color: Colors.slate },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.slate, alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.pink, borderColor: Colors.pink },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { fontSize: Typography.base, color: Colors.slate },

  // Calendar
  calSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.ink,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  dragZone: { paddingHorizontal: Spacing.lg, paddingTop: 10, paddingBottom: 6 },
  handleBar: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 10,
  },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthText: { flex: 1, textAlign: 'center', fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.white },
  navBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  todayChip: { backgroundColor: Colors.pink, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  todayChipText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.ink },
  weekLabelRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: 2 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: Typography.medium },
  weekRow: { flexDirection: 'row', paddingHorizontal: Spacing.md },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  // Circle selection indicator (round, not square)
  dayCellInner: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  dayCellSelected: { backgroundColor: Colors.pink },
  dayNum: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.white },
  dayNumToday: { color: Colors.pink, fontWeight: Typography.bold },
  dayNumSelected: { color: Colors.ink, fontWeight: Typography.bold },
  dayNumFaded: { color: 'rgba(255,255,255,0.25)' },
  taskDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginTop: 2 },
  taskDotSelected: { backgroundColor: Colors.ink },
  monthGrid: { flex: 1 },
  backBtn: { alignSelf: 'center', marginVertical: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99 },
  backBtnText: { fontSize: Typography.xs, color: Colors.pink },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.ink },
  input: { backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.base, color: Colors.ink, minHeight: 48 },
  emojiRow: { flexGrow: 0 },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBg, marginRight: Spacing.sm },
  emojiBtnActive: { backgroundColor: Colors.pink },
  emojiText: { fontSize: 22 },
  sectionLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.slate },
  chipRow: { flexGrow: 0 },
  chip: { borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.lightBg, marginRight: Spacing.sm },
  chipActive: { backgroundColor: Colors.pink },
  chipText: { fontSize: Typography.sm, color: Colors.slate },
  chipTextActive: { color: Colors.ink, fontWeight: Typography.semibold },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md,
  },
  dateArrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.ink, minWidth: 70, textAlign: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg, padding: Spacing.md },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.ink, minWidth: 80, textAlign: 'center' },
  submitBtn: { backgroundColor: Colors.ink, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.semibold },
});
