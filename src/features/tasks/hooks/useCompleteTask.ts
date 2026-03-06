import { useCallback } from 'react';
import {
  writeBatch,
  serverTimestamp,
  addDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { taskDoc, memberDoc, pointsLedgerCol } from '../../../shared/lib/firestore';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useHousehold } from '../../household/hooks/useHousehold';
import { Task } from '../../../shared/types/models';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export function useCompleteTask() {
  const user = useCurrentUser();
  const household = useHousehold();

  return useCallback(
    async (task: Task) => {
      if (!user || !household) throw new Error('Not authenticated');

      const batch = writeBatch(db);

      // Mark task as completed
      batch.update(taskDoc(task.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: user.uid,
        updatedAt: serverTimestamp(),
      });

      // Update member points
      batch.update(memberDoc(household.id, user.uid), {
        weeklyPoints: increment(task.points),
        allTimePoints: increment(task.points),
      });

      await batch.commit();

      // Write points ledger entry (outside batch for auto-id)
      const weekYear = format(new Date(), "yyyy-'W'II");
      await addDoc(pointsLedgerCol(), {
        householdId: household.id,
        userId: user.uid,
        taskId: task.id,
        taskTitle: task.title,
        points: task.points,
        weekYear,
        earnedAt: serverTimestamp(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return task.points;
    },
    [user, household],
  );
}
