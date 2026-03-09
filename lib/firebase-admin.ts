import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Check if all required environment variables are present
const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let app: App | undefined;

if (hasFirebaseConfig) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  };

  app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
}

export const adminAuth: Auth | undefined = app ? getAuth(app) : undefined;
export const adminDb: Firestore | undefined = app ? getFirestore(app) : undefined;
