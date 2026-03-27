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
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn(() => ({})), doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn() }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(() => ({})) }));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../logic/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ConsentScreen from './ConsentScreen';
import { signOut } from '../logic/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSignOut = signOut as jest.Mock;
const mockSetItem = (AsyncStorage as any).setItem as jest.Mock;

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  replace: mockReplace,
  navigate: mockNavigate,
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

describe('ConsentScreen', () => {
  test('renders title and policy summary', () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('Before you continue')).toBeTruthy();
    expect(getByText(/Please review and accept our policies/)).toBeTruthy();
  });

  test('renders all three policy items', () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText(/gameplay data/)).toBeTruthy();
    expect(getByText(/never sell your personal data/)).toBeTruthy();
    expect(getByText(/request deletion/)).toBeTruthy();
  });

  test('continue button is disabled before checkbox is checked', () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    const continueBtn = getByText('I Agree & Continue');
    // Button is disabled — pressing should not trigger navigation
    fireEvent.press(continueBtn);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('checking checkbox enables continue button', async () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText(/I have read and agree/));

    await waitFor(() => {
      const continueBtn = getByText('I Agree & Continue');
      fireEvent.press(continueBtn);
      expect(mockSetItem).toHaveBeenCalledWith('hasAcceptedPolicy', 'true');
    });
  });

  test('agree and continue navigates to UserInfo', async () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText(/I have read and agree/));

    await waitFor(() => {
      fireEvent.press(getByText('I Agree & Continue'));
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('UserInfo');
    });
  });

  test('decline signs out and navigates to Login', async () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Decline & Sign Out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });

  test('terms of service link triggers navigation', () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Terms of Service'));
    expect(mockNavigate).toHaveBeenCalledWith('TermsOfService');
  });

  test('privacy policy link triggers navigation', () => {
    const { getByText } = render(
      <ConsentScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Privacy Policy'));
    expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
  });
});
