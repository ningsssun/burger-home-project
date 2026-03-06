import { useState, useEffect } from 'react';
import {
  DocumentReference,
  DocumentData,
  onSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';

interface FirestoreDocState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null,
): FirestoreDocState<T> {
  const [state, setState] = useState<FirestoreDocState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<T>) => {
        setState({
          data: snapshot.exists() ? (snapshot.data() as T) : null,
          loading: false,
          error: null,
        });
      },
      (error: Error) => {
        setState({ data: null, loading: false, error });
      },
    );

    return unsubscribe;
  }, [ref?.path]);

  return state;
}
