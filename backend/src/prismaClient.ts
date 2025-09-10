import { PrismaClient } from '@prisma/client';

// Lazily create the Prisma client so the backend can boot in demo mode without a DB.
// The actual connection is only attempted when a route first accesses the client.
let prismaInstance: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (!prismaInstance) {
    // If DATABASE_URL is missing, defer throwing until a DB-backed route is called.
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Database-backed endpoints are unavailable in demo mode.'
      );
    }
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

// Type-safe proxy that forwards property access to the real Prisma client on first use
type LazyPrismaClient = {
  [K in keyof PrismaClient]: PrismaClient[K];
};

export const prisma: LazyPrismaClient = new Proxy(
  {} as LazyPrismaClient,
  {
    get<K extends keyof PrismaClient>(_target: LazyPrismaClient, prop: K): PrismaClient[K] {
      const client = getPrismaInstance();
      return client[prop];
    },
  }
);
