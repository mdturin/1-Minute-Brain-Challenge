/// <reference types="jest" />

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = (props: any) => React.createElement(Text, props, props.name);
  return { Ionicons: MockIcon, __esModule: true };
});

jest.mock('firebase/analytics', () => ({ getAnalytics: jest.fn(() => ({})) }));
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));

// Mock expo-auth-session Google provider
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn().mockResolvedValue(undefined)]),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { googleWebClientId: 'web-client-id', googleAndroidClientId: 'android-client-id' } } },
}));

// Mock auth
jest.mock('../logic/auth', () => ({
  signInAsGuest: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { signInAsGuest } from '../logic/auth';

const mockSignInAsGuest = signInAsGuest as jest.Mock;

const mockReplace = jest.fn();
const mockNavigation = {
  replace: mockReplace,
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen', () => {
  test('renders app title and both login options', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('1 Minute Brain Challenge')).toBeTruthy();
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue as Guest')).toBeTruthy();
  });

  test('renders subtitle text', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('You can sign in later from your Profile')).toBeTruthy();
  });

  test('guest button calls signInAsGuest and navigates to Consent', async () => {
    mockSignInAsGuest.mockResolvedValue({ uid: 'anon-1', email: null, displayName: 'Guest', isAnonymous: true });

    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Continue as Guest'));

    await waitFor(() => {
      expect(mockSignInAsGuest).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('Consent');
    });
  });

  test('shows error when guest sign-in fails', async () => {
    mockSignInAsGuest.mockRejectedValue(new Error('Anonymous auth disabled'));

    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Continue as Guest'));

    await waitFor(() => {
      expect(getByText('Could not continue as guest. Please try again.')).toBeTruthy();
    });
  });

  test('Google button calls promptAsync when pressed', async () => {
    const mockPromptAsync = jest.fn().mockResolvedValue(undefined);
    const { useAuthRequest } = require('expo-auth-session/providers/google');
    useAuthRequest.mockImplementation(() => [{ url: 'https://accounts.google.com' }, null, mockPromptAsync]);

    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('Continue with Google')).toBeTruthy();
    fireEvent.press(getByText('Continue with Google'));

    await waitFor(() => {
      expect(mockPromptAsync).toHaveBeenCalled();
    });
  });
});
