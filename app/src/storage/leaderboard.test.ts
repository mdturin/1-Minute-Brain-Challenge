/// <reference types="jest" />

// ─── Firebase mocks ───────────────────────────────────────────────────────────

jest.mock("firebase/analytics", () => ({ getAnalytics: jest.fn(() => ({})) }));
jest.mock("firebase/app", () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock("firebase/auth", () => ({ getAuth: jest.fn(() => ({ currentUser: null })) }));

// Firestore mock — we control every function individually per test
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockGetCountFromServer = jest.fn();
const mockQuery = jest.fn((...args: unknown[]) => ({ _args: args }));
const mockCollection = jest.fn(() => "col-ref");
const mockDoc = jest.fn(() => "doc-ref");
const mockOrderBy = jest.fn((field: string, dir?: string) => ({ _ob: field, _dir: dir }));
const mockWhere = jest.fn((field: string, op: string, val: unknown) => ({ _field: field, _op: op, _val: val }));
const mockLimit = jest.fn((n: number) => ({ _limit: n }));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  getCountFromServer: (...args: unknown[]) => mockGetCountFromServer(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
}));

import {
  upsertLeaderboardEntry,
  fetchTopLeaderboard,
  fetchWeeklyLeaderboard,
  fetchMyRank,
  computeWeeklyRank,
  nextWeekResetMs,
  type LeaderboardEntry,
} from "./leaderboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    uid: "user1",
    displayName: "Test User",
    country: "US",
    bestScore: 100,
    updatedAt: Date.now(),
    ...overrides,
  };
}

function makeSnap(entries: LeaderboardEntry[]) {
  return { docs: entries.map((e) => ({ data: () => e })) };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("upsertLeaderboardEntry", () => {
  test("writes when no existing doc", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    mockSetDoc.mockResolvedValueOnce(undefined);

    await upsertLeaderboardEntry("u1", makeEntry({ uid: "u1", bestScore: 50 }));
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  test("writes when new score is higher than existing", async () => {
    const existing = makeEntry({ bestScore: 40 });
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => existing });
    mockSetDoc.mockResolvedValueOnce(undefined);

    await upsertLeaderboardEntry("u1", makeEntry({ bestScore: 80 }));
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  test("skips write when existing score is equal or higher", async () => {
    const existing = makeEntry({ bestScore: 100 });
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => existing });

    await upsertLeaderboardEntry("u1", makeEntry({ bestScore: 90 }));
    expect(mockSetDoc).not.toHaveBeenCalled();

    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => existing });
    await upsertLeaderboardEntry("u1", makeEntry({ bestScore: 100 }));
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

describe("fetchTopLeaderboard", () => {
  test("returns entries from firestore in order", async () => {
    const entries = [
      makeEntry({ uid: "a", bestScore: 200 }),
      makeEntry({ uid: "b", bestScore: 150 }),
    ];
    mockGetDocs.mockResolvedValueOnce(makeSnap(entries));

    const result = await fetchTopLeaderboard(50);
    expect(result).toHaveLength(2);
    expect(result[0]!.bestScore).toBe(200);
  });

  test("returns empty array when no entries", async () => {
    mockGetDocs.mockResolvedValueOnce(makeSnap([]));
    const result = await fetchTopLeaderboard(50);
    expect(result).toEqual([]);
  });
});

describe("fetchWeeklyLeaderboard", () => {
  test("returns entries sorted by bestScore descending", async () => {
    // Simulate Firestore returning entries ordered by updatedAt (not bestScore)
    const entries = [
      makeEntry({ uid: "a", bestScore: 50, updatedAt: Date.now() - 1000 }),
      makeEntry({ uid: "b", bestScore: 200, updatedAt: Date.now() - 500 }),
      makeEntry({ uid: "c", bestScore: 120, updatedAt: Date.now() }),
    ];
    mockGetDocs.mockResolvedValueOnce(makeSnap(entries));

    const result = await fetchWeeklyLeaderboard(50);
    expect(result[0]!.bestScore).toBe(200);
    expect(result[1]!.bestScore).toBe(120);
    expect(result[2]!.bestScore).toBe(50);
  });

  test("query uses orderBy updatedAt (not a compound bestScore orderBy)", async () => {
    mockGetDocs.mockResolvedValueOnce(makeSnap([]));
    await fetchWeeklyLeaderboard(50);

    // Should only call orderBy once (for updatedAt), not twice
    expect(mockOrderBy).toHaveBeenCalledTimes(1);
    expect(mockOrderBy).toHaveBeenCalledWith("updatedAt", "desc");
  });

  test("query filters by updatedAt >= start of week", async () => {
    mockGetDocs.mockResolvedValueOnce(makeSnap([]));
    await fetchWeeklyLeaderboard(50);

    const whereCall = mockWhere.mock.calls.find(([field]) => field === "updatedAt");
    expect(whereCall).toBeDefined();
    expect(whereCall![1]).toBe(">=");
    // The timestamp should be within the past 7 days
    expect(whereCall![2]).toBeGreaterThan(Date.now() - 7 * 24 * 60 * 60 * 1000);
  });
});

describe("fetchMyRank", () => {
  test("counts entries with higher bestScore and adds 1", async () => {
    mockGetCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 4 }) });
    const rank = await fetchMyRank("u1", 100);
    expect(rank).toBe(5);

    // Should only filter by bestScore — no updatedAt filter (avoids multi-field inequality)
    const whereCalls = mockWhere.mock.calls;
    const hasUpdatedAtFilter = whereCalls.some(([field]) => field === "updatedAt");
    expect(hasUpdatedAtFilter).toBe(false);
  });

  test("rank 1 when no one has a higher score", async () => {
    mockGetCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 0 }) });
    const rank = await fetchMyRank("u1", 9999);
    expect(rank).toBe(1);
  });
});

describe("computeWeeklyRank", () => {
  test("returns 1 when no one has a higher score", () => {
    const entries = [
      makeEntry({ uid: "a", bestScore: 50 }),
      makeEntry({ uid: "b", bestScore: 80 }),
    ];
    expect(computeWeeklyRank(entries, 100)).toBe(1);
  });

  test("counts entries with higher score and adds 1", () => {
    const entries = [
      makeEntry({ uid: "a", bestScore: 200 }),
      makeEntry({ uid: "b", bestScore: 150 }),
      makeEntry({ uid: "c", bestScore: 80 }),
    ];
    expect(computeWeeklyRank(entries, 100)).toBe(3);
  });

  test("returns 1 for empty list", () => {
    expect(computeWeeklyRank([], 50)).toBe(1);
  });
});

describe("nextWeekResetMs", () => {
  test("is exactly 7 days after start of current week", () => {
    const reset = nextWeekResetMs();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    // Reset should be between 1 and 7 days from now
    expect(reset).toBeGreaterThan(Date.now());
    expect(reset).toBeLessThanOrEqual(Date.now() + sevenDaysMs);
  });

  test("falls on a Monday at midnight (00:00:00)", () => {
    const reset = new Date(nextWeekResetMs());
    expect(reset.getDay()).toBe(1); // Monday
    expect(reset.getHours()).toBe(0);
    expect(reset.getMinutes()).toBe(0);
    expect(reset.getSeconds()).toBe(0);
    expect(reset.getMilliseconds()).toBe(0);
  });
});
