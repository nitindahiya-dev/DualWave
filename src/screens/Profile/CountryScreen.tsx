import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
  route: any;
}

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'South Korea',
  'Singapore',
];

const CountryScreen = ({
  navigation,
  route,
}: Props) => {
  const [selected, setSelected] = useState('');

  const {
    profilePhotoUrl,
    displayName,
    username,
    nativeLanguage,
  } = route.params || {};

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    navigation.navigate('ProfileComplete', {
      profilePhotoUrl,
      displayName,
      username,
      nativeLanguage,
      country: selected,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}>

        <Text style={styles.step}>
          STEP 3 OF 4
        </Text>

        <Text style={styles.title}>
          Where are you from?
        </Text>

        <Text style={styles.subtitle}>
          Your country helps us personalize your
          DualWave experience.
        </Text>

        {countries.map(country => {
          const isSelected =
            selected === country;

          return (
            <TouchableOpacity
              key={country}
              style={[
                styles.country,
                isSelected &&
                  styles.selectedCountry,
              ]}
              onPress={() =>
                setSelected(country)
              }
              activeOpacity={0.8}>

              <Text
                style={[
                  styles.countryText,
                  isSelected &&
                    styles.selectedText,
                ]}>
                {country}
              </Text>

              {isSelected && (
                <Text style={styles.check}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },

  step: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.accent,
    marginBottom: 16,
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
    marginBottom: 28,
  },

  country: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedCountry: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },

  countryText: {
    fontSize: 15,
    color: COLORS.primary,
  },

  selectedText: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  check: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },

  bottom: {
    padding: 24,
    paddingTop: 12,
  },
});

export default CountryScreen;