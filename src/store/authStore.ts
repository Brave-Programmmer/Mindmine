import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  email: string;
  displayName: string;
  isAuthenticated: boolean;
  setUser: (
    email: string,
    displayName: string,
    isAuthenticated: boolean
  ) => void;
  resetUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: "",
      displayName: "",
      isAuthenticated: false,
      setUser: (email, displayName, isAuthenticated) =>
        set({ email, displayName, isAuthenticated }),
      resetUser: () =>
        set({ email: "", displayName: "", isAuthenticated: false }),
    }),
    {
      name: "mindmine-auth-storage",
    }
  )
);
