/// <reference types="jest" />

// Mock Firebase Analytics to avoid window issues
jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(() => ({})),
}));

// Mock Firebase App
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  type AuthUser,
} from "./auth";

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

const mockCreateUserWithEmailAndPassword = require("firebase/auth")
  .createUserWithEmailAndPassword as jest.Mock;
const mockSignInWithEmailAndPassword = require("firebase/auth")
  .signInWithEmailAndPassword as jest.Mock;
const mockFirebaseSignOut = require("firebase/auth").signOut as jest.Mock;
const mockOnAuthStateChangedFirebase = require("firebase/auth")
  .onAuthStateChanged as jest.Mock;

const mockSignUp = signUp as jest.Mock;
const mockSignIn = signIn as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
});

describe("signUp", () => {
  test("successfully creates a new user", async () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    });

    const result = await signUp("test@example.com", "password123");

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object), // auth instance
      "test@example.com",
      "password123",
    );
    expect(result).toEqual({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("throws error on invalid email", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(
      new Error("Invalid email"),
    );

    await expect(signUp("invalid-email", "password123")).rejects.toThrow(
      "Invalid email",
    );
  });

  test("throws error on weak password", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(
      new Error("Password should be at least 6 characters"),
    );

    await expect(signUp("test@example.com", "123")).rejects.toThrow(
      "Password should be at least 6 characters",
    );
  });

  test("throws error on email already in use", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(
      new Error("The email address is already in use by another account"),
    );

    await expect(signUp("existing@example.com", "password123")).rejects.toThrow(
      "The email address is already in use by another account",
    );
  });
});

describe("signIn", () => {
  test("successfully signs in existing user", async () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    });

    const result = await signIn("test@example.com", "password123");

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123",
    );
    expect(result).toEqual({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("throws error on invalid credentials", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(
      new Error("Invalid login credentials"),
    );

    await expect(signIn("test@example.com", "wrongpassword")).rejects.toThrow(
      "Invalid login credentials",
    );
  });

  test("throws error on user not found", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(
      new Error("There is no user record corresponding to this identifier"),
    );

    await expect(
      signIn("nonexistent@example.com", "password123"),
    ).rejects.toThrow(
      "There is no user record corresponding to this identifier",
    );
  });
});

describe("signOut", () => {
  test("successfully signs out", async () => {
    mockFirebaseSignOut.mockResolvedValue(undefined);

    await expect(signOut()).resolves.toBeUndefined();
    expect(mockFirebaseSignOut).toHaveBeenCalledWith(expect.any(Object));
  });

  test("throws error on sign out failure", async () => {
    mockFirebaseSignOut.mockRejectedValue(new Error("Sign out failed"));

    await expect(signOut()).rejects.toThrow("Sign out failed");
  });
});

describe("getCurrentUser", () => {
  test("returns current user when authenticated", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    const result = getCurrentUser();

    expect(result).toEqual({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("returns null when not authenticated", () => {
    mockGetCurrentUser.mockReturnValue(null);

    const result = getCurrentUser();

    expect(result).toBeNull();
  });
});

describe("onAuthStateChanged", () => {
  test("calls callback with user on sign in", () => {
    const callback = jest.fn();
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };

    mockOnAuthStateChangedFirebase.mockImplementation((auth, observer) => {
      observer(mockUser);
      return jest.fn();
    });

    onAuthStateChanged(callback);

    expect(mockOnAuthStateChangedFirebase).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("calls callback with null on sign out", () => {
    const callback = jest.fn();

    mockOnAuthStateChangedFirebase.mockImplementation((auth, observer) => {
      observer(null);
      return jest.fn();
    });

    onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith(null);
  });
});
