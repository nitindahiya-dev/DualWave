import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

import ProfilePhotoScreen from '../screens/Profile/ProfilePhotoScreen';
import CreateProfileScreen from '../screens/Profile/CreateProfileScreen';
import LanguageScreen from '../screens/Profile/LanguageScreen';
import CountryScreen from '../screens/Profile/CountryScreen';
import ProfileCompleteScreen from '../screens/Profile/ProfileCompleteScreen';

import HomeScreen from '../screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="OTP"
        component={OTPScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
      />

      <Stack.Screen
        name="ProfilePhoto"
        component={ProfilePhotoScreen}
      />

      <Stack.Screen
        name="CreateProfile"
        component={CreateProfileScreen}
      />

      <Stack.Screen
        name="Language"
        component={LanguageScreen}
      />

      <Stack.Screen
        name="Country"
        component={CountryScreen}
      />

      <Stack.Screen
        name="ProfileComplete"
        component={ProfileCompleteScreen}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

    </Stack.Navigator>
  );
};

export default AuthNavigator;