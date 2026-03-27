import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  orderBy,
  limit,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../logic/firebaseConfig";

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  country: string;
  bestScore: number;
  updatedAt: number;
  avatarId?: string;
};

function startOfWeekMs(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = (day === 0 ? 6 : day - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export async function upsertLeaderboardEntry(
  uid: string,
  entry: Omit<LeaderboardEntry, 'uid'>,
): Promise<void> {
  const docRef = doc(db, "leaderboard", uid);
  const existing = await getDoc(docRef);
  if (existing.exists() && (existing.data() as LeaderboardEntry).bestScore >= entry.bestScore) {
    return;
  }
  await setDoc(docRef, { uid, ...entry });
}

export async function fetchTopLeaderboard(limitCount: number): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("bestScore", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}

export async function fetchWeeklyLeaderboard(limitCount: number): Promise<LeaderboardEntry[]> {
  const weekStart = startOfWeekMs();
  // Only orderBy the inequality field (updatedAt) to avoid requiring a composite index.
  // Re-sort by bestScore in JS after fetching.
  const q = query(
    collection(db, "leaderboard"),
    where("updatedAt", ">=", weekStart),
    orderBy("updatedAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);
  return entries.sort((a, b) => b.bestScore - a.bestScore);
}

export function nextWeekResetMs(): number {
  return startOfWeekMs() + 7 * 24 * 60 * 60 * 1000;
}

// Returns all-time rank only. For weekly rank, derive it from the fetched weekly list.
export async function fetchMyRank(uid: string, myBestScore: number): Promise<number> {
  const q = query(
    collection(db, "leaderboard"),
    where("bestScore", ">", myBestScore),
  );
  const countSnap = await getCountFromServer(q);
  return countSnap.data().count + 1;
}

// Computes weekly rank from an already-fetched sorted weekly list.
// Avoids a second Firestore query with multi-field inequality (no composite index needed).
export function computeWeeklyRank(entries: LeaderboardEntry[], myBestScore: number): number {
  return entries.filter((e) => e.bestScore > myBestScore).length + 1;
}
