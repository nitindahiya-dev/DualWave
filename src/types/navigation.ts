import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/*
 * Authentication screens
 */
export type AuthStackParamList = {
  Welcome: undefined;

  Login: undefined;

  Register: undefined;

  OTP: {
    email?: string;
  };

  ForgotPassword: undefined;

  ResetPassword: undefined;
};

/*
 * Profile setup screens
 */
export type ProfileSetupStackParamList = {
  ProfilePhoto: {
    profilePhotoUrl?: string | null;
  };

  CreateProfile: {
    profilePhotoUrl?: string | null;
  };

  Language: {
    profilePhotoUrl?: string | null;
    displayName: string;
    username: string;
  };

  Country: {
    profilePhotoUrl?: string | null;
    displayName: string;
    username: string;
    nativeLanguage: string;
  };

  ProfileComplete: {
    profilePhotoUrl?: string | null;
    displayName: string;
    username: string;
    nativeLanguage: string;
    country: string;
  };
};

/*
 * Main application screens
 */
export type AppStackParamList = {
  Home: undefined;
};

/*
 * Root navigation
 */
export type RootStackParamList = {
  Auth: undefined;

  ProfileSetup: undefined;

  App: undefined;
};

/*
 * Authentication screen props
 */
export type AuthScreenProps<
  T extends keyof AuthStackParamList,
> = NativeStackScreenProps<AuthStackParamList, T>;

/*
 * Profile setup screen props
 */
export type ProfileSetupScreenProps<
  T extends keyof ProfileSetupStackParamList,
> = NativeStackScreenProps<
  ProfileSetupStackParamList,
  T
>;

/*
 * Main application screen props
 */
export type AppScreenProps<
  T extends keyof AppStackParamList,
> = NativeStackScreenProps<AppStackParamList, T>;

/*
 * Root screen props
 */
export type RootScreenProps<
  T extends keyof RootStackParamList,
> = NativeStackScreenProps<RootStackParamList, T>;