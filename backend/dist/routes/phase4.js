'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.phase4Router = void 0;
// backend/src/routes/phase4.ts
const express_1 = require('express');
const firebase_admin_1 = __importDefault(require('firebase-admin'));
const firebaseAdmin_1 = require('../firebaseAdmin');
exports.phase4Router = (0, express_1.Router)();
// ——————————————
// Awards (already in place)
// ——————————————
exports.phase4Router.get('/awards', async (_req, res) => {
  try {
    const snapshot = await firebaseAdmin_1.db.collection('awards').get();
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
exports.phase4Router.post('/data-transparency/export', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  try {
    // Create a new export record with auto-ID
    const docRef = firebaseAdmin_1.db.collection('exports').doc();
    await docRef.set({
      userId,
      status: 'pending',
      createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
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
exports.phase4Router.get('/data-transparency/export/:exportId', async (req, res) => {
  const { exportId } = req.params;
  try {
    const docRef = firebaseAdmin_1.db.collection('exports').doc(exportId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ message: 'Export not found' });
    }
    const data = snap.data();
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
exports.phase4Router.get('/accessibility-settings', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId query parameter' });
  }
  try {
    const doc = await firebaseAdmin_1.db.collection('accessibilityPrefs').doc(userId).get();
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
exports.phase4Router.patch('/accessibility-settings', async (req, res) => {
  const { userId, textSize, colorContrast, animationsEnabled } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required in body' });
  }
  // build only the fields that were sent
  const updates = {};
  if (textSize) updates.textSize = textSize;
  if (colorContrast) updates.colorContrast = colorContrast;
  if (typeof animationsEnabled === 'boolean') {
    updates.animationsEnabled = animationsEnabled;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  try {
    const docRef = firebaseAdmin_1.db.collection('accessibilityPrefs').doc(userId);
    await docRef.set(
      {
        ...updates,
        /* server timestamp */
        updatedAt: (
          await Promise.resolve().then(() => __importStar(require('firebase-admin')))
        ).firestore.FieldValue.serverTimestamp(),
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
