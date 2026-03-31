import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { query, where, onSnapshot } from 'firebase/firestore';
import { tasksCol } from '@/shared/lib/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHousehold } from '@/features/household/hooks/useHousehold';
import { useCurrentUser } from '@/features/auth/hooks/useAuth';
import { useDeleteTask } from '@/features/tasks/hooks/useDeleteTask';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { Task } from '@/shared/types/models';
import { useTranslation } from '@/shared/i18n';

type AlarmFrequency = 'today' | 'week' | 'daily';

interface Alarm {
  taskId: string;
  notificationIds: string[];
  hour: number;
  minute: number;
  frequency: AlarmFrequency;
}

export default function AlarmSettingsScreen() {
  const t = useTranslation();
  const navigation = useNavigation();
  useFocusEffect(useCallback(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
  }, [navigation]));

  const FREQ_OPTIONS: { key: AlarmFrequency; label: string }[] = [
    { key: 'today', label: t.alarmTodayOnly },
    { key: 'week',  label: t.alarmThisWeek },
    { key: 'daily', label: t.alarmDaily },
  ];

  const FREQ_DISPLAY: Record<AlarmFrequency, string> = {
    today: t.alarmTodayOnly,
    week:  t.alarmThisWeek,
    daily: t.alarmDaily,
  };

  const household = useHousehold();
  const user = useCurrentUser();
  const deleteTask = useDeleteTask();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsLoaded, setAlarmsLoaded] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [frequency, setFrequency] = useState<AlarmFrequency>('daily');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Load persisted alarms on mount
  useEffect(() => {
    AsyncStorage.getItem('alarms').then(raw => {
      if (raw) setAlarms(JSON.parse(raw));
      setAlarmsLoaded(true);
    }).catch(() => setAlarmsLoaded(true));
  }, []);

  // Persist alarms whenever they change (only after initial load)
  useEffect(() => {
    if (!alarmsLoaded) return;
    AsyncStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms, alarmsLoaded]);

  useEffect(() => {
    if (!household?.id || !user?.uid) { setPendingTasks([]); return; }
    const q = query(tasksCol(), where('householdId', '==', household.id));
    const unsub = onSnapshot(q, snap => {
      const tasks = snap.docs
        .map(d => ({ id: d.id, ...d.data() }) as Task)
        .filter(task => task.status === 'pending' && task.assigneeId === user.uid);
      setPendingTasks(tasks);
    });
    return unsub;
  }, [household?.id, user?.uid]);

  // Cancel alarms for tasks that are no longer pending
  useEffect(() => {
    const pendingIds = new Set(pendingTasks.map(task => task.id));
    alarms.forEach(async alarm => {
      if (!pendingIds.has(alarm.taskId)) {
        for (const id of alarm.notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        setAlarms(prev => prev.filter(a => a.taskId !== alarm.taskId));
      }
    });
  }, [pendingTasks]);

  const openPicker = (task: Task) => {
    setSelectedTask(task);
    const existing = alarms.find(a => a.taskId === task.id);
    const d = new Date();
    if (existing) {
      d.setHours(existing.hour, existing.minute, 0, 0);
      setFrequency(existing.frequency);
    } else {
      d.setHours(8, 0, 0, 0);
      setFrequency('daily');
    }
    setPickerTime(d);
    setShowPicker(true);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed' || !date || !selectedTask) return;
      scheduleAlarm(selectedTask, date, frequency);
    } else {
      if (date) setPickerTime(date);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    if (selectedTask) scheduleAlarm(selectedTask, pickerTime, frequency);
  };

  const scheduleAlarm = async (task: Task, date: Date, freq: AlarmFrequency) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Cancel existing alarm
    const existing = alarms.find(a => a.taskId === task.id);
    if (existing) {
      for (const id of existing.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }

    const content = { title: t.alarmNotifTitle, body: task.title, data: { taskId: task.id } };
    const notificationIds: string[] = [];

    if (freq === 'daily') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
      notificationIds.push(id);

    } else if (freq === 'today') {
      const target = new Date();
      target.setHours(hour, minute, 0, 0);
      if (target <= new Date()) {
        Alert.alert(t.alarmTimePassedTitle, t.alarmTimePassedMsg);
        return;
      }
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: target },
      });
      notificationIds.push(id);

    } else if (freq === 'week') {
      const now = new Date();
      // Schedule for each remaining day of the current week (Mon–Sun)
      const today = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
      // Map to Mon=0..Sun=6 ordering
      const todayIdx = today === 0 ? 6 : today - 1;
      for (let i = 0; i < 7; i++) {
        const daysAhead = i - todayIdx;
        if (daysAhead < 0) continue; // past day
        const target = new Date();
        target.setDate(target.getDate() + daysAhead);
        target.setHours(hour, minute, 0, 0);
        if (daysAhead === 0 && target <= now) continue; // today but time passed
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: target },
        });
        notificationIds.push(id);
      }
      if (notificationIds.length === 0) {
        Alert.alert(t.alarmWeekPassedTitle, t.alarmWeekPassedMsg);
        return;
      }
    }

    setAlarms(prev => [
      ...prev.filter(a => a.taskId !== task.id),
      { taskId: task.id, notificationIds, hour, minute, frequency: freq },
    ]);

    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    Alert.alert(t.alarmSetTitle, t.alarmSetMsg(FREQ_DISPLAY[freq], timeStr, task.title));
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    Alert.alert(t.alarmDeleteTitle, t.alarmDeleteConfirm(rawTitle(title)), [
      { text: t.alarmCancelBtn, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        await removeAlarm(taskId);
        await deleteTask(taskId);
      }},
    ]);
  };

  const removeAlarm = async (taskId: string) => {
    const alarm = alarms.find(a => a.taskId === taskId);
    if (alarm) {
      for (const id of alarm.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      setAlarms(prev => prev.filter(a => a.taskId !== taskId));
    }
  };

  const getAlarm = (taskId: string) => alarms.find(a => a.taskId === taskId) ?? null;

  const getAlarmLabel = (taskId: string) => {
    const alarm = getAlarm(taskId);
    if (!alarm) return null;
    const timeStr = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;
    return `${FREQ_DISPLAY[alarm.frequency]} ${timeStr}`;
  };

  const isExpired = (taskId: string) => {
    const alarm = getAlarm(taskId);
    if (!alarm) return false;
    if (alarm.frequency === 'daily') return false; // daily never expires
    const now = new Date();
    return now.getHours() > alarm.hour ||
      (now.getHours() === alarm.hour && now.getMinutes() >= alarm.minute);
  };

  const emoji = (title: string) => title.match(/^(\p{Emoji})/u)?.[1] ?? '📋';
  const rawTitle = (title: string) => title.replace(/^(\p{Emoji}\s?)/u, '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.alarmTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{t.alarmHint}</Text>

        {pendingTasks.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⏰</Text>
            <Text style={styles.emptyText}>{t.alarmNoTasks}</Text>
          </View>
        )}

        {pendingTasks.map(task => {
          const alarmLabel = getAlarmLabel(task.id);
          const expired = isExpired(task.id);
          return (
            <View key={task.id} style={styles.row}>
              <Text style={styles.taskEmoji}>{emoji(task.title)}</Text>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle} numberOfLines={1}>{rawTitle(task.title)}</Text>
                {alarmLabel ? (
                  <Text style={styles.alarmTime}>{alarmLabel} {t.alarmReminderSuffix}</Text>
                ) : (
                  <Text style={styles.noAlarm}>{t.alarmNoReminder}</Text>
                )}
              </View>
              <View style={styles.actions}>
                {!alarmLabel && (
                  <TouchableOpacity style={styles.setBtn} onPress={() => openPicker(task)}>
                    <Text style={styles.setBtnText}>{t.alarmSetBtn}</Text>
                  </TouchableOpacity>
                )}
                {alarmLabel && !expired && (
                  <TouchableOpacity style={styles.statusSetBtn} onPress={() => openPicker(task)}>
                    <Text style={styles.statusSetText}>{t.alarmSetDone}</Text>
                  </TouchableOpacity>
                )}
                {alarmLabel && expired && (
                  <TouchableOpacity style={styles.statusExpiredBtn} onPress={() => openPicker(task)}>
                    <Text style={styles.statusExpiredText}>{t.alarmExpired}</Text>
                  </TouchableOpacity>
                )}
                {alarmLabel && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeAlarm(task.id)}>
                    <Ionicons name="close" size={16} color={Colors.slate} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Time picker sheet */}
      {showPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.pickerCancel}>{t.alarmCancelBtn}</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>
              {selectedTask ? rawTitle(selectedTask.title) : ''}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.pickerDone}>{t.alarmConfirmBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* Frequency chips */}
          <View style={styles.freqRow}>
            {FREQ_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.freqChip, frequency === opt.key && styles.freqChipActive]}
                onPress={() => setFrequency(opt.key)}
              >
                <Text style={[styles.freqChipText, frequency === opt.key && styles.freqChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <DateTimePicker
            value={pickerTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            locale="zh-CN"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.ink },

  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  hint: { fontSize: Typography.sm, color: Colors.slate, marginBottom: Spacing.sm },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.slate },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  taskEmoji: { fontSize: 24 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.ink },
  alarmTime: { fontSize: Typography.xs, color: Colors.slate, marginTop: 2 },
  noAlarm: { fontSize: Typography.xs, color: Colors.slate, marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  setBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setBtnText: { fontSize: Typography.xs, color: Colors.white, fontWeight: Typography.semibold },
  statusSetBtn: { backgroundColor: Colors.pink, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  statusSetText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.ink },
  statusExpiredBtn: { backgroundColor: Colors.lightBg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  statusExpiredText: { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.slate },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightBg,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickerContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingBottom: Spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pickerTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.ink },
  pickerCancel: { fontSize: Typography.base, color: Colors.slate },
  pickerDone: { fontSize: Typography.base, color: Colors.pink, fontWeight: Typography.semibold },

  freqRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  freqChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.lightBg,
    alignItems: 'center',
  },
  freqChipActive: { backgroundColor: Colors.ink },
  freqChipText: { fontSize: Typography.sm, color: Colors.slate, fontWeight: Typography.medium },
  freqChipTextActive: { color: Colors.white, fontWeight: Typography.semibold },
});
