import React, {
  useCallback,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';
import {
  getIncomingRequests,
} from '../../services/communication/contactService';
import {useAuthStore} from '../../store/authStore';
import {AppScreenProps} from '../../types/navigation';

type Props = AppScreenProps<'Home'>;

const HomeScreen = ({navigation}: Props) => {
  const logout = useAuthStore(
    state => state.logout,
  );

  const [requestCount, setRequestCount] =
    useState(0);

  const loadRequestCount = async () => {
    try {
      const requests =
        await getIncomingRequests();

      setRequestCount(requests.length);
    } catch (error) {
      console.error(
        'Contact request count error:',
        error,
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequestCount();
    }, []),
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>
          Welcome to
        </Text>

        <Text style={styles.logo}>
          DualWave
        </Text>

        <Text style={styles.subtitle}>
          Your multilingual communication space.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Translation
        </Text>

        <Text style={styles.cardText}>
          Your communication tools will appear here.
        </Text>
      </View>

      <View style={styles.navigationContainer}>
        <Button
          title="Contact Requests"
          onPress={() =>
            navigation.navigate('Contacts')
          }
        />

        {requestCount > 0 && (
          <Text style={styles.requestBadge}>
            {requestCount}{' '}
            {requestCount === 1
              ? 'pending request'
              : 'pending requests'}
          </Text>
        )}

        <View style={styles.buttonSpacing} />

        <Button
          title="Find People"
          onPress={() =>
            navigation.navigate('People')
          }
        />

        <View style={styles.buttonSpacing} />

        <Button
          title="My Contacts"
          onPress={() =>
            navigation.navigate('Contacts')
          }
        />

        <View style={styles.buttonSpacing} />

        <Button
          title="My Profile"
          onPress={() =>
            navigation.navigate('Profile')
          }
        />
      </View>

      <View style={styles.logoutContainer}>
        <Button
          title="Log out"
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 70,
  },

  greeting: {
    fontSize: 16,
    color: COLORS.secondary,
  },

  logo: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 8,
  },

  card: {
    marginTop: 40,
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondary,
    marginTop: 8,
  },

  navigationContainer: {
    marginTop: 30,
  },

  requestBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 8,
    marginLeft: 4,
  },

  buttonSpacing: {
    height: 10,
  },

  logoutContainer: {
    marginTop: 30,
    paddingBottom: 20,
  },
});

export default HomeScreen;