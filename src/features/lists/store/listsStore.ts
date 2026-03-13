import { create } from 'zustand';
import { SharedList } from '../../../shared/types/models';

interface ListsState {
  lists: SharedList[];
  isLoading: boolean;
  setLists: (lists: SharedList[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useListsStore = create<ListsState>((set) => ({
  lists: [],
  isLoading: true,
  setLists: (lists) => set({ lists }),
  setLoading: (isLoading) => set({ isLoading }),
}));
