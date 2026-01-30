// Shared in-memory Prisma mock for backend Jest tests.
// This intentionally implements only the subset of Prisma used by route-level tests.

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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

// In-memory brands store keyed by id
const brands: Record<string, any> = {
  brand_1: {
    id: 'brand_1',
    name: 'Nimbus',
    slug: 'nimbus',
    primaryColor: null,
    secondaryColor: null,
    logoUrl: null,
  },
};

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

function randId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function matchesWhere(obj: any, where: any): boolean {
  if (!where) return true;

  // OR support (very small subset)
  if (Array.isArray(where.OR)) {
    return where.OR.some((cond: any) => matchesWhere(obj, cond));
  }

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') continue;

    // nested contains
    if (value && typeof value === 'object') {
      const v: any = value;
      if (typeof v.contains === 'string') {
        const hay = String(obj[key] ?? '');
        const needle = String(v.contains);
        const insensitive = v.mode === 'insensitive';
        if (insensitive) {
          if (!hay.toLowerCase().includes(needle.toLowerCase())) return false;
        } else {
          if (!hay.includes(needle)) return false;
        }
        continue;
      }
      if (typeof v.gte === 'number' || typeof v.lte === 'number') {
        const num = Number(obj[key] ?? 0);
        if (typeof v.gte === 'number' && num < v.gte) return false;
        if (typeof v.lte === 'number' && num > v.lte) return false;
        continue;
      }
      if (Array.isArray(v.in)) {
        if (!v.in.includes((obj as any)[key])) return false;
        continue;
      }
      if (key === 'id' && typeof v.not === 'string') {
        if (obj.id === v.not) return false;
        continue;
      }
    }

    if ((obj as any)[key] !== value) return false;
  }
  return true;
}

