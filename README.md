# 1 Minute Brain Challenge

A React Native + Expo brain-training game for Android. Players solve a variety of mini-puzzles within 60 seconds, competing on leaderboards and tracking daily streaks.

## Features

- **7 puzzle types** — Mental Math, Memory Sequence, Word Scramble, Logic Mini, Odd One Out, Pattern Visual, Symbol Count
- **Auth** — Google Sign-In, email/password, Guest (anonymous) with upgrade path
- **Leaderboard** — global Firebase Firestore-backed scores
- **Daily Challenge** — seeded puzzle set, same for all players each day
- **Energy system** — 50 max, refills 10/hr, bonus from rewarded ads
- **Profile** — monster warrior emoji avatars (10 choices), stats, age/country
- **Subscription** — monthly / lifetime for unlimited energy (IAP)
- **Ads** — Google AdMob banner + interstitial (native only)

## Tech Stack

| Area | Tool |
|------|------|
| Framework | React Native + Expo SDK |
| Language | TypeScript |
| Auth | Firebase Auth (email, Google, anonymous) |
| Database | Firebase Firestore + AsyncStorage |
| Ads | Google AdMob (`react-native-google-mobile-ads`) |
| Navigation | React Navigation (native stack) |
| Build | EAS Build |
| Hosting | Firebase Hosting |

## Getting Started

```bash
cd app
npm install
npx expo start        # dev server
npx expo start --web  # web preview
```

Production build:
```bash
eas build --platform android --profile production
```

## Navigation Flow

```
First launch:   Onboarding (3 slides) → Login → Consent → UserInfo → Home
Return launch:  Auth check → Home (signed in) | Login (signed out)
```

## Project Structure

```
app/
├── App.tsx                        # Root navigator + initial route logic
└── src/
    ├── screens/
    │   ├── OnboardingScreen.tsx   # 3-step intro carousel
    │   ├── LoginScreen.tsx        # Google / Guest login
    │   ├── ConsentScreen.tsx      # Policy agreement (once)
    │   ├── UserInfoScreen.tsx     # Age + country collection
    │   ├── HomeScreen.tsx         # Difficulty picker, daily challenge, energy
    │   ├── GameScreen.tsx         # 60-second puzzle runner
    │   ├── DailyChallengeScreen.tsx
    │   ├── LeaderboardScreen.tsx
    │   ├── ProfileScreen.tsx      # Avatar, stats, auth, subscription
    │   ├── SettingsScreen.tsx
    │   ├── PaywallScreen.tsx      # Subscription / lifetime purchase (modal)
    │   ├── AboutScreen.tsx
    │   ├── PrivacyPolicyScreen.tsx
    │   └── TermsOfServiceScreen.tsx
    ├── components/
    │   ├── BannerAd.native.tsx    # Real AdMob banner
    │   ├── BannerAd.web.tsx       # Web stub (no-op)
    │   ├── PrimaryButton.tsx
    │   ├── TimerBar.tsx
    │   ├── ScoreDisplay.tsx
    │   └── puzzles/               # Individual puzzle UI components
    ├── logic/
    │   ├── auth.ts                # Firebase auth functions
    │   ├── firebaseConfig.ts      # Firebase init
    │   ├── adsConfig.ts           # AdMob unit IDs (production)
    │   ├── adsInit.native.ts      # AdMob SDK init (native)
    │   ├── adsInit.ts             # Web no-op stub
    │   ├── useEnergy.tsx          # Energy system hook
    │   ├── useSubscription.tsx    # IAP subscription hook
    │   ├── migrate.ts             # Local → Firestore data migration on login
    │   ├── scoring.ts             # Score calculation
    │   ├── difficulty.ts          # Difficulty settings
    │   └── puzzles/               # Puzzle generation logic (7 types)
    └── storage/
        ├── userProfile.ts         # Profile read/write (Firestore or AsyncStorage)
        ├── stats.ts               # Game stats persistence
        ├── energy.ts              # Energy persistence
        ├── leaderboard.ts         # Firestore-backed leaderboard
        ├── dailyChallenge.ts      # Daily challenge state
        └── subscription.ts        # Subscription state
```

## Avatar System

10 monster warrior emoji avatars — assigned deterministically on first use, changeable from Profile:

👹 Oni · 👺 Goblin · 💀 Skull · 🤖 Robot · 👾 Monster · 🐲 Dragon · 🧟 Zombie · 🐺 Wolf · 🦂 Scorpion · 🦇 Bat

## Play Store Publishing Checklist

- [x] Real AdMob IDs configured
- [x] Target audience: 13+
- [x] Firebase Hosting (privacy policy, delete-account page)
- [ ] Enable Anonymous auth in Firebase Console
- [ ] Add release keystore SHA-1 to Firebase Console
- [ ] `eas build --platform android --profile production`
- [ ] Upload AAB to Play Console
- [ ] Store listing (description, screenshots, privacy URL)
- [ ] Content rating (IARC) + Data Safety section
- [ ] Submit for review

See `CHANGELOG.md` for detailed change history and `FEATURE_INDEX.md` for a full feature/file reference.
