# Changelog — 1 Minute Brain Challenge

## [Unreleased] — 2026-03-26

### Auth & Onboarding Flow
- Added `LoginScreen` after onboarding with Google Sign-In and Guest (anonymous) options
- Added `ConsentScreen` (policy agreement) shown once after first login
- Added `UserInfoScreen` (age + searchable country dropdown) shown after consent
- Updated `App.tsx` initial route logic: checks `hasSeenOnboarding`, Firebase auth state, and `hasAcceptedPolicy` in sequence
- Updated `OnboardingScreen` to navigate to Login (not Home) at completion

### Google Sign-In
- Integrated `expo-auth-session/providers/google` for web + native OAuth
- Handles both `id_token` (native) and `access_token` (web-only) token flows
- Fetches display name + photo from Google userinfo API when only `access_token` available
- Added `signInWithGoogle`, `signInAsGuest`, `linkWithGoogle` to `auth.ts`

### Profile Screen
- Added Google Sign-In button to the logged-out auth form in ProfileScreen
- Added "Sign in with Google" upgrade banner for anonymous (Guest) users
- Age and country from UserInfoScreen now reflected in Profile edit fields
- Subscription section hidden entirely when user has no active subscription

### Avatar System
- Added 10 monster warrior emoji avatars: 👹 Oni, 👺 Goblin, 💀 Skull, 🤖 Robot, 👾 Monster, 🐲 Dragon, 🧟 Zombie, 🐺 Wolf, 🦂 Scorpion, 🦇 Bat
- Avatar deterministically assigned on first use (based on uid), user can change via picker modal
- Avatar picker: 2-column grid modal, selected avatar highlighted with indigo border + checkmark
- `avatarId` persisted to Firestore (signed-in) or AsyncStorage (guest) via `UserProfile`

### AdMob / Play Store Prep
- Replaced test AdMob IDs with real production IDs in `adsConfig.ts`
- Added `adsInit.native.ts` (real AdMob SDK init) and `adsInit.ts` (web no-op stub)
- Fixed Metro bundler crash on web caused by `expo-crypto` import in native-only module
- Target audience set to 13+ in Play Console (resolves Families Policy violations)
