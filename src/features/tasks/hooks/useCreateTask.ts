import { useCallback } from 'react';
import { addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { tasksCol } from '../../../shared/lib/firestore';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useHousehold } from '../../household/hooks/useHousehold';
import { RecurrenceRule, TaskCategory } from '../../../shared/types/models';
import { APP_CONFIG } from '../../../shared/constants/config';

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  assigneeId?: string;
  assigneeName?: string;
  assigneePhotoURL?: string;
  points?: number;
  dueDate?: Date;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
}

export function useCreateTask() {
  const user = useCurrentUser();
  const household = useHousehold();

  return useCallback(
    async (input: CreateTaskInput) => {
      if (!user || !household) throw new Error('Not authenticated');

      const taskData = {
        householdId: household.id,
        title: input.title,
        description: input.description ?? '',
        category: input.category,
        assigneeId: input.assigneeId ?? null,
        assigneeName: input.assigneeName ?? null,
        assigneePhotoURL: input.assigneePhotoURL ?? null,
        createdBy: user.uid,
        points: input.points ?? APP_CONFIG.DEFAULT_TASK_POINTS,
        status: 'pending' as const,
        dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
        completedAt: null,
        completedBy: null,
        isRecurring: input.isRecurring,
        recurrenceRule: input.isRecurring ? (input.recurrenceRule ?? null) : null,
        templateId: null, // This is a template if recurring, or standalone if not
        instanceDate: input.isRecurring ? null : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(tasksCol(), taskData);
      return ref.id;
    },
    [user, household],
  );
}
