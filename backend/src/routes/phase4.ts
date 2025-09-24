// backend/src/routes/phase4.ts
import { Router } from 'express';

// Try to require the firebase admin helper used in production. In test/demo environments
// the module may not be available, so provide a lightweight fallback that implements
// the minimal methods used by these routes.
let admin: any;
let getFirestore: any;
try {
  // require is used for dynamic import fallback
  const fb = require('@server/firebaseAdmin');
  admin = fb.admin;
  getFirestore = fb.getFirestore;
} catch {
  // fallback stub
  admin = { firestore: { FieldValue: { serverTimestamp: () => new Date().toISOString() } } };
  getFirestore = () => ({
    collection: () => ({
      get: async () => ({ docs: [] }),
      doc: (id?: string) => ({
        id: id || `doc-${Math.random().toString(36).slice(2, 8)}`,
        get: async () => ({ exists: false, data: () => null }),
        set: async () => {},
      }),
    }),
  });
}

const db = getFirestore();
export const phase4Router = Router();

// ——————————————
// Awards (already in place)
// ——————————————
// Legacy Firestore awards endpoint (deprecated). Keeping under /awards/legacy to avoid
// clashing with normalized authenticated awards API.
phase4Router.get('/awards/legacy', async (_req, res) => {
  try {
    const snapshot = await db.collection('awards').get();
    const awards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(awards);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching awards' });
  }
});

// ——————————————
// Data-Transparency: queue an export
// POST /data-transparency/export
// ——————————————
phase4Router.post('/data-transparency/export', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    // Create a new export record with auto-ID
    const docRef = db.collection('exports').doc();
    await docRef.set({
      userId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      exportId: docRef.id,
      status: 'pending',
    });
  } catch (err) {
    console.error('Error queuing data export:', err);
    return res.status(500).json({ message: 'Error queuing export' });
  }
});

// ——————————————
// Data-Transparency: check status & download
// GET /data-transparency/export/:exportId
// ——————————————
phase4Router.get('/data-transparency/export/:exportId', async (req, res) => {
  const { exportId } = req.params;

  try {
    const docRef = db.collection('exports').doc(exportId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'Export not found' });
    }

    const data = snap.data()!;
    return res.json({
      exportId,
      status: data.status,
      // downloadUrl only populated when the Cloud Function finishes
      ...(data.downloadUrl && { downloadUrl: data.downloadUrl }),
    });
  } catch (err) {
    console.error('Error fetching export status:', err);
    return res.status(500).json({ message: 'Error fetching export status' });
  }
});
// GET /accessibility-settings?userId=...
phase4Router.get('/accessibility-settings', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId query parameter' });
  }

  try {
    const doc = await db.collection('accessibilityPrefs').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'No settings found for user' });
    }
    return res.json(doc.data());
  } catch (err) {
    console.error('Error fetching accessibility settings:', err);
    return res.status(500).json({ message: 'Error fetching settings' });
  }
});

// PATCH /accessibility-settings
phase4Router.patch('/accessibility-settings', async (req, res) => {
  const { userId, textSize, colorContrast, animationsEnabled } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required in body' });
  }

  // build only the fields that were sent
  const updates: Record<string, any> = {};
  if (textSize) updates.textSize = textSize;
  if (colorContrast) updates.colorContrast = colorContrast;
  if (typeof animationsEnabled === 'boolean') {
    updates.animationsEnabled = animationsEnabled;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  try {
    const docRef = db.collection('accessibilityPrefs').doc(userId);
    await docRef.set(
      {
        ...updates,
        /* server timestamp */
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const updated = await docRef.get();
    return res.json(updated.data());
  } catch (err) {
    console.error('Error updating accessibility settings:', err);
    return res.status(500).json({ message: 'Error updating settings' });
  }
});

// ------- Ethical AI Dashboard mock endpoints -------
// GET /profile/data-categories
phase4Router.get('/profile/data-categories', (_req, res) => {
  return res.json([
    { id: 'usage', label: 'Usage Data' },
    { id: 'purchase', label: 'Purchase History' },
  ]);
});

// GET & PUT /profile/preferences
let prefs = { highContrast: false };
phase4Router.get('/profile/preferences', (_req, res) => {
  return res.json(prefs);
});
phase4Router.put('/profile/preferences', (req, res) => {
  prefs = { ...prefs, ...req.body };
  return res.json(prefs);
});
