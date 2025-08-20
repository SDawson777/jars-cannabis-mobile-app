import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc } from 'firebase/firestore';

import admin from '../server/firebaseAdmin';

declare const process: { env: Record<string, string> };

const projectId = process.env.FIREBASE_PROJECT_ID;

describe('firebase e2e', () => {
  beforeAll(async () => {
    // ensure user exists
    try {
      await admin.auth().getUser('test-uid');
    } catch {
      await admin
        .auth()
        .createUser({ uid: 'test-uid', email: 'test@example.com', password: 'secret' });
    }
  });

  afterAll(async () => {
    await admin.auth().deleteUser('test-uid');
  });

  it('writes and reads from Firestore', async () => {
    const app = initializeApp({ projectId, apiKey: 'fake', authDomain: 'localhost' });
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    await signInWithEmailAndPassword(auth, 'test@example.com', 'secret');
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
    const ref = doc(db, 'users', 'test-uid');
    await setDoc(ref, { ok: true });
    const snap = await getDoc(ref);
    expect(snap.data()).toEqual({ ok: true });
  });

  it('calls requestExport function', async () => {
    const url = `http://localhost:5001/${projectId}/us-central1/requestExport?uid=test-uid`;
    const res = await axios.get(url);
    expect(res.data.status).toBe('started');
  });
});
