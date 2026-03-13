import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'one-minute-brain-challenge/user-profile';

export type UserProfile = {
  displayName: string;
  avatarType: 'initials' | 'image';
  age?: number;
  country?: string;
};

const defaultProfile: UserProfile = {
  displayName: 'Guest',
  avatarType: 'initials',
};

export async function loadUserProfile(): Promise<UserProfile> {
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
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore persistence errors for profile; UI will continue with in-memory state
  }
}

