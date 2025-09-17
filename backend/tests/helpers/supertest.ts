import request from 'supertest';

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
	const carts: Record<string, any> = {};
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
			}
		}
	};
});

import app from '../../src/app';

export const api = () => request(app);
