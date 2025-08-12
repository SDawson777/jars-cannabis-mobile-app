// backend/src/firebaseAdmin.ts
import admin from 'firebase-admin';

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

export function getFirestore(): FirebaseFirestore.Firestore {
  if (!admin.apps.length) initFirebase();
  return admin.firestore();
}

export { admin };

// Keep a convenient named export for compatibility
export const db = (() => {
  try { return getFirestore(); } catch { return undefined as unknown as FirebaseFirestore.Firestore; }
})();

// Default export so `import firebaseAdmin from '@server/firebaseAdmin'` works
const firebaseAdmin = { admin, initFirebase, getFirestore, db };
export default firebaseAdmin;
