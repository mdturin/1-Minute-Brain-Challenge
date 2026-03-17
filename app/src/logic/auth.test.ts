/// <reference types="jest" />

// Mock firebaseConfig BEFORE importing auth — provides a non-null auth object
// NOTE: jest.mock factories are hoisted, so we define the mock auth inline
jest.mock("./firebaseConfig", () => {
  const mockAuth = { currentUser: null as any };
  return {
    __esModule: true,
    app: {},
    auth: mockAuth,
    db: null,
    analytics: null,
  };
});

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

// Mock Firebase Auth functions
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockFirebaseSignOut = jest.fn();
const mockOnAuthStateChangedFirebase = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: (...args: any[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args: any[]) =>
    mockSignInWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: any[]) =>
    mockOnAuthStateChangedFirebase(...args),
  sendPasswordResetEmail: (...args: any[]) =>
    mockSendPasswordResetEmail(...args),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock migration
jest.mock("./migrate", () => ({
  migrateLocalDataToCloud: jest.fn().mockResolvedValue(undefined),
}));

import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  resetPassword,
} from "./auth";

// Get a reference to the mock auth object for mutation in tests
const mockAuth = require("./firebaseConfig").auth;

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.currentUser = null;
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
      mockAuth,
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
      mockAuth,
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
    expect(mockFirebaseSignOut).toHaveBeenCalledWith(mockAuth);
  });

  test("throws error on sign out failure", async () => {
    mockFirebaseSignOut.mockRejectedValue(new Error("Sign out failed"));

    await expect(signOut()).rejects.toThrow("Sign out failed");
  });
});

describe("getCurrentUser", () => {
  test("returns current user when authenticated", () => {
    mockAuth.currentUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };

    const result = getCurrentUser();

    expect(result).toEqual({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("returns null when not authenticated", () => {
    mockAuth.currentUser = null;

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

    mockOnAuthStateChangedFirebase.mockImplementation(
      (_auth: any, observer: any) => {
        observer(mockUser);
        return jest.fn();
      },
    );

    onAuthStateChanged(callback);

    expect(mockOnAuthStateChangedFirebase).toHaveBeenCalledWith(
      mockAuth,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith({
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  test("calls callback with null on sign out", () => {
    const callback = jest.fn();

    mockOnAuthStateChangedFirebase.mockImplementation(
      (_auth: any, observer: any) => {
        observer(null);
        return jest.fn();
      },
    );

    onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith(null);
  });
});

describe("resetPassword", () => {
  test("sends password reset email", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);

    await expect(
      resetPassword("test@example.com"),
    ).resolves.toBeUndefined();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      mockAuth,
      "test@example.com",
    );
  });
});
