import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {COLORS} from '../../constants/colors';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        DualWave
      </Text>

      <Text style={styles.tagline}>
        Understand. Connect. Communicate.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },

  tagline: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 12,
  },
});

export default SplashScreen;