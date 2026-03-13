module.exports = {
  // Use a simple Node test environment and avoid pulling in the React Native
  // Jest preset, since these tests only exercise pure TypeScript logic and
  // AsyncStorage wrappers.
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

