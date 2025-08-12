import { Router } from 'express';
import { prisma } from '../prismaClient';

export const productsRouter = Router();

productsRouter.get('/products', async (req, res) => {
const {
storeId, q, category, strain, brand,
minPrice, maxPrice, thcMin, thcMax, cbdMin, cbdMax,
sort, page = '1', limit = '24'
} = req.query as Record<string, string>;

const where: any = {};
if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
if (category) where.category = category as any;
if (strain) where.strainType = strain as any;
if (brand) where.brand = { contains: brand, mode: 'insensitive' };
if (thcMin || thcMax) where.thcPercent = {};
if (thcMin) (where.thcPercent.gte = parseFloat(thcMin));
if (thcMax) (where.thcPercent.lte = parseFloat(thcMax));
if (cbdMin || cbdMax) where.cbdPercent = {};
if (cbdMin) (where.cbdPercent.gte = parseFloat(cbdMin));
if (cbdMax) (where.cbdPercent.lte = parseFloat(cbdMax));
if (minPrice || maxPrice) where.defaultPrice = {};
if (minPrice) (where.defaultPrice.gte = parseFloat(minPrice));
if (maxPrice) (where.defaultPrice.lte = parseFloat(maxPrice));

const orderBy = (() => {
if (!sort) return { name: 'asc' } as any;
const desc = sort.startsWith('-');
const key = desc ? sort.slice(1) : sort;
const map: Record<string,string> = { price:'defaultPrice', rating:'purchasesLast30d', new:'createdAt', popular:'purchasesLast30d' };
const field = map[key] || 'name';
return { [field]: desc ? 'desc' : 'asc' } as any;
})();

const take = Math.max(1, Math.min(100, parseInt(limit)));
const skip = (Math.max(1, parseInt(page)) - 1) * take;

let items = await prisma.product.findMany({
where,
include: { variants: true, reviews: true, stores: storeId ? { where: { storeId: String(storeId) } } : false },
orderBy,
take, skip
});

if (storeId) {
items = items.map((p: any) => {
const sp = (p as any).stores?.[0];
const price = sp?.price ?? p.defaultPrice ?? undefined;
return { ...p, price };
});
}

res.json({ items });
});

productsRouter.get('/products/:id', async (req, res) => {
const p = await prisma.product.findUnique({
where: { id: req.params.id },
include: { variants: true, reviews: { take: 5, orderBy: { createdAt: 'desc' } } }
});
if (!p) return res.status(404).json({ error: 'Product not found' });
res.json(p);
});

// Reviews
productsRouter.get('/products/:id/reviews', async (req, res) => {
const page = parseInt((req.query.page as string) || '1');
const limit = Math.min(100, parseInt((req.query.limit as string) || '24'));
const sort = (req.query.sort as string) || '-createdAt';
const orderBy = { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' } as any;
const reviews = await prisma.review.findMany({
where: { productId: req.params.id },
orderBy, take: limit, skip: (page - 1) * limit,
});
res.json({ items: reviews });
});

import { requireAuth } from '../middleware/auth';
productsRouter.post('/products/:id/reviews', requireAuth, async (req, res) => {
const uid = (req as any).user.userId as string;
const { rating, text } = req.body || {};
if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating 1..5 required' });
const r = await prisma.review.create({ data: { productId: req.params.id, userId: uid, rating, text } });
res.status(201).json(r);
});
