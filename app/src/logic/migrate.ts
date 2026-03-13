import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getCurrentUser } from "./auth";

const STORAGE_KEYS = {
  profile: "one-minute-brain-challenge/user-profile",
  stats: "one-minute-brain-challenge/stats",
  energy: "one-minute-brain-challenge/energy",
};

export async function migrateLocalDataToCloud() {
  const user = getCurrentUser();
  if (!user) return;

  const uid = user.uid;

  // Check if already migrated or has data
  try {
    const profileDoc = await getDoc(doc(db, "users", uid, "profile", "data"));
    const statsDoc = await getDoc(doc(db, "users", uid, "stats", "data"));
    const energyDoc = await getDoc(doc(db, "users", uid, "energy", "data"));

    if (profileDoc.exists() && statsDoc.exists() && energyDoc.exists()) {
      // Already has cloud data, skip migration
      return;
    }
  } catch (error) {
    console.error("Error checking cloud data:", error);
    return;
  }

  // Load local data
  const localProfile = await AsyncStorage.getItem(STORAGE_KEYS.profile);
  const localStats = await AsyncStorage.getItem(STORAGE_KEYS.stats);
  const localEnergy = await AsyncStorage.getItem(STORAGE_KEYS.energy);

  // Save to cloud
  try {
    if (localProfile) {
      const profileData = JSON.parse(localProfile);
      await setDoc(doc(db, "users", uid, "profile", "data"), profileData);
    }
    if (localStats) {
      const statsData = JSON.parse(localStats);
      await setDoc(doc(db, "users", uid, "stats", "data"), statsData);
    }
    if (localEnergy) {
      const energyData = JSON.parse(localEnergy);
      await setDoc(doc(db, "users", uid, "energy", "data"), energyData);
    }
  } catch (error) {
    console.error("Error migrating data to cloud:", error);
  }
}
