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
import { useCurrentUser, useCurrentUserDoc } from '@/features/auth/hooks/useAuth';
import { useSignOut } from '@/features/auth/hooks/useSignIn';
import { useHousehold } from '@/features/household/hooks/useHousehold';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { Avatar, Card } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';

export default function ProfileScreen() {
  const user = useCurrentUser();
  const userDoc = useCurrentUserDoc();
  const household = useHousehold();
  const members = useHouseholdMembers();
  const signOut = useSignOut();

  const myMemberDoc = members.find((m) => m.userId === user?.uid);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
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
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Avatar + name */}
        <View style={styles.profileCard}>
          <Avatar
            name={userDoc?.displayName ?? user?.displayName ?? '?'}
            photoURL={userDoc?.photoURL}
            size={80}
          />
          <Text style={styles.name}>{userDoc?.displayName ?? user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Points */}
        {myMemberDoc && (
          <Card style={styles.pointsCard}>
            <View style={styles.pointsRow}>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsValue}>{myMemberDoc.weeklyPoints}</Text>
                <Text style={styles.pointsLabel}>This Week</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.pointsItem}>
                <Text style={styles.pointsValue}>{myMemberDoc.allTimePoints}</Text>
                <Text style={styles.pointsLabel}>All Time</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.pointsItem}>
                <Text style={[styles.pointsValue, { color: Colors.primary }]}>
                  {myMemberDoc.role === 'admin' ? '👑' : '⭐'}
                </Text>
                <Text style={styles.pointsLabel}>{myMemberDoc.role}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Household */}
        {household && (
          <Card>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(app)/(profile)/household')}
            >
              <Ionicons name="home-outline" size={20} color={Colors.primary} />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{household.name}</Text>
                <Text style={styles.menuSubtitle}>{members.length} members · Tap to manage</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/(app)/(profile)/household')}
          >
            <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
            <Text style={[styles.menuTitle, { flex: 1, marginLeft: Spacing.sm }]}>
              Leaderboard
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  screenTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  profileCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  name: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  pointsCard: { padding: 0 },
  pointsRow: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  pointsItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pointsValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  pointsLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.gray100,
    marginVertical: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  menuContent: { flex: 1 },
  menuTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  signOutText: {
    color: Colors.error,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
});
