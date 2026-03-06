import { create } from 'zustand';
import { Task } from '../../../shared/types/models';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: true,
  setTasks: (tasks) => set({ tasks }),
  setLoading: (isLoading) => set({ isLoading }),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
}));
