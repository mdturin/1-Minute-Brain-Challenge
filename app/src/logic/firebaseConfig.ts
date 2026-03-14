// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = getAnalytics(app);

export const db = getFirestore(app);
