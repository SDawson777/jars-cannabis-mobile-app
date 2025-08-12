"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRouter = void 0;
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const geo_1 = require("../utils/geo");
exports.storesRouter = (0, express_1.Router)();
exports.storesRouter.get('/stores', async (req, res) => {
    const { lat, lng, radius, q } = req.query;
    const where = { isActive: true };
    if (q) {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { state: { contains: q, mode: 'insensitive' } },
        ];
    }
    const all = await prismaClient_1.prisma.store.findMany({ where, orderBy: { name: 'asc' } });
    let filtered = all;
    if (lat && lng && radius) {
        const L = parseFloat(lat), G = parseFloat(lng), R = parseFloat(radius);
        if (Number.isFinite(L) && Number.isFinite(G) && Number.isFinite(R)) {
            filtered = all.filter(s => s.latitude && s.longitude && (0, geo_1.haversineMeters)({ lat: L, lng: G }, { lat: Number(s.latitude), lng: Number(s.longitude) }) <= R);
        }
        else {
            return res.status(400).json({ error: 'lat/lng/radius must be numbers' });
        }
    }
    res.json(filtered);
});
exports.storesRouter.get('/stores/:id', async (req, res) => {
    const store = await prismaClient_1.prisma.store.findUnique({ where: { id: req.params.id } });
    if (!store)
        return res.status(404).json({ error: 'Store not found' });
    const includeHours = String(req.query.includeHours || 'false') === 'true';
    return res.json(includeHours ? store : { ...store, hours: undefined });
});
