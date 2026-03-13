// Firebase configuration
// Replace with your Firebase project config from Firebase Console
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCg8CjmsNN2pQdvHDwzooG1_ve_o5-7VQA",

  authDomain: "minute-brain-challange.firebaseapp.com",

  projectId: "minute-brain-challange",

  storageBucket: "minute-brain-challange.firebasestorage.app",

  messagingSenderId: "1097445883559",

  appId: "1:1097445883559:web:cb4f26e8c549a8d591e582",

  measurementId: "G-B8XJHQ1FMC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
