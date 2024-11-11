import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  signIn: async () => {
    // Here we would implement Google OAuth flow
    // For now, just mock the authentication
    set({ isAuthenticated: true });
  },
  signOut: async () => {
    set({ isAuthenticated: false });
  },
}));