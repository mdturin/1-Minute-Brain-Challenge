import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously as firebaseSignInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { migrateLocalDataToCloud } from "./migrate";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const signUp = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    try {
      await migrateLocalDataToCloud();
    } catch (migrationError) {
      console.warn("Migration failed after sign up:", migrationError);
      // Continue anyway, as user is created
    }
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    try {
      await migrateLocalDataToCloud();
    } catch (migrationError) {
      console.warn("Migration failed after sign in:", migrationError);
      // Continue anyway
    }
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
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
  try {
    await migrateLocalDataToCloud();
  } catch {}
  return { uid: result.user.uid, email: null, displayName: 'Guest' };
};

export const signInWithGoogle = async (idToken: string | null, accessToken: string | null = null): Promise<AuthUser> => {
  if (!auth) throw new Error("Firebase is not configured");
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  // If signed in via access token only, Firebase won't populate displayName/photoURL.
  // Fetch from Google userinfo endpoint and update the profile.
  if (accessToken && !result.user.displayName) {
    try {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const info = await resp.json();
      await updateProfile(result.user, {
        displayName: info.name ?? info.email ?? null,
        photoURL: info.picture ?? null,
      });
    } catch {}
  }
  try {
    await migrateLocalDataToCloud();
  } catch {}
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
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
      });
    } else {
      callback(null);
    }
  });
};
