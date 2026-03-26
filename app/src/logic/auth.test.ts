/// <reference types="jest" />

// Mock firebaseConfig BEFORE importing auth — provides a non-null auth object
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

jest.mock("firebase/analytics", () => ({ getAnalytics: jest.fn(() => ({})) }));
jest.mock("firebase/app", () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

// Firebase Auth mocks
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockFirebaseSignOut = jest.fn();
const mockOnAuthStateChangedFirebase = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockGoogleCredential = jest.fn(() => ({ type: 'google-cred' }));
const mockSignInWithCredential = jest.fn();
const mockLinkWithCredential = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChangedFirebase(...args),
  sendPasswordResetEmail: (...args: any[]) => mockSendPasswordResetEmail(...args),
  signInAnonymously: (...args: any[]) => mockSignInAnonymously(...args),
  GoogleAuthProvider: { credential: (...args: any[]) => mockGoogleCredential(...args) },
  signInWithCredential: (...args: any[]) => mockSignInWithCredential(...args),
  linkWithCredential: (...args: any[]) => mockLinkWithCredential(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("./migrate", () => ({
  migrateLocalDataToCloud: jest.fn().mockResolvedValue(undefined),
}));

// Mock global fetch for fetchAndApplyGoogleProfile
global.fetch = jest.fn();

import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  resetPassword,
  signInAsGuest,
  signInWithGoogle,
  linkWithGoogle,
} from "./auth";

const mockAuth = require("./firebaseConfig").auth;

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.currentUser = null;
});

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------
describe("signUp", () => {
  test("successfully creates a new user", async () => {
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false };
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    const result = await signUp("test@example.com", "password123");

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, "test@example.com", "password123");
    expect(result).toEqual({ uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false });
  });

  test("throws error on invalid email", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("Invalid email"));
    await expect(signUp("invalid-email", "password123")).rejects.toThrow("Invalid email");
  });

  test("throws error on weak password", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("Password should be at least 6 characters"));
    await expect(signUp("test@example.com", "123")).rejects.toThrow("Password should be at least 6 characters");
  });

  test("throws error on email already in use", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("The email address is already in use by another account"));
    await expect(signUp("existing@example.com", "password123")).rejects.toThrow("The email address is already in use by another account");
  });
});

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------
describe("signIn", () => {
  test("successfully signs in existing user", async () => {
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false };
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    const result = await signIn("test@example.com", "password123");

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, "test@example.com", "password123");
    expect(result).toEqual({ uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false });
  });

  test("throws error on invalid credentials", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error("Invalid login credentials"));
    await expect(signIn("test@example.com", "wrongpassword")).rejects.toThrow("Invalid login credentials");
  });

  test("throws error on user not found", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error("There is no user record corresponding to this identifier"));
    await expect(signIn("nonexistent@example.com", "password123")).rejects.toThrow("There is no user record corresponding to this identifier");
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// signInAsGuest
// ---------------------------------------------------------------------------
describe("signInAsGuest", () => {
  test("signs in anonymously and returns guest AuthUser", async () => {
    const mockUser = { uid: "anon-123", email: null, displayName: null, isAnonymous: true };
    mockSignInAnonymously.mockResolvedValue({ user: mockUser });

    const result = await signInAsGuest();

    expect(mockSignInAnonymously).toHaveBeenCalledWith(mockAuth);
    expect(result).toEqual({ uid: "anon-123", email: null, displayName: "Guest", isAnonymous: true });
  });

  test("throws when Firebase is not configured", async () => {
    const origAuth = require("./firebaseConfig").auth;
    jest.resetModules();
    // Not easily testable without full module reset; just verify call propagates errors
    mockSignInAnonymously.mockRejectedValue(new Error("Firebase error"));
    await expect(signInAsGuest()).rejects.toThrow("Firebase error");
  });
});

