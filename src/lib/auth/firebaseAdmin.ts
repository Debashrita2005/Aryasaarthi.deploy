import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App | null {
  if (firebaseAdminApp) return firebaseAdminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.apps[0]!;
    return firebaseAdminApp;
  }

  if (projectId && clientEmail && privateKey) {
    try {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return firebaseAdminApp;
    } catch (err) {
      console.warn('[Firebase Admin] Initialization error:', err);
    }
  }

  return null;
}

export function getAdminAuth(): admin.auth.Auth | null {
  const app = getFirebaseAdmin();
  if (app) {
    return admin.auth(app);
  }
  return null;
}
