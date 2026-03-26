# Feature Index — 1 Minute Brain Challenge

Quick reference for understanding what's implemented and where. Read this at the start of a session for fast context.

---

## Auth System

| Feature | File | Key Functions |
|---------|------|---------------|
| Email sign-up / sign-in | `app/src/logic/auth.ts` | `signUp`, `signIn` |
| Google Sign-In | `app/src/logic/auth.ts` | `signInWithGoogle(idToken, accessToken)` |
| Guest (anonymous) | `app/src/logic/auth.ts` | `signInAsGuest` |
| Link guest → Google | `app/src/logic/auth.ts` | `linkWithGoogle(idToken, accessToken)` |
| Sign out | `app/src/logic/auth.ts` | `signOut` |
| Auth state listener | `app/src/logic/auth.ts` | `onAuthStateChanged` |
| Current user sync | `app/src/logic/auth.ts` | `getCurrentUser` |
| Password reset | `app/src/logic/auth.ts` | `resetPassword` |

**Google OAuth notes:**
- Web returns `access_token` only (no `id_token`) — use Google userinfo API to fetch profile
- Native returns `id_token` via `androidClientId`
- `GoogleAuthProvider.credential(idToken, accessToken)` accepts both; pass whichever is available

---

## Navigation

| Screen | Route Name | When Shown |
|--------|-----------|------------|
| OnboardingScreen | `Onboarding` | First launch only (`hasSeenOnboarding !== 'true'`) |
| LoginScreen | `Login` | After onboarding or when not authenticated |
| ConsentScreen | `Consent` | After login, before Home, once (`hasAcceptedPolicy !== 'true'`) |
| UserInfoScreen | `UserInfo` | After consent (collects age + country) |
| HomeScreen | `Home` | Main app screen |
| GameScreen | `Game` | From Home; params: `{ difficulty, isDailyChallenge? }` |
| ProfileScreen | `Profile` | From Home nav |
| SettingsScreen | `Settings` | From Home nav |
| LeaderboardScreen | `Leaderboard` | From Home |
| DailyChallengeScreen | `DailyChallenge` | From Home |
| PaywallScreen | `Paywall` | From Home / Profile (modal) |
| PrivacyPolicyScreen | `PrivacyPolicy` | From Consent / Settings |
| TermsOfServiceScreen | `TermsOfService` | From Consent / Settings |
| AboutScreen | `About` | From Settings |

**Initial route logic** (`App.tsx`):
```
hasSeenOnboarding? no → Onboarding
                   yes → getCurrentUser()? no → Login
                                           yes → hasAcceptedPolicy? no → Consent
                                                                     yes → Home
```

---

## Profile & User Data

| Feature | File | Notes |
|---------|------|-------|
| Profile type | `app/src/storage/userProfile.ts` | `UserProfile { displayName, avatarType, avatarId?, age?, country? }` |
| Load profile | `app/src/storage/userProfile.ts` | `loadUserProfile()` — Firestore if signed in, AsyncStorage if guest |
| Save profile | `app/src/storage/userProfile.ts` | `saveUserProfile(profile)` |
| Firestore path | — | `users/{uid}/profile/data` |
| AsyncStorage key | — | `one-minute-brain-challenge/user-profile` |

---

## Avatar System

| Feature | File | Notes |
|---------|------|-------|
| AVATARS array | `app/src/screens/ProfileScreen.tsx` | 10 monster emoji; `{ id, emoji, bg }` |
| Default avatar | `ProfileScreen.tsx:getAvatar()` | Deterministic from `uid.charCodeAt(0) % 10` |
| Avatar picker | `ProfileScreen.tsx` | Modal, 2-column FlatList, saves immediately |
| Persistence | `userProfile.ts` | `avatarId` field in `UserProfile` |

Avatars: 👹 oni · 👺 goblin · 💀 skull · 🤖 robot · 👾 monster · 🐲 dragon · 🧟 zombie · 🐺 wolf · 🦂 scorpion · 🦇 bat

---

## Game Engine

| Feature | File | Notes |
|---------|------|-------|
| Puzzle types | `app/src/logic/puzzles/index.ts` | Exports all 7 puzzle generators |
| Mental math | `logic/puzzles/mentalMath.ts` | Arithmetic |
| Memory sequence | `logic/puzzles/memorySequence.ts` | Recall sequence |
| Word scramble | `logic/puzzles/wordScramble.ts` | Unscramble |
| Logic mini | `logic/puzzles/logicMini.ts` | True/false logic |
| Odd one out | `logic/puzzles/oddOneOut.ts` | Find outlier |
| Pattern visual | `logic/puzzles/patternVisual.ts` | Visual patterns |
| Symbol count | `logic/puzzles/symbolCount.ts` | Count symbols |
| Scoring | `logic/scoring.ts` | Score calculation |
| Difficulty | `logic/difficulty.ts` | Easy / Medium / Hard settings |
| Seeded RNG | `logic/seededRng.ts` | Deterministic puzzles (daily challenge) |

---

## Stats & Storage

| Feature | File | Key |
|---------|------|-----|
| Game stats | `storage/stats.ts` | Best score, games played, streaks, avg score |
| Energy | `storage/energy.ts` + `logic/useEnergy.tsx` | 50 max, +10/hr, ads give bonus |
| Daily challenge | `storage/dailyChallenge.ts` | Seeded by date |
| Leaderboard | `storage/leaderboard.ts` | Firestore-backed global scores |
| Subscription | `storage/subscription.ts` + `logic/useSubscription.tsx` | monthly / lifetime |

---

## Ads

| Feature | File | Notes |
|---------|------|-------|
| AdMob IDs | `logic/adsConfig.ts` | Real production IDs |
| Init (native) | `logic/adsInit.native.ts` | Called in `App.tsx` `useEffect` |
| Init (web) | `logic/adsInit.ts` | No-op stub |
| Banner (native) | `components/BannerAd.native.tsx` | Real banner |
| Banner (web) | `components/BannerAd.web.tsx` | Empty stub |
| Interstitial | `logic/ads.native.ts` | Shown between games |

**Platform split pattern:** Metro resolves `.native.ts` over `.ts` on native builds. Use this for any native-only SDK.

---

## Firebase

| Service | Usage |
|---------|-------|
| Auth | Email, Google, Anonymous |
| Firestore | User profiles, leaderboard scores |
| Hosting | Landing page, privacy policy, delete-account page |

Config: `app/src/logic/firebaseConfig.ts`

---

## AsyncStorage Keys

| Key | Purpose |
|-----|---------|
| `hasSeenOnboarding` | `'true'` after onboarding complete |
| `hasAcceptedPolicy` | `'true'` after consent screen agreed |
| `one-minute-brain-challenge/user-profile` | Guest profile fallback |

---

## Known TODOs / Not Yet Done

- IAP/Paywall UI hidden (`{isSubscribed ? ... : null}`) — pending store approval
- Anonymous auth must be enabled in Firebase Console for Guest login to work
- Release keystore SHA-1 must be added to Firebase Console for Google Sign-In on production builds
