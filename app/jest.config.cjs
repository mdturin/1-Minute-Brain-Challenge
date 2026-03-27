module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // expo-asset is not installed but expo-font (used by @expo/vector-icons) requires it
    'expo-asset': '<rootDir>/__mocks__/expo-asset.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?(/.*)?|@expo-google-fonts(/.*)?|react-navigation|@react-navigation/.*|@unimodules(/.*)?|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)',
  ],
};

