/// <reference types="jest" />

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

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnergy.mockReturnValue({
      energy: 10,
      maxEnergy: 20,
      isLoading: false,
    });
  });

  describe('Authentication', () => {
    beforeEach(() => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(null); // Not authenticated
        return jest.fn(); // unsubscribe
      });
    });

    test('renders login form by default', () => {
      const { getByText, getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      expect(getByText('Login')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
    });

    test('switches to sign up form', () => {
      const { getByText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      fireEvent.press(getByText("Don't have an account? Sign Up"));

      expect(getByText('Sign Up')).toBeTruthy();
    });

    test('validates email and password on login', async () => {
      const { getByText, getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      // Invalid email
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
      });

      // Short password
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Password must be at least 8 characters long')).toBeTruthy();
      });
    });

    test('calls signIn on valid login', async () => {
      mockSignIn.mockResolvedValue({ uid: '123', email: 'test@example.com' });

      const { getByText, getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('calls signUp on valid sign up', async () => {
      mockSignUp.mockResolvedValue({ uid: '123', email: 'test@example.com' });

      const { getByText, getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      fireEvent.press(getByText("Don't have an account? Sign Up"));

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signUpButton = getByText('Sign Up');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('shows auth error on failure', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      const { getByText, getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Profile Editing', () => {
    beforeEach(() => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback({ uid: '123', email: 'test@example.com' }); // Authenticated
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

    test('renders profile when authenticated', async () => {
      const { getByText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        expect(getByText('Your Profile')).toBeTruthy();
        expect(getByText('Test User')).toBeTruthy();
      });
    });

    test('updates display name', async () => {
      const { getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const displayNameInput = getByPlaceholderText('Your name');
        fireEvent.changeText(displayNameInput, 'New Name');
        expect(displayNameInput.props.value).toBe('New Name');
      });
    });

    test('updates age with numeric input', async () => {
      const { getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const ageInput = getByPlaceholderText('18');
        fireEvent.changeText(ageInput, '30');
        expect(ageInput.props.value).toBe('30');
      });
    });

    test('filters non-numeric from age', async () => {
      const { getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const ageInput = getByPlaceholderText('18');
        fireEvent.changeText(ageInput, 'abc30def');
        expect(ageInput.props.value).toBe('30');
      });
    });

    test('updates country', async () => {
      const { getByPlaceholderText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const countryInput = getByPlaceholderText('Country');
        fireEvent.changeText(countryInput, 'Canada');
        expect(countryInput.props.value).toBe('Canada');
      });
    });

    test('saves profile successfully', async () => {
      mockSaveUserProfile.mockResolvedValue(undefined);

      const { getByText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const saveButton = getByText('Save profile');
        fireEvent.press(saveButton);
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

    test('shows error on save failure', async () => {
      mockSaveUserProfile.mockRejectedValue(new Error('Save failed'));

      const { getByText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const saveButton = getByText('Save profile');
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(getByText("Couldn't save profile changes. Please try again.")).toBeTruthy();
      });
    });

    test('calls signOut on logout', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { getByText } = render(<ProfileScreen navigation={mockNavigation} route={{} as any} />);

      await waitFor(() => {
        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });
});