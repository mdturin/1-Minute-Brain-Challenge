/// <reference types="jest" />

// Mock Firebase Analytics to avoid window issues
jest.mock("firebase/analytics", () => ({
  getAnalytics: jest.fn(() => ({})),
}));

// Mock Firebase App
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock auth
jest.mock("../logic/auth", () => ({
  getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from "../logic/auth";
import { loadUserProfile, saveUserProfile, UserProfile } from "./userProfile";

const mockedStorage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockDoc = require("firebase/firestore").doc as jest.Mock;
const mockGetDoc = require("firebase/firestore").getDoc as jest.Mock;
const mockSetDoc = require("firebase/firestore").setDoc as jest.Mock;

describe("userProfile storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadUserProfile", () => {
    test("loads profile from Firestore when user is authenticated", async () => {
      const mockUser = { uid: "123", email: "test@example.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const mockDocRef = {};
      mockDoc.mockReturnValue(mockDocRef);

      const mockProfile: UserProfile = {
        displayName: "Test User",
        avatarType: "initials",
        avatarId: "dragon",
        age: 25,
        country: "Japan",
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      });

      const result = await loadUserProfile();

      expect(mockDoc).toHaveBeenCalledWith(
        expect.any(Object),
        "users",
        "123",
        "profile",
        "data",
      );
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual(mockProfile);
    });

    test("loads profile with avatarId from Firestore", async () => {
      const mockUser = { uid: "abc", email: "a@b.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);
      mockDoc.mockReturnValue({});
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: "Warrior", avatarType: "initials", avatarId: "skull" }),
      });

      const result = await loadUserProfile();
      expect(result.avatarId).toBe("skull");
    });

    test("returns default profile when Firestore doc does not exist", async () => {
      const mockUser = { uid: "123", email: "test@example.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);

      mockDoc.mockReturnValue({});
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await loadUserProfile();

      expect(result).toEqual({
        displayName: "Guest",
        avatarType: "initials",
      });
    });

    test("throws error on Firestore failure", async () => {
      const mockUser = { uid: "123", email: "test@example.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);

      mockDoc.mockReturnValue({});
      mockGetDoc.mockRejectedValue(new Error("Firestore error"));

      await expect(loadUserProfile()).rejects.toThrow("Firestore error");
    });

    test("loads profile from AsyncStorage when not authenticated", async () => {
      mockGetCurrentUser.mockReturnValue(null);

      const storedProfile: Partial<UserProfile> = {
        displayName: "Local User",
        age: 30,
      };
      mockedStorage.getItem.mockResolvedValue(JSON.stringify(storedProfile));

      const result = await loadUserProfile();

      expect(mockedStorage.getItem).toHaveBeenCalledWith(
        "one-minute-brain-challenge/user-profile",
      );
      expect(result).toEqual({
        displayName: "Local User",
        avatarType: "initials",
        age: 30,
      });
    });

    test("returns default profile when AsyncStorage is empty", async () => {
      mockGetCurrentUser.mockReturnValue(null);
      mockedStorage.getItem.mockResolvedValue(null);

      const result = await loadUserProfile();

      expect(result).toEqual({
        displayName: "Guest",
        avatarType: "initials",
      });
    });

    test("returns default profile on AsyncStorage parse error", async () => {
      mockGetCurrentUser.mockReturnValue(null);
      mockedStorage.getItem.mockResolvedValue("invalid json");

      const result = await loadUserProfile();

      expect(result).toEqual({
        displayName: "Guest",
        avatarType: "initials",
      });
    });
  });

  describe("saveUserProfile", () => {
    test("saves profile to Firestore when user is authenticated", async () => {
      const mockUser = { uid: "123", email: "test@example.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const mockDocRef = {};
      mockDoc.mockReturnValue(mockDocRef);

      const profile: UserProfile = {
        displayName: "Test User",
        avatarType: "initials",
        avatarId: "oni",
        age: 25,
        country: "Japan",
      };

      await saveUserProfile(profile);

      expect(mockDoc).toHaveBeenCalledWith(
        expect.any(Object),
        "users",
        "123",
        "profile",
        "data",
      );
      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, profile);
    });

    test("throws error on Firestore save failure", async () => {
      const mockUser = { uid: "123", email: "test@example.com" };
      mockGetCurrentUser.mockReturnValue(mockUser);

      mockDoc.mockReturnValue({});
      mockSetDoc.mockRejectedValue(new Error("Save failed"));

      const profile: UserProfile = {
        displayName: "Test User",
        avatarType: "initials",
      };

      await expect(saveUserProfile(profile)).rejects.toThrow("Save failed");
    });

    test("saves profile to AsyncStorage when not authenticated", async () => {
      mockGetCurrentUser.mockReturnValue(null);

      const profile: UserProfile = {
        displayName: "Local User",
        avatarType: "initials",
        age: 30,
      };

      await saveUserProfile(profile);

      expect(mockedStorage.setItem).toHaveBeenCalledWith(
        "one-minute-brain-challenge/user-profile",
        JSON.stringify(profile),
      );
    });

    test("ignores AsyncStorage errors for guests", async () => {
      mockGetCurrentUser.mockReturnValue(null);
      mockedStorage.setItem.mockRejectedValue(new Error("Storage error"));

      const profile: UserProfile = {
        displayName: "Local User",
        avatarType: "initials",
      };

      await expect(saveUserProfile(profile)).resolves.toBeUndefined();
    });
  });
});
