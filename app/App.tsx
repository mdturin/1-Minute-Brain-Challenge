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
import LoginScreen from './src/screens/LoginScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SubscriptionProvider } from './src/logic/useSubscription';
import './src/logic/firebaseConfig'; // Initialize Firebase
import { initializeAds } from './src/logic/adsInit';
import { getCurrentUser } from './src/logic/auth';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Consent: undefined;
  UserInfo: undefined;
  Home: { updatedStats?: { bestScore: number; gamesPlayed: number; totalScore: number } } | undefined;
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
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Login' | 'Consent' | 'Home' | null>(null);

  useEffect(() => {
    initializeAds().catch(() => {
      // Non-fatal — app continues if AdMob init fails at cold start
    });

    (async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (seen !== 'true') {
        setInitialRoute('Onboarding');
        return;
      }
      const user = getCurrentUser();
      if (!user) { setInitialRoute('Login'); return; }
      const accepted = await AsyncStorage.getItem('hasAcceptedPolicy');
      setInitialRoute(accepted === 'true' ? 'Home' : 'Consent');
    })();
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
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Consent" component={ConsentScreen} />
          <Stack.Screen name="UserInfo" component={UserInfoScreen} />
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
