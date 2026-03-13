import { useEffect } from 'react';
import { query, where, onSnapshot } from 'firebase/firestore';
import { tasksCol } from '../../../shared/lib/firestore';
import { useTasksStore } from '../store/tasksStore';
import { useHousehold } from '../../household/hooks/useHousehold';
import { useCurrentUserDoc } from '../../auth/hooks/useAuth';
import { Task } from '../../../shared/types/models';

/**
 * Subscribes to all non-template tasks for the current household.
 * Should be mounted once inside the app layout.
 */
export function useTasksSubscription() {
  const household = useHousehold();
  const userDoc = useCurrentUserDoc();
  const { setTasks, setLoading } = useTasksStore();

  useEffect(() => {
    // Wait until the Firestore user doc confirms the householdId matches,
    // preventing a race where the local cache fires before the server commits.
    if (!household?.id || household.id !== userDoc?.householdId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      tasksCol(),
      where('householdId', '==', household.id),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() })) as Task[];
        // Filter out recurring templates and sort by dueDate client-side
        const tasks = docs
          .filter((t) => t.templateId === null || t.templateId === undefined)
          .sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return -1;
            if (!b.dueDate) return 1;
            return a.dueDate.toMillis() - b.dueDate.toMillis();
          });
        setTasks(tasks);
        setLoading(false);
      },
      (err) => {
        console.error('[TasksSubscription] query failed:', err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [household?.id, userDoc?.householdId, setTasks, setLoading]);
}

export function useTasks() {
  return useTasksStore((s) => s.tasks);
}

export function useTasksLoading() {
  return useTasksStore((s) => s.isLoading);
}

export function useTodayTasks(userId?: string) {
  const tasks = useTasksStore((s) => s.tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tasks.filter((t) => {
    if (t.status !== 'pending') return false;
    if (userId && t.assigneeId !== userId) return false;
    if (!t.dueDate) return true; // no due date = always show as pending
    const due = t.dueDate.toDate();
    return due >= today && due < tomorrow;
  });
}

export function useUpcomingTasks(userId?: string, days = 7) {
  const tasks = useTasksStore((s) => s.tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(future.getDate() + days);

  return tasks.filter((t) => {
    if (t.status !== 'pending') return false;
    if (!t.dueDate) return false;
    const due = t.dueDate.toDate();
    if (userId && t.assigneeId !== userId) return false;
    return due > today && due <= future;
  });
}
