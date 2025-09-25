import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'test';

jest.mock('jsonwebtoken', () => ({
  verify: (token: string, _secret: string) => {
    if (
      token === 'valid-token' ||
      token === 'signed-valid-token' ||
      token === 'valid-refresh-token'
    )
      return { userId: 'test-user' };
    if (token === 'empty-cart-token') return { userId: 'empty-user' };
    throw new Error('Invalid token');
  },
  sign: (payload: any, _secret: string, _opts: any) => {
    if (payload && payload.userId) return 'signed-valid-token';
    return 'signed-token';
  },
}));

// Mock the server firebase admin helper used by phase4 routes so tests can import it.
jest.mock('../../src/bootstrap/firebase-admin', () => ({
  initFirebase: () => {},
}));

// phase4 route includes a runtime fallback when @server/firebaseAdmin isn't available in test/demo envs

jest.mock('bcryptjs', () => ({
  hash: async (s: string, _salt: number) => `hashed-${s}`,
  hashSync: (s: string) => `hashed-${s}`,
  compare: async (plain: string, hashed: string) => {
    return (
      hashed === `hashed-${plain}` ||
      (plain === 'securePassword123' && hashed === 'hashed-securePassword123')
    );
  },
}));

if (typeof (global as any).setImmediate === 'undefined') {
  (global as any).setImmediate = (fn: Function, ...args: any[]) =>
    setTimeout(() => fn(...args), 0) as any;
}

// In-memory stores
const users: Record<string, any> = {
  // token-only user used by tests that send a raw token
  'test-user': {
    id: 'test-user',
    email: 'token-user@example.com',
    passwordHash: 'hashed-securePassword123',
    name: 'Token User',
    phone: null,
  },
};
const carts: Record<string, any> = {
  // keyed by user id for convenience, values include .id
  'test-user': {
    id: 'cart-test-user',
    userId: 'test-user',
    storeId: 'store_1',
    items: [
      { id: 'ci-1', productId: 'prod_db_1', quantity: 1, unitPrice: 19.99 },
      { id: 'test-cart-item-id', productId: 'test-product-id', quantity: 1, unitPrice: 19.99 },
    ],
  },
  'empty-user': { id: 'cart-empty-user', userId: 'empty-user', storeId: 'store_1', items: [] },
};
const mockOrders: Record<string, any> = {
  // Order owned by test-user used across several tests
  'test-order-id': {
    id: 'test-order-id',
    userId: 'test-user',
    storeId: 'store_1',
    status: 'PENDING',
    subtotal: 19.99,
    tax: 1.2,
    total: 21.19,
    createdAt: new Date().toISOString(),
    items: [{ id: 'oi-1', productId: 'prod_db_1', quantity: 1, unitPrice: 19.99 }],
  },
  // Order owned by another user to test access control
  'other-users-order-id': {
    id: 'other-users-order-id',
    userId: 'other-user',
    storeId: 'store_1',
    status: 'PENDING',
    subtotal: 19.99,
    tax: 1.2,
    total: 21.19,
    createdAt: new Date().toISOString(),
    items: [{ id: 'oi-2', productId: 'prod_db_1', quantity: 1, unitPrice: 19.99 }],
  },
  'delivered-order-id': {
    id: 'delivered-order-id',
    userId: 'test-user',
    storeId: 'store_1',
    status: 'DELIVERED',
    subtotal: 29.99,
    tax: 1.8,
    total: 31.79,
    createdAt: new Date().toISOString(),
    items: [{ id: 'oi-3', productId: 'prod_db_2', quantity: 1, unitPrice: 29.99 }],
  },
  'completed-order-id': {
    id: 'completed-order-id',
    userId: 'test-user',
    storeId: 'store_1',
    status: 'COMPLETED',
    subtotal: 39.99,
    tax: 2.4,
    total: 42.39,
    createdAt: new Date().toISOString(),
    items: [{ id: 'oi-4', productId: 'prod_db_2', quantity: 1, unitPrice: 39.99 }],
  },
  'pending-order-id': {
    id: 'pending-order-id',
    userId: 'test-user',
    storeId: 'store_1',
    status: 'PENDING',
    subtotal: 9.99,
    tax: 0.6,
    total: 10.59,
    createdAt: new Date().toISOString(),
    items: [{ id: 'oi-5', productId: 'prod_db_1', quantity: 1, unitPrice: 9.99 }],
  },
};
const seededProducts = [
  {
    id: 'test-product-id',
    name: 'Blue Dream OG',
    price: 1999,
    slug: 'blue-dream-flower',
    category: 'flower',
    defaultPrice: 19.99,
    featured: true,
    variants: [{ id: 'v-test-1', price: 1999 }],
    purchasesLast30d: 50,
  },
  {
    id: 'prod_db_1',
    name: 'DB Daily Blend',
    price: 1999,
    slug: 'db-daily-blend',
    category: 'flower',
    defaultPrice: 19.99,
    featured: false,
    variants: [{ id: 'v1', price: 1999 }],
    purchasesLast30d: 42,
  },
  {
    id: 'prod_db_2',
    name: 'DB Chill Tincture',
    price: 2499,
    slug: 'db-chill-tincture',
    category: 'tincture',
    defaultPrice: 24.99,
    variants: [{ id: 'v2', price: 2499 }],
    purchasesLast30d: 21,
  },
];

