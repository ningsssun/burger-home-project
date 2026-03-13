import React, { useState } from 'react';
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

type Mode = 'choose' | 'create' | 'join';

const createSchema = z.object({
  name: z.string().min(2, '家庭名称至少需要2个字符'),
});

const joinSchema = z.object({
  inviteCode: z.string().length(6, '邀请码必须是6位字符'),
});

type CreateFormData = z.infer<typeof createSchema>;
type JoinFormData = z.infer<typeof joinSchema>;

export default function JoinHouseholdScreen() {
  const [mode, setMode] = useState<Mode>('choose');
  const createHousehold = useCreateHousehold();
  const joinHousehold = useJoinHousehold();

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
      Alert.alert('错误', err instanceof Error ? err.message : '创建家庭失败');
    }
  };

  const onJoinSubmit = async (data: JoinFormData) => {
    try {
      await joinHousehold(data.inviteCode);
      router.replace('/(app)/(home)');
    } catch (err) {
      Alert.alert('错误', err instanceof Error ? err.message : '加入家庭失败');
    }
  };

  if (mode === 'choose') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>你的家庭</Text>
          <Text style={styles.subtitle}>
            创建新家庭，或使用邀请码加入已有家庭。
          </Text>
        </View>

        <View style={styles.choices}>
          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('create')}>
            <Text style={styles.choiceEmoji}>🏠</Text>
            <Text style={styles.choiceTitle}>创建家庭</Text>
            <Text style={styles.choiceDesc}>创建一个全新的共享空间</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('join')}>
            <Text style={styles.choiceEmoji}>🔑</Text>
            <Text style={styles.choiceTitle}>加入家庭</Text>
            <Text style={styles.choiceDesc}>输入家庭成员发送的邀请码</Text>
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
            <Text style={styles.title}>创建家庭</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={createForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="家庭名称"
                  placeholder="我们的小家"
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
              创建家庭
            </Button>
            <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
              返回
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
          <Text style={styles.title}>加入家庭</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={joinForm.control}
            name="inviteCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="邀请码"
                placeholder="ABC123"
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
            加入家庭
          </Button>
          <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
            返回
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
  emoji: {
    fontSize: 64,
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
