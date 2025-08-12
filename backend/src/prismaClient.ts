import { PrismaClient } from '@prisma/client';

// Cast to any to allow access to models not yet defined in the generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = new PrismaClient() as any;
