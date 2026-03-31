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
import { getDay } from 'date-fns';
import { useCurrentUser, useCurrentUserDoc } from '@/features/auth/hooks/useAuth';
import { useSignOut } from '@/features/auth/hooks/useSignIn';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { useTranslation } from '@/shared/i18n';
import { useLanguageStore } from '@/shared/store/languageStore';
import { Language } from '@/shared/i18n/translations';

export default function ProfileScreen() {
  const t = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const user = useCurrentUser();
  const userDoc = useCurrentUserDoc();
  const members = useHouseholdMembers();
  const signOut = useSignOut();

  const allTasks = useTasks();
  const myMemberDoc = members.find((m) => m.userId === user?.uid);
  const allTimePoints = myMemberDoc?.allTimePoints ?? 0;

  const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const monthlyPoints = allTasks
    .filter(task =>
      task.status === 'completed' &&
      task.completedBy === user?.uid &&
      task.completedAt != null &&
      task.completedAt.toDate() >= startOfThisMonth
    )
    .reduce((s, task) => s + (task.points ?? 0), 0);

  const totalMonthlyPoints = members.reduce((sum, m) => {
    const mp = allTasks
      .filter(task =>
        task.status === 'completed' &&
        task.completedBy === m.userId &&
        task.completedAt != null &&
        task.completedAt.toDate() >= startOfThisMonth
      )
      .reduce((s, task) => s + (task.points ?? 0), 0);
    return sum + mp;
  }, 0);

  const contributionPct = totalMonthlyPoints > 0
    ? Math.round((monthlyPoints / totalMonthlyPoints) * 100)
    : 0;
  const displayName = userDoc?.displayName ?? user?.displayName ?? '';

  const now = new Date();
  const dateLabel = t.profileDateLabel(now.getMonth() + 1, now.getDate(), getDay(now));

  const handleSignOut = () => {
    Alert.alert(t.profileSignOutTitle, t.profileSignOutMsg, [
      { text: t.profileCancelBtn, style: 'cancel' },
      {
        text: t.profileSignOutBtn,
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const LANGS: { key: Language; label: string }[] = [
    { key: 'zh', label: t.langZh },
    { key: 'ja', label: t.langJa },
    { key: 'ko', label: t.langKo },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <Text style={styles.greeting}>{t.profileGreeting(displayName)}</Text>

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
              <Text style={styles.heroLabel}>{t.profileMonthlyPoints}</Text>
              <Text style={styles.heroValue}>{monthlyPoints}</Text>
            </View>
          </View>
        </View>

        {/* ── Two small cards ── */}
        <View style={styles.cardRow}>
          <View style={styles.smallCard}>
            <View style={styles.smallBlob} />
            <Text style={styles.smallCardLabel}>{t.profileContribution}</Text>
            <View style={styles.smallCardBottom}>
              <Text style={styles.smallCardValue}>{contributionPct}%</Text>
              <View style={styles.playBtn}>
                <Ionicons name="stats-chart" size={16} color={Colors.white} />
              </View>
            </View>
          </View>

          <View style={[styles.smallCard, styles.smallCardAlt]}>
            <View style={[styles.smallBlob, styles.smallBlobAlt]} />
            <Text style={styles.smallCardLabel}>{t.profileAllTime}</Text>
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
            <Text style={styles.settingTitle}>{t.profileMemberMgmt}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(app)/(profile)/alarm-settings')}
          >
            <Text style={styles.settingTitle}>{t.profileAlarmSettings}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(app)/(profile)/redeemed-rewards')}
          >
            <Text style={styles.settingTitle}>{t.profileRedeemedRewards}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.slate} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Language switcher */}
          <View style={styles.settingRow}>
            <Text style={styles.settingTitle}>{t.profileLanguage}</Text>
            <View style={styles.langRow}>
              {LANGS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.langBtn, language === key && styles.langBtnActive]}
                  onPress={() => setLanguage(key)}
                >
                  <Text style={[styles.langBtnText, language === key && styles.langBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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

  // Language switcher
  langRow: { flexDirection: 'row', gap: 6 },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  langBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  langBtnText: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium },
  langBtnTextActive: { color: Colors.white, fontWeight: Typography.semibold },
});
