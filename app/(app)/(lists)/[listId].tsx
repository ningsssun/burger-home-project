import React, { useState } from 'react';
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
} from '@/features/lists/hooks/useLists';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { ListItem } from '@/shared/types/models';

export default function SharedListScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { lists } = useSharedLists();
  const list = lists.find((l) => l.id === listId);
  const { items, loading } = useListItems(listId);
  const addItem = useAddListItem();
  const toggleItem = useToggleListItem();
  const deleteItem = useDeleteListItem();

  const [newItemText, setNewItemText] = useState('');
  const [adding, setAdding] = useState(false);

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);

  const handleAdd = async () => {
    if (!newItemText.trim()) return;
    setAdding(true);
    try {
      await addItem(listId, newItemText.trim(), items.length);
      setNewItemText('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (item: ListItem) => {
    Alert.alert('Delete Item', `Delete "${item.text}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(listId, item.id) },
    ]);
  };

  const allItems = [
    ...unchecked,
    ...(checked.length > 0 ? [{ id: '__divider__', text: '', isChecked: false, addedBy: '', addedByName: '', checkedBy: null, order: -1, createdAt: null as any }] : []),
    ...checked,
  ] as ListItem[];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{list?.title ?? 'List'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlashList
        data={allItems}
        keyExtractor={(item) => item.id}
        estimatedItemSize={56}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.id === '__divider__') {
            return (
              <View style={styles.divider}>
                <Text style={styles.dividerText}>Checked ({checked.length})</Text>
              </View>
            );
          }
          return (
            <View style={[styles.item, item.isChecked && styles.itemChecked]}>
              <TouchableOpacity
                onPress={() => toggleItem(listId, item.id, !item.isChecked)}
                style={styles.checkbox}
              >
                {item.isChecked ? (
                  <Ionicons name="checkbox" size={24} color={Colors.success} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={Colors.gray300} />
                )}
              </TouchableOpacity>
              <Text style={[styles.itemText, item.isChecked && styles.itemTextChecked]} numberOfLines={2}>
                {item.text}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={Colors.gray300} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>Add items below</Text>
          </View>
        }
      />

      {/* Add item bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.addBar}>
          <TextInput
            style={styles.addInput}
            placeholder="Add item..."
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            placeholderTextColor={Colors.gray400}
          />
          <TouchableOpacity
            style={[styles.addBtn, (!newItemText.trim() || adding) && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!newItemText.trim() || adding}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
  },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  itemChecked: {
    backgroundColor: Colors.gray50,
  },
  checkbox: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  itemText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  divider: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dividerText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  addInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
});
