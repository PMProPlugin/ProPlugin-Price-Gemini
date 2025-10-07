import { create } from 'zustand';
import type { User } from '@services/mockBc';

type AuthState = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

const key = 'auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as User) : null;
  })(),
  login: (u) => {
    localStorage.setItem(key, JSON.stringify(u));
    set({ user: u });
  },
  logout: () => {
    localStorage.removeItem(key);
    set({ user: null });
  }
}));
