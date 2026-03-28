import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously as firebaseSignInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  linkWithCredential,
  linkWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { migrateLocalDataToCloud } from "./migrate";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

export const signUp = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await migrateLocalDataToCloud();
    } catch (migrationError) {
      console.warn("Migration failed after sign up:", migrationError);
    }
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      isAnonymous: false,
    };
  } catch (error) {
    console.error("Sign up failed:", error);
    throw error;
  }
};

export const signIn = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    try {
      await migrateLocalDataToCloud();
    } catch (migrationError) {
      console.warn("Migration failed after sign in:", migrationError);
    }
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      isAnonymous: false,
    };
  } catch (error) {
    console.error("Sign in failed:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): AuthUser | null => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
    };
  }
  return null;
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error("Firebase is not configured");
  await sendPasswordResetEmail(auth, email);
};

export const signInAsGuest = async (): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  const result = await firebaseSignInAnonymously(auth);
  try { await migrateLocalDataToCloud(); } catch {}
  return { uid: result.user.uid, email: null, displayName: 'Guest', isAnonymous: true };
};

async function fetchAndApplyGoogleProfile(user: any, accessToken: string) {
  try {
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const info = await resp.json();
    await updateProfile(user, {
      displayName: info.name ?? info.email ?? null,
      photoURL: info.picture ?? null,
    });
  } catch {}
}

export const signInWithGoogle = async (idToken: string | null, accessToken: string | null = null): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  if (accessToken && !result.user.displayName) {
    await fetchAndApplyGoogleProfile(result.user, accessToken);
  }
  try { await migrateLocalDataToCloud(); } catch {}
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
  };
};

export const linkWithGoogle = async (idToken: string | null, accessToken: string | null = null): Promise<AuthUser> => {
  if (!auth || !auth.currentUser) throw new Error("No user signed in");
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await linkWithCredential(auth.currentUser, credential);
  if (accessToken && !result.user.displayName) {
    await fetchAndApplyGoogleProfile(result.user, accessToken);
  }
  try { await migrateLocalDataToCloud(); } catch {}
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
  };
};

export const signInWithGoogleWeb = async (): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  try { await migrateLocalDataToCloud(); } catch {}
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
  };
};

export const linkWithGoogleWeb = async (): Promise<AuthUser> => {
  if (!auth || !auth.currentUser) throw new Error("No user signed in");
  const provider = new GoogleAuthProvider();
  const result = await linkWithPopup(auth.currentUser, provider);
  try { await migrateLocalDataToCloud(); } catch {}
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
  };
};

export const onAuthStateChanged = (
  callback: (user: AuthUser | null) => void,
) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onFirebaseAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
      });
    } else {
      callback(null);
    }
  });
};
