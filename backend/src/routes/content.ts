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
