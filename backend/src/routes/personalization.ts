import { Router } from 'express';
import { prisma } from '../prismaClient';
import { env } from '../env';

export const personalizationRouter = Router();

// ForYouTodayPayload: try DB-driven recommendations when DATABASE_URL is set,
// otherwise return seeded fixture data so demo mode and tests remain stable.
personalizationRouter.get('/personalization/home', async (req, res) => {
  const storeId = (req.query as any).storeId as string | undefined;
  const limit = Math.min(24, parseInt(((req.query as any).limit as any) || '6', 10));

  // If no DB is configured, skip touching the lazy prisma proxy which throws in demo mode.
  if (env.DATABASE_URL) {
    try {
      // Prefer DB-driven products if the Prisma client is available
      const items = await prisma.product.findMany({
        take: limit,
        orderBy: { purchasesLast30d: 'desc' as any },
        include: { variants: true },
      });

      let results = items;
      if (storeId && prisma.storeProduct) {
        try {
          const stocked = await prisma.storeProduct.findMany({
            where: { storeId: String(storeId) },
          });
          const inStock = new Set(stocked.map((s: any) => s.productId));
          results = results.sort(
            (a: any, b: any) => Number(inStock.has(b.id)) - Number(inStock.has(a.id))
          );
        } catch {
          // ignore store scoping failures
        }
      }

      const products = results.map((p: any) => {
        const price = p.variants && p.variants.length ? p.variants[0].price : p.price || 0;
        return { id: p.id, name: p.name, price, image: p.image ?? null };
      });

      return res.json({ greeting: 'Hi there', message: 'Recommended for you', products });
    } catch (err) {
      // If DB call fails, fall through to fixture
      console.debug(
        'personalization: DB lookup failed, using fixture',
        (err as any)?.message || err
      );
    }
  }

  // Fixture fallback
  const fixture = {
    greeting: 'Good morning',
    message: 'Here are some picks for you today',
    products: [
      { id: 'prod_1', name: 'Daily Blend', price: 1999, image: '/images/prod_1.png' },
      { id: 'prod_2', name: 'Sleep Tincture', price: 2499, image: '/images/prod_2.png' },
    ],
  };
  res.json(fixture);
});

/**
 * POST /personalization/apply
 * Apply personalization rules to reorder content slugs based on user context
 */
personalizationRouter.post('/personalization/apply', async (req, res) => {
  try {
    const {
      slugs,
      userId: _userId,
      sessionId: _sessionId,
      channel,
      locationState,
      preferences,
    } = req.body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({ error: 'slugs array is required' });
    }

    // Try to apply personalization rules from database
    if (env.DATABASE_URL) {
      try {
        // Check for active personalization rules
        const rules = await (prisma as any).personalizationRule?.findMany?.({
          where: {
            active: true,
            ...(channel ? { channels: { has: channel } } : {}),
          },
          orderBy: { priority: 'desc' },
        });

        if (rules && rules.length > 0) {
          const boosts: Record<string, number> = {};
          const now = new Date();
          const hour = now.getHours();

          // Apply rules
          for (const rule of rules) {
            // Time-based rules (e.g., morning deals boost)
            if (rule.type === 'time_boost' && rule.config) {
              const config =
                typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
              if (hour >= (config.startHour || 0) && hour < (config.endHour || 24)) {
                (config.targetSlugs || []).forEach((slug: string) => {
                  boosts[slug] = (boosts[slug] || 0) + (config.boostScore || 10);
                });
              }
            }

            // Location-based rules
            if (rule.type === 'location_boost' && locationState && rule.config) {
              const config =
                typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
              if (config.states?.includes(locationState)) {
                (config.targetSlugs || []).forEach((slug: string) => {
                  boosts[slug] = (boosts[slug] || 0) + (config.boostScore || 5);
                });
              }
            }

            // User preference-based rules
            if (rule.type === 'preference_boost' && preferences && rule.config) {
              const config =
                typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
              const matchedPrefs = Object.keys(preferences).filter(
                k => config.preferenceKeys?.includes(k) && preferences[k]
              );
              if (matchedPrefs.length > 0) {
                (config.targetSlugs || []).forEach((slug: string) => {
                  boosts[slug] =
                    (boosts[slug] || 0) + (config.boostScore || 3) * matchedPrefs.length;
                });
              }
            }
          }

          // Sort slugs by boost score
          const rankedSlugs = [...slugs].sort((a, b) => {
            const scoreA = boosts[a] || 0;
            const scoreB = boosts[b] || 0;
            return scoreB - scoreA;
          });

          return res.json({
            rankedSlugs,
            boosts,
            fallback: false,
          });
        }
      } catch (err) {
        console.debug('personalization/apply: DB lookup failed', (err as any)?.message || err);
      }
    }

    // Fallback: return slugs in original order
    return res.json({
      rankedSlugs: slugs,
      fallback: true,
    });
  } catch (err) {
    console.error('personalization/apply error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default personalizationRouter;
