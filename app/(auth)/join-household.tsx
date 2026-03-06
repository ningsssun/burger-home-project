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
  name: z.string().min(2, 'Household name must be at least 2 characters'),
});

const joinSchema = z.object({
  inviteCode: z.string().length(6, 'Invite code must be 6 characters'),
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
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create household');
    }
  };

  const onJoinSubmit = async (data: JoinFormData) => {
    try {
      await joinHousehold(data.inviteCode);
      router.replace('/(app)/(home)');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to join household');
    }
  };

  if (mode === 'choose') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🏡</Text>
          <Text style={styles.title}>Your Household</Text>
          <Text style={styles.subtitle}>
            Create a new household or join an existing one with an invite code.
          </Text>
        </View>

        <View style={styles.choices}>
          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('create')}>
            <Text style={styles.choiceEmoji}>✨</Text>
            <Text style={styles.choiceTitle}>Create Household</Text>
            <Text style={styles.choiceDesc}>Start fresh with a new shared space</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('join')}>
            <Text style={styles.choiceEmoji}>🔑</Text>
            <Text style={styles.choiceTitle}>Join Household</Text>
            <Text style={styles.choiceDesc}>Enter an invite code from your household</Text>
          </TouchableOpacity>
        </View>
      </View>
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
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Create Household</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={createForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Household Name"
                  placeholder="The Smith House"
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
            >
              Create Household
            </Button>
            <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
              Back
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
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.title}>Join Household</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={joinForm.control}
            name="inviteCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Invite Code"
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
          >
            Join Household
          </Button>
          <Button variant="ghost" onPress={() => setMode('choose')} fullWidth>
            Back
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
