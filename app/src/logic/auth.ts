import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
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
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): AuthUser | null => {
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

export const onAuthStateChanged = (
  callback: (user: AuthUser | null) => void,
) => {
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
