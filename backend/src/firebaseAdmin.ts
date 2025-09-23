// backend/src/firebaseAdmin.ts
import admin from 'firebase-admin';
import type { firestore as FirebaseFirestoreNS } from 'firebase-admin';
type FirebaseFirestore = typeof FirebaseFirestoreNS;

let app: admin.app.App | null = null;

function serviceAccountFromEnv(): admin.ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 missing');

  const json = Buffer.from(b64, 'base64').toString('utf8');
  const svc = JSON.parse(json);

  if (typeof (svc as any).private_key !== 'string' || !(svc as any).private_key.includes('BEGIN PRIVATE KEY')) {
    throw new Error('service account JSON missing valid private_key');
  }
  return svc as admin.ServiceAccount;
}

/** Initialize Firebase Admin exactly once. */
export function initFirebase(): admin.app.App {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.app();
    return app;
  }
  const cred = admin.credential.cert(serviceAccountFromEnv());
  app = admin.initializeApp({ credential: cred });
  return app;
}

/** Ensure initialized and return the admin namespace (for messaging(), auth(), etc). */
export function getAdmin(): typeof admin {
  if (!admin.apps.length) initFirebase();
  return admin;
}

/** Ensure initialized and return Firestore. */
export function getFirestore(): FirebaseFirestore.Firestore {
  return getAdmin().firestore();
}

/** Re-export admin for convenience. */
export { admin };

/** Convenience export for existing code that expects `db`. */
export const db: FirebaseFirestore.Firestore = getFirestore();

/** Default export keeps old imports working. */
const firebaseAdmin = { admin, initFirebase, getAdmin, getFirestore, db };
export default firebaseAdmin;
