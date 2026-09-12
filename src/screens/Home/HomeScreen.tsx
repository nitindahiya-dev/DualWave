import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {COLORS} from '../../constants/colors';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Welcome to</Text>

        <Text style={styles.logo}>DualWave</Text>

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
});

export default HomeScreen;