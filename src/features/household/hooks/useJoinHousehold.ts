import { useCallback } from 'react';
import {
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { householdsCol, memberDoc, userDoc } from '../../../shared/lib/firestore';
import { useCurrentUser } from '../../auth/hooks/useAuth';

export function useJoinHousehold() {
  const user = useCurrentUser();

  return useCallback(
    async (inviteCode: string): Promise<string> => {
      if (!user) throw new Error('Not authenticated');

      // Find household by invite code
      const q = query(householdsCol(), where('inviteCode', '==', inviteCode.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      const householdSnap = snap.docs[0];
      const householdId = householdSnap.id;
      const householdData = householdSnap.data();

      // Already a member?
      if (householdData.memberIds.includes(user.uid)) {
        return householdId;
      }

      const batch = writeBatch(db);

      // Add to memberIds array on household
      batch.update(householdSnap.ref, {
        memberIds: arrayUnion(user.uid),
        updatedAt: serverTimestamp(),
      });

      // Create member sub-doc
      batch.set(memberDoc(householdId, user.uid), {
        userId: user.uid,
        displayName: user.displayName ?? 'Unknown',
        photoURL: user.photoURL ?? null,
        role: 'member',
        weeklyPoints: 0,
        allTimePoints: 0,
        joinedAt: serverTimestamp(),
      });

      // Update user doc
      batch.update(userDoc(user.uid), {
        householdId,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      return householdId;
    },
    [user],
  );
}
