import { useCallback } from 'react';
import { deleteDoc } from 'firebase/firestore';
import { taskDoc } from '../../../shared/lib/firestore';

export function useDeleteTask() {
  return useCallback(async (taskId: string) => {
    await deleteDoc(taskDoc(taskId));
  }, []);
}
