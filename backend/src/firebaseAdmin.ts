// backend/src/firebaseAdmin.ts
import admin from 'firebase-admin';
import type { firestore as FirebaseFirestoreNS } from 'firebase-admin';
import { env } from './env';
type FirebaseFirestore = typeof FirebaseFirestoreNS;

let app: admin.app.App | null = null;

const isTestEnvironment =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

function serviceAccountFromEnv(): admin.ServiceAccount {
  const b64 = env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 missing');

  const json = Buffer.from(b64, 'base64').toString('utf8');
  const svc = JSON.parse(json);

  if (
    typeof (svc as any).private_key !== 'string' ||
    !(svc as any).private_key.includes('BEGIN PRIVATE KEY')
  ) {
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

  // In test runs we intentionally do not require real credentials.
  // Many backend unit tests should run without any external dependencies.
  if (isTestEnvironment) {
    app = admin.initializeApp();
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

/** Default export keeps old imports working. */
const firebaseAdmin = { admin, initFirebase, getAdmin, getFirestore };
export default firebaseAdmin;
