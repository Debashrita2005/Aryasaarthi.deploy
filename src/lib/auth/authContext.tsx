'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isFirebaseConfigured,
  signInWithGooglePopup,
  setupRecaptcha,
  sendFirebasePhoneOtp,
} from './firebaseConfig';
import type { ConfirmationResult } from 'firebase/auth';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  authMethod: 'google' | 'otp';
  role: 'citizen' | 'beneficiary' | 'admin';
  gender?: string;
  state?: string;
  district?: string;
  profileCompleted?: boolean;
  verified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLiveFirebaseMode: boolean;
  loginWithGoogle: (customProfile?: Partial<AuthUser>) => Promise<AuthUser>;
  sendMobileOtp: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyMobileOtp: (phoneNumber: string, code: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
  completeUserProfile: (data: { name: string; gender: string; state: string; district: string }) => Promise<void>;
}

const STORAGE_KEY = 'sahayak_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLiveFirebaseMode, setIsLiveFirebaseMode] = useState<boolean>(false);

  // Check if live Firebase credentials are present
  useEffect(() => {
    setIsLiveFirebaseMode(isFirebaseConfigured());
  }, []);

  // Load persisted session from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to restore auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session to localStorage
  const persistUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      try {
        if (newUser) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Failed to persist auth session:', err);
      }
    }
  };

  // Upsert user in database for persistent history (fire-and-forget)
  const upsertUserInDb = async (authUser: AuthUser) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authUser.id,
          name: authUser.name,
          phone: authUser.phone,
          email: authUser.email,
          authMethod: authUser.authMethod,
          role: authUser.role,
          gender: authUser.gender,
          state: authUser.state,
          district: authUser.district,
          profileCompleted: authUser.profileCompleted ?? false,
        }),
      });
    } catch (err) {
      // Non-critical: local session still works even if DB sync fails
      console.warn('Failed to sync user to DB:', err);
    }
  };

  // Google Sign-in handler (Live Firebase Google OAuth)
  const loginWithGoogle = async (customProfile?: Partial<AuthUser>): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase Auth is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.');
      }
      const cred = await signInWithGooglePopup();
      const fbUser = cred.user;
      const googleUser: AuthUser = {
        id: fbUser.uid || `google_${Date.now()}`,
        name: fbUser.displayName || customProfile?.name || 'Google Citizen User',
        email: fbUser.email || customProfile?.email || undefined,
        phone: fbUser.phoneNumber || customProfile?.phone || undefined,
        avatar: fbUser.photoURL || customProfile?.avatar || undefined,
        authMethod: 'google',
        role: customProfile?.role || 'beneficiary',
        state: customProfile?.state || 'Uttar Pradesh',
        district: customProfile?.district || 'Lucknow',
        verified: true,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        ...customProfile,
      };
      persistUser(googleUser);
      upsertUserInDb(googleUser);
      setIsLoading(false);
      return googleUser;
    } catch (err: any) {
      setIsLoading(false);
      console.error('[Google Auth Error]:', err);
      const errorMsg = err?.code ? `Firebase Auth (${err.code}): ${err.message}` : (err?.message || 'Google Sign-in failed');
      throw new Error(errorMsg);
    }
  };

  // Send Mobile OTP (Dispatches Real Carrier SMS to phone via Firebase Phone Auth)
  const sendMobileOtp = async (
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    const nationalNumber = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;

    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return {
        success: false,
        message: 'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit Indian mobile number).',
      };
    }

    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase Auth is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.',
      };
    }

    try {
      const verifier = setupRecaptcha('recaptcha-container');
      if (!verifier) {
        return {
          success: false,
          message: 'Failed to initialize reCAPTCHA verifier. Please refresh the page and try again.',
        };
      }
      const confirmation = await sendFirebasePhoneOtp(`+91${nationalNumber}`, verifier);
      setConfirmationResult(confirmation);
      return {
        success: true,
        message: `ओटीपी एसएमएस मोबाइल नंबर +91 ${nationalNumber} पर भेज दिया गया है। (OTP sent via SMS).`,
      };
    } catch (fbErr: any) {
      console.error('[Firebase Phone Auth Error]:', fbErr);
      const code = fbErr?.code || 'auth/sms-failed';
      const msg = fbErr?.message || 'Failed to dispatch SMS';
      return {
        success: false,
        message: `Firebase SMS Error (${code}): ${msg}`,
      };
    }
  };

  // Verify Mobile OTP
  const verifyMobileOtp = async (
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    const nationalNumber = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;

    if (!code || code.length !== 6) {
      return {
        success: false,
        error: 'कृपया 6-अंकीय ओटीपी दर्ज करें (Please enter 6-digit OTP).',
      };
    }

    if (!confirmationResult) {
      return {
        success: false,
        error: 'No active OTP verification session found. Please request a new OTP.',
      };
    }

    try {
      const cred = await confirmationResult.confirm(code);
      const fbUser = cred.user;
      const citizenUser: AuthUser = {
        id: fbUser.uid || `fb_phone_${Date.now()}`,
        name: `नागरिक (Citizen) +91 ${nationalNumber.slice(0, 5)}...`,
        phone: fbUser.phoneNumber || `+91 ${nationalNumber}`,
        authMethod: 'otp',
        role: 'beneficiary',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      persistUser(citizenUser);
      upsertUserInDb(citizenUser);
      setConfirmationResult(null);
      return { success: true, user: citizenUser };
    } catch (fbErr: any) {
      console.error('[Firebase Phone Auth Verification Error]:', fbErr);
      const codeName = fbErr?.code || 'auth/invalid-verification-code';
      const detailMsg = fbErr?.message || 'Invalid or expired verification code';
      return {
        success: false,
        error: `Firebase Auth (${codeName}): ${detailMsg}`,
      };
    }
  };

  // Logout
  const logout = () => {
    persistUser(null);
    setConfirmationResult(null);
  };

  // Profile update
  const updateUserProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    persistUser(updated);
  };

  // Complete profile for first-time login (Name, Gender, State, District)
  const completeUserProfile = async (data: { name: string; gender: string; state: string; district: string }) => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      name: data.name.trim(),
      gender: data.gender,
      state: data.state,
      district: data.district,
      profileCompleted: true,
    };
    persistUser(updated);
    await upsertUserInDb(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isLiveFirebaseMode,
        loginWithGoogle,
        sendMobileOtp,
        verifyMobileOtp,
        logout,
        updateUserProfile,
        completeUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
