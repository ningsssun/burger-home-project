import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserDoc } from '../../../shared/types/models';

interface AuthState {
  user: User | null;
  userDoc: UserDoc | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserDoc: (doc: UserDoc | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userDoc: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setUserDoc: (userDoc) => set({ userDoc }),
  setLoading: (isLoading) => set({ isLoading }),
}));
