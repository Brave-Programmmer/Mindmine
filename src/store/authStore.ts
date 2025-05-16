import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface defining the shape of the authentication state
 */
interface AuthState {
  /** User's email address */
  email: string;
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Function to set user authentication state */
  setUser: (email: string, isAuthenticated: boolean) => void;
  /** Function to reset user authentication state */
  resetUser: () => void;
}

/**
 * Authentication store using Zustand with persistence
 * Stores user authentication state in localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: '',
      isAuthenticated: false,
      setUser: (email, isAuthenticated) => set({ email, isAuthenticated }),
      resetUser: () => set({ email: '', isAuthenticated: false }),
    }),
    {
      name: 'livre-auth-storage',
    }
  )
); 