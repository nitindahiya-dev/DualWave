import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

interface Props {
  navigation: any;
  route: any;
}

const OTPScreen = ({ navigation, route }: Props) => {
  const email = route.params?.email;

  const verifyEmailOtp = useAuthStore(
    state => state.verifyEmailOtp,
  );
  const resendSignupEmail = useAuthStore(
    state => state.resendSignupEmail,
  );
  const isLoading = useAuthStore(
    state => state.isLoading,
  );
  const authError = useAuthStore(
    state => state.authError,
  );
  const clearAuthError = useAuthStore(
    state => state.clearAuthError,
  );

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const inputs = useRef<
    Array<React.ElementRef<typeof TextInput> | null>
  >([]);

  useEffect(() => {
    clearAuthError();
    return () => clearAuthError();
  }, [clearAuthError]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '');

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);

    setOtp(newOtp);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

const handleVerify = async () => {
  const code = otp.join('');

  if (code.length !== 6) {
    return;
  }

  await verifyEmailOtp(email, code);
};

  return (
    <View style={styles.container}>
      <Text
        style={styles.back}
        onPress={() => navigation.goBack()}>
        ‹ Back
      </Text>

      <View style={styles.header}>
        <Text style={styles.title}>Verify your account</Text>

        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to your email.
        </Text>
      </View>

      {authError && (
        <Text style={styles.authError}>
          {authError}
        </Text>
      )}

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={value => handleChange(value, index)}
            onKeyPress={event => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.otpInput}
            textAlign="center"
          />
        ))}
      </View>

      <Text style={styles.resend}>
        Didn't receive the code?{' '}
        <Text
          style={styles.resendLink}
          onPress={() => resendSignupEmail(email)}>
          Resend
        </Text>
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Verify"
          onPress={handleVerify}
          loading={isLoading}
          disabled={isLoading}
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
  },

  back: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 4,
    marginBottom: 48,
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
  },

  authError: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  otpInput: {
    width: 48,
    height: 58,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },

  resend: {
    textAlign: 'center',
    marginTop: 24,
    color: COLORS.secondary,
    fontSize: 14,
  },

  resendLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  buttonContainer: {
    marginTop: 40,
  },
});

export default OTPScreen;