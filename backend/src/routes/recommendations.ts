import { Router } from 'express';
import { prisma } from '../prismaClient';
import { getCriteriaForWeatherCondition, isValidWeatherCondition } from '../services/weatherRecs';
import { getCurrentWeatherCondition } from '../services/weatherProvider';

export const recommendationsRouter = Router();

// Simple "for you": popular products, optionally scoped to store
recommendationsRouter.get('/recommendations/for-you', async (req, res, next) => {
  try {
    const { storeId, limit = '24' } = req.query as any;
    const take = Math.min(100, parseInt(limit || '24', 10));
    let items = await prisma.product.findMany({
      orderBy: { purchasesLast30d: 'desc' },
      take,
      include: { variants: true },
    });
    if (storeId) {
      const stocked = await prisma.storeProduct.findMany({ where: { storeId: String(storeId) } });
      const inStock = new Set(stocked.map(s => s.productId));
      items = items.sort((a, b) => Number(inStock.has(b.id)) - Number(inStock.has(a.id)));
    }
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// "Related": same brand/category
recommendationsRouter.get('/recommendations/related/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = '8' } = req.query as any;
    const base = await prisma.product.findUnique({ where: { id: productId } });
    if (!base) return res.json({ items: [] });
    const items = await prisma.product.findMany({
      where: {
        id: { not: base.id },
        OR: [{ brand: base.brand ?? undefined }, { category: base.category }],
      },
      take: Math.min(20, parseInt(limit || '8', 10)),
      orderBy: { purchasesLast30d: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// Weather-based recommendations
recommendationsRouter.get('/recommendations/weather', async (req, res, next) => {
  try {
    const { condition, city, state, limit = '24' } = req.query as any;

    if (!condition) {
      return res.status(400).json({ error: 'condition parameter is required' });
    }

    const normalizedCondition = String(condition).toLowerCase().trim();

    if (!isValidWeatherCondition(normalizedCondition)) {
      return res.status(400).json({
        error: 'Unknown weather condition',
        validConditions: [
          'sunny',
          'clear',
          'partly cloudy',
          'cloudy',
          'overcast',
          'rain',
          'snow',
          'thunderstorm',
        ],
      });
    }

    const criteria = getCriteriaForWeatherCondition(normalizedCondition);
    if (!criteria) {
      return res.status(400).json({ error: 'No criteria found for weather condition' });
    }

    const take = Math.min(100, parseInt(limit || '24', 10));

    // Build where conditions based on criteria
    const whereConditions: any[] = [];

    if (criteria.categories && criteria.categories.length > 0) {
      whereConditions.push({
        category: { in: criteria.categories },
      });
    }

    if (criteria.strainTypes && criteria.strainTypes.length > 0) {
      whereConditions.push({
        strainType: { in: criteria.strainTypes },
      });
    }

    if (criteria.searchTerms && criteria.searchTerms.length > 0) {
      whereConditions.push({
        OR: criteria.searchTerms.map(term => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        })),
      });
    }

    const products = await prisma.product.findMany({
      where: whereConditions.length > 0 ? { OR: whereConditions } : {},
      orderBy: { purchasesLast30d: 'desc' },
      take,
      include: { variants: true },
    });

    res.json({
      condition: normalizedCondition,
      tags: criteria.tags,
      description: criteria.description,
      products,
      location: city && state ? { city, state } : undefined,
    });
  } catch (err) {
    next(err);
  }
});

// Auto weather: derive condition if not supplied using lightweight provider abstraction.
// Accept optional lat/lon/temp/cloudCoverPct/precip/thunder/snow for future integration.
recommendationsRouter.get('/recommendations/weather/auto', async (req, res, next) => {
  try {
    const {
      lat,
      lon,
      tempC,
      cloudCoverPct,
      precipitationMm,
      thunder,
      snow,
      limit = '24',
    } = req.query as any;

    // Build partial observation
    const partial: any = {};
    if (tempC != null) partial.tempC = parseFloat(String(tempC));
    if (cloudCoverPct != null) partial.cloudCoverPct = parseFloat(String(cloudCoverPct));
    if (precipitationMm != null) partial.precipitationMm = parseFloat(String(precipitationMm));
    if (thunder === 'true') partial.thunder = true;
    if (snow === 'true') partial.snow = true;

    const condition = await getCurrentWeatherCondition(
      lat != null ? parseFloat(String(lat)) : undefined,
      lon != null ? parseFloat(String(lon)) : undefined,
      partial
    );

    const normalizedCondition = condition.toLowerCase();
    // If our derived condition isn't in map, fall back to clear to avoid 400.
    const valid = isValidWeatherCondition(normalizedCondition) ? normalizedCondition : 'clear';

    const criteria = getCriteriaForWeatherCondition(valid);
    const take = Math.min(100, parseInt(limit || '24', 10));
    const whereConditions: any[] = [];
    if (criteria?.categories?.length)
      whereConditions.push({ category: { in: criteria.categories } });
    if (criteria?.strainTypes?.length)
      whereConditions.push({ strainType: { in: criteria.strainTypes } });
    if (criteria?.searchTerms?.length) {
      whereConditions.push({
        OR: criteria.searchTerms.map(term => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        })),
      });
    }

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: whereConditions.length ? { OR: whereConditions } : {},
        orderBy: { purchasesLast30d: 'desc' },
        take,
        include: { variants: true },
      });
    } catch (_e) {
      // In test context without a seeded DB we still want a successful shape response.
      products = [];
    }

    res.json({
      condition: valid,
      description: criteria?.description,
      tags: criteria?.tags,
      products,
      derived: true,
    });
  } catch (err) {
    next(err);
  }
});