// In-memory journal entries store keyed by id
const journalEntries: Record<string, any> = {};
// In-memory payment methods store keyed by id
const paymentMethods: Record<string, any> = {};
// In-memory addresses store keyed by id
const addresses: Record<string, any> = {};
// In-memory awards keyed by userId
const awardsStore: Record<string, any[]> = {};
// In-memory loyalty status
const loyaltyStatus: Record<string, { userId: string; points: number; tier: string }> = {};
// In-memory user data preferences
const dataPrefs: Record<string, any> = {};

jest.mock('../../src/prismaClient', () => ({
  prisma: {
    award: {
      findMany: async ({ where: { userId } = { userId: undefined } }: any) => {
        // simple in-memory awards keyed by userId
        if (!awardsStore[userId]) return [];
        return awardsStore[userId];
      },
      findUnique: async ({ where: { id } }: any) => {
        for (const list of Object.values(awardsStore)) {
          const found = (list as any[]).find(a => a.id === id);
          if (found) return found;
        }
        return null;
      },
      update: async ({ where: { id }, data }: any) => {
        for (const list of Object.values(awardsStore)) {
          const idx = (list as any[]).findIndex(a => a.id === id);
          if (idx >= 0) {
            Object.assign((list as any[])[idx], data);
            return (list as any[])[idx];
          }
        }
        throw new Error('Not found');
      },
      create: async ({ data }: any) => {
        const id = data.id || `awd-${Math.random().toString(36).slice(2, 9)}`;
        const award = { id, status: 'PENDING', redeemedAt: null, ...data };
        awardsStore[data.userId] = awardsStore[data.userId] || [];
        awardsStore[data.userId].push(award);
        return award;
      },
    },
    loyaltyStatus: {
      upsert: async ({ where: { userId }, update, create }: any) => {
        if (!loyaltyStatus[userId]) {
          loyaltyStatus[userId] = {
            userId,
            points: create?.points ?? 0,
            tier: create?.tier || 'Bronze',
          };
        }
        if (update) {
          if (update.points && typeof update.points.increment === 'number') {
            loyaltyStatus[userId].points += update.points.increment;
          }
          if (typeof update.tier === 'string') loyaltyStatus[userId].tier = update.tier;
        }
        return loyaltyStatus[userId];
      },
      update: async ({ where: { userId }, data }: any) => {
        if (!loyaltyStatus[userId]) throw new Error('not found');
        Object.assign(loyaltyStatus[userId], data);
        return loyaltyStatus[userId];
      },
    },
    user: {
      create: async ({ data }: any) => {
        const id = data.id || `user-${Math.random().toString(36).slice(2, 9)}`;
        const u = { id, email: data.email, passwordHash: data.passwordHash };
        users[id] = u;
        return u;
      },
      findUnique: async ({ where: { email, id } }: any) => {
        if (email) return Object.values(users).find((u: any) => u.email === email) ?? null;
        if (id) return users[id] ?? null;
        return null;
      },
      update: async ({ where: { id }, data }: any) => {
        const existing = users[id];
        if (!existing) throw new Error('Not found');
        Object.assign(existing, data);
        return existing;
      },
      deleteMany: async ({ where: { id } }: any) => {
        for (const c of Object.values(carts)) {
          c.items = c.items.filter((x: any) => !(id && id.in && id.in.includes(x.id)));
        }
      },
    },
    product: {
      findMany: async ({ take = 24 }: any) => seededProducts.slice(0, take),
      findUnique: async ({ where: { id } }: any) => seededProducts.find(p => p.id === id) ?? null,
      findManyBySlug: async ({ where: { slug } }: any) =>
        seededProducts.find(p => p.slug === slug) ?? null,
      findManyByCategory: async ({ where: { category } }: any) =>
        seededProducts.filter(p => p.category === category),
    },
    journalEntry: {
      findMany: async ({ where = {}, orderBy = {}, take, skip }: any) => {
        const all = Object.values(journalEntries).filter(
          (e: any) => !where.userId || e.userId === where.userId
        );
        // Sort by updatedAt desc or createdAt desc as fallback
        if (orderBy.updatedAt === 'desc') {
          all.sort((a: any, b: any) => (a.updatedAt < b.updatedAt ? 1 : -1));
        } else {
          all.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
        }
        const s = skip || 0;
        const t = take || all.length;
        return all.slice(s, s + t);
      },
      findUnique: async ({ where: { id } }: any) => journalEntries[id] ?? null,
      create: async ({ data }: any) => {
        const id = `je-${Math.random().toString(36).slice(2, 9)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const e = { id, createdAt, updatedAt, ...data };
        journalEntries[id] = e;
        return e;
      },
      update: async ({ where: { id }, data }: any) => {
        const existing = journalEntries[id];
        if (!existing) throw new Error('Not found');
        const updatedAt = new Date().toISOString();
        Object.assign(existing, { ...data, updatedAt });
        return existing;
      },
    },
    review: {
      findMany: async ({ where: { productId } }: any) => [],
      create: async ({ data }: any) => ({
        id: `r-${Math.random().toString(36).slice(2, 8)}`,
        ...data,
        createdAt: new Date().toISOString(),
      }),
    },
    productVariant: {
      findUnique: async ({ where: { id } }: any) => {
        for (const p of seededProducts) {
          const v = (p.variants || []).find((x: any) => x.id === id);
          if (v) return v;
        }
        return null;
      },
    },
    store: {
      findUnique: async ({ where: { id } }: any) => (id ? { id, name: `Store ${id}` } : null),
    },
    paymentMethod: {
      findMany: async ({ where = {}, orderBy = {} }: any) => {
        const all = Object.values(paymentMethods).filter(
          (pm: any) => !where.userId || pm.userId === where.userId
        );
        // simple ordering by createdAt desc
        all.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
        return all;
      },
      findUnique: async ({ where: { id } }: any) => paymentMethods[id] ?? null,
      create: async ({ data }: any) => {
        const id = `pm-${Math.random().toString(36).slice(2, 9)}`;
        const createdAt = new Date().toISOString();
        const pm = { id, createdAt, updatedAt: createdAt, ...data };
        paymentMethods[id] = pm;
        return pm;
      },
      update: async ({ where: { id }, data }: any) => {
        const existing = paymentMethods[id];
        if (!existing) throw new Error('Not found');
        Object.assign(existing, { ...data, updatedAt: new Date().toISOString() });
        return existing;
      },
      updateMany: async ({ where = {}, data }: any) => {
        // honor where.userId and where.id.not to avoid overwriting the newly-updated/created record
        const notId = where.id && where.id.not;
        let count = 0;
        for (const k of Object.keys(paymentMethods)) {
          const pm = paymentMethods[k];
          if (where.userId && pm.userId !== where.userId) continue;
          if (notId && pm.id === notId) continue;
          Object.assign(pm, data);
          pm.updatedAt = new Date().toISOString();
          count++;
        }
        return { count };
      },
      // helper used by the route fallback in tests to remove a payment method from the in-memory store
      _removePaymentMethod: (id: string) => {
        delete paymentMethods[id];
      },
    },
    address: {
      findMany: async ({ where = {}, orderBy = {} }: any) => {
        const all = Object.values(addresses).filter(
          (a: any) => !where.userId || a.userId === where.userId
        );
        all.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
        return all;
      },
      findUnique: async ({ where: { id } }: any) => addresses[id] ?? null,
      create: async ({ data }: any) => {
        const id = `addr-${Math.random().toString(36).slice(2, 9)}`;
        const createdAt = new Date().toISOString();
        const a = { id, createdAt, updatedAt: createdAt, ...data };
        addresses[id] = a;
        return a;
      },
      update: async ({ where: { id }, data }: any) => {
        const existing = addresses[id];
        if (!existing) throw new Error('Not found');
        Object.assign(existing, { ...data, updatedAt: new Date().toISOString() });
        return existing;
      },
      updateMany: async ({ where = {}, data }: any) => {
        const notId = where.id && where.id.not;
        let count = 0;
        for (const k of Object.keys(addresses)) {
          const a = addresses[k];
          if (where.userId && a.userId !== where.userId) continue;
          if (notId && a.id === notId) continue;
          Object.assign(a, data);
          a.updatedAt = new Date().toISOString();
          count++;
        }
        return { count };
      },
      delete: async ({ where: { id } }: any) => {
        if (!addresses[id]) throw new Error('Not found');
        const removed = addresses[id];
        delete addresses[id];
        return removed;
      },
      _removeAddress: (id: string) => {
        delete addresses[id];
      },
    },
    userDataPreference: {
      findUnique: async ({ where: { userId } }: any) => dataPrefs[userId] ?? null,
      upsert: async ({ where: { userId }, create, update }: any) => {
        if (!dataPrefs[userId]) {
          dataPrefs[userId] = {
            userId,
            personalizedAds: false,
            emailTracking: false,
            shareWithPartners: false,
            updatedAt: new Date().toISOString(),
          };
        }
        dataPrefs[userId] = {
          ...dataPrefs[userId],
          ...(Object.keys(update || {}).length ? update : create),
          updatedAt: new Date().toISOString(),
        };
        const { userId: _u, ...rest } = dataPrefs[userId];
        return { userId, ...rest };
      },
    },
    order: {
      findMany: async ({ where = {} }: any) => {
        const arr = Object.values(mockOrders) as any[];
        let res = where.userId ? arr.filter(o => o.userId === where.userId) : arr;
        if (where.status) {
          const s = String(where.status).toLowerCase();
          res = res.filter(o => String(o.status || '').toLowerCase() === s);
        }
        return res;
      },
      findFirst: async ({ where = {} }: any) =>
        Object.values(mockOrders).find(
          (o: any) => o.id === where.id && (!where.userId || o.userId === where.userId)
        ) ?? null,
      findUnique: async ({ where: { id } }: any) => mockOrders[id] ?? null,
      create: async ({ data }: any) => {
        const id = `order-${Math.random().toString(36).slice(2, 9)}`;
        const o = {
          id,
          userId: data.userId,
          storeId: data.storeId,
          status: data.status ?? 'pending',
          items: (data.items?.create || []).map((it: any, i: number) => ({ id: `oi-${i}`, ...it })),
          subtotal: data.subtotal ?? 0,
          total: data.total ?? 0,
          createdAt: new Date().toISOString(),
        };
        mockOrders[id] = o;
        return o;
      },
      update: async ({ where: { id }, data }: any) => {
        const o = mockOrders[id];
        if (!o) throw new Error('Not found');
        Object.assign(o, data);
        return o;
      },
    },
    storeProduct: {
      findMany: async ({ where: { storeId } }: any) => [{ storeId, productId: 'prod_db_1' }],
    },
    cart: {
      findFirst: async ({ where: { userId, id } = {} }: any) => {
        if (userId) return carts[userId] ?? null;
        if (id) return Object.values(carts).find((c: any) => c.id === id) ?? null;
        return null;
      },
      create: async ({ data }: any) => {
        const id = `cart-${Math.random().toString(36).slice(2, 9)}`;
        const c = { id, userId: data.userId, storeId: data.storeId || null, items: [] };
        carts[data.userId] = c;
        return c;
      },
      findUnique: async ({ where: { id } }: any) => {
        return Object.values(carts).find((c: any) => c.id === id) ?? null;
      },
      update: async ({ where: { id }, data }: any) => {
        const c = Object.values(carts).find((x: any) => x.id === id);
        if (!c) throw new Error('Not found');
        Object.assign(c, data);
        return c;
      },
    },
    cartItem: {
      findMany: async ({ where: { cartId } }: any) => {
        const cart = Object.values(carts).find((c: any) => c.id === cartId);
        return cart ? cart.items || [] : [];
      },
      create: async ({ data }: any) => {
        const id = `ci-${Math.random().toString(36).slice(2, 9)}`;
        const item = { id, ...data };
        const cart =
          Object.values(carts).find((c: any) => c.id === data.cartId) || carts[data.userId];
        if (cart) {
          cart.items = cart.items || [];
          cart.items.push(item);
        }
        return item;
      },
      update: async ({ where: { id }, data }: any) => {
        for (const c of Object.values(carts)) {
          const it = (c as any).items?.find((i: any) => i.id === id);
          if (it) {
            Object.assign(it, data);
            return it;
          }
        }
        throw new Error('Not found');
      },
      delete: async ({ where: { id } }: any) => {
        for (const c of Object.values(carts)) {
          const idx = (c as any).items?.findIndex((i: any) => i.id === id);
          if (idx >= 0) {
            const [removed] = (c as any).items.splice(idx, 1);
            return removed;
          }
        }
        throw new Error('Not found');
      },
      deleteMany: async ({ where }: any) => {
        // support deleteMany({ where: { id: { in: ids } } }) or deleteMany({ where: { cartId } })
        let ids: string[] = [];
        if (where) {
          if (where.id && Array.isArray(where.id.in)) ids = where.id.in;
          // delete by cartId
          if (where.cartId) {
            const cid = where.cartId;
            let count = 0;
            for (const c of Object.values(carts)) {
              if ((c as any).id === cid) {
                count = (c as any).items?.length || 0;
                (c as any).items = [];
                return { count };
              }
            }
            return { count: 0 };
          }
        }

        let count = 0;
        if (ids.length) {
          for (const c of Object.values(carts)) {
            const before = (c as any).items?.length || 0;
            (c as any).items = (c as any).items?.filter((i: any) => !ids.includes(i.id)) || [];
            count += before - ((c as any).items?.length || 0);
          }
        }
        return { count };
      },
    },
  },
}));

import app from '../../src/app';
export const api = () => request(app);
