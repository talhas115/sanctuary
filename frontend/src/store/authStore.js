import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, // Should contain { id, email, displayName, defaultEncryption }
      isAuthenticated: false,

      login: (token, user) =>
        set({
          token,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            defaultEncryption: user.defaultEncryption
          },
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
        
      updateUser: (userUpdates) => 
        set((state) => ({
          user: { ...state.user, ...userUpdates }
        })),
    }),
    {
      name: 'pj-auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
