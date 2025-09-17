import request from 'supertest';

// Enable DB-path in routes during tests so we exercise prisma mocks below
process.env.DATABASE_URL = process.env.DATABASE_URL || 'test';

// Mock jwt.verify so tests can pass a static token 'valid-token'
jest.mock('jsonwebtoken', () => ({
	verify: (token: string, _secret: string) => {
		if (token === 'valid-token') return { userId: 'test-user' };
		throw new Error('Invalid token');
	}
}));

// Ensure setImmediate exists in this Node/Jest environment for some older libs
if (typeof (global as any).setImmediate === 'undefined') {
	(global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0) as any;
}

// Mock prisma with a tiny in-memory implementation for tests
jest.mock('../../src/prismaClient', () => {
	// Minimal in-memory store for tests (carts + products)
	const carts: Record<string, any> = {};

	const seededProducts = [
		{
			id: 'prod_db_1',
			name: 'DB Daily Blend',
			price: 1999,
			image: '/images/db_prod_1.png',
			purchasesLast30d: 42,
			variants: [{ id: 'v1', price: 1999 }],
		},
		{
			id: 'prod_db_2',
			name: 'DB Chill Tincture',
			price: 2499,
			image: '/images/db_prod_2.png',
			purchasesLast30d: 21,
			variants: [{ id: 'v2', price: 2499 }],
		},
	];

	const storeProducts = [
		{ storeId: 'store_1', productId: 'prod_db_1' },
	];

	return {
		prisma: {
			cart: {
				findFirst: async ({ where: { userId } }: any) => carts[userId] ?? null,
				create: async ({ data }: any) => { carts[data.userId] = { id: `cart-${data.userId}`, userId: data.userId, storeId: data.storeId, items: [] }; return carts[data.userId]; },
				findUnique: async ({ where: { id } }: any) => Object.values(carts).find((c: any) => c.id === id) ?? null,
			},
			cartItem: {
				create: async ({ data }: any) => {
					const cart = carts[data.cartId.split('-')[1]];
					const item = { id: `item-${Math.random().toString(36).slice(2,9)}`, ...data };
					cart.items.push(item);
					return item;
				},
				findMany: async ({ where: { cartId } }: any) => {
					const cart = carts[cartId.split('-')[1]];
					return cart ? cart.items : [];
				},
				update: async ({ where: { id }, data }: any) => {
					for (const c of Object.values(carts)) {
						const it = c.items.find((x: any) => x.id === id);
						if (it) { Object.assign(it, data); return it; }
					}
					throw new Error('Not found');
				},
				delete: async ({ where: { id } }: any) => {
					for (const c of Object.values(carts)) {
						const idx = c.items.findIndex((x: any) => x.id === id);
						if (idx >= 0) { c.items.splice(idx, 1); return; }
					}
					throw new Error('Not found');
				},
				deleteMany: async ({ where: { id } }: any) => {
					for (const c of Object.values(carts)) {
						c.items = c.items.filter((x: any) => !(id && id.in && id.in.includes(x.id)));
					}
				}
			},
			// Seeded product/variant/storeProduct mock
			product: {
				findMany: async ({ take = 24, orderBy }: any) => {
					// ignore orderBy in this simple mock, return top `take` products sorted by purchasesLast30d
					return seededProducts.slice(0, take);
				},
				findUnique: async ({ where: { id } }: any) => seededProducts.find((p) => p.id === id) ?? null,
			},
			storeProduct: {
				findMany: async ({ where: { storeId } }: any) => storeProducts.filter((s) => s.storeId === storeId),
			},
		}
	};
});

import app from '../../src/app';

export const api = () => request(app);
