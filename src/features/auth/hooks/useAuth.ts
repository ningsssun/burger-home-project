import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { auth } from '../../../shared/lib/firebase';
import { userDoc } from '../../../shared/lib/firestore';
import { useAuthStore } from '../store/authStore';

/**
 * Subscribes to Firebase Auth state and the corresponding Firestore user document.
 * Should be mounted once at the root layout.
 */
export function useAuthSubscription() {
  const { setUser, setUserDoc, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Clean up any previous doc listener
      unsubDoc?.();

      if (!firebaseUser) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      // Subscribe to user's Firestore doc
      unsubDoc = onSnapshot(
        userDoc(firebaseUser.uid),
        (snap) => {
          if (snap.exists()) {
            setUserDoc(snap.data());
          } else {
            setUserDoc(null);
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth();
      unsubDoc?.();
    };
  }, [setUser, setUserDoc, setLoading]);
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useCurrentUserDoc() {
  return useAuthStore((s) => s.userDoc);
}

export function useIsAuthenticated() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  return { isAuthenticated: !!user, isLoading };
}
