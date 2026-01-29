import type { CMSImageAsset, CMSProduct, CMSBanner, CMSArticle, CMSDrop } from '../types/cms';

describe('cms types', () => {
  describe('CMSImageAsset', () => {
    it('has correct structure with url', () => {
      const image: CMSImageAsset = {
        url: 'https://cdn.example.com/image.jpg',
      };

      expect(image.url).toBe('https://cdn.example.com/image.jpg');
    });

    it('accepts optional alt text', () => {
      const withAlt: CMSImageAsset = {
        url: 'https://cdn.example.com/image.jpg',
        alt: 'Product image',
      };

      const withoutAlt: CMSImageAsset = {
        url: 'https://cdn.example.com/image.jpg',
      };

      expect(withAlt.alt).toBe('Product image');
      expect(withoutAlt.alt).toBeUndefined();
    });

    it('accepts various URL formats', () => {
      const httpUrl: CMSImageAsset = {
        url: 'http://example.com/image.png',
      };

      const httpsUrl: CMSImageAsset = {
        url: 'https://cdn.example.com/images/product-123.jpg',
      };

      const cdnUrl: CMSImageAsset = {
        url: 'https://cdn.sanity.io/images/project/dataset/image-hash.jpg',
      };

      expect(httpUrl.url).toContain('http://');
      expect(httpsUrl.url).toContain('https://');
      expect(cdnUrl.url).toContain('sanity');
    });

    it('accepts descriptive alt text', () => {
      const image: CMSImageAsset = {
        url: 'https://cdn.example.com/image.jpg',
        alt: 'Blue Dream cannabis flower in glass jar with green background',
      };

      expect(image.alt).toContain('Blue Dream');
      expect(image.alt).toContain('cannabis');
    });
  });

  describe('CMSProduct', () => {
    it('has correct structure with all required fields', () => {
      const product: CMSProduct = {
        __id: 'prod-123',
        name: 'Blue Dream',
        slug: 'blue-dream',
        price: 29.99,
        type: 'flower',
        image: {
          url: 'https://cdn.example.com/blue-dream.jpg',
        },
      };

      expect(product.__id).toBe('prod-123');
      expect(product.name).toBe('Blue Dream');
      expect(product.slug).toBe('blue-dream');
      expect(product.price).toBe(29.99);
      expect(product.type).toBe('flower');
      expect(product.image.url).toBeDefined();
    });

    it('accepts optional effects array', () => {
      const withEffects: CMSProduct = {
        __id: 'prod-1',
        name: 'Product',
        slug: 'product',
        price: 25.0,
        type: 'flower',
        effects: ['Relaxing', 'Uplifting', 'Creative'],
        image: { url: 'https://cdn.example.com/image.jpg' },
      };

      const withoutEffects: CMSProduct = {
        __id: 'prod-2',
        name: 'Product',
        slug: 'product',
        price: 25.0,
        type: 'flower',
        image: { url: 'https://cdn.example.com/image.jpg' },
      };

      expect(withEffects.effects).toEqual(['Relaxing', 'Uplifting', 'Creative']);
      expect(withoutEffects.effects).toBeUndefined();
    });

    it('accepts various product types', () => {
      const types = ['flower', 'edible', 'concentrate', 'vape', 'topical', 'tincture'];

      types.forEach(type => {
        const product: CMSProduct = {
          __id: `prod-${type}`,
          name: `${type} Product`,
          slug: `${type}-product`,
          price: 30.0,
          type,
          image: { url: 'https://cdn.example.com/image.jpg' },
        };

        expect(product.type).toBe(type);
      });
    });

    it('accepts decimal price', () => {
      const product: CMSProduct = {
        __id: 'prod-1',
        name: 'Product',
        slug: 'product',
        price: 19.99,
        type: 'flower',
        image: { url: 'https://cdn.example.com/image.jpg' },
      };

      expect(product.price).toBe(19.99);
      expect(typeof product.price).toBe('number');
    });

    it('accepts slug with hyphens', () => {
      const product: CMSProduct = {
        __id: 'prod-1',
        name: 'Super Lemon Haze',
        slug: 'super-lemon-haze',
        price: 35.0,
        type: 'flower',
        image: { url: 'https://cdn.example.com/image.jpg' },
      };

      expect(product.slug).toBe('super-lemon-haze');
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it('image can have alt text', () => {
      const product: CMSProduct = {
        __id: 'prod-1',
        name: 'Product',
        slug: 'product',
        price: 25.0,
        type: 'flower',
        image: {
          url: 'https://cdn.example.com/image.jpg',
          alt: 'Product image',
        },
      };

      expect(product.image.alt).toBe('Product image');
    });
  });

  describe('CMSBanner', () => {
    it('has correct structure with required fields', () => {
      const banner: CMSBanner = {
        __id: 'banner-123',
        title: 'Special Sale',
        image: {
          url: 'https://cdn.example.com/banner.jpg',
        },
      };

      expect(banner.__id).toBe('banner-123');
      expect(banner.title).toBe('Special Sale');
      expect(banner.image.url).toBeDefined();
    });

    it('accepts optional cta text', () => {
      const withCTA: CMSBanner = {
        __id: 'banner-1',
        title: 'New Arrivals',
        cta: 'Shop Now',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      const withoutCTA: CMSBanner = {
        __id: 'banner-2',
        title: 'New Arrivals',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      expect(withCTA.cta).toBe('Shop Now');
      expect(withoutCTA.cta).toBeUndefined();
    });

    it('accepts optional link', () => {
      const withLink: CMSBanner = {
        __id: 'banner-1',
        title: 'Sale',
        link: '/shop/sale',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      const withoutLink: CMSBanner = {
        __id: 'banner-2',
        title: 'Sale',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      expect(withLink.link).toBe('/shop/sale');
      expect(withoutLink.link).toBeUndefined();
    });

    it('accepts both cta and link', () => {
      const banner: CMSBanner = {
        __id: 'banner-1',
        title: 'Limited Time Offer',
        cta: 'Shop Now',
        link: '/shop/deals',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      expect(banner.cta).toBe('Shop Now');
      expect(banner.link).toBe('/shop/deals');
    });

    it('accepts various banner titles', () => {
      const banner: CMSBanner = {
        __id: 'banner-1',
        title: '🎉 Flash Sale: 30% Off All Edibles This Weekend Only! 🍫',
        image: { url: 'https://cdn.example.com/banner.jpg' },
      };

      expect(banner.title).toContain('Flash Sale');
      expect(banner.title).toContain('🎉');
    });
  });

  describe('CMSArticle', () => {
    it('has correct structure with all required fields', () => {
      const article: CMSArticle = {
        __id: 'article-123',
        title: 'Guide to Cannabis Terpenes',
        slug: 'guide-to-terpenes',
        publishedAt: '2026-01-20T10:00:00Z',
        body: { blocks: [] },
      };

      expect(article.__id).toBe('article-123');
      expect(article.title).toBe('Guide to Cannabis Terpenes');
      expect(article.slug).toBe('guide-to-terpenes');
      expect(article.publishedAt).toBe('2026-01-20T10:00:00Z');
      expect(article.body).toBeDefined();
    });

    it('accepts optional mainImage', () => {
      const withImage: CMSArticle = {
        __id: 'article-1',
        title: 'Article',
        slug: 'article',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {},
        mainImage: {
          url: 'https://cdn.example.com/article-image.jpg',
          alt: 'Article hero image',
        },
      };

      const withoutImage: CMSArticle = {
        __id: 'article-2',
        title: 'Article',
        slug: 'article',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {},
      };

      expect(withImage.mainImage?.url).toBe('https://cdn.example.com/article-image.jpg');
      expect(withoutImage.mainImage).toBeUndefined();
    });

    it('accepts ISO date string for publishedAt', () => {
      const article: CMSArticle = {
        __id: 'article-1',
        title: 'Article',
        slug: 'article',
        publishedAt: '2026-01-23T15:30:45.123Z',
        body: {},
      };

      expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('accepts slug with hyphens', () => {
      const article: CMSArticle = {
        __id: 'article-1',
        title: 'Understanding CBD vs THC',
        slug: 'understanding-cbd-vs-thc',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {},
      };

      expect(article.slug).toBe('understanding-cbd-vs-thc');
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it('body accepts any type', () => {
      const article: CMSArticle = {
        __id: 'article-1',
        title: 'Article',
        slug: 'article',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {
          blocks: [{ _type: 'block', children: [{ text: 'Content' }] }],
        },
      };

      expect(article.body).toHaveProperty('blocks');
    });

    it('accepts long article titles', () => {
      const article: CMSArticle = {
        __id: 'article-1',
        title:
          "The Complete Beginner's Guide to Understanding Cannabis Strains, Effects, and Choosing the Right Products for Your Needs",
        slug: 'beginners-guide-cannabis',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {},
      };

      expect(article.title.length).toBeGreaterThan(50);
    });
  });

  describe('CMSDrop', () => {
    it('has correct structure with all required fields', () => {
      const drop: CMSDrop = {
        __id: 'drop-123',
        title: 'New Sativa Collection',
        items: 15,
        image: {
          url: 'https://cdn.example.com/drop-image.jpg',
        },
      };

      expect(drop.__id).toBe('drop-123');
      expect(drop.title).toBe('New Sativa Collection');
      expect(drop.items).toBe(15);
      expect(drop.image.url).toBeDefined();
    });

    it('accepts optional highlight', () => {
      const withHighlight: CMSDrop = {
        __id: 'drop-1',
        title: 'Premium Selection',
        highlight: 'Staff Picks',
        items: 20,
        image: { url: 'https://cdn.example.com/drop.jpg' },
      };

      const withoutHighlight: CMSDrop = {
        __id: 'drop-2',
        title: 'Regular Collection',
        items: 10,
        image: { url: 'https://cdn.example.com/drop.jpg' },
      };

      expect(withHighlight.highlight).toBe('Staff Picks');
      expect(withoutHighlight.highlight).toBeUndefined();
    });

    it('accepts various item counts', () => {
      const counts = [1, 5, 10, 25, 50, 100];

      counts.forEach(count => {
        const drop: CMSDrop = {
          __id: `drop-${count}`,
          title: `Collection with ${count} items`,
          items: count,
          image: { url: 'https://cdn.example.com/drop.jpg' },
        };

        expect(drop.items).toBe(count);
      });
    });

    it('accepts highlight with emojis', () => {
      const drop: CMSDrop = {
        __id: 'drop-1',
        title: 'Collection',
        highlight: '🔥 Hot This Week',
        items: 12,
        image: { url: 'https://cdn.example.com/drop.jpg' },
      };

      expect(drop.highlight).toContain('🔥');
      expect(drop.highlight).toContain('Hot');
    });
  });

  describe('type compatibility', () => {
    it('CMSProduct can have CMSImageAsset', () => {
      const product: CMSProduct = {
        __id: 'prod-1',
        name: 'Product',
        slug: 'product',
        price: 25.0,
        type: 'flower',
        image: {
          url: 'https://cdn.example.com/image.jpg',
          alt: 'Product image',
        },
      };

      expect(product.image).toHaveProperty('url');
      expect(product.image).toHaveProperty('alt');
    });

    it('CMSBanner can have CMSImageAsset', () => {
      const banner: CMSBanner = {
        __id: 'banner-1',
        title: 'Banner',
        image: {
          url: 'https://cdn.example.com/banner.jpg',
          alt: 'Banner image',
        },
      };

      expect(banner.image).toHaveProperty('url');
      expect(banner.image).toHaveProperty('alt');
    });

    it('CMSArticle can have optional CMSImageAsset', () => {
      const article: CMSArticle = {
        __id: 'article-1',
        title: 'Article',
        slug: 'article',
        publishedAt: '2026-01-20T10:00:00Z',
        body: {},
        mainImage: {
          url: 'https://cdn.example.com/article.jpg',
          alt: 'Article image',
        },
      };

      expect(article.mainImage).toHaveProperty('url');
      expect(article.mainImage).toHaveProperty('alt');
    });

    it('CMSDrop can have CMSImageAsset', () => {
      const drop: CMSDrop = {
        __id: 'drop-1',
        title: 'Drop',
        items: 10,
        image: {
          url: 'https://cdn.example.com/drop.jpg',
          alt: 'Drop image',
        },
      };

      expect(drop.image).toHaveProperty('url');
      expect(drop.image).toHaveProperty('alt');
    });

    it('can filter products by type', () => {
      const products: CMSProduct[] = [
        {
          __id: '1',
          name: 'Product 1',
          slug: 'product-1',
          price: 20,
          type: 'flower',
          image: { url: 'url' },
        },
        {
          __id: '2',
          name: 'Product 2',
          slug: 'product-2',
          price: 25,
          type: 'edible',
          image: { url: 'url' },
        },
        {
          __id: '3',
          name: 'Product 3',
          slug: 'product-3',
          price: 30,
          type: 'flower',
          image: { url: 'url' },
        },
      ];

      const flowers = products.filter(p => p.type === 'flower');
      expect(flowers).toHaveLength(2);
    });

    it('can sort articles by publishedAt', () => {
      const articles: CMSArticle[] = [
        {
          __id: 'article-2',
          title: 'Second',
          slug: 'second',
          publishedAt: '2026-01-22T10:00:00Z',
          body: {},
        },
        {
          __id: 'article-1',
          title: 'First',
          slug: 'first',
          publishedAt: '2026-01-20T10:00:00Z',
          body: {},
        },
      ];

      const sorted = articles.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
      expect(sorted[0].title).toBe('First');
    });

    it('can calculate total items across drops', () => {
      const drops: CMSDrop[] = [
        {
          __id: 'drop-1',
          title: 'Drop 1',
          items: 15,
          image: { url: 'url' },
        },
        {
          __id: 'drop-2',
          title: 'Drop 2',
          items: 20,
          image: { url: 'url' },
        },
        {
          __id: 'drop-3',
          title: 'Drop 3',
          items: 10,
          image: { url: 'url' },
        },
      ];

      const totalItems = drops.reduce((sum, drop) => sum + drop.items, 0);
      expect(totalItems).toBe(45);
    });
  });
});
