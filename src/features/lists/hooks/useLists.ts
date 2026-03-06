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
import { useHousehold } from '../../household/hooks/useHousehold';
import { useCurrentUser } from '../../auth/hooks/useAuth';

export function useSharedLists() {
  const household = useHousehold();
  const [lists, setLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household?.id) { setLists([]); setLoading(false); return; }

    const q = query(
      sharedListsCol(),
      where('householdId', '==', household.id),
    );

    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SharedList[];
      docs.sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.());
      setLists(docs);
      setLoading(false);
    });
  }, [household?.id]);

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
