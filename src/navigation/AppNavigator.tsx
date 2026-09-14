import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home/HomeScreen';

import { AppStackParamList } from '../types/navigation';
import PeopleScreen from '../screens/People/PeopleScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ContactsScreen from '../screens/Contacts/ContactsScreen';
import UserProfileScreen from '../screens/People/UserProfileScreen';
import ConversationScreen from '../screens/Conversation/ConversationScreen';

const Stack =
  createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'DualWave',
        headerBackTitle: 'Back',
      }}>

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="People"
        component={PeopleScreen}
        options={{
          title: 'People',
        }}
      />

      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: 'Profile',
        }}
      />

      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          title: 'Conversation',
        }}
      />

      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Contacts',
        }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
        }}
      />

    </Stack.Navigator>
  );
};

export default AppNavigator;