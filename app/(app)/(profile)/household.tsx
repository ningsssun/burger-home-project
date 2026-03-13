import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useHousehold, useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Avatar, Card } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';
import { MemberDoc } from '@/shared/types/models';

export default function HouseholdScreen() {
  const navigation = useNavigation();
  useFocusEffect(useCallback(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
  }, [navigation]));

  const household = useHousehold();
  const members = useHouseholdMembers();

  const copyInviteCode = async () => {
    if (!household?.inviteCode) return;
    await Clipboard.setStringAsync(household.inviteCode);
    Alert.alert('已复制', `邀请码 ${household.inviteCode} 已复制到剪贴板`);
  };

  const shareInviteCode = async () => {
    if (!household?.inviteCode) return;
    await Share.share({
      message: `加入我的家庭「${household.name}」，邀请码：${household.inviteCode}`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>家庭成员管理</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Household name */}
        <Card style={styles.nameCard}>
          <Text style={styles.emoji}>🏠</Text>
          <Text style={styles.householdName}>{household?.name}</Text>
          <Text style={styles.memberCount}>{members.length} 位成员</Text>
        </Card>

        {/* Invite code */}
        <Card>
          <Text style={styles.sectionLabel}>邀请码</Text>
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCode}>{household?.inviteCode}</Text>
          </View>
          <View style={styles.inviteActions}>
            <TouchableOpacity style={styles.inviteAction} onPress={copyInviteCode}>
              <Ionicons name="copy-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteActionText}>复制</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inviteAction} onPress={shareInviteCode}>
              <Ionicons name="share-outline" size={18} color={Colors.primary} />
              <Text style={styles.inviteActionText}>分享</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Members list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>成员列表</Text>
        </View>

        {members.map((member) => (
          <MemberRow key={member.userId} member={member} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MemberRow({ member }: { member: MemberDoc & { id: string } }) {
  const roleLabel = member.role === 'admin' ? '管理员' : '成员';

  return (
    <Card style={styles.memberCard}>
      <Avatar name={member.displayName} photoURL={member.photoURL} size={44} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.displayName}</Text>
        <Text style={styles.memberRole}>{roleLabel}</Text>
      </View>
    </Card>
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
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  nameCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emoji: { fontSize: 48 },
  householdName: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  memberCount: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inviteCodeContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inviteCode: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.primary,
    letterSpacing: 8,
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  inviteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  inviteActionText: {
    color: Colors.primary,
    fontWeight: Typography.medium,
    fontSize: Typography.sm,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  memberRole: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
});
