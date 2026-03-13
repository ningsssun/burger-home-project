import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { format, getDay } from 'date-fns';
import { useCurrentUser, useCurrentUserDoc } from '@/features/auth/hooks/useAuth';
import { useSignOut } from '@/features/auth/hooks/useSignIn';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';

export default function ProfileScreen() {
  const user = useCurrentUser();
  const userDoc = useCurrentUserDoc();
  const members = useHouseholdMembers();
  const signOut = useSignOut();

  const allTasks = useTasks();
  const myMemberDoc = members.find((m) => m.userId === user?.uid);
  const allTimePoints = myMemberDoc?.allTimePoints ?? 0;

  const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const monthlyPoints = allTasks
    .filter(t =>
      t.status === 'completed' &&
      t.completedBy === user?.uid &&
      t.completedAt != null &&
      t.completedAt.toDate() >= startOfThisMonth
    )
    .reduce((s, t) => s + (t.points ?? 0), 0);

  const totalMonthlyPoints = members.reduce((sum, m) => {
    const mp = allTasks
      .filter(t =>
        t.status === 'completed' &&
        t.completedBy === m.userId &&
        t.completedAt != null &&
        t.completedAt.toDate() >= startOfThisMonth
      )
      .reduce((s, t) => s + (t.points ?? 0), 0);
    return sum + mp;
  }, 0);

  const contributionPct = totalMonthlyPoints > 0
    ? Math.round((monthlyPoints / totalMonthlyPoints) * 100)
    : 0;
  const displayName = userDoc?.displayName ?? user?.displayName ?? '用户';

  const handleSignOut = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Text style={styles.dateText}>{format(new Date(), 'M月d日')}，星期{['日','一','二','三','四','五','六'][getDay(new Date())]}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <Text style={styles.greeting}>你好，{'\n'}{displayName}</Text>

        {/* ── Hero card (dark) ── */}
        <View style={styles.heroCard}>
          {/* Gradient glow blob */}
          <LinearGradient
            colors={['#92587f', '#87597a', '#785976', '#806c86', '#887790']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glowBlob}
          />
          <View style={styles.heroCardBottom}>
            <View>
              <Text style={styles.heroLabel}>本月积分</Text>
              <Text style={styles.heroValue}>{monthlyPoints}</Text>
            </View>
          </View>
        </View>

        {/* ── Two small cards ── */}
        <View style={styles.cardRow}>
          <View style={styles.smallCard}>
            <View style={styles.smallBlob} />
            <Text style={styles.smallCardLabel}>贡献占比</Text>
            <View style={styles.smallCardBottom}>
              <Text style={styles.smallCardValue}>{contributionPct}%</Text>
              <View style={styles.playBtn}>
                <Ionicons name="stats-chart" size={16} color={Colors.white} />
              </View>
            </View>
          </View>

          <View style={[styles.smallCard, styles.smallCardAlt]}>
            <View style={[styles.smallBlob, styles.smallBlobAlt]} />
            <Text style={styles.smallCardLabel}>累计积分</Text>
            <View style={styles.smallCardBottom}>
              <Text style={styles.smallCardValue}>{allTimePoints}</Text>
              <View style={styles.playBtn}>
                <Ionicons name="trophy" size={16} color={Colors.white} />
              </View>
            </View>
          </View>
        </View>

        {/* ── Settings section ── */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(app)/(profile)/household')}
          >
            <Text style={styles.settingTitle}>家庭成员管理</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(app)/(profile)/alarm-settings')}
          >
            <Text style={styles.settingTitle}>闹钟设置</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(app)/(profile)/redeemed-rewards')}
          >
            <Text style={styles.settingTitle}>已兑换奖励</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: Typography.sm, color: Colors.slate },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Greeting
  greeting: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.ink,
    lineHeight: 36,
    marginTop: -Spacing.sm,
  },

  // Hero dark card
  heroCard: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: 180,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardNum: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.35)', fontWeight: Typography.medium },
  glowBlob: {
    position: 'absolute',
    right: -20,
    top: 10,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroCardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
  heroValue: {
    fontSize: 52,
    fontWeight: Typography.bold,
    color: Colors.white,
    lineHeight: 56,
  },

  // Two small cards
  cardRow: { flexDirection: 'row', gap: Spacing.sm },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    height: 150,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  smallCardAlt: { backgroundColor: '#F0EBF4' },
  cardNum2: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium },
  smallBlob: {
    position: 'absolute',
    right: 10,
    top: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.pink,
    opacity: 0.4,
  },
  smallBlobAlt: { backgroundColor: '#C8A8D8', opacity: 0.45 },
  smallCardLabel: { fontSize: Typography.xs, color: Colors.slate, marginTop: Spacing.md },
  smallCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallCardValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Settings section
  settingsSection: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  sectionNum: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium, marginBottom: 2 },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingTitle: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.ink,
    fontWeight: Typography.medium,
  },
  divider: { height: 1, backgroundColor: Colors.gray200 },
});
