// Jest global setup for 1 Minute Brain Challenge
//
// Known issue: React Native 0.83+ deprecates SafeAreaView, and the deprecation
// wrapper causes "Right-hand side of 'instanceof' is not callable" with React 19's
// test renderer. Tests using SafeAreaView-based screens (ProfileScreen) are skipped.
// Fix: migrate to react-native-safe-area-context's SafeAreaView in source files.
// See: https://github.com/facebook/react-native/issues/48392
