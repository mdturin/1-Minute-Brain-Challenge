// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import Constants from "expo-constants";

const expoExtra = (Constants.expoConfig?.extra as any) ?? {};
const firebaseEnv = (expoExtra.firebase ?? {}) as Record<string, string>;

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey ?? process.env.FIREBASE_API_KEY,
  authDomain: firebaseEnv.authDomain ?? process.env.FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnv.projectId ?? process.env.FIREBASE_PROJECT_ID,
  storageBucket: firebaseEnv.storageBucket ?? process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnv.messagingSenderId ?? process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnv.appId ?? process.env.FIREBASE_APP_ID,
  measurementId: firebaseEnv.measurementId ?? process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase – gracefully handle missing config (e.g. local dev without .env)

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = hasConfig ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

export const analytics = (() => {
  if (!app) return null;
  try {
    return getAnalytics(app);
  } catch {
    return null;
  }
})();

export const db = app ? getFirestore(app) : null;
