import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useSharedLists,
  useListItems,
  useAddListItem,
  useToggleListItem,
  useDeleteListItem,
  useUpdateListStatus,
} from '@/features/lists/hooks/useLists';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { ListItem } from '@/shared/types/models';
import { useTranslation } from '@/shared/i18n';

export default function SharedListScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { lists } = useSharedLists();
  const list = lists.find((l) => l.id === listId);
  const { items, loading } = useListItems(listId);
  const addItem         = useAddListItem();
  const toggleItem      = useToggleListItem();
  const deleteItem      = useDeleteListItem();
  const updateListStatus = useUpdateListStatus();

  const t = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const inputTextRef = useRef('');

  const unchecked = items.filter((i) => !i.isChecked);
  const checked   = items.filter((i) =>  i.isChecked);

  // Auto-update list status when all items are checked
  useEffect(() => {
    if (!listId || items.length === 0 || loading) return;
    const allDone = items.every(i => i.isChecked);
    const newStatus = allDone ? 'completed' : 'active';
    if (list?.status !== newStatus) {
      updateListStatus(listId, newStatus).catch(console.error);
    }
  }, [items, listId, list?.status, loading, updateListStatus]);

  const handleAdd = async () => {
    const text = inputTextRef.current.trim();
    if (!text) return;
    try {
      await addItem(listId, text, items.length);
      inputTextRef.current = '';
      inputRef.current?.clear();
    } catch (err) {
      Alert.alert(t.error, err instanceof Error ? err.message : t.add);
    }
  };

  const handleDelete = (item: ListItem) => {
    Alert.alert(t.listDetailDeleteTitle, t.listDetailDeleteConfirm(item.text), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteItem(listId, item.id) },
    ]);
  };

  const allItems = [
    ...unchecked,
    ...(checked.length > 0
      ? [{ id: '__divider__', text: '', isChecked: false, addedBy: '', addedByName: '', checkedBy: null, order: -1, createdAt: null as any }]
      : []),
    ...checked,
  ] as ListItem[];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{list?.title ?? t.listDetailDefault}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress summary */}
      {items.length > 0 && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(checked.length / items.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{checked.length}/{items.length}</Text>
        </View>
      )}

      <FlashList
        data={allItems}
        keyExtractor={(item) => item.id}
        estimatedItemSize={56}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.id === '__divider__') {
            return (
              <View style={styles.divider}>
                <Text style={styles.dividerText}>{t.listDetailChecked(checked.length)}</Text>
              </View>
            );
          }
          return (
            <View style={[styles.item, item.isChecked && styles.itemChecked]}>
              <TouchableOpacity
                onPress={() => toggleItem(listId, item.id, !item.isChecked)}
                style={styles.checkboxBtn}
              >
                {item.isChecked ? (
                  <View style={styles.checkboxChecked}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                ) : (
                  <View style={styles.checkboxUnchecked} />
                )}
              </TouchableOpacity>
              <Text style={[styles.itemText, item.isChecked && styles.itemTextChecked]} numberOfLines={2}>
                {item.text}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={Colors.slate} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={styles.emptyText}>在下方添加物品</Text>
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.addBar}>
          <TextInput
            ref={inputRef}
            style={styles.addInput}
            placeholder="添加物品..."
            onChangeText={t => { inputTextRef.current = t; }}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            placeholderTextColor={Colors.slate}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lightBg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.ink,
    marginHorizontal: Spacing.sm,
  },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  progressTrack: {
    flex: 1, height: 6, backgroundColor: Colors.lightBg,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.pink, borderRadius: 3 },
  progressText: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  itemChecked: { opacity: 0.6 },
  checkboxBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  checkboxUnchecked: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.slate,
  },
  checkboxChecked: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
  },
  itemText: { flex: 1, fontSize: Typography.base, color: Colors.ink },
  itemTextChecked: { textDecorationLine: 'line-through', color: Colors.slate },

  divider: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  dividerText: {
    fontSize: Typography.xs, color: Colors.slate,
    fontWeight: Typography.semibold, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.slate },

  addBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.gray200,
  },
  addInput: {
    flex: 1, height: 44,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base, color: Colors.ink,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
  },
});
