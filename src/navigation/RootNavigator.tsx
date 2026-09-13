import React, { useEffect, useState } from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [isSplashFinished, setIsSplashFinished] =
    useState(false);

  const isAuthenticated = useAuthStore(
    state => state.isAuthenticated,
  );

  const isHydrated = useAuthStore(
    state => state.isHydrated,
  );

  const initializeAuth = useAuthStore(
    state => state.initializeAuth,
  );

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashFinished(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Keep showing Splash until:
  // 1. Splash timer has finished
  // 2. Authentication state has been restored
  if (!isSplashFinished || !isHydrated) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>

      {isAuthenticated ? (
        <Stack.Screen
          name="App"
          component={AppNavigator}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
        />
      )}

    </Stack.Navigator>
  );
};

export default RootNavigator;