import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/components/ui';
import { useCreateHousehold } from '@/features/household/hooks/useCreateHousehold';
import { useJoinHousehold } from '@/features/household/hooks/useJoinHousehold';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { useTranslation } from '@/shared/i18n';

type Mode = 'choose' | 'create' | 'join';
type CreateFormData = { name: string };
type JoinFormData = { inviteCode: string };

export default function JoinHouseholdScreen() {
  const [mode, setMode] = useState<Mode>('choose');
  const createHousehold = useCreateHousehold();
  const joinHousehold = useJoinHousehold();
  const t = useTranslation();

  const createSchema = useMemo(() =>
    z.object({ name: z.string().min(2, t.joinErrNameMin) }),
  [t]);

  const joinSchema = useMemo(() =>
    z.object({ inviteCode: z.string().length(6, t.joinErrCodeLength) }),
  [t]);

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '' },
  });

  const joinForm = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: { inviteCode: '' },
  });

  const onCreateSubmit = async (data: CreateFormData) => {
    try {
      await createHousehold(data.name);
      router.replace('/(app)/(home)');
    } catch (err) {
      Alert.alert(t.joinErrTitle, err instanceof Error ? err.message : t.joinCreateFailed);
    }
  };

  const onJoinSubmit = async (data: JoinFormData) => {
    try {
      await joinHousehold(data.inviteCode);
      router.replace('/(app)/(home)');
    } catch (err) {
      Alert.alert(t.joinErrTitle, err instanceof Error ? err.message : t.joinJoinFailed);
    }
  };

  if (mode === 'choose') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.joinTitle}</Text>
          <Text style={styles.subtitle}>{t.joinSubtitle}</Text>
        </View>

        <View style={styles.choices}>
          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('create')}>
            <Text style={styles.choiceEmoji}>🏠</Text>
            <Text style={styles.choiceTitle}>{t.joinCreateTitle}</Text>
            <Text style={styles.choiceDesc}>{t.joinCreateDesc}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('join')}>
            <Text style={styles.choiceEmoji}>🔑</Text>
            <Text style={styles.choiceTitle}>{t.joinJoinTitle}</Text>
            <Text style={styles.choiceDesc}>{t.joinJoinDesc}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'create') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>{t.joinCreateTitle}</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={createForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t.joinNameLabel}
                  placeholder={t.joinNamePlaceholder}
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={createForm.formState.errors.name?.message}
                />
              )}
            />
            <Button
              onPress={createForm.handleSubmit(onCreateSubmit)}
              loading={createForm.formState.isSubmitting}
              fullWidth
              size="lg"
              style={{ backgroundColor: Colors.ink }}
            >
              {t.joinCreateBtn}
            </Button>
            <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
              {t.joinBack}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t.joinJoinTitle}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={joinForm.control}
            name="inviteCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t.joinCodeLabel}
                placeholder={t.joinCodePlaceholder}
                autoCapitalize="characters"
                maxLength={6}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                value={value}
                error={joinForm.formState.errors.inviteCode?.message}
              />
            )}
          />
          <Button
            onPress={joinForm.handleSubmit(onJoinSubmit)}
            loading={joinForm.formState.isSubmitting}
            fullWidth
            size="lg"
            style={{ backgroundColor: Colors.ink }}
          >
            {t.joinJoinBtn}
          </Button>
          <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
            {t.joinBack}
          </Button>
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
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
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
  choices: {
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  choiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  choiceEmoji: {
    fontSize: 40,
  },
  choiceTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  choiceDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
});
