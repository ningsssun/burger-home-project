import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSharedLists, useCreateList, useDeleteList } from '@/features/lists/hooks/useLists';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { SharedList } from '@/shared/types/models';
import { useTranslation } from '@/shared/i18n';

export default function ListsScreen() {
  const { lists, loading } = useSharedLists();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const t = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const listTitleRef = useRef('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const title = listTitleRef.current.trim();
    if (!title) return;
    setCreating(true);
    try {
      await createList(title);
      listTitleRef.current = '';
      setInputKey(k => k + 1);
      setShowModal(false);
    } catch (err) {
      Alert.alert(t.error, err instanceof Error ? err.message : t.create);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (list: SharedList) => {
    Alert.alert(t.listsDeleteTitle, t.listsDeleteConfirm(list.title), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteList(list.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.listsTitle}</Text>
        <TouchableOpacity style={styles.addCircle} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Hero card */}
      {(() => {
        const pendingCount = lists.filter(l => l.status !== 'completed').length;
        return (
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <View>
                <Text style={styles.heroTitle}>{t.listsCount(lists.length)}</Text>
                <Text style={styles.heroSubtitle}>{t.listsPendingCount(pendingCount)}</Text>
              </View>
            </View>
            <View style={styles.heroCount}>
              <Text style={styles.heroCountText}>{pendingCount}</Text>
            </View>
          </View>
        );
      })()}

      <FlashList
        data={lists}
        keyExtractor={(item) => item.id}
        estimatedItemSize={72}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(app)/(lists)/${item.id}`)}>
            <View style={styles.listRow}>
              <Text style={styles.listEmoji}>📝</Text>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{item.title}</Text>
              </View>
              <View style={[styles.statusTag, item.status === 'completed' && styles.statusTagDone]}>
                <Text style={styles.statusTagText}>{item.status === 'completed' ? t.listsCompleted : t.listsPending}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.slate} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyTitle}>{t.listsEmpty}</Text>
              <Text style={styles.emptySubtitle}>{t.listsEmptySubtitle}</Text>
            </View>
          ) : null
        }
      />

      {/* Add list modal — plain View sheet so TextInput receives CJK input */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t.listsNew}</Text>
            <TextInput
              key={inputKey}
              style={styles.input}
              placeholder={t.listsNamePlaceholder}
              placeholderTextColor={Colors.slate}
              onChangeText={t => { listTitleRef.current = t; }}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity
              style={[styles.submitBtn, creating && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.submitBtnText}>{t.listsCreateBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroIcon: { fontSize: 32 },
  heroTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  heroSubtitle: { fontSize: Typography.sm, color: Colors.ink, opacity: 0.7, marginTop: 2 },
  heroCount: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1B1DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCountText: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: '#1E0517',
  },

  listContent: { paddingHorizontal: Spacing.lg },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listEmoji: { fontSize: 24 },
  listInfo: { flex: 1 },
  listTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.ink,
  },
  statusTag: {
    backgroundColor: Colors.pink,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusTagDone: { backgroundColor: Colors.lightBg },
  statusTagText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.ink,
  },

  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.semibold, color: Colors.ink },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.slate },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.ink,
  },
  input: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.ink,
  },
  submitBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
