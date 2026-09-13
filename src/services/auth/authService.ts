import {supabase} from '../supabase/supabaseClient';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

/**
 * Create a new user account with Supabase Auth.
 */
export const signUp = async ({
  name,
  email,
  password,
}: SignUpParams) => {
  const {data, error} = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name: name.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (
  email: string,
  password: string,
) => {
  const {data, error} =
    await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  const {error} = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

/**
 * Get the currently authenticated Supabase session.
 */
export const getCurrentSession = async () => {
  const {data, error} =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
};

/**
 * Get the currently authenticated Supabase user.
 */
export const getCurrentUser = async () => {
  const {data, error} =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};

export const verifyEmailOtp = async (
  email: string,
  token: string,
) => {
  const {data, error} =
    await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    });

  if (error) {
    throw error;
  }

  return data;
};

export const resendSignupEmail = async (
  email: string,
) => {
  const {error} =
    await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

  if (error) {
    throw error;
  }
};