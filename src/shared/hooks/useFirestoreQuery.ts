import { useState, useEffect } from 'react';
import {
  Query,
  DocumentData,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';

interface FirestoreQueryState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreQuery<T extends DocumentData & { id: string }>(
  query: Query<Omit<T, 'id'>> | null,
): FirestoreQueryState<T> {
  const [state, setState] = useState<FirestoreQueryState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<Omit<T, 'id'>>) => {
        const docs = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as T[];
        setState({ data: docs, loading: false, error: null });
      },
      (error: Error) => {
        setState({ data: [], loading: false, error });
      },
    );

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
