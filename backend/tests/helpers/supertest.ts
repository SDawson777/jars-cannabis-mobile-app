import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'test';

jest.mock('jsonwebtoken', () => ({
	verify: (token: string, _secret: string) => {
		if (token === 'valid-token' || token === 'signed-valid-token' || token === 'valid-refresh-token') return { userId: 'test-user' };
		if (token === 'empty-cart-token') return { userId: 'empty-user' };
		throw new Error('Invalid token');
	},
	sign: (payload: any, _secret: string, _opts: any) => {
		if (payload && payload.userId) return 'signed-valid-token';
		return 'signed-token';
	}
}));

jest.mock('bcryptjs', () => ({
	hash: async (s: string, _salt: number) => `hashed-${s}`,
	hashSync: (s: string) => `hashed-${s}`,
	compare: async (plain: string, hashed: string) => {
		return hashed === `hashed-${plain}` || (plain === 'securePassword123' && hashed === 'hashed-securePassword123');
	}
}));

if (typeof (global as any).setImmediate === 'undefined') {
	(global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0) as any;
}

// In-memory stores
const users: Record<string, any> = {
	// token-only user used by tests that send a raw token
	'test-user': { id: 'test-user', email: 'token-user@example.com', passwordHash: 'hashed-securePassword123' }
};
const carts: Record<string, any> = {
	'test-user': { id: 'cart-test-user', userId: 'test-user', storeId: 'store_1', items: [{ id: 'ci-1', productId: 'prod_db_1', quantity: 1, unitPrice: 19.99 }] },
	'empty-user': { id: 'cart-empty-user', userId: 'empty-user', storeId: 'store_1', items: [] }
};
const orders: Record<string, any> = {};
const seededProducts = [
	{ id: 'test-product-id', name: 'Blue Dream OG', price: 1999, slug: 'blue-dream-flower', category: 'flower', defaultPrice: 19.99, featured: true, variants: [{ id: 'v-test-1', price: 1999 }], purchasesLast30d: 50 },
	{ id: 'prod_db_1', name: 'DB Daily Blend', price: 1999, slug: 'db-daily-blend', category: 'flower', defaultPrice: 19.99, featured: false, variants: [{ id: 'v1', price: 1999 }], purchasesLast30d: 42 },
	{ id: 'prod_db_2', name: 'DB Chill Tincture', price: 2499, slug: 'db-chill-tincture', category: 'tincture', defaultPrice: 24.99, variants: [{ id: 'v2', price: 2499 }], purchasesLast30d: 21 }
];

jest.mock('../../src/prismaClient', () => ({
	prisma: {
		user: {
			create: async ({ data }: any) => {
				const id = data.id || `user-${Math.random().toString(36).slice(2,9)}`;
				const u = { id, email: data.email, passwordHash: data.passwordHash };
				users[id] = u;
				return u;
			},
			findUnique: async ({ where: { email, id } }: any) => {
				if (email) return Object.values(users).find((u: any) => u.email === email) ?? null;
				if (id) return users[id] ?? null;
				return null;
			}
		},
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
		product: {
			findMany: async ({ take = 24 }: any) => seededProducts.slice(0, take),
			findUnique: async ({ where: { id } }: any) => seededProducts.find((p) => p.id === id) ?? null,
			findManyBySlug: async ({ where: { slug } }: any) => seededProducts.find((p) => p.slug === slug) ?? null,
			findManyByCategory: async ({ where: { category } }: any) => seededProducts.filter((p) => p.category === category),
		},
		review: {
			findMany: async ({ where: { productId } }: any) => [],
			create: async ({ data }: any) => ({ id: `r-${Math.random().toString(36).slice(2,8)}`, ...data, createdAt: new Date().toISOString() })
		},
		productVariant: {
			findUnique: async ({ where: { id } }: any) => {
				for (const p of seededProducts) {
					const v = (p.variants || []).find((x: any) => x.id === id);
					if (v) return v;
				}
				return null;
			}
		},
		store: {
			findUnique: async ({ where: { id } }: any) => id ? { id, name: `Store ${id}` } : null
		},
		order: {
			findMany: async ({ where = {} }: any) => {
				const arr = Object.values(orders) as any[];
				let res = where.userId ? arr.filter((o) => o.userId === where.userId) : arr;
				if (where.status) {
					const s = String(where.status).toLowerCase();
					res = res.filter((o) => String(o.status || '').toLowerCase() === s);
				}
				return res;
			},
			findFirst: async ({ where = {} }: any) => Object.values(orders).find((o: any) => o.id === where.id && (!where.userId || o.userId === where.userId)) ?? null,
			findUnique: async ({ where: { id } }: any) => orders[id] ?? null,
			create: async ({ data }: any) => {
				const id = `order-${Math.random().toString(36).slice(2,9)}`;
				const o = { id, userId: data.userId, storeId: data.storeId, status: data.status ?? 'pending', items: (data.items?.create || []).map((it: any, i: number) => ({ id: `oi-${i}`, ...it })), subtotal: data.subtotal ?? 0, total: data.total ?? 0, createdAt: new Date().toISOString() };
				orders[id] = o;
				return o;
			},
			update: async ({ where: { id }, data }: any) => { const o = orders[id]; if (!o) throw new Error('Not found'); Object.assign(o, data); return o; }
		},
		storeProduct: { findMany: async ({ where: { storeId } }: any) => [{ storeId, productId: 'prod_db_1' }] }
	}
}));

import app from '../../src/app';
export const api = () => request(app);
