import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
}

const WelcomeScreen = ({navigation}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>DualWave</Text>

        <Text style={styles.title}>
          Speak naturally.{'\n'}
          Understand instantly.
        </Text>

        <Text style={styles.description}>
          Communicate across languages using AI-powered
          translation for text, voice and conversations.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Create account"
          onPress={() => navigation.navigate('Register')}
        />

        <Text
          style={styles.login}
          onPress={() => navigation.navigate('Login')}>
          Already have an account? Log in
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
    justifyContent: 'space-between',
  },

  content: {
    marginTop: 100,
  },

  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 48,
  },

  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 24,
    maxWidth: 340,
  },

  actions: {
    marginBottom: 20,
  },

  login: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: COLORS.secondary,
  },
});

export default WelcomeScreen;