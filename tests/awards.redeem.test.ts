import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { redeemAward } from '../backend/src/controllers/awardsController';

declare const expect: jest.Expect;

const prisma = new PrismaClient();

function createApp(userId: string) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).user = { id: userId };
    next();
  });
  app.post('/awards/redeem', (req, res) => redeemAward(req as any, res as any));
  return app;
}

describe('redeemAward', () => {
  let userId: string;
  beforeAll(async () => {
    await prisma.$connect();
  });
  beforeEach(async () => {
    await prisma.award.deleteMany();
    await prisma.user.deleteMany();
    const user = await prisma.user.create({
      data: { email: 'test@example.com', passwordHash: 'hash' },
    });
    userId = user.id;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

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
