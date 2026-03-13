import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useRedemptions } from '@/features/rewards/hooks/useRewards';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';

export default function RedeemedRewardsScreen() {
  const navigation = useNavigation();
  useFocusEffect(useCallback(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
  }, [navigation]));

  const { redemptions, loading } = useRedemptions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>已兑换奖励</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {redemptions.length === 0 && !loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyText}>还没有兑换记录</Text>
          </View>
        )}

        {redemptions.map(r => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.emoji}>{r.rewardEmoji}</Text>
            <View style={styles.info}>
              <Text style={styles.rewardTitle}>{r.rewardTitle}</Text>
              <Text style={styles.date}>
                {r.redeemedAt ? format(r.redeemedAt.toDate(), 'yyyy年M月d日 HH:mm') : ''}
              </Text>
            </View>
            <View style={styles.costTag}>
              <Text style={styles.costText}>-{r.pointsCost} 分</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  rewardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.ink,
  },
  date: { fontSize: Typography.xs, color: Colors.slate, marginTop: 2 },
  costTag: {
    backgroundColor: Colors.pink,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  costText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.ink },
});
