import { useEffect, useState, useCallback } from 'react';
import {
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { sharedListsCol, sharedListDoc, listItemsCol, listItemDoc } from '../../../shared/lib/firestore';
import { SharedList, ListItem } from '../../../shared/types/models';
import { useListsStore } from '../store/listsStore';
import { useHousehold } from '../../household/hooks/useHousehold';
import { useCurrentUser } from '../../auth/hooks/useAuth';

/**
 * Subscribes to all shared lists for the current household.
 * Should be mounted once in the lists _layout.tsx so the Zustand store
 * stays up-to-date and new lists appear immediately everywhere.
 */
export function useListsSubscription() {
  const household = useHousehold();
  const { setLists, setLoading } = useListsStore();

  useEffect(() => {
    if (!household?.id) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      sharedListsCol(),
      where('householdId', '==', household.id),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SharedList[];
        docs.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setLists(docs);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [household?.id, setLists, setLoading]);
}

export function useSharedLists() {
  const lists = useListsStore((s) => s.lists);
  const loading = useListsStore((s) => s.isLoading);
  return { lists, loading };
}

export function useCreateList() {
  const household = useHousehold();
  const user = useCurrentUser();

  return useCallback(async (title: string) => {
    if (!household || !user) throw new Error('Not authenticated');
    await addDoc(sharedListsCol(), {
      householdId: household.id,
      title,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
  }, [household, user]);
}

export function useDeleteList() {
  return useCallback(async (listId: string) => {
    await deleteDoc(sharedListDoc(listId));
  }, []);
}

export function useListItems(listId: string) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(listItemsCol(listId));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ListItem[];
      docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setItems(docs);
      setLoading(false);
    });
  }, [listId]);

  return { items, loading };
}

export function useAddListItem() {
  const user = useCurrentUser();

  return useCallback(async (listId: string, text: string, order: number) => {
    if (!user) throw new Error('Not authenticated');
    await addDoc(listItemsCol(listId), {
      text,
      isChecked: false,
      addedBy: user.uid,
      addedByName: user.displayName ?? 'Unknown',
      checkedBy: null,
      order,
      createdAt: serverTimestamp(),
    });
  }, [user]);
}

export function useToggleListItem() {
  const user = useCurrentUser();

  return useCallback(async (listId: string, itemId: string, isChecked: boolean) => {
    await updateDoc(listItemDoc(listId, itemId), {
      isChecked,
      checkedBy: isChecked ? (user?.uid ?? null) : null,
    });
  }, [user]);
}

export function useDeleteListItem() {
  return useCallback(async (listId: string, itemId: string) => {
    await deleteDoc(listItemDoc(listId, itemId));
  }, []);
}

export function useUpdateListStatus() {
  return useCallback(async (listId: string, status: 'active' | 'completed') => {
    await updateDoc(sharedListDoc(listId), { status });
  }, []);
}
