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
import { MAX_ENERGY, type EnergyState } from "../logic/energy";
import {
  loadEnergyState,
  loadAndRefillEnergy,
  saveEnergyState,
} from "./energy";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockedStorage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

describe("energy storage", () => {
  const now = 1_000_000;

  beforeEach(() => {
    mockedStorage.getItem.mockReset();
    mockedStorage.setItem.mockReset();
  });

  test("loadEnergyState returns default when nothing stored", async () => {
    mockedStorage.getItem.mockResolvedValueOnce(null);

    const state = await loadEnergyState(now);
    expect(state.current).toBe(MAX_ENERGY);
  });

  test("loadEnergyState guards against malformed JSON", async () => {
    mockedStorage.getItem.mockResolvedValueOnce("not-json");

    const state = await loadEnergyState(now);
    expect(state.current).toBe(MAX_ENERGY);
  });

  test("saveEnergyState writes JSON", async () => {
    const state: EnergyState = { current: 10, lastUpdatedAt: now };
    await saveEnergyState(state);
    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      "one-minute-brain-challenge/energy",
      JSON.stringify(state),
    );
  });

  test("loadAndRefillEnergy persists when changed", async () => {
    const stored: EnergyState = {
      current: 0,
      lastUpdatedAt: now - 5 * 60 * 60 * 1000,
    };
    mockedStorage.getItem.mockResolvedValueOnce(JSON.stringify(stored));

    const state = await loadAndRefillEnergy(now);
    expect(state.current).toBeGreaterThan(stored.current);
    expect(mockedStorage.setItem).toHaveBeenCalled();
  });
});
