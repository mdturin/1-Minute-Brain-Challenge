import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_KEY = 'storeReviewState';
const GAMES_BEFORE_PROMPT = 5;

/**
 * Show the native app review dialog after the user's Nth game.
 * Only prompts once — subsequent calls are no-ops.
 */
export async function maybeRequestReview(gamesPlayed: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_KEY);
    const state = raw ? JSON.parse(raw) : { prompted: false };

    if (state.prompted) return;
    if (gamesPlayed < GAMES_BEFORE_PROMPT) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(
      REVIEW_KEY,
      JSON.stringify({ prompted: true, at: new Date().toISOString() }),
    );
  } catch {
    // Silently fail — review prompt is non-critical
  }
}
