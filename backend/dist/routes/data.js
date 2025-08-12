"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../util/auth");
const firebaseAdmin_1 = require("../firebaseAdmin");
exports.dataRouter = (0, express_1.Router)();
// Start a data export job and upload results to Firebase Storage
// eslint-disable-next-line @typescript-eslint/no-misused-promises
exports.dataRouter.post('/data-transparency/export', auth_1.authRequired, async (req, res, next) => {
    try {
        const uid = req.user.id;
        const job = await prismaClient_1.prisma.dataExport.create({ data: { userId: uid, status: 'pending' } });
        (0, firebaseAdmin_1.initFirebase)();
        const payload = {
            profile: await prismaClient_1.prisma.user.findUnique({ where: { id: uid } }),
            preferences: await prismaClient_1.prisma.userPreference.findUnique({ where: { userId: uid } }),
            accessibility: await prismaClient_1.prisma.accessibilitySetting.findUnique({ where: { userId: uid } }),
            orders: await prismaClient_1.prisma.order.findMany({ where: { userId: uid }, include: { items: true } }),
            reviews: await prismaClient_1.prisma.review.findMany({ where: { userId: uid } }),
            journal: await prismaClient_1.prisma.journalEntry.findMany({ where: { userId: uid } }),
            events: await prismaClient_1.prisma.userEvent.findMany({ where: { userId: uid } }),
        };
        const bucket = firebaseAdmin_1.admin.storage().bucket();
        const file = bucket.file(`exports/${uid}/${job.id}.json`);
        await file.save(JSON.stringify(payload, null, 2), { contentType: 'application/json' });
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        });
        const updated = await prismaClient_1.prisma.dataExport.update({
            where: { id: job.id },
            data: { status: 'ready', downloadUrl: url },
        });
        res.json({ exportId: updated.id, status: updated.status, downloadUrl: updated.downloadUrl });
    }
    catch (err) {
        next(err);
    }
});
// Retrieve status of a previously requested data export
// eslint-disable-next-line @typescript-eslint/no-misused-promises
exports.dataRouter.get('/data-transparency/export/:exportId', auth_1.authRequired, async (req, res) => {
    const uid = req.user.id;
    const d = await prismaClient_1.prisma.dataExport.findFirst({ where: { id: req.params.exportId, userId: uid } });
    if (!d)
        return res.status(404).json({ error: 'Export not found' });
    res.json({ exportId: d.id, status: d.status, downloadUrl: d.downloadUrl });
});
