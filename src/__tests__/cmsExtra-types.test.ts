import type { FAQItem, LegalContent, ShopFilter } from '../types/cmsExtra';

describe('cmsExtra types', () => {
  describe('FAQItem', () => {
    it('creates a valid FAQ item', () => {
      const faqItem: FAQItem = {
        id: 'faq-1',
        question: 'What are terpenes?',
        answer:
          'Terpenes are aromatic compounds found in cannabis that contribute to its unique scent and effects.',
      };

      expect(faqItem.id).toBe('faq-1');
      expect(faqItem.question).toBe('What are terpenes?');
      expect(faqItem.answer).toContain('aromatic compounds');
    });

    it('supports long questions and answers', () => {
      const faqItem: FAQItem = {
        id: 'faq-2',
        question:
          'How do I choose the right cannabis product for my needs when I am new to cannabis and do not know much about strains or effects?',
        answer:
          'Start with lower THC products and consider your desired effects. Consult with our budtenders who can guide you based on your preferences and experience level. You can also take our quiz to get personalized recommendations.',
      };

      expect(faqItem.question.length).toBeGreaterThan(50);
      expect(faqItem.answer.length).toBeGreaterThan(50);
    });

    it('supports multiple FAQ items in an array', () => {
      const faqs: FAQItem[] = [
        {
          id: 'faq-1',
          question: 'What is CBD?',
          answer: 'CBD is a non-psychoactive cannabinoid.',
        },
        {
          id: 'faq-2',
          question: 'What is THC?',
          answer: 'THC is the primary psychoactive compound in cannabis.',
        },
        {
          id: 'faq-3',
          question: 'What are edibles?',
          answer: 'Edibles are cannabis-infused food products.',
        },
      ];

      expect(faqs).toHaveLength(3);
      expect(faqs.every(faq => faq.id && faq.question && faq.answer)).toBe(true);
    });

    it('can filter FAQ items by keyword', () => {
      const faqs: FAQItem[] = [
        {
          id: 'faq-1',
          question: 'What is CBD?',
          answer: 'CBD is a cannabinoid.',
        },
        {
          id: 'faq-2',
          question: 'What is THC?',
          answer: 'THC is another cannabinoid.',
        },
        {
          id: 'faq-3',
          question: 'How do terpenes work?',
          answer: 'Terpenes provide aroma and effects.',
        },
      ];

      const cannabinoidFAQs = faqs.filter(
        faq =>
          faq.question.toLowerCase().includes('cbd') ||
          faq.question.toLowerCase().includes('thc') ||
          faq.answer.toLowerCase().includes('cannabinoid')
      );

      expect(cannabinoidFAQs).toHaveLength(2);
    });

    it('supports search by ID', () => {
      const faqs: FAQItem[] = [
        { id: 'faq-1', question: 'Q1', answer: 'A1' },
        { id: 'faq-2', question: 'Q2', answer: 'A2' },
        { id: 'faq-3', question: 'Q3', answer: 'A3' },
      ];

      const faq = faqs.find(f => f.id === 'faq-2');

      expect(faq?.question).toBe('Q2');
    });
  });

  describe('LegalContent', () => {
    it('creates valid legal content', () => {
      const legalContent: LegalContent = {
        title: 'Terms of Service',
        body: 'By using this service, you agree to the following terms...',
      };

      expect(legalContent.title).toBe('Terms of Service');
      expect(legalContent.body).toContain('By using this service');
    });

    it('supports privacy policy content', () => {
      const privacyPolicy: LegalContent = {
        title: 'Privacy Policy',
        body: 'We collect and use your personal information in accordance with applicable privacy laws. Your data is encrypted and stored securely.',
      };

      expect(privacyPolicy.title).toBe('Privacy Policy');
      expect(privacyPolicy.body).toContain('personal information');
    });

    it('supports cookie policy content', () => {
      const cookiePolicy: LegalContent = {
        title: 'Cookie Policy',
        body: 'This website uses cookies to enhance your experience.',
      };

      expect(cookiePolicy.title).toBe('Cookie Policy');
      expect(cookiePolicy.body).toContain('cookies');
    });

    it('supports markdown-style body content', () => {
      const legalContent: LegalContent = {
        title: 'User Agreement',
        body: '# Introduction\n\nThis is the user agreement.\n\n## Section 1\n\nContent here.',
      };

      expect(legalContent.body).toContain('#');
      expect(legalContent.body).toContain('##');
    });

    it('supports very long legal documents', () => {
      const longBody = 'Lorem ipsum '.repeat(1000);
      const legalContent: LegalContent = {
        title: 'Terms and Conditions',
        body: longBody,
      };

      expect(legalContent.body.length).toBeGreaterThan(10000);
    });

    it('can organize multiple legal documents', () => {
      const legalDocs: LegalContent[] = [
        { title: 'Terms of Service', body: 'TOS content' },
        { title: 'Privacy Policy', body: 'Privacy content' },
        { title: 'Cookie Policy', body: 'Cookie content' },
        { title: 'Disclaimer', body: 'Disclaimer content' },
      ];

      expect(legalDocs).toHaveLength(4);
      expect(legalDocs.every(doc => doc.title && doc.body)).toBe(true);
    });

    it('can find legal content by title', () => {
      const legalDocs: LegalContent[] = [
        { title: 'Terms of Service', body: 'TOS' },
        { title: 'Privacy Policy', body: 'Privacy' },
      ];

      const privacy = legalDocs.find(doc => doc.title.toLowerCase().includes('privacy'));

      expect(privacy?.body).toBe('Privacy');
    });
  });

  describe('ShopFilter', () => {
    it('creates a valid shop filter', () => {
      const filter: ShopFilter = {
        id: 'filter-flower',
        label: 'Flower',
      };

      expect(filter.id).toBe('filter-flower');
      expect(filter.label).toBe('Flower');
    });

    it('supports product type filters', () => {
      const filters: ShopFilter[] = [
        { id: 'filter-flower', label: 'Flower' },
        { id: 'filter-edibles', label: 'Edibles' },
        { id: 'filter-concentrates', label: 'Concentrates' },
        { id: 'filter-vapes', label: 'Vapes' },
      ];

      expect(filters).toHaveLength(4);
      expect(filters.map(f => f.label)).toContain('Edibles');
    });

    it('supports strain type filters', () => {
      const strainFilters: ShopFilter[] = [
        { id: 'filter-sativa', label: 'Sativa' },
        { id: 'filter-indica', label: 'Indica' },
        { id: 'filter-hybrid', label: 'Hybrid' },
        { id: 'filter-cbd', label: 'CBD' },
      ];

      expect(strainFilters).toHaveLength(4);
      expect(strainFilters.some(f => f.id === 'filter-hybrid')).toBe(true);
    });

    it('supports price range filters', () => {
      const priceFilters: ShopFilter[] = [
        { id: 'price-under-20', label: 'Under $20' },
        { id: 'price-20-50', label: '$20 - $50' },
        { id: 'price-50-100', label: '$50 - $100' },
        { id: 'price-over-100', label: 'Over $100' },
      ];

      expect(priceFilters).toHaveLength(4);
    });

    it('supports effect filters', () => {
      const effectFilters: ShopFilter[] = [
        { id: 'effect-relaxed', label: 'Relaxed' },
        { id: 'effect-energetic', label: 'Energetic' },
        { id: 'effect-focused', label: 'Focused' },
        { id: 'effect-sleepy', label: 'Sleepy' },
        { id: 'effect-creative', label: 'Creative' },
      ];

      expect(effectFilters).toHaveLength(5);
      expect(effectFilters.find(f => f.id === 'effect-creative')?.label).toBe('Creative');
    });

    it('supports brand filters', () => {
      const brandFilters: ShopFilter[] = [
        { id: 'brand-1', label: 'Premium Cannabis Co.' },
        { id: 'brand-2', label: 'Green Valley Farms' },
        { id: 'brand-3', label: 'Mountain High' },
      ];

      expect(brandFilters).toHaveLength(3);
    });

    it('can filter by multiple criteria', () => {
      const allFilters: ShopFilter[] = [
        { id: 'type-flower', label: 'Flower' },
        { id: 'strain-sativa', label: 'Sativa' },
        { id: 'price-20-50', label: '$20-$50' },
        { id: 'effect-energetic', label: 'Energetic' },
      ];

      const selectedFilters = ['type-flower', 'strain-sativa'];
      const active = allFilters.filter(f => selectedFilters.includes(f.id));

      expect(active).toHaveLength(2);
    });

    it('supports custom filter labels with emojis', () => {
      const filters: ShopFilter[] = [
        { id: 'new-arrivals', label: '✨ New Arrivals' },
        { id: 'on-sale', label: '🔥 On Sale' },
        { id: 'top-rated', label: '⭐ Top Rated' },
      ];

      expect(filters[0].label).toContain('✨');
      expect(filters[1].label).toContain('🔥');
      expect(filters[2].label).toContain('⭐');
    });

    it('can sort filters alphabetically', () => {
      const filters: ShopFilter[] = [
        { id: '3', label: 'Vapes' },
        { id: '1', label: 'Edibles' },
        { id: '2', label: 'Flower' },
      ];

      const sorted = [...filters].sort((a, b) => a.label.localeCompare(b.label));

      expect(sorted[0].label).toBe('Edibles');
      expect(sorted[1].label).toBe('Flower');
      expect(sorted[2].label).toBe('Vapes');
    });

    it('can count active filters', () => {
      const filters: ShopFilter[] = [
        { id: '1', label: 'Filter 1' },
        { id: '2', label: 'Filter 2' },
        { id: '3', label: 'Filter 3' },
      ];

      const activeFilterIds = ['1', '3'];
      const activeCount = filters.filter(f => activeFilterIds.includes(f.id)).length;

      expect(activeCount).toBe(2);
    });
  });

  describe('type compatibility', () => {
    it('FAQ items work in collections', () => {
      const categories: Record<string, FAQItem[]> = {
        general: [{ id: 'faq-1', question: 'Q1', answer: 'A1' }],
        products: [{ id: 'faq-2', question: 'Q2', answer: 'A2' }],
      };

      expect(Object.keys(categories)).toHaveLength(2);
    });

    it('legal content can be mapped by type', () => {
      const legalMap: Record<string, LegalContent> = {
        terms: { title: 'Terms', body: 'Terms body' },
        privacy: { title: 'Privacy', body: 'Privacy body' },
      };

      expect(legalMap.terms.title).toBe('Terms');
    });

    it('filters can be grouped by category', () => {
      interface FilterGroup {
        category: string;
        filters: ShopFilter[];
      }

      const filterGroups: FilterGroup[] = [
        {
          category: 'Product Type',
          filters: [
            { id: 'flower', label: 'Flower' },
            { id: 'edibles', label: 'Edibles' },
          ],
        },
        {
          category: 'Strain Type',
          filters: [
            { id: 'sativa', label: 'Sativa' },
            { id: 'indica', label: 'Indica' },
          ],
        },
      ];

      expect(filterGroups).toHaveLength(2);
      expect(filterGroups[0].filters).toHaveLength(2);
    });
  });
});
