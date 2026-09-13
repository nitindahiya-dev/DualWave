import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import ProfilePhotoScreen from '../screens/Profile/ProfilePhotoScreen';
import CreateProfileScreen from '../screens/Profile/CreateProfileScreen';
import LanguageScreen from '../screens/Profile/LanguageScreen';
import CountryScreen from '../screens/Profile/CountryScreen';
import ProfileCompleteScreen from '../screens/Profile/ProfileCompleteScreen';

import {
  ProfileSetupStackParamList,
} from '../types/navigation';

const Stack =
  createNativeStackNavigator<ProfileSetupStackParamList>();

const ProfileSetupNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>

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

    </Stack.Navigator>
  );
};

export default ProfileSetupNavigator;