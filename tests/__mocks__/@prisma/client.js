// Minimal manual JS mock for @prisma/client used in unit tests.
// Keeps small in-memory collections per model and implements the
// subset of delegate methods the tests expect.
// Placing this as a manual mock ensures modules that import
// @prisma/client at module-eval time receive the mock.

// Shared in-memory store across all PrismaClient instances so tests that
// instantiate separate PrismaClient objects (test code vs. controllers)
// operate on the same data.
const __STORE = {
  user: [],
  award: [],
  order: [],
  cart: [],
  cartItem: [],
  product: [],
  productVariant: [],
  loyaltyBadge: [],
};

function makeDelegate(collection) {
  return {
    deleteMany: jest.fn(async (q) => {
      const before = collection.length;
      collection.length = 0;
      return { count: before };
    }),
    create: jest.fn(async ({ data }) => {
      const item = { id: `${Math.random().toString(36).slice(2,9)}`, ...(data || {}) };
      collection.push(item);
      return item;
    }),
    findUnique: jest.fn(async ({ where }) => {
      if (!where) return null;
      const key = Object.keys(where)[0];
      return collection.find(item => String(item[key]) === String(where[key])) || null;
    }),
    findMany: jest.fn(async (q) => {
      return collection.slice();
    }),
    update: jest.fn(async ({ where, data }) => {
      const key = Object.keys(where)[0];
      const item = collection.find(i => String(i[key]) === String(where[key]));
      if (!item) return null;
      Object.assign(item, data || {});
      return item;
    }),
    upsert: jest.fn(async ({ where, create, update }) => {
      const key = Object.keys(where)[0];
      const found = collection.find(i => String(i[key]) === String(where[key]));
      if (found) {
        Object.assign(found, update || {});
        return found;
      }
      const item = { id: `${Math.random().toString(36).slice(2,9)}`, ...(create || {}) };
      collection.push(item);
      return item;
    }),
  };
}

class PrismaClient {
  constructor() {
  // Use the shared store slices
  this._store = __STORE;

  this.user = makeDelegate(this._store.user);
  this.award = makeDelegate(this._store.award);
  this.order = makeDelegate(this._store.order);
  this.cart = makeDelegate(this._store.cart);
  this.cartItem = makeDelegate(this._store.cartItem);
  this.product = makeDelegate(this._store.product);
  this.productVariant = makeDelegate(this._store.productVariant);
  this.loyaltyBadge = makeDelegate(this._store.loyaltyBadge);
  }

  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
}

module.exports = { PrismaClient };
