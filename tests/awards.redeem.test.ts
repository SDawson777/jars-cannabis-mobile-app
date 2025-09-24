import express from 'express';
import request from 'supertest';
import { redeemAward } from '../backend/src/controllers/awardsController';

declare const expect: jest.Expect;

// In-memory stubs
const users: any[] = [];
const awards: any[] = [];
const loyalty: Record<string, { userId: string; points: number; tier: string }> = {};

const prisma: any = {
  user: {
    create: async ({ data }: any) => {
      const u = { id: data.id || `u-${Math.random().toString(36).slice(2, 9)}`, ...data };
      users.push(u);
      return u;
    },
    deleteMany: async () => {
      users.length = 0;
    },
  },
  award: {
    create: async ({ data }: any) => {
      const a = {
        id: data.id || `a-${Math.random().toString(36).slice(2, 9)}`,
        status: 'PENDING',
        redeemedAt: null,
        earnedDate: new Date(),
        ...data,
      };
      awards.push(a);
      return a;
    },
    findUnique: async ({ where: { id } }: any) => awards.find(a => a.id === id) || null,
    update: async ({ where: { id }, data }: any) => {
      const idx = awards.findIndex(a => a.id === id);
      if (idx < 0) throw new Error('Not found');
      awards[idx] = { ...awards[idx], ...data };
      return awards[idx];
    },
    deleteMany: async () => {
      awards.length = 0;
    },
  },
  loyaltyStatus: {
    upsert: async ({ where: { userId }, update, create }: any) => {
      if (!loyalty[userId]) loyalty[userId] = { userId, points: create.points, tier: create.tier };
      if (update?.points?.increment) loyalty[userId].points += update.points.increment;
      return loyalty[userId];
    },
    update: async ({ where: { userId }, data }: any) => {
      Object.assign(loyalty[userId], data);
      return loyalty[userId];
    },
  },
};

function createApp(userId: string) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).user = { id: userId };
    (req as any).prisma = prisma; // inject shared prisma for controller compatibility
    next();
  });
  app.post('/awards/redeem', (req, res) => redeemAward(req as any, res as any));
  return app;
}

describe('redeemAward', () => {
  let userId: string;
  beforeEach(async () => {
    await prisma.award.deleteMany();
    await prisma.user.deleteMany();
    const user = await prisma.user.create({
      data: { email: 'test@example.com', passwordHash: 'hash' },
    });
    userId = user.id;
  });
  afterAll(async () => {});

  it('redeems a pending award', async () => {
    const award = await prisma.award.create({
      data: {
        userId,
        title: 'Badge',
        description: 'Desc',
        iconUrl: 'icon.png',
        earnedDate: new Date(),
      },
    });
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: award.id });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const updated = await prisma.award.findUnique({ where: { id: award.id } });
    expect(updated?.status).toBe('REDEEMED');
    expect(updated?.redeemedAt).not.toBeNull();
  });

  it("rejects redeeming another user's award", async () => {
    const other = await prisma.user.create({
      data: { email: 'other@example.com', passwordHash: 'hash' },
    });
    const award = await prisma.award.create({
      data: {
        userId: other.id,
        title: 'Badge',
        description: 'Desc',
        iconUrl: 'icon.png',
        earnedDate: new Date(),
      },
    });
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: award.id });
    expect(res.status).toBe(403);
  });

  it('handles non-existent award', async () => {
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: 'no-such-id' });
    expect(res.status).toBe(404);
  });
});
