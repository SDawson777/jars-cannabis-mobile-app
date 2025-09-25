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
      typeof a.publishedAt === 'string' ? a.publishedAt : a.publishedAt?.toISOString?.() || new Date().toISOString(),
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
            text:
              'This is a placeholder article served by the backend when no database is configured.',
          },
        ],
      },
    ],
    mainImage: { url: 'https://placehold.co/1200x600', alt: 'Demo hero' },
  });
  return res.json(demo);
});
