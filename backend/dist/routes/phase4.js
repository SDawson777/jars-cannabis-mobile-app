"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phase4Router = void 0;
// backend/src/routes/phase4.ts
const express_1 = require("express");
const firebaseAdmin_1 = require("@server/firebaseAdmin");
const db = (0, firebaseAdmin_1.getFirestore)();
exports.phase4Router = (0, express_1.Router)();
// ——————————————
// Awards (already in place)
// ——————————————
exports.phase4Router.get('/awards', async (_req, res) => {
    try {
        const snapshot = await db.collection('awards').get();
        const awards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.json(awards);
    }
    catch (err) {
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
        const docRef = db.collection('exports').doc();
        await docRef.set({
            userId,
            status: 'pending',
            createdAt: firebaseAdmin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.json({
            exportId: docRef.id,
            status: 'pending',
        });
    }
    catch (err) {
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
        const docRef = db.collection('exports').doc(exportId);
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
    }
    catch (err) {
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
        const doc = await db.collection('accessibilityPrefs').doc(userId).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'No settings found for user' });
        }
        return res.json(doc.data());
    }
    catch (err) {
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
    if (textSize)
        updates.textSize = textSize;
    if (colorContrast)
        updates.colorContrast = colorContrast;
    if (typeof animationsEnabled === 'boolean') {
        updates.animationsEnabled = animationsEnabled;
    }
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
    }
    try {
        const docRef = db.collection('accessibilityPrefs').doc(userId);
        await docRef.set({
            ...updates,
            /* server timestamp */
            updatedAt: firebaseAdmin_1.admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        const updated = await docRef.get();
        return res.json(updated.data());
    }
    catch (err) {
        console.error('Error updating accessibility settings:', err);
        return res.status(500).json({ message: 'Error updating settings' });
    }
});
// ------- Ethical AI Dashboard mock endpoints -------
// GET /profile/data-categories
exports.phase4Router.get('/profile/data-categories', (_req, res) => {
    return res.json([
        { id: 'usage', label: 'Usage Data' },
        { id: 'purchase', label: 'Purchase History' },
    ]);
});
// GET & PUT /profile/preferences
let prefs = { highContrast: false };
exports.phase4Router.get('/profile/preferences', (_req, res) => {
    return res.json(prefs);
});
exports.phase4Router.put('/profile/preferences', (req, res) => {
    prefs = { ...prefs, ...req.body };
    return res.json(prefs);
});
