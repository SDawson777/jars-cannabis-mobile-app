"use strict";
// backend/src/controllers/dataTransparencyController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelExport = exports.getExportStatus = exports.requestExport = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const dataExportQueue_1 = require("../queues/dataExportQueue");
const prisma = new client_1.PrismaClient();
/**
 * POST /api/data-transparency/export
 * Kick off a new data export for the given user.
 * Responds with { exportId, status }.
 */
async function requestExport(req, res) {
    const { userId } = req.body;
    const exportId = (0, uuid_1.v4)();
    try {
        // Create a pending record
        await prisma.dataExport.create({
            data: { id: exportId, userId, status: 'pending' },
        });
        // Enqueue the background job to generate the export
        await dataExportQueue_1.exportQueue.add({ exportId, userId });
        return res.json({ exportId, status: 'pending' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
exports.requestExport = requestExport;
/**
 * GET /api/data-transparency/export/:exportId
 * Return the current status (and downloadUrl if ready).
 */
async function getExportStatus(req, res) {
    const { exportId } = req.params;
    try {
        const record = await prisma.dataExport.findUnique({
            where: { id: exportId },
        });
        if (!record) {
            return res.status(404).json({ error: 'Export not found' });
        }
        return res.json(record);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
exports.getExportStatus = getExportStatus;
/**
 * DELETE /api/data-transparency/export/:exportId
 * Cancel (delete) a pending export.
 */
async function cancelExport(req, res) {
    const { exportId } = req.params;
    try {
        await prisma.dataExport.delete({
            where: { id: exportId },
        });
        return res.sendStatus(204);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
exports.cancelExport = cancelExport;
