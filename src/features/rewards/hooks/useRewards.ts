import { useState, useEffect, useCallback } from 'react';
import {
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { rewardsCol, rewardDoc, memberDoc, redemptionsCol } from '../../../shared/lib/firestore';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useHousehold } from '../../household/hooks/useHousehold';
import { Reward, Redemption } from '../../../shared/types/models';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const household = useHousehold();

  useEffect(() => {
    if (!household?.id) {
      setRewards([]);
      setLoading(false);
      return;
    }

    const q = query(rewardsCol(), where('householdId', '==', household.id));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Reward[];
        docs.sort((a, b) => a.pointsCost - b.pointsCost);
        setRewards(docs);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsub;
  }, [household?.id]);

  return { rewards, loading };
}

export function useCreateReward() {
  const user = useCurrentUser();
  const household = useHousehold();

  return useCallback(
    async (title: string, emoji: string, pointsCost: number) => {
      if (!user || !household) throw new Error('Not authenticated');
      await addDoc(rewardsCol(), {
        householdId: household.id,
        title,
        emoji,
        pointsCost,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    },
    [user, household],
  );
}

export function useDeleteReward() {
  return useCallback(async (rewardId: string) => {
    await deleteDoc(rewardDoc(rewardId));
  }, []);
}

export function useRedeemReward() {
  const user = useCurrentUser();
  const household = useHousehold();

  return useCallback(
    async (pointsCost: number, rewardId: string, rewardTitle: string, rewardEmoji: string) => {
      if (!user || !household) throw new Error('Not authenticated');
      await Promise.all([
        updateDoc(memberDoc(household.id, user.uid), {
          weeklyPoints: increment(-pointsCost),
        }),
        addDoc(redemptionsCol(), {
          userId: user.uid,
          householdId: household.id,
          rewardId,
          rewardTitle,
          rewardEmoji,
          pointsCost,
          redeemedAt: serverTimestamp(),
        }),
      ]);
    },
    [user, household],
  );
}

export function useRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();

  useEffect(() => {
    if (!user) { setRedemptions([]); setLoading(false); return; }

    const q = query(
      redemptionsCol(),
      where('userId', '==', user.uid),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Redemption[];
        docs.sort((a, b) => b.redeemedAt?.toMillis() - a.redeemedAt?.toMillis());
        setRedemptions(docs);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsub;
  }, [user]);

  return { redemptions, loading };
}
