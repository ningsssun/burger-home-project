import { useCallback } from 'react';
import { updateDoc, serverTimestamp } from 'firebase/firestore';
import { taskDoc } from '../../../shared/lib/firestore';

export function useAssignTask() {
  return useCallback(async (taskId: string, assigneeId: string, assigneeName: string) => {
    await updateDoc(taskDoc(taskId), {
      assigneeId,
      assigneeName,
      updatedAt: serverTimestamp(),
    });
  }, []);
}
