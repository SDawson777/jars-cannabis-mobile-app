import { Router } from 'express';
import { prisma } from '../prismaClient';

export const contentRouter = Router();

contentRouter.get('/content/faq', async (req, res) => {
  const locale = (req.query.locale as string) || 'en-US';
  const pages = await prisma.contentPage.findMany({
    where: { type: 'faq', locale, published: true },
  });
  res.json({ items: pages });
});

contentRouter.get('/content/legal', async (req, res) => {
  const locale = (req.query.locale as string) || 'en-US';
  let pages: any[] = [];
  try {
    if (prisma.contentPage && typeof prisma.contentPage.findMany === 'function') {
      pages = await prisma.contentPage.findMany({
        where: { type: 'legal', locale, published: true },
      });
    }
  } catch {
    // ignore, fallback to empty
  }

  // Helper to find by slug (case-insensitive)
  const bySlug = (slug: string) => pages.find(p => p.slug.toLowerCase() === slug.toLowerCase());

  // Main legal docs
  const terms = bySlug('terms')?.body || '';
  const privacy = bySlug('privacy')?.body || '';
  const accessibility = bySlug('accessibility')?.body || '';

  // Last updated timestamps
  const lastUpdated = {
    terms: bySlug('terms')?.updatedAt || null,
    privacy: bySlug('privacy')?.updatedAt || null,
    accessibility: bySlug('accessibility')?.updatedAt || null,
  };

  // State-specific notices: slug format 'state-XX' (e.g., 'state-MI')
  const stateNotices: Record<string, string> = {};
  pages.forEach(p => {
    const m = p.slug.match(/^state-([A-Z]{2})$/i);
    if (m) {
      stateNotices[m[1].toUpperCase()] = p.body;
    }
  });

  res.json({
    terms,
    privacy,
    accessibility,
    stateNotices,
    lastUpdated,
  });
});

// Articles — list and detail
// Helper to map DB Article rows (or JSON) to CMSArticle shape expected by the app
function toCMSArticle(a: any) {
  // Try to parse body if stored as JSON string
  let body: any = a.body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      body = parsed;
    } catch {
      // fallback to rich-text like structure
      body = [{ type: 'paragraph', children: [{ text: body }] }];
    }
  }
  return {
    __id: a.id || a.__id || a.slug,
    title: a.title,
    slug: a.slug,
    publishedAt:
      typeof a.publishedAt === 'string'
        ? a.publishedAt
        : a.publishedAt?.toISOString?.() || new Date().toISOString(),
    body,
    ...(a.mainImage ? { mainImage: a.mainImage } : {}),
  };
}

// GET /content/articles — returns CMSArticle[]
contentRouter.get('/content/articles', async (req, res) => {
  const locale = (req.query.locale as string) || 'en-US';
  const preview = req.header('X-Preview') === 'true';
  try {
    if ((prisma as any).article && typeof (prisma as any).article.findMany === 'function') {
      const articles = await (prisma as any).article.findMany({
        where: { locale, ...(preview ? {} : { isPublished: true }) },
        orderBy: { publishedAt: 'desc' },
      });
      return res.json(articles.map(toCMSArticle));
    }
  } catch {
    // fall through to static demo
  }

  // Static demo content for environments without a DB
  const demo = [
    toCMSArticle({
      id: 'a1',
      title: "Understanding Terpenes: A Beginner's Guide",
      slug: 'understanding-terpenes',
      publishedAt: new Date().toISOString(),
      body: [{ type: 'paragraph', children: [{ text: 'Terpenes shape aroma and effects.' }] }],
      mainImage: { url: 'https://placehold.co/1200x600', alt: 'Terpene graphic' },
    }),
    toCMSArticle({
      id: 'a2',
      title: 'Edibles 101: Onset, Duration, and Dosing',
      slug: 'edibles-101',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      body: [{ type: 'paragraph', children: [{ text: 'Start low and go slow.' }] }],
      mainImage: { url: 'https://placehold.co/1200x600', alt: 'Edibles assortment' },
    }),
  ];
  return res.json(demo);
});

