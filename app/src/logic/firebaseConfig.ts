// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import Constants from "expo-constants";

const expoExtra = (Constants.expoConfig?.extra as any) ?? {};
const firebaseEnv = (expoExtra.firebase ?? {}) as Record<string, string>;

// Fallback for test environments that may not have expo constants available.
const env = (key: string) => firebaseEnv[key] ?? process.env[key];

const firebaseConfig = {
  apiKey: env("FIREBASE_API_KEY"),
  authDomain: env("FIREBASE_AUTH_DOMAIN"),
  projectId: env("FIREBASE_PROJECT_ID"),
  storageBucket: env("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("FIREBASE_APP_ID"),
  measurementId: env("FIREBASE_MEASUREMENT_ID"),
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = getAnalytics(app);

export const db = getFirestore(app);
