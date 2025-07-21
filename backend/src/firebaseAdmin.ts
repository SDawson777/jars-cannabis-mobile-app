// backend/src/firebaseAdmin.ts
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Firebase Admin SDK if it hasn't been already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

// If the FIRESTORE_EMULATOR_HOST env var is set, point Firestore at the emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  admin.firestore().settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false,
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
