import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRewards, useCreateReward, useRedeemReward, useDeleteReward } from '@/features/rewards/hooks/useRewards';
import { useCurrentUser } from '@/features/auth/hooks/useAuth';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { useTranslation } from '@/shared/i18n';

const REWARD_EMOJIS = ['🎁', '🍕', '🎮', '🎬', '☕', '🛍️', '✈️', '🎂', '🏖️', '🎤'];

export default function RewardsScreen() {
  const t = useTranslation();
  const { rewards, loading } = useRewards();
  const createReward = useCreateReward();
  const redeemReward = useRedeemReward();
  const deleteReward = useDeleteReward();
  const user = useCurrentUser();
  const members = useHouseholdMembers();

  const myMember = members.find(m => m.userId === user?.uid);
  const myPoints = myMember?.weeklyPoints ?? 0;

  const [showModal, setShowModal] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const rewardTitleRef = useRef('');
  const [pointsCost, setPointsCost] = useState(50);
  const [selectedEmoji, setSelectedEmoji] = useState('🎁');
  const [submitting, setSubmitting] = useState(false);

  const nextReward = rewards.find(r => r.pointsCost > myPoints);
  const progressPct = nextReward ? Math.min(myPoints / nextReward.pointsCost, 1) : 1;

  const handleCreate = async () => {
    const title = rewardTitleRef.current.trim();
    if (!title) return;
    setSubmitting(true);
    try {
      await createReward(title, selectedEmoji, pointsCost);
      rewardTitleRef.current = '';
      setInputKey(k => k + 1);
      setPointsCost(50);
      setSelectedEmoji('🎁');
      setShowModal(false);
    } catch (err) {
      Alert.alert(t.error, err instanceof Error ? err.message : t.create);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (rewardId: string, title: string) => {
    Alert.alert(t.rewardsDeleteTitle, t.rewardsDeleteConfirm(title), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteReward(rewardId) },
    ]);
  };

  const handleRedeem = (reward: { id: string; pointsCost: number; title: string; emoji: string }) => {
    if (myPoints < reward.pointsCost) {
      Alert.alert(t.rewardsInsufficientTitle, t.rewardsInsufficientMsg(reward.title, reward.pointsCost, myPoints));
      return;
    }
    Alert.alert(t.rewardsRedeemTitle, t.rewardsRedeemConfirm(reward.pointsCost, reward.title), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.confirm,
        onPress: async () => {
          try {
            await redeemReward(reward.pointsCost, reward.id, reward.title, reward.emoji);
            Alert.alert(t.rewardsSuccessTitle, t.rewardsSuccessMsg(reward.title));
          } catch (err) {
            Alert.alert(t.error, err instanceof Error ? err.message : t.rewardsRedeemFailed);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.rewardsTitle}</Text>
          <TouchableOpacity style={styles.addCircle} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Points card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <View>
              <Text style={styles.pointsLabel}>{t.rewardsMyPoints}</Text>
              <Text style={styles.pointsSubLabel}>{t.rewardsEarnHint}</Text>
            </View>
          </View>
          <Text style={styles.pointsValue}>{myPoints}</Text>
        </View>

        {/* Progress to next reward */}
        {nextReward && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {t.rewardsNextReward(nextReward.emoji, nextReward.title)}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {t.rewardsProgress(myPoints, nextReward.pointsCost)}
            </Text>
          </View>
        )}

        {/* Rewards list */}
        <Text style={styles.sectionLabel}>{t.rewardsSection}</Text>

        {rewards.length === 0 && !loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyText}>{t.rewardsEmpty}</Text>
          </View>
        )}

        {rewards.map(reward => {
          const affordable = myPoints >= reward.pointsCost;
          return (
            <View key={reward.id} style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardCost}>{t.rewardsCost(reward.pointsCost)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemTag, !affordable && styles.redeemTagDisabled]}
                onPress={() => handleRedeem(reward)}
              >
                <Text style={styles.redeemTagText}>{t.rewardsRedeem}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(reward.id, reward.title)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.slate} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Add reward modal — plain View sheet for CJK input */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t.rewardsAddTitle}</Text>

            <TextInput
              key={inputKey}
              style={styles.input}
              placeholder={t.rewardsNamePlaceholder}
              placeholderTextColor={Colors.slate}
              onChangeText={v => { rewardTitleRef.current = v; }}
              returnKeyType="done"
            />

            {/* Emoji row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {REWARD_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
                  onPress={() => setSelectedEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Points cost stepper */}
            <Text style={styles.sectionLabel}>{t.rewardsPointsLabel}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setPointsCost(Math.max(10, pointsCost - 10))}
              >
                <Ionicons name="remove" size={20} color={Colors.ink} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{pointsCost}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setPointsCost(pointsCost + 10)}
              >
                <Ionicons name="add" size={20} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{t.rewardsAddBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pointsCard: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  pointsTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pointsStar: { fontSize: 32 },
  pointsLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  pointsSubLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  pointsValue: {
    fontSize: 48,
    fontWeight: Typography.bold,
    color: Colors.pink,
  },

  progressSection: { gap: 8 },
  progressLabel: { fontSize: Typography.sm, color: Colors.slate },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.lightBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.pink,
    borderRadius: 4,
  },
  progressText: { fontSize: Typography.xs, color: Colors.slate, textAlign: 'right' },

  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.slate },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  rewardEmoji: { fontSize: 28 },
  rewardInfo: { flex: 1 },
  rewardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.ink,
  },
  rewardCost: { fontSize: Typography.xs, color: Colors.slate, marginTop: 2 },
  redeemTag: {
    backgroundColor: Colors.pink,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  redeemTagDisabled: { opacity: 0.4 },
  redeemTagText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.ink,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  input: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.ink,
  },
  emojiRow: { flexGrow: 0 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBg,
    marginRight: Spacing.sm,
  },
  emojiBtnActive: { backgroundColor: Colors.pink },
  emojiText: { fontSize: 22 },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.ink,
    minWidth: 50,
    textAlign: 'center',
  },

  submitBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
