import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import AboutScreen from './src/screens/AboutScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SubscriptionProvider } from './src/logic/useSubscription';
import './src/logic/firebaseConfig'; // Initialize Firebase

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Game: {
    difficulty: 'easy' | 'medium' | 'hard';
    isDailyChallenge?: boolean;
  };
  Profile: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
  DailyChallenge: undefined;
  Leaderboard: undefined;
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Home' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then(val => {
      setInitialRoute(val === 'true' ? 'Home' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
      <SubscriptionProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </SubscriptionProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
