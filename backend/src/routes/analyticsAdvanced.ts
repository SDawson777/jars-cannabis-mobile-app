// backend/src/routes/analyticsAdvanced.ts
// Advanced analytics: dashboards, segmentation, cohorts, funnels, A/B testing

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';

export const analyticsAdvancedRouter = Router();

// ============================================
// Dashboard Endpoints
// ============================================

/**
 * GET /analytics/dashboards
 * Get all analytics dashboards
 */
analyticsAdvancedRouter.get('/analytics/dashboards', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      dashboards: [
        {
          id: 'dashboard-1',
          name: 'Overview',
          description: 'Key business metrics at a glance',
          widgets: [
            { id: 'w1', type: 'metric', title: 'Revenue', config: { metric: 'revenue' }, position: { x: 0, y: 0, w: 3, h: 2 } },
            { id: 'w2', type: 'metric', title: 'Orders', config: { metric: 'orders' }, position: { x: 3, y: 0, w: 3, h: 2 } },
            { id: 'w3', type: 'chart', title: 'Sales Trend', config: { chartType: 'line', metric: 'revenue' }, position: { x: 0, y: 2, w: 6, h: 4 } },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'dashboard-2',
          name: 'Customer Analytics',
          description: 'Customer behavior and retention',
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Dashboards error:', error);
    res.status(500).json({ error: 'Failed to get dashboards' });
  }
});

/**
 * GET /analytics/dashboards/:dashboardId
 * Get a specific dashboard
 */
analyticsAdvancedRouter.get('/analytics/dashboards/:dashboardId', requireAuth, async (req: Request, res: Response) => {
  const { dashboardId } = req.params;
  
  try {
    res.json({
      id: dashboardId,
      name: 'Overview Dashboard',
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

/**
 * GET /analytics/metrics/summary
 * Get key metrics summary
 */
analyticsAdvancedRouter.get('/analytics/metrics/summary', requireAuth, async (req: Request, res: Response) => {
  const { start, end } = req.query;
  
  try {
    res.json({
      metrics: [
        { name: 'Total Revenue', value: 125000, previousValue: 110000, changePercent: 13.6, trend: 'up' },
        { name: 'Total Orders', value: 2450, previousValue: 2200, changePercent: 11.4, trend: 'up' },
        { name: 'Average Order Value', value: 51.02, previousValue: 50.00, changePercent: 2.0, trend: 'up' },
        { name: 'New Customers', value: 380, previousValue: 420, changePercent: -9.5, trend: 'down' },
        { name: 'Repeat Rate', value: 42.5, previousValue: 40.0, changePercent: 6.25, trend: 'up' },
        { name: 'Cart Abandonment', value: 28.3, previousValue: 30.1, changePercent: -6.0, trend: 'up' },
      ],
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// ============================================
// Segmentation Endpoints
// ============================================

/**
 * GET /analytics/segments
 * Get user segments
 */
analyticsAdvancedRouter.get('/analytics/segments', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      segments: [
        {
          id: 'seg-1',
          name: 'High-Value Customers',
          description: 'Customers with lifetime value > $500',
          conditions: [{ field: 'lifetime_value', operator: 'gt', value: 500 }],
          userCount: 1250,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'seg-2',
          name: 'Flower Enthusiasts',
          description: 'Customers who primarily buy flower',
          conditions: [{ field: 'top_category', operator: 'eq', value: 'flower' }],
          userCount: 3400,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'seg-3',
          name: 'At-Risk Churners',
          description: 'Customers with no purchase in 60+ days',
          conditions: [{ field: 'days_since_purchase', operator: 'gte', value: 60 }],
          userCount: 890,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Segments error:', error);
    res.status(500).json({ error: 'Failed to get segments' });
  }
});

/**
 * POST /analytics/segments
 * Create a user segment
 */
analyticsAdvancedRouter.post('/analytics/segments', requireAuth, async (req: Request, res: Response) => {
  const { name, description, conditions } = req.body;
  
  if (!name || !conditions) {
    return res.status(400).json({ error: 'name and conditions are required' });
  }
  
  try {
    res.status(201).json({
      id: `seg-${Date.now()}`,
      name,
      description,
      conditions,
      userCount: Math.floor(Math.random() * 5000),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create segment error:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

/**
 * GET /analytics/segments/:segmentId/users
 * Get users in a segment
 */
analyticsAdvancedRouter.get('/analytics/segments/:segmentId/users', requireAuth, async (req: Request, res: Response) => {
  const { segmentId } = req.params;
  const { limit = '100' } = req.query;
  
  try {
    res.json({
      users: [
        { userId: 'user-1', attributes: { email: 'j***@example.com', lifetimeValue: 650, orders: 12 } },
        { userId: 'user-2', attributes: { email: 's***@example.com', lifetimeValue: 520, orders: 8 } },
      ],
    });
  } catch (error) {
    console.error('Segment users error:', error);
    res.status(500).json({ error: 'Failed to get segment users' });
  }
});

// ============================================
// Cohort Analysis Endpoints
// ============================================

/**
 * GET /analytics/cohorts
 * Get cohort retention analysis
 */
analyticsAdvancedRouter.get('/analytics/cohorts', requireAuth, async (req: Request, res: Response) => {
  const { cohortType, start, end, granularity } = req.query;
  
  try {
    // Generate mock cohort data
    const cohorts = [];
    const baseDate = new Date(start as string || Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < 8; i++) {
      const cohortDate = new Date(baseDate);
      cohortDate.setDate(cohortDate.getDate() + i * 7);
      
      const retention = [];
      for (let p = 0; p <= 8 - i; p++) {
        const baseRetention = 100 * Math.pow(0.7, p);
        retention.push({
          period: p,
          retained: Math.floor(500 * baseRetention / 100),
          percentage: Math.round(baseRetention * 10) / 10,
        });
      }
      
      cohorts.push({
        cohortDate: cohortDate.toISOString().split('T')[0],
        cohortSize: 500,
        retentionByPeriod: retention,
      });
    }
    
    res.json({ cohorts });
  } catch (error) {
    console.error('Cohorts error:', error);
    res.status(500).json({ error: 'Failed to get cohorts' });
  }
});

// ============================================
// Conversion Funnel Endpoints
// ============================================

/**
 * GET /analytics/funnels
 * Get conversion funnels
 */
analyticsAdvancedRouter.get('/analytics/funnels', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      funnels: [
        {
          id: 'funnel-1',
          name: 'Purchase Funnel',
          steps: [
            { name: 'Product View', eventName: 'product_view', count: 10000, dropoffRate: 0 },
            { name: 'Add to Cart', eventName: 'add_to_cart', count: 3500, dropoffRate: 65, averageTimeFromPrevious: 45 },
            { name: 'Checkout Started', eventName: 'checkout_start', count: 2100, dropoffRate: 40, averageTimeFromPrevious: 180 },
            { name: 'Purchase Complete', eventName: 'purchase', count: 1500, dropoffRate: 28.6, averageTimeFromPrevious: 120 },
          ],
          conversionRate: 15.0,
          averageTimeToConvert: 345,
        },
        {
          id: 'funnel-2',
          name: 'Registration Funnel',
          steps: [
            { name: 'Landing', eventName: 'landing_view', count: 5000, dropoffRate: 0 },
            { name: 'Sign Up Start', eventName: 'signup_start', count: 1200, dropoffRate: 76, averageTimeFromPrevious: 30 },
            { name: 'Email Verified', eventName: 'email_verified', count: 800, dropoffRate: 33.3, averageTimeFromPrevious: 600 },
            { name: 'First Purchase', eventName: 'first_purchase', count: 350, dropoffRate: 56.25, averageTimeFromPrevious: 3600 },
          ],
          conversionRate: 7.0,
          averageTimeToConvert: 4230,
        },
      ],
    });
  } catch (error) {
    console.error('Funnels error:', error);
    res.status(500).json({ error: 'Failed to get funnels' });
  }
});

/**
 * GET /analytics/funnels/:funnelId
 * Get specific funnel with data
 */
analyticsAdvancedRouter.get('/analytics/funnels/:funnelId', requireAuth, async (req: Request, res: Response) => {
  const { funnelId } = req.params;
  const { start, end } = req.query;
  
  try {
    res.json({
      id: funnelId,
      name: 'Purchase Funnel',
      steps: [
        { name: 'Product View', eventName: 'product_view', count: 10000, dropoffRate: 0 },
        { name: 'Add to Cart', eventName: 'add_to_cart', count: 3500, dropoffRate: 65 },
        { name: 'Checkout Started', eventName: 'checkout_start', count: 2100, dropoffRate: 40 },
        { name: 'Purchase Complete', eventName: 'purchase', count: 1500, dropoffRate: 28.6 },
      ],
      conversionRate: 15.0,
      averageTimeToConvert: 345,
    });
  } catch (error) {
    console.error('Funnel error:', error);
    res.status(500).json({ error: 'Failed to get funnel' });
  }
});

/**
 * POST /analytics/funnels
 * Create a conversion funnel
 */
analyticsAdvancedRouter.post('/analytics/funnels', requireAuth, async (req: Request, res: Response) => {
  const { name, steps } = req.body;
  
  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'name and steps are required' });
  }
  
  try {
    res.status(201).json({
      id: `funnel-${Date.now()}`,
      name,
      steps: steps.map((s: any, i: number) => ({ ...s, count: 0, dropoffRate: 0 })),
      conversionRate: 0,
      averageTimeToConvert: 0,
    });
  } catch (error) {
    console.error('Create funnel error:', error);
    res.status(500).json({ error: 'Failed to create funnel' });
  }
});

// ============================================
// A/B Testing Endpoints
// ============================================

/**
 * GET /analytics/ab-tests
 * Get A/B tests
 */
analyticsAdvancedRouter.get('/analytics/ab-tests', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.query;
  
  try {
    let tests = [
      {
        id: 'test-1',
        name: 'Checkout Button Color',
        status: 'running',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [
          { id: 'control', name: 'Green (Control)', traffic: 50, conversions: 245, conversionRate: 3.2, revenue: 12500, revenuePerUser: 1.63 },
          { id: 'variant-a', name: 'Blue', traffic: 50, conversions: 278, conversionRate: 3.6, revenue: 14200, revenuePerUser: 1.85 },
        ],
        winningVariant: 'variant-a',
        confidence: 87.5,
      },
      {
        id: 'test-2',
        name: 'Product Page Layout',
        status: 'completed',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [
          { id: 'control', name: 'Original', traffic: 50, conversions: 890, conversionRate: 4.1, revenue: 45000 },
          { id: 'variant-a', name: 'New Layout', traffic: 50, conversions: 1050, conversionRate: 4.8, revenue: 53000 },
        ],
        winningVariant: 'variant-a',
        confidence: 95.2,
      },
    ];
    
    if (status) {
      tests = tests.filter(t => t.status === status);
    }
    
    res.json({ tests });
  } catch (error) {
    console.error('A/B tests error:', error);
    res.status(500).json({ error: 'Failed to get A/B tests' });
  }
});

/**
 * GET /analytics/ab-tests/:testId
 * Get specific A/B test
 */
analyticsAdvancedRouter.get('/analytics/ab-tests/:testId', requireAuth, async (req: Request, res: Response) => {
  const { testId } = req.params;
  
  try {
    res.json({
      id: testId,
      name: 'Checkout Button Color',
      status: 'running',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      variants: [
        { id: 'control', name: 'Green (Control)', traffic: 50, conversions: 245, conversionRate: 3.2, revenue: 12500 },
        { id: 'variant-a', name: 'Blue', traffic: 50, conversions: 278, conversionRate: 3.6, revenue: 14200 },
      ],
      winningVariant: 'variant-a',
      confidence: 87.5,
    });
  } catch (error) {
    console.error('A/B test error:', error);
    res.status(500).json({ error: 'Failed to get A/B test' });
  }
});

/**
 * POST /analytics/ab-tests
 * Create an A/B test
 */
analyticsAdvancedRouter.post('/analytics/ab-tests', requireAuth, async (req: Request, res: Response) => {
  const { name, variants, goalEvent, targetSegmentId } = req.body;
  
  if (!name || !variants || !goalEvent) {
    return res.status(400).json({ error: 'name, variants, and goalEvent are required' });
  }
  
  try {
    res.status(201).json({
      id: `test-${Date.now()}`,
      name,
      status: 'running',
      startDate: new Date().toISOString(),
      variants: variants.map((v: any) => ({
        ...v,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
      })),
      confidence: 0,
    });
  } catch (error) {
    console.error('Create A/B test error:', error);
    res.status(500).json({ error: 'Failed to create A/B test' });
  }
});

// ============================================
// Campaign Metrics Endpoints
// ============================================

/**
 * GET /analytics/campaigns
 * Get campaign performance metrics
 */
analyticsAdvancedRouter.get('/analytics/campaigns', requireAuth, async (req: Request, res: Response) => {
  const { start, end, campaignIds } = req.query;
  
  try {
    res.json({
      campaigns: [
        {
          campaignId: 'camp-1',
          campaignName: 'Summer Sale 2025',
          channel: 'email',
          impressions: 50000,
          clicks: 4200,
          conversions: 320,
          revenue: 16500,
          ctr: 8.4,
          conversionRate: 7.6,
          roas: 4.2,
          attributedOrders: 320,
        },
        {
          campaignId: 'camp-2',
          campaignName: 'New User Welcome',
          channel: 'push',
          impressions: 12000,
          clicks: 1800,
          conversions: 250,
          revenue: 8500,
          ctr: 15.0,
          conversionRate: 13.9,
          roas: 6.8,
          attributedOrders: 250,
        },
      ],
    });
  } catch (error) {
    console.error('Campaign metrics error:', error);
    res.status(500).json({ error: 'Failed to get campaign metrics' });
  }
});

/**
 * GET /analytics/deep-links
 * Get deep link metrics
 */
analyticsAdvancedRouter.get('/analytics/deep-links', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      links: [
        {
          linkId: 'link-1',
          url: 'https://nimbus.app/deal/summer25',
          clicks: 2500,
          installs: 180,
          conversions: 420,
          revenue: 21000,
          topSources: [
            { source: 'instagram', count: 1200 },
            { source: 'email', count: 800 },
            { source: 'sms', count: 500 },
          ],
        },
      ],
    });
  } catch (error) {
    console.error('Deep links error:', error);
    res.status(500).json({ error: 'Failed to get deep link metrics' });
  }
});

/**
 * POST /analytics/deep-links
 * Create a tracked deep link
 */
analyticsAdvancedRouter.post('/analytics/deep-links', requireAuth, async (req: Request, res: Response) => {
  const { destination, campaign, source, medium } = req.body;
  
  if (!destination) {
    return res.status(400).json({ error: 'destination is required' });
  }
  
  try {
    const linkId = `link-${Date.now()}`;
    res.status(201).json({
      linkId,
      url: `https://nimbus.app/go/${linkId}`,
      shortUrl: `https://nmbs.co/${linkId.slice(-6)}`,
    });
  } catch (error) {
    console.error('Create deep link error:', error);
    res.status(500).json({ error: 'Failed to create deep link' });
  }
});

// ============================================
// Real-time Analytics Endpoints
// ============================================

/**
 * GET /analytics/realtime/users
 * Get real-time active users
 */
analyticsAdvancedRouter.get('/analytics/realtime/users', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      activeUsers: 127,
      byPage: [
        { page: '/products', count: 45 },
        { page: '/cart', count: 28 },
        { page: '/checkout', count: 12 },
        { page: '/deals', count: 22 },
        { page: '/', count: 20 },
      ],
      byLocation: [
        { location: 'San Francisco, CA', count: 35 },
        { location: 'Los Angeles, CA', count: 28 },
        { location: 'Oakland, CA', count: 18 },
        { location: 'San Jose, CA', count: 15 },
        { location: 'Other', count: 31 },
      ],
    });
  } catch (error) {
    console.error('Realtime users error:', error);
    res.status(500).json({ error: 'Failed to get realtime users' });
  }
});

/**
 * GET /analytics/realtime/events
 * Get real-time events
 */
analyticsAdvancedRouter.get('/analytics/realtime/events', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({
      events: [
        { eventName: 'page_view', count: 450, trend: 5.2 },
        { eventName: 'product_view', count: 180, trend: 3.1 },
        { eventName: 'add_to_cart', count: 45, trend: -2.5 },
        { eventName: 'purchase', count: 12, trend: 8.3 },
      ],
      conversions: 12,
      revenue: 624.50,
    });
  } catch (error) {
    console.error('Realtime events error:', error);
    res.status(500).json({ error: 'Failed to get realtime events' });
  }
});
