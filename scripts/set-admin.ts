// Run this script once to set a Firebase Auth user as admin
// Usage: npx tsx scripts/set-admin.ts admin@blueprxnt.com

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);

async function setAdmin(email: string) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set admin claim for: ${email} (uid: ${user.uid})`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`User not found: ${email}`);
      console.log('Create the user in Firebase Console first:');
      console.log('Firebase Console > Authentication > Add user');
    } else {
      console.error('Error:', error.message);
    }
  }
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/set-admin.ts <email>');
  process.exit(1);
}

setAdmin(email);
