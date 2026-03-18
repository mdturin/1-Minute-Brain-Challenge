import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getCurrentUser } from "./auth";

const STORAGE_KEYS = {
  profile: "one-minute-brain-challenge/user-profile",
  stats: "one-minute-brain-challenge/stats",
  energy: "one-minute-brain-challenge/energy",
  dailyChallenge: "one-minute-brain-challenge/daily-challenge",
  subscription: "one-minute-brain-challenge/subscription",
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
  const localDailyChallenge = await AsyncStorage.getItem(STORAGE_KEYS.dailyChallenge);
  const localSubscription = await AsyncStorage.getItem(STORAGE_KEYS.subscription);

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
    if (localDailyChallenge) {
      const dailyChallengeData = JSON.parse(localDailyChallenge);
      await setDoc(doc(db, "users", uid, "dailyChallenge", "data"), dailyChallengeData);
    }
    if (localSubscription) {
      const subscriptionData = JSON.parse(localSubscription);
      await setDoc(doc(db, "users", uid, "subscription", "data"), subscriptionData);
    }
  } catch (error) {
    console.error("Error migrating data to cloud:", error);
  }
}