export const prisma = {
  brand: {
    findMany: async (_args: any = {}) => {
      return Object.values(brands);
    },
    findUnique: async ({ where: { slug, id } = { slug: undefined, id: undefined } }: any) => {
      if (id) return brands[id] ?? null;
      if (slug) return Object.values(brands).find((b: any) => b.slug === slug) ?? null;
      return null;
    },
  },
  award: {
    findMany: async ({ where: { userId } = { userId: undefined } }: any) => {
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
      const id = data.id || randId('awd');
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
      const id = data.id || randId('user');
      const u = { id, email: data.email, passwordHash: data.passwordHash, ...data };
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
        (c as any).items = (c as any).items.filter(
          (x: any) => !(id && id.in && id.in.includes(x.id))
        );
      }
      return { count: 0 };
    },
  },
  product: {
    findMany: async ({ where, take = 24, skip = 0, orderBy }: any = {}) => {
      let items = [...seededProducts];
      if (where) items = items.filter(p => matchesWhere(p, where));
      if (orderBy && typeof orderBy === 'object') {
        const [field, dir] = Object.entries(orderBy)[0] as any;
        items.sort((a: any, b: any) => {
          const av = a[field];
          const bv = b[field];
          if (av === bv) return 0;
          if (dir === 'desc') return av < bv ? 1 : -1;
          return av > bv ? 1 : -1;
        });
      }
      return items.slice(skip, skip + take);
    },
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
      if ((orderBy as any).updatedAt === 'desc') {
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
      const id = randId('je');
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
    findMany: async ({ where: { productId } }: any) => {
      void productId;
      return [];
    },
    create: async ({ data }: any) => ({
      id: randId('r'),
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
    findMany: async ({ where: { id } }: any) => {
      const ids: string[] = id?.in || [];
      const out: any[] = [];
      for (const p of seededProducts) {
        for (const v of p.variants || []) {
          if (ids.includes(v.id)) out.push(v);
        }
      }
      return out;
    },
  },
  store: {
    findUnique: async ({ where: { id } }: any) => (id ? { id, name: `Store ${id}` } : null),
  },
  paymentMethod: {
    findMany: async ({ where = {} }: any) => {
      const all = Object.values(paymentMethods).filter(
        (pm: any) => !where.userId || pm.userId === where.userId
      );
      all.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
      return all;
    },
    findUnique: async ({ where: { id } }: any) => paymentMethods[id] ?? null,
    create: async ({ data }: any) => {
      const id = randId('pm');
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
      const notId = (where as any).id && (where as any).id.not;
      let count = 0;
      for (const k of Object.keys(paymentMethods)) {
        const pm = paymentMethods[k];
        if ((where as any).userId && pm.userId !== (where as any).userId) continue;
        if (notId && pm.id === notId) continue;
        Object.assign(pm, data);
        pm.updatedAt = new Date().toISOString();
        count++;
      }
      return { count };
    },
    delete: async ({ where: { id } }: any) => {
      const existing = paymentMethods[id];
      if (!existing) throw new Error('Not found');
      delete paymentMethods[id];
      return existing;
    },
  },
  address: {
    findMany: async ({ where = {} }: any) => {
      const all = Object.values(addresses).filter(
        (a: any) => !where.userId || a.userId === where.userId
      );
      all.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
      return all;
    },
    findUnique: async ({ where: { id } }: any) => addresses[id] ?? null,
    create: async ({ data }: any) => {
      const id = randId('addr');
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
      const notId = (where as any).id && (where as any).id.not;
      let count = 0;
      for (const k of Object.keys(addresses)) {
        const a = addresses[k];
        if ((where as any).userId && a.userId !== (where as any).userId) continue;
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
      let res = (where as any).userId ? arr.filter(o => o.userId === (where as any).userId) : arr;
      if ((where as any).status) {
        const s = String((where as any).status).toLowerCase();
        res = res.filter(o => String(o.status || '').toLowerCase() === s);
      }
      return res;
    },
    findFirst: async ({ where = {} }: any) =>
      (Object.values(mockOrders) as any[]).find(
        (o: any) =>
          o.id === (where as any).id &&
          (!(where as any).userId || o.userId === (where as any).userId)
      ) ?? null,
    findUnique: async ({ where: { id } }: any) => mockOrders[id] ?? null,
    create: async ({ data }: any) => {
      const id = randId('order');
      const createdAt = new Date().toISOString();
      const o = {
        id,
        userId: data.userId,
        storeId: data.storeId,
        status: data.status ?? 'PENDING',
        items: (data.items?.create || []).map((it: any, i: number) => ({ id: `oi-${i}`, ...it })),
        subtotal: data.subtotal ?? 0,
        tax: data.tax ?? 0,
        total: data.total ?? 0,
        createdAt,
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
      if (id) return (Object.values(carts) as any[]).find((c: any) => c.id === id) ?? null;
      return null;
    },
    create: async ({ data }: any) => {
      const id = randId('cart');
      const c = { id, userId: data.userId, storeId: data.storeId || null, items: [] };
      carts[data.userId] = c;
      return c;
    },
    findUnique: async ({ where: { id } }: any) =>
      (Object.values(carts) as any[]).find((c: any) => c.id === id) ?? null,
    update: async ({ where: { id }, data }: any) => {
      const c = (Object.values(carts) as any[]).find((x: any) => x.id === id);
      if (!c) throw new Error('Not found');
      Object.assign(c, data);
      return c;
    },
  },
  cartItem: {
    findMany: async ({ where: { cartId } }: any) => {
      const cart = (Object.values(carts) as any[]).find((c: any) => c.id === cartId);
      return cart ? cart.items || [] : [];
    },
    findUnique: async ({ where: { id }, include }: any) => {
      for (const cart of Object.values(carts)) {
        const item = (cart as any).items?.find((i: any) => i.id === id);
        if (item) {
          if (include?.cart) {
            return { ...item, cart, cartId: (cart as any).id };
          }
          return { ...item, cartId: (cart as any).id };
        }
      }
      return null;
    },
    create: async ({ data }: any) => {
      const id = randId('ci');
      const item = { id, ...data };
      const cart = (Object.values(carts) as any[]).find((c: any) => c.id === data.cartId);
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
        if (where.cartId) {
          const cid = where.cartId;
          for (const c of Object.values(carts)) {
            if ((c as any).id === cid) {
              const count = (c as any).items?.length || 0;
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

  // Minimal shims for tables used by profile routes
  userPreference: {
    findUnique: async ({ where: { userId } }: any) => null,
    upsert: async ({ where: { userId }, create, update }: any) => ({
      userId,
      ...(update || create),
    }),
  },
} as any;
