import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_TEST_KEY = '@dualwave_test';

export const testStorage = async () => {
  try {
    await AsyncStorage.setItem(
      STORAGE_TEST_KEY,
      'DualWave works',
    );

    const value = await AsyncStorage.getItem(
      STORAGE_TEST_KEY,
    );

    console.log('AsyncStorage test:', value);

    await AsyncStorage.removeItem(
      STORAGE_TEST_KEY,
    );

    return true;
  } catch (error) {
    console.error(
      'AsyncStorage test failed:',
      error,
    );

    return false;
  }
};