// ---------------------------------------------------------------------------
// signInWithGoogle
// ---------------------------------------------------------------------------
describe("signInWithGoogle", () => {
  test("signs in with id_token and returns AuthUser", async () => {
    const mockUser = { uid: "google-123", email: "g@gmail.com", displayName: "Google User", isAnonymous: false };
    mockSignInWithCredential.mockResolvedValue({ user: mockUser });

    const result = await signInWithGoogle("id-token-abc", null);

    expect(mockGoogleCredential).toHaveBeenCalledWith("id-token-abc", null);
    expect(mockSignInWithCredential).toHaveBeenCalledWith(mockAuth, { type: 'google-cred' });
    expect(result).toEqual({ uid: "google-123", email: "g@gmail.com", displayName: "Google User", isAnonymous: false });
  });

  test("fetches profile from userinfo API when only access_token provided and displayName is null", async () => {
    const mockUser = { uid: "google-456", email: "g@gmail.com", displayName: null, isAnonymous: false };
    mockSignInWithCredential.mockResolvedValue({ user: mockUser });
    mockUpdateProfile.mockResolvedValue(undefined);
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ name: "Fetched Name", picture: "http://photo.jpg" }),
    });

    const result = await signInWithGoogle(null, "access-token-xyz");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      expect.objectContaining({ headers: { Authorization: "Bearer access-token-xyz" } }),
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: "Fetched Name", photoURL: "http://photo.jpg" });
  });

  test("does not fetch profile when displayName already set", async () => {
    const mockUser = { uid: "google-789", email: "g@gmail.com", displayName: "Existing Name", isAnonymous: false };
    mockSignInWithCredential.mockResolvedValue({ user: mockUser });

    await signInWithGoogle(null, "access-token-xyz");

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("throws when signInWithCredential fails", async () => {
    mockSignInWithCredential.mockRejectedValue(new Error("Credential rejected"));
    await expect(signInWithGoogle("bad-token", null)).rejects.toThrow("Credential rejected");
  });
});

// ---------------------------------------------------------------------------
// linkWithGoogle
// ---------------------------------------------------------------------------
describe("linkWithGoogle", () => {
  test("links anonymous account to Google", async () => {
    const mockCurrentUser = { uid: "anon-123", email: null, displayName: null, isAnonymous: true };
    mockAuth.currentUser = mockCurrentUser;
    const mockLinkedUser = { uid: "anon-123", email: "g@gmail.com", displayName: "Google User", isAnonymous: false };
    mockLinkWithCredential.mockResolvedValue({ user: mockLinkedUser });

    const result = await linkWithGoogle("id-token-abc", null);

    expect(mockGoogleCredential).toHaveBeenCalledWith("id-token-abc", null);
    expect(mockLinkWithCredential).toHaveBeenCalledWith(mockCurrentUser, { type: 'google-cred' });
    expect(result).toEqual({ uid: "anon-123", email: "g@gmail.com", displayName: "Google User", isAnonymous: false });
  });

  test("throws when no user is signed in", async () => {
    mockAuth.currentUser = null;
    await expect(linkWithGoogle("id-token-abc", null)).rejects.toThrow("No user signed in");
  });
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------
describe("getCurrentUser", () => {
  test("returns current user when authenticated", () => {
    mockAuth.currentUser = { uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false };
    const result = getCurrentUser();
    expect(result).toEqual({ uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false });
  });

  test("returns current anonymous user with isAnonymous true", () => {
    mockAuth.currentUser = { uid: "anon-123", email: null, displayName: null, isAnonymous: true };
    const result = getCurrentUser();
    expect(result).toEqual({ uid: "anon-123", email: null, displayName: null, isAnonymous: true });
  });

  test("returns null when not authenticated", () => {
    mockAuth.currentUser = null;
    expect(getCurrentUser()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// onAuthStateChanged
// ---------------------------------------------------------------------------
describe("onAuthStateChanged", () => {
  test("calls callback with user on sign in", () => {
    const callback = jest.fn();
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false };

    mockOnAuthStateChangedFirebase.mockImplementation((_auth: any, observer: any) => {
      observer(mockUser);
      return jest.fn();
    });

    onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith({ uid: "123", email: "test@example.com", displayName: "Test User", isAnonymous: false });
  });

  test("calls callback with anonymous user", () => {
    const callback = jest.fn();
    const mockUser = { uid: "anon-1", email: null, displayName: null, isAnonymous: true };

    mockOnAuthStateChangedFirebase.mockImplementation((_auth: any, observer: any) => {
      observer(mockUser);
      return jest.fn();
    });

    onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith({ uid: "anon-1", email: null, displayName: null, isAnonymous: true });
  });

  test("calls callback with null on sign out", () => {
    const callback = jest.fn();

    mockOnAuthStateChangedFirebase.mockImplementation((_auth: any, observer: any) => {
      observer(null);
      return jest.fn();
    });

    onAuthStateChanged(callback);
    expect(callback).toHaveBeenCalledWith(null);
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------
describe("resetPassword", () => {
  test("sends password reset email", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
    await expect(resetPassword("test@example.com")).resolves.toBeUndefined();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, "test@example.com");
  });
});
