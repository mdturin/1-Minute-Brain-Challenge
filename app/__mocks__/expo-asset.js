module.exports = {
  Asset: {
    fromModule: jest.fn(() => ({
      uri: 'mock-uri',
      localUri: 'mock-local-uri',
      downloadAsync: jest.fn(),
    })),
  },
};
