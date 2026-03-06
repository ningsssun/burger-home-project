import { useCallback } from 'react';
import {
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { householdsCol, memberDoc, userDoc } from '../../../shared/lib/firestore';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { APP_CONFIG } from '../../../shared/constants/config';

function generateInviteCode(length = APP_CONFIG.INVITE_CODE_LENGTH): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit I, O, 0, 1
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function useCreateHousehold() {
  const user = useCurrentUser();

  return useCallback(
    async (name: string) => {
      if (!user) throw new Error('Not authenticated');

      const inviteCode = generateInviteCode();

      // Create household doc
      const hRef = await addDoc(householdsCol(), {
        name,
        inviteCode,
        createdBy: user.uid,
        memberIds: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const batch = writeBatch(db);

      // Add member sub-doc
      batch.set(memberDoc(hRef.id, user.uid), {
        userId: user.uid,
        displayName: user.displayName ?? 'Unknown',
        photoURL: user.photoURL ?? null,
        role: 'admin',
        weeklyPoints: 0,
        allTimePoints: 0,
        joinedAt: serverTimestamp(),
      });

      // Upsert user doc with householdId (handles accounts with no Firestore doc yet)
      batch.set(userDoc(user.uid), {
        uid: user.uid,
        displayName: user.displayName ?? 'Unknown',
        email: user.email ?? '',
        photoURL: user.photoURL ?? null,
        householdId: hRef.id,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await batch.commit();

      return hRef.id;
    },
    [user],
  );
}
