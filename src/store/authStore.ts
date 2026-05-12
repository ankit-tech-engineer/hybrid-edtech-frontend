import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, role: user.role });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, role: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
          role: userData.role || state.role,
        }));
      },
    }),
    {
      name: 'auth-storage',
      // Store only token in localStorage if you want, or everything
    }
  )
);
