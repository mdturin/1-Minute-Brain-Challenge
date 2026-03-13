import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../logic/firebaseConfig";
import { getCurrentUser } from "../logic/auth";
import {
  EnergyState,
  MAX_ENERGY,
  calculateRefilledEnergy,
} from "../logic/energy";

const STORAGE_KEY = "one-minute-brain-challenge/energy";

const createDefaultEnergyState = (now: number): EnergyState => ({
  current: MAX_ENERGY,
  lastUpdatedAt: now,
});

export async function loadEnergyState(
  now: number = Date.now(),
): Promise<EnergyState> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "energy", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<EnergyState>;
        const base = createDefaultEnergyState(now);
        return {
          current:
            typeof data.current === "number" ? data.current : base.current,
          lastUpdatedAt:
            typeof data.lastUpdatedAt === "number"
              ? data.lastUpdatedAt
              : base.lastUpdatedAt,
        };
      }
    } catch (error) {
      console.error("Error loading energy from Firestore:", error);
    }
  }

  // Fallback to local storage
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultEnergyState(now);
    }
    const parsed = JSON.parse(raw) as Partial<EnergyState>;
    const base = createDefaultEnergyState(now);
    return {
      current:
        typeof parsed.current === "number" ? parsed.current : base.current,
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "number"
          ? parsed.lastUpdatedAt
          : base.lastUpdatedAt,
    };
  } catch {
    return createDefaultEnergyState(now);
  }
}

export async function saveEnergyState(state: EnergyState): Promise<void> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "energy", "data");
      await setDoc(docRef, state);
      return;
    } catch (error) {
      console.error("Error saving energy to Firestore:", error);
    }
  }

  // Fallback to local storage
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
}

export async function loadAndRefillEnergy(
  now: number = Date.now(),
): Promise<EnergyState> {
  const current = await loadEnergyState(now);
  const next = calculateRefilledEnergy(current, now);
  if (
    next.current !== current.current ||
    next.lastUpdatedAt !== current.lastUpdatedAt
  ) {
    await saveEnergyState(next);
  }
  return next;
}
