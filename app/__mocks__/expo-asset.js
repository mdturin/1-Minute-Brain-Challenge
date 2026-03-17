// Mock expo-asset for jest — expo-font uses `instanceof Asset` checks,
// so Asset must be a real class, not just a plain object.
class Asset {
  constructor() {
    this.uri = 'mock-uri';
    this.localUri = 'mock-local-uri';
  }
  async downloadAsync() {
    return this;
  }
  static fromModule() {
    return new Asset();
  }
}

module.exports = { Asset };
