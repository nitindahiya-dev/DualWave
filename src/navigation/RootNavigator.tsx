import React, {useEffect, useState} from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

import {RootStackParamList} from '../types/navigation';
import {useAuthStore} from '../store/authStore';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [isSplashFinished, setIsSplashFinished] =
    useState(false);

  const isAuthenticated = useAuthStore(
    state => state.isAuthenticated,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashFinished(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isSplashFinished) {
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