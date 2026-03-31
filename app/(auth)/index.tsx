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
import { useTranslation } from '@/shared/i18n';
import { useLanguageStore } from '@/shared/store/languageStore';
import { Language } from '@/shared/i18n/translations';

export default function WelcomeScreen() {
  const t = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const LANGS: { key: Language; label: string }[] = [
    { key: 'zh', label: '中文' },
    { key: 'ja', label: '日本語' },
    { key: 'ko', label: '한국어' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Language switcher */}
      <View style={styles.langBar}>
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
        <Text style={styles.slogan}>{t.welcomeSlogan}</Text>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>{t.welcomeStart}</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={22} color={Colors.ink} />
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.welcomeHasAccount}</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>{t.welcomeSignIn}</Text>
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

  langBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: Colors.lightBg,
  },
  langBtnActive: { backgroundColor: Colors.ink },
  langBtnText: { fontSize: Typography.sm, color: Colors.slate, fontWeight: Typography.medium },
  langBtnTextActive: { color: Colors.white, fontWeight: Typography.semibold },
});
