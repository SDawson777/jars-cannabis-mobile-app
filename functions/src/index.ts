import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Point the Admin SDK at emulators if running locally:
if (process.env.FIREBASE_EMULATOR_HUB /* or check FIRESTORE_EMULATOR_HOST */) {
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}

// Initialize Admin
admin.initializeApp({
  // keep your other init (credential etc) if needed
  projectId: process.env.FIREBASE_PROJECT_ID,
  // optionally set a fake bucket name for emulator
  storageBucket: process.env.STORAGE_BUCKET || 'demo-bucket',
});

export const processDataExport = functions.firestore
  .document('exports/{exportId}')
  .onCreate(async (snap, context) => {
    const exportId = context.params.exportId as string;
    const { userId } = snap.data()!;
    // … your export logic …

    // Now this bucket call will go to localhost:9199
    const bucket = admin.storage().bucket();
    // ...
  });
