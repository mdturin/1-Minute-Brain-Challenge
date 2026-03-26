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

jest.mock('../storage/userProfile', () => ({
  loadUserProfile: jest.fn().mockResolvedValue({ displayName: 'Guest', avatarType: 'initials' }),
  saveUserProfile: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserInfoScreen from './UserInfoScreen';
import { loadUserProfile, saveUserProfile } from '../storage/userProfile';

const mockLoadUserProfile = loadUserProfile as jest.Mock;
const mockSaveUserProfile = saveUserProfile as jest.Mock;

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

describe('UserInfoScreen', () => {
  test('renders title and both input fields', () => {
    const { getByText, getByPlaceholderText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('Tell us about yourself')).toBeTruthy();
    expect(getByPlaceholderText('Enter your age')).toBeTruthy();
    expect(getByText('Select your country')).toBeTruthy();
  });

  test('Next button is disabled when age and country are empty', () => {
    const { getByText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Next'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('Next button is disabled when only age is filled', () => {
    const { getByText, getByPlaceholderText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.changeText(getByPlaceholderText('Enter your age'), '25');
    fireEvent.press(getByText('Next'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('age input accepts numeric text', () => {
    const { getByPlaceholderText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    const ageInput = getByPlaceholderText('Enter your age');
    fireEvent.changeText(ageInput, '25');
    expect(ageInput.props.value).toBe('25');
  });

  test('Skip for now navigates to Home without saving', async () => {
    const { getByText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    fireEvent.press(getByText('Skip for now'));

    expect(mockReplace).toHaveBeenCalledWith('Home');
    expect(mockSaveUserProfile).not.toHaveBeenCalled();
  });

  test('shows country picker label', () => {
    const { getByText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('Country')).toBeTruthy();
    expect(getByText('Select your country')).toBeTruthy();
  });

  test('age input has number-pad keyboard type', () => {
    const { getByPlaceholderText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    const ageInput = getByPlaceholderText('Enter your age');
    expect(ageInput.props.keyboardType).toBe('number-pad');
  });

  test('age input has max length of 3', () => {
    const { getByPlaceholderText } = render(
      <UserInfoScreen navigation={mockNavigation} route={{} as any} />,
    );

    const ageInput = getByPlaceholderText('Enter your age');
    expect(ageInput.props.maxLength).toBe(3);
  });
});
