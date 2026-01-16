// backend/src/routes/journalAdvanced.ts
// Advanced journal routes for rich journaling features

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Detailed Entry Routes
// ============================================

router.post('/entries/detailed', async (req: Request, res: Response) => {
  try {
    const entry = req.body;
    res.status(201).json({
      id: `entry-${Date.now()}`,
      userId: 'user-123',
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating detailed entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// ============================================
// Mood Routes
// ============================================

router.post('/mood/check-in', async (req: Request, res: Response) => {
  try {
    const { entryId, level, emotions, notes } = req.body;
    res.status(201).json({
      id: `mood-${Date.now()}`,
      entryId,
      type: 'before',
      level,
      emotions,
      notes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging mood check-in:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

router.post('/mood/after', async (req: Request, res: Response) => {
  try {
    const { entryId, level, emotions, notes, minutesAfter } = req.body;
    res.status(201).json({
      id: `mood-${Date.now()}`,
      entryId,
      type: 'after',
      level,
      emotions,
      notes,
      minutesAfter,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating mood after:', error);
    res.status(500).json({ error: 'Failed to update mood' });
  }
});

// ============================================
// Prompts Routes
// ============================================

router.get('/prompts', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const prompts = [
      {
        id: 'prompt-1',
        text: 'How are you feeling right now?',
        category: 'mood',
        helpText: 'Describe your current emotional and physical state',
        isRequired: false,
      },
      {
        id: 'prompt-2',
        text: 'What activities do you plan to do?',
        category: 'activity',
        helpText: 'This helps track how cannabis affects different activities',
        isRequired: false,
      },
      {
        id: 'prompt-3',
        text: 'Rate your pain level (1-10)',
        category: 'medical',
        helpText: 'Track your pain to see what works best',
        isRequired: false,
      },
      {
        id: 'prompt-4',
        text: 'What effects are you hoping for?',
        category: 'effects',
        helpText: "We'll help you track if you achieved your goals",
        isRequired: false,
      },
    ];

    const filtered = category ? prompts.filter(p => p.category === category) : prompts;

    res.json({ prompts: filtered });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// ============================================
// Tags Routes
// ============================================

router.get('/tags', async (req: Request, res: Response) => {
  try {
    res.json({
      tags: [
        { id: 'tag-1', name: 'relaxation', color: '#7C3AED', usageCount: 15 },
        { id: 'tag-2', name: 'sleep', color: '#3B82F6', usageCount: 12 },
        { id: 'tag-3', name: 'creativity', color: '#F59E0B', usageCount: 8 },
        { id: 'tag-4', name: 'pain-relief', color: '#EF4444', usageCount: 10 },
        { id: 'tag-5', name: 'social', color: '#10B981', usageCount: 6 },
      ],
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.post('/tags', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    res.status(201).json({
      id: `tag-${Date.now()}`,
      name,
      color,
      usageCount: 0,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.get('/tags/suggested', async (req: Request, res: Response) => {
  try {
    const { entryContent: _entryContent } = req.query;
    res.json({
      tags: [
        { id: 'tag-1', name: 'relaxation', relevance: 0.9 },
        { id: 'tag-2', name: 'evening', relevance: 0.8 },
      ],
    });
  } catch (error) {
    console.error('Error fetching suggested tags:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// ============================================
// Charts & Analytics Routes
// ============================================

router.get('/charts/mood', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, granularity: _granularity } = req.query;

    // Generate mock mood data
    const dataPoints = [];
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dataPoints.push({
        date: new Date(d).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 4) + 6, // 6-10
        count: Math.floor(Math.random() * 3) + 1,
      });
    }

    res.json({
      dataPoints,
      average: 7.5,
      trend: 'improving',
      range: { min: 5, max: 10 },
    });
  } catch (error) {
    console.error('Error fetching mood chart:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/charts/dosage', async (req: Request, res: Response) => {
  try {
    const { startDate: _startDate, endDate: _endDate, granularity: _granularity } = req.query;

    res.json({
      dataPoints: [
        { date: '2024-01-15', method: 'vape', amount: 0.3, unit: 'g' },
        { date: '2024-01-16', method: 'edible', amount: 10, unit: 'mg' },
      ],
      byMethod: {
        vape: { total: 2.1, average: 0.3 },
        edible: { total: 50, average: 10 },
      },
    });
  } catch (error) {
    console.error('Error fetching dosage chart:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/charts/effects', async (req: Request, res: Response) => {
  try {
    res.json({
      dataPoints: [
        { effect: 'relaxed', count: 25, averageIntensity: 7.5 },
        { effect: 'happy', count: 20, averageIntensity: 8.0 },
        { effect: 'sleepy', count: 15, averageIntensity: 6.5 },
        { effect: 'creative', count: 10, averageIntensity: 7.0 },
      ],
      topEffects: ['relaxed', 'happy', 'sleepy'],
    });
  } catch (error) {
    console.error('Error fetching effects chart:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// ============================================
// Insights Routes
// ============================================

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate: _startDate, endDate: _endDate } = req.query;
    res.json({
      totalEntries: 45,
      totalProducts: 12,
      totalConsumption: { flower: '14g', edibles: '200mg' },
      averageMood: { before: 6.5, after: 8.2 },
      topProducts: [{ productId: 'prod-1', name: 'Blue Dream', count: 15 }],
      topEffects: ['relaxed', 'happy', 'creative'],
      mostActiveDay: 'Saturday',
      mostActiveTime: 'evening',
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.get('/insights', async (req: Request, res: Response) => {
  try {
    res.json({
      insights: [
        {
          id: 'insight-1',
          type: 'correlation',
          title: 'Blue Dream helps with relaxation',
          description: 'You report feeling relaxed 90% of the time after using Blue Dream',
          confidence: 0.9,
          dataPoints: 15,
          actionable: true,
          action: { type: 'view_product', productId: 'prod-1' },
        },
        {
          id: 'insight-2',
          type: 'pattern',
          title: 'Evening sessions improve sleep',
          description: 'Sessions between 8-10 PM correlate with better sleep quality',
          confidence: 0.85,
          dataPoints: 20,
          actionable: false,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

router.get('/correlations', async (req: Request, res: Response) => {
  try {
    res.json({
      correlations: [
        {
          factor1: { type: 'product', value: 'Blue Dream' },
          factor2: { type: 'effect', value: 'relaxed' },
          strength: 0.9,
          occurrences: 15,
        },
        {
          factor1: { type: 'time', value: 'evening' },
          factor2: { type: 'effect', value: 'sleepy' },
          strength: 0.75,
          occurrences: 20,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching correlations:', error);
    res.status(500).json({ error: 'Failed to fetch correlations' });
  }
});

router.get('/patterns/mood', async (req: Request, res: Response) => {
  try {
    res.json({
      patterns: [
        {
          pattern: 'Weekly improvement',
          description: 'Your mood tends to improve throughout the week',
          data: { monday: 6.5, friday: 8.0 },
        },
        {
          pattern: 'Time of day',
          description: 'Evening sessions result in higher mood ratings',
          data: { morning: 7.0, afternoon: 7.5, evening: 8.5 },
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching mood patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    res.json({
      recommendations: [
        {
          type: 'product',
          title: 'Try Granddaddy Purple',
          reason: 'Based on your love for relaxing indicas, you might enjoy this',
          productId: 'prod-2',
        },
        {
          type: 'dosage',
          title: 'Consider lower doses in the morning',
          reason: 'Your morning entries show better results with smaller amounts',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// ============================================
// Search & Filter Routes
// ============================================

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query: _query, filters: _filters } = req.query;
    res.json({
      entries: [],
      total: 0,
    });
  } catch (error) {
    console.error('Error searching journal:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

router.get('/by-product/:productId', async (req: Request, res: Response) => {
  try {
    res.json({ entries: [] });
  } catch (error) {
    console.error('Error fetching product entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/by-strain/:strain', async (req: Request, res: Response) => {
  try {
    res.json({ entries: [] });
  } catch (error) {
    console.error('Error fetching strain entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// ============================================
// Export & Share Routes
// ============================================

router.post('/export', async (req: Request, res: Response) => {
  try {
    const {
      format,
      startDate: _startDate,
      endDate: _endDate,
      includeMedia: _includeMedia,
    } = req.body;
    res.json({
      downloadUrl: `https://nimbus.app/exports/journal-${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error exporting journal:', error);
    res.status(500).json({ error: 'Failed to export' });
  }
});

router.post('/entries/:entryId/share', async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const {
      includeProduct: _includeProduct,
      includeEffects: _includeEffects,
      expiresInDays,
    } = req.body;
    res.json({
      shareUrl: `https://nimbus.app/shared/journal/${entryId}`,
      expiresAt: new Date(Date.now() + (expiresInDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error sharing entry:', error);
    res.status(500).json({ error: 'Failed to share' });
  }
});

// ============================================
// Reminders Routes
// ============================================

router.get('/reminders', async (req: Request, res: Response) => {
  try {
    res.json({
      reminders: [
        {
          id: 'reminder-1',
          type: 'daily',
          time: '20:00',
          enabled: true,
          message: 'Time to log your evening session!',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

router.post('/reminders', async (req: Request, res: Response) => {
  try {
    const reminder = req.body;
    res.status(201).json({
      id: `reminder-${Date.now()}`,
      ...reminder,
    });
  } catch (error) {
    console.error('Error setting reminder:', error);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

export default router;
