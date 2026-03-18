import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../logic/firebaseConfig";
import { getCurrentUser } from "../logic/auth";
import type { SubscriptionTier } from "../logic/iapConfig";

const STORAGE_KEY = "one-minute-brain-challenge/subscription";

export type SubscriptionStatus = {
  isActive: boolean;
  tier: SubscriptionTier | null;
  purchaseToken: string | null;
  expiresAt: number | null; // ms epoch; null for lifetime
  platform: "ios" | "android" | null;
  updatedAt: number;
};

const createDefaultSubscriptionStatus = (): SubscriptionStatus => ({
  isActive: false,
  tier: null,
  purchaseToken: null,
  expiresAt: null,
  platform: null,
  updatedAt: 0,
});

export async function loadSubscriptionStatus(): Promise<SubscriptionStatus> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "subscription", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          ...createDefaultSubscriptionStatus(),
          ...(docSnap.data() as Partial<SubscriptionStatus>),
        };
      } else {
        return createDefaultSubscriptionStatus();
      }
    } catch (error) {
      console.error("Error loading subscription from Firestore:", error);
      // Fall through to AsyncStorage on Firestore error
    }
  }

  // Fallback to local storage for guests (or Firestore error)
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSubscriptionStatus();
    return {
      ...createDefaultSubscriptionStatus(),
      ...(JSON.parse(raw) as Partial<SubscriptionStatus>),
    };
  } catch {
    return createDefaultSubscriptionStatus();
  }
}

export async function saveSubscriptionStatus(
  status: SubscriptionStatus,
): Promise<void> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "subscription", "data");
      await setDoc(docRef, status);
      return;
    } catch (error) {
      console.error("Error saving subscription to Firestore:", error);
      throw error;
    }
  }

  // Fallback to local storage for guests
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {
    // ignore persistence errors
  }
}
