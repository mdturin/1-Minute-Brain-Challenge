import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../logic/firebaseConfig";
import { getCurrentUser } from "../logic/auth";
import { localDateString, yesterdayLocalDateString } from "../logic/dateUtils";
import { loadUserProfile } from "./userProfile";
import { upsertLeaderboardEntry } from "./leaderboard";

const STORAGE_KEY = "one-minute-brain-challenge/stats";

export type GameStats = {
  bestScore: number;
  gamesPlayed: number;
  totalScore: number;
  bestStreak: number;
  currentDayStreak: number;
  longestDayStreak: number;
  lastPlayedDate: string;
};

const defaultStats: GameStats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
  bestStreak: 0,
  currentDayStreak: 0,
  longestDayStreak: 0,
  lastPlayedDate: '',
};

function advanceDayStreak(
  current: Pick<GameStats, 'currentDayStreak' | 'longestDayStreak' | 'lastPlayedDate'>,
  today: string,
  yesterday: string,
): Pick<GameStats, 'currentDayStreak' | 'longestDayStreak' | 'lastPlayedDate'> {
  if (current.lastPlayedDate === today) return current;
  const next = current.lastPlayedDate === yesterday
    ? current.currentDayStreak + 1
    : 1;
  return {
    currentDayStreak: next,
    longestDayStreak: Math.max(current.longestDayStreak, next),
    lastPlayedDate: today,
  };
}

export async function loadStats(): Promise<GameStats> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "stats", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...defaultStats, ...docSnap.data() } as GameStats;
      } else {
        return defaultStats;
      }
    } catch (error) {
      console.error("Error loading stats from Firestore:", error);
      throw error;
    }
  }

  // Fallback to local storage for guests
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStats;
    }
    const parsed = JSON.parse(raw) as GameStats;
    return {
      ...defaultStats,
      ...parsed,
    };
  } catch {
    return defaultStats;
  }
}

export async function updateStats(params: {
  lastScore: number;
  lastMaxStreak: number;
}): Promise<void> {
  const current = await loadStats();
  const today = localDateString();
  const yesterday = yesterdayLocalDateString();
  const streakUpdate = advanceDayStreak(current, today, yesterday);

  const isNewBest = params.lastScore > current.bestScore;
  const next: GameStats = {
    bestScore: Math.max(current.bestScore, params.lastScore),
    gamesPlayed: current.gamesPlayed + 1,
    totalScore: current.totalScore + params.lastScore,
    bestStreak: Math.max(current.bestStreak, params.lastMaxStreak),
    ...streakUpdate,
  };

  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "stats", "data");
      await setDoc(docRef, next);
    } catch (error) {
      console.error("Error saving stats to Firestore:", error);
      throw error;
    }

    // Fire-and-forget leaderboard upsert when a new best score is achieved
    if (isNewBest) {
      void (async () => {
        try {
          const profile = await loadUserProfile();
          await upsertLeaderboardEntry(user.uid, {
            displayName: profile.displayName || 'Anonymous',
            country: profile.country ?? '',
            bestScore: next.bestScore,
            updatedAt: Date.now(),
          });
        } catch {
          // leaderboard failure must not block gameplay
        }
      })();
    }
    return;
  }

  // Fallback to local storage for guests
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors in gameplay
  }
}
