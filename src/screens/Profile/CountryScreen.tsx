import React, {
  useMemo,
  useState,
} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  countries,
} from 'countries-list';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
  route: any;
}

interface CountryItem {
  code: string;
  name: string;
}

const countryList: CountryItem[] =
  Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name),
    );

const CountryScreen = ({
  navigation,
  route,
}: Props) => {
  const [selected, setSelected] =
    useState<CountryItem | null>(null);

  const [search, setSearch] =
    useState('');

  const {
    profilePhotoUrl,
    displayName,
    username,
    nativeLanguage,
  } = route.params || {};

  const filteredCountries =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return countryList;
      }

      return countryList.filter(country =>
        country.name
          .toLowerCase()
          .includes(term),
      );
    }, [search]);

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    navigation.navigate(
      'ProfileComplete',
      {
        profilePhotoUrl,
        displayName,
        username,
        nativeLanguage,
        country: selected.name,
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>
        STEP 3 OF 4
      </Text>

      <Text style={styles.title}>
        Where are you from?
      </Text>

      <Text style={styles.subtitle}>
        Your country helps us personalize
        your DualWave experience.
      </Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search countries..."
        placeholderTextColor={
          COLORS.secondary
        }
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="words"
      />

      <Text style={styles.resultCount}>
        {filteredCountries.length}{' '}
        {filteredCountries.length === 1
          ? 'country'
          : 'countries'}
      </Text>

      <FlatList
        data={filteredCountries}
        keyExtractor={item => item.code}
        style={styles.list}
        contentContainerStyle={
          styles.listContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isSelected =
            selected?.code === item.code;

          return (
            <TouchableOpacity
              style={[
                styles.country,
                isSelected &&
                  styles.selectedCountry,
              ]}
              onPress={() =>
                setSelected(item)
              }
              activeOpacity={0.8}>

              <Text
                style={[
                  styles.countryText,
                  isSelected &&
                    styles.selectedText,
                ]}>
                {item.name}
              </Text>

              {isSelected && (
                <Text style={styles.check}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }>
            <Text
              style={
                styles.emptyTitle
              }>
              No countries found
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Try another country name.
            </Text>
          </View>
        }
      />

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
    paddingHorizontal: 24,
    paddingTop: 60,
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
    marginBottom: 20,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  resultCount: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 10,
    marginBottom: 8,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 10,
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
    backgroundColor:
      COLORS.accentLight,
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

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 6,
  },

  bottom: {
    paddingTop: 12,
    paddingBottom: 20,
  },
});

export default CountryScreen;