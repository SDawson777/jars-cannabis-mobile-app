import express from 'express';
import request from 'supertest';
import { redeemAward } from '../backend/src/controllers/awardsController';
import { rewardsCatalog } from '../backend/src/rewards/catalog';

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
      if (update?.points?.increment) loyalty[userId].points += update.points.increment; // legacy path
      return loyalty[userId];
    },
    update: async ({ where: { userId }, data }: any) => {
      loyalty[userId] = { ...loyalty[userId], ...data };
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
    loyalty[userId] = { userId, points: 600, tier: 'Gold' }; // Seed sufficient points for redemption
  });
  afterAll(async () => {});

  it('redeems a catalog reward and deducts points', async () => {
    const reward = rewardsCatalog[0]; // cost 100
    const starting = loyalty[userId].points;
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: reward.id });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // A new award should have been created representing redemption
    const history = awards.filter(a => a.title === reward.title && a.userId === userId);
    expect(history.length).toBe(1);
    expect(history[0].status).toBe('REDEEMED');
    expect(loyalty[userId].points).toBe(starting - reward.cost);
  });

  it('rejects redeem when insufficient points', async () => {
    const reward = rewardsCatalog[2]; // cost 500
    loyalty[userId].points = 100; // lower than cost
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: reward.id });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('insufficient_points');
  });

  it('handles non-existent award id (legacy path)', async () => {
    const app = createApp(userId);
    const res = await request(app).post('/awards/redeem').send({ awardId: 'no-such-legacy-id' });
    expect(res.status).toBe(404);
  });
});
