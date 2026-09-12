import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
}

const ForgotPasswordScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    navigation.navigate('ResetPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={styles.back}
          onPress={() => navigation.goBack()}>
          ‹ Back
        </Text>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot password?</Text>

          <Text style={styles.subtitle}>
            Enter the email address associated with your account and
            we'll help you reset your password.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    padding: 24,
  },

  back: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 48,
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
  },
});

export default ForgotPasswordScreen;