// GET /content/articles/:slug
contentRouter.get('/content/articles/:slug', async (req, res) => {
  const { slug } = req.params;
  const locale = (req.query.locale as string) || 'en-US';
  const preview = req.header('X-Preview') === 'true';
  try {
    if ((prisma as any).article && typeof (prisma as any).article.findFirst === 'function') {
      const article = await (prisma as any).article.findFirst({
        where: { slug, locale, ...(preview ? {} : { isPublished: true }) },
      });
      if (!article) return res.status(404).json({ message: 'Not found' });
      return res.json(toCMSArticle(article));
    }
  } catch {
    // fall through to static demo
  }

  const demo = toCMSArticle({
    id: 'a-demo',
    title: 'Demo Article',
    slug,
    publishedAt: new Date().toISOString(),
    body: [
      { type: 'heading', level: 2, children: [{ text: 'Welcome to the Greenhouse' }] },
      {
        type: 'paragraph',
        children: [
          {
            text: 'This is a placeholder article served by the backend when no database is configured.',
          },
        ],
      },
    ],
    mainImage: { url: 'https://placehold.co/1200x600', alt: 'Demo hero' },
  });
  return res.json(demo);
});

// GET /content/theme - Fetch CMS-managed theme tokens
contentRouter.get('/content/theme', async (req, res) => {
  const brandSlug = (req.query.brand as string) || 'default';

  try {
    // Try to fetch from database if available
    if ((prisma as any).brand && typeof (prisma as any).brand.findFirst === 'function') {
      const brandTheme = await (prisma as any).brand.findFirst({
        where: { slug: brandSlug },
      });
      if (brandTheme) {
        return res.json({
          brandSlug: brandTheme.slug,
          primaryColor: brandTheme.primaryColor || '#2E5D46',
          secondaryColor: brandTheme.secondaryColor || '#8CD24C',
          backgroundColor: brandTheme.backgroundColor || '#F9F9F9',
          accentColor: brandTheme.accentColor || '#FFD700',
          cornerRadius: brandTheme.cornerRadius ?? 12,
          logoUrl: brandTheme.logoUrl,
          darkModeEnabled: brandTheme.darkModeEnabled ?? false,
          elevation: brandTheme.elevation || 'soft',
          fontFamily: brandTheme.fontFamily,
        });
      }
    }
  } catch {
    // Fall through to demo theme
  }

  // Demo/default theme
  return res.json({
    brandSlug,
    primaryColor: '#2E5D46',
    secondaryColor: '#8CD24C',
    backgroundColor: '#F9F9F9',
    accentColor: '#FFD700',
    cornerRadius: 12,
    logoUrl: undefined,
    darkModeEnabled: false,
    elevation: 'soft',
  });
});

// GET /content/deals - Fetch active deals/promotions
contentRouter.get('/content/deals', async (req, res) => {
  try {
    if ((prisma as any).deal && typeof (prisma as any).deal.findMany === 'function') {
      const deals = await (prisma as any).deal.findMany({
        orderBy: { startDate: 'desc' },
      });
      return res.json(
        deals.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          discountType: d.discountType,
          discountValue: d.discountValue,
          startDate: d.startDate?.toISOString?.() || d.startDate,
          endDate: d.endDate?.toISOString?.() || d.endDate,
          imageUrl: d.imageUrl,
          productIds: d.productIds,
          categoryIds: d.categoryIds,
          isActive: d.isActive ?? true,
        }))
      );
    }
  } catch {
    // Fall through to demo deals
  }

  // Demo deals
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return res.json([
    {
      id: 'deal-1',
      title: 'First Timer Special',
      description: '20% off your first order',
      discountType: 'percent',
      discountValue: 20,
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      imageUrl: 'https://placehold.co/800x400',
      isActive: true,
    },
    {
      id: 'deal-2',
      title: 'Daily Flash Sale',
      description: 'Select concentrates 15% off today only',
      discountType: 'percent',
      discountValue: 15,
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      categoryIds: ['concentrates'],
      isActive: true,
    },
    {
      id: 'deal-3',
      title: 'Bundle & Save',
      description: 'Buy 2, get 1 free on all edibles',
      discountType: 'bogo',
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      categoryIds: ['edibles'],
      isActive: true,
    },
  ]);
});

