import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../logic/firebaseConfig";
import { getCurrentUser } from "../logic/auth";

const STORAGE_KEY = "one-minute-brain-challenge/user-profile";

export type UserProfile = {
  displayName: string;
  avatarType: "initials" | "image";
  age?: number;
  country?: string;
};

const defaultProfile: UserProfile = {
  displayName: "Guest",
  avatarType: "initials",
};

export async function loadUserProfile(): Promise<UserProfile> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "profile", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        // New user — seed displayName from Firebase auth (e.g. Google display name)
        return {
          ...defaultProfile,
          displayName: user.displayName || defaultProfile.displayName,
        };
      }
    } catch (error) {
      console.error("Error loading profile from Firestore:", error);
      throw error;
    }
  }

  // Fallback to local storage for guests
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultProfile;
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;

    return {
      ...defaultProfile,
      ...parsed,
    };
  } catch {
    return defaultProfile;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "profile", "data");
      await setDoc(docRef, profile);
      return;
    } catch (error) {
      console.error("Error saving profile to Firestore:", error);
      throw error;
    }
  }

  // Fallback to local storage for guests
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore persistence errors for profile; UI will continue with in-memory state
  }
}
