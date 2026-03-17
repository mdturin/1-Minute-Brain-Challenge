module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // expo-asset is not installed but expo-font (used by @expo/vector-icons) requires it
    'expo-asset': '<rootDir>/__mocks__/expo-asset.js',
  },
};

