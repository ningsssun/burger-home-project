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
import { useSignIn } from '@/features/auth/hooks/useSignIn';
import { Colors, Spacing, Typography } from '@/shared/constants/theme';
import { useTranslation } from '@/shared/i18n';

type FormData = { email: string; password: string };

export default function SignInScreen() {
  const signIn = useSignIn();
  const t = useTranslation();

  const schema = useMemo(() =>
    z.object({
      email: z.string().email(t.signInErrEmail),
      password: z.string().min(6, t.signInErrPassword),
    }),
  [t]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
      router.replace('/(app)/(home)');
    } catch {
      Alert.alert(t.signInAlertTitle, t.signInAlertMsg);
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
          <Text style={styles.title}>{t.signInTitle}</Text>
          <Text style={styles.subtitle}>{t.signInSubtitle}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.signInEmail}
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
                label={t.signInPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
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
            {t.signInBtn}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.signInNoAccount}{' '}</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Text style={styles.link}>{t.signInSignUpLink}</Text>
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
