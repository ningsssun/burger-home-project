import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        <Image
          source={require('../../assets/images/welcome-illustration.jpg')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Bottom area */}
      <View style={styles.bottomArea}>
        <Text style={styles.slogan}>家的温度{'\n'}一起守护</Text>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>开始</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={22} color={Colors.ink} />
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>已有账户？</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },

  bottomArea: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  slogan: {
    fontSize: 28,
    fontWeight: Typography.bold,
    color: Colors.ink,
    lineHeight: 40,
    textAlign: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingLeft: Spacing.xl,
    paddingRight: 6,
    paddingVertical: 6,
    height: 64,
    minWidth: 180,
    marginVertical: Spacing.sm,
  },
  startBtnText: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.white,
    marginRight: Spacing.md,
  },
  arrowCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.sm,
    color: Colors.slate,
  },
  footerLink: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
});
