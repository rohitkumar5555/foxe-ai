import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 1. Standard Google Auth Provider for basic app sign-in (Non-sensitive scopes only)
// DOES NOT request restricted Gmail scopes on login, preventing Google Error 403 "Access blocked: App has not completed verification"
const loginProvider = new GoogleAuthProvider();
loginProvider.addScope('email');
loginProvider.addScope('profile');
loginProvider.addScope('openid');
loginProvider.setCustomParameters({
  prompt: 'select_account',
});

// 2. Dedicated Gmail OAuth Provider with restricted scopes (Requested on-demand in Connected Apps)
const gmailProvider = new GoogleAuthProvider();
gmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');
gmailProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
gmailProvider.setCustomParameters({
  prompt: 'consent select_account',
});

// In-memory token cache (never stored in localStorage/sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface AuthSessionData {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  };
  accessToken?: string;
}

/**
 * Initialize auth listener
 */
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-in with account picker (Standard non-sensitive profile scopes)
 * Works for any Google account without triggering Google Error 403 access_denied
 */
export const googleSignIn = async (): Promise<AuthSessionData> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, loginProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || undefined;

    if (accessToken) {
      cachedAccessToken = accessToken;
    }

    return {
      user: {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        photoURL: result.user.photoURL || undefined,
      },
      accessToken,
    };
  } catch (err: any) {
    console.error('Google Sign In error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Perform dedicated Gmail OAuth Authorization (Restricted scopes: gmail.send, gmail.readonly)
 * Invoked on-demand in Connected Apps or when sending background emails
 */
export const authorizeGmail = async (): Promise<AuthSessionData> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Google Gmail OAuth succeeded but no access token was returned.');
    }

    cachedAccessToken = accessToken;

    return {
      user: {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        photoURL: result.user.photoURL || undefined,
      },
      accessToken,
    };
  } catch (err: any) {
    console.error('Gmail Authorization error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory OAuth access token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Update cached token (e.g. from session refresh)
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out from Firebase and clear tokens
 */
export const signOutFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};
