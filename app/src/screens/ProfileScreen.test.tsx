/// <reference types="jest" />

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
  SafeAreaProvider: ({ children, ...props }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-font to prevent font download in tests
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

// Mock @expo/vector-icons to avoid font loading entirely
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = (props: any) => React.createElement(Text, props, props.name);
  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    __esModule: true,
  };
});

// Mock useSubscription to prevent expo-iap / Firestore side-effects
jest.mock('../logic/useSubscription', () => ({
  useSubscription: jest.fn(() => ({
    isSubscribed: false,
    subscriptionTier: null,
    isLoading: false,
    monthlyProduct: null,
    lifetimeProduct: null,
    purchase: jest.fn(),
    restore: jest.fn(),
    isRestoring: false,
    deepLinkManage: jest.fn(),
  })),
  SubscriptionProvider: ({ children }: any) => children,
}));

// Mock Firebase Analytics to avoid window issues
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  canGoBack: jest.fn(() => true),
  dangerouslyGetParent: jest.fn(),
  dangerouslyGetState: jest.fn(),
  navigateDeprecated: jest.fn(),
  preload: jest.fn(),
  getId: jest.fn(),
} as any;

// Mock auth
jest.mock('../logic/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock userProfile
jest.mock('../storage/userProfile', () => ({
  loadUserProfile: jest.fn(),
  saveUserProfile: jest.fn(),
}));

// Mock stats
jest.mock('../storage/stats', () => ({
  loadStats: jest.fn(),
}));

// Mock useEnergy
jest.mock('../logic/useEnergy', () => ({
  useEnergy: jest.fn(),
}));

import { signIn, signUp, signOut, onAuthStateChanged } from '../logic/auth';
import { loadUserProfile, saveUserProfile } from '../storage/userProfile';
import { loadStats } from '../storage/stats';
import { useEnergy } from '../logic/useEnergy';

const mockSignIn = signIn as jest.Mock;
const mockSignUp = signUp as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
const mockLoadUserProfile = loadUserProfile as jest.Mock;
const mockSaveUserProfile = saveUserProfile as jest.Mock;
const mockLoadStats = loadStats as jest.Mock;
const mockUseEnergy = useEnergy as jest.Mock;

// SKIPPED: React 19 + RN 0.83 deprecated SafeAreaView causes "instanceof is not callable"
// in test renderer. Fix: migrate ProfileScreen to react-native-safe-area-context's SafeAreaView.
// See: https://github.com/facebook/react-native/issues/48392
describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnergy.mockReturnValue({
      energy: 10,
      maxEnergy: 20,
      isLoading: false,
    });
  });

  describe('Authentication (unauthenticated)', () => {
    beforeEach(() => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(null); // Not authenticated
        return jest.fn();
      });
    });

    test('renders sign-in form by default', () => {
      const { getByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByPlaceholderText('Email address')).toBeTruthy();
      expect(getByPlaceholderText('Password (min. 8 characters)')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    test('switches to sign up form', () => {
      const { getAllByText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      // Press the toggle link (contains "Sign Up" text)
      const signUpLinks = getAllByText(/Sign Up/);
      fireEvent.press(signUpLinks[0]);

      // After switching, "Create Account" appears (title + button)
      const createAccountElements = getAllByText('Create Account');
      expect(createAccountElements.length).toBeGreaterThanOrEqual(1);
    });

    test('validates email on submit', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      const emailInput = getByPlaceholderText('Email address');
      const passwordInput = getByPlaceholderText('Password (min. 8 characters)');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email address.')).toBeTruthy();
      });
    });

    test('validates password length on submit', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      const emailInput = getByPlaceholderText('Email address');
      const passwordInput = getByPlaceholderText('Password (min. 8 characters)');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(getByText('Password must be at least 8 characters.')).toBeTruthy();
      });
    });

    test('calls signIn on valid login', async () => {
      mockSignIn.mockResolvedValue({ uid: '123', email: 'test@example.com' });

      const { getByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('calls signUp on valid sign up', async () => {
      mockSignUp.mockResolvedValue({ uid: '123', email: 'test@example.com' });

      const { getAllByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      // Switch to sign up
      fireEvent.press(getAllByText(/Sign Up/)[0]);

      fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'password123');
      // "Create Account" appears as both title and button — press the button (last one)
      const createBtns = getAllByText('Create Account');
      fireEvent.press(createBtns[createBtns.length - 1]);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('shows auth error on failure', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      const { getByText, getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });

    test('continue as guest navigates back', () => {
      const { getByText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      fireEvent.press(getByText('Continue as Guest'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Profile Editing (authenticated)', () => {
    beforeEach(() => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback({ uid: '123', email: 'test@example.com', displayName: 'Test User' });
        return jest.fn();
      });
      mockLoadUserProfile.mockResolvedValue({
        displayName: 'Test User',
        avatarType: 'initials',
        age: 25,
        country: 'USA',
      });
      mockLoadStats.mockResolvedValue({
        bestScore: 100,
        gamesPlayed: 10,
        totalScore: 500,
        bestStreak: 5,
      });
    });

    test('renders profile header when authenticated', async () => {
      const { getByText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Test User')).toBeTruthy();
      });
    });

    test('renders stats when loaded', async () => {
      const { getByText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        expect(getByText('100')).toBeTruthy(); // bestScore
        expect(getByText('10')).toBeTruthy(); // gamesPlayed
        expect(getByText('5')).toBeTruthy(); // bestStreak
        expect(getByText('50')).toBeTruthy(); // averageScore = 500/10
      });
    });

    test('updates display name', async () => {
      const { getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        const displayNameInput = getByPlaceholderText('Display name');
        fireEvent.changeText(displayNameInput, 'New Name');
        expect(displayNameInput.props.value).toBe('New Name');
      });
    });

    test('updates age with numeric input', async () => {
      const { getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        const ageInput = getByPlaceholderText('Age');
        fireEvent.changeText(ageInput, '30');
        expect(ageInput.props.value).toBe('30');
      });
    });

    test('filters non-numeric from age', async () => {
      const { getByPlaceholderText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        const ageInput = getByPlaceholderText('Age');
        fireEvent.changeText(ageInput, 'abc30def');
        expect(ageInput.props.value).toBe('30');
      });
    });

    test('saves profile successfully', async () => {
      mockSaveUserProfile.mockResolvedValue(undefined);

      const { getByText } = render(
        <ProfileScreen navigation={mockNavigation} route={{} as any} />,
      );

      await waitFor(() => {
        fireEvent.press(getByText('Save Profile'));
      });

      await waitFor(() => {
        expect(mockSaveUserProfile).toHaveBeenCalledWith({
          displayName: 'Test User',
          avatarType: 'initials',
          age: 25,
          country: 'USA',
        });
      });
    });
  });
});
