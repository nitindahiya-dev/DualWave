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

  ProfilePhoto: undefined;

  CreateProfile: undefined;

  Language: undefined;

  Country: undefined;

  ProfileComplete: undefined;
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

  App: undefined;
};

/*
 * Authentication screen props
 */
export type AuthScreenProps<
  T extends keyof AuthStackParamList,
> = NativeStackScreenProps<AuthStackParamList, T>;

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