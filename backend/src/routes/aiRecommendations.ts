// backend/src/routes/aiRecommendations.ts
// AI-driven recommendations - ML models, journal insights, peer behavior

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

export const aiRecommendationsRouter = Router();

// ============================================
// Recommendation Endpoints
// ============================================

/**
 * GET /ai/recommendations
 * Get personalized AI recommendations
 */
aiRecommendationsRouter.get(
  '/ai/recommendations',
  requireAuth,
  async (req: Request, res: Response) => {
    const { context: _context, limit: _limit = '10' } = req.query;
    const _userId = (req as any).user?.uid;

    try {
      res.json({
        recommendations: [
          {
            id: 'rec-1',
            productId: 'prod-flower-1',
            productName: 'Blue Dream',
            productImage: 'https://assets.nimbus.app/products/flower-1.jpg',
            category: 'Flower',
            score: 0.95,
            reason: 'Based on your preference for sativa-dominant hybrids',
            reasoning: [
              {
                type: 'preference',
                text: 'Matches your preference for creative/energetic effects',
                weight: 0.4,
              },
              {
                type: 'journal',
                text: 'Similar to strains you rated highly in journal',
                weight: 0.35,
              },
              { type: 'purchase', text: "You've enjoyed similar products before", weight: 0.25 },
            ],
          },
          {
            id: 'rec-2',
            productId: 'prod-cart-2',
            productName: 'Lemon Haze Cart',
            productImage: 'https://assets.nimbus.app/products/cart-2.jpg',
            category: 'Cartridges',
            score: 0.88,
            reason: 'Popular with users who like Blue Dream',
            reasoning: [
              { type: 'peer', text: '72% of similar users enjoyed this', weight: 0.5 },
              { type: 'terpene', text: 'High in limonene which you prefer', weight: 0.3 },
              { type: 'trending', text: 'Currently trending in your area', weight: 0.2 },
            ],
          },
          {
            id: 'rec-3',
            productId: 'prod-edible-1',
            productName: 'Calm Gummies',
            productImage: 'https://assets.nimbus.app/products/gummy-1.jpg',
            category: 'Edibles',
            score: 0.82,
            reason: 'Great for your evening relaxation goal',
            reasoning: [
              { type: 'effect', text: 'Matches your evening relaxation preference', weight: 0.6 },
              {
                type: 'journal',
                text: 'Your journal shows positive edible experiences',
                weight: 0.4,
              },
            ],
          },
        ],
        modelVersion: '2.3.1',
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
);

/**
 * GET /ai/recommendations/similar/:productId
 * Get similar products
 */
aiRecommendationsRouter.get(
  '/ai/recommendations/similar/:productId',
  async (req: Request, res: Response) => {
    const { productId: _productId } = req.params;
    const { limit: _limit = '5' } = req.query;

    try {
      res.json({
        products: [
          {
            id: 'prod-2',
            name: 'Green Crack',
            similarity: 0.92,
            reason: 'Similar terpene profile',
          },
          { id: 'prod-3', name: 'Sour Diesel', similarity: 0.88, reason: 'Same effect category' },
          { id: 'prod-4', name: 'Jack Herer', similarity: 0.85, reason: 'Similar THC:CBD ratio' },
        ],
      });
    } catch (error) {
      console.error('Similar products error:', error);
      res.status(500).json({ error: 'Failed to get similar products' });
    }
  }
);

/**
 * GET /ai/recommendations/frequently-bought-together/:productId
 * Get frequently bought together products
 */
aiRecommendationsRouter.get(
  '/ai/recommendations/frequently-bought-together/:productId',
  async (req: Request, res: Response) => {
    const { productId: _productId } = req.params;

    try {
      res.json({
        products: [
          { id: 'prod-grinder-1', name: 'Premium Grinder', frequency: 0.45 },
          { id: 'prod-papers-1', name: 'Organic Rolling Papers', frequency: 0.38 },
          { id: 'prod-lighter-1', name: 'Hemp Wick Lighter', frequency: 0.25 },
        ],
      });
    } catch (error) {
      console.error('Frequently bought error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }
);

/**
 * GET /ai/recommendations/effects
 * Get recommendations by desired effects
 */
aiRecommendationsRouter.get('/ai/recommendations/effects', async (req: Request, res: Response) => {
  const { effects } = req.query;
  const effectsArray = typeof effects === 'string' ? effects.split(',') : [];

  try {
    res.json({
      recommendations: [
        { productId: 'prod-1', productName: 'Blue Dream', matchScore: 0.95, effects: effectsArray },
        {
          productId: 'prod-2',
          productName: 'Green Crack',
          matchScore: 0.88,
          effects: effectsArray,
        },
      ],
    });
  } catch (error) {
    console.error('Effects recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * GET /ai/recommendations/mood
 * Get recommendations by mood
 */
aiRecommendationsRouter.get('/ai/recommendations/mood', async (req: Request, res: Response) => {
  const { mood, timeOfDay } = req.query;

  try {
    const moodProducts: Record<string, any[]> = {
      relaxed: [
        { productId: 'prod-indica-1', productName: 'Purple Kush', matchScore: 0.92 },
        { productId: 'prod-edible-1', productName: 'Sleep Gummies', matchScore: 0.88 },
      ],
      energized: [
        { productId: 'prod-sativa-1', productName: 'Green Crack', matchScore: 0.95 },
        { productId: 'prod-cart-1', productName: 'Sativa Cart', matchScore: 0.9 },
      ],
      focused: [
        { productId: 'prod-sativa-2', productName: 'Durban Poison', matchScore: 0.93 },
        { productId: 'prod-micro-1', productName: 'Focus Microdose', matchScore: 0.89 },
      ],
    };

    res.json({
      mood: mood || 'relaxed',
      timeOfDay: timeOfDay || 'evening',
      recommendations: moodProducts[(mood as string) || 'relaxed'] || moodProducts.relaxed,
    });
  } catch (error) {
    console.error('Mood recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// ============================================
// User Profile Endpoints
// ============================================

/**
 * GET /ai/profile
 * Get user preference profile
 */
aiRecommendationsRouter.get('/ai/profile', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.uid;

  try {
    res.json({
      userId,
      preferences: {
        categories: [
          { category: 'Flower', weight: 0.45 },
          { category: 'Edibles', weight: 0.3 },
          { category: 'Cartridges', weight: 0.25 },
        ],
        effects: [
          { effect: 'relaxed', weight: 0.35 },
          { effect: 'creative', weight: 0.25 },
          { effect: 'energetic', weight: 0.2 },
          { effect: 'sleepy', weight: 0.2 },
        ],
        terpenes: [
          { terpene: 'limonene', weight: 0.3 },
          { terpene: 'myrcene', weight: 0.25 },
          { terpene: 'caryophyllene', weight: 0.2 },
        ],
        potencyRange: { min: 18, max: 28 },
        priceRange: { min: 25, max: 60 },
        preferredTimes: ['evening', 'weekend'],
      },
      journalStats: {
        totalEntries: 45,
        averageRating: 4.2,
        mostLoggedEffects: ['relaxed', 'happy', 'creative'],
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * POST /ai/profile
 * Update user preference profile
 */
aiRecommendationsRouter.post('/ai/profile', requireAuth, async (req: Request, res: Response) => {
  const { preferences } = req.body;
  const userId = (req as any).user?.uid;

  try {
    res.json({
      userId,
      preferences,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================
// Journal Insights Endpoints
// ============================================

/**
 * GET /ai/insights/journal
 * Get insights from journal entries
 */
aiRecommendationsRouter.get(
  '/ai/insights/journal',
  requireAuth,
  async (req: Request, res: Response) => {
    const _userId = (req as any).user?.uid;

    try {
      res.json({
        insights: [
          {
            type: 'pattern',
            title: 'Evening Relaxation',
            description: 'You tend to enjoy indica strains in the evening with great results',
            confidence: 0.92,
            actionable: true,
            suggestion: 'Try our curated Evening Relaxation collection',
          },
          {
            type: 'discovery',
            title: 'Terpene Preference',
            description: 'Products high in limonene consistently rate well in your journal',
            confidence: 0.88,
            actionable: true,
            suggestion: 'Look for limonene-rich products for best experience',
          },
          {
            type: 'timing',
            title: 'Optimal Dosing',
            description: 'Your best experiences occur with moderate doses (15-20mg edibles)',
            confidence: 0.85,
            actionable: true,
            suggestion: 'Consider our 15mg gummy packs for consistent experiences',
          },
        ],
        summary: {
          totalEntriesAnalyzed: 45,
          dateRange: { start: '2024-06-01', end: new Date().toISOString().split('T')[0] },
        },
      });
    } catch (error) {
      console.error('Journal insights error:', error);
      res.status(500).json({ error: 'Failed to get insights' });
    }
  }
);

/**
 * GET /ai/insights/journal/recommendations
 * Get recommendations based on journal patterns
 */
aiRecommendationsRouter.get(
  '/ai/insights/journal/recommendations',
  requireAuth,
  async (req: Request, res: Response) => {
    const _userId = (req as any).user?.uid;

    try {
      res.json({
        recommendations: [
          {
            productId: 'prod-indica-1',
            productName: 'Purple Kush',
            reason: 'Matches your successful evening sessions',
            journalCorrelation: 0.91,
          },
          {
            productId: 'prod-edible-2',
            productName: '15mg Hybrid Gummies',
            reason: 'Your optimal edible dosage based on journal data',
            journalCorrelation: 0.87,
          },
        ],
      });
    } catch (error) {
      console.error('Journal recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
);

// ============================================
// Peer Recommendations Endpoints
// ============================================

/**
 * GET /ai/recommendations/peers
 * Get recommendations based on similar users
 */
aiRecommendationsRouter.get(
  '/ai/recommendations/peers',
  requireAuth,
  async (req: Request, res: Response) => {
    const _userId = (req as any).user?.uid;

    try {
      res.json({
        recommendations: [
          {
            productId: 'prod-1',
            productName: 'Blue Dream',
            peerScore: 0.89,
            reason: '85% of users with similar preferences enjoyed this',
            reviews: 124,
            averageRating: 4.6,
          },
          {
            productId: 'prod-2',
            productName: 'GSC',
            peerScore: 0.82,
            reason: 'Popular among users who like your top products',
            reviews: 89,
            averageRating: 4.4,
          },
        ],
        cohortSize: 1250,
      });
    } catch (error) {
      console.error('Peer recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
);

/**
 * GET /ai/recommendations/users-also-bought
 * Get "users who bought X also bought Y"
 */
aiRecommendationsRouter.get(
  '/ai/recommendations/users-also-bought',
  async (req: Request, res: Response) => {
    const { productId: _productId, orderId: _orderId } = req.query;

    try {
      res.json({
        products: [
          { productId: 'prod-5', productName: 'Hemp Wick', confidence: 0.78 },
          { productId: 'prod-6', productName: 'Grinder', confidence: 0.65 },
          { productId: 'prod-7', productName: 'Stash Jar', confidence: 0.52 },
        ],
      });
    } catch (error) {
      console.error('Also bought error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }
);

// ============================================
// Feedback Endpoints
// ============================================

/**
 * GET /ai/feedback
 * Get user's recommendation feedback history
 */
aiRecommendationsRouter.get('/ai/feedback', requireAuth, async (req: Request, res: Response) => {
  const _userId = (req as any).user?.uid;

  try {
    res.json({
      feedback: [
        {
          recommendationId: 'rec-1',
          rating: 5,
          helpful: true,
          purchased: true,
          createdAt: new Date().toISOString(),
        },
        {
          recommendationId: 'rec-2',
          rating: 3,
          helpful: false,
          purchased: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

/**
 * POST /ai/feedback/rate
 * Rate a recommendation
 */
aiRecommendationsRouter.post(
  '/ai/feedback/rate',
  requireAuth,
  async (req: Request, res: Response) => {
    const { recommendationId, productId, rating, helpful, reason } = req.body;
    const userId = (req as any).user?.uid;

    if (!recommendationId || rating === undefined) {
      return res.status(400).json({ error: 'recommendationId and rating are required' });
    }

    try {
      res.json({
        id: `fb-${Date.now()}`,
        recommendationId,
        productId,
        rating,
        helpful,
        reason,
        userId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Rate error:', error);
      res.status(500).json({ error: 'Failed to submit rating' });
    }
  }
);

/**
 * POST /ai/feedback/dismiss
 * Dismiss a recommendation
 */
aiRecommendationsRouter.post(
  '/ai/feedback/dismiss',
  requireAuth,
  async (req: Request, res: Response) => {
    const { recommendationId, productId: _productId, reason: _reason } = req.body;
    const _userId = (req as any).user?.uid;

    try {
      res.json({
        success: true,
        recommendationId,
      });
    } catch (error) {
      console.error('Dismiss error:', error);
      res.status(500).json({ error: 'Failed to dismiss' });
    }
  }
);

// ============================================
// Model Metrics Endpoints
// ============================================

/**
 * GET /ai/metrics
 * Get AI model performance metrics
 */
aiRecommendationsRouter.get('/ai/metrics', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      modelVersion: '2.3.1',
      lastTrainedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        clickThroughRate: 0.32,
        conversionRate: 0.18,
        averageRating: 4.2,
        precision: 0.85,
        recall: 0.78,
        f1Score: 0.81,
      },
      trainingData: {
        totalUsers: 45000,
        totalInteractions: 2500000,
        journalEntries: 180000,
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * POST /ai/retrain
 * Trigger model retraining (admin)
 */
aiRecommendationsRouter.post('/ai/retrain', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      jobId: `train-${Date.now()}`,
      status: 'queued',
      estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Retrain error:', error);
    res.status(500).json({ error: 'Failed to trigger retraining' });
  }
});

// ============================================
// Trending & Discovery Endpoints
// ============================================

/**
 * GET /ai/trending
 * Get trending products
 */
aiRecommendationsRouter.get('/ai/trending', async (req: Request, res: Response) => {
  const { category: _category, location, timeframe } = req.query;

  try {
    res.json({
      trending: [
        {
          productId: 'prod-1',
          productName: 'Blue Dream',
          rank: 1,
          trendScore: 0.95,
          salesGrowth: 45,
        },
        {
          productId: 'prod-2',
          productName: 'Wedding Cake',
          rank: 2,
          trendScore: 0.88,
          salesGrowth: 38,
        },
        { productId: 'prod-3', productName: 'Gelato', rank: 3, trendScore: 0.82, salesGrowth: 32 },
        { productId: 'prod-4', productName: 'OG Kush', rank: 4, trendScore: 0.78, salesGrowth: 28 },
        { productId: 'prod-5', productName: 'Runtz', rank: 5, trendScore: 0.75, salesGrowth: 25 },
      ],
      timeframe: timeframe || '7d',
      location: location || 'all',
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ error: 'Failed to get trending' });
  }
});

/**
 * GET /ai/discovery
 * Get discovery recommendations (new & interesting products)
 */
aiRecommendationsRouter.get('/ai/discovery', requireAuth, async (req: Request, res: Response) => {
  const _userId = (req as any).user?.uid;

  try {
    res.json({
      discovery: [
        {
          productId: 'prod-new-1',
          productName: 'Jealousy',
          reason: 'New arrival matching your preferences',
          isNew: true,
          discoveryScore: 0.88,
        },
        {
          productId: 'prod-hidden-1',
          productName: 'Cherry Pie',
          reason: 'Hidden gem with great reviews',
          isNew: false,
          discoveryScore: 0.82,
        },
      ],
    });
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Failed to get discovery' });
  }
});

/**
 * POST /ai/personalized-ranking
 * Get personalized product ranking for a list
 */
aiRecommendationsRouter.post(
  '/ai/personalized-ranking',
  requireAuth,
  async (req: Request, res: Response) => {
    const { productIds, context: _context } = req.body;
    const _userId = (req as any).user?.uid;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    try {
      // Mock personalized ranking
      const ranked = productIds.map((id: string, index: number) => ({
        productId: id,
        personalizedRank: index + 1,
        score: 1 - index * 0.1,
      }));

      res.json({ ranked });
    } catch (error) {
      console.error('Ranking error:', error);
      res.status(500).json({ error: 'Failed to rank products' });
    }
  }
);
