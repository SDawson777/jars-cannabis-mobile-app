// backend/src/firebaseAdmin.ts
import admin from '@server/firebaseAdmin';

export const auth = admin.auth();
export const db = admin.firestore();
