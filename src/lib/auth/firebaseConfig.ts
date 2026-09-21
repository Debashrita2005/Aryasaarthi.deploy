// AryaSaarthi — Firebase Authentication Configuration & Zero-Cost Auth Helper
// Supports 100% Free Google Sign-In & 10,000 Free Phone SMS/month via Firebase Spark Plan

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAQzqortg_oY7CYKP93Li4IzXv7UuzZ_aI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aaryasarthi-f0ba4.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aaryasarthi-f0ba4',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aaryasarthi-f0ba4.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '850338555675',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:850338555675:web:d2aa555890b30097cb95be',
};

/**
 * Checks if real Firebase credentials are provided in the environment.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('placeholder') &&
    !firebaseConfig.apiKey.includes('your-')
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!auth && isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      auth.useDeviceLanguage();
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (err) {
      console.warn('[Firebase Auth] Failed to initialize Firebase:', err);
    }
  }
  return auth;
}

if (typeof window !== 'undefined') {
  getFirebaseAuth();
}

export { app, auth, googleProvider };

/**
 * Initialize invisible reCAPTCHA on a DOM container (Required for Free Firebase Phone Auth)
 */
export function setupRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) return null;

  try {
    const existingElement = document.getElementById(containerId);
    if (!existingElement) {
      console.warn(`[reCAPTCHA] Container #${containerId} not found in DOM.`);
      return null;
    }

    // Safely clear any previous reCAPTCHA instance to prevent duplicate widget errors
    if ((window as any)._aryaRecaptchaVerifier) {
      try {
        (window as any)._aryaRecaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      (window as any)._aryaRecaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(currentAuth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - allow phone verification
      },
      'expired-callback': () => {
        console.warn('[reCAPTCHA] Verification expired, please try again.');
      },
    });

    (window as any)._aryaRecaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.warn('[Firebase Auth] Error setting up RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Send real carrier SMS OTP to an Indian phone number via Firebase Spark (Free up to 10k/mo)
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    throw new Error('Firebase Auth is not initialized. Check your environment variables.');
  }

  // Format to E.164 (e.g. +919876543210)
  let e164 = phoneNumber.replace(/[\s\-\(\)]/g, '');
  if (!e164.startsWith('+')) {
    if (e164.length === 10) {
      e164 = `+91${e164}`;
    } else if (e164.startsWith('91') && e164.length === 12) {
      e164 = `+${e164}`;
    }
  }

  return await signInWithPhoneNumber(currentAuth, e164, verifier);
}

/**
 * 100% Free Google Sign-In via Firebase / Google Identity
 */
export async function signInWithGooglePopup(): Promise<UserCredential> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    throw new Error('Firebase Auth is not initialized. Check your environment variables.');
  }
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return await signInWithPopup(currentAuth, googleProvider);
}
