import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../logic/firebaseConfig";
import { getCurrentUser } from "../logic/auth";
import { localDateString } from "../logic/dateUtils";

const STORAGE_KEY = "one-minute-brain-challenge/daily-challenge";
const MAX_HISTORY = 30;

export type DailyRecord = {
  date: string;
  completed: boolean;
  score: number;
};

export type DailyChallengeHistory = {
  records: DailyRecord[];
};

const defaultHistory: DailyChallengeHistory = { records: [] };

async function loadHistory(): Promise<DailyChallengeHistory> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "dailyChallenge", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as DailyChallengeHistory;
      }
      return defaultHistory;
    } catch {
      return defaultHistory;
    }
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultHistory;
    return { ...defaultHistory, ...JSON.parse(raw) } as DailyChallengeHistory;
  } catch {
    return defaultHistory;
  }
}

async function saveHistory(history: DailyChallengeHistory): Promise<void> {
  const user = getCurrentUser();
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid, "dailyChallenge", "data");
      await setDoc(docRef, history);
      return;
    } catch {
      // fall through to local
    }
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export async function getTodayRecord(): Promise<DailyRecord> {
  const today = localDateString();
  const history = await loadHistory();
  const existing = history.records.find((r) => r.date === today);
  return existing ?? { date: today, completed: false, score: 0 };
}

export async function markTodayCompleted(score: number): Promise<void> {
  const today = localDateString();
  const history = await loadHistory();
  const existingIdx = history.records.findIndex((r) => r.date === today);
  const record: DailyRecord = { date: today, completed: true, score };

  let records: DailyRecord[];
  if (existingIdx >= 0) {
    records = [...history.records];
    records[existingIdx] = record;
  } else {
    records = [record, ...history.records];
  }

  // Keep most recent MAX_HISTORY entries
  records = records.slice(0, MAX_HISTORY);

  await saveHistory({ records });
}

export async function getRecentHistory(days: number): Promise<DailyRecord[]> {
  const history = await loadHistory();
  const result: DailyRecord[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86_400_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const found = history.records.find((r) => r.date === dateStr);
    result.push(found ?? { date: dateStr, completed: false, score: 0 });
  }
  return result;
}
