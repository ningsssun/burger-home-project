import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/components/ui';
import { useSignUp } from '@/features/auth/hooks/useSignIn';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';
import { useTranslation } from '@/shared/i18n';

type FormData = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpScreen() {
  const signUp = useSignUp();
  const t = useTranslation();

  const schema = useMemo(() =>
    z.object({
      displayName: z.string().min(2, t.signUpErrNameMin),
      email: z.string().email(t.signUpErrEmail),
      password: z.string().min(6, t.signUpErrPasswordMin),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: t.signUpErrPasswordMismatch,
      path: ['confirmPassword'],
    }),
  [t]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, data.displayName);
      router.replace('/(auth)/join-household');
    } catch (err) {
      const message = err instanceof Error ? err.message : '出现了一些问题';
      Alert.alert(t.signUpAlertTitle, message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/house-illustration.jpg')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t.signUpTitle}</Text>
          <Text style={styles.subtitle}>{t.signUpSubtitle}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.signUpName}
                placeholder={t.signUpNamePlaceholder}
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.displayName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.signUpEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.signUpPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.signUpConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={{ backgroundColor: Colors.ink }}
          >
            {t.signUpBtn}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.signUpHasAccount}{' '}</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Text style={styles.link}>{t.signUpSignInLink}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  illustration: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  link: {
    color: Colors.primary,
    fontWeight: Typography.semibold,
    fontSize: Typography.sm,
  },
});
