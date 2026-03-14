// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "",

  authDomain: "",

  projectId: "",

  storageBucket: "",

  messagingSenderId: "",

  appId: "",

  measurementId: "",
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = getAnalytics(app);

export const db = getFirestore(app);
