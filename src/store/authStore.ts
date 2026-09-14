import {create} from 'zustand';

import {
  getCurrentSession,
  signIn,
  signOut,
  signUp,
  verifyEmailOtp,
  resendSignupEmail,
} from '../services/auth/authService';

import {getProfile} from '../services/profile/profileService';

import {supabase} from '../services/supabase/supabaseClient';

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
  hasProfile: boolean;

  initializeAuth: () => Promise<void>;
  setHasProfile: (value: boolean) => void;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{
    needsEmailConfirmation: boolean;
  }>;

  verifyEmailOtp: (
    email: string,
    token: string,
  ) => Promise<void>;

  resendSignupEmail: (
    email: string,
  ) => Promise<void>;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  clearAuthError: () => void;
}

const mapSupabaseUser = (
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
    };
  } | null,
): User | null => {
  if (!supabaseUser) {
    return null;
  }

  return {
    id: supabaseUser.id,
    name:
      supabaseUser.user_metadata?.name ||
      'DualWave User',
    email: supabaseUser.email || '',
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  authError: null,
  hasProfile: false,

  initializeAuth: async () => {
    try {
      const session = await getCurrentSession();

      if (!session) {
        set({
          user: null,
          isAuthenticated: false,
          hasProfile: false,
          isHydrated: true,
          authError: null,
        });

        return;
      }

      const user = mapSupabaseUser(
        session.user,
      );

      const profile = await getProfile();

      set({
        user,
        isAuthenticated: true,
        hasProfile: !!profile,
        isHydrated: true,
        authError: null,
      });
    } catch (error) {
      console.error(
        'Auth initialization error:',
        error,
      );

      set({
        user: null,
        isAuthenticated: false,
        hasProfile: false,
        isHydrated: true,
        authError:
          'Unable to restore your session.',
      });
    }
  },

  register: async (name, email, password) => {
    set({
      isLoading: true,
      authError: null,
    });

    try {
      const data = await signUp({
        name,
        email,
        password,
      });

      const needsEmailConfirmation =
        !!data.user && !data.session;

      /*
       * A newly registered account cannot be assumed
       * to have a profile.
       */
      if (data.session) {
        const profile = await getProfile();

        set({
          user: mapSupabaseUser(data.user),
          isAuthenticated: true,
          hasProfile: !!profile,
          isLoading: false,
          authError: null,
        });
      } else {
        set({
          isLoading: false,
          authError: null,
          hasProfile: false,
        });
      }

      return {
        needsEmailConfirmation,
      };
    } catch (error: any) {
      console.error(
        'Registration error:',
        error,
      );

      set({
        isLoading: false,
        authError:
          error?.message ||
          'Unable to create your account. Please try again.',
      });

      return {
        needsEmailConfirmation: false,
      };
    }
  },

  verifyEmailOtp: async (email, token) => {
    set({
      isLoading: true,
      authError: null,
    });

    try {
      const data = await verifyEmailOtp(
        email,
        token,
      );

      const user = mapSupabaseUser(
        data.user,
      );

      /*
       * IMPORTANT:
       * After email verification, explicitly check
       * whether this account already has a profile.
       */
      const profile = await getProfile();

      set({
        user,
        isAuthenticated: !!data.session,
        hasProfile: !!profile,
        isLoading: false,
        authError: null,
      });
    } catch (error: any) {
      console.error(
        'Email verification error:',
        error,
      );

      set({
        isLoading: false,
        authError:
          error?.message ||
          'Invalid verification code.',
      });
    }
  },

  resendSignupEmail: async email => {
    set({
      isLoading: true,
      authError: null,
    });

    try {
      await resendSignupEmail(email);

      set({
        isLoading: false,
        authError: null,
      });
    } catch (error: any) {
      console.error(
        'Resend verification error:',
        error,
      );

      set({
        isLoading: false,
        authError:
          error?.message ||
          'Unable to resend the verification code.',
      });
    }
  },

  login: async (email, password) => {
    set({
      isLoading: true,
      authError: null,
    });

    try {
      const data = await signIn(
        email,
        password,
      );

      const user = mapSupabaseUser(
        data.user,
      );

      /*
       * Never assume that a successfully authenticated
       * user has completed their profile.
       */
      const profile = await getProfile();

      set({
        user,
        isAuthenticated: true,
        hasProfile: !!profile,
        isLoading: false,
        authError: null,
      });
    } catch (error: any) {
      console.error(
        'Login error:',
        error,
      );

      set({
        isLoading: false,
        authError:
          error?.message ||
          'Unable to sign in. Please try again.',
      });
    }
  },

  logout: async () => {
    set({
      isLoading: true,
      authError: null,
    });

    try {
      await signOut();

      set({
        user: null,
        isAuthenticated: false,
        hasProfile: false,
        isLoading: false,
        authError: null,
      });
    } catch (error: any) {
      console.error(
        'Logout error:',
        error,
      );

      set({
        isLoading: false,
        authError:
          error?.message ||
          'Unable to log out. Please try again.',
      });
    }
  },

  setHasProfile: value => {
    set({
      hasProfile: value,
    });
  },

  clearAuthError: () => {
    set({
      authError: null,
    });
  },
}));

/**
 * Listen for Supabase authentication changes.
 */
supabase.auth.onAuthStateChange(
  (_event, session) => {
    /*
     * Login, OTP verification, and initial session
     * restoration explicitly determine the complete
     * auth state.
     *
     * We should NOT temporarily set hasProfile=false
     * here because that causes RootNavigator to show
     * ProfileSetup for an already completed account.
     */

    if (!session) {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        hasProfile: false,
        isHydrated: true,
      });
    }
  },
);