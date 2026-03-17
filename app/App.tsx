import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import AboutScreen from './src/screens/AboutScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import './src/logic/firebaseConfig'; // Initialize Firebase

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Game: {
    difficulty: 'easy' | 'medium' | 'hard';
  };
  Profile: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
        initialRouteName="Home"
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
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