// GET /content/filters - Product category filters
contentRouter.get('/content/filters', async (req, res) => {
  try {
    if ((prisma as any).category && typeof (prisma as any).category.findMany === 'function') {
      const categories = await (prisma as any).category.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      });
      return res.json(
        categories.map((c: any) => ({
          id: c.id || c.slug,
          label: c.name || c.label,
          slug: c.slug,
          iconRef: c.iconRef,
          weight: c.sortOrder ?? c.weight ?? 0,
        }))
      );
    }
  } catch {
    // Fall through to demo filters
  }

  // Demo filters matching the home categories
  return res.json([
    { id: 'flower', label: 'Flower', slug: 'flower', weight: 100 },
    { id: 'vapes', label: 'Vapes', slug: 'vapes', weight: 90 },
    { id: 'edibles', label: 'Edibles', slug: 'edibles', weight: 80 },
    { id: 'pre-rolls', label: 'Pre-rolls', slug: 'pre-rolls', weight: 70 },
    { id: 'concentrates', label: 'Concentrates', slug: 'concentrates', weight: 60 },
    { id: 'gear', label: 'Gear', slug: 'gear', weight: 50 },
    { id: 'topicals', label: 'Topicals', slug: 'topicals', weight: 40 },
    { id: 'tinctures', label: 'Tinctures', slug: 'tinctures', weight: 30 },
  ]);
});

// GET /content/copy - Localized app copy for various contexts
contentRouter.get('/content/copy', async (req, res) => {
  const context = (req.query.context as string) || 'general';
  const locale = (req.query.locale as string) || 'en-US';

  try {
    if ((prisma as any).appCopy && typeof (prisma as any).appCopy.findMany === 'function') {
      const items = await (prisma as any).appCopy.findMany({
        where: { context, locale },
      });
      return res.json(
        items.map((c: any) => ({
          key: c.key,
          text: c.text,
        }))
      );
    }
  } catch {
    // Fall through to demo copy
  }

  // Demo copy based on context
  const demoCopy: Record<string, Array<{ key: string; text: string }>> = {
    onboarding: [
      { key: 'welcome.title', text: 'Welcome to Nimbus' },
      { key: 'welcome.subtitle', text: 'Your premium cannabis shopping experience' },
      { key: 'step1.title', text: 'Browse Products' },
      { key: 'step1.description', text: 'Explore our curated selection of cannabis products' },
      { key: 'step2.title', text: 'Add to Cart' },
      { key: 'step2.description', text: 'Select your favorites and add them to your cart' },
      { key: 'step3.title', text: 'Checkout' },
      { key: 'step3.description', text: 'Complete your order for pickup or delivery' },
    ],
    emptyStates: [
      { key: 'cart.empty', text: 'Your cart is empty' },
      { key: 'cart.emptyAction', text: 'Start shopping' },
      { key: 'orders.empty', text: 'No orders yet' },
      { key: 'favorites.empty', text: 'No favorites saved' },
      { key: 'search.noResults', text: 'No products found' },
    ],
    awards: [
      { key: 'badge.earned', text: 'Congratulations!' },
      { key: 'badge.earnedDescription', text: "You've earned a new badge" },
      { key: 'points.earned', text: 'Points earned!' },
      { key: 'tier.upgraded', text: 'Level up!' },
    ],
    accessibility: [
      { key: 'statement.title', text: 'Accessibility Statement' },
      {
        key: 'statement.body',
        text: 'We are committed to ensuring digital accessibility for people with disabilities.',
      },
    ],
    dataTransparency: [
      { key: 'privacy.title', text: 'Your Data' },
      { key: 'privacy.description', text: 'Learn how we collect and use your data' },
      { key: 'preferences.title', text: 'Data Preferences' },
    ],
    ageGate: [
      { key: 'title', text: 'Age Verification Required' },
      { key: 'description', text: 'You must be 21 or older to enter' },
      { key: 'confirm', text: 'I am 21 or older' },
      { key: 'deny', text: 'I am under 21' },
    ],
  };

  return res.json(demoCopy[context] || []);
});
