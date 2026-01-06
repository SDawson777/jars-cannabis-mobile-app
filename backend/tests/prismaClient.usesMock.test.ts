import { prisma } from '../src/prismaClient';

describe('prismaClient (test env)', () => {
  it('uses the in-memory prisma mock in Jest', () => {
    // The real PrismaClient exposes many "$" methods; our in-memory mock intentionally does not.
    expect((prisma as any).$transaction).toBeUndefined();
    expect((prisma as any).$connect).toBeUndefined();
  });
});
