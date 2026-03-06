import { create } from 'zustand';
import { HouseholdDoc, MemberDoc } from '../../../shared/types/models';

interface HouseholdState {
  household: (HouseholdDoc & { id: string }) | null;
  members: (MemberDoc & { id: string })[];
  isLoading: boolean;
  setHousehold: (h: (HouseholdDoc & { id: string }) | null) => void;
  setMembers: (members: (MemberDoc & { id: string })[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: null,
  members: [],
  isLoading: false,
  setHousehold: (household) => set({ household }),
  setMembers: (members) => set({ members }),
  setLoading: (isLoading) => set({ isLoading }),
}));
