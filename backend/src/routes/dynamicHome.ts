// backend/src/routes/dynamicHome.ts
// Dynamic home screen routes

import { Router, Request, Response } from 'express';

const router = Router();

// Default home sections
const DEFAULT_SECTIONS = [
  { id: 'hero', type: 'hero_banner', title: 'Featured', position: 0, visible: true, collapsed: false },
  { id: 'deals', type: 'deals', title: 'Today\'s Deals', position: 1, visible: true, collapsed: false },
  { id: 'categories', type: 'categories', title: 'Categories', position: 2, visible: true, collapsed: false },
  { id: 'recommended', type: 'recommended', title: 'Recommended for You', position: 3, visible: true, collapsed: false },
  { id: 'new', type: 'new_arrivals', title: 'New Arrivals', position: 4, visible: true, collapsed: false },
  { id: 'popular', type: 'popular', title: 'Popular Products', position: 5, visible: true, collapsed: false },
  { id: 'favorites', type: 'favorites', title: 'Your Favorites', position: 6, visible: true, collapsed: false },
  { id: 'reorder', type: 'quick_reorder', title: 'Quick Reorder', position: 7, visible: true, collapsed: false },
  { id: 'loyalty', type: 'loyalty_status', title: 'Your Rewards', position: 8, visible: true, collapsed: false },
  { id: 'events', type: 'events', title: 'Upcoming Events', position: 9, visible: true, collapsed: false },
];

// ============================================
// Layout Routes
// ============================================

router.get('/layout', async (req: Request, res: Response) => {
  try {
    res.json({
      id: 'layout-user-123',
      userId: 'user-123',
      sections: DEFAULT_SECTIONS,
      version: 1,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching home layout:', error);
    res.status(500).json({ error: 'Failed to fetch layout' });
  }
});

router.post('/layout', async (req: Request, res: Response) => {
  try {
    const { sections } = req.body;
    res.json({
      id: 'layout-user-123',
      userId: 'user-123',
      sections,
      version: 2,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving home layout:', error);
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

router.post('/layout/reset', async (req: Request, res: Response) => {
  try {
    res.json({
      id: 'layout-user-123',
      userId: 'user-123',
      sections: DEFAULT_SECTIONS,
      version: 1,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting home layout:', error);
    res.status(500).json({ error: 'Failed to reset layout' });
  }
});

// ============================================
// Section Routes
// ============================================

router.get('/sections', async (req: Request, res: Response) => {
  try {
    res.json({ sections: DEFAULT_SECTIONS });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

router.get('/sections/:sectionId/data', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    
    // Return different data based on section type
    const sectionData: Record<string, unknown> = {
      hero: {
        banners: [
          { id: 'banner-1', image: 'https://example.com/banner.jpg', link: '/deals', title: 'Summer Sale' },
        ],
      },
      deals: {
        products: [],
      },
      categories: {
        categories: [
          { id: 'cat-1', name: 'Flower', icon: 'flower', count: 150 },
          { id: 'cat-2', name: 'Edibles', icon: 'cookie', count: 80 },
        ],
      },
      recommended: {
        products: [],
      },
      new: {
        products: [],
      },
      popular: {
        products: [],
      },
      favorites: {
        products: [],
      },
      reorder: {
        orders: [],
      },
      loyalty: {
        points: 1500,
        tier: 'Gold',
        nextTierPoints: 500,
      },
      events: {
        events: [],
      },
    };
    
    res.json({
      sectionId,
      data: sectionData[sectionId] || {},
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching section data:', error);
    res.status(500).json({ error: 'Failed to fetch section data' });
  }
});

router.patch('/sections/:sectionId/visibility', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const { visible } = req.body;
    res.json({ sectionId, visible, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error updating section visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

router.patch('/sections/:sectionId/collapsed', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const { collapsed } = req.body;
    res.json({ sectionId, collapsed, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error updating section collapsed state:', error);
    res.status(500).json({ error: 'Failed to update collapsed state' });
  }
});

router.patch('/sections/:sectionId/config', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const config = req.body;
    res.json({ sectionId, config, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error updating section config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

router.post('/sections', async (req: Request, res: Response) => {
  try {
    const section = req.body;
    res.status(201).json({
      ...section,
      id: `section-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ error: 'Failed to add section' });
  }
});

router.delete('/sections/:sectionId', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error removing section:', error);
    res.status(500).json({ error: 'Failed to remove section' });
  }
});

// ============================================
// Templates Routes
// ============================================

router.get('/templates', async (req: Request, res: Response) => {
  try {
    res.json({
      templates: [
        {
          id: 'template-default',
          name: 'Default',
          description: 'Standard home layout',
          sections: DEFAULT_SECTIONS,
          isDefault: true,
        },
        {
          id: 'template-minimal',
          name: 'Minimal',
          description: 'Clean, simple layout',
          sections: DEFAULT_SECTIONS.slice(0, 5),
          isDefault: false,
        },
        {
          id: 'template-power-user',
          name: 'Power User',
          description: 'All features at your fingertips',
          sections: DEFAULT_SECTIONS,
          isDefault: false,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// ============================================
// Saved Layouts (Presets)
// ============================================

router.get('/presets', async (req: Request, res: Response) => {
  try {
    res.json({ presets: [] });
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

router.post('/presets', async (req: Request, res: Response) => {
  try {
    const preset = req.body;
    res.status(201).json({
      id: `preset-${Date.now()}`,
      ...preset,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving preset:', error);
    res.status(500).json({ error: 'Failed to save preset' });
  }
});

router.post('/presets/:presetId/load', async (req: Request, res: Response) => {
  try {
    res.json({
      id: 'layout-user-123',
      sections: DEFAULT_SECTIONS,
      version: 1,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error loading preset:', error);
    res.status(500).json({ error: 'Failed to load preset' });
  }
});

export default router;
