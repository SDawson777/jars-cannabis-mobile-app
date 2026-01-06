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
import app from '../../src/app';
export const api = () => request(app);
