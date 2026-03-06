import { useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../../shared/lib/firebase';
import { userDoc } from '../../../shared/lib/firestore';

export function useSignIn() {
  return useCallback(async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    // Create user doc if it doesn't exist (e.g. accounts created before this was implemented)
    const snap = await getDoc(userDoc(user.uid));
    if (!snap.exists()) {
      await setDoc(userDoc(user.uid), {
        uid: user.uid,
        displayName: user.displayName ?? email.split('@')[0],
        email: user.email ?? email,
        photoURL: user.photoURL ?? null,
        householdId: null,
        fcmTokens: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }, []);
}

export function useSignUp() {
  return useCallback(async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(userDoc(user.uid), {
      uid: user.uid,
      displayName,
      email,
      photoURL: null,
      householdId: null,
      fcmTokens: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, []);
}

export function useSignOut() {
  return useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);
}
