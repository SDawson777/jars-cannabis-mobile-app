// backend/src/firebaseAdmin.ts
import admin from 'firebase-admin';

export function initFirebase() {
  if (admin.apps.length) return admin.app();
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 missing');
  const json = Buffer.from(b64, 'base64').toString('utf8');
  const svc  = JSON.parse(json);
  if (typeof svc.private_key !== 'string' || !svc.private_key.includes('BEGIN PRIVATE KEY')) {
    throw new Error('service account JSON missing valid private_key');
  }
  return admin.initializeApp({ credential: admin.credential.cert(svc as admin.ServiceAccount) });
}
