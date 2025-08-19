import { PrismaClient } from '@prisma/client';

// Lazily create the Prisma client so the backend can boot in demo mode without a DB.
// The actual connection is only attempted when a route first accesses the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaInstance: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPrismaInstance(): any {
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

// Proxy forwards property access to the real Prisma client on first use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy(
  {},
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_target: any, prop: string) {
      const client = getPrismaInstance();
      // @ts-ignore dynamic property access to Prisma client delegates
      return client[prop];
    },
  }
);
