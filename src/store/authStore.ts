import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  authError: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      isLoading: false,
      isHydrated: false,
      authError: null,

      login: async (email, password) => {
        set({
          isLoading: true,
          authError: null,
        });

        // Temporary delay to simulate a real API request.
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 1200);
        });

        // Temporary demo credentials.
        if (
          email.trim().toLowerCase() !== 'test@test.com' ||
          password !== '12345678'
        ) {
          set({
            isLoading: false,
            authError: 'Invalid email or password.',
          });

          return;
        }

        set({
          user: {
            id: 'demo-user-001',
            name: 'DualWave User',
            email: email.trim().toLowerCase(),
          },
          isAuthenticated: true,
          isLoading: false,
          authError: null,
        });
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          authError: null,
          isLoading: false,
        }),

      clearAuthError: () =>
        set({
          authError: null,
        }),
    }),

    {
      name: 'dualwave-auth',

      storage: createJSONStorage(() => AsyncStorage),

      // Only persist actual authentication data.
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => {
        return () => {
          useAuthStore.setState({
            isHydrated: true,
          });
        };
      },
    },
  ),
);