"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatedTo = exports.forYou = void 0;
const prismaClient_1 = require("../../prismaClient");
// Simple hybrid (content-based + popularity) with user context fallback.
async function forYou(userId, storeId, limit = 12) {
    // Popularity baseline by store
    const popular = await prismaClient_1.prisma.product.findMany({
        where: { storeId },
        orderBy: [{ purchasesLast30d: 'desc' }],
        take: limit,
    });
    if (!userId)
        return popular;
    // Use last 60d user interactions (views, favorites, orders) -> build attribute weights.
    const recent = await prismaClient_1.prisma.userEvent.findMany({
        where: { userId },
        take: 500,
        orderBy: { createdAt: 'desc' },
    });
    const likedBrands = freq(recent.filter(e => e.type === 'favorite').map(e => e.brand));
    const likedStrains = freq(recent.filter(e => e.type === 'view' || e.type === 'purchase').map(e => e.strainType));
    const likedTerps = freq(recent.flatMap(e => e.terpenes ?? []));
    const candidates = await prismaClient_1.prisma.product.findMany({
        where: { storeId },
        take: 500,
        orderBy: [{ purchasesLast30d: 'desc' }],
    });
    const scored = candidates.map(p => ({ p, s: score(p, likedBrands, likedStrains, likedTerps) }));
    return scored
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map(x => x.p);
}
exports.forYou = forYou;
async function relatedTo(productId, storeId, limit = 8) {
    const base = await prismaClient_1.prisma.product.findUnique({ where: { id: productId } });
    if (!base)
        return [];
    const siblings = await prismaClient_1.prisma.product.findMany({
        where: {
            storeId,
            id: { not: base.id },
            OR: [
                { brand: base.brand },
                { strainType: base.strainType },
                { terpenes: { hasSome: base.terpenes ?? [] } },
            ],
        },
        take: 200,
    });
    const scored = siblings.map(p => ({
        p,
        s: jaccard(base.terpenes ?? [], p.terpenes ?? []) +
            (p.brand === base.brand ? 0.3 : 0) +
            (p.strainType === base.strainType ? 0.3 : 0),
    }));
    return scored
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map(x => x.p);
}
exports.relatedTo = relatedTo;
function freq(arr) {
    return arr.reduce((m, v) => {
        if (!v)
            return m;
        m[v] = (m[v] || 0) + 1;
        return m;
    }, {});
}
function score(p, b, s, t) {
    return ((b[p.brand] || 0) * 0.6 +
        (s[p.strainType] || 0) * 0.6 +
        (p.terpenes ?? []).reduce((acc, terp) => acc + (t[terp] || 0) * 0.3, 0) +
        (p.purchasesLast30d || 0) * 0.02);
}
function jaccard(a, b) {
    const A = new Set(a), B = new Set(b);
    const inter = [...A].filter(x => B.has(x)).length;
    const uni = new Set([...a, ...b]).size || 1;
    return inter / uni;
